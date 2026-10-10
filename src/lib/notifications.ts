import { prisma } from "@/lib/prisma";

export async function createUserNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  href?: string;
}) {
  await prisma.notification.create({ data: input });
}
