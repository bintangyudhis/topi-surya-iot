import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validasiPerintah } from "@/lib/perintah";

// GET: perintah terbaru untuk satu perangkat — endpoint yang di-polling
// ESP32. deviceId wajib, supaya perangkat tidak saling mengambil perintah.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");
  if (!deviceId) {
    return NextResponse.json({ galat: "deviceId wajib diisi" }, { status: 400 });
  }
  const perintah = await prisma.deviceCommand.findFirst({
    where: { deviceId },
    orderBy: { createdAt: "desc" },
  });
  if (!perintah) {
    return NextResponse.json({ data: null });
  }
  return NextResponse.json({ data: perintah });
}

// POST: simpan perintah baru. Perintah lama tidak dihapus — riwayat
// perintah tetap bisa ditelusur, dan yang berlaku selalu yang terbaru.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ galat: "muatan harus berupa JSON yang valid" }, { status: 400 });
  }
  const hasil = validasiPerintah(body);
  if (!hasil.ok) {
    return NextResponse.json({ galat: "validasi gagal", rincian: hasil.galat }, { status: 400 });
  }
  const tersimpan = await prisma.deviceCommand.create({ data: hasil.data });
  return NextResponse.json(
    { id: tersimpan.id, deviceId: tersimpan.deviceId, fanSpeed: tersimpan.fanSpeed, mode: tersimpan.mode },
    { status: 201 },
  );
}
