import api from "@/lib/axios";
import type { SecurityScan, SecurityIssue, SecurityReport, SecurityHistoryResponse } from "@/types/security";

export const runSecurityScan = async (data?: {
  repositoryId?: string;
  scanType?: string;
}): Promise<SecurityScan & { criticalCount: number; highCount: number; mediumCount: number; lowCount: number }> => {
  const res = await api.post("/security/scan", data || {});
  return res.data.data;
};

export const getSecurityReport = async (id: string, format?: string): Promise<SecurityReport> => {
  const res = await api.get(`/security/report/${id}`, { params: { format } });
  return res.data.data;
};

export const getSecurityHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<SecurityHistoryResponse> => {
  const res = await api.get("/security/history", { params });
  return res.data.data;
};

export const getSecurityIssues = async (repositoryId: string): Promise<SecurityIssue[]> => {
  const res = await api.get(`/security/issues/${repositoryId}`);
  return res.data.data;
};

export const updateSecurityIssue = async (data: {
  issueId: string;
  status: "open" | "resolved" | "ignored";
}): Promise<void> => {
  await api.patch("/security/issues", data);
};

export const getSecurityScan = async (id: string): Promise<SecurityScan> => {
  const res = await api.get(`/security/scan/${id}`);
  return res.data.data;
};
