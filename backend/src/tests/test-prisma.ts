import "dotenv/config";

import { prisma } from "../database/prisma.js";

async function main() {
  await prisma.$queryRaw`SELECT 1`;

  console.log("✅ Prisma connected successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });