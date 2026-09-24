"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/active-session";
import { revalidatePath } from "next/cache";
import { CATEGORY_COLORS } from "@/lib/category-colors";

const fallback = "Program Lainnya/Unassigned";
async function guard() { await requireAdminSession(); }
export async function createProgramCategory(input: { name: string }) {
  await guard();
  const name = input.name.trim();
  if (!name || name.toLowerCase() === fallback.toLowerCase()) return { success: false, error: "Nama kategori tidak valid." };
  const exists = await prisma.programCategory.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (exists) return { success: false, error: "Nama kategori sudah digunakan." };
  const colors = CATEGORY_COLORS.map((color) => color.key);
  const category = await prisma.$transaction(async (tx) => {
    const last = await tx.programCategory.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
    const active = await tx.programCategory.findMany({ where: { isActive: true }, select: { colorKey: true } });
    const used = new Set(active.map((row) => row.colorKey));
    const colorKey = colors.find((color) => !used.has(color)) ?? colors[active.length % colors.length];
    return tx.programCategory.create({ data: { name, sortOrder: (last?.sortOrder ?? 0) + 1, colorKey } });
  });
  revalidatePath("/admin/master");
  return { success: true, category };
}
export async function updateProgramCategory(id: string, input: { name: string; sortOrder: number; colorKey: string; isActive: boolean }) {
  await guard(); const name = input.name.trim();
  const current = await prisma.programCategory.findUnique({ where: { id } });
  if (!current || current.name === fallback || !name || name === fallback) return { success: false, error: "Kategori fallback tidak boleh diubah." };
  const exists = await prisma.programCategory.findFirst({ where: { name: { equals: name, mode: "insensitive" }, NOT: { id } } });
  if (exists) return { success: false, error: "Nama kategori sudah digunakan." };
  await prisma.programCategory.update({ where: { id }, data: { name, sortOrder: input.sortOrder, colorKey: input.colorKey.trim() || "muted", isActive: input.isActive } });
  revalidatePath("/admin/master"); return { success: true };
}
export async function deleteProgramCategory(id: string) {
  await guard();
  try { await prisma.$transaction(async (tx) => { const row = await tx.programCategory.findUnique({ where: { id } }); if (!row || row.name === fallback) throw new Error("Kategori fallback tidak boleh dihapus."); const used = await tx.kegiatan.count({ where: { programCategoryId: id } }); if (used) throw new Error("Kategori masih digunakan kegiatan."); await tx.programCategory.delete({ where: { id } }); }); revalidatePath("/admin/master"); return { success: true }; } catch (e) { return { success: false, error: e instanceof Error ? e.message : "Kategori gagal dihapus." }; }
}
