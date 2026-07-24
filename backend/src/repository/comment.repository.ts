import { prisma } from "../database/prisma.js";

export const createComment = async (
  teamId: string,
  userId: string,
  content: string,
  repositoryId?: string,
  parentCommentId?: string,
  mentions: string[] = []
) => {
  return prisma.comment.create({
    data: { teamId, userId, content, repositoryId, parentCommentId, mentions },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
};

export const getComments = async (
  teamId: string,
  options?: { repositoryId?: string; limit?: number; offset?: number }
) => {
  const where: any = { teamId };
  if (options?.repositoryId) {
    where.repositoryId = options.repositoryId;
  }

  return prisma.comment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
};

export const getCommentById = async (id: string) => {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
};

export const updateComment = async (id: string, content: string, mentions: string[]) => {
  return prisma.comment.update({
    where: { id },
    data: { content, mentions, updatedAt: new Date() },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
};

export const deleteComment = async (id: string) => {
  return prisma.comment.delete({ where: { id } });
};

export const resolveComment = async (id: string, resolved: boolean) => {
  return prisma.comment.update({
    where: { id },
    data: { resolved },
  });
};

export const getCommentsByMention = async (teamId: string, userId: string) => {
  return prisma.comment.findMany({
    where: {
      teamId,
      mentions: { has: userId },
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getUnresolvedCommentCount = async (teamId: string) => {
  return prisma.comment.count({
    where: { teamId, resolved: false },
  });
};
