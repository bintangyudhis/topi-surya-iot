# API Topi Surya

Dasbor web memakai tiga endpoint ini. Semua waktu memakai zona server
(`recordedAt`/`createdAt`); dasbor menampilkan waktu dalam WIB.
Contoh curl di bawah memakai subdomain yang direncanakan untuk project
ini — ganti dengan alamat deploy yang aktif bila subdomain belum
terpasang.

## POST /api/telemetry — kirim data perangkat

Dipakai ESP32 (dan simulator Day 17) tiap 10 detik.

```bash
curl -X POST https://surya.bintangyudhis.my.id/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"topi-01","panelVoltage":12.4,"temperature":31.5,"humidity":68,"fanSpeed":60}'
```

Kolom dan rentang yang diterima:

| Kolom | Jenis | Rentang |
| --- | --- | --- |
| `deviceId` | string | 1–64 karakter |
| `panelVoltage` | angka | 0–30 (volt) |
| `temperature` | angka | −20–80 (°C) |
| `humidity` | angka | 0–100 (%) |
| `fanSpeed` | angka | 0–100 (%), dibulatkan |
| `appliedCommandId` | string, opsional | id perintah yang baru diterapkan perangkat |

Jawaban: `201` dengan `id` + `recordedAt` bila tersimpan; `400` dengan
`rincian` per kolom bila validasi gagal. Bila `appliedCommandId` diisi,
perintah itu ditandai `appliedAt` (hanya bila milik perangkat yang sama
dan belum pernah ditandai).

Token perangkat (opsional): bila env `TELEMETRY_TOKEN` dipasang di
server, pengirim wajib menyertakan header `x-device-token` dengan nilai
yang sama, kalau tidak dijawab `401`. Bila env tidak dipasang, endpoint
menerima data tanpa token (cocok untuk pengembangan dan demo).

## GET /api/telemetry — baca data terbaru

```bash
curl "https://surya.bintangyudhis.my.id/api/telemetry?limit=50&deviceId=topi-01"
```

`limit` dibatasi 1–100 (default 50); `deviceId` opsional. Urutan:
terbaru dulu. Dasbor live memakai endpoint ini dengan polling 10 detik.

## POST /api/command — kirim perintah kipas

Dipakai dasbor (formulir kontrol kipas).

```bash
curl -X POST https://surya.bintangyudhis.my.id/api/command \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"topi-01","fanSpeed":75,"mode":"manual"}'
```

`mode` hanya `auto` atau `manual`. Pada mode `auto`, angka `fanSpeed`
berarti batas atas yang diizinkan, bukan kecepatan tetap. Jawaban `201`
bila tersimpan; perintah lama tidak dihapus — yang berlaku selalu yang
terbaru per perangkat.

## GET /api/command — perintah terbaru perangkat

Dipakai ESP32 saat polling, dan dasbor untuk menampilkan status.

```bash
curl "https://surya.bintangyudhis.my.id/api/command?deviceId=topi-01"
```

`deviceId` wajib. Jawaban `data: null` bila perangkat belum pernah
diberi perintah. Perintah dianggap sudah diterapkan saat `appliedAt`
terisi, yaitu setelah perangkat mengonfirmasinya lewat
`appliedCommandId` pada telemetri berikutnya.
