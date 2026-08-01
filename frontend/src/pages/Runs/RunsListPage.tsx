import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, Workflow } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/pipeline/Badge";
import { listRuns } from "@/services/pipeline";
import {
  RUN_STATUS_ICONS,
  RUN_STATUS_STYLES,
  STAGE_DOT_COLOR,
  STAGE_LABELS,
  STAGE_ORDER,
  stageStatusOf,
} from "@/components/pipeline/runStatus.tsx";
import type { RunSummary } from "@/types/pipeline";

function isLive(run: RunSummary) {
  return run.status === "queued" || run.status === "running";
}

export default function RunsListPage() {
  const navigate = useNavigate();

  const { data: runs = [], isPending } = useQuery({
    queryKey: ["runs"],
    queryFn: () => listRuns({ limit: 50 }),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      return data.some(isLive) ? 3000 : false;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-violet-500/15 p-3 text-violet-500">
              <Workflow size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Runs</h1>
              <p className="text-sm text-slate-500">
                Full debug → codegen → security → performance pipeline runs.
              </p>
            </div>
          </div>
          <Button type="button" onClick={() => navigate("/runs/new")} className="flex items-center gap-2">
            <Plus size={16} /> New Run
          </Button>
        </div>

        <Card className="p-0">
          {isPending ? (
            <p className="p-6 text-sm text-slate-500">Loading runs…</p>
          ) : runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Workflow size={40} className="text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">No runs yet</p>
              <p className="text-xs text-slate-500">
                Start a new run to watch the full pipeline work through all four stages.
              </p>
              <Button
                type="button"
                onClick={() => navigate("/runs/new")}
                className="mt-2 flex items-center gap-2"
              >
                <Plus size={16} /> New Run
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {runs.map((run) => (
                <li key={run.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/runs/${run.id}`)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {run.repoName ?? run.repoUrl ?? run.id}
                        </span>
                        <Badge className={RUN_STATUS_STYLES[run.status]}>
                          {RUN_STATUS_ICONS[run.status]} {run.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">
                        {run.repoUrl ?? "—"}
                        {run.branch ? ` (${run.branch})` : ""}
                      </p>
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                      {STAGE_ORDER.map((key) => (
                        <div key={key} className="flex flex-col items-center gap-1">
                          <span
                            className={`h-2 w-2 rounded-full ${STAGE_DOT_COLOR[stageStatusOf(run.stageStatus, key)]}`}
                            aria-label={STAGE_LABELS[key]}
                            title={STAGE_LABELS[key]}
                          />
                          <span className="text-[10px] text-slate-400">{STAGE_LABELS[key]}</span>
                        </div>
                      ))}
                    </div>

                    <div className="hidden w-40 shrink-0 text-right text-xs text-slate-400 sm:block">
                      {new Date(run.createdAt).toLocaleString()}
                    </div>

                    <ChevronRight size={16} className="shrink-0 text-slate-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
