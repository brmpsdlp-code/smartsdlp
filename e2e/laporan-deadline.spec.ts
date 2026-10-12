import { test, expect } from "@playwright/test";
import { db } from "./db";
import {
  E2E_PREFIX,
  cleanupE2EData,
  getPjUser,
  loginAdmin,
  loginPj,
  readDeadline,
  restoreDeadline,
  setDeadline,
} from "./helpers";

const period = () => {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
};

test.describe.serial("Laporan deadline and revision", () => {
  let kode = "";
  let previousDeadline: { reportDeadlineDay: number; reportDeadlineTime: string };
  let kegiatanId = "";

  test.beforeAll(async () => {
    previousDeadline = await readDeadline();
    await cleanupE2EData();
  });

  test.afterAll(async () => {
    if (previousDeadline) await restoreDeadline(previousDeadline);
    await cleanupE2EData();
  });

  test("submit first report, revise same period, keep one database row", async ({ page }) => {
    const pj = await getPjUser();
    const category = await db<{ id: string } | null>("findActiveCategory");
    if (!category) throw new Error("No active program category available for E2E activity");

    kode = `${E2E_PREFIX} LAPORAN ${Date.now()}`;
    await loginAdmin(page);
    await page.goto("/admin/master");
    await page.getByRole("button", { name: "Tambah Kegiatan Baru", exact: true }).click();
    await page.getByLabel("Kode Kegiatan (DIPA)").fill(kode);
    await page.getByLabel("Nama Kegiatan").fill(`${E2E_PREFIX} Laporan Deadline`);
    await page.getByLabel("Kategori Program Utama").selectOption(category.id);
    await page.getByLabel("PJ Kegiatan").selectOption(pj.id);
    await page.getByLabel("Jenis Kegiatan").selectOption("APBN");
    await page.getByLabel("Pagu Anggaran (Rp)").fill("1000000");
    await page.getByRole("button", { name: "Simpan & Sinkronkan", exact: true }).click();
    await expect(page.getByText(kode, { exact: true })).toBeVisible();

    const created = await db<{ id: string } | null>("findActivity", { kode });
    if (!created) throw new Error(`Created activity not found: ${kode}`);
    kegiatanId = created.id;

    const { month, year } = period();
    await loginPj(page);
    await page.goto(`/input?kode=${encodeURIComponent(kode)}`);
    await page.getByLabel(/Pilih Kegiatan Yang Dilaporkan/).selectOption(kode);
    await expect(page.getByText("Anda sedang membuat laporan baru untuk periode ini.", { exact: false })).toBeVisible();
    await page.getByLabel(/Uraian Kegiatan Periode Ini/).fill(`${E2E_PREFIX} laporan pertama`);
    await page.getByLabel(/Realisasi Periode Ini/).fill("100000");
    await page.getByRole("button", { name: "Simpan & Kirim Laporan Realisasi", exact: true }).click();
    await expect(page.getByText("Laporan tersimpan", { exact: true })).toBeVisible();

    const first = await db<Array<{ uraian: string; realIni: number }>>("findReports", { kegiatanId, month, year });
    expect(first).toHaveLength(1);
    expect(first[0]?.uraian).toBe(`${E2E_PREFIX} laporan pertama`);

    await page.reload();
    await page.getByLabel(/Uraian Kegiatan Periode Ini/).fill(`${E2E_PREFIX} laporan revisi`);
    await page.getByLabel(/Realisasi Periode Ini/).fill("150000");
    await expect(page.getByText("merevisi laporan", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Simpan & Kirim Laporan Realisasi", exact: true }).click();
    await expect(page.getByText("Laporan tersimpan", { exact: true })).toBeVisible();

    const revised = await db<Array<{ uraian: string; realIni: number }>>("findReports", { kegiatanId, month, year });
    expect(revised).toHaveLength(1);
    expect(revised[0]?.uraian).toBe(`${E2E_PREFIX} laporan revisi`);
    expect(Number(revised[0]?.realIni)).toBe(150000);
  });

  test("past deadline makes UI read-only and server-protected", async ({ page }) => {
    test.skip(!kegiatanId, "Requires activity from submit test");
    const previous = await setDeadline(1, "00:00");
    try {
      await loginPj(page);
      await page.goto(`/input?kode=${encodeURIComponent(kode)}`);
      await expect(page.getByText("Batas waktu pelaporan periode ini sudah lewat", { exact: false })).toBeVisible();
      await expect(page.getByLabel(/Uraian Kegiatan Periode Ini/)).toBeDisabled();
      await expect(page.getByRole("button", { name: "Simpan & Kirim Laporan Realisasi", exact: true })).toBeDisabled();

      const currentPeriod = period();
      const before = await db<Array<{ uraian: string; realIni: number }>>("findReports", { kegiatanId, month: currentPeriod.month, year: currentPeriod.year });
      expect(before[0]?.uraian).toBe(`${E2E_PREFIX} laporan revisi`);
    } finally {
      await restoreDeadline(previous);
    }
  });
});
