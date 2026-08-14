import { useTheme } from "@/context/ThemeContext";
import { SparkleLoader } from "@/components/common/SparkleLoader";
import {
  Brain, Search, Lightbulb, MessageSquare, Code, Wrench,
  GitCommit, LayoutGrid, FileText, GitPullRequest, FlaskConical,
  Shield, CheckCircle, XCircle, Clock, SkipForward,
} from "lucide-react";
import type { AgentExecutionStep, AgentName } from "@/services/multiAgent";

interface Props {
  step: AgentExecutionStep;
  isActive?: boolean;
}

const AGENT_ICONS: Record<AgentName, React.ReactNode> = {
  planner: <Brain size={18} />,
  retriever: <Search size={18} />,
  reasoner: <Lightbulb size={18} />,
  answer: <MessageSquare size={18} />,
  codeReview: <Code size={18} />,
  fix: <Wrench size={18} />,
  commitMessage: <GitCommit size={18} />,
  architecture: <LayoutGrid size={18} />,
  documentation: <FileText size={18} />,
  pullRequest: <GitPullRequest size={18} />,
  testGenerator: <FlaskConical size={18} />,
  security: <Shield size={18} />,
};

const AGENT_COLORS: Record<AgentName, string> = {
  planner: "text-purple-400 bg-purple-500/20 border-purple-500/30",
  retriever: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  reasoner: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  answer: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  codeReview: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
  fix: "text-orange-400 bg-orange-500/20 border-orange-500/30",
  commitMessage: "text-teal-400 bg-teal-500/20 border-teal-500/30",
  architecture: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
  documentation: "text-pink-400 bg-pink-500/20 border-pink-500/30",
  pullRequest: "text-violet-400 bg-violet-500/20 border-violet-500/30",
  testGenerator: "text-lime-400 bg-lime-500/20 border-lime-500/30",
  security: "text-red-400 bg-red-500/20 border-red-500/30",
};

function StatusIcon({ status }: { status: AgentExecutionStep["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle size={14} className="text-emerald-400" />;
    case "error":
      return <XCircle size={14} className="text-red-400" />;
    case "running":
      return <SparkleLoader size={14} />;
    case "skipped":
      return <SkipForward size={14} className="text-slate-500" />;
    default:
      return <Clock size={14} className="text-slate-500" />;
  }
}

export default function AgentCard({ step, isActive }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colorClass = AGENT_COLORS[step.agent] || "text-slate-400 bg-slate-500/20 border-slate-500/30";

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all ${
        isActive
          ? `border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10 ${colorClass}`
          : step.status === "completed"
            ? `${colorClass} opacity-80`
            : step.status === "error"
              ? "border-red-500/30 bg-red-500/10"
              : step.status === "skipped"
                ? isDark ? "border-white/5 bg-white/[0.02] opacity-40" : "border-slate-100 bg-slate-50 opacity-40"
                : isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${colorClass}`}>
            {AGENT_ICONS[step.agent]}
          </div>
          <div>
            <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {step.label}
            </h4>
            {step.durationMs !== undefined && (
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {step.durationMs}ms
              </span>
            )}
          </div>
        </div>
        <StatusIcon status={step.status} />
      </div>

      {step.output && step.status === "completed" && (
        <p className={`mt-3 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {step.output.length > 150 ? step.output.slice(0, 150) + "..." : step.output}
        </p>
      )}

      {step.error && step.status === "error" && (
        <p className="mt-3 text-xs text-red-400">
          {step.error}
        </p>
      )}
    </div>
  );
}
