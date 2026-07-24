import { prisma } from "../database/prisma.js";

export const createActivity = async (
  teamId: string,
  userId: string,
  action: string,
  details?: string
) => {
  return prisma.teamActivity.create({
    data: { teamId, userId, action, details },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
};

export const getTeamActivities = async (
  teamId: string,
  options?: { limit?: number; offset?: number; action?: string }
) => {
  const where: any = { teamId };
  if (options?.action) {
    where.action = options.action;
  }

  return prisma.teamActivity.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
};

export const getRecentActivityCount = async (teamId: string, since: Date) => {
  return prisma.teamActivity.count({
    where: {
      teamId,
      createdAt: { gte: since },
    },
  });
};
