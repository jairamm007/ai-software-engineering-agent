import { motion } from "framer-motion";
import { History, GitCommitHorizontal, MessageSquare, FileCode2, FolderGit2, Settings, Brain } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const activity = [
  { icon: Brain, action: "AI analyzed", target: "auth module", repo: "ai-software-engineering-agent", time: "2 minutes ago", color: "violet" },
  { icon: MessageSquare, action: "Chat conversation", target: "Explain the test-fix loop", repo: "ai-software-engineering-agent", time: "15 minutes ago", color: "fuchsia" },
  { icon: GitCommitHorizontal, action: "Code review", target: "#142 — WebSocket streaming", repo: "ai-software-engineering-agent", time: "1 hour ago", color: "emerald" },
  { icon: FolderGit2, action: "Repository added", target: "frontend-dashboard", repo: "frontend-dashboard", time: "2 hours ago", color: "cyan" },
  { icon: FileCode2, action: "Documentation generated", target: "API Reference", repo: "api-gateway", time: "4 hours ago", color: "amber" },
  { icon: Settings, action: "Settings updated", target: "AI model changed to GPT-4o", repo: "—", time: "6 hours ago", color: "slate" },
  { icon: Brain, action: "AI analyzed", target: "full codebase", repo: "ml-pipeline", time: "1 day ago", color: "violet" },
  { icon: MessageSquare, action: "Chat conversation", target: "Explain the architecture", repo: "ai-software-engineering-agent", time: "1 day ago", color: "fuchsia" },
  { icon: GitCommitHorizontal, action: "Code review", target: "#139 — Chunking pipeline", repo: "ai-software-engineering-agent", time: "2 days ago", color: "emerald" },
  { icon: FolderGit2, action: "Repository added", target: "api-gateway", repo: "api-gateway", time: "3 days ago", color: "cyan" },
];

export default function HistoryPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Your recent activity across all repositories and features.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
          <div className="divide-y divide-white/[0.04]">
            {activity.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={`${item.action}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }} className={`flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-${item.color}-500/10`}>
                    <Icon size={16} className={`text-${item.color}-500`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-[Inter] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {item.action}{" "}
                      <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{item.target}</span>
                    </p>
                    <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{item.repo}</p>
                  </div>
                  <span className={`text-xs font-[Inter] shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`}>{item.time}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
