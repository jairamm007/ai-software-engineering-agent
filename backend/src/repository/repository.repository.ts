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

export const getRepositories = async (
  userId: string,
  options?: { search?: string; sortBy?: string }
) => {
  const where: any = { userId };

  if (options?.search) {
    where.name = { contains: options.search, mode: "insensitive" };
  }

  let orderBy: any = { createdAt: "desc" };

  if (options?.sortBy === "name") {
    orderBy = { name: "asc" };
  } else if (options?.sortBy === "oldest") {
    orderBy = { createdAt: "asc" };
  }

  const repositories = await prisma.repository.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      githubUrl: true,
      localPath: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      _count: { select: { files: true } },
      files: {
        select: {
          _count: { select: { chunks: true } },
        },
      },
    },
  });

  if (options?.sortBy === "files") {
    repositories.sort((a: any, b: any) => b._count.files - a._count.files);
  }

  return repositories;
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

export const toggleFavorite = async (
  repositoryId: string,
  userId: string
) => {
  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });

  if (!repo) {
    throw new Error("Repository not found or access denied");
  }

  return prisma.repository.update({
    where: { id: repositoryId },
    data: { isFavorite: !repo.isFavorite },
  });
};

export const clearRepositoryIndex = async (
  repositoryId: string,
  userId: string
) => {
  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, userId },
  });

  if (!repo) {
    throw new Error("Repository not found or access denied");
  }

  await prisma.$executeRaw`
    DELETE FROM code_embeddings
    WHERE chunk_id IN (
      SELECT cc.id
      FROM "CodeChunk" cc
      JOIN "RepositoryFile" rf
        ON cc."fileId" = rf.id
      WHERE rf."repositoryId" = ${repositoryId}
    )
  `.catch(() => {});

  await prisma.$transaction(async (tx) => {
    await tx.codeSymbol.deleteMany({
      where: {
        file: {
          repositoryId,
        },
      },
    });

    await tx.codeChunk.deleteMany({
      where: {
        file: {
          repositoryId,
        },
      },
    });

    await tx.repositoryFile.deleteMany({
      where: {
        repositoryId,
      },
    });
  });

  return repo;
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

  // Delete embeddings outside the transaction — if the table doesn't exist
  // or the query fails, we don't want to poison the transaction.
  await prisma.$executeRaw`
    DELETE FROM code_embeddings
    WHERE chunk_id IN (
      SELECT cc.id
      FROM "CodeChunk" cc
      JOIN "RepositoryFile" rf
        ON cc."fileId" = rf.id
      WHERE rf."repositoryId" = ${repositoryId}
    )
  `.catch(() => {});

  await prisma.$transaction(async (tx) => {
    // Delete symbols
    await tx.codeSymbol.deleteMany({
      where: {
        file: {
          repositoryId,
        },
      },
    });

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
