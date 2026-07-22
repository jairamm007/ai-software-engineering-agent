import { useTheme } from "@/context/ThemeContext";
import { ArrowRight, Zap } from "lucide-react";
import type { AgentExecutionStep } from "@/services/multiAgent";

interface Props {
  steps: AgentExecutionStep[];
}

export default function AgentPipeline({ steps }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (steps.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return isDark ? "bg-emerald-500" : "bg-emerald-400";
      case "running": return "bg-[var(--accent)] animate-pulse";
      case "error": return "bg-red-500";
      case "skipped": return isDark ? "bg-slate-600" : "bg-slate-300";
      default: return isDark ? "bg-slate-700" : "bg-slate-200";
    }
  };

  return (
    <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <div className="mb-3 flex items-center gap-2">
        <Zap size={16} className="text-yellow-400" />
        <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Pipeline Flow
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.agent} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
              isDark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600"
            }`}>
              <div className={`h-2 w-2 rounded-full ${getStatusColor(step.status)}`} />
              <span>{step.label}</span>
              {step.durationMs !== undefined && (
                <span className={isDark ? "text-slate-500" : "text-slate-400"}>
                  {step.durationMs}ms
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <ArrowRight size={14} className={isDark ? "text-slate-600" : "text-slate-300"} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
