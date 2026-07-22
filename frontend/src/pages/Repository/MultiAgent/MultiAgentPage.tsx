import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useMutation } from "@tanstack/react-query";
import BackButton from "@/components/common/BackButton";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import DashboardLayout from "@/layouts/DashboardLayout";
import AgentCard from "@/components/repository/multi-agent/AgentCard";
import AgentPipeline from "@/components/repository/multi-agent/AgentPipeline";
import AgentExecutionTimeline from "@/components/repository/multi-agent/AgentExecutionTimeline";
import { orchestrateMultiAgent } from "@/services/multiAgent";
import type { MultiAgentResult, AgentExecutionStep } from "@/services/multiAgent";
import {
  Play, Loader2, Sparkles, Zap, Clock, CheckCircle, RotateCcw,
} from "lucide-react";

const QUICK_PROMPTS = [
  { label: "Code Review", question: "Review this codebase for bugs and improvements" },
  { label: "Architecture", question: "Analyze the architecture and suggest improvements" },
  { label: "Security Audit", question: "Run a security audit on this codebase" },
  { label: "Generate Tests", question: "Generate unit tests for the main modules" },
  { label: "Documentation", question: "Generate API documentation for all endpoints" },
  { label: "Explain Code", question: "Explain how the authentication system works" },
];

export default function MultiAgentPage() {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<MultiAgentResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const orchestrateMutation = useMutation({
    mutationFn: (q: string) => orchestrateMultiAgent(q, id),
    onSuccess: (data) => {
      setResult(data);
      setActiveStepIndex(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    orchestrateMutation.mutate(question.trim());
  };

  const handleQuickPrompt = (prompt: string) => {
    setQuestion(prompt);
    orchestrateMutation.mutate(prompt);
  };

  const completedSteps = result?.steps.filter(s => s.status === "completed").length || 0;
  const totalSteps = result?.steps.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <BackButton />
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            Multi-Agent AI
          </h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Orchestrate specialized AI agents to analyze, review, and improve your codebase.
          </p>
        </div>
        <RepositoryTabs repositoryId={id!} />

        {/* Input Section */}
        <div className={`rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Agent Orchestrator
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about your codebase..."
              className={`flex-1 rounded-lg border px-4 py-3 text-sm ${
                isDark
                  ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-[var(--accent)]"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[var(--accent)]"
              } focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/50`}
            />
            <button
              type="submit"
              disabled={orchestrateMutation.isPending || !question.trim()}
              className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {orchestrateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              Run Agents
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => handleQuickPrompt(p.question)}
                disabled={orchestrateMutation.isPending}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isDark
                    ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className={`flex flex-wrap gap-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Task: <span className="font-semibold">{result.task}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Agents: <span className="font-semibold">{completedSteps}/{totalSteps}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Duration: <span className="font-semibold">{(result.totalDurationMs / 1000).toFixed(1)}s</span>
                </span>
              </div>
            </div>

            {/* Pipeline Flow */}
            <AgentPipeline steps={result.steps} />

            {/* Agent Cards Grid */}
            <div>
              <h3 className={`mb-3 text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Agent Results
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {result.steps.map((step) => (
                  <AgentCard
                    key={step.agent}
                    step={step}
                    isActive={step.status === "running"}
                  />
                ))}
              </div>
            </div>

            {/* Timeline */}
            <AgentExecutionTimeline steps={result.steps} />

            {/* Final Output */}
            <div className={`rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Final Output
                </h3>
                <button
                  onClick={() => { setResult(null); setQuestion(""); }}
                  className={`flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              </div>
              <div className={`whitespace-pre-wrap rounded-lg p-4 text-sm leading-relaxed ${
                isDark ? "bg-black/30 text-slate-300" : "bg-slate-50 text-slate-700"
              }`}>
                {result.finalOutput}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !orchestrateMutation.isPending && (
          <div className={`rounded-xl border p-12 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
            <Sparkles size={64} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-200"}`} />
            <h3 className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Multi-Agent Orchestration
            </h3>
            <p className={`mx-auto max-w-md text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              9 specialized agents work together to analyze your codebase.
              The Planner routes to the right agent, the Retriever finds relevant code,
              and the specialized agent delivers expert analysis.
            </p>
            <div className={`mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {["Planner", "Retriever", "Reasoner", "Code Review", "Architecture", "Security", "Testing", "Documentation", "Answer"].map((a) => (
                <div key={a} className={`rounded-lg border p-2 ${isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                  {a}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
