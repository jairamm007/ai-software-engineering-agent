import "dotenv/config";

import { indexRepository } from "../indexer/repository.indexer.js";

async function main() {
  const result = await indexRepository(
    "./temp/Hello-World-1783433257881"
  );

  console.log(result);
}

main().catch(console.error);