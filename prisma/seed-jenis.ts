import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding JenisKegiatan...");
  const apbn = await prisma.jenisKegiatan.upsert({
    where: { nama: "APBN" },
    update: {},
    create: { nama: "APBN" },
  });
  const nonApbn = await prisma.jenisKegiatan.upsert({
    where: { nama: "NON_APBN" },
    update: {},
    create: { nama: "NON_APBN" },
  });

  console.log("Backfilling Kegiatan...");
  const kegiatanApbn = await prisma.kegiatan.updateMany({
    where: { jenis: "APBN" },
    data: { jenisKegiatanId: apbn.id },
  });
  const kegiatanNon = await prisma.kegiatan.updateMany({
    where: { jenis: "NON_APBN" },
    data: { jenisKegiatanId: nonApbn.id },
  });

  console.log(`Updated APBN: ${kegiatanApbn.count}, NON_APBN: ${kegiatanNon.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });