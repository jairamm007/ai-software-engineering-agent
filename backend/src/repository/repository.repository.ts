import { prisma } from "../database/prisma.js";

export const createRepository = async (
  name: string,
  githubUrl: string,
  localPath: string
) => {
  const existingRepository = await prisma.repository.findUnique({
    where: {
      githubUrl,
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
    },
  });
};

export const getRepositories = async () => {
  return prisma.repository.findMany({
    orderBy: {
      createdAt: "desc",
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

export const getRepositoryByGithubUrl = async (
  githubUrl: string
) => {
  return prisma.repository.findUnique({
    where: {
      githubUrl,
    },
  });
};

export const getRepositoryById = async (
  id: string
) => {
  return prisma.repository.findUnique({
    where: {
      id,
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
  githubUrl: string
) => {
  const repository = await prisma.repository.findUnique({
    where: {
      githubUrl,
    },
  });

  return repository !== null;
};

export const deleteRepository = async (
  repositoryId: string
) => {
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
    `;

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