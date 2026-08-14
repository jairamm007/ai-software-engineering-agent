import { useTheme } from "@/context/ThemeContext";
import { CheckCircle, XCircle, Clock, SkipForward, ChevronDown, ChevronUp } from "lucide-react";
import { SparkleLoader } from "@/components/common/SparkleLoader";
import { useState } from "react";
import type { AgentExecutionStep } from "@/services/multiAgent";

interface Props {
  steps: AgentExecutionStep[];
}

function StatusBadge({ status }: { status: AgentExecutionStep["status"] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const config = {
    completed: { icon: <CheckCircle size={12} />, label: "Done", cls: "text-emerald-400 bg-emerald-500/20" },
    running: { icon: <SparkleLoader size={12} />, label: "Running", cls: "text-[var(--accent)] bg-[var(--accent)]/20" },
    error: { icon: <XCircle size={12} />, label: "Error", cls: "text-red-400 bg-red-500/20" },
    skipped: { icon: <SkipForward size={12} />, label: "Skipped", cls: "text-slate-400 bg-slate-500/20" },
    pending: { icon: <Clock size={12} />, label: "Pending", cls: isDark ? "text-slate-500 bg-white/5" : "text-slate-400 bg-slate-100" },
  };

  const c = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

export default function AgentExecutionTimeline({ steps }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (steps.length === 0) return null;

  return (
    <div className={`rounded-xl border ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <div className={`border-b px-4 py-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Execution Timeline
        </h3>
      </div>

      <div className="divide-y divide-white/5">
        {steps.map((step, i) => (
          <div key={step.agent} className={`px-4 py-3 ${isDark ? "" : ""}`}>
            <button
              onClick={() => toggleExpand(i)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  step.status === "completed"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : step.status === "error"
                      ? "bg-red-500/20 text-red-400"
                      : step.status === "running"
                        ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                        : isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
                }`}>
                  {i + 1}
                </span>
                <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                  {step.label}
                </span>
                <StatusBadge status={step.status} />
              </div>

              <div className="flex items-center gap-2">
                {step.durationMs !== undefined && (
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {step.durationMs}ms
                  </span>
                )}
                {expanded.has(i) ? (
                  <ChevronUp size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                ) : (
                  <ChevronDown size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                )}
              </div>
            </button>

            {expanded.has(i) && (
              <div className="mt-3 ml-9 space-y-2">
                {step.output && (
                  <div>
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      Output
                    </span>
                    <p className={`mt-1 whitespace-pre-wrap text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {step.output}
                    </p>
                  </div>
                )}
                {step.error && (
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-red-400">
                      Error
                    </span>
                    <p className="mt-1 text-xs text-red-400">{step.error}</p>
                  </div>
                )}
                {step.startedAt && step.completedAt && (
                  <div className={`flex gap-4 text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    <span>Started: {new Date(step.startedAt).toLocaleTimeString()}</span>
                    <span>Ended: {new Date(step.completedAt).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
