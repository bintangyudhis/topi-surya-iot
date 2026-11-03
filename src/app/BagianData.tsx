const KOLOM = [
  { nama: "panelVoltage", arti: "Tegangan panel surya, dalam volt" },
  { nama: "temperature", arti: "Suhu udara di sekitar topi, dalam derajat Celsius" },
  { nama: "humidity", arti: "Kelembapan udara, dalam persen" },
  { nama: "fanSpeed", arti: "Kecepatan kipas, 0 sampai 100 persen" },
  { nama: "recordedAt", arti: "Waktu server menerima data" },
];

export default function BagianData() {
  return (
    <section id="data">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          Data yang dicatat
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Setiap pengiriman dari perangkat tersimpan sebagai satu baris
          telemetri. Data itu tampil di{" "}
          <a href="/dashboard" className="font-medium text-accent underline">
            dasbor live
          </a>
          , yang diperbarui otomatis tiap 10 detik beserta grafik tegangan
          panelnya. Riwayat lengkap dan statistik energi menyusul di hari
          berikutnya.
        </p>
        <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
          {KOLOM.map((kolom) => (
            <div key={kolom.nama} className="bg-panel p-4">
              <dt className="font-mono text-sm font-bold text-accent">{kolom.nama}</dt>
              <dd className="mt-1 text-sm text-muted">{kolom.arti}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
