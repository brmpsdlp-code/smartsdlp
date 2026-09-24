import { prisma } from "@/lib/prisma";
import { getCategoryColor } from "@/lib/category-colors";

const categories = await prisma.programCategory.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: "asc" },
  select: { name: true, colorKey: true },
});

const seen = new Map<string, string>();
for (const category of categories) {
  const hex = getCategoryColor(category.colorKey);
  const duplicate = seen.get(hex);
  console.log(`${category.name} → ${category.colorKey} → ${hex}${duplicate ? ` DUPLICATE OF ${duplicate}` : ""}`);
  seen.set(hex, category.name);
}

const duplicates = categories.length - new Set(categories.map((category) => getCategoryColor(category.colorKey))).size;
console.log(`Active categories: ${categories.length}`);
console.log(`Duplicate hex colors: ${duplicates}`);
if (duplicates > 0) process.exitCode = 1;
await prisma.$disconnect();
