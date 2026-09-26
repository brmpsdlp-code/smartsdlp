import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/active-session";
import { ChangePasswordPage } from "@/features/users/components/change-password-page";

export default async function Page() {
  const session = await getActiveSession();
  if (!session) redirect("/login?error=inactive");
  return <ChangePasswordPage />;
}
