import { generateEmbedding } from "../embeddings/embedding.service.js";

import {
  searchNearestChunks,
  RetrievedChunk,
} from "../vector/vector.repository.js";

function generateSearchVariants(query: string): string[] {
  const words = query.split(/\s+/).filter((w) => w.length > 3);
  const variants: string[] = [query];

  if (words.length >= 2) {
    variants.push(words.slice(0, 4).join(" "));
  }

  const lower = query.toLowerCase();
  if (lower.includes("review") || lower.includes("bug")) {
    variants.push(`${words.slice(0, 2).join(" ")} logic error`);
  } else if (lower.includes("test")) {
    variants.push(`${words.slice(0, 2).join(" ")} test assert`);
  } else if (lower.includes("security") || lower.includes("vulnerab")) {
    variants.push(`${words.slice(0, 2).join(" ")} auth input`);
  }

  return variants.slice(0, 2);
}

export const semanticSearch = async (
  query: string,
  limit = 10,
  repositoryId?: string,
  filePath?: string
): Promise<RetrievedChunk[]> => {
  const embedding = await generateEmbedding(query);

  return searchNearestChunks(
    embedding,
    limit,
    repositoryId,
    filePath
  );
};

export const multiQuerySearch = async (
  query: string,
  limit = 10,
  repositoryId?: string,
  filePath?: string
): Promise<RetrievedChunk[]> => {
  const variants = generateSearchVariants(query);

  const results = await Promise.all(
    variants.map((variant) =>
      semanticSearch(variant, Math.ceil(limit / variants.length) + 3, repositoryId, filePath)
        .catch(() => [] as RetrievedChunk[])
    )
  );

  const seen = new Set<string>();
  const merged: RetrievedChunk[] = [];

  for (const chunks of results) {
    for (const chunk of chunks) {
      const key = `${chunk.filePath}:${chunk.startLine}-${chunk.endLine}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(chunk);
      }
    }
  }

  merged.sort((a, b) => a.distance - b.distance);
  return merged.slice(0, limit);
};
