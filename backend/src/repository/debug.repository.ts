import { prisma } from "../database/prisma.js";

export interface CreateDebugSessionInput {
  userId: string;
  repositoryId?: string;
  filePath?: string;
  sessionType: string;
  errorMessage?: string;
  inputCode?: string;
  inputLog?: string;
}

export interface UpdateDebugSessionInput {
  explanation?: string;
  suggestedFix?: string;
  fixedCode?: string;
  status?: string;
  filePath?: string;
  updatedAt: Date;
}

export interface CreateDebugHistoryInput {
  sessionId: string;
  action: string;
}

export const createDebugSession = (input: CreateDebugSessionInput) =>
  prisma.debugSession.create({ data: input });

export const updateDebugSession = (id: string, input: UpdateDebugSessionInput) =>
  prisma.debugSession.update({ where: { id }, data: input });

export const getDebugSessionById = (id: string, userId: string) =>
  prisma.debugSession.findFirst({ where: { id, userId } });

export const getDebugSessions = (
  userId: string,
  options: { page: number; limit: number; sessionType?: string }
) => {
  const { page, limit, sessionType } = options;
  const where: Record<string, unknown> = { userId };
  if (sessionType) where.sessionType = sessionType;

  return prisma.$transaction([
    prisma.debugSession.count({ where }),
    prisma.debugSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
};

export const createDebugHistory = (input: CreateDebugHistoryInput) =>
  prisma.debugHistory.create({ data: input });

export const getDebugHistoryBySession = (sessionId: string) =>
  prisma.debugHistory.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
