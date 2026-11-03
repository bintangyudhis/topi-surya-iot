type Titik = { recordedAt: string; panelVoltage: number };

// Grafik tegangan panel dari SVG murni (tanpa pustaka grafik): titik
// diurutkan dari yang terlama, garis digambar sebagai polyline, dan
// sumbu hanya menampilkan nilai terendah–tertinggi yang benar-benar ada.
export default function GrafikTegangan({ data }: { data: Titik[] }) {
  if (data.length === 0) {
    return (
      <div className="border border-line bg-panel p-4">
        <p className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">
          Tegangan panel
        </p>
        <p className="mt-3 text-sm text-muted">Belum ada data untuk digambar.</p>
      </div>
    );
  }
  const terurut = [...data].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const nilai = terurut.map((t) => t.panelVoltage);
  const min = Math.min(...nilai);
  const maks = Math.max(...nilai);
  const rentang = maks - min || 1;
  const lebar = 560;
  const tinggi = 180;
  const titik = terurut.map((t, i) => {
    const x = terurut.length === 1 ? lebar / 2 : (i / (terurut.length - 1)) * lebar;
    const y = tinggi - 10 - ((t.panelVoltage - min) / rentang) * (tinggi - 20);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <div className="border border-line bg-panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">
          Tegangan panel
        </p>
        <p className="font-mono text-xs text-muted">
          {min.toFixed(1).replace(".", ",")}–{maks.toFixed(1).replace(".", ",")} V
        </p>
      </div>
      <svg
        viewBox={`0 0 ${lebar} ${tinggi}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`Grafik tegangan panel, ${terurut.length} titik, dari ${min} sampai ${maks} volt`}
      >
        <polyline
          points={titik.join(" ")}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {terurut.map((t, i) => {
          const [x, y] = titik[i].split(",");
          return <circle key={t.recordedAt + i} cx={x} cy={y} r="3" fill="var(--color-ink)" />;
        })}
      </svg>
      <p className="mt-2 text-xs text-muted">
        {terurut.length} pengiriman terakhir, kiri ke kanan dari yang terlama.
      </p>
    </div>
  );
}
