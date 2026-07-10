import "dotenv/config";

import { prisma } from "../database/prisma.js";
import { parseRepository } from "../parser/repository-parser.js";

async function main() {
  const repository = await prisma.repository.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!repository) {
    console.log("No repository found.");
    return;
  }

  console.log(
    parseRepository(repository.localPath)
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });