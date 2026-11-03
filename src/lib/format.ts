// Format tampilan dasbor: semua waktu ditampilkan dalam WIB, karena
// perangkat dan pembacanya sama-sama berada di zona itu.

const formatWaktu = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function formatWaktuWib(iso: string): string {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return "—";
  return `${formatWaktu.format(tanggal)} WIB`;
}

export function formatSatuDesimal(nilai: number): string {
  return nilai.toFixed(1).replace(".", ",");
}
