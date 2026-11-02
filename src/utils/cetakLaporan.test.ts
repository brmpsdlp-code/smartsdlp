import assert from "node:assert/strict";
import {
  buatOpsiCetak,
  hitungBarisCetak,
  parsePeriodeCetak,
  periodeCetakLabel,
} from "./cetakLaporan";

const okt2026 = Date.UTC(2026, 9, 28, 3, 0);
const kegiatan = [
  {
    id: "a",
    kode: "A",
    nama: "Kegiatan A",
    jenis: "APBN",
    pj: "PJ A",
    fisik: 0,
    pagu: 1_000_000,
    statusAnggaran: "DIBUKA" as const,
    tahunAnggaran: 2026,
  },
  {
    id: "b",
    kode: "B",
    nama: "Kegiatan B",
    jenis: "APBN",
    pj: "PJ B",
    fisik: 0,
    pagu: 5_000_000,
    statusAnggaran: "DIBUKA" as const,
    tahunAnggaran: 2024,
  },
];
const laporan = [
  { kegiatanId: "a", periodeBulan: 10, periodeTahun: 2026, realIni: 250_000, fisik: 20, uraian: "Oktober" },
  { kegiatanId: "a", periodeBulan: 9, periodeTahun: 2026, realIni: 50_000, fisik: 10, uraian: "September" },
  { kegiatanId: "b", periodeBulan: 5, periodeTahun: 2024, realIni: 500_000, fisik: 30, uraian: "Mei" },
];

const okt = hitungBarisCetak(kegiatan, laporan, { type: "bulan", bulan: 10, tahun: 2026 }, okt2026);
assert.equal(okt.length, 1);
assert.equal(okt[0].pagu, 1_000_000);
assert.equal(okt[0].realIni, 250_000);
assert.equal(okt[0].sdPeriode, 300_000);

const penuh = hitungBarisCetak(kegiatan, laporan, { type: "tahun", tahun: 2024 }, okt2026);
assert.equal(penuh.length, 1);
assert.equal(penuh[0].kode, "B");
assert.equal(penuh[0].realIni, 500_000);
assert.equal(penuh[0].sdPeriode, 500_000);

assert.equal(parsePeriodeCetak("TA-2024", { type: "bulan", bulan: 1, tahun: 2026 }).type, "tahun");
assert.equal(periodeCetakLabel({ type: "tahun", tahun: 2024 }), "Tahun Penuh 2024");
assert.equal(buatOpsiCetak(2026, okt2026).semester.length, 2);
assert.equal(buatOpsiCetak(2026, okt2026).bulan.length, 10);

console.log("cetakLaporan checks passed");
