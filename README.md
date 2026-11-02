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
firmware, dan simulatornya. Daftar belanja lengkap dan diagram wiring
menyusul bersama firmware.

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

- Dasbor live + grafik tegangan (API terima telemetri dan kontrol kipas)
- Firmware ESP32 (`.ino`)
- Simulator, riwayat telemetri, statistik energi harian, export CSV
- Diagram wiring, daftar belanja hardware, dan panduan rakit

## Lisensi

MIT. Lihat berkas [LICENSE](LICENSE).
