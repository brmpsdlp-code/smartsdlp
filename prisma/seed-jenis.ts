import { prisma } from "../src/lib/prisma";

console.log("JenisKegiatan cleanup already applied; no seed required.");
await prisma.$disconnect();
