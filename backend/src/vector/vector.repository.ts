import { Prisma } from "@prisma/client";

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
  limit = 10,
  repositoryId?: string,
  filePath?: string
): Promise<RetrievedChunk[]> => {
  const vector = `[${embedding.join(",")}]`;

  const filters: Prisma.Sql[] = [];

  if (repositoryId) {
    filters.push(
      Prisma.sql`rf."repositoryId" = ${repositoryId}`
    );
  }

  if (filePath) {
    filters.push(Prisma.sql`rf.path = ${filePath}`);
  }

  const whereClause = filters.length
    ? Prisma.sql`WHERE ${Prisma.join(
        filters,
        " AND "
      )}`
    : Prisma.empty;

  const fetchLimit = Math.min(limit * 2, 20);

  const results = await prisma.$queryRaw<RetrievedChunk[]>`
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
    ${whereClause}
    ORDER BY ce.embedding <=> ${vector}::vector
    LIMIT ${fetchLimit}
  `;

  const seen = new Set<string>();

  return results
    .filter((chunk) => {
      if (chunk.distance >= 0.75) return false;
      const key = `${chunk.filePath}:${chunk.startLine}-${chunk.endLine}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};
