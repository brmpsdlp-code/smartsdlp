import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, isActive: true } });
  console.log(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
