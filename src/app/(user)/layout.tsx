import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (session.user.role?.toLowerCase() === "admin")
    redirect("/admin/dashboard");

  return (
    <div className="flex h-screen w-screen overflow-hidden print:h-auto print:overflow-visible print:w-auto bg-slate-50 print:bg-white">
      <div className="print:hidden">
        <Sidebar role="user" />
      </div>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden print:overflow-visible print:block">
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 pt-14 lg:pt-5 max-w-[1400px] w-full mx-auto print:p-0 print:m-0 print:max-w-none print:overflow-visible print:block">
          {children}
        </main>
      </div>
    </div>
  );
}
