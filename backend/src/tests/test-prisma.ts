import "dotenv/config";
import { getPrisma } from "./vector/vector.repository.js";

async function main() {
  const prisma = getPrisma();

  await prisma.$queryRaw`SELECT 1`;

  console.log("✅ Prisma connected successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await getPrisma().$disconnect();
  });