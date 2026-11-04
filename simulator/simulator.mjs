// Simulator ESP32 topi surya — pura-pura jadi perangkat tanpa hardware.
//
// Jalankan dari root repo:
//   node simulator/simulator.mjs
// Variabel lingkungan (opsional):
//   SERVER_URL    alamat server, default http://localhost:3000
//   DEVICE_ID     id perangkat, default topi-sim-01
//   DEVICE_TOKEN  header x-device-token, bila server memakai TELEMETRY_TOKEN
//   INTERVAL_MS   jeda kirim, default 10000 (10 detik, sama seperti firmware)
//
// Model sensornya sengaja sederhana dan jujur: tegangan mengikuti kurva
// siang (puncak tengah hari, nol di malam hari) ditambah derau acak,
// suhu dan kelembapan bergerak pelan di sekitar nilai awal. Ini alat demo
// dan uji dasbor, bukan data lapangan.

const SERVER_URL = (process.env.SERVER_URL ?? "http://localhost:3000").replace(/\/$/, "");
const DEVICE_ID = process.env.DEVICE_ID ?? "topi-sim-01";
const DEVICE_TOKEN = process.env.DEVICE_TOKEN ?? "";
const INTERVAL_MS = Number(process.env.INTERVAL_MS ?? 10000);

let suhu = 31;
let kelembapan = 65;
let fanSpeed = 0;
let fanMode = "auto";
let batasAtasAuto = 100;
let lastCommandId = "";
let perintahBaruDiterapkan = "";

// Tegangan panel dari jam lokal: 0 di malam hari, memuncak ~13,5 V
// sekitar tengah hari, dengan derau. Angka ini model demo, bukan
// spesifikasi panel — panel 6 V pada daftar belanja memberi kisaran
// yang sama setelah pembagi tegangan diperhitungkan di firmware.
function teganganPanelSimulasi(now = new Date()) {
  const jam = now.getHours() + now.getMinutes() / 60;
  const siang = Math.max(0, Math.sin(((jam - 6) / 12) * Math.PI));
  return Math.max(0, siang * 13.5 + (Math.random() - 0.5) * 0.8);
}

function langkahSensor() {
  suhu += (Math.random() - 0.5) * 0.4;
  suhu = Math.min(38, Math.max(26, suhu));
  kelembapan += (Math.random() - 0.5) * 2;
  kelembapan = Math.min(90, Math.max(40, kelembapan));
}

function hitungKipasAuto(tegangan, suhuSekarang) {
  if (tegangan < 3.0) return 0;
  if (suhuSekarang >= 34) return 100;
  if (suhuSekarang >= 31) return 75;
  if (suhuSekarang >= 28) return 50;
  return 30;
}

async function kirimTelemetri(tegangan) {
  const muatan = {
    deviceId: DEVICE_ID,
    panelVoltage: Math.round(tegangan * 100) / 100,
    temperature: Math.round(suhu * 10) / 10,
    humidity: Math.round(kelembapan),
    fanSpeed,
  };
  if (perintahBaruDiterapkan) muatan.appliedCommandId = perintahBaruDiterapkan;
  const headers = { "Content-Type": "application/json" };
  if (DEVICE_TOKEN) headers["x-device-token"] = DEVICE_TOKEN;
  const res = await fetch(`${SERVER_URL}/api/telemetry`, {
    method: "POST",
    headers,
    body: JSON.stringify(muatan),
  });
  if (res.status === 201) {
    perintahBaruDiterapkan = "";
    console.log(`[${new Date().toISOString()}] telemetri terkirim`, muatan);
  } else {
    console.error(`[${new Date().toISOString()}] telemetri gagal: HTTP ${res.status}`);
  }
}

// Polling perintah + satu siklus kirim — loop lengkap menyusul.
export { teganganPanelSimulasi, langkahSensor, hitungKipasAuto, kirimTelemetri };
