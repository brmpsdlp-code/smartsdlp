import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const rawUrl =
    process.env.DATABASE_URL ??
    (isDevelopment ? "mysql://root:root@127.0.0.1:3306/smartsdlp" : undefined);

  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL wajib dikonfigurasi di lingkungan non-development.",
    );
  }

  const url = new URL(rawUrl);

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
  });

  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
