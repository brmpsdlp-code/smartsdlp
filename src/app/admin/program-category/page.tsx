import { prisma } from "@/lib/prisma";
import { ProgramCategoryManager } from "@/features/program-category/components/program-category-manager";
export default async function Page() {
  const rows = await prisma.programCategory.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { kegiatan: true } } } });
  return <ProgramCategoryManager categories={rows} />;
}
