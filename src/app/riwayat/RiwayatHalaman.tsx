"use client";

import { useCallback, useEffect, useState } from "react";
import type { BarisTelemetri } from "@/app/dashboard/RiwayatTerbaru";
import type { StatistikHarian as TipeStatistik } from "@/lib/statistik";
import StatistikHarian from "./StatistikHarian";
import GrafikRiwayat from "./GrafikRiwayat";
import TabelRiwayat from "./TabelRiwayat";

type JawabanRiwayat = {
  tanggal: string;
  statistik: TipeStatistik;
  data: BarisTelemetri[];
};

// Halaman riwayat: pilih tanggal (WIB) dan ID perangkat opsional, lalu
// tampilkan statistik harian, grafik tegangan seharian, dan tabel
// pengiriman hari itu, plus tautan unduh CSV dengan filter yang sama.
export default function RiwayatHalaman() {
  const hariIni = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(hariIni);
  const [perangkat, setPerangkat] = useState("");
  const [jawaban, setJawaban] = useState<JawabanRiwayat | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);

  const muat = useCallback(async () => {
    setMemuat(true);
    try {
      const query = new URLSearchParams({ tanggal });
      if (perangkat.trim()) query.set("deviceId", perangkat.trim());
      const res = await fetch(`/api/riwayat?${query.toString()}`);
      if (!res.ok) throw new Error(`server menjawab ${res.status}`);
      setJawaban(await res.json());
      setGalat(null);
    } catch {
      setGalat("Riwayat gagal dimuat. Coba lagi.");
    } finally {
      setMemuat(false);
    }
  }, [tanggal, perangkat]);

  useEffect(() => {
    muat();
  }, [muat]);

  const queryCsv = new URLSearchParams({ tanggal, format: "csv" });
  if (perangkat.trim()) queryCsv.set("deviceId", perangkat.trim());

  return (
    <div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          muat();
        }}
      >
        <label className="text-sm">
          <span className="block font-medium">Tanggal (WIB)</span>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="mt-1 border border-line bg-panel px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="block font-medium">ID perangkat (opsional)</span>
          <input
            value={perangkat}
            onChange={(e) => setPerangkat(e.target.value)}
            placeholder="mis. topi-01"
            className="mt-1 border border-line bg-panel px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Tampilkan
        </button>
        <a
          href={`/api/riwayat?${queryCsv.toString()}`}
          className="border border-line bg-panel px-4 py-2 text-sm font-medium"
        >
          Unduh CSV
        </a>
      </form>

      {memuat && <p className="mt-8 text-sm text-muted">Memuat riwayat…</p>}
      {galat && <p className="mt-8 text-sm text-accent">{galat}</p>}
      {!memuat && !galat && jawaban && (
        <div className="mt-8 space-y-8">
          <section aria-labelledby="judul-statistik">
            <h2 id="judul-statistik" className="font-display text-2xl font-extrabold tracking-tight">
              Statistik {jawaban.tanggal}
            </h2>
            <div className="mt-4">
              <StatistikHarian statistik={jawaban.statistik} />
            </div>
          </section>
          <section aria-labelledby="judul-grafik">
            <h2 id="judul-grafik" className="font-display text-2xl font-extrabold tracking-tight">
              Grafik
            </h2>
            <div className="mt-4">
              <GrafikRiwayat data={jawaban.data} />
            </div>
          </section>
          <section aria-labelledby="judul-tabel">
            <h2 id="judul-tabel" className="font-display text-2xl font-extrabold tracking-tight">
              Tabel pengiriman
            </h2>
            <div className="mt-4">
              <TabelRiwayat data={jawaban.data} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
