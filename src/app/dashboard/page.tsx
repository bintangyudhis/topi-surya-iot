import type { Metadata } from "next";
import DasborLive from "./DasborLive";
import KontrolKipas from "./KontrolKipas";

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
        Data diperbarui otomatis tiap 10 detik. Kontrol kipas di bawah mengirim
        perintah yang diambil perangkat pada polling berikutnya.
      </p>
      <div className="mt-8">
        <DasborLive />
      </div>
      <section aria-labelledby="judul-kontrol" className="mt-10">
        <h2 id="judul-kontrol" className="font-display text-2xl font-extrabold tracking-tight">
          Kontrol kipas
        </h2>
        <div className="mt-4">
          <KontrolKipas />
        </div>
      </section>
    </div>
  );
}
