import { prisma } from "../database/prisma.js";

export const createNotification = async (
  teamId: string,
  userId: string,
  type: string,
  title: string,
  message: string,
  linkTo?: string
) => {
  return prisma.teamNotification.create({
    data: { teamId, userId, type, title, message, linkTo },
  });
};

export const getUserNotifications = async (
  userId: string,
  teamId?: string,
  limit = 50
) => {
  const where: any = { userId };
  if (teamId) where.teamId = teamId;

  return prisma.teamNotification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const getUnreadCount = async (userId: string, teamId?: string) => {
  const where: any = { userId, read: false };
  if (teamId) where.teamId = teamId;

  return prisma.teamNotification.count({ where });
};

export const markAsRead = async (notificationId: string) => {
  return prisma.teamNotification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

export const markAllAsRead = async (userId: string, teamId?: string) => {
  const where: any = { userId, read: false };
  if (teamId) where.teamId = teamId;

  return prisma.teamNotification.updateMany({
    where,
    data: { read: true },
  });
};

export const deleteNotification = async (notificationId: string) => {
  return prisma.teamNotification.delete({ where: { id: notificationId } });
};

export const notifyTeamMembers = async (
  teamId: string,
  excludeUserId: string,
  type: string,
  title: string,
  message: string,
  linkTo?: string
) => {
  const members = await prisma.teamMember.findMany({
    where: { teamId, userId: { not: excludeUserId } },
    select: { userId: true },
  });

  if (members.length === 0) return;

  return prisma.teamNotification.createMany({
    data: members.map((m) => ({
      teamId,
      userId: m.userId,
      type,
      title,
      message,
      linkTo,
    })),
  });
};
