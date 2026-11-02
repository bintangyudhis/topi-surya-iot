const LANGKAH = [
  {
    nomor: "01",
    judul: "Panel menangkap matahari",
    isi: "Panel surya kecil di atas topi mengubah cahaya menjadi listrik dan mengisi kipas.",
  },
  {
    nomor: "02",
    judul: "ESP32 membaca sensor",
    isi: "ESP32 mengukur tegangan panel, suhu, dan kelembapan, lalu mengatur kecepatan kipas lewat PWM.",
  },
  {
    nomor: "03",
    judul: "Data dikirim ke web",
    isi: "Tiap 10 detik ESP32 mengirim satu baris telemetri ke server lewat HTTP POST.",
  },
  {
    nomor: "04",
    judul: "Web membalas perintah",
    isi: "Saat polling, ESP32 mengambil perintah terbaru: kecepatan kipas dan mode otomatis atau manual.",
  },
];

export default function BagianCaraKerja() {
  return (
    <section id="cara-kerja" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight">
          Cara kerja
        </h2>
        <ol className="mt-8 divide-y divide-line border-y border-line">
          {LANGKAH.map((langkah) => (
            <li key={langkah.nomor} className="grid gap-1 py-5 sm:grid-cols-[4rem_1fr] sm:gap-6">
              <span className="font-mono text-sm font-bold text-accent">{langkah.nomor}</span>
              <div>
                <h3 className="font-display text-lg font-bold">{langkah.judul}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{langkah.isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
