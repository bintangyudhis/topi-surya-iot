// Validasi perintah kipas. Mode "auto" berarti ESP32 mengatur sendiri
// kecepatan kipas dari tegangan panel dan suhu; angka fanSpeed pada mode
// auto tetap disimpan sebagai batas atas yang diizinkan.

export type PerintahMasuk = {
  deviceId: string;
  fanSpeed: number;
  mode: "auto" | "manual";
};

export type HasilPerintah =
  | { ok: true; data: PerintahMasuk }
  | { ok: false; galat: Record<string, string> };

export function validasiPerintah(body: unknown): HasilPerintah {
  const galat: Record<string, string> = {};
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, galat: { body: "muatan harus berupa objek JSON" } };
  }
  const rekaman = body as Record<string, unknown>;

  const deviceId = rekaman.deviceId;
  if (typeof deviceId !== "string" || deviceId.trim().length === 0) {
    galat.deviceId = "wajib diisi";
  } else if (deviceId.length > 64) {
    galat.deviceId = "maksimal 64 karakter";
  }

  let fanSpeed = 0;
  if (typeof rekaman.fanSpeed !== "number" || !Number.isFinite(rekaman.fanSpeed)) {
    galat.fanSpeed = "harus berupa angka";
  } else if (rekaman.fanSpeed < 0 || rekaman.fanSpeed > 100) {
    galat.fanSpeed = "harus antara 0 dan 100";
  } else {
    fanSpeed = Math.round(rekaman.fanSpeed);
  }

  if (rekaman.mode !== "auto" && rekaman.mode !== "manual") {
    galat.mode = "harus 'auto' atau 'manual'";
  }

  if (Object.keys(galat).length > 0) return { ok: false, galat };
  return {
    ok: true,
    data: {
      deviceId: (deviceId as string).trim(),
      fanSpeed,
      mode: rekaman.mode as "auto" | "manual",
    },
  };
}
