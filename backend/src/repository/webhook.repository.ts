import { prisma } from "../database/prisma.js";
import type { Prisma } from "@prisma/client";

export const createWebhookEvent = async (data: {
  integrationId: string;
  eventType: string;
  action?: string;
  deliveryId?: string;
  repositoryOwner?: string;
  repositoryName?: string;
  payload: unknown;
}) => {
  return prisma.gitHubWebhookEvent.create({
    data: {
      integrationId: data.integrationId,
      eventType: data.eventType,
      action: data.action,
      deliveryId: data.deliveryId,
      repositoryOwner: data.repositoryOwner,
      repositoryName: data.repositoryName,
      payload: data.payload as Prisma.InputJsonValue,
    },
  });
};

export const markWebhookEventProcessed = async (id: string) => {
  return prisma.gitHubWebhookEvent.update({
    where: { id },
    data: { processedAt: new Date() },
  });
};

export const getWebhookEvents = async (
  integrationId: string,
  options?: {
    eventType?: string;
    page?: number;
    perPage?: number;
  }
) => {
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 20;
  const where: Record<string, unknown> = { integrationId };

  if (options?.eventType) {
    where.eventType = options.eventType;
  }

  const [events, total] = await Promise.all([
    prisma.gitHubWebhookEvent.findMany({
      where: where as Prisma.GitHubWebhookEventWhereInput,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.gitHubWebhookEvent.count({ where: where as Prisma.GitHubWebhookEventWhereInput }),
  ]);

  return { events, total, page, perPage };
};

export const getWebhookEventById = async (id: string) => {
  return prisma.gitHubWebhookEvent.findUnique({ where: { id } });
};

export const getWebhookEventsByDeliveryId = async (deliveryId: string) => {
  return prisma.gitHubWebhookEvent.findMany({
    where: { deliveryId },
    orderBy: { createdAt: "desc" },
  });
};
