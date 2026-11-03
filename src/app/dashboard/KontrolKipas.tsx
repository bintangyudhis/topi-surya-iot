"use client";

import { useCallback, useEffect, useState } from "react";
import StatusPerintah, { type PerintahTampil } from "./StatusPerintah";

// Formulir kontrol kipas: kirim perintah baru ke POST /api/command, lalu
// tampilkan perintah terbaru (GET /api/command) beserta statusnya.
export default function KontrolKipas() {
  const [deviceId, setDeviceId] = useState("");
  const [fanSpeed, setFanSpeed] = useState(50);
  const [mode, setMode] = useState<"auto" | "manual">("manual");
  const [perintah, setPerintah] = useState<PerintahTampil | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);

  const muatPerintah = useCallback(async (id: string) => {
    if (!id.trim()) {
      setPerintah(null);
      return;
    }
    const res = await fetch(`/api/command?deviceId=${encodeURIComponent(id.trim())}`);
    if (!res.ok) return;
    const json = (await res.json()) as { data: PerintahTampil | null };
    setPerintah(json.data);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => muatPerintah(deviceId), 10_000);
    return () => clearInterval(timer);
  }, [deviceId, muatPerintah]);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setMengirim(true);
    setPesan(null);
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: deviceId.trim(), fanSpeed, mode }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { rincian?: Record<string, string> };
        const pertama = json.rincian ? Object.values(json.rincian)[0] : undefined;
        setPesan(pertama ?? "Perintah gagal dikirim.");
        return;
      }
      setPesan("Perintah terkirim, menunggu perangkat mengambilnya.");
      await muatPerintah(deviceId);
    } catch {
      setPesan("Perintah gagal dikirim. Periksa koneksi lalu coba lagi.");
    } finally {
      setMengirim(false);
    }
  }

  return (
    <div className="border border-line bg-panel p-4">
      <form onSubmit={kirim} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="block font-medium">ID perangkat</span>
          <input
            value={deviceId}
            onChange={(e) => {
              setDeviceId(e.target.value);
              muatPerintah(e.target.value);
            }}
            placeholder="mis. topi-01"
            required
            className="mt-1 w-full border border-line bg-paper px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="block font-medium">
            Kecepatan kipas: {fanSpeed} %
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={fanSpeed}
            onChange={(e) => setFanSpeed(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
        </label>
        <fieldset className="text-sm">
          <legend className="font-medium">Mode</legend>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                checked={mode === "manual"}
                onChange={() => setMode("manual")}
              />
              Manual
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                checked={mode === "auto"}
                onChange={() => setMode("auto")}
              />
              Otomatis
            </label>
          </div>
        </fieldset>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={mengirim}
            className="bg-accent px-5 py-2.5 text-sm font-bold text-paper disabled:opacity-50"
          >
            {mengirim ? "Mengirim…" : "Kirim perintah"}
          </button>
        </div>
      </form>
      {pesan && (
        <p role="status" className="mt-4 text-sm">
          {pesan}
        </p>
      )}
      <div className="mt-5 border-t border-line pt-4">
        <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-muted uppercase">
          Perintah terbaru
        </p>
        <StatusPerintah perintah={perintah} />
      </div>
    </div>
  );
}
