import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/active-session";
import { prisma } from "@/lib/prisma";
import { UserDashboard } from "@/components/UserDashboard";
import type { Activity } from "@/types";
import { aggregateActivityReports } from "@/utils/reportAggregation";
import { getReportDeadline } from "@/features/app-settings/actions";
import { getMyNotifications } from "@/features/notifications/actions";
import { daftarTahunFilter } from "@/utils/arsipFilter";
import { getWibYearMonth } from "@/utils/tahunAnggaran";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>;
}) {
  const session = await getActiveSession();
  if (!session) redirect("/login?error=inactive");

  const nowMs = new Date().getTime();
  const sekarang = getWibYearMonth(nowMs);
  const params = await searchParams;
  const requestedYear = Number(params.tahun);

  const [rows, laporanRows, deadline, notifications] = await Promise.all([
    prisma.kegiatan.findMany({
      where: { pjId: session.user.id },
      include: {
        pj: { select: { id: true, name: true, email: true } },
        programCategoryRef: {
          select: { id: true, name: true, sortOrder: true, colorKey: true, isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.laporan.findMany({
      where: { kegiatan: { pjId: session.user.id } },
      orderBy: [{ periodeTahun: "desc" }, { periodeBulan: "desc" }],
    }),
    getReportDeadline(),
    getMyNotifications(),
  ]);

  const tahunOptions = daftarTahunFilter(
    rows.map((k) => k.tahunAnggaran),
    laporanRows.map((l) => l.periodeTahun),
    sekarang.tahun,
  );
  const currentYear = Number.isInteger(requestedYear) && tahunOptions.includes(requestedYear)
    ? requestedYear
    : sekarang.tahun;
  const kegiatanTahun = rows.filter((k) => k.tahunAnggaran === currentYear);
  const idsTahun = new Set(kegiatanTahun.map((k) => k.id));
  const laporanTahun = laporanRows.filter((l) => idsTahun.has(l.kegiatanId));
  const aggregates = aggregateActivityReports(
    kegiatanTahun.map((k) => ({ id: k.id, pagu: Number(k.pagu) })),
    laporanTahun.map((l) => ({ ...l, realIni: Number(l.realIni) })),
    { month: sekarang.bulan, year: currentYear },
  );
  const kegiatanSudahLaporBulanIni = new Set(
    laporanTahun
      .filter((l) => l.periodeBulan === sekarang.bulan && l.periodeTahun === currentYear)
      .map((l) => l.kegiatanId),
  );

  const activities: Activity[] = kegiatanTahun.map((k) => {
    const sudahLapor = kegiatanSudahLaporBulanIni.has(k.id);
    const diblokir = k.statusAnggaran === "DIBLOKIR";
    return {
      id: k.id,
      kode: k.kode,
      nama: k.nama,
      jenis: k.jenis || "APBN",
      programCategory: k.programCategoryRef?.id ? k.programCategoryRef.name : k.programCategory ?? undefined,
      pagu: Number(k.pagu),
      realisasi: aggregates.get(k.id)?.sdPeriode ?? 0,
      fisik: k.fisik ?? 0,
      uraian: k.uraian ?? undefined,
      statusAnggaran: diblokir ? "Diblokir" : "Dibuka",
      realLalu: aggregates.get(k.id)?.realLalu ?? 0,
      realIni: aggregates.get(k.id)?.realIni ?? 0,
      pj: k.pj?.name,
      email: k.pj?.email,
      wajib: k.wajib,
      sudahLapor,
      status: sudahLapor || diblokir ? "done" : "pending",
    };
  });

  const laporanHistory = laporanRows.map((l) => ({
    id: l.id,
    kegiatanId: l.kegiatanId,
    periodeBulan: l.periodeBulan,
    periodeTahun: l.periodeTahun,
    uraian: l.uraian,
    fisik: l.fisik,
    statusAnggaran: l.statusAnggaran === "DIBLOKIR" ? ("Diblokir" as const) : ("Dibuka" as const),
    realIni: Number(l.realIni),
    realisasi: Number(l.realisasi),
  }));

  return (
    <UserDashboard
      activities={activities}
      metrics={Object.fromEntries(aggregates.entries())}
      laporanHistory={laporanHistory}
      deadline={deadline}
      notifications={notifications.items}
      tahunOptions={tahunOptions}
      currentTahun={currentYear}
    />
  );
}
