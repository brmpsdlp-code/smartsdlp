"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const nameSchema = z.string().trim().min(1, "Nama jenis kegiatan wajib diisi");

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role?.toLowerCase() !== "admin") {
    return { error: "Hanya admin yang bisa mengelola jenis kegiatan." };
  }
  return { session };
}

function isBuiltIn(name: string) {
  return name === "APBN" || name === "NON_APBN";
}

async function findCaseInsensitiveName(name: string, excludeId?: string) {
  return prisma.jenisKegiatan.findFirst({
    where: {
      nama: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
  });
}

export async function createJenisKegiatan(input: { nama: string }) {
  const admin = await requireAdmin();
  if (admin.error) return { success: false as const, error: admin.error };
  const parsed = nameSchema.safeParse(input.nama);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };
  if (await findCaseInsensitiveName(parsed.data)) {
    return { success: false as const, error: "Nama jenis kegiatan sudah digunakan." };
  }
  const jenis = await prisma.jenisKegiatan.create({ data: { nama: parsed.data } });
  revalidatePath("/admin/jenis-kegiatan");
  revalidatePath("/admin/master");
  return { success: true as const, jenis };
}

export async function updateJenisKegiatan(input: { id: string; nama: string }) {
  const admin = await requireAdmin();
  if (admin.error) return { success: false as const, error: admin.error };
  const parsed = nameSchema.safeParse(input.nama);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };
  const target = await prisma.jenisKegiatan.findUnique({ where: { id: input.id } });
  if (!target) return { success: false as const, error: "Jenis kegiatan tidak ditemukan." };
  if (isBuiltIn(target.nama)) {
    return { success: false as const, error: "Jenis bawaan APBN dan NON_APBN tidak boleh diubah." };
  }
  if (await findCaseInsensitiveName(parsed.data, input.id)) {
    return { success: false as const, error: "Nama jenis kegiatan sudah digunakan." };
  }
  const jenis = await prisma.jenisKegiatan.update({ where: { id: input.id }, data: { nama: parsed.data } });
  revalidatePath("/admin/jenis-kegiatan");
  revalidatePath("/admin/master");
  return { success: true as const, jenis };
}

export async function deleteJenisKegiatan(id: string) {
  const admin = await requireAdmin();
  if (admin.error) return { success: false as const, error: admin.error };
  const target = await prisma.jenisKegiatan.findUnique({ where: { id }, include: { _count: { select: { kegiatan: true } } } });
  if (!target) return { success: false as const, error: "Jenis kegiatan tidak ditemukan." };
  if (isBuiltIn(target.nama)) {
    return { success: false as const, error: "Jenis bawaan APBN dan NON_APBN tidak boleh dihapus." };
  }
  if (target._count.kegiatan > 0) {
    return { success: false as const, error: "Jenis kegiatan masih dipakai kegiatan dan tidak boleh dihapus." };
  }
  await prisma.jenisKegiatan.delete({ where: { id } });
  revalidatePath("/admin/jenis-kegiatan");
  revalidatePath("/admin/master");
  return { success: true as const };
}
