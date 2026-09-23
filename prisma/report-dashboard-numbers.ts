import { prisma } from "../src/lib/prisma";

async function main() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const activities = await prisma.kegiatan.findMany({ select: { id: true, kode: true, pagu: true, wajib: true } });
  const reports = await prisma.laporan.findMany({ where: { periodeTahun: { lte: year } }, select: { kegiatanId: true, periodeBulan: true, periodeTahun: true, realIni: true } });
  let totalPagu = 0, totalReal = 0, compliant = 0;
  for (const activity of activities) {
    totalPagu += Number(activity.pagu);
    totalReal += reports.filter((r) => r.kegiatanId === activity.id && (r.periodeTahun < year || (r.periodeTahun === year && r.periodeBulan <= month))).reduce((sum, r) => sum + Number(r.realIni), 0);
    if (activity.wajib && reports.some((r) => r.kegiatanId === activity.id && r.periodeTahun === year && r.periodeBulan === month)) compliant++;
    console.log(activity.kode, Number(activity.pagu));
  }
  console.log({ month, year, totalPagu, totalReal, sisa: totalPagu - totalReal, persentaseRealisasi: totalPagu ? totalReal / totalPagu * 100 : 0, kepatuhan: `${compliant}/${activities.filter((a) => a.wajib).length}` });
}
main().catch(console.error).finally(() => prisma.$disconnect());
