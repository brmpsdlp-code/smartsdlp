import { prisma } from "../src/lib/prisma";

const palette = ["green", "green-light", "green-dark", "gold", "muted", "govGreen", "govRed", "govBlue", "border"];

async function main() {
  const rows = await prisma.programCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true, colorKey: true } });
  console.log("before", rows);
  for (const [index, row] of rows.entries()) {
    const colorKey = palette[index % palette.length];
    if (row.colorKey !== colorKey) await prisma.programCategory.update({ where: { id: row.id }, data: { colorKey } });
  }
  console.log("after", await prisma.programCategory.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, colorKey: true } }));
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
