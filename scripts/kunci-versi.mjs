// Membaca versi persis dari bun.lock untuk setiap dependensi di package.json,
// lalu menuliskannya kembali sebagai versi TETAP (tanpa ^ atau ~).
import { readFileSync, writeFileSync } from "node:fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const mentah = readFileSync("bun.lock", "utf8").replace(/,(\s*[}\]])/g, "$1"); // bun.lock = JSONC dengan koma akhir
const lock = JSON.parse(mentah);
const versi = (nama) => {
  const entri = lock.packages?.[nama];
  if (!entri) return null;
  const id = Array.isArray(entri) ? entri[0] : String(entri); // contoh "better-auth@1.7.2"
  return id.slice(id.lastIndexOf("@") + 1);
};
let berubah = 0; const tidakDitemukan = [];
for (const kelompok of ["dependencies", "devDependencies"]) {
  for (const [nama, rentang] of Object.entries(pkg[kelompok] ?? {})) {
    const v = versi(nama);
    if (!v) { tidakDitemukan.push(nama); continue; }
    if (rentang !== v) {
      berubah++;
      if (process.argv.includes("--tulis")) pkg[kelompok][nama] = v;
      else console.log(`${nama.padEnd(34)} ${String(rentang).padEnd(12)} -> ${v}`);
    }
  }
}
if (process.argv.includes("--tulis")) {
  writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  console.log(`ditulis: ${berubah} dependensi dikunci`);
} else console.log(`\n${berubah} dependensi akan dikunci (jalankan dengan --tulis untuk menerapkan)`);
if (tidakDitemukan.length) console.log("TIDAK ADA di bun.lock:", tidakDitemukan.join(", "));

