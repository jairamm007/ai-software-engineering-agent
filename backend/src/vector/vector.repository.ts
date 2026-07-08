import { prisma } from "../database/prisma.js";

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
  limit = 5
) => {
  const vector = `[${embedding.join(",")}]`;

  return prisma.$queryRaw<
    {
      repository: string;
      filePath: string;
      startLine: number;
      endLine: number;
      content: string;
      distance: number;
    }[]
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
};