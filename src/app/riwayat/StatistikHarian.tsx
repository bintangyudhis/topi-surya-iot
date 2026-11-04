import type { StatistikHarian } from "@/lib/statistik";
import { formatSatuDesimal } from "@/lib/format";

// Kartu-kartu statistik satu hari: angka tampil hanya bila ada sampel;
// bila hari itu kosong, kartu berkata jujur "belum ada data" alih-alih
// menampilkan nol yang menyesatkan.
export default function StatistikHarian({ statistik }: { statistik: StatistikHarian }) {
  const kosong = statistik.jumlahSampel === 0;
  const menitMenyala = Math.round(statistik.detikKipasMenyala / 60);
  const kartu: { label: string; nilai: string }[] = [
    {
      label: "Pengiriman",
      nilai: kosong ? "—" : `${statistik.jumlahSampel.toLocaleString("id-ID")} sampel`,
    },
    {
      label: "Rata-rata tegangan panel",
      nilai: statistik.rataTegangan === null ? "—" : `${formatSatuDesimal(statistik.rataTegangan)} V`,
    },
    {
      label: "Suhu tertinggi",
      nilai: statistik.suhuMaks === null ? "—" : `${formatSatuDesimal(statistik.suhuMaks)} °C`,
    },
    {
      label: "Rata-rata kecepatan kipas",
      nilai: statistik.rataKipas === null ? "—" : `${Math.round(statistik.rataKipas)} %`,
    },
    {
      label: "Kipas menyala",
      nilai: kosong ? "—" : `± ${menitMenyala.toLocaleString("id-ID")} menit`,
    },
    {
      label: "Perkiraan energi kipas",
      nilai: kosong ? "—" : `± ${formatSatuDesimal(statistik.perkiraanEnergiKipasWh)} Wh`,
    },
  ];
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kartu.map((k) => (
          <div key={k.label} className="border border-line bg-panel p-4">
            <p className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">
              {k.label}
            </p>
            <p className="mt-2 text-xl font-bold">{k.nilai}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        “Kipas menyala” dan “perkiraan energi” dihitung dari sampel 10 detik:
        satu sampel dihitung sebagai 10 detik, dan energi memakai asumsi
        kipas 5 V / 0,2 A (1 W pada 100%). Sesuaikan dengan spesifikasi
        kipas yang dipakai bila angkanya dipakai untuk keputusan.
      </p>
      {kosong && (
        <p className="mt-3 text-sm text-muted">
          Belum ada data pada hari ini — jalankan firmware atau simulator
          supaya riwayat terisi.
        </p>
      )}
    </div>
  );
}
