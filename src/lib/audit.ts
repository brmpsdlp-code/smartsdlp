import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type AuditClient = Prisma.TransactionClient | typeof prisma;

export async function recordAdminAudit(
  input: {
    action: string;
    adminName: string;
    adminEmail: string;
    namaKegiatan?: string;
    kodeKegiatan?: string;
    alasan?: string;
  },
  client: AuditClient = prisma,
) {
  await client.auditLog.create({
    data: {
      action: input.action,
      namaFile: "-",
      kodeKegiatan: input.kodeKegiatan ?? "-",
      namaKegiatan: input.namaKegiatan ?? "-",
      pemilikNama: "-",
      pemilikEmail: "-",
      adminNama: input.adminName,
      adminEmail: input.adminEmail,
      alasan: input.alasan ?? "-",
      notifStatus: "TIDAK BERLAKU",
    },
  });
}
