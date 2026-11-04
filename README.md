# Topi Surya IoT

Topi berkipas yang tenaganya berasal dari panel surya. Web server di
repo ini menerima data dari perangkat, menampilkannya di dasbor, dan
mengirim perintah kecepatan kipas kembali ke perangkat.

## Cara kerja

1. Panel surya di atas topi mengubah cahaya menjadi listrik untuk kipas.
2. ESP32 membaca tegangan panel, suhu, dan kelembapan, lalu mengatur
   kecepatan kipas lewat PWM.
3. Tiap 10 detik ESP32 mengirim satu baris telemetri ke server lewat
   HTTP POST.
4. Saat polling, ESP32 mengambil perintah terbaru: kecepatan kipas dan
   mode otomatis atau manual.

## Perangkat yang dibutuhkan

| Komponen | Peran |
| --- | --- |
| ESP32 DevKit | Mikrokontroler + WiFi, otak perangkat |
| Panel surya 6V | Sumber tenaga kipas |
| Kipas DC 5V | Pendingin di dalam topi |
| Sensor DHT22 | Suhu dan kelembapan |
| Pembagi tegangan | Membaca tegangan panel lewat ADC |
| Topi | Tempat seluruh perangkat dipasang |

Perangkat keras adalah bagian pembangun; repo ini menyediakan server,
firmware, dan simulatornya. Daftar belanja lengkap ada di
[docs/daftar-belanja.md](docs/daftar-belanja.md), diagram wiring di
[docs/wiring.md](docs/wiring.md), dan panduan rakit di
[docs/panduan-rakit.md](docs/panduan-rakit.md).

## Data yang dicatat

Setiap pengiriman dari perangkat tersimpan sebagai satu baris telemetri:

| Kolom | Arti |
| --- | --- |
| `panelVoltage` | Tegangan panel surya, dalam volt |
| `temperature` | Suhu udara di sekitar topi, dalam derajat Celsius |
| `humidity` | Kelembapan udara, dalam persen |
| `fanSpeed` | Kecepatan kipas, 0 sampai 100 persen |
| `recordedAt` | Waktu server menerima data |

Perintah untuk perangkat tersimpan di tabel `DeviceCommand`
(`deviceId`, `fanSpeed`, `mode`, `createdAt`, `appliedAt`).

## Dasbor live

Buka `/dashboard`: kartu metrik terbaru (tegangan panel, suhu,
kelembapan, kecepatan kipas), grafik tegangan panel dari 50 pengiriman
terakhir, tabel pengiriman terbaru, dan formulir kontrol kipas. Data
diperbarui otomatis tiap 10 detik; perintah kipas yang dikirim dari
formulir diambil perangkat pada polling berikutnya dan statusnya berubah
menjadi "diterapkan" setelah perangkat mengonfirmasi lewat telemetri.
Kontrak lengkap tiap endpoint ada di [docs/API.md](docs/API.md).

## Firmware ESP32

`firmware/topi-surya.ino` — baca tegangan panel (pembagi tegangan ke
GPIO 34), DHT22 (GPIO 4), PWM kipas 25 kHz (GPIO 18), kirim telemetri
tiap 10 detik, polling perintah tiap siklus, dan konfirmasi perintah
lewat `appliedCommandId`. Isi WiFi, alamat server, dan id perangkat
di bagian konfigurasi sebelum upload; pin dan wiring lengkap ada di
[docs/wiring.md](docs/wiring.md).

## Simulator (tanpa hardware)

```bash
node simulator/simulator.mjs
```

Simulator pura-pura jadi ESP32: model tegangan siang + derau, suhu
dan kelembapan bergerak pelan, kirim telemetri tiap 10 detik, dan
mengambil perintah kipas yang sama seperti firmware. Atur lewat env
`SERVER_URL` (default `http://localhost:3000`), `DEVICE_ID`,
`DEVICE_TOKEN`, dan `INTERVAL_MS`.

## Riwayat

Buka `/riwayat`: pilih tanggal (WIB) dan id perangkat opsional untuk
melihat statistik harian (jumlah sampel, rata-rata tegangan, suhu
tertinggi, rata-rata kipas, lama kipas menyala, perkiraan energi
kipas), grafik tegangan seharian, tabel pengiriman hari itu, dan
tombol unduh CSV dengan filter yang sama. Perkiraan energi memakai
asumsi yang ditulis terang di halaman: satu sampel = 10 detik, kipas
5 V / 0,2 A.

## Teknologi

- Next.js 16 + Tailwind v4 + React 19 untuk web server dan dasbor
- Prisma + Supabase Postgres (project `dompetku` yang sama dengan repo
  streak lain; nama migrasi `0001_surya_init` supaya tidak bentrok)
- ESP32 dengan firmware berbasis Arduino untuk perangkat keras
- Komunikasi data melalui HTTP API

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env   # isi DATABASE_URL dan DIRECT_URL
npx prisma migrate deploy
npm run dev
```

## Deploy

Satu deploy per hari lewat commit kosong `Day N: deploy` (tanpa
`[skip-vercel]`). Commit rutin memakai `[skip-vercel]` supaya
`vercel.json` membatalkan build Vercel yang tidak perlu.

## Rencana

- Dasbor live + grafik tegangan + kontrol kipas — selesai (Day 16)
- Firmware ESP32 (`.ino`) — selesai (Day 17)
- Simulator, riwayat telemetri, statistik energi harian, export CSV — selesai (Day 17)
- Diagram wiring, daftar belanja hardware, dan panduan rakit — selesai (Day 17)

## Lisensi

MIT. Lihat berkas [LICENSE](LICENSE).
