"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/active-session";

export async function getReportDeadline() {
  const settings = await prisma.appSettings.findFirst();
  return { day: settings?.reportDeadlineDay ?? 25, time: settings?.reportDeadlineTime ?? "23:59" };
}

export async function updateReportDeadline(day: number, time: string) {
  await requireAdminSession();
  if (!Number.isInteger(day) || day < 1 || day > 31 || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return { success: false as const, error: "Hari harus 1-31 dan jam harus HH:mm." };
  }
  await prisma.appSettings.upsert({ where: { id: "global" }, update: { reportDeadlineDay: day, reportDeadlineTime: time }, create: { id: "global", reportDeadlineDay: day, reportDeadlineTime: time } });
  return { success: true as const };
}
