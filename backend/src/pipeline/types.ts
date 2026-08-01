export type PipelineStage =
  | "debug"
  | "codegen"
  | "security"
  | "performance";

export type PipelineStatus =
  | "queued"
  | "running"
  | "done"
  | "failed"
  | "rejected"
  | "blocked";

export interface FailureRecord {
  testName?: string;
  testFile?: string;
  errorType?: string;
  errorMessage?: string;
  stackTrace?: string;
  implicatedFiles?: string[];
}

export interface ContextBlock {
  file: string;
  startLine: number;
  endLine: number;
  content: string;
}

export interface DiagnosisRecord {
  reasoning: string;
  rootCauseFile?: string | null;
  rootCauseLine?: number | null;
  confidence: number;
  modelUsed?: string;
}

export interface PatchRecord {
  diffText: string;
  summary?: string;
  filesTouched: string[];
  attemptNumber: number;
  status: "proposed" | "applied" | "reverted" | "rejected";
  testResult?: "pass" | "fail" | "not_run";
  testOutput?: string;
}

export interface SecurityFinding {
  tool: string;
  severity: string;
  rule?: string;
  file?: string;
  line?: number;
  message?: string;
  source?: string;
}

export interface PerfMeasurement {
  timeMs?: number;
  memoryMb?: number;
  queryCount?: number;
  command?: string;
  heuristic?: {
    file: string;
    line: number;
    kind: string;
    description: string;
  }[];
}

export interface RunInput {
  userId: string;
  repositoryId?: string;
  repoUrl?: string;
  branch?: string;
  runId?: string;
}

export type StackKind = "node" | "python" | "go" | "unknown";

export interface StackInfo {
  kind: StackKind;
  packageManager: string;
  testCommand: string;
  testFiles: string[];
  runCommand: string;
}
