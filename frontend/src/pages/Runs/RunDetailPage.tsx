import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Code2, GitBranch } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Card from "@/components/ui/Card";
import StageTabs from "@/components/pipeline/StageTabs";
import DebuggingPanel from "@/components/pipeline/DebuggingPanel";
import CodeGenPanel from "@/components/pipeline/CodeGenPanel";
import SecurityPanel from "@/components/pipeline/SecurityPanel";
import PerformancePanel from "@/components/pipeline/PerformancePanel";
import Badge from "@/components/pipeline/Badge";
import { getRunFull } from "@/services/pipeline";
import {
  RUN_STATUS_ICONS,
  RUN_STATUS_STYLES,
  STAGE_ORDER,
  TERMINAL_STATUSES,
  stageToTab,
} from "@/components/pipeline/runStatus.tsx";
import type { RunFull, RunStageKey } from "@/types/pipeline";

const PANELS: Record<RunStageKey, (run?: RunFull) => React.ReactNode> = {
  debugging: (run) => <DebuggingPanel run={run} />,
  codegen: (run) => <CodeGenPanel run={run} />,
  security: (run) => <SecurityPanel run={run} />,
  performance: (run) => <PerformancePanel run={run} />,
};

export default function RunDetailPage() {
  const { runId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: run, isPending, isError } = useQuery({
    queryKey: ["run-full", runId],
    queryFn: () => getRunFull(runId as string),
    enabled: !!runId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      return TERMINAL_STATUSES.includes(data.status) ? false : 2000;
    },
  });

  const defaultTab: RunStageKey = run ? (stageToTab[run.stage] ?? "debugging") : "debugging";
  const tabParam = searchParams.get("tab") as RunStageKey | null;
  const activeTab: RunStageKey =
    tabParam && STAGE_ORDER.includes(tabParam) ? tabParam : defaultTab;

  const handleSelectTab = (key: RunStageKey) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-semibold">Run not found</p>
          <p className="text-sm text-slate-500">This run may not exist or you may not have access to it.</p>
          <button
            type="button"
            onClick={() => navigate("/runs")}
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Back to runs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate("/runs")}
          className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Back to runs
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{run?.repoName ?? "Run"}</h1>
            {run && (
              <Badge className={RUN_STATUS_STYLES[run.status]}>
                {RUN_STATUS_ICONS[run.status]} {run.status}
              </Badge>
            )}
            {run?.stackDetected && (
              <Badge className="bg-blue-500/15 text-blue-500">
                <Code2 size={12} /> {run.stackDetected}
              </Badge>
            )}
          </div>
          <div className="text-right text-xs text-slate-400">
            {run && (
              <p className="mb-0.5">
                {new Date(run.createdAt).toLocaleString()}
              </p>
            )}
            {run?.repoUrl && (
              <p className="flex items-center justify-end gap-1 font-mono text-[11px]">
                <GitBranch size={12} /> {run.repoUrl}
                {run.branch ? ` (${run.branch})` : ""}
              </p>
            )}
          </div>
        </div>

        {run?.summary && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-[var(--card-bg)] dark:text-slate-300">
            {run.summary}
          </div>
        )}

        <StageTabs active={activeTab} status={run?.stageStatus} onSelect={handleSelectTab} />

        <Card>
          {isPending && !run ? (
            <p className="text-sm text-slate-500">Loading run state…</p>
          ) : (
            PANELS[activeTab](run)
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
