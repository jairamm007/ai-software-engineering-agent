import "dotenv/config";
import { prisma } from "../database/prisma.js";

async function main() {
  const repositories = await prisma.repository.findMany();

  console.log(repositories);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });