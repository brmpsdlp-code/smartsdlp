import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const berkas = [];
const telusuri = (dir) => {
  for (const nama of readdirSync(dir)) {
    const p = join(dir, nama);
    if (nama === "node_modules" || nama === "generated" || nama.startsWith(".")) continue;
    if (statSync(p).isDirectory()) telusuri(p);
    else if (nama.endsWith(".test.ts")) berkas.push(p);
  }
};
telusuri("src"); telusuri("prisma");
let gagal = 0;
for (const f of berkas.sort()) {
  const r = spawnSync("npx", ["tsx", f], { encoding: "utf8", env: process.env, shell: process.platform === "win32" });
  const ok = r.status === 0;
  if (!ok) gagal++;
  console.log(`${ok ? "OK    " : "GAGAL "} ${f}`);
  if (!ok) console.log((r.stdout + r.stderr).split("\n").slice(-6).join("\n"));
}
console.log(`\n${berkas.length - gagal}/${berkas.length} berkas lolos`);
process.exit(gagal ? 1 : 0);

