"use client";

import { useState } from "react";
import type { BarisTelemetri } from "@/app/dashboard/RiwayatTerbaru";
import { formatSatuDesimal, formatWaktuWib } from "@/lib/format";

const PER_HALAMAN = 100;

// Tabel riwayat satu hari, terlama dulu, dengan penomoran halaman 100
// baris — satu hari penuh bisa mencapai 8.640 baris, jadi seluruhnya
// tidak dirender sekaligus.
export default function TabelRiwayat({ data }: { data: BarisTelemetri[] }) {
  const [halaman, setHalaman] = useState(0);
  const jumlahHalaman = Math.max(1, Math.ceil(data.length / PER_HALAMAN));
  const halamanAktif = Math.min(halaman, jumlahHalaman - 1);
  const potongan = data.slice(halamanAktif * PER_HALAMAN, halamanAktif * PER_HALAMAN + PER_HALAMAN);
  if (data.length === 0) return null;
  return (
    <div>
      <div className="overflow-x-auto border border-line bg-panel">
        <table className="w-full min-w-[560px] text-left text-sm">
          <caption className="px-4 py-3 text-left font-mono text-xs font-semibold tracking-widest text-muted uppercase">
            Pengiriman hari itu — terlama dulu
          </caption>
          <thead>
            <tr className="border-y border-line text-muted">
              <th scope="col" className="px-4 py-2 font-medium">Waktu (WIB)</th>
              <th scope="col" className="px-4 py-2 font-medium">Perangkat</th>
              <th scope="col" className="px-4 py-2 font-medium">Panel</th>
              <th scope="col" className="px-4 py-2 font-medium">Suhu</th>
              <th scope="col" className="px-4 py-2 font-medium">Lembap</th>
              <th scope="col" className="px-4 py-2 font-medium">Kipas</th>
            </tr>
          </thead>
          <tbody>
            {potongan.map((baris) => (
              <tr key={baris.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-2 font-mono text-xs">{formatWaktuWib(baris.recordedAt)}</td>
                <td className="px-4 py-2 font-mono text-xs">{baris.deviceId}</td>
                <td className="px-4 py-2">{formatSatuDesimal(baris.panelVoltage)} V</td>
                <td className="px-4 py-2">{formatSatuDesimal(baris.temperature)} °C</td>
                <td className="px-4 py-2">{Math.round(baris.humidity)} %</td>
                <td className="px-4 py-2">{baris.fanSpeed} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {jumlahHalaman > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            disabled={halamanAktif === 0}
            onClick={() => setHalaman(halamanAktif - 1)}
            className="border border-line bg-panel px-3 py-1.5 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-muted">
            Halaman {halamanAktif + 1} dari {jumlahHalaman} ({data.length.toLocaleString("id-ID")} baris)
          </span>
          <button
            type="button"
            disabled={halamanAktif >= jumlahHalaman - 1}
            onClick={() => setHalaman(halamanAktif + 1)}
            className="border border-line bg-panel px-3 py-1.5 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
