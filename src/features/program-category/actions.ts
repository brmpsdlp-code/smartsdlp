"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/active-session";
import { revalidatePath } from "next/cache";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { recordAdminAudit } from "@/lib/audit";

const fallback = "Program Lainnya/Unassigned";

export async function createProgramCategory(input: { name: string }) {
  const admin = await requireAdminSession();
  try {
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
    await recordAdminAudit({ action: "CREATE_PROGRAM_CATEGORY", adminName: admin.user.name, adminEmail: admin.user.email, alasan: `Kategori: ${name}` });
    revalidatePath("/admin/master");
    return { success: true, category };
  } catch (error) {
    console.error("Gagal membuat kategori program:", error);
    return { success: false, error: "Gagal membuat kategori program." };
  }
}

export async function updateProgramCategory(id: string, input: { name: string; sortOrder: number; colorKey: string; isActive: boolean }) {
  const admin = await requireAdminSession();
  try {
    const name = input.name.trim();
    const current = await prisma.programCategory.findUnique({ where: { id } });
    if (!current || current.name === fallback || !name || name === fallback) return { success: false, error: "Kategori fallback tidak boleh diubah." };
    const exists = await prisma.programCategory.findFirst({ where: { name: { equals: name, mode: "insensitive" }, NOT: { id } } });
    if (exists) return { success: false, error: "Nama kategori sudah digunakan." };
    await prisma.programCategory.update({ where: { id }, data: { name, sortOrder: input.sortOrder, colorKey: input.colorKey.trim() || "muted", isActive: input.isActive } });
    await recordAdminAudit({ action: "UPDATE_PROGRAM_CATEGORY", adminName: admin.user.name, adminEmail: admin.user.email, alasan: `Kategori: ${name}` });
    revalidatePath("/admin/master");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengubah kategori program:", error);
    return { success: false, error: "Gagal mengubah kategori program." };
  }
}

export async function deleteProgramCategory(id: string) {
  const admin = await requireAdminSession();
  try {
    const row = await prisma.programCategory.findUnique({ where: { id } });
    if (!row || row.name === fallback) return { success: false, error: "Kategori fallback tidak boleh dihapus." };
    const used = await prisma.kegiatan.count({ where: { programCategoryId: id } });
    if (used) return { success: false, error: "Kategori masih digunakan kegiatan." };
    await prisma.programCategory.delete({ where: { id } });
    await recordAdminAudit({ action: "DELETE_PROGRAM_CATEGORY", adminName: admin.user.name, adminEmail: admin.user.email, alasan: `Kategori: ${row.name}` });
    revalidatePath("/admin/master");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus kategori program:", error);
    return { success: false, error: "Gagal menghapus kategori program." };
  }
}
