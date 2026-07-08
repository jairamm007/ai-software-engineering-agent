import "dotenv/config";

import { semanticSearch } from "../services/search.service.js";

async function main() {
  const results = await semanticSearch(
    "README file"
  );

  console.log(results);
}

main().catch(console.error);