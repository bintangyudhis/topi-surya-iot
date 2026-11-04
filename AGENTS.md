## Pelajaran Day 15 (scaffold + skema telemetri)

- Repo sudah dibuat sebelumnya (hanya README + LICENSE); Day 15 mengisi
  scaffold Next.js 16 + Tailwind v4 + Prisma v6, vercel.json hemat
  deploy (copy dari dompetku-web), dan skema telemetri — tanpa perlu
  buat repo baru lewat browser. Issues rencana sudah ada (#1 scaffold +
  skema, #2 API telemetri, #3 dasbor live, #4 kontrol kipas,
  #5 firmware, #6 simulator + riwayat + CSV, #7 docs hardware).
- Issue #1 ditutup lewat badan pesan commit terakhir fitur scaffold
  (`Closes #1`), bukan commit pertama — pelajaran Day 13 animequ.
- Skema: `Telemetry` (deviceId, panelVoltage, temperature, humidity,
  fanSpeed, recordedAt; indeks deviceId+recordedAt) dan `DeviceCommand`
  (deviceId, fanSpeed, mode, createdAt, appliedAt; indeks
  deviceId+createdAt). Migrasi `0001_surya_init` ditulis tangan
  (nama unik, tidak bentrok dengan repo lain di DB `dompetku` yang
  sama); `prisma migrate deploy` hanya jalan di Vercel karena env DB
  tidak ada di VM — build lokal diverifikasi lewat
  `prisma generate && next build`.
- Tema "Bengkel": kertas terang hangat (#faf6ee), aksen amber solid
  (#c2410c), tanpa gradasi, tanpa emoji, tanpa angka karangan.
  Struktur beranda sengaja tidak seragam: hero + lembar spesifikasi,
  daftar langkah bernomor, tabel perangkat, grid definisi kolom data.
- Sapuan keamanan ringan Day 15: tidak ada endpoint/auth/upload baru —
  hanya halaman statis + skema; tidak ada secret yang di-commit
  (.env.example hanya berisi placeholder).

## Pelajaran Day 17 (firmware + simulator + riwayat + docs, hari terakhir)

- Issues #5 (firmware), #6 (simulator + riwayat + CSV), #7 (docs
  hardware + README final) ditutup lewat badan pesan commit TERAKHIR
  masing-masing fitur (`Closes #n`), sesuai pelajaran Day 15/16.
- Firmware `firmware/topi-surya.ino` ditulis bertahap per unit (config
  + WiFi, sensor, PWM/auto, kirim telemetri, polling perintah).
  Perangkap yang diperbaiki sebelum commit: loop mode auto sempat
  menghitung ulang kecepatan tanpa batas atas server — diperbaiki
  dengan variabel `batasAtasAuto` yang diisi perintah server dan
  dipakai `min()` di loop. Parsing JSON perintah manual (indexOf)
  supaya tanpa dependensi ArduinoJson; bentuk jawaban server tetap.
- Simulator `simulator/simulator.mjs` (Node, tanpa dependensi) memakai
  model sensor yang sama persis dengan ambang auto firmware; modelnya
  dilabeli demo di kode dan README, bukan data lapangan.
- Riwayat: GET /api/riwayat memvalidasi tanggal (YYYY-MM-DD, hari WIB
  = UTC+7), deviceId maks 64 karakter, batas 10.000 baris; CSV mengutip
  deviceId. Statistik energi memakai asumsi tertulis di
  `src/lib/statistik.ts` dan di UI (sampel = 10 detik, kipas 5 V /
  0,2 A) — jangan jadikan angka mutlak tanpa spesifikasi kipas asli.
- Halaman `/riwayat`: grafik diringkas ke maks 200 titik, tabel
  dipaginasi 100 baris/halaman (satu hari penuh bisa 8.640 baris).
- Sapuan keamanan PENUH Day 17: tidak ada secret yang di-commit
  (.env.example hanya placeholder; kredensial WiFi firmware hanya
  placeholder `NAMA_WIFI_ANDA`/`SANDI_WIFI_ANDA`), tidak ada
  dangerouslySetInnerHTML/eval, tidak ada file .env/.pem ter-track,
  input riwayat divalidasi server-side. `npm audit` tidak bisa jalan
  karena repo tidak punya package-lock.json — dicatat sebagai batasan,
  bukan dipaksakan dengan membuat lockfile. Temuan besar yang tersisa
  dibuka sebagai issue #8: POST /api/command tanpa autentikasi (siapa
  pun yang tahu deviceId bisa mengubah kipas); belum dikunci karena
  dasbor browser tidak memegang token — perlu desain auth dasbor dulu.
  GET telemetri/riwayat terbuka adalah data dasbor publik, bukan temuan.
- Verifikasi lokal tetap `prisma generate && next build` (migrate
  deploy hanya di Vercel, env DB tidak ada di VM).

## Pelajaran Day 16 (API telemetri + dasbor live + kontrol kipas)

- Issues #2 (API telemetri), #3 (dasbor live), #4 (kontrol kipas)
  ditutup lewat badan pesan commit terakhir masing-masing fitur
  (`Closes #n`), sesuai pelajaran Day 15.
- POST /api/telemetry memvalidasi tiap kolom (rentang angka, deviceId
  1–64 karakter) dan menolak JSON tak valid; GET membatasi limit 1–100.
  GET /api/command mewajibkan deviceId supaya perangkat tidak saling
  mengambil perintah. Token perangkat (header x-device-token, env
  TELEMETRY_TOKEN) bersifat opsional: aktif hanya bila env dipasang,
  supaya demo/simulator Day 17 tidak terkunci.
- Konfirmasi perintah: ESP32 menyertakan `appliedCommandId` pada
  telemetri berikutnya; server menandai `appliedAt` hanya bila perintah
  itu milik perangkat yang sama dan belum ditandai.
- Dasbor `/dashboard`: polling GET /api/telemetry tiap 10 detik, kartu
  metrik, grafik tegangan SVG murni (tanpa pustaka), tabel 20 terbaru,
  dan formulir kontrol kipas (slider + mode auto/manual) dengan status
  perintah terbaru. Keadaan kosong jujur ("Belum ada data") — tidak ada
  angka karangan.
- Verifikasi lokal tetap `prisma generate && next build` (migrate deploy
  hanya di Vercel, env DB tidak ada di VM). Validasi API diuji lewat
  dev server lokal: POST tak valid mengembalikan rincian per kolom,
  GET command tanpa deviceId mengembalikan 400 — sebelum data sempat
  menyentuh database.
- Sapuan keamanan ringan Day 16: tidak ada secret yang di-commit;
  .env.example hanya berisi placeholder + TELEMETRY_TOKEN kosong.
  Catatan terbuka: endpoint telemetri tanpa token masih terbuka bila
  env tidak dipasang — sengaja untuk demo, pasang token sebelum
  perangkat dipakai di luar demo.
