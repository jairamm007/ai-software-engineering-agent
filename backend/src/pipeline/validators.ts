import { z } from "zod";

export const startRunSchema = z.object({
  repositoryId: z.string().optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
  branch: z.string().optional().nullable(),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
