import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  GitPullRequest,
  MessageSquare,
  FileCode2,
  FolderGit2,
  Brain,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getRepositories } from "@/services/repository";

interface Activity {
  action: string;
  target: string;
  repo: string;
  timestamp: number;
  type: "ai" | "chat" | "review" | "repo" | "docs";
}

const TYPE_CONFIG: Record<
  Activity["type"],
  { icon: typeof Brain; color: string; bgClass: string; textClass: string }
> = {
  ai: { icon: Brain, color: "accent", bgClass: "accent-bg-light", textClass: "accent-text-base" },
  chat: { icon: MessageSquare, color: "accent", bgClass: "accent-bg-light", textClass: "accent-text-base" },
  review: { icon: GitPullRequest, color: "emerald", bgClass: "bg-emerald-500/10", textClass: "text-emerald-500" },
  repo: { icon: FolderGit2, color: "cyan", bgClass: "bg-cyan-500/10", textClass: "text-cyan-500" },
  docs: { icon: FileCode2, color: "amber", bgClass: "bg-amber-500/10", textClass: "text-amber-500" },
};

const STORAGE_KEY = "activity-log";
const EVENT_NAME = "asea-activity";

function loadActivity(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActivity(items: Activity[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

function groupByDate(items: Activity[]): { label: string; items: Activity[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 7 * 86_400_000;

  const groups: Record<string, Activity[]> = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };

  for (const item of items) {
    if (item.timestamp >= todayStart) groups["Today"].push(item);
    else if (item.timestamp >= yesterdayStart) groups["Yesterday"].push(item);
    else if (item.timestamp >= weekStart) groups["This Week"].push(item);
    else groups["Earlier"].push(item);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default function HistoryPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activities, setActivities] = useState<Activity[]>(loadActivity);

  const { data: repos = [] } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
  });

  const repoNames = useMemo(() => new Set(repos.map((r) => r.name)), [repos]);

  const grouped = useMemo(() => groupByDate(activities), [activities]);

  const addActivity = useCallback((activity: Activity) => {
    setActivities((prev) => {
      const next = [activity, ...prev].slice(0, 200);
      saveActivity(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent<Activity>) => addActivity(e.detail);
    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, [addActivity]);

  const clearHistory = () => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-lg accent-shadow">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                History
              </h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Your recent activity across all repositories and features.
              </p>
            </div>
          </div>

          {activities.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearHistory}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                isDark
                  ? "border-slate-600 bg-slate-800 text-slate-300 hover:border-red-500/30 hover:text-red-400"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-500"
              }`}
            >
              <Trash2 size={14} />
              Clear History
            </motion.button>
          )}
        </motion.div>

        {/* Empty state */}
        {activities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border border-dashed p-16 text-center ${
              isDark ? "border-slate-600 bg-slate-800/50" : "border-slate-300 bg-white"
            }`}
          >
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl accent-bg-light`}>
              <RotateCcw size={28} className="accent-text-base" />
            </div>
            <p className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-slate-700"}`}>
              No activity yet.
            </p>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Start using AI features to see your history here.
            </p>
          </motion.div>
        )}

        {/* Grouped activities */}
        <AnimatePresence mode="wait">
          {grouped.map((group, gi) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: gi * 0.08 }}
            >
              <h2 className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}>
                {group.label}
              </h2>
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"
              }`}>
                {group.items.map((item, i) => {
                  const cfg = TYPE_CONFIG[item.type];
                  const Icon = cfg.icon;
                  const isValidRepo = repoNames.has(item.repo);
                  return (
                    <motion.div
                      key={`${item.timestamp}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: gi * 0.08 + i * 0.03 }}
                      className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${
                        isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"
                      } ${i > 0 ? `border-t ${isDark ? "border-white/[0.04]" : "border-slate-100"}` : ""}`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bgClass}`}>
                        <Icon size={16} className={cfg.textClass} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                          {item.action}{" "}
                          <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>
                            {item.target}
                          </span>
                        </p>
                        <p className={`text-xs ${isValidRepo ? "accent-text-base" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {isValidRepo ? (
                            <span className="flex items-center gap-1">
                              <FolderGit2 size={11} />
                              {item.repo}
                            </span>
                          ) : (
                            item.repo
                          )}
                        </p>
                      </div>
                      <span className={`text-xs shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`}>
                        {timeAgo(item.timestamp)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
