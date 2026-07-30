import api from "@/lib/axios";
import type { DebugSession, DebugIssue, DebugHistoryResponse } from "@/types/debug";

export const analyzeError = async (data: {
  errorMessage: string;
  inputCode?: string;
  repositoryId?: string;
  filePath?: string;
}): Promise<DebugSession> => {
  const res = await api.post("/debug/analyze", data);
  return res.data.data;
};

export const analyzeStacktrace = async (data: {
  stackTrace: string;
  repositoryId?: string;
  filePath?: string;
}): Promise<DebugSession> => {
  const res = await api.post("/debug/stacktrace", data);
  return res.data.data;
};

export const detectBugs = async (data: {
  inputCode: string;
  repositoryId?: string;
  filePath?: string;
}): Promise<DebugSession & { issues: DebugIssue[] }> => {
  const res = await api.post("/debug/bugs", data);
  return res.data.data;
};

export const analyzeLogs = async (data: {
  logContent: string;
  repositoryId?: string;
  filePath?: string;
}): Promise<DebugSession> => {
  const res = await api.post("/debug/logs", data);
  return res.data.data;
};

export const suggestFix = async (data: {
  sessionId?: string;
  errorMessage?: string;
  inputCode?: string;
  context?: string;
}): Promise<{ session: DebugSession; suggestedFix: string; fixedCode: string }> => {
  const res = await api.post("/debug/fix", data);
  return res.data.data;
};

export const getDebugHistory = async (params?: {
  page?: number;
  limit?: number;
  sessionType?: string;
}): Promise<DebugHistoryResponse> => {
  const res = await api.get("/debug/history", { params });
  return res.data.data;
};

export const getDebugSession = async (id: string): Promise<DebugSession> => {
  const res = await api.get(`/debug/session/${id}`);
  return res.data.data;
};

export const recordDebugAction = async (data: {
  sessionId: string;
  action: "fix_applied" | "fix_copied" | "ignored" | "reopened" | "resolved";
}): Promise<void> => {
  await api.post("/debug/history/action", data);
};
