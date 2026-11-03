import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tokenPerangkatSah, validasiTelemetri } from "@/lib/telemetri";

export async function POST(request: Request) {
  if (!tokenPerangkatSah(request)) {
    return NextResponse.json({ galat: "token perangkat tidak sah" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ galat: "muatan harus berupa JSON yang valid" }, { status: 400 });
  }
  const hasil = validasiTelemetri(body);
  if (!hasil.ok) {
    return NextResponse.json({ galat: "validasi gagal", rincian: hasil.galat }, { status: 400 });
  }
  const { appliedCommandId, ...data } = hasil.data;
  const tersimpan = await prisma.telemetry.create({ data });
  if (appliedCommandId) {
    await prisma.deviceCommand.updateMany({
      where: { id: appliedCommandId, deviceId: data.deviceId, appliedAt: null },
      data: { appliedAt: new Date() },
    });
  }
  return NextResponse.json(
    { id: tersimpan.id, deviceId: tersimpan.deviceId, recordedAt: tersimpan.recordedAt },
    { status: 201 },
  );
}
