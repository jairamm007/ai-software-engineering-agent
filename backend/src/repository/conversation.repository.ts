import { prisma } from "../database/prisma.js";

export const createConversation = async (
  userId: string,
  title: string,
  repositoryId?: string
) => {
  return prisma.conversation.create({
    data: { userId, title, repositoryId },
  });
};

export const getConversations = async (userId: string) => {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const getConversationById = async (
  id: string,
  userId: string
) => {
  return prisma.conversation.findFirst({
    where: { id, userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
};

export const deleteConversation = async (
  id: string,
  userId: string
) => {
  return prisma.conversation.deleteMany({
    where: { id, userId },
  });
};

export const updateConversationTitle = async (
  id: string,
  userId: string,
  title: string
) => {
  return prisma.conversation.updateMany({
    where: { id, userId },
    data: { title },
  });
};

export const addMessage = async (
  conversationId: string,
  role: string,
  content: string
) => {
  return prisma.message.create({
    data: { conversationId, role, content },
  });
};

export const touchConversation = async (id: string) => {
  return prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });
};
