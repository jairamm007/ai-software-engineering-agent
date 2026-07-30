import { prisma } from "../database/prisma.js";

export const createTeamChat = async (teamId: string, title?: string) => {
  return prisma.teamChat.create({
    data: { teamId, title },
  });
};

export const getTeamChats = async (teamId: string) => {
  return prisma.teamChat.findMany({
    where: { teamId },
    orderBy: { updatedAt: "desc" },
  });
};

export const getTeamChatById = async (chatId: string) => {
  return prisma.teamChat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

export const addTeamMessage = async (
  chatId: string,
  userId: string,
  role: string,
  content: string
) => {
  const message = await prisma.teamMessage.create({
    data: { chatId, userId, role, content },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  await prisma.teamChat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return message;
};

export const getTeamChatMessages = async (chatId: string, limit = 50) => {
  return prisma.teamMessage.findMany({
    where: { chatId },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
};

export const deleteTeamChat = async (chatId: string) => {
  return prisma.teamChat.delete({ where: { id: chatId } });
};
