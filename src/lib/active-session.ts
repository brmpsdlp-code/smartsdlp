import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getActiveSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { isActive: true } });
  return user?.isActive ? session : null;
}

export async function requireActiveSession() {
  const session = await getActiveSession();
  if (!session) throw new Error("Sesi tidak valid atau akun tidak aktif.");
  return session;
}

export async function requireAdminSession() {
  const session = await requireActiveSession();
  if (session.user.role?.toLowerCase() !== "admin") throw new Error("Hanya admin yang diizinkan.");
  return session;
}
