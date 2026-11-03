"use client";

import { useCallback, useEffect, useState } from "react";
import KartuMetrik from "./KartuMetrik";
import GrafikTegangan from "./GrafikTegangan";
import RiwayatTerbaru, { type BarisTelemetri } from "./RiwayatTerbaru";
import { formatSatuDesimal, formatWaktuWib } from "@/lib/format";

// Dasbor live: mengambil 50 pengiriman terbaru dari GET /api/telemetry
// dan mengulanginya tiap 10 detik — interval yang sama dengan rencana
// pengiriman firmware ESP32, jadi dasbor bergerak seiring perangkat.
export default function DasborLive() {
  const [data, setData] = useState<BarisTelemetri[]>([]);
  const [perangkat, setPerangkat] = useState("");
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [terakhir, setTerakhir] = useState<string | null>(null);

  const muat = useCallback(async () => {
    try {
      const query = perangkat.trim()
        ? `/api/telemetry?limit=50&deviceId=${encodeURIComponent(perangkat.trim())}`
        : "/api/telemetry?limit=50";
      const res = await fetch(query);
      if (!res.ok) throw new Error(`server menjawab ${res.status}`);
      const json = (await res.json()) as { data: BarisTelemetri[] };
      setData(json.data);
      setGalat(null);
      setTerakhir(new Date().toISOString());
    } catch {
      setGalat("Data gagal dimuat. Dasbor akan mencoba lagi otomatis.");
    } finally {
      setMemuat(false);
    }
  }, [perangkat]);

  useEffect(() => {
    muat();
    const timer = setInterval(muat, 10_000);
    return () => clearInterval(timer);
  }, [muat]);

  const terbaru = data[0];

  return (
    <div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setMemuat(true);
          muat();
        }}
      >
        <label className="text-sm">
          <span className="block font-medium">ID perangkat (opsional)</span>
          <input
            value={perangkat}
            onChange={(e) => setPerangkat(e.target.value)}
            placeholder="mis. topi-01"
            className="mt-1 border border-line bg-panel px-3 py-2 font-mono text-sm"
          />
        </label>
        <button type="submit" className="bg-accent px-4 py-2 text-sm font-bold text-paper">
          Tampilkan
        </button>
        <p className="text-sm text-muted" role="status">
          {memuat ? "Memuat…" : terakhir ? `Terakhir diperbarui ${formatWaktuWib(terakhir)}` : ""}
        </p>
      </form>

      {galat && (
        <p role="alert" className="mt-6 border border-line bg-panel px-4 py-3 text-sm">
          {galat}
        </p>
      )}

      {!memuat && !galat && data.length === 0 && (
        <p className="mt-6 border border-line bg-panel px-4 py-6 text-sm leading-relaxed">
          Belum ada data. Nyalakan perangkat atau simulator (lihat README) agar
          pengiriman pertama muncul di sini.
        </p>
      )}

      {terbaru && (
        <>
          <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            <KartuMetrik
              label="Tegangan panel"
              nilai={formatSatuDesimal(terbaru.panelVoltage)}
              satuan="V"
              keterangan={`Perangkat ${terbaru.deviceId}`}
            />
            <KartuMetrik
              label="Suhu"
              nilai={formatSatuDesimal(terbaru.temperature)}
              satuan="°C"
              keterangan="Suhu udara di sekitar topi"
            />
            <KartuMetrik
              label="Kelembapan"
              nilai={String(Math.round(terbaru.humidity))}
              satuan="%"
              keterangan="Kelembapan udara"
            />
            <KartuMetrik
              label="Kipas"
              nilai={String(terbaru.fanSpeed)}
              satuan="%"
              keterangan={`Terakhir dicatat ${formatWaktuWib(terbaru.recordedAt)}`}
            />
          </div>
          <div className="mt-6">
            <GrafikTegangan data={data} />
          </div>
          <div className="mt-6">
            <RiwayatTerbaru data={data.slice(0, 20)} />
          </div>
        </>
      )}
    </div>
  );
}
