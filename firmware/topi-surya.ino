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
    // Langkah berikutnya: baca sensor, terapkan perintah, kirim telemetri.
    Serial.println("Siklus 10 detik: sensor + perintah + telemetri (menyusul).");
  }
  delay(100);
}
