"use server";

import { revalidatePath } from "next/cache";
import { getActiveSession } from "@/lib/active-session";
import { prisma } from "@/lib/prisma";

export async function getMyNotifications() {
  const session = await getActiveSession();
  if (!session) return { items: [], unreadCount: 0 };

  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.message,
      time: item.createdAt.toISOString(),
      href: item.href,
      read: Boolean(item.readAt),
    })),
    unreadCount: items.filter((item) => !item.readAt).length,
  };
}

export async function markMyNotificationsRead(ids?: string[]) {
  const session = await getActiveSession();
  if (!session) return { success: false as const };

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      ...(ids?.length ? { id: { in: ids } } : { readAt: null }),
    },
    data: { readAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/input");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

