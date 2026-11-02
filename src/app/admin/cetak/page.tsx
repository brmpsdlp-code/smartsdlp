import { prisma } from "@/lib/prisma";
import { CetakLaporanPage } from "@/components/CetakLaporanPage";
import { daftarTahunFilter } from "@/utils/arsipFilter";
import { getWibYearMonth } from "@/utils/tahunAnggaran";
import {
  buatOpsiCetak,
  defaultPeriodeCetak,
  hitungBarisCetak,
  parsePeriodeCetak,
  periodeCetakLabel,
  periodeCetakValue,
} from "@/utils/cetakLaporan";

export default async function CetakPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string; tahun?: string }>;
}) {
  const params = await searchParams;
  const [kegiatanList, laporanList] = await Promise.all([
    prisma.kegiatan.findMany({
      include: { pj: { select: { name: true } } },
      orderBy: { kode: "asc" },
    }),
    prisma.laporan.findMany({
      orderBy: [{ periodeTahun: "asc" }, { periodeBulan: "asc" }],
    }),
  ]);

  const nowMs = new Date().getTime();
  const sekarang = getWibYearMonth(nowMs);
  const tahunOptions = daftarTahunFilter(
    kegiatanList.map((k) => k.tahunAnggaran),
    laporanList.map((l) => l.periodeTahun),
    sekarang.tahun,
  );
  const tahunParam = Number(params.tahun);
  const selectedYear = Number.isInteger(tahunParam) && tahunOptions.includes(tahunParam)
    ? tahunParam
    : sekarang.tahun;
  const fallback = defaultPeriodeCetak(selectedYear, nowMs);
  const parsed = parsePeriodeCetak(params.periode, fallback);
  const selection = parsed.tahun === selectedYear ? parsed : fallback;
  const options = buatOpsiCetak(selectedYear, nowMs);

  const reportRows = hitungBarisCetak(
    kegiatanList.map((k) => ({
      id: k.id,
      kode: k.kode,
      nama: k.nama,
      jenis: k.jenis,
      pj: k.pj?.name ?? null,
      fisik: k.fisik,
      pagu: k.pagu,
      statusAnggaran: k.statusAnggaran,
      tahunAnggaran: k.tahunAnggaran,
    })),
    laporanList.map((l) => ({
      kegiatanId: l.kegiatanId,
      periodeBulan: l.periodeBulan,
      periodeTahun: l.periodeTahun,
      realIni: l.realIni,
      fisik: l.fisik,
      uraian: l.uraian,
    })),
    selection,
    nowMs,
  );

  return (
    <CetakLaporanPage
      reportRows={reportRows}
      currentPeriode={periodeCetakValue(selection)}
      currentPeriodeLabel={periodeCetakLabel(selection)}
      yearOptions={tahunOptions}
      currentTahun={selectedYear}
      yearFullOptions={options.tahunPenuh}
      monthOptions={options.bulan}
      semesterOptions={options.semester}
    />
  );
}
