import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.count();
  const kegiatan = await prisma.kegiatan.count();
  const laporan = await prisma.laporan.count();
  const dokumen = await prisma.dokumen.count();
  const programCategories = await prisma.programCategory.count();
  const kegiatanRows = await prisma.kegiatan.findMany({
    select: { kode: true, jenis: true, programCategoryRef: { select: { name: true } } },
    orderBy: { kode: "asc" },
  });

  console.log(`User: ${users}`);
  console.log(`Kegiatan: ${kegiatan}`);
  console.log(`Laporan: ${laporan}`);
  console.log(`Dokumen: ${dokumen}`);
  console.log(`ProgramCategory: ${programCategories}`);
  console.log("Kegiatan:", kegiatanRows);
}
main().catch(console.error).finally(() => prisma.$disconnect());