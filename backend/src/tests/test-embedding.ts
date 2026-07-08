import "dotenv/config";
import { generateEmbedding } from "../embeddings/embedding.service.js";

async function main() {
  const embedding = await generateEmbedding(
    "function login() { return true; }"
  );

  console.log("Embedding length:", embedding.length);
  console.log(embedding.slice(0, 10));
}

main().catch(console.error);