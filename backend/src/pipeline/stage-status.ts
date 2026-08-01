import type { PipelineStage } from "./types.js";

export type StageStatus =
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "passed"
  | "blocked"
  | "flagged"
  | "skipped";

export type StageStatusObject = {
  debugging: StageStatus;
  codegen: StageStatus;
  security: StageStatus;
  performance: StageStatus;
};

export interface StageStatusInput {
  status: string;
  stage: string;
  failures: Array<{ id: string }>;
  diagnoses: Array<{ id: string }>;
  patches: Array<{ status: string }>;
  security: { blocked: boolean; status: string } | null;
  baselines: Array<{ id: string }>;
  comparisons: Array<{ flagged: boolean }>;
}

const STAGE_ORDER: PipelineStage[] = ["debug", "codegen", "security", "performance"];

export const computeStageStatus = (run: StageStatusInput): StageStatusObject => {
  const status = run.status;
  const stage = run.stage as PipelineStage;
  const progressedPast = (target: PipelineStage) =>
    STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(target);
  const allTestsPassedEarly = status === "done" && stage === "debug";
  const codegenRejected = status === "rejected" && stage === "codegen";

  let debugging: StageStatus = "pending";
  if (status === "queued") debugging = "pending";
  else if (status === "running" && stage === "debug") debugging = "running";
  else if (status === "failed" && stage === "debug") debugging = "failed";
  else if (
    run.diagnoses.length > 0 ||
    run.failures.length > 0 ||
    progressedPast("debug") ||
    ["done", "rejected", "blocked"].includes(status)
  ) {
    debugging = "done";
  }

  let codegen: StageStatus = "pending";
  if (allTestsPassedEarly) codegen = "skipped";
  else if (status === "queued") codegen = "pending";
  else if (status === "running" && stage === "codegen") codegen = "running";
  else if (codegenRejected) codegen = "failed";
  else if (status === "failed" && stage === "codegen") codegen = "failed";
  else if (run.patches.length > 0) codegen = "done";
  else if (progressedPast("codegen")) codegen = "done";
  else if (["done", "rejected", "blocked"].includes(status)) codegen = "done";

  let security: StageStatus = "pending";
  const scan = run.security;
  if (allTestsPassedEarly || codegenRejected) security = "skipped";
  else if (scan) {
    if (scan.blocked) security = "blocked";
    else if (scan.status === "failed") security = "failed";
    else if (scan.status === "running") security = "running";
    else security = "passed";
  } else if (status === "running" && stage === "security") security = "running";
  else if (status === "failed" && stage === "security") security = "failed";
  else if (progressedPast("security")) security = "skipped";
  else if (["done", "blocked"].includes(status)) security = "skipped";

  let performance: StageStatus = "pending";
  if (allTestsPassedEarly || codegenRejected || security === "blocked") performance = "skipped";
  else if (status === "running" && stage === "performance") performance = "running";
  else if (status === "failed" && stage === "performance") performance = "failed";
  else if (run.comparisons.length > 0)
    performance = run.comparisons.some((c) => c.flagged) ? "flagged" : "done";
  else if (run.baselines.length > 0) performance = "done";
  else if (status === "done") performance = "skipped";
  else performance = "pending";

  return { debugging, codegen, security, performance };
};
