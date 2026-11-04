import type { BarisTelemetri } from "@/app/dashboard/RiwayatTerbaru";

// Grafik tegangan seharian dari SVG murni, mengikuti pola GrafikTegangan
// di dasbor. Satu hari bisa berisi ribuan titik, jadi titik diringkas
// dulu menjadi maksimal 200 titik yang tersebar merata — bentuk kurva
// siangnya tetap terbaca tanpa membebani peramban.
const MAKS_TITIK = 200;

export default function GrafikRiwayat({ data }: { data: BarisTelemetri[] }) {
  if (data.length === 0) {
    return (
      <div className="border border-line bg-panel p-4">
        <p className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">
          Tegangan panel seharian
        </p>
        <p className="mt-3 text-sm text-muted">Belum ada data untuk digambar.</p>
      </div>
    );
  }
  const langkah = Math.max(1, Math.floor(data.length / MAKS_TITIK));
  const ringkas = data.filter((_, i) => i % langkah === 0);
  const nilai = ringkas.map((t) => t.panelVoltage);
  const min = Math.min(...nilai);
  const maks = Math.max(...nilai);
  const rentang = maks - min || 1;
  const lebar = 560;
  const tinggi = 180;
  const titik = ringkas.map((t, i) => {
    const x = ringkas.length === 1 ? lebar / 2 : (i / (ringkas.length - 1)) * lebar;
    const y = tinggi - 10 - ((t.panelVoltage - min) / rentang) * (tinggi - 20);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <div className="border border-line bg-panel p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">
          Tegangan panel seharian
        </p>
        <p className="font-mono text-xs text-muted">
          {min.toFixed(1).replace(".", ",")}–{maks.toFixed(1).replace(".", ",")} V
          {data.length > MAKS_TITIK ? ` · diringkas dari ${data.length.toLocaleString("id-ID")} titik` : ""}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${lebar} ${tinggi}`}
        className="mt-3 w-full"
        role="img"
        aria-label={`Grafik tegangan panel seharian, dari ${min} sampai ${maks} volt`}
      >
        <polyline
          points={titik.join(" ")}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-2 text-xs text-muted">
        Kiri ke kanan dari pagi sampai malam WIB; puncak siang menandakan
        panel menerima cahaya paling kuat.
      </p>
    </div>
  );
}
