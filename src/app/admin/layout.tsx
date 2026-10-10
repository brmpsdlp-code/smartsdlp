import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/active-session";
import { Sidebar } from "@/components/Sidebar";
import { getMyNotifications } from "@/features/notifications/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getActiveSession();

  if (!session) redirect("/login?error=inactive");
  if (session.user.role?.toLowerCase() !== "admin") redirect("/dashboard");
  if (session.user.mustChangePassword) redirect("/account/change-password");
  const notifications = await getMyNotifications();

  return (
    <div className="flex h-screen w-screen overflow-hidden print:h-auto print:overflow-visible print:w-auto bg-slate-50 print:bg-white">
      <div className="print:hidden">
        <Sidebar role="admin" notifications={notifications.items} userProfile={{ nama: session.user.name, nip: session.user.nip ?? "", email: session.user.email, jabatan: session.user.jabatan ?? "", unitKerja: session.user.unitKerja ?? "", role: "admin" }} />
      </div>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden print:overflow-visible print:block">
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 max-w-350 w-full mx-auto mt-10 lg:mt-0 print:p-0 print:m-0 print:max-w-none print:overflow-visible print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
