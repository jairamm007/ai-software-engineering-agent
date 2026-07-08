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
  });
};