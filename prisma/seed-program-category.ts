import { prisma } from "../src/lib/prisma";

const categories = [
  { name: "Layanan Perkantoran", sortOrder: 1, colorKey: "green" },
  { name: "Fasilitas Kinerja", sortOrder: 2, colorKey: "green-light" },
  { name: "Klinik Modernisasi/KMP", sortOrder: 3, colorKey: "green-dark" },
  { name: "Alat & Sarana", sortOrder: 4, colorKey: "gold" },
  { name: "Program Lainnya/Unassigned", sortOrder: 5, colorKey: "muted" },
];

async function main() {
  for (const category of categories) {
    const row = await prisma.programCategory.upsert({
      where: { name: category.name },
      update: { sortOrder: category.sortOrder, colorKey: category.colorKey, isActive: true },
      create: category,
    });
    console.log(`${row.sortOrder}: ${row.name} (${row.id})`);
  }

  const rows = await prisma.kegiatan.findMany({
    where: { programCategory: { not: null }, programCategoryId: null },
    select: { id: true, kode: true, programCategory: true },
  });

  for (const kegiatan of rows) {
    const name = kegiatan.programCategory?.trim();
    if (!name) continue;
    const category = await prisma.programCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (!category) throw new Error(`Kategori tidak ditemukan untuk ${kegiatan.kode}: ${name}`);
    await prisma.kegiatan.update({
      where: { id: kegiatan.id },
      data: { programCategoryId: category.id },
    });
    console.log(`Backfilled ${kegiatan.kode} -> ${category.name}`);
  }

  const counts = await prisma.kegiatan.groupBy({
    by: ["programCategoryId"],
    _count: { _all: true },
  });
  console.log("Backfill counts:", counts);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
