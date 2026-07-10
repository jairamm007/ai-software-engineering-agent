import { prisma } from "../database/prisma.js";

export interface RetrievedChunk {
  repository: string;
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  distance: number;
}

export const insertEmbedding = async (
  chunkId: string,
  embedding: number[]
) => {
  const vector = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    INSERT INTO code_embeddings
      (chunk_id, embedding)
    VALUES
      (${chunkId}, ${vector}::vector)
  `;
};

export const searchNearestChunks = async (
  embedding: number[],
  limit = 10
): Promise<RetrievedChunk[]> => {
  const vector = `[${embedding.join(",")}]`;

  const results = await prisma.$queryRaw<
    RetrievedChunk[]
  >`
    SELECT
      r.name AS "repository",
      rf.path AS "filePath",
      cc."startLine",
      cc."endLine",
      cc.content,
      ce.embedding <=> ${vector}::vector AS distance
    FROM code_embeddings ce
    JOIN "CodeChunk" cc
      ON ce.chunk_id = cc.id
    JOIN "RepositoryFile" rf
      ON cc."fileId" = rf.id
    JOIN "Repository" r
      ON rf."repositoryId" = r.id
    ORDER BY ce.embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;

  return results
    .filter((chunk) => chunk.distance < 0.65)
    .sort((a, b) => a.distance - b.distance);
};