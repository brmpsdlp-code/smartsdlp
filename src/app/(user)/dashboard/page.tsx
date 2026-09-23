import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/active-session";
import { prisma } from "@/lib/prisma";
import { UserDashboard } from "@/components/UserDashboard";
import type { Activity } from "@/types";
import { aggregateActivityReports } from "@/utils/reportAggregation";

export default async function DashboardPage() {
  const session = await getActiveSession();
  if (!session) redirect("/login?error=inactive");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [rows, laporanRows, laporanBulanIni] = await Promise.all([
    prisma.kegiatan.findMany({
      where: { pjId: session.user.id },
      include: {
        pj: { select: { id: true, name: true, email: true } },
        programCategoryRef: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            colorKey: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.laporan.findMany({
      where: { kegiatan: { pjId: session.user.id } },
      orderBy: [{ periodeTahun: "desc" }, { periodeBulan: "desc" }],
    }),
    // Cek spesifik: kegiatan mana yang SUDAH ada laporan untuk BULAN BERJALAN.
    prisma.laporan.findMany({
      where: {
        kegiatan: { pjId: session.user.id },
        periodeBulan: currentMonth,
        periodeTahun: currentYear,
      },
      select: { kegiatanId: true },
    }),
  ]);

  const aggregates = aggregateActivityReports(rows.map((k) => ({ id: k.id, pagu: Number(k.pagu) })), laporanRows.map((l) => ({ ...l, realIni: Number(l.realIni) })), { month: currentMonth, year: currentYear });
  const kegiatanSudahLaporBulanIni = new Set(
    laporanBulanIni.map((l) => l.kegiatanId),
  );

  const activities: Activity[] = rows.map((k) => ({
    id: k.id,
    kode: k.kode,
    nama: k.nama,
    jenis: k.jenis || "APBN",
    programCategory: k.programCategoryRef?.id
      ? k.programCategoryRef.name
      : k.programCategory ?? undefined,
    pagu: Number(k.pagu),
    realisasi: aggregates.get(k.id)?.sdPeriode ?? 0,
    fisik: k.fisik ?? 0,
    uraian: k.uraian ?? undefined,
    statusAnggaran: k.statusAnggaran === "DIBLOKIR" ? "Diblokir" : "Dibuka",
    realLalu: aggregates.get(k.id)?.realLalu ?? 0,
    realIni: aggregates.get(k.id)?.realIni ?? 0,
    pj: k.pj?.name,
    email: k.pj?.email,
    wajib: k.wajib,
    // Ganti sumber "sudahLapor" — bukan lagi cache statis, tapi cek nyata
    // terhadap tabel Laporan untuk bulan berjalan.
    sudahLapor: kegiatanSudahLaporBulanIni.has(k.id),
    status: kegiatanSudahLaporBulanIni.has(k.id) ? "done" : "pending",
  }));

  const laporanHistory = laporanRows.map((l) => ({
    id: l.id,
    kegiatanId: l.kegiatanId,
    periodeBulan: l.periodeBulan,
    periodeTahun: l.periodeTahun,
    uraian: l.uraian,
    fisik: l.fisik,
    statusAnggaran:
      l.statusAnggaran === "DIBLOKIR"
        ? ("Diblokir" as const)
        : ("Dibuka" as const),
    realIni: Number(l.realIni),
    realisasi: Number(l.realisasi),
  }));

  const metrics = Object.fromEntries(aggregates.entries());
  return (
    <UserDashboard activities={activities} metrics={metrics} laporanHistory={laporanHistory} />
  );
}
