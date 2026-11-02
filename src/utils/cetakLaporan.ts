import {
  getWibYearMonth,
  isPeriodeSudahBerjalan,
} from "./tahunAnggaran";
import {
  statusKepatuhan,
  type StatusKepatuhan,
} from "./dashboardAdmin";
import { NAMA_BULAN } from "./reportAccess";

export type PeriodeCetak =
  | { type: "bulan"; bulan: number; tahun: number }
  | { type: "semester"; semester: 1 | 2; tahun: number }
  | { type: "tahun"; tahun: number };

export type OpsiCetak = { value: string; label: string };

export type KegiatanCetak = {
  id: string;
  kode: string;
  nama: string;
  jenis: string | null;
  pj: string | null;
  fisik: number | null;
  pagu: number | bigint;
  statusAnggaran: "DIBUKA" | "DIBLOKIR";
  tahunAnggaran: number;
};

export type LaporanCetak = {
  kegiatanId: string;
  periodeBulan: number;
  periodeTahun: number;
  realIni: number | bigint;
  fisik: number | null;
  uraian: string;
};

export type BarisCetak = {
  no: number;
  kode: string;
  nama: string;
  jenis: string;
  pj: string;
  uraian: string;
  fisik: number;
  pagu: number;
  statusAnggaran: "Dibuka" | "Diblokir";
  realLalu: number;
  realIni: number;
  sdPeriode: number;
  pctSerapan: number;
  sisa: number;
  kepatuhan: StatusKepatuhan;
};

export function periodeCetakValue(selection: PeriodeCetak): string {
  if (selection.type === "bulan") return `${selection.bulan}-${selection.tahun}`;
  if (selection.type === "semester") return `S${selection.semester}-${selection.tahun}`;
  return `TA-${selection.tahun}`;
}

export function periodeCetakLabel(selection: PeriodeCetak): string {
  if (selection.type === "bulan") return `${NAMA_BULAN[selection.bulan - 1]} ${selection.tahun}`;
  if (selection.type === "semester") {
    return `Semester ${selection.semester === 1 ? "I" : "II"} ${selection.tahun}`;
  }
  return `Tahun Penuh ${selection.tahun}`;
}

export function parsePeriodeCetak(
  value: string | undefined,
  fallback: PeriodeCetak,
): PeriodeCetak {
  if (value?.startsWith("TA-")) {
    const tahun = Number(value.slice(3));
    if (Number.isInteger(tahun)) return { type: "tahun", tahun };
  }
  if (value?.startsWith("S1-") || value?.startsWith("S2-")) {
    const semester = value.startsWith("S1-") ? 1 : 2;
    const tahun = Number(value.slice(3));
    if (Number.isInteger(tahun)) return { type: "semester", semester, tahun };
  }
  if (value?.includes("-")) {
    const [bulan, tahun] = value.split("-").map(Number);
    if (Number.isInteger(bulan) && bulan >= 1 && bulan <= 12 && Number.isInteger(tahun)) {
      return { type: "bulan", bulan, tahun };
    }
  }
  return fallback;
}

export function defaultPeriodeCetak(tahun: number, nowMs: number): PeriodeCetak {
  const sekarang = getWibYearMonth(nowMs);
  if (tahun > sekarang.tahun) return { type: "tahun", tahun };
  return { type: "bulan", bulan: tahun === sekarang.tahun ? sekarang.bulan : 12, tahun };
}

export function buatOpsiCetak(tahun: number, nowMs: number): {
  tahunPenuh: OpsiCetak[];
  bulan: OpsiCetak[];
  semester: OpsiCetak[];
} {
  const sekarang = getWibYearMonth(nowMs);
  if (tahun > sekarang.tahun) return { tahunPenuh: [], bulan: [], semester: [] };

  const bulanTerakhir = tahun === sekarang.tahun ? sekarang.bulan : 12;
  const bulan = Array.from({ length: bulanTerakhir }, (_, index) => bulanTerakhir - index).map(
    (bulan) => ({ value: `${bulan}-${tahun}`, label: `${NAMA_BULAN[bulan - 1]} ${tahun}` }),
  );
  const semester: OpsiCetak[] = [
    { value: `S1-${tahun}`, label: `Semester I ${tahun}` },
  ];
  if (bulanTerakhir >= 7) {
    semester.push({ value: `S2-${tahun}`, label: `Semester II ${tahun}` });
  }
  return {
    tahunPenuh: [{ value: `TA-${tahun}`, label: `Tahun penuh ${tahun}` }],
    bulan,
    semester,
  };
}

function batasPeriode(selection: PeriodeCetak): { mulai: number; akhir: number } {
  if (selection.type === "bulan") {
    const index = selection.tahun * 12 + selection.bulan;
    return { mulai: index, akhir: index };
  }
  if (selection.type === "semester") {
    return {
      mulai: selection.tahun * 12 + (selection.semester === 1 ? 1 : 7),
      akhir: selection.tahun * 12 + (selection.semester === 1 ? 6 : 12),
    };
  }
  return { mulai: selection.tahun * 12 + 1, akhir: selection.tahun * 12 + 12 };
}

function dalamPeriode(
  laporan: Pick<LaporanCetak, "periodeBulan" | "periodeTahun">,
  range: { mulai: number; akhir: number },
): boolean {
  const index = laporan.periodeTahun * 12 + laporan.periodeBulan;
  return index >= range.mulai && index <= range.akhir;
}

export function hitungBarisCetak(
  kegiatanList: KegiatanCetak[],
  laporanList: LaporanCetak[],
  selection: PeriodeCetak,
  nowMs: number,
): BarisCetak[] {
  const range = batasPeriode(selection);
  return kegiatanList
    .filter((k) => k.tahunAnggaran === selection.tahun)
    .map((k, idx) => {
      const laporanKegiatan = laporanList.filter(
        (l) => l.kegiatanId === k.id && l.periodeTahun === k.tahunAnggaran,
      );
      const laporanDalamRange = laporanKegiatan
        .filter((l) => dalamPeriode(l, range))
        .sort((a, b) => a.periodeBulan - b.periodeBulan);
      const realLalu = laporanKegiatan
        .filter((l) => l.periodeTahun * 12 + l.periodeBulan < range.mulai)
        .reduce((sum, l) => sum + Number(l.realIni), 0);
      const realIni = laporanDalamRange.reduce((sum, l) => sum + Number(l.realIni), 0);
      const fisik = laporanDalamRange.length
        ? laporanDalamRange[laporanDalamRange.length - 1].fisik ?? 0
        : k.fisik ?? 0;
      const uraian = laporanDalamRange.length
        ? laporanDalamRange
            .map((l) => `${NAMA_BULAN[l.periodeBulan - 1]}: ${l.uraian}`)
            .join("; ")
        : "Belum ada laporan untuk periode ini.";
      const sdPeriode = realLalu + realIni;
      const pagu = Number(k.pagu);
      const periodeStatus = selection.type === "bulan"
        ? { bulan: selection.bulan, tahun: selection.tahun }
        : { bulan: selection.type === "semester" && selection.semester === 2 ? 7 : 1, tahun: selection.tahun };
      const kepatuhan = statusKepatuhan({
        diblokir: k.statusAnggaran === "DIBLOKIR",
        sudahLapor: laporanDalamRange.length > 0,
        periode: periodeStatus,
        nowMs,
      });
      return {
        no: idx + 1,
        kode: k.kode,
        nama: k.nama,
        jenis: k.jenis || "APBN",
        pj: k.pj || "Belum Ditugaskan",
        uraian,
        fisik,
        pagu,
        statusAnggaran: k.statusAnggaran === "DIBLOKIR" ? "Diblokir" : "Dibuka",
        realLalu,
        realIni,
        sdPeriode,
        pctSerapan: pagu > 0 ? (sdPeriode / pagu) * 100 : 0,
        sisa: pagu - sdPeriode,
        kepatuhan,
      };
    });
}

export function periodeCetakSudahBerjalan(selection: PeriodeCetak, nowMs: number): boolean {
  if (selection.type === "tahun") {
    return selection.tahun <= getWibYearMonth(nowMs).tahun;
  }
  return isPeriodeSudahBerjalan(nowMs, selection.type === "bulan" ? selection.bulan : selection.semester === 1 ? 1 : 7, selection.tahun);
}
