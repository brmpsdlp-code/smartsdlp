import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type DbOperation =
  | "clearAllAuthAttempts"
  | "clearPjAuthAttempts"
  | "cleanupE2EData"
  | "getPjUser"
  | "getAdminUser"
  | "getUserPasswordState"
  | "readDeadline"
  | "setDeadline"
  | "restoreDeadline"
  | "findActiveCategory"
  | "findActivity"
  | "findReports";

export async function db<T>(operation: DbOperation, input: Record<string, unknown> = {}): Promise<T> {
  const script = `
    import { prisma } from "./src/lib/prisma.ts";
    const input = JSON.parse(process.env.E2E_DB_INPUT || "{}");
    let result;
    switch (process.env.E2E_DB_OPERATION) {
      case "clearAllAuthAttempts":
        result = await prisma.authAttempt.deleteMany({});
        break;
      case "clearPjAuthAttempts":
        result = await prisma.authAttempt.deleteMany({ where: { identifier: input.email.toLowerCase(), kind: "LOGIN" } });
        break;
      case "cleanupE2EData": {
        const protectedPjEmail = input.pjEmail?.trim().toLowerCase();
        result = await prisma.$transaction(async (tx) => {
          await tx.kegiatan.deleteMany({ where: { OR: [{ kode: { startsWith: "[E2E]" } }, { nama: { startsWith: "[E2E]" } }] } });
          await tx.programCategory.deleteMany({ where: { name: { startsWith: "[E2E]" } } });
          return tx.user.deleteMany({ where: { AND: [ ...(protectedPjEmail ? [{ email: { not: protectedPjEmail } }] : []), { OR: [{ name: { startsWith: "[E2E]" } }, { email: { startsWith: "e2e-" } }] } ] } });
        });
        break;
      }
      case "getPjUser":
        result = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true, name: true, email: true } });
        break;
      case "getAdminUser":
        result = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true, name: true, email: true, role: true } });
        break;
      case "getUserPasswordState":
        result = await prisma.user.findUnique({ where: { email: input.email }, select: { mustChangePassword: true } });
        break;
      case "readDeadline":
        result = await prisma.appSettings.findFirst({ select: { reportDeadlineDay: true, reportDeadlineTime: true } }) ?? { reportDeadlineDay: 25, reportDeadlineTime: "23:59" };
        break;
      case "setDeadline":
        result = await prisma.appSettings.findFirst({ select: { reportDeadlineDay: true, reportDeadlineTime: true } }) ?? { reportDeadlineDay: 25, reportDeadlineTime: "23:59" };
        await prisma.appSettings.upsert({ where: { id: "global" }, update: { reportDeadlineDay: input.day, reportDeadlineTime: input.time }, create: { id: "global", reportDeadlineDay: input.day, reportDeadlineTime: input.time } });
        break;
      case "restoreDeadline":
        result = await prisma.appSettings.upsert({ where: { id: "global" }, update: { reportDeadlineDay: input.day, reportDeadlineTime: input.time }, create: { id: "global", reportDeadlineDay: input.day, reportDeadlineTime: input.time } });
        break;
      case "findActiveCategory":
        result = await prisma.programCategory.findFirst({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true } });
        break;
      case "findActivity":
        result = await prisma.kegiatan.findUnique({ where: { kode: input.kode }, select: { id: true } });
        break;
      case "findReports":
        result = await prisma.laporan.findMany({ where: { kegiatanId: input.kegiatanId, periodeBulan: input.month, periodeTahun: input.year }, select: { uraian: true, realIni: true } });
        break;
      default:
        throw new Error("Unknown DB operation");
    }
    console.log(JSON.stringify(result, (_, value) => typeof value === "bigint" ? Number(value) : value));
    await prisma.$disconnect();
  `;
  const { stdout } = await execFileAsync("bun", ["--env-file=.env", "-e", script], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      E2E_DB_OPERATION: operation,
      E2E_DB_INPUT: JSON.stringify(input),
    },
    maxBuffer: 2 * 1024 * 1024,
  });
  const line = stdout.trim().split("\n").at(-1);
  if (!line) throw new Error(`Empty DB result for ${operation}`);
  return JSON.parse(line) as T;
}
