import { z } from "zod";

export const analyzeErrorSchema = z.object({
  errorMessage: z.string().min(1, "Error message is required"),
  inputCode: z.string().optional(),
  repositoryId: z.string().optional(),
  filePath: z.string().optional(),
});

export const analyzeStacktraceSchema = z.object({
  stackTrace: z.string().min(1, "Stack trace is required"),
  repositoryId: z.string().optional(),
  filePath: z.string().optional(),
});

export const detectBugsSchema = z.object({
  inputCode: z.string().min(1, "Code is required"),
  repositoryId: z.string().optional(),
  filePath: z.string().optional(),
});

export const suggestFixSchema = z.object({
  sessionId: z.string().optional(),
  errorMessage: z.string().optional(),
  inputCode: z.string().optional(),
  context: z.string().optional(),
});

export const analyzeLogsSchema = z.object({
  logContent: z.string().min(1, "Log content is required"),
  repositoryId: z.string().optional(),
  filePath: z.string().optional(),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sessionType: z.string().optional(),
});

export const recordActionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  action: z.enum(["fix_applied", "fix_copied", "ignored", "reopened", "resolved"]),
});
