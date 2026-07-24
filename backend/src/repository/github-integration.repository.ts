import { prisma } from "../database/prisma.js";

export const getGitHubOAuthToken = async (userId: string) => {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "github" },
    select: { accessToken: true },
  });
  return account?.accessToken ?? null;
};

export const createIntegration = async (
  userId: string,
  githubUrl: string,
  token: string
) => {
  return prisma.gitHubIntegration.create({
    data: { userId, githubUrl, token },
  });
};

export const getIntegrationById = async (id: string) => {
  return prisma.gitHubIntegration.findUnique({
    where: { id },
    include: {
      repos: { orderBy: { updatedAt: "desc" } },
    },
  });
};

export const getIntegrationByUserAndUrl = async (
  userId: string,
  githubUrl: string
) => {
  return prisma.gitHubIntegration.findUnique({
    where: { userId_githubUrl: { userId, githubUrl } },
  });
};

export const getUserIntegrations = async (userId: string) => {
  return prisma.gitHubIntegration.findMany({
    where: { userId },
    include: {
      _count: { select: { repos: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateIntegration = async (
  id: string,
  data: { isActive?: boolean; lastSyncAt?: Date }
) => {
  return prisma.gitHubIntegration.update({
    where: { id },
    data,
  });
};

export const deleteIntegration = async (id: string) => {
  return prisma.gitHubIntegration.delete({ where: { id } });
};

export const createIntegrationRepo = async (
  integrationId: string,
  data: {
    owner: string;
    name: string;
    fullName: string;
    description?: string;
    defaultBranch: string;
    isPrivate: boolean;
    language?: string;
    starsCount: number;
    forksCount: number;
    openIssuesCount: number;
  }
) => {
  return prisma.gitHubIntegrationRepository.upsert({
    where: {
      integrationId_owner_name: {
        integrationId,
        owner: data.owner,
        name: data.name,
      },
    },
    update: {
      description: data.description,
      defaultBranch: data.defaultBranch,
      isPrivate: data.isPrivate,
      language: data.language,
      starsCount: data.starsCount,
      forksCount: data.forksCount,
      openIssuesCount: data.openIssuesCount,
      lastSyncAt: new Date(),
    },
    create: {
      integrationId,
      ...data,
      lastSyncAt: new Date(),
    },
  });
};

export const getIntegrationRepos = async (integrationId: string) => {
  return prisma.gitHubIntegrationRepository.findMany({
    where: { integrationId },
    orderBy: { updatedAt: "desc" },
  });
};

export const getIntegrationRepo = async (
  integrationId: string,
  owner: string,
  name: string
) => {
  return prisma.gitHubIntegrationRepository.findUnique({
    where: {
      integrationId_owner_name: { integrationId, owner, name },
    },
  });
};

export const deleteIntegrationRepos = async (integrationId: string) => {
  return prisma.gitHubIntegrationRepository.deleteMany({
    where: { integrationId },
  });
};
