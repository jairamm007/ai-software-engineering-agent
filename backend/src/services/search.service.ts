import { generateEmbedding } from "../embeddings/embedding.service.js";

import {
  searchNearestChunks,
  RetrievedChunk,
} from "../vector/vector.repository.js";

export const semanticSearch = async (
  query: string,
  limit = 10,
  repositoryId?: string,
  filePath?: string
): Promise<RetrievedChunk[]> => {
  const embedding =
    await generateEmbedding(query);

  return searchNearestChunks(
    embedding,
    limit,
    repositoryId,
    filePath
  );
};