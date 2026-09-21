import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JenisKegiatanPage } from "@/features/jenis-kegiatan/components/jenis-kegiatan-page";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  if (session.user.role?.toLowerCase() !== "admin") redirect("/dashboard");

  const jenis = await prisma.jenisKegiatan.findMany({
    include: { _count: { select: { kegiatan: true } } },
    orderBy: { nama: "asc" },
  });

  return <JenisKegiatanPage data={jenis} />;
}
