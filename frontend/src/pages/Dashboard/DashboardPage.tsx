import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  FolderGit2,
  FileCode2,
  Layers,
  Cpu,
  Plus,
  ArrowRight,
  GitBranch,
  MessageSquare,
  BookOpen,
  Shield,
  Check,
  X,
  Clock,
  GitPullRequest,
  Brain,
  ChevronRight,
  Zap,
  Rocket,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import DashboardLayout from "@/layouts/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import GlassCard from "@/components/motion/GlassCard";
import Tilt3D from "@/components/motion/Tilt3D";
import AnimatedNumber from "@/components/motion/AnimatedNumber";
import SparkleMark from "@/components/common/SparkleMark";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

import { getRepositories } from "@/services/repository";
import { getAIProviders } from "@/services/aiProviders";
import { getConversations } from "@/services/chat";
import type { RepositoryListItem } from "@/types/repository";
import type { Conversation } from "@/types/chat";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { cn } from "@/lib/utils";

interface Activity {
  action: string;
  target: string;
  repo: string;
  timestamp: number;
  type: "ai" | "chat" | "review" | "repo" | "docs";
}

const TYPE_CONFIG: Record<
  Activity["type"],
  { icon: typeof Brain; badge: string; text: string }
> = {
  ai: { icon: Brain, badge: "bg-violet-500/15 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-300" },
  chat: { icon: MessageSquare, badge: "bg-violet-500/15 dark:bg-violet-500/20", text: "text-violet-600 dark:text-violet-300" },
  review: { icon: GitPullRequest, badge: "bg-emerald-500/15 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-300" },
  repo: { icon: FolderGit2, badge: "bg-cyan-500/15 dark:bg-cyan-500/20", text: "text-cyan-600 dark:text-cyan-300" },
  docs: { icon: FileCode2, badge: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-300" },
};

const ACTIVITY_STORAGE_KEY = "activity-log";
const ACTIVITY_EVENT_NAME = "asea-activity";

function loadDashboardActivity(): Activity[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function shortRepoName(name: string): string {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

const capabilities = [
  { icon: GitBranch, label: "Code Review & Analysis", color: "accent-text-base" },
  { icon: BookOpen, label: "Architecture Documentation", color: "accent-text-base" },
  { icon: Layers, label: "Dependency Graph Analysis", color: "text-cyan-600 dark:text-cyan-300" },
  { icon: MessageSquare, label: "AI Chat Assistant", color: "text-emerald-600 dark:text-emerald-300", link: "/chat" },
  { icon: Shield, label: "Security Scanning", color: "text-amber-600 dark:text-amber-300" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string; color: string }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2 text-xs shadow-xl backdrop-blur-md",
        isDark
          ? "border-white/10 bg-[#151515]/95 text-slate-200"
          : "border-slate-200 bg-white/95 text-slate-700"
      )}
    >
      <p className={cn("mb-1 font-semibold", isDark ? "text-white" : "text-slate-900")}>
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="capitalize opacity-70">{p.name}:</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();

  const [activities, setActivities] = useState<Activity[]>(loadDashboardActivity);

  useEffect(() => {
    const handler = (e: CustomEvent<Activity>) => {
      setActivities((prev) => [e.detail, ...prev].slice(0, 50));
    };
    window.addEventListener(ACTIVITY_EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(ACTIVITY_EVENT_NAME, handler as EventListener);
  }, []);

  const { data = [], isLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
  });

  const { data: aiProvidersData } = useQuery({
    queryKey: ["ai-providers"],
    queryFn: getAIProviders,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const totalRepositories = data.length;

  const totalFiles = useMemo(
    () => data.reduce((sum: number, repo: RepositoryListItem) => sum + repo._count.files, 0),
    [data]
  );

  const totalChunks = useMemo(
    () =>
      data.reduce(
        (sum: number, repo: RepositoryListItem) =>
          sum +
          repo.files.reduce(
            (chunkSum: number, file: { _count: { chunks: number } }) =>
              chunkSum + file._count.chunks,
            0
          ),
        0
      ),
    [data]
  );

  const providerCount = aiProvidersData?.count ?? 0;
  const configuredCount = aiProvidersData?.providers?.filter((p) => p.configured).length ?? 0;
  const providers = aiProvidersData?.providers ?? [];

  const recentRepos = useMemo(
    () =>
      [...data]
        .sort(
          (a: RepositoryListItem, b: RepositoryListItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [data]
  );

  const chartData = useMemo(
    () =>
      [...data]
        .sort(
          (a: RepositoryListItem, b: RepositoryListItem) =>
            b.files.reduce((s, f) => s + f._count.chunks, 0) -
            a.files.reduce((s, f) => s + f._count.chunks, 0)
        )
        .slice(0, 8)
        .map((repo: RepositoryListItem) => ({
          name: shortRepoName(repo.name),
          fullName: repo.name,
          files: repo._count.files,
          chunks: repo.files.reduce(
            (s: number, f: { _count: { chunks: number } }) => s + f._count.chunks,
            0
          ),
        })),
    [data]
  );

  const chartColors = {
    files: isDark ? "#8b5cf6" : "#6d4de0",
    chunks: isDark ? "#22d3ee" : "#0891b2",
    grid: isDark ? "rgba(255,255,255,0.06)" : "rgba(20,20,40,0.06)",
    tick: isDark ? "#a8a7bd" : "#5a5a6e",
  };

  const providerTone = configuredCount > 0 ? "emerald" : "amber";

  const quickActions = [
    {
      to: "/runs/new",
      icon: Rocket,
      label: "Start a New Run",
      hint: "Debug → codegen → security pipeline",
      badge: "bg-violet-500/15 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300",
    },
    {
      to: "/repositories",
      icon: FolderGit2,
      label: "Add Repository",
      hint: "Clone & index a GitHub repo",
      badge: "bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300",
    },
    {
      to: "/chat",
      icon: MessageSquare,
      label: "Start AI Chat",
      hint: "Ask questions about your code",
      badge: "bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300",
    },
    {
      to: "/github",
      icon: GitBranch,
      label: "Connect GitHub",
      hint: "Link your GitHub account",
      badge: "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
    },
  ];

  const secondaryBtn =
    "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all active:translate-y-px active:scale-[0.98] " +
    (isDark
      ? "border-white/15 bg-white/[0.06] text-slate-200 hover:border-white/30 hover:bg-white/10 hover:shadow-md"
      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm");

  return (
    <DashboardLayout>
      {/* ── Compact header bar (single line) ─────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <SparkleMark size={40} className="drop-shadow-lg" />
          <div className="min-w-0">
            <h1
              className={cn(
                "truncate text-lg font-bold leading-tight sm:text-xl",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Dashboard
              {user && (
                <span className={cn("font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                  {" "}
                  · {getGreeting()}, {user.name.split(" ")[0]}
                </span>
              )}
            </h1>
            <p className={cn("text-xs sm:text-sm", isDark ? "text-slate-500" : "text-slate-500")}>
              Overview of your AI-powered software engineering workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Tilt3D maxTilt={8} scale={1.02} className="h-full">
            <Link
              to="/runs/new"
              className="shine inline-flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white shadow-md accent-shadow transition-all hover:shadow-lg hover:accent-shadow-lg active:translate-y-px active:scale-[0.98]"
            >
              <Rocket size={15} /> New Run
            </Link>
          </Tilt3D>
          <Tilt3D maxTilt={8} scale={1.02} className="h-full">
            <Link to="/repositories" className={secondaryBtn}>
              <Plus size={15} /> Add Repository
            </Link>
          </Tilt3D>
        </div>
      </motion.header>

      {/* ── Stat cards (unified badge system) ───────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants} className="h-full">
          <StatCard
            title="Repositories"
            value={totalRepositories}
            icon={<FolderGit2 size={20} />}
            tone="violet"
            status={totalRepositories > 0 ? "Indexed" : "Empty"}
            index={0}
            infoContent={
              <div>
                <p className="mb-2 font-semibold">Repository Analysis</p>
                <p className="mb-2 text-xs opacity-80">
                  Total GitHub repositories cloned and indexed for AI-powered analysis.
                </p>
                {data.length > 0 ? (
                  <ul className="space-y-1">
                    {data.slice(0, 5).map((repo: RepositoryListItem) => (
                      <li key={repo.id} className="flex items-center gap-1 text-xs">
                        <FolderGit2 size={12} className="shrink-0 opacity-50" />
                        <span className="truncate">{repo.name}</span>
                      </li>
                    ))}
                    {data.length > 5 && (
                      <li className="text-xs opacity-60">+{data.length - 5} more</li>
                    )}
                  </ul>
                ) : (
                  <p className="text-xs opacity-60">No repositories indexed yet.</p>
                )}
              </div>
            }
          />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full">
          <StatCard
            title="Files Indexed"
            value={totalFiles}
            icon={<FileCode2 size={20} />}
            tone="blue"
            index={1}
            infoContent={
              <div>
                <p className="mb-2 font-semibold">Indexed Source Files</p>
                <p className="mb-2 text-xs opacity-80">
                  Individual source files extracted from repositories and parsed for code understanding.
                </p>
                <p className="text-xs opacity-80">
                  Files are split into semantic chunks for precise retrieval during AI analysis and chat.
                </p>
              </div>
            }
          />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full">
          <StatCard
            title="Code Chunks"
            value={totalChunks}
            icon={<Layers size={20} />}
            tone="cyan"
            index={2}
            infoContent={
              <div>
                <p className="mb-2 font-semibold">Code Chunks</p>
                <p className="mb-2 text-xs opacity-80">
                  Semantic code segments used for vector embedding and retrieval-augmented generation (RAG).
                </p>
                <p className="text-xs opacity-80">
                  Each chunk is embedded and indexed to enable accurate AI-powered code search and context.
                </p>
              </div>
            }
          />
        </motion.div>
        <motion.div variants={itemVariants} className="h-full">
          <StatCard
            title="AI Providers"
            value={providerCount}
            icon={<Cpu size={20} />}
            tone={providerTone}
            status={
              configuredCount > 0
                ? `${configuredCount} Active`
                : "Setup required"
            }
            index={3}
            infoContent={
              <div>
                <p className="mb-2 font-semibold">Configured AI Providers</p>
                <p className="mb-2 text-xs opacity-80">
                  LLM providers with API keys configured for code analysis, chat, and embeddings.
                </p>
                {providers.length > 0 ? (
                  <ul className="space-y-1.5">
                    {providers.map((p) => (
                      <li key={p.key} className="flex items-center gap-2 text-xs">
                        {p.configured ? (
                          <Check size={12} className="shrink-0 text-emerald-500" />
                        ) : (
                          <X size={12} className="shrink-0 text-amber-500" />
                        )}
                        <span className={p.configured ? "" : "opacity-50"}>{p.name}</span>
                        <span className="ml-auto opacity-50">
                          {p.configured ? "Active" : "Not configured"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs opacity-60">Loading provider status...</p>
                )}
              </div>
            }
          />
        </motion.div>
      </motion.div>

      {/* ── Visual anchor: indexed code chart ───────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <GlassCard
          gradientBorder
          tilt={4}
          rounded="rounded-3xl"
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-bg-light">
                <ActivityIcon size={18} className="accent-text-base" />
              </div>
              <div>
                <h2 className={cn("text-base font-semibold sm:text-lg", isDark ? "text-white" : "text-slate-900")}>
                  Indexed Code by Repository
                </h2>
                <p className={cn("text-xs sm:text-sm", isDark ? "text-slate-500" : "text-slate-500")}>
                  Source files and semantic chunks parsed across your workspace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors.files }} />
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Files</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors.chunks }} />
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Chunks</span>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold tabular-nums",
                  isDark ? "bg-white/5 text-slate-200" : "bg-slate-100 text-slate-700"
                )}
              >
                <AnimatedNumber value={totalChunks} />
                <span className="font-normal opacity-60">total chunks</span>
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl accent-bg-light">
                <ActivityIcon size={26} className="accent-text-base" />
              </div>
              <p className={cn("text-base font-semibold", isDark ? "text-white" : "text-slate-800")}>
                No indexed code yet
              </p>
              <p className={cn("mt-1 max-w-sm text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                Add a repository to start parsing files and building your knowledge base.
              </p>
              <Link
                to="/repositories"
                className="mt-5 inline-flex items-center gap-2 rounded-xl accent-gradient px-5 py-2.5 text-sm font-medium text-white shadow-md accent-shadow transition-all hover:shadow-lg"
              >
                <Plus size={15} /> Add Repository
              </Link>
            </div>
          ) : (
            <div className="mt-5 h-64 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={3} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: chartColors.tick, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={chartData.length > 5 ? -18 : 0}
                    textAnchor={chartData.length > 5 ? "end" : "middle"}
                    height={chartData.length > 5 ? 38 : 26}
                  />
                  <YAxis
                    tick={{ fill: chartColors.tick, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
                  <Bar
                    dataKey="files"
                    name="Files"
                    stackId="a"
                    fill={chartColors.files}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="chunks"
                    name="Chunks"
                    stackId="a"
                    fill={chartColors.chunks}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ── Main content grid ──────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
        {/* Recent Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="min-w-0 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-800")}>
              Recent Repositories
            </h2>
            {data.length > 0 && (
              <Link to="/repositories" className="flex items-center gap-1 text-sm font-medium accent-text-base hover:opacity-80">
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {isLoading ? (
            <GlassCard className="p-10 text-center">
              <LoadingIndicator size="md" />
              <p className={cn("mt-3 text-sm", isDark ? "text-slate-400" : "text-slate-400")}>Loading repositories...</p>
            </GlassCard>
          ) : recentRepos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn("rounded-2xl border border-dashed p-12 text-center glass", isDark ? "border-slate-600" : "border-slate-300")}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl accent-bg-light">
                <FolderGit2 size={28} className="accent-text-base" />
              </div>
              <p className={cn("mb-2 text-lg font-semibold", isDark ? "text-white" : "text-slate-700")}>
                No repositories yet
              </p>
              <p className={cn("mb-6 text-sm", isDark ? "text-slate-400" : "text-slate-400")}>
                Analyze a GitHub repository to get started.
              </p>
              <Link
                to="/repositories"
                className="inline-flex items-center gap-2 rounded-xl accent-gradient px-6 py-3 text-sm font-medium text-white shadow-lg accent-shadow transition-all hover:shadow-xl active:translate-y-px active:scale-[0.98]"
              >
                <Plus size={16} /> Add Repository
              </Link>
            </motion.div>
          ) : (
            <GlassCard rounded="rounded-2xl" className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead className={isDark ? "bg-white/[0.03]" : "bg-slate-50/80"}>
                    <tr>
                      {["Repository", "Files", "Chunks", "Created"].map((h) => (
                        <th key={h} className={cn("p-4 text-left text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRepos.map((repo: RepositoryListItem, index: number) => {
                      const files = repo._count.files;
                      const chunks = repo.files.reduce(
                        (sum: number, file: { _count: { chunks: number } }) => sum + file._count.chunks, 0
                      );
                      return (
                        <motion.tr
                          key={repo.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className={cn(
                            "border-t transition-colors",
                            isDark ? "border-white/[0.06] hover:bg-white/[0.04]" : "border-slate-100 hover:bg-slate-50/80"
                          )}
                        >
                          <td className="p-4">
                            <Link to={`/repositories/${repo.id}`} className="flex items-center gap-2 font-medium accent-text-base hover:opacity-80">
                              <FolderGit2 size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
                              <span className="truncate">{repo.name}</span>
                            </Link>
                          </td>
                          <td className={cn("p-4 text-sm font-semibold tabular-nums", isDark ? "text-slate-200" : "text-slate-700")}>
                            <AnimatedNumber value={files} />
                          </td>
                          <td className={cn("p-4 text-sm font-semibold tabular-nums", isDark ? "text-slate-200" : "text-slate-700")}>
                            <AnimatedNumber value={chunks} />
                          </td>
                          <td className={cn("p-4 text-sm", isDark ? "text-slate-500" : "text-slate-400")}>
                            {new Date(repo.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Actions — always populated */}
          <GlassCard rounded="rounded-2xl" className="p-6">
            <h3 className={cn("mb-4 text-sm font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
              Quick Actions
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <Tilt3D key={qa.label} maxTilt={7} scale={1.02}>
                    <Link
                      to={qa.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-md"
                          : "border-slate-200 bg-white/60 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-md"
                      )}
                    >
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110", qa.badge)}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{qa.label}</p>
                        <p className={cn("truncate text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                          {qa.hint}
                        </p>
                      </div>
                      <ArrowRight size={14} className="shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </Tilt3D>
                );
              })}
            </div>
          </GlassCard>

          {/* Recent AI Chats */}
          <GlassCard rounded="rounded-2xl" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className={cn("text-sm font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
                Recent AI Chats
              </h3>
              {conversations.length > 0 && (
                <Link to="/chat" className="flex items-center gap-1 text-xs font-medium accent-text-base hover:opacity-80">
                  View all <ArrowRight size={12} />
                </Link>
              )}
            </div>
            {conversations.length === 0 ? (
              <div className={cn("rounded-xl border border-dashed p-5 text-center", isDark ? "border-slate-600 bg-white/[0.02]" : "border-slate-200 bg-slate-50")}>
                <MessageSquare size={20} className={cn("mx-auto mb-2", isDark ? "text-slate-500" : "text-slate-400")} />
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                  No conversations yet
                </p>
                <Link to="/chat" className="mt-2 inline-flex items-center gap-1 text-xs font-medium accent-text-base hover:opacity-80">
                  Start one <ArrowRight size={11} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 5).map((conv: Conversation, i: number) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                  >
                    <Link
                      to="/chat"
                      className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors", isDark ? "hover:bg-white/[0.05]" : "hover:bg-slate-50")}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg accent-bg-light transition-transform duration-300 group-hover:scale-110">
                        <MessageSquare size={14} className="accent-text-base" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", isDark ? "text-slate-200" : "text-slate-700")}>
                          {conv.title}
                        </p>
                        <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                          {timeAgo(new Date(conv.updatedAt).getTime())}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard rounded="rounded-2xl" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className={cn("text-sm font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
                Recent Activity
              </h3>
              <Link to="/history" className="flex items-center gap-1 text-xs font-medium accent-text-base hover:opacity-80">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {activities.length === 0 ? (
              <div className={cn("rounded-xl border border-dashed p-5 text-center", isDark ? "border-slate-600 bg-white/[0.02]" : "border-slate-200 bg-slate-50")}>
                <Clock size={20} className={cn("mx-auto mb-2", isDark ? "text-slate-500" : "text-slate-400")} />
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                  No activity yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 5).map((item, i) => {
                  const cfg = TYPE_CONFIG[item.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={`${item.timestamp}-${i}`}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5", isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50")}
                    >
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110", cfg.badge)}>
                        <Icon size={14} className={cfg.text} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                          {item.action}{" "}
                          <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                            {item.target}
                          </span>
                        </p>
                      </div>
                      <span className={cn("shrink-0 text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                        {timeAgo(item.timestamp)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* AI Capabilities */}
          <GlassCard rounded="rounded-2xl" className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className={cn("text-sm font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>
                AI Capabilities
              </h3>
              <Zap size={14} className="accent-text animate-glow-pulse" />
            </div>
            <ul className="space-y-3">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                const content = (
                  <motion.li
                    key={cap.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className={cn("group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors", isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50")}
                  >
                    <Icon size={16} className={cn(cap.color, "transition-transform duration-300 group-hover:scale-125")} />
                    <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                      {cap.label}
                    </span>
                    <ChevronRight size={14} className="ml-auto opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </motion.li>
                );

                if ("link" in cap && cap.link) {
                  return (
                    <Link key={cap.label} to={cap.link} className="block transition-opacity hover:opacity-80">
                      {content}
                    </Link>
                  );
                }

                return content;
              })}
            </ul>
          </GlassCard>

          {/* User Profile Card */}
          {user && (
            <Tilt3D maxTilt={8} scale={1.01} glare={false} spotlightColor="rgba(139, 92, 246, 0.08)">
              <Link
                to="/profile"
                className={cn(
                  "block rounded-2xl border glass p-6 shadow-sm transition-all hover:shadow-md",
                  isDark ? "border-white/[0.08]" : "border-slate-200/70"
                )}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="flex h-12 w-12 items-center justify-center rounded-full accent-gradient text-white text-lg font-bold shadow-sm"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate font-semibold", isDark ? "text-white" : "text-slate-900")}>
                      {user.name}
                    </p>
                    <p className={cn("truncate text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                      {user.email}
                    </p>
                    {user.role && (
                      <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium", isDark ? "bg-slate-700/70 text-slate-300" : "bg-slate-100 text-slate-600")}>
                        {user.role}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className={cn("transition-transform duration-300 group-hover:translate-x-0.5", isDark ? "text-slate-500" : "text-slate-400")} />
                </div>
              </Link>
            </Tilt3D>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
