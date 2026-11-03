// Validasi muatan telemetri yang dikirim perangkat (ESP32 / simulator).
// Satu-satunya tempat aturan rentang angka tinggal, supaya route API dan
// pengujian di masa depan tidak menulis ulang aturan yang sama.

export type TelemetriMasuk = {
  deviceId: string;
  panelVoltage: number;
  temperature: number;
  humidity: number;
  fanSpeed: number;
  appliedCommandId?: string;
};

export type HasilValidasi =
  | { ok: true; data: TelemetriMasuk }
  | { ok: false; galat: Record<string, string> };

function angka(body: unknown, kunci: string, min: number, maks: number, galat: Record<string, string>) {
  const nilai = (body as Record<string, unknown>)[kunci];
  if (typeof nilai !== "number" || !Number.isFinite(nilai)) {
    galat[kunci] = "harus berupa angka";
    return 0;
  }
  if (nilai < min || nilai > maks) {
    galat[kunci] = `harus antara ${min} dan ${maks}`;
    return 0;
  }
  return nilai;
}

export function validasiTelemetri(body: unknown): HasilValidasi {
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

  const panelVoltage = angka(body, "panelVoltage", 0, 30, galat);
  const temperature = angka(body, "temperature", -20, 80, galat);
  const humidity = angka(body, "humidity", 0, 100, galat);
  const fanSpeedMentah = angka(body, "fanSpeed", 0, 100, galat);
  const fanSpeed = Math.round(fanSpeedMentah);

  let appliedCommandId: string | undefined;
  if (rekaman.appliedCommandId !== undefined) {
    if (typeof rekaman.appliedCommandId !== "string" || rekaman.appliedCommandId.length === 0) {
      galat.appliedCommandId = "harus berupa id perintah yang valid";
    } else {
      appliedCommandId = rekaman.appliedCommandId;
    }
  }

  if (Object.keys(galat).length > 0) return { ok: false, galat };
  return {
    ok: true,
    data: {
      deviceId: (deviceId as string).trim(),
      panelVoltage,
      temperature,
      humidity,
      fanSpeed,
      appliedCommandId,
    },
  };
}

// Token perangkat bersifat opsional: bila env TELEMETRY_TOKEN dipasang,
// pengirim wajib menyertakan header x-device-token yang sama. Bila env
// tidak dipasang (pengembangan / demo), endpoint tetap menerima data.
export function tokenPerangkatSah(request: Request): boolean {
  const token = process.env.TELEMETRY_TOKEN;
  if (!token) return true;
  return request.headers.get("x-device-token") === token;
}
