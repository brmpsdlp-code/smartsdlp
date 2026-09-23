import { Activity } from "@/types";
import { DonutChartSegment } from "@/components/ui/donut-chart";

export const MAIN_PROGRAM_CATEGORIES = [
  {
    name: "Layanan Perkantoran",
    color: "#134B88",
    description: "Operasional, gaji, tunjangan, dan pemeliharaan sarana perkantoran",
    defaultPrefix: "6918",
  },
  {
    name: "Fasilitas Kinerja",
    color: "#236437",
    description: "Pendampingan kinerja, monitoring evaluasi, SAKIP & akuntabilitas",
    defaultPrefix: "6918",
  },
  {
    name: "Klinik Modernisasi/KMP",
    color: "#E28B59",
    description: "Klinik modernisasi pertanian, identifikasi lahan presisi, & tata kelola gambut",
    defaultPrefix: "7912",
  },
  {
    name: "Alat & Sarana",
    color: "#8E44AD",
    description: "Pengadaan alat laboratorium modern, sensor lapang, dan drone spasial",
    defaultPrefix: "7911",
  },
] as const;

export type ProgramCategoryDefinition = {
  name: string;
  colorKey?: string;
  color?: string;
};

const COLOR_TOKENS: Record<string, string> = {
  blue: "var(--chart-1)",
  green: "var(--chart-2)",
  "green-light": "var(--chart-3)",
  "green-dark": "var(--chart-4)",
  gold: "var(--chart-5)",
  muted: "var(--chart-6)",
  govGreen: "var(--primary)",
  govRed: "var(--destructive)",
  govBlue: "var(--report-accent)",
  border: "var(--chart-9)",
  orange: "var(--chart-3)",
  purple: "var(--chart-4)",
  slate: "var(--chart-5)",
  chart1: "var(--chart-1)",
  chart2: "var(--chart-2)",
  chart3: "var(--chart-3)",
  chart4: "var(--chart-4)",
  chart5: "var(--chart-5)",
};

function resolveCategoryColor(category: ProgramCategoryDefinition): string {
  return category.color || (category.colorKey ? COLOR_TOKENS[category.colorKey.toLowerCase()] : undefined) || PROGRAM_COLORS[category.name] || "var(--chart-5)";
}

export type ProgramCategoryType =
  | "Layanan Perkantoran"
  | "Fasilitas Kinerja"
  | "Klinik Modernisasi/KMP"
  | "Alat & Sarana"
  | "Program Lainnya/Unassigned";

export const PROGRAM_COLORS: Record<string, string> = {
  "Layanan Perkantoran": "#134B88",
  "Fasilitas Kinerja": "#236437",
  "Klinik Modernisasi/KMP": "#E28B59",
  "Alat & Sarana": "#8E44AD",
  "Program Lainnya/Unassigned": "#64748B",
};

export function resolveProgramCategory(
  _kode: string,
  _nama?: string,
  manualCategory?: string,
): string {
  return manualCategory?.trim() || "Program Lainnya/Unassigned";
}

/**
 * Real-time dynamic aggregation of Activities into Program Donut Chart Segments
 */
export function aggregateProgramPagu(
  activities: Activity[],
  categories: readonly ProgramCategoryDefinition[] = MAIN_PROGRAM_CATEGORIES,
): DonutChartSegment[] {
  const totals: Record<string, { totalPagu: number; count: number; color: string }> = {};

  categories.forEach((cat) => {
    totals[cat.name] = {
      totalPagu: 0,
      count: 0,
      color: resolveCategoryColor(cat),
    };
  });

  activities.forEach((act) => {
    const category = resolveProgramCategory(act.kode, act.nama, act.programCategory);
    const configuredCategory = categories.find((cat) => cat.name === category);
    const color = configuredCategory ? resolveCategoryColor(configuredCategory) : PROGRAM_COLORS[category] || "var(--chart-5)";

    if (!totals[category]) {
      totals[category] = {
        totalPagu: 0,
        count: 0,
        color: color,
      };
    }

    totals[category].totalPagu += act.pagu || 0;
    totals[category].count += 1;
  });

  const grandTotal = Object.values(totals).reduce((sum, item) => sum + item.totalPagu, 0);

  const segments: DonutChartSegment[] = Object.entries(totals)
    .filter(([, data]) => data.totalPagu > 0 || data.count > 0)
    .map(([name, data]) => {
      const pct = grandTotal > 0 ? (data.totalPagu / grandTotal) * 100 : 0;
      return {
        label: name,
        value: data.totalPagu,
        percentage: Number(pct.toFixed(1)),
        color: data.color,
      };
    });

  if (segments.length === 0) {
    return categories.map((c) => ({
      label: c.name,
      value: 0,
      percentage: 0,
      color: c.color || PROGRAM_COLORS[c.name] || "#64748B",
    }));
  }

  return segments;
}
