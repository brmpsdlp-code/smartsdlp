"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/active-session";
import { createLocalAccountIssuer } from "@better-auth/core/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
});

export async function createAdminUser(input: { name: string; email: string }) {
  const admin = await requireAdminSession();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0].message };
  const existing = await prisma.user.findFirst({ where: { email: { equals: parsed.data.email, mode: "insensitive" } } });
  if (existing) return { success: false as const, error: "Email sudah digunakan, termasuk oleh akun nonaktif." };

  const context = await auth.$context;
  const password = crypto.randomUUID();
  const user = await context.internalAdapter.createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    emailVerified: false,
    role: "USER",
    isActive: true,
  }, { method: "admin" });
  const passwordHash = await context.password.hash(password);
  await context.internalAdapter.createAccount({
    accountId: user.id,
    providerId: "credential",
    issuer: createLocalAccountIssuer("credential"),
    userId: user.id,
    password: passwordHash,
  });
  revalidatePath("/admin/users");
  return { success: true as const, user: { id: user.id, name: user.name, email: user.email }, adminSessionId: admin.session.id };
}

export async function setUserActive(userId: string, isActive: boolean) {
  const admin = await requireAdminSession();
  if (userId === admin.user.id) return { success: false as const, error: "Admin tidak boleh menonaktifkan dirinya sendiri." };
  const result = await prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!target) return { success: false as const, error: "User tidak ditemukan." };
    if (!isActive && target.role === "ADMIN") {
      const activeAdmins = await tx.user.count({ where: { role: "ADMIN", isActive: true } });
      if (activeAdmins <= 1) return { success: false as const, error: "Admin aktif terakhir tidak boleh dinonaktifkan." };
    }
    await tx.user.update({ where: { id: userId }, data: { isActive } });
    if (!isActive) await tx.session.deleteMany({ where: { userId } });
    return { success: true as const };
  });
  revalidatePath("/admin/users");
  return result;
}
