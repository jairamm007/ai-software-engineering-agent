import "dotenv/config";

import { askRepository } from "../services/rag.service.js";

async function main() {
  const response = await askRepository(
    "What does this repository do?"
  );

  console.log(response.answer);
}

main().catch(console.error);