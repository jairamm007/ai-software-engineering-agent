export interface PipelineFailure {
  id: string;
  debugRunId: string;
  testName?: string | null;
  testFile?: string | null;
  errorType?: string | null;
  errorMessage?: string | null;
  stackTrace?: string | null;
  implicatedFiles?: string[] | null;
  createdAt: string;
}

export interface PipelineDiagnosis {
  id: string;
  debugRunId: string;
  failureId?: string | null;
  reasoning: string;
  rootCauseFile?: string | null;
  rootCauseLine?: number | null;
  confidence: number;
  modelUsed?: string | null;
}

export interface PipelinePatch {
  id: string;
  debugRunId: string;
  attemptNumber: number;
  diffText: string;
  summary?: string | null;
  filesTouched?: string[] | null;
  status: "proposed" | "applied" | "reverted" | "rejected";
  testResult?: string | null;
  testOutput?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineSecurityFinding {
  tool: string;
  severity: string;
  rule?: string;
  file?: string;
  line?: number;
  message?: string;
  source?: string;
}

export interface PipelineSecurityScan {
  id: string;
  debugRunId: string;
  tool: string;
  summary?: string | null;
  findings?: PipelineSecurityFinding[] | null;
  blocked: boolean;
  status: string;
  createdAt: string;
}

export interface PipelinePerfBaseline {
  id: string;
  debugRunId: string;
  stage: string;
  timeMs?: number | null;
  memoryMb?: number | null;
  queryCount?: number | null;
  command?: string | null;
  heuristic?: Array<{
    file: string;
    line: number;
    kind: string;
    description: string;
    heuristicOnly?: boolean;
  }> | null;
  createdAt: string;
}

export interface PipelinePerfComparison {
  id: string;
  debugRunId: string;
  metric: string;
  beforeValue?: number | null;
  afterValue?: number | null;
  pctChange?: number | null;
  flagged: boolean;
  createdAt: string;
}

export interface PipelineRun {
  id: string;
  userId: string;
  repositoryId?: string | null;
  repoName?: string | null;
  repoUrl?: string | null;
  branch?: string | null;
  status: "queued" | "running" | "done" | "failed" | "rejected" | "blocked";
  stage: string;
  stackDetected?: string | null;
  failureCount: number;
  currentAttempt: number;
  summary?: string | null;
  createdAt: string;
  updatedAt: string;
  failures: PipelineFailure[];
  diagnoses: PipelineDiagnosis[];
  patches: PipelinePatch[];
  security?: PipelineSecurityScan | null;
  baselines: PipelinePerfBaseline[];
  comparisons: PipelinePerfComparison[];
}

export type PipelineFocusStage = "debug" | "codegen" | "security" | "performance";

export type StageStatus =
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "passed"
  | "blocked"
  | "flagged"
  | "skipped";

export type RunStageKey = "debugging" | "codegen" | "security" | "performance";

export type RunStageStatus = Record<RunStageKey, StageStatus>;

export interface RunSummary {
  id: string;
  repoName: string | null;
  repoUrl: string | null;
  branch: string | null;
  status: PipelineRun["status"];
  stage: string;
  stackDetected: string | null;
  failureCount: number;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  stageStatus: RunStageStatus;
}

export interface RunFull extends PipelineRun {
  stageStatus: RunStageStatus;
}
