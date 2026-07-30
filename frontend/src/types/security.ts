export type SecurityTab =
  | "dashboard"
  | "secret-detection"
  | "dependency-scan"
  | "ai-review"
  | "recommendations"
  | "reports"
  | "history";

export interface SecurityIssue {
  id: string;
  scanId: string;
  filePath?: string;
  issueType: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description?: string;
  recommendation?: string;
  snippet?: string;
  status: "open" | "resolved" | "ignored";
  createdAt: string;
  updatedAt: string;
}

export interface SecurityScan {
  id: string;
  userId: string;
  repositoryId?: string;
  securityScore: number;
  summary?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  issues: SecurityIssue[];
}

export interface SecurityReport {
  id: string;
  scanId: string;
  format: string;
  content?: string;
  createdAt: string;
}

export interface SecurityHistoryResponse {
  scans: SecurityScan[];
  total: number;
  page: number;
  limit: number;
}
