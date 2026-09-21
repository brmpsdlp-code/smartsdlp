// src/app/page.tsx
import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/active-session";

export default async function Home() {
  const session = await getActiveSession();

  if (!session) redirect("/login?error=inactive");

  const isAdmin = session.user.role?.toLowerCase() === "admin";
  redirect(isAdmin ? "/admin/dashboard" : "/dashboard");
}
