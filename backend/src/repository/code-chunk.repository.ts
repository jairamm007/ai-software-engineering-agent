import { prisma } from "../database/prisma.js";

export const createCodeChunk = async (
  fileId: string,
  content: string,
  startLine: number,
  endLine: number
) => {
  return prisma.codeChunk.create({
    data: {
      fileId,
      content,
      startLine,
      endLine,
    },
  });
};

export const createCodeChunksBulk = async (
  chunks: { fileId: string; content: string; startLine: number; endLine: number }[]
) => {
  return prisma.codeChunk.createManyAndReturn({
    data: chunks,
  });
};

export const getChunksByFileId = async (
  fileId: string
) => {
  return prisma.codeChunk.findMany({
    where: {
      fileId,
    },
    orderBy: {
      startLine: "asc",
    },
  });
};