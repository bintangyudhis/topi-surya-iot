import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hitungStatistikHarian, rentangHariWib, tanggalHariIniWib } from "@/lib/statistik";

// GET /api/riwayat?tanggal=YYYY-MM-DD&deviceId=... — seluruh telemetri
// satu hari WIB (terlama dulu) plus statistik hariannya. Satu hari penuh
// pada interval 10 detik maksimal 8.640 baris; batas 10.000 menjaga
// respons tetap waras bila interval pengiriman dipersingkat.
// ?format=csv mengunduh baris yang sama sebagai CSV.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tanggal = searchParams.get("tanggal") ?? tanggalHariIniWib();
  const rentang = rentangHariWib(tanggal);
  if (!rentang) {
    return NextResponse.json({ galat: "tanggal harus format YYYY-MM-DD yang valid" }, { status: 400 });
  }
  const deviceId = searchParams.get("deviceId") ?? undefined;
  if (deviceId !== undefined && (deviceId.trim().length === 0 || deviceId.length > 64)) {
    return NextResponse.json({ galat: "deviceId maksimal 64 karakter" }, { status: 400 });
  }
  const baris = await prisma.telemetry.findMany({
    where: {
      deviceId: deviceId ? deviceId.trim() : undefined,
      recordedAt: { gte: rentang.mulai, lt: rentang.akhir },
    },
    orderBy: { recordedAt: "asc" },
    take: 10000,
  });
  if (searchParams.get("format") === "csv") {
    const header = "recordedAt,deviceId,panelVoltage,temperature,humidity,fanSpeed";
    const isi = baris
      .map((b) =>
        [
          b.recordedAt.toISOString(),
          `"${b.deviceId.replaceAll('"', '""')}"`,
          b.panelVoltage,
          b.temperature,
          b.humidity,
          b.fanSpeed,
        ].join(","),
      )
      .join("\n");
    return new NextResponse(`${header}\n${isi}\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="riwayat-${tanggal}.csv"`,
      },
    });
  }
  return NextResponse.json({
    tanggal,
    deviceId: deviceId?.trim() ?? null,
    statistik: hitungStatistikHarian(baris),
    data: baris,
  });
}
