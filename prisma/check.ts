import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.count();
  const kegiatan = await prisma.kegiatan.count();
  const laporan = await prisma.laporan.count();
  const dokumen = await prisma.dokumen.count();
  const jenisKegiatan = await prisma.jenisKegiatan.count();
  const kegiatanWithJenis = await prisma.kegiatan.count({ where: { jenisKegiatanId: { not: null } } });
  
  console.log(`User: ${users}`);
  console.log(`Kegiatan: ${kegiatan}`);
  console.log(`Laporan: ${laporan}`);
  console.log(`Dokumen: ${dokumen}`);
  console.log(`JenisKegiatan: ${jenisKegiatan}`);
  console.log(`Kegiatan dengan jenisKegiatanId terisi: ${kegiatanWithJenis} / ${kegiatan}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());