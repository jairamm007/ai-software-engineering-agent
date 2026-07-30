export type DebugSessionType =
  | "error_analyzer"
  | "stack_trace"
  | "bug_detection"
  | "fix_suggestion"
  | "log_analysis"
  | "dependency_check";

export type DebugStatus = "open" | "resolved" | "unresolved";

export interface DebugSession {
  id: string;
  userId: string;
  repositoryId?: string;
  filePath?: string;
  sessionType: DebugSessionType;
  errorMessage?: string;
  inputCode?: string;
  inputLog?: string;
  explanation?: string;
  suggestedFix?: string;
  fixedCode?: string;
  status: DebugStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DebugIssue {
  type: string;
  severity: "critical" | "warning" | "info";
  line: number;
  description: string;
  suggestion: string;
  fixedCode?: string;
}

export interface DebugHistoryItem {
  id: string;
  sessionId: string;
  action: string;
  createdAt: string;
}

export interface DebugHistoryResponse {
  sessions: DebugSession[];
  total: number;
  page: number;
  limit: number;
}

export type DebugTab =
  | "error-analyzer"
  | "stack-trace"
  | "bug-detection"
  | "fix-suggestions"
  | "log-analysis"
  | "dependency-checker"
  | "history";
