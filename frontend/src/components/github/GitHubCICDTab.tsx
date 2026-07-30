import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  RotateCw,
  GitCommit,
  Box,
  Filter,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import {
  listGitHubWorkflowRuns,
  getGitHubWorkflowRunDetail,
  listGitHubDeployments,
} from "@/services/github-integration";
import type { GitHubWorkflowRun, GitHubWorkflowRunDetail, GitHubDeployment } from "@/types/github-integration";

interface GitHubCICDTabProps {
  integrationId: string;
  owner: string;
  repo: string;
  timeAgo: (d: string | Date) => string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function GitHubCICDTab({ integrationId, owner, repo, timeAgo, autoRefresh = false, refreshInterval = 15000 }: GitHubCICDTabProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [subTab, setSubTab] = useState<"runs" | "deployments">("runs");
  const [runFilter, setRunFilter] = useState<"all" | "completed" | "in_progress" | "failure">("all");
  const [selectedRun, setSelectedRun] = useState<number | null>(null);

  // ── Workflow Runs ──
  const { data: runsData, isLoading: runsLoading } = useQuery({
    queryKey: ["github-workflow-runs", integrationId, owner, repo, runFilter],
    queryFn: () =>
      listGitHubWorkflowRuns(integrationId, owner, repo, {
        status: runFilter === "all" ? undefined : runFilter,
      }),
    enabled: subTab === "runs",
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // ── Run Detail ──
  const { data: runDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["github-workflow-run-detail", integrationId, owner, repo, selectedRun],
    queryFn: () => getGitHubWorkflowRunDetail(integrationId, owner, repo, selectedRun!),
    enabled: selectedRun !== null,
  });

  // ── Deployments ──
  const { data: deployments = [], isLoading: deploymentsLoading } = useQuery({
    queryKey: ["github-deployments", integrationId, owner, repo],
    queryFn: () => listGitHubDeployments(integrationId, owner, repo),
    enabled: subTab === "deployments",
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  const runs = runsData?.runs ?? [];

  const statusIcon = (status: string | null, conclusion: string | null) => {
    if (status === "in_progress" || status === "queued") return <Loader2 size={14} className="animate-spin text-blue-400" />;
    if (conclusion === "success") return <CheckCircle size={14} className="text-emerald-400" />;
    if (conclusion === "failure" || conclusion === "timed_out") return <XCircle size={14} className="text-red-400" />;
    if (conclusion === "cancelled") return <AlertCircle size={14} className="text-slate-500" />;
    return <Clock size={14} className="text-yellow-400" />;
  };

  const statusColor = (status: string | null, conclusion: string | null) => {
    if (status === "in_progress") return "bg-blue-500/10 text-blue-400";
    if (conclusion === "success") return "bg-emerald-500/10 text-emerald-400";
    if (conclusion === "failure") return "bg-red-500/10 text-red-400";
    if (conclusion === "cancelled") return "bg-slate-500/10 text-slate-400";
    return "bg-yellow-500/10 text-yellow-400";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      {/* Sub-tabs */}
      <div className="mb-4 flex gap-2">
        {(["runs", "deployments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setSubTab(tab); setSelectedRun(null); }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              subTab === tab
                ? "bg-[var(--accent)] text-white"
                : isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab === "runs" ? <RotateCw size={12} /> : <Box size={12} />}
            {tab === "runs" ? "Workflow Runs" : "Deployments"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Workflow Runs ── */}
        {subTab === "runs" && (
          <motion.div key="runs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Run detail view */}
            {selectedRun && runDetail ? (
              <RunDetail detail={runDetail} loading={detailLoading} onBack={() => setSelectedRun(null)} isDark={isDark} timeAgo={timeAgo} statusIcon={statusIcon} />
            ) : (
              <>
                {/* Filter buttons */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {(["all", "completed", "in_progress", "failure"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setRunFilter(f)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        runFilter === f
                          ? "bg-[var(--accent)] text-white"
                          : isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {f === "all" && <Filter size={12} />}
                      {f === "in_progress" && <Loader2 size={12} />}
                      {f === "completed" && <CheckCircle size={12} />}
                      {f === "failure" && <XCircle size={12} />}
                      {f.charAt(0).toUpperCase() + f.slice(1).replace("_", " ")}
                    </button>
                  ))}
                  <span className={`self-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {runsData?.totalCount ?? 0} run{(runsData?.totalCount ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {runsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                    ))}
                  </div>
                ) : runs.length === 0 ? (
                  <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
                    <RotateCw size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No workflow runs found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {runs.map((run) => (
                      <button
                        key={run.id}
                        type="button"
                        onClick={() => setSelectedRun(run.id)}
                        className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {statusIcon(run.status, run.conclusion)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{run.runNumber}</span>
                            <span className={`truncate text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{run.name}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px]">
                            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
                              {run.branch}
                            </span>
                            <span className={isDark ? "text-slate-500" : "text-slate-400"}>{run.event}</span>
                            <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(run.createdAt)}</span>
                            {run.conclusion && (
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${statusColor(run.status, run.conclusion)}`}>
                                {run.conclusion}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={14} className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── Deployments ── */}
        {subTab === "deployments" && (
          <motion.div key="deployments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {deploymentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                ))}
              </div>
            ) : deployments.length === 0 ? (
              <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
                <Box size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No deployments found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deployments.map((dep) => (
                  <div
                    key={dep.id}
                    className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {dep.statuses.length > 0 ? (
                          statusIcon(dep.statuses[0].state === "success" ? "completed" : "in_progress", dep.statuses[0].state === "success" ? "success" : null)
                        ) : (
                          <Clock size={14} className="text-slate-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{dep.environment}</span>
                            <span className={`font-mono text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{dep.sha.slice(0, 7)}</span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                            <span className={isDark ? "text-slate-500" : "text-slate-400"}>{dep.ref}</span>
                            <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(dep.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      {dep.description && (
                        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{dep.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Run Detail sub-component ──
function RunDetail({ detail, loading, onBack, isDark, timeAgo, statusIcon }: {
  detail: GitHubWorkflowRunDetail;
  loading: boolean;
  onBack: () => void;
  isDark: boolean;
  timeAgo: (d: string | Date) => string;
  statusIcon: (status: string | null, conclusion: string | null) => React.ReactNode;
}) {
  if (loading) {
    return <div className={`h-32 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <button type="button" onClick={onBack} className={`flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
        ← Back to Runs
      </button>

      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {statusIcon(detail.status, detail.conclusion)}
              <span className={`font-mono text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>#{detail.runNumber}</span>
              <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{detail.name}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>{detail.branch}</span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>{detail.event}</span>
              <span className={isDark ? "text-slate-600" : "text-slate-400"}>{timeAgo(detail.createdAt)}</span>
              {detail.commitAuthor && (
                <span className={isDark ? "text-slate-500" : "text-slate-400"}>by {detail.commitAuthor}</span>
              )}
            </div>
          </div>
          <a href={detail.htmlUrl} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <ExternalLink size={12} /> View on GitHub
          </a>
        </div>
        {detail.commitMessage && (
          <p className={`mt-3 rounded-lg p-3 text-xs font-mono ${isDark ? "bg-black/30 text-slate-300" : "bg-slate-50 text-slate-700"}`}>
            {detail.commitMessage.slice(0, 200)}
          </p>
        )}
      </div>

      {/* Jobs */}
      {detail.jobs.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className={`border-b px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Jobs ({detail.jobs.length})</h3>
          </div>
          <div className="divide-y divide-white/5">
            {detail.jobs.map((job) => (
              <div key={job.id} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  {statusIcon(job.status, job.conclusion)}
                  <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{job.name}</span>
                  {job.conclusion && (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      job.conclusion === "success" ? "bg-emerald-500/10 text-emerald-400" :
                      job.conclusion === "failure" ? "bg-red-500/10 text-red-400" :
                      isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                    }`}>{job.conclusion}</span>
                  )}
                </div>
                {job.steps.length > 0 && (
                  <div className="mt-2 ml-6 space-y-1">
                    {job.steps.map((step) => (
                      <div key={step.number} className="flex items-center gap-2 text-[11px]">
                        {step.conclusion === "success" ? (
                          <CheckCircle size={10} className="text-emerald-400" />
                        ) : step.conclusion === "failure" ? (
                          <XCircle size={10} className="text-red-400" />
                        ) : (
                          <Clock size={10} className="text-slate-500" />
                        )}
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>{step.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
