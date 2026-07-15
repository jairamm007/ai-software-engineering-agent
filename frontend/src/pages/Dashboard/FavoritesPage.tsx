import { motion } from "framer-motion";
import { Star, FolderGit2, Clock, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const favorites = [
  { name: "ai-software-engineering-agent", lang: "TypeScript", stars: 42, lastAccessed: "2m ago", description: "AI-powered software engineering agent with code analysis" },
  { name: "frontend-dashboard", lang: "React", stars: 18, lastAccessed: "1h ago", description: "Main dashboard UI for Repo Verify" },
  { name: "api-gateway", lang: "TypeScript", stars: 31, lastAccessed: "3h ago", description: "Express API gateway with rate limiting" },
  { name: "ml-pipeline", lang: "Python", stars: 67, lastAccessed: "1d ago", description: "Machine learning pipeline for code embeddings" },
];

export default function FavoritesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Your starred repositories for quick access.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid gap-4 sm:grid-cols-2">
          {favorites.map((repo, i) => (
            <motion.div key={repo.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }} whileHover={{ y: -3 }} className={`group rounded-2xl border p-5 transition-shadow ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-violet-500/5" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-violet-500/10" : "bg-violet-100"}`}>
                    <FolderGit2 size={14} className="text-violet-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>{repo.name}</p>
                    <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{repo.lang}</p>
                  </div>
                </div>
                <Star size={14} className="text-amber-400 fill-amber-400" />
              </div>
              <p className={`text-xs font-[Inter] mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{repo.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    <Star size={10} /> {repo.stars}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    <Clock size={10} /> {repo.lastAccessed}
                  </span>
                </div>
                <button className={`rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`}>
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
