// Topi Surya IoT — firmware ESP32.
//
// Membaca tegangan panel surya (pembagi tegangan ke ADC), suhu dan
// kelembapan (DHT22), mengatur kipas DC lewat PWM, mengirim telemetri ke
// server tiap 10 detik, dan mengambil perintah kipas terbaru lewat polling.
//
// Pustaka yang dibutuhkan di Arduino IDE (Library Manager):
//   - "DHT sensor library" (Adafruit) beserta dependensi "Adafruit Unified Sensor"
//   - Board ESP32 ("esp32" oleh Espressif)
// Isi WiFi dan alamat server di bawah sebelum upload. Jangan pernah
// menuliskan token perangkat asli ke berkas contoh yang dibagikan publik;
// token di sini hanya dibaca dari nilai yang diisi pemilik perangkat.

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ---------- Konfigurasi perangkat (isi sebelum upload) ----------
const char* WIFI_SSID = "NAMA_WIFI_ANDA";
const char* WIFI_PASSWORD = "SANDI_WIFI_ANDA";
// Alamat dasar server, tanpa garis miring di akhir, mis.
// "https://surya.bintangyudhis.my.id" atau alamat deploy aktif lainnya.
const char* SERVER_URL = "https://surya.bintangyudhis.my.id";
const char* DEVICE_ID = "topi-01";
// Kosongkan bila server tidak memakai TELEMETRY_TOKEN; bila server
// memakainya, isi dengan nilai yang sama persis.
const char* DEVICE_TOKEN = "";

// ---------- Pin dan konstanta perangkat keras ----------
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define FAN_PIN 18
#define VOLT_PIN 34
// Pembagi tegangan: R1 30k dari panel ke ADC, R2 7,5k dari ADC ke ground.
// Faktor = (30 + 7,5) / 7,5 = 5. ADC ESP32: 12 bit, referensi 3,3 V.
const float DIVIDER_FACTOR = 5.0;
const float ADC_REF_VOLT = 3.3;
const int ADC_RESOLUTION = 4095;
// Kanal PWM (LEDC) untuk kipas.
const int FAN_CHANNEL = 0;
const int FAN_FREQUENCY = 25000;  // 25 kHz: di luar jangkau dengar
const int FAN_RESOLUTION = 8;     // 0-255

DHT dht(DHT_PIN, DHT_TYPE);

// Perintah terakhir yang sudah diterapkan; dipakai untuk mengonfirmasi
// ke server lewat appliedCommandId pada telemetri berikutnya.
String lastCommandId = "";
int fanSpeedPercent = 0;
String fanMode = "auto";
unsigned long lastSendMs = 0;
const unsigned long SEND_INTERVAL_MS = 10000;  // kirim tiap 10 detik

void hubungkanWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.print("Menghubungkan WiFi ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long mulai = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - mulai < 20000) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi terhubung, IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi gagal, dicoba lagi pada loop berikutnya.");
  }
}

float bacaTeganganPanel() {
  // Rata-rata 10 sampel ADC untuk meredam derau, lalu konversi ke volt
  // panel lewat faktor pembagi tegangan.
  long total = 0;
  for (int i = 0; i < 10; i++) {
    total += analogRead(VOLT_PIN);
    delay(5);
  }
  float rataRata = total / 10.0;
  return (rataRata / ADC_RESOLUTION) * ADC_REF_VOLT * DIVIDER_FACTOR;
}

bool bacaDht(float &suhu, float &kelembapan) {
  // DHT22 kadang gagal baca sekali; pemanggil memakai nilai terakhir
  // yang sah bila bacaan ini gagal (NaN).
  suhu = dht.readTemperature();
  kelembapan = dht.readHumidity();
  return !isnan(suhu) && !isnan(kelembapan);
}

void terapkanKipas(int persen) {
  persen = constrain(persen, 0, 100);
  fanSpeedPercent = persen;
  ledcWrite(FAN_CHANNEL, (persen * 255) / 100);
}

// Mode auto: kecepatan naik bersama suhu, tapi nol bila panel hampir
// tidak menghasilkan daya (mendung total / malam) supaya baterai tidak
// terkuras. Ambang ini asumsi awal — sesuaikan setelah uji lapangan.
int hitungKipasAuto(float teganganPanel, float suhu) {
  if (teganganPanel < 3.0) return 0;
  if (suhu >= 34) return 100;
  if (suhu >= 31) return 75;
  if (suhu >= 28) return 50;
  return 30;
}

// Nilai sensor terakhir yang sah; dipakai bila satu bacaan DHT22 gagal.
float suhuTerakhir = 0;
float kelembapanTerakhir = 0;
// Id perintah yang baru diterapkan dan belum dikonfirmasi ke server.
String perintahBaruDiterapkan = "";
// Batas atas kecepatan pada mode auto (dari perintah server, default 100).
int batasAtasAuto = 100;

void kirimTelemetri(float tegangan, float suhu, float kelembapan) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/telemetry");
  http.addHeader("Content-Type", "application/json");
  if (strlen(DEVICE_TOKEN) > 0) {
    http.addHeader("x-device-token", DEVICE_TOKEN);
  }
  String muatan = "{\"deviceId\":\"" + String(DEVICE_ID) + "\"";
  muatan += ",\"panelVoltage\":" + String(tegangan, 2);
  muatan += ",\"temperature\":" + String(suhu, 1);
  muatan += ",\"humidity\":" + String(kelembapan, 1);
  muatan += ",\"fanSpeed\":" + String(fanSpeedPercent);
  if (perintahBaruDiterapkan.length() > 0) {
    muatan += ",\"appliedCommandId\":\"" + perintahBaruDiterapkan + "\"";
  }
  muatan += "}";
  int kode = http.POST(muatan);
  if (kode == 201) {
    // Konfirmasi terkirim; perintah tidak perlu dikirim ulang.
    perintahBaruDiterapkan = "";
  } else {
    Serial.print("Telemetri gagal, kode HTTP: ");
    Serial.println(kode);
  }
  http.end();
}

// Mengambil perintah terbaru dari server. Parsing JSON dilakukan manual
// dengan pencarian string supaya tidak menambah dependensi pustaka JSON;
// bentuk jawaban server tetap (id, fanSpeed, mode), jadi pencariannya aman.
void ambilPerintah() {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/command?deviceId=" + String(DEVICE_ID));
  int kode = http.GET();
  if (kode != 200) {
    http.end();
    return;
  }
  String badan = http.getString();
  http.end();
  int awalId = badan.indexOf("\"id\":\"");
  if (awalId < 0) return;  // data: null — belum ada perintah
  int akhirId = badan.indexOf("\"", awalId + 6);
  String id = badan.substring(awalId + 6, akhirId);
  if (id == lastCommandId) return;  // sudah diterapkan sebelumnya
  int awalKecepatan = badan.indexOf("\"fanSpeed\":");
  int awalMode = badan.indexOf("\"mode\":\"");
  if (awalKecepatan < 0 || awalMode < 0) return;
  int kecepatan = badan.substring(awalKecepatan + 11).toInt();
  int akhirMode = badan.indexOf("\"", awalMode + 8);
  String mode = badan.substring(awalMode + 8, akhirMode);
  lastCommandId = id;
  fanMode = mode;
  if (mode == "manual") {
    terapkanKipas(kecepatan);
  } else {
    // Mode auto: angka fanSpeed dari server dipakai sebagai batas atas.
    batasAtasAuto = kecepatan;
  }
  // Konfirmasi dikirim bersama telemetri berikutnya.
  perintahBaruDiterapkan = id;
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  ledcSetup(FAN_CHANNEL, FAN_FREQUENCY, FAN_RESOLUTION);
  ledcAttachPin(FAN_PIN, FAN_CHANNEL);
  ledcWrite(FAN_CHANNEL, 0);
  analogReadResolution(12);
  hubungkanWiFi();
}

void loop() {
  // Auto-reconnect: bila WiFi putus, sambungkan lagi sebelum mengirim.
  if (WiFi.status() != WL_CONNECTED) {
    hubungkanWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      delay(2000);
      return;
    }
  }
  unsigned long sekarang = millis();
  if (sekarang - lastSendMs >= SEND_INTERVAL_MS) {
    lastSendMs = sekarang;
    float tegangan = bacaTeganganPanel();
    float suhu, kelembapan;
    if (bacaDht(suhu, kelembapan)) {
      suhuTerakhir = suhu;
      kelembapanTerakhir = kelembapan;
    }
    // Perintah dari server diambil sebelum kipas diatur.
    ambilPerintah();
    if (fanMode == "auto") {
      terapkanKipas(min(hitungKipasAuto(tegangan, suhuTerakhir), batasAtasAuto));
    }
    kirimTelemetri(tegangan, suhuTerakhir, kelembapanTerakhir);
    Serial.print("Tegangan: ");
    Serial.print(tegangan);
    Serial.print(" V, kipas: ");
    Serial.print(fanSpeedPercent);
    Serial.println("%");
  }
  delay(100);
}
