import { z } from "zod";

export const scanRepositorySchema = z.object({
  repositoryId: z.string().optional(),
  scanType: z.enum(["full", "secrets", "dependencies", "code_review"]).default("full"),
});

export const reportQuerySchema = z.object({
  id: z.string().min(1),
  format: z.enum(["markdown", "pdf"]).default("markdown"),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateIssueSchema = z.object({
  issueId: z.string().min(1),
  status: z.enum(["open", "resolved", "ignored"]),
});
