import "dotenv/config";
import { createLocalAccountIssuer } from "@better-auth/core/db";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const email = "noreply.smartsdlp@gmail.com";
const password = "ubsi2026";

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  throw new Error(`Admin email already exists: ${email}`);
}

const context = await auth.$context;
const user = await context.internalAdapter.createUser(
  {
    name: "Administrator SMART",
    email,
    emailVerified: true,
    role: "ADMIN",
    isActive: true,
    mustChangePassword: false,
  },
  { method: "admin" },
);

try {
  const passwordHash = await context.password.hash(password);
  await context.internalAdapter.createAccount({
    accountId: user.id,
    providerId: "credential",
    issuer: createLocalAccountIssuer("credential"),
    userId: user.id,
    password: passwordHash,
  });
  console.log(`Bootstrap admin created: ${user.id} (${user.email})`);
} catch (error) {
  await context.internalAdapter.deleteUser(user.id);
  throw error;
} finally {
  await prisma.$disconnect();
}
