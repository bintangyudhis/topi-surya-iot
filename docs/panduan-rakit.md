# Panduan rakit Topi Surya

Ikuti urutannya: uji di meja dulu sampai dasbor menampilkan data,
baru pasang ke topi. Melewati uji meja membuat kerusakan wiring jauh
lebih sulit dilacak.

## 1. Siapkan firmware

1. Pasang board ESP32 di Arduino IDE dan pustaka "DHT sensor library"
   (beserta "Adafruit Unified Sensor").
2. Buka `firmware/topi-surya.ino`, isi `WIFI_SSID`,
   `WIFI_PASSWORD`, `SERVER_URL`, dan `DEVICE_ID`. Bila server memakai
   `TELEMETRY_TOKEN`, isi juga `DEVICE_TOKEN` dengan nilai yang sama.
3. Upload ke ESP32 dan buka Serial Monitor (115200 baud) untuk melihat
   log WiFi dan pengiriman.

## 2. Rakit di meja

1. Sambungkan semua komponen sesuai [diagram wiring](wiring.md).
   Periksa dua kali sebelum memberi daya: panel TIDAK langsung ke
   GPIO 34, kipas TIDAK langsung ke GPIO 18.
2. Nyalakan ESP32. Di Serial Monitor harus muncul "WiFi terhubung"
   dan tiap 10 detik satu baris tegangan + kecepatan kipas.
3. Buka `/dashboard` di server: kartu metrik menampilkan tegangan
   panel, suhu, kelembapan, dan kecepatan kipas dari perangkat ini.
4. Dari formulir kontrol kipas, kirim perintah manual (mis. 75%):
   pada polling berikutnya kipas harus berubah, dan status perintah
   menjadi "diterapkan" setelah telemetri berikutnya.
5. Tutup panel dengan tangan / halangi cahaya: tegangan harus turun
   dan pada mode auto kipas harus melambat atau berhenti.

## 3. Pasang ke topi

1. Letakkan panel surya di atas topi menghadap ke atas, kipas di
   dalam mengarah ke kepala, DHT22 di dalam topi dekat kipas.
2. Amankan board dan kabel dengan isolasi / perekat supaya tidak
   bergeser saat dipakai; jangan biarkan ujung kabel telanjang saling
   bersentuhan.
3. Lindungi board dari hujan: perangkat ini tidak tahan air. Bila
   gerimis, simpan topi dan matikan perangkat.

## 4. Uji lapangan

1. Pakai topi di luar ruangan pada siang hari, pantau `/dashboard`
   dari ponsel.
2. Buka `/riwayat` keesokan harinya: statistik harian, grafik
   tegangan seharian, dan export CSV harus terisi dari data lapangan.
3. Bila kecepatan kipas terasa salah (terlalu kencang / terlalu
   pelan), ubah ambang suhu di `hitungKipasAuto` pada firmware dan
   upload ulang — ambang bawaan adalah titik awal, bukan nilai mutlak.

## Tanpa hardware

Jalankan simulator sebagai pengganti perangkat:

```bash
node simulator/simulator.mjs
```

Simulator mengirim telemetri tiap 10 detik dan mengambil perintah
kipas yang sama seperti firmware, sehingga dasbor, riwayat, dan
export CSV bisa diuji lengkap tanpa ESP32.
