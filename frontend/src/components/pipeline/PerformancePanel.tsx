import { Gauge, LineChart, TriangleAlert } from "lucide-react";
import Badge from "./Badge";
import type { PipelinePerfBaseline, RunFull } from "@/types/pipeline";

function StageRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function PerformancePanel({ run }: { run?: RunFull }) {
  if (!run) {
    return <p className="text-sm text-slate-500">Loading run state…</p>;
  }
  if (run.patches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Gauge size={32} className="text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium">No patch to benchmark yet</p>
        <p className="text-xs text-slate-500">Performance is compared before and after the patch is applied.</p>
      </div>
    );
  }

  const pre = run.baselines.find((b) => b.stage === "pre" && b.timeMs != null);
  const post = run.baselines.find((b) => b.stage === "post" && b.timeMs != null);
  const heuristicBaselines = run.baselines.filter((b) => b.heuristic && b.heuristic.length > 0);
  const hasRealBenchmark = !!pre && !!post;

  return (
    <div className="space-y-3">
      {!hasRealBenchmark && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
          <LineChart size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Static analysis only — no benchmark suite detected
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
              The repository has no runnable benchmark, so performance was estimated from code heuristics.
            </p>
          </div>
        </div>
      )}

      {hasRealBenchmark && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Baseline (pre-fix)</p>
            <StageRow label="Time" value={pre.timeMs != null ? `${pre.timeMs} ms` : "—"} />
            {pre.memoryMb != null && <StageRow label="Memory" value={`${pre.memoryMb} MB`} />}
            {pre.command && (
              <p className="mt-2 truncate font-mono text-[11px] text-slate-400">{pre.command}</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
            <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">After fix</p>
            <StageRow label="Time" value={post.timeMs != null ? `${post.timeMs} ms` : "—"} />
            {post.memoryMb != null && <StageRow label="Memory" value={`${post.memoryMb} MB`} />}
          </div>
        </div>
      )}

      {run.comparisons.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5">
              <tr>
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2">Before</th>
                <th className="px-3 py-2">After</th>
                <th className="px-3 py-2">Change</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {run.comparisons.map((comparison) => (
                <tr key={comparison.id} className="border-t border-slate-200 dark:border-white/10">
                  <td className="px-3 py-2 font-mono text-xs">{comparison.metric}</td>
                  <td className="px-3 py-2">{comparison.beforeValue ?? "—"}</td>
                  <td className="px-3 py-2">{comparison.afterValue ?? "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {comparison.pctChange != null
                      ? `${comparison.pctChange > 0 ? "+" : ""}${comparison.pctChange.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {comparison.flagged ? (
                      <Badge className="bg-amber-500/15 text-amber-500">
                        <TriangleAlert size={12} /> flagged
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-500">ok</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {heuristicBaselines.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Static heuristics <span className="font-normal normal-case">(heuristic-only, not blocking)</span>
          </p>
          {heuristicBaselines.flatMap((baseline: PipelinePerfBaseline) =>
            (baseline.heuristic ?? []).map((heuristic, index) => (
              <div
                key={`${baseline.id}-${index}`}
                className="flex items-start gap-2 rounded-lg border border-slate-200 p-2 text-sm dark:border-white/10"
              >
                <Gauge size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <Badge className="bg-slate-500/15 text-slate-500">{heuristic.kind}</Badge>
                  <span className="ml-2 font-mono text-xs text-slate-500">
                    {heuristic.file}:{heuristic.line}
                  </span>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{heuristic.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
