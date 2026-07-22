import { useState, useEffect } from "react";
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
  Sparkles,
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
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

import { getRepositories } from "@/services/repository";
import { getAIProviders } from "@/services/aiProviders";
import { getConversations } from "@/services/chat";
import type { RepositoryListItem } from "@/types/repository";
import type { Conversation } from "@/types/chat";

interface Activity {
  action: string;
  target: string;
  repo: string;
  timestamp: number;
  type: "ai" | "chat" | "review" | "repo" | "docs";
}

const TYPE_CONFIG: Record<
  Activity["type"],
  { icon: typeof Brain; bgClass: string; textClass: string }
> = {
  ai: { icon: Brain, bgClass: "accent-bg-light", textClass: "accent-text-base" },
  chat: { icon: MessageSquare, bgClass: "accent-bg-light", textClass: "accent-text-base" },
  review: { icon: GitPullRequest, bgClass: "bg-emerald-500/10", textClass: "text-emerald-500" },
  repo: { icon: FolderGit2, bgClass: "bg-cyan-500/10", textClass: "text-cyan-500" },
  docs: { icon: FileCode2, bgClass: "bg-amber-500/10", textClass: "text-amber-500" },
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

const capabilities = [
  { icon: GitBranch, label: "Code Review & Analysis", color: "accent-text-base" },
  { icon: BookOpen, label: "Architecture Documentation", color: "accent-text-base" },
  { icon: Layers, label: "Dependency Graph Analysis", color: "text-cyan-500" },
  { icon: MessageSquare, label: "AI Chat Assistant", color: "text-emerald-500", link: "/chat" },
  { icon: Shield, label: "Security Scanning", color: "text-amber-500" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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
    queryFn: getRepositories,
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
  const totalFiles = data.reduce(
    (sum: number, repo: RepositoryListItem) => sum + repo._count.files,
    0
  );
  const totalChunks = data.reduce(
    (sum: number, repo: RepositoryListItem) =>
      sum + repo.files.reduce(
        (chunkSum: number, file: { _count: { chunks: number } }) => chunkSum + file._count.chunks,
        0
      ),
    0
  );

  const providerCount = aiProvidersData?.count ?? 0;
  const providers = aiProvidersData?.providers ?? [];

  const recentRepos = [...data]
    .sort((a: RepositoryListItem, b: RepositoryListItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-lg accent-shadow">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
              {user ? `${getGreeting()}, ${user.name.split(" ")[0]}` : getGreeting()}
            </h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Overview of your AI-powered software engineering workspace
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Repositories"
            value={totalRepositories}
            icon={<FolderGit2 size={20} />}
            gradient="accent-gradient"
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
        <motion.div variants={itemVariants}>
          <StatCard
            title="Files Indexed"
            value={totalFiles}
            icon={<FileCode2 size={20} />}
            gradient="accent-gradient"
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
        <motion.div variants={itemVariants}>
          <StatCard
            title="Code Chunks"
            value={totalChunks}
            icon={<Layers size={20} />}
            gradient="from-cyan-500 to-blue-600"
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
        <motion.div variants={itemVariants}>
          <StatCard
            title="AI Providers"
            value={providerCount}
            icon={<Cpu size={20} />}
            gradient="from-emerald-500 to-teal-600"
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
                          <X size={12} className="shrink-0 text-red-400" />
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              Recent Repositories
            </h2>
            {data.length > 0 && (
              <Link to="/repositories" className="flex items-center gap-1 text-sm font-medium accent-text-base hover:opacity-80">
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className={`rounded-2xl border p-10 text-center shadow-sm ${
              isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
            }`}>
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>Loading repositories...</p>
            </div>
          ) : recentRepos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl border border-dashed p-12 text-center shadow-sm ${
                isDark ? "border-slate-600 bg-slate-800/50" : "border-slate-300 bg-white"
              }`}
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl accent-bg-light`}>
                <FolderGit2 size={28} className="accent-text-base" />
              </div>
              <p className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>
                No repositories yet
              </p>
              <p className={`mb-6 text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                Analyze a GitHub repository to get started.
              </p>
              <Link
                to="/repositories"
                className="inline-flex items-center gap-2 rounded-xl accent-gradient px-6 py-3 text-sm font-medium text-white shadow-lg accent-shadow transition-shadow hover:shadow-xl hover:accent-shadow-lg"
              >
                <Plus size={16} /> Add Repository
              </Link>
            </motion.div>
          ) : (
            <div className={`overflow-x-auto rounded-2xl border shadow-sm ${
              isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
            }`}>
              <table className="w-full border-collapse min-w-[500px]">
                <thead className={isDark ? "bg-slate-700/50" : "bg-slate-50/80"}>
                  <tr>
                    {["Repository", "Files", "Chunks", "Created"].map((h) => (
                      <th key={h} className={`p-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}>
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
                        className={`border-t transition-colors ${
                          isDark ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="p-4">
                          <Link to={`/repositories/${repo.id}`} className="flex items-center gap-2 font-medium accent-text-base hover:opacity-80">
                            <FolderGit2 size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
                            {repo.name}
                          </Link>
                        </td>
                        <td className={`p-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{files}</td>
                        <td className={`p-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{chunks}</td>
                        <td className={`p-4 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(repo.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
          }`}>
            <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/repositories"
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  isDark
                    ? "border-slate-600 accent-bg-light text-slate-200 hover:border-[var(--accent)]/30 hover:shadow-md"
                    : "border-slate-100 accent-bg-light text-slate-700 hover:border-[var(--accent)]/20 hover:shadow-md"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-gradient text-white shadow-sm">
                  <Plus size={14} />
                </div>
                Add New Repository
              </Link>
              <Link
                to="/repositories"
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  isDark
                    ? "border-slate-600 bg-slate-700/50 text-slate-200 hover:border-slate-500 hover:bg-slate-700"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white hover:shadow-md"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"
                }`}>
                  <FolderGit2 size={14} />
                </div>
                Browse All Repositories
              </Link>
              <Link
                to="/chat"
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  isDark
                    ? "border-slate-600 accent-bg-light text-slate-200 hover:border-[var(--accent)]/30 hover:shadow-md"
                    : "border-slate-100 accent-bg-light text-slate-700 hover:border-[var(--accent)]/20 hover:shadow-md"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-gradient text-white shadow-sm">
                  <MessageSquare size={14} />
                </div>
                Start AI Chat
              </Link>
            </div>
          </div>

          {/* User Profile Card */}
          {user && (
            <Link
              to="/profile"
              className={`block rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${
                isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full accent-gradient text-white text-lg font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {user.name}
                  </p>
                  <p className={`truncate text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {user.email}
                  </p>
                  {user.role && (
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}>
                      {user.role}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
              </div>
            </Link>
          )}

          {/* Recent AI Chats */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
          }`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Recent AI Chats
              </h3>
              {conversations.length > 0 && (
                <Link to="/chat" className={`flex items-center gap-1 text-xs font-medium accent-text-base hover:opacity-80`}>
                  View all <ArrowRight size={12} />
                </Link>
              )}
            </div>
            {conversations.length === 0 ? (
              <div className={`rounded-xl border border-dashed p-4 text-center ${
                isDark ? "border-slate-600 bg-slate-800/50" : "border-slate-200 bg-slate-50"
              }`}>
                <MessageSquare size={20} className={`mx-auto mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No conversations yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 5).map((conv: Conversation) => (
                  <Link
                    key={conv.id}
                    to="/chat"
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg accent-bg-light`}>
                      <MessageSquare size={14} className="accent-text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {conv.title}
                      </p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {timeAgo(new Date(conv.updatedAt).getTime())}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
          }`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                Recent Activity
              </h3>
              <Link to="/history" className={`flex items-center gap-1 text-xs font-medium accent-text-base hover:opacity-80`}>
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {activities.length === 0 ? (
              <div className={`rounded-xl border border-dashed p-4 text-center ${
                isDark ? "border-slate-600 bg-slate-800/50" : "border-slate-200 bg-slate-50"
              }`}>
                <Clock size={20} className={`mx-auto mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No activity yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 5).map((item, i) => {
                  const cfg = TYPE_CONFIG[item.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={`${item.timestamp}-${i}`}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                        isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bgClass}`}>
                        <Icon size={14} className={cfg.textClass} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {item.action}{" "}
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {item.target}
                          </span>
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Capabilities */}
          <div className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? "border-slate-700 bg-slate-800/80" : "border-slate-200 bg-white"
          }`}>
            <h3 className={`mb-4 text-sm font-semibold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              AI Capabilities
            </h3>
            <ul className="space-y-3">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                const content = (
                  <motion.li
                    key={cap.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <Icon size={16} className={cap.color} />
                    <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {cap.label}
                    </span>
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
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
