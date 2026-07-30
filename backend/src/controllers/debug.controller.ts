import {
  analyzeError,
  analyzeStacktrace,
  detectBugs,
  suggestFix,
  analyzeLogs,
} from "../services/debug.service.js";
import {
  getDebugSessions,
  getDebugSessionById,
  createDebugHistory,
} from "../repository/debug.repository.js";
import {
  analyzeErrorSchema,
  analyzeStacktraceSchema,
  detectBugsSchema,
  suggestFixSchema,
  analyzeLogsSchema,
  historyQuerySchema,
  recordActionSchema,
} from "../validators/debug.validator.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

const parseZodMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "issues" in err) {
    const zodErr = err as { issues: Array<{ message: string }> };
    return zodErr.issues.map((i) => i.message).join(", ");
  }
  if (err instanceof Error) return err.message;
  return "Invalid request";
};

export const analyzeErrorController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = analyzeErrorSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const result = await analyzeError({
      userId,
      sessionType: "error_analyzer",
      errorMessage: parsed.data.errorMessage,
      inputCode: parsed.data.inputCode,
      repositoryId: parsed.data.repositoryId,
      filePath: parsed.data.filePath,
    });

    res.status(200).json(successResponse(result, "Error analyzed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Error analysis failed"));
  }
};

export const analyzeStacktraceController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = analyzeStacktraceSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const result = await analyzeStacktrace({
      userId,
      sessionType: "stack_trace",
      stackTrace: parsed.data.stackTrace,
      repositoryId: parsed.data.repositoryId,
      filePath: parsed.data.filePath,
    });

    res.status(200).json(successResponse(result, "Stack trace analyzed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Stack trace analysis failed"));
  }
};

export const detectBugsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = detectBugsSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const result = await detectBugs({
      userId,
      sessionType: "bug_detection",
      inputCode: parsed.data.inputCode,
      repositoryId: parsed.data.repositoryId,
      filePath: parsed.data.filePath,
    });

    res.status(200).json(successResponse(result, "Bug detection completed"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Bug detection failed"));
  }
};

export const suggestFixController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = suggestFixSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const result = await suggestFix(parsed.data.sessionId || "", {
      errorMessage: parsed.data.errorMessage,
      inputCode: parsed.data.inputCode,
      context: parsed.data.context,
    });

    res.status(200).json(successResponse(result, "Fix suggestion generated"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Fix suggestion failed"));
  }
};

export const analyzeLogsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = analyzeLogsSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const result = await analyzeLogs({
      userId,
      sessionType: "log_analysis",
      logContent: parsed.data.logContent,
      repositoryId: parsed.data.repositoryId,
      filePath: parsed.data.filePath,
    });

    res.status(200).json(successResponse(result, "Logs analyzed successfully"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Log analysis failed"));
  }
};

export const getHistoryController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const [total, sessions] = await getDebugSessions(userId, parsed.data);
    res.status(200).json(successResponse({ sessions, total, page: parsed.data.page, limit: parsed.data.limit }, "History fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch history"));
  }
};

export const getSessionController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const session = await getDebugSessionById(id, userId);
    if (!session) { res.status(404).json(errorResponse("Session not found")); return; }

    res.status(200).json(successResponse(session, "Session fetched"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to fetch session"));
  }
};

export const recordActionController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const parsed = recordActionSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json(errorResponse(parseZodMessage(parsed.error))); return; }

    const session = await getDebugSessionById(parsed.data.sessionId, userId);
    if (!session) { res.status(404).json(errorResponse("Session not found")); return; }

    await createDebugHistory({
      sessionId: parsed.data.sessionId,
      action: parsed.data.action,
    });

    const statusMap: Record<string, string> = {
      fix_applied: "resolved",
      fix_copied: "open",
      ignored: "unresolved",
      reopened: "open",
      resolved: "resolved",
    };

    const { updateDebugSession } = await import("../repository/debug.repository.js");
    await updateDebugSession(parsed.data.sessionId, {
      status: statusMap[parsed.data.action] || "open",
      updatedAt: new Date(),
    });

    res.status(200).json(successResponse(null, "Action recorded"));
  } catch (error) {
    res.status(500).json(errorResponse(error instanceof Error ? error.message : "Failed to record action"));
  }
};
