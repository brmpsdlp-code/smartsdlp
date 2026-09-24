import { prisma } from "@/lib/prisma";
import { CATEGORY_COLORS } from "@/lib/category-colors";

const palette = CATEGORY_COLORS.map((color) => color.key);

const categories = await prisma.programCategory.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: "asc" },
  select: { id: true, name: true, colorKey: true },
});

const used = new Set<string>();
await prisma.$transaction(async (tx) => {
  for (const category of categories) {
    const colorKey = palette.includes(category.colorKey as (typeof palette)[number]) && !used.has(category.colorKey)
      ? category.colorKey
      : palette.find((color) => !used.has(color)) ?? palette[used.size % palette.length];
    used.add(colorKey);
    if (colorKey !== category.colorKey) {
      await tx.programCategory.update({ where: { id: category.id }, data: { colorKey } });
    }
  }
});

await prisma.$disconnect();
console.log(`Migrated ${categories.length} active categories.`);
