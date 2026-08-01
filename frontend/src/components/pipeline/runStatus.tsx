import {
  CheckCircle2,
  Clock,
  LoaderCircle,
  RotateCcw,
  ShieldX,
  XCircle,
} from "lucide-react";
import type { PipelineRun, RunStageKey, RunStageStatus, StageStatus } from "@/types/pipeline";

export const STAGE_ORDER: RunStageKey[] = ["debugging", "codegen", "security", "performance"];

export const STAGE_LABELS: Record<RunStageKey, string> = {
  debugging: "Debugging",
  codegen: "Code Gen",
  security: "Security",
  performance: "Perf",
};

export const RUN_STATUS_STYLES: Record<PipelineRun["status"], string> = {
  queued: "bg-slate-500/15 text-slate-500",
  running: "bg-blue-500/15 text-blue-500",
  done: "bg-emerald-500/15 text-emerald-500",
  failed: "bg-rose-500/15 text-rose-500",
  rejected: "bg-amber-500/15 text-amber-500",
  blocked: "bg-red-500/15 text-red-500",
};

export const RUN_STATUS_ICONS: Record<PipelineRun["status"], React.ReactNode> = {
  queued: <Clock size={12} />,
  running: <LoaderCircle size={12} className="animate-spin" />,
  done: <CheckCircle2 size={12} />,
  failed: <XCircle size={12} />,
  rejected: <RotateCcw size={12} />,
  blocked: <ShieldX size={12} />,
};

export const TERMINAL_STATUSES: PipelineRun["status"][] = ["done", "failed", "rejected", "blocked"];

export const STAGE_DOT_COLOR: Record<StageStatus, string> = {
  pending: "bg-slate-400/70",
  running: "bg-blue-400 animate-pulse",
  done: "bg-emerald-400",
  passed: "bg-emerald-400",
  failed: "bg-rose-400",
  blocked: "bg-red-400",
  flagged: "bg-amber-400",
  skipped: "bg-slate-500/40",
};

export const STAGE_TEXT_COLOR: Record<StageStatus, string> = {
  pending: "text-slate-400",
  running: "text-blue-400",
  done: "text-emerald-400",
  passed: "text-emerald-400",
  failed: "text-rose-400",
  blocked: "text-red-400",
  flagged: "text-amber-400",
  skipped: "text-slate-500",
};

export const PATCH_STYLES: Record<string, string> = {
  proposed: "bg-slate-500/15 text-slate-500",
  applied: "bg-emerald-500/15 text-emerald-500",
  reverted: "bg-amber-500/15 text-amber-500",
  rejected: "bg-rose-500/15 text-rose-500",
};

export const severityBadge = (severity: string): string => {
  const s = severity.toLowerCase();
  if (s === "critical" || s === "high") return "bg-rose-500/15 text-rose-500";
  if (s === "medium") return "bg-amber-500/15 text-amber-500";
  return "bg-slate-500/15 text-slate-500";
};

export const stageToTab: Record<string, RunStageKey> = {
  debug: "debugging",
  codegen: "codegen",
  security: "security",
  performance: "performance",
};

export const isRunLive = (run: { status: PipelineRun["status"] } | undefined): boolean =>
  !!run && (run.status === "queued" || run.status === "running");

export const stageStatusOf = (stageStatus: RunStageStatus | undefined, key: RunStageKey): StageStatus =>
  stageStatus?.[key] ?? "pending";
