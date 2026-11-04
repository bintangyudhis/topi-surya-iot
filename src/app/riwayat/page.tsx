import type { Metadata } from "next";
import RiwayatHalaman from "./RiwayatHalaman";

export const metadata: Metadata = {
  title: "Riwayat — Topi Surya",
  description:
    "Riwayat telemetri topi surya per hari: statistik harian, grafik tegangan seharian, tabel pengiriman, dan export CSV.",
};

export default function RiwayatPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Riwayat</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Pilih satu hari untuk melihat statistiknya, grafik tegangan panel
        seharian, dan seluruh pengiriman hari itu. Semua waktu dalam WIB.
      </p>
      <div className="mt-8">
        <RiwayatHalaman />
      </div>
    </div>
  );
}
