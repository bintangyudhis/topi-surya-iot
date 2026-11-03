type Props = {
  label: string;
  nilai: string;
  satuan: string;
  keterangan: string;
};

// Satu kartu metrik: label kecil di atas, angka besar di bawah. Tanpa
// warna status — angka bicara sendiri, ambang peringatan tidak dikarang
// di sini karena belum ada di rencana fitur.
export default function KartuMetrik({ label, nilai, satuan, keterangan }: Props) {
  return (
    <div className="border border-line bg-panel p-4">
      <p className="font-mono text-xs font-semibold tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-3 font-display text-4xl font-extrabold tracking-tight">
        {nilai}
        <span className="ml-1 text-base font-bold text-muted">{satuan}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{keterangan}</p>
    </div>
  );
}
