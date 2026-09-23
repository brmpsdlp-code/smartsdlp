export type ReportAggregation = {
  realLalu: number;
  realIni: number;
  sdPeriode: number;
  sisa: number;
  persentaseRealisasi: number;
  sudahLaporPeriode: boolean;
};

type ActivityInput = { id: string; pagu: number };
type ReportInput = { kegiatanId: string; periodeBulan: number; periodeTahun: number; realIni: number | bigint };

export function aggregateActivityReports(
  activities: readonly ActivityInput[],
  reports: readonly ReportInput[],
  period: { month: number; year: number },
): Map<string, ReportAggregation> {
  const result = new Map<string, ReportAggregation>();
  for (const activity of activities) {
    const own = reports.filter((report) => report.kegiatanId === activity.id);
    const realLalu = own.filter((report) => report.periodeTahun < period.year || (report.periodeTahun === period.year && report.periodeBulan < period.month)).reduce((sum, report) => sum + Number(report.realIni), 0);
    const realIni = own.filter((report) => report.periodeTahun === period.year && report.periodeBulan === period.month).reduce((sum, report) => sum + Number(report.realIni), 0);
    const sdPeriode = realLalu + realIni;
    result.set(activity.id, { realLalu, realIni, sdPeriode, sisa: activity.pagu - sdPeriode, persentaseRealisasi: activity.pagu > 0 ? (sdPeriode / activity.pagu) * 100 : 0, sudahLaporPeriode: own.some((report) => report.periodeTahun === period.year && report.periodeBulan === period.month) });
  }
  return result;
}
