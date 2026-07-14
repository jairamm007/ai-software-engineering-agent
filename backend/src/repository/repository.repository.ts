import { prisma } from "../database/prisma.js";

export const createRepository = async (
  name: string,
  githubUrl: string,
  localPath: string,
  userId: string
) => {
  const existingRepository = await prisma.repository.findUnique({
    where: {
      githubUrl_userId: { githubUrl, userId },
    },
  });

  if (existingRepository) {
    return existingRepository;
  }

  return prisma.repository.create({
    data: {
      name,
      githubUrl,
      localPath,
      userId,
    },
  });
};

export const getRepositories = async (userId: string) => {
  return prisma.repository.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: { select: { files: true } },
      files: {
        select: {
          _count: { select: { chunks: true } },
        },
      },
    },
  });
};

export const getRepositoryByGithubUrl = async (
  githubUrl: string,
  userId: string
) => {
  return prisma.repository.findUnique({
    where: {
      githubUrl_userId: { githubUrl, userId },
    },
  });
};

export const getRepositoryById = async (
  id: string,
  userId: string
) => {
  return prisma.repository.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      files: {
        include: {
          chunks: true,
        },
      },
    },
  });
};

export const repositoryExists = async (
  githubUrl: string,
  userId: string
) => {
  const repository = await prisma.repository.findUnique({
    where: {
      githubUrl_userId: { githubUrl, userId },
    },
  });

  return repository !== null;
};

export const deleteRepository = async (
  repositoryId: string,
  userId: string
) => {
  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });

  if (!repo) {
    throw new Error("Repository not found or access denied");
  }

  await prisma.$transaction(async (tx) => {
    // Delete embeddings first
    await tx.$executeRaw`
      DELETE FROM code_embeddings
      WHERE chunk_id IN (
        SELECT cc.id
        FROM "CodeChunk" cc
        JOIN "RepositoryFile" rf
          ON cc."fileId" = rf.id
        WHERE rf."repositoryId" = ${repositoryId}
      )
    `.catch(() => {});

    // Delete chunks
    await tx.codeChunk.deleteMany({
      where: {
        file: {
          repositoryId,
        },
      },
    });

    // Delete files
    await tx.repositoryFile.deleteMany({
      where: {
        repositoryId,
      },
    });

    // Delete repository
    await tx.repository.delete({
      where: {
        id: repositoryId,
      },
    });
  });
};
