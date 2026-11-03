import { formatSatuDesimal, formatWaktuWib } from "@/lib/format";

export type BarisTelemetri = {
  id: string;
  deviceId: string;
  panelVoltage: number;
  temperature: number;
  humidity: number;
  fanSpeed: number;
  recordedAt: string;
};

// Tabel pengiriman terbaru, terbaru di atas — sama urutannya dengan
// respons GET /api/telemetry, jadi tidak ada penyortiran ulang di sini.
export default function RiwayatTerbaru({ data }: { data: BarisTelemetri[] }) {
  if (data.length === 0) return null;
  return (
    <div className="overflow-x-auto border border-line bg-panel">
      <table className="w-full min-w-[560px] text-left text-sm">
        <caption className="px-4 py-3 text-left font-mono text-xs font-semibold tracking-widest text-muted uppercase">
          Pengiriman terbaru
        </caption>
        <thead>
          <tr className="border-y border-line text-muted">
            <th scope="col" className="px-4 py-2 font-medium">Waktu (WIB)</th>
            <th scope="col" className="px-4 py-2 font-medium">Panel</th>
            <th scope="col" className="px-4 py-2 font-medium">Suhu</th>
            <th scope="col" className="px-4 py-2 font-medium">Lembap</th>
            <th scope="col" className="px-4 py-2 font-medium">Kipas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((baris) => (
            <tr key={baris.id} className="border-b border-line last:border-b-0">
              <td className="px-4 py-2 font-mono text-xs">{formatWaktuWib(baris.recordedAt)}</td>
              <td className="px-4 py-2">{formatSatuDesimal(baris.panelVoltage)} V</td>
              <td className="px-4 py-2">{formatSatuDesimal(baris.temperature)} °C</td>
              <td className="px-4 py-2">{Math.round(baris.humidity)} %</td>
              <td className="px-4 py-2">{baris.fanSpeed} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
