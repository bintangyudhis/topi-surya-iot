import type { Metadata } from "next";
import DasborLive from "./DasborLive";

export const metadata: Metadata = {
  title: "Dasbor live — Topi Surya",
  description:
    "Data terbaru dari topi surya: tegangan panel, suhu, kelembapan, kecepatan kipas, dan kontrol kipas.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Dasbor live</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Data diperbarui otomatis tiap 10 detik.
      </p>
      <div className="mt-8">
        <DasborLive />
      </div>
    </div>
  );
}
