import { formatWaktuWib } from "@/lib/format";

export type PerintahTampil = {
  id: string;
  fanSpeed: number;
  mode: string;
  createdAt: string;
  appliedAt: string | null;
};

// Status perintah terbaru: menunggu perangkat bila appliedAt masih kosong,
// sudah diterapkan bila perangkat sudah mengonfirmasi lewat telemetri.
export default function StatusPerintah({ perintah }: { perintah: PerintahTampil | null }) {
  if (!perintah) {
    return <p className="text-sm text-muted">Belum ada perintah untuk perangkat ini.</p>;
  }
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-muted">Kecepatan</dt>
        <dd className="mt-1 font-display text-xl font-extrabold">{perintah.fanSpeed} %</dd>
      </div>
      <div>
        <dt className="text-muted">Mode</dt>
        <dd className="mt-1 font-medium">{perintah.mode === "auto" ? "Otomatis" : "Manual"}</dd>
      </div>
      <div>
        <dt className="text-muted">Status</dt>
        <dd className="mt-1 font-medium">
          {perintah.appliedAt
            ? `Diterapkan ${formatWaktuWib(perintah.appliedAt)}`
            : `Menunggu perangkat (dikirim ${formatWaktuWib(perintah.createdAt)})`}
        </dd>
      </div>
    </dl>
  );
}
