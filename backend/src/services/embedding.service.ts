import { generateEmbedding } from "../embeddings/embedding.service.js";
import { insertEmbedding } from "../vector/vector.repository.js";

export const createChunkEmbedding = async (
  chunkId: string,
  content: string
) => {
  const embedding = await generateEmbedding(content);

  await insertEmbedding(chunkId, embedding);

  return embedding;
};