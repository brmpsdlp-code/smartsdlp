import { prisma } from "../src/lib/prisma";
const rows = await prisma.programCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { kegiatan: { select: { kode: true, nama: true } } } });
console.log(JSON.stringify(rows.map((r) => ({ id: r.id, name: r.name, sortOrder: r.sortOrder, colorKey: r.colorKey, isActive: r.isActive, createdAt: r.createdAt, updatedAt: r.updatedAt, usedBy: r.kegiatan })), null, 2));
await prisma.$disconnect();
