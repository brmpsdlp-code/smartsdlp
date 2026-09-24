import ExcelJS from "exceljs";

export interface SmartReportItem {
  no: number;
  kode: string;
  nama: string;
  jenis: string;
  pj?: string;
  uraian: string;
  pagu: number;
  statusAnggaran: "Dibuka" | "Diblokir";
  realLalu: number;
  realIni: number;
  realSd?: number;
  pct?: number;
  sisa?: number;
}

const GREEN = "143D32";
const LIGHT_GREEN = "E6F4EA";
const WHITE = "FFFFFF";
const BORDER = "000000";
const MUTED = "374151";
const rupiahFormat = '"Rp "#,##0';
const stripMonthPrefix = (value: string) => value.replace(/^[^:]+:\s*/, "");

export async function generateSmartReportExcel(items: SmartReportItem[], periode = "Agustus 2026", fileName = "laporan_realisasi_smart.xlsx") {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan");
  sheet.views = [{ showGridLines: true }];

  sheet.addRows([
    ["BALAI BESAR PERAKITAN DAN MODERNISASI SUMBER DAYA LAHAN PERTANIAN"],
    ["BADAN PERAKITAN DAN MODERNISASI PERTANIAN"],
    ["KEMENTERIAN PERTANIAN REPUBLIK INDONESIA"],
    ["Jl. Tentara Pelajar No. 12, Cimanggu, Kota Bogor 16111 | Telp: (0251) 8321762 | Email: brmp.sdlahan@pertanian.go.id"],
    ["LAPORAN REALISASI ANGGARAN"],
    ["Periode Pelaporan", `: ${periode}`],
    ["Satuan Kerja", ": Balai Besar Perakitan dan Modernisasi Sumber Daya Lahan Pertanian (BRMP SDLP)"],
    [],
    ["No", "Kode", "Kegiatan", "Jenis Kegiatan", "Uraian Capaian Kegiatan", "Pagu Anggaran", "Status Anggaran", "Realisasi Anggaran", "", "", "", "Sisa Anggaran"],
    ["", "", "", "", "", "", "", "Periode Lalu", "Periode Ini", "s.d. Periode", "%", ""],
  ]);

  for (let row = 1; row <= 5; row++) sheet.mergeCells(row, 1, row, 12);
  sheet.mergeCells(6, 2, 6, 12);
  sheet.mergeCells(7, 2, 7, 12);
  [1, 2, 3, 4, 5, 6, 7, 12].forEach((column) => sheet.mergeCells(9, column, 10, column));
  sheet.mergeCells(9, 8, 9, 11);

  let totalPagu = 0, totalRealLalu = 0, totalRealIni = 0, totalRealSd = 0, totalSisa = 0;
  items.forEach((item, index) => {
    const realSd = item.realSd ?? item.realLalu + item.realIni;
    const pct = item.pct ?? (item.pagu > 0 ? (realSd / item.pagu) * 100 : 0);
    const sisa = item.sisa ?? item.pagu - realSd;
    totalPagu += item.pagu; totalRealLalu += item.realLalu; totalRealIni += item.realIni; totalRealSd += realSd; totalSisa += sisa;
    sheet.addRow([index + 1, item.kode, item.nama, item.jenis, stripMonthPrefix(item.uraian), item.pagu, item.statusAnggaran, item.realLalu, item.realIni, realSd, pct / 100, sisa]);
  });
  const totalRow = sheet.addRow(["", "", "TOTAL KESELURUHAN", `${items.length} Kegiatan Terdaftar`, "", totalPagu, "", totalRealLalu, totalRealIni, totalRealSd, totalPagu > 0 ? totalRealSd / totalPagu : 0, totalSisa]);

  const footerRow = totalRow.number + 2;
  sheet.mergeCells(footerRow, 2, footerRow, 7);
  sheet.mergeCells(footerRow, 8, footerRow, 12);
  sheet.getCell(footerRow, 2).value = "Sistem Informasi SMART — BRMP Sumber Daya Lahan Pertanian — Kementerian Pertanian RI";
  sheet.getCell(footerRow, 8).value = "Dokumen Resmi Laporan SMART — BRMP SDLP Kementan RI";

  [6, 22, 36, 14, 48, 22, 15, 18, 18, 18, 10, 22].forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = { top: { style: "thin", color: { argb: BORDER } }, left: { style: "thin", color: { argb: BORDER } }, bottom: { style: "thin", color: { argb: BORDER } }, right: { style: "thin", color: { argb: BORDER } } };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
    if (rowNumber <= 5) {
      row.eachCell((cell) => { cell.font = { bold: true, color: { argb: rowNumber === 1 ? GREEN : "000000" } }; cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; });
    }
    if (rowNumber === 5) row.eachCell((cell) => { cell.font = { bold: true, color: { argb: "000000" }, underline: "single" }; });
    if (rowNumber >= 9 && rowNumber <= 10) {
      row.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } }; cell.font = { bold: true, color: { argb: WHITE } }; cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; });
    }
  });
  [6, 7].forEach((rowNumber) => { sheet.getCell(rowNumber, 1).font = { bold: true, color: { argb: MUTED } }; sheet.getCell(rowNumber, 2).font = { bold: true, color: { argb: "000000" } }; });
  totalRow.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GREEN } }; cell.font = { bold: true }; });
  [sheet.getCell(footerRow, 2), sheet.getCell(footerRow, 8)].forEach((cell) => { cell.border = { top: { style: "thin", color: { argb: "9CA3AF" } } }; cell.font = { size: 9, color: { argb: "4B5563" } }; });
  for (let row = 11; row <= totalRow.number; row++) {
    [6, 8, 9, 10, 12].forEach((column) => { sheet.getCell(row, column).numFmt = rupiahFormat; });
    sheet.getCell(row, 11).numFmt = "0.0%";
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
}
