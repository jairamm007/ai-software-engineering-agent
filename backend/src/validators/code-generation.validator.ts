import { z } from "zod";

export const codeGenerationSchema = z.object({
  type: z.enum([
    "generate",
    "refactor",
    "explain",
    "translate",
    "test",
    "documentation",
    "completion",
    "function",
    "class",
    "crud",
    "api",
    "ui",
  ]),
  prompt: z.string().min(1),
  repositoryId: z.string().optional(),
  filePath: z.string().optional(),
  inputCode: z.string().optional(),
  inputLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
  model: z.string().optional(),
});

export const applyGeneratedCodeSchema = z.object({
  generationId: z.string().min(1),
  repositoryId: z.string().min(1),
  filePath: z.string().min(1),
  code: z.string().min(1),
});

export const savePromptSchema = z.object({
  title: z.string().min(1),
  prompt: z.string().min(1),
  category: z.string().optional(),
});

export const generationHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  type: z.string().optional(),
});
