import { prisma } from "@/lib/prisma";

const RULES = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 },
  RESET_PASSWORD: { windowMs: 60 * 60 * 1000, max: 3 },
} as const;

export async function checkAuthRateLimit(identifier: string, kind: keyof typeof RULES) {
  const normalized = identifier.trim().toLowerCase();
  const rule = RULES[kind];
  const cutoff = new Date(Date.now() - rule.windowMs);
  await prisma.authAttempt.deleteMany({ where: { identifier: normalized, kind, attemptedAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } } });
  const latest = await prisma.authAttempt.findFirst({ where: { identifier: normalized, kind, attemptedAt: { gte: cutoff } }, orderBy: { attemptedAt: "asc" }, select: { attemptedAt: true } });
  const count = await prisma.authAttempt.count({ where: { identifier: normalized, kind, attemptedAt: { gte: cutoff } } });
  const retryAfterSeconds = latest ? Math.max(1, Math.ceil((latest.attemptedAt.getTime() + rule.windowMs - Date.now()) / 1000)) : 0;
  return { allowed: count < rule.max, remaining: Math.max(0, rule.max - count), retryAfterSeconds };
}

export async function recordAuthAttempt(identifier: string, kind: keyof typeof RULES) {
  await prisma.authAttempt.create({ data: { identifier: identifier.trim().toLowerCase(), kind } });
}
