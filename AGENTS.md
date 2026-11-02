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
