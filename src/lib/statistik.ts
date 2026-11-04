// Agregasi statistik harian dari baris telemetri — fungsi murni supaya
// bisa dipakai route API dan komponen tanpa mengulang rumus.
//
// Dua asumsi ditulis terang di sini dan di UI, bukan disembunyikan:
//   - Satu sampel mewakili 10 detik (interval kirim firmware/simulator).
//   - Perkiraan energi kipas memakai kipas 5 V / 0,2 A nominal (1 W pada
//     100%): energi = jumlah (kecepatan% x 1 W x 10 detik). Sesuaikan
//     angka 1 W dengan spesifikasi kipas yang benar-benar dipakai bila
//     angkanya dipakai untuk keputusan, bukan sekadar gambaran.

export type SampelStatistik = {
  panelVoltage: number;
  temperature: number;
  humidity: number;
  fanSpeed: number;
};

export type StatistikHarian = {
  jumlahSampel: number;
  rataTegangan: number | null;
  suhuMaks: number | null;
  rataKipas: number | null;
  detikKipasMenyala: number;
  perkiraanEnergiKipasWh: number;
};

export const INTERVAL_DETIK = 10;
export const DAYA_KIPAS_WATT = 1;

export function hitungStatistikHarian(sampel: SampelStatistik[]): StatistikHarian {
  if (sampel.length === 0) {
    return {
      jumlahSampel: 0,
      rataTegangan: null,
      suhuMaks: null,
      rataKipas: null,
      detikKipasMenyala: 0,
      perkiraanEnergiKipasWh: 0,
    };
  }
  const rata = (nilai: number[]) => nilai.reduce((a, b) => a + b, 0) / nilai.length;
  const menyala = sampel.filter((s) => s.fanSpeed > 0).length;
  const energiJoule = sampel.reduce(
    (total, s) => total + (s.fanSpeed / 100) * DAYA_KIPAS_WATT * INTERVAL_DETIK,
    0,
  );
  return {
    jumlahSampel: sampel.length,
    rataTegangan: rata(sampel.map((s) => s.panelVoltage)),
    suhuMaks: Math.max(...sampel.map((s) => s.temperature)),
    rataKipas: rata(sampel.map((s) => s.fanSpeed)),
    detikKipasMenyala: menyala * INTERVAL_DETIK,
    perkiraanEnergiKipasWh: energiJoule / 3600,
  };
}

// Batas hari dalam WIB untuk tanggal "YYYY-MM-DD": WIB = UTC+7, jadi
// hari WIB dimulai pukul 17:00 UTC pada hari sebelumnya.
export function rentangHariWib(tanggal: string): { mulai: Date; akhir: Date } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) return null;
  const mulai = new Date(`${tanggal}T00:00:00+07:00`);
  if (Number.isNaN(mulai.getTime())) return null;
  const akhir = new Date(mulai.getTime() + 24 * 60 * 60 * 1000);
  return { mulai, akhir };
}

// Tanggal hari ini dalam WIB, format YYYY-MM-DD.
export function tanggalHariIniWib(now = new Date()): string {
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}
