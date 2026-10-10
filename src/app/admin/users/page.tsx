import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/active-session";
import { prisma } from "@/lib/prisma";
import { ManajemenUserPage } from "@/features/users/components/manajemen-user-page";

export default async function Page() {
  const session = await getActiveSession();
  if (!session) redirect("/login?error=inactive");
  if (session.user.role?.toLowerCase() !== "admin") redirect("/dashboard");
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, nip: true, role: true, isActive: true },
    orderBy: { name: "asc" },
  });
  return <ManajemenUserPage users={users} currentUserId={session.user.id} />;
}
