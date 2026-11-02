export default function Hero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:py-20">
        <div>
          <p className="font-mono text-xs font-semibold tracking-widest text-accent uppercase">
            Panel surya · ESP32 · Kipas DC
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-6xl">
            Topi yang menyejukkan dirinya sendiri.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Panel surya di atas topi mengisi kipas di dalamnya. Web ini
            menerima data perangkat, menampilkannya di dasbor, dan
            mengirim perintah kecepatan kipas kembali ke topi.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#cara-kerja"
              className="bg-accent px-5 py-2.5 text-sm font-bold text-paper"
            >
              Lihat cara kerja
            </a>
            <a
              href="#perangkat"
              className="border-2 border-ink px-5 py-2.5 text-sm font-bold"
            >
              Daftar perangkat
            </a>
          </div>
        </div>
        <aside className="self-start border-2 border-ink bg-panel">
          <p className="border-b border-line px-4 py-2 font-mono text-xs font-semibold tracking-widest uppercase">
            Lembar spesifikasi
          </p>
          <dl className="divide-y divide-line text-sm">
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Pengiriman data</dt>
              <dd className="font-mono font-semibold">HTTP POST, tiap 10 detik</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Kontrol kipas</dt>
              <dd className="font-mono font-semibold">Polling perintah</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Mode kipas</dt>
              <dd className="font-mono font-semibold">Otomatis / manual</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Tanpa perangkat keras</dt>
              <dd className="font-mono font-semibold">Mode simulator</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
