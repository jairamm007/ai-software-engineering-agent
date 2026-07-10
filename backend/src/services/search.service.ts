import { generateEmbedding } from "../embeddings/embedding.service.js";

import {
  searchNearestChunks,
  RetrievedChunk,
} from "../vector/vector.repository.js";

export const semanticSearch = async (
  query: string,
  limit = 10
): Promise<RetrievedChunk[]> => {
  const embedding =
    await generateEmbedding(query);

  const chunks =
    await searchNearestChunks(
      embedding,
      limit
    );

  return chunks;
};