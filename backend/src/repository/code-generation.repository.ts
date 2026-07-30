import { Prisma } from "@prisma/client";

import { prisma } from "../database/prisma.js";

export interface CreateCodeGenerationInput {
  userId: string;
  type: string;
  prompt: string;
  repositoryId?: string;
  filePath?: string;
  inputCode?: string;
  inputLanguage?: string;
  targetLanguage?: string;
  model?: string;
}

export interface CreateGenerationHistoryInput {
  userId: string;
  generationId: string;
  action: "accepted" | "rejected" | "edited";
  editedCode?: string;
}

export interface CreateSavedPromptInput {
  userId: string;
  title: string;
  prompt: string;
  category?: string;
}

export const createCodeGeneration = async (
  input: CreateCodeGenerationInput
) => {
  return prisma.codeGeneration.create({
    data: {
      userId: input.userId,
      repositoryId: input.repositoryId,
      type: input.type,
      prompt: input.prompt,
      filePath: input.filePath,
      inputCode: input.inputCode,
      inputLanguage: input.inputLanguage,
      targetLanguage: input.targetLanguage,
      model: input.model,
      status: "generating",
    },
  });
};

export const updateCodeGeneration = async (
  id: string,
  data: Prisma.CodeGenerationUpdateInput
) => {
  return prisma.codeGeneration.update({
    where: { id },
    data,
  });
};

export const getCodeGenerationById = async (
  id: string,
  userId: string
) => {
  return prisma.codeGeneration.findFirst({
    where: { id, userId },
    include: { historyItems: true },
  });
};

export const getCodeGenerations = async (
  userId: string,
  options?: { page?: number; limit?: number; type?: string }
) => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Prisma.CodeGenerationWhereInput = { userId };
  if (options?.type) where.type = options.type;

  const [items, total] = await Promise.all([
    prisma.codeGeneration.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.codeGeneration.count({ where }),
  ]);

  return { items, total, page, limit };
};

export const deleteCodeGeneration = async (id: string, userId: string) => {
  return prisma.codeGeneration.deleteMany({
    where: { id, userId },
  });
};

export const createGenerationHistory = async (
  input: CreateGenerationHistoryInput
) => {
  return prisma.generationHistory.create({
    data: {
      userId: input.userId,
      generationId: input.generationId,
      action: input.action,
      editedCode: input.editedCode,
    },
  });
};

export const getSavedPrompts = async (userId: string) => {
  return prisma.savedPrompt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const createSavedPrompt = async (
  input: CreateSavedPromptInput
) => {
  return prisma.savedPrompt.create({
    data: {
      userId: input.userId,
      title: input.title,
      prompt: input.prompt,
      category: input.category ?? "general",
    },
  });
};

export const deleteSavedPrompt = async (id: string, userId: string) => {
  return prisma.savedPrompt.deleteMany({
    where: { id, userId },
  });
};
