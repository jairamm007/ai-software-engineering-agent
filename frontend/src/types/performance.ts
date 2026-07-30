export type PerformanceTab =
  | "dashboard"
  | "complexity"
  | "duplicate"
  | "large-files"
  | "ai-suggestions"
  | "reports"
  | "history";

export interface PerformanceIssue {
  id: string;
  scanId: string;
  filePath?: string;
  issueType: "complexity" | "duplicate" | "large_file" | "ai_suggestion";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description?: string;
  recommendation?: string;
  snippet?: string;
  lineStart?: number;
  lineEnd?: number;
  createdAt: string;
}

export interface PerformanceScan {
  id: string;
  userId: string;
  repositoryId?: string;
  performanceScore: number;
  maintainabilityScore: number;
  readabilityScore: number;
  overallHealth: number;
  filesAnalyzed: number;
  summary?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  issues: PerformanceIssue[];
}

export interface PerformanceReport {
  id: string;
  scanId: string;
  format: string;
  content?: string;
  createdAt: string;
}

export interface PerformanceHistoryResponse {
  scans: PerformanceScan[];
  total: number;
  page: number;
  limit: number;
}
