import { prisma } from "../database/prisma.js";

export const createRepositoryFile = async (
  repositoryId: string,
  path: string,
  extension: string,
  size: number
) => {
  return prisma.repositoryFile.create({
    data: {
      repositoryId,
      path,
      extension,
      size,
    },
  });
};

export const getRepositoryFiles = async (
  repositoryId: string
) => {
  return prisma.repositoryFile.findMany({
    where: {
      repositoryId,
    },
    orderBy: {
      path: "asc",
    },
  });
};