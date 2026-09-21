import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/active-session";
import { prisma } from "@/lib/prisma";
import { JenisKegiatanPage } from "@/features/jenis-kegiatan/components/jenis-kegiatan-page";

export default async function Page() {
  const session = await getActiveSession();
  if (!session) redirect("/login?error=inactive");
  if (session.user.role?.toLowerCase() !== "admin") redirect("/dashboard");

  const jenis = await prisma.jenisKegiatan.findMany({
    include: { _count: { select: { kegiatan: true } } },
    orderBy: { nama: "asc" },
  });

  return <JenisKegiatanPage data={jenis} />;
}
