import { generateEmbedding } from "../embeddings/embedding.service.js";
import { searchNearestChunks } from "../vector/vector.repository.js";

export const semanticSearch = async (
  query: string,
  limit = 5
) => {
  const embedding = await generateEmbedding(query);

  return searchNearestChunks(
    embedding,
    limit
  );
};