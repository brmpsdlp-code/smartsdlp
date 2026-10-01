import ExcelJS from "exceljs";
import { readFile, unlink } from "node:fs/promises";

const file = "excel-export-test.xlsx";
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet("Laporan");
const safeText = (value) => /^[=+\-@]/.test(value) ? `'${value}` : value;
sheet.addRow([safeText("7912.SDA.015.051A"), safeText("=gajian"), safeText("APBN"), safeText("asekk gaji cairr"), safeText("Dibuka")]);
await workbook.xlsx.writeFile(file);
const check = new ExcelJS.Workbook();
await check.xlsx.load(await readFile(file));
const values = check.getWorksheet("Laporan").getRow(1).values.slice(1);
console.log(JSON.stringify(values));
if (typeof values[0] !== "string" || values[0] !== "7912.SDA.015.051A") throw new Error("normal text failed");
if (typeof values[1] !== "string" || values[1] !== "'=gajian") throw new Error("formula-safe text failed");
await unlink(file);
