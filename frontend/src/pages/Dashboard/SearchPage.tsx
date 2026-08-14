import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileCode2, Bot, ArrowRight, Code2, Layers } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { askRepository } from "@/services/chat";
import { getRepositories } from "@/services/repository";
import { useQuery } from "@tanstack/react-query";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const tabs = ["All", "Files", "Functions", "Repositories"];

const fileIcon = (ext: string) => {
  if (["ts", "tsx", "js", "jsx", "py", "rs", "go"].includes(ext)) return Code2;
  if (["json", "yaml", "yml", "toml", "md"].includes(ext)) return FileCode2;
  return FileCode2;
};

export default function SearchPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [results, setResults] = useState<{ answer: string; files?: unknown[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: repos } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
  });

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setResults(null);
    try {
      const data = await askRepository({ question: trimmed });
      setResults(data);
    } catch {
      setResults({ answer: "Something went wrong. Please try again.", files: [] });
    } finally {
      setLoading(false);
    }
  };

  const parsedFiles: { path: string; ext: string; snippet: string }[] = (() => {
    if (!results?.answer) return [];
    const answer: string = results.answer;
    const matches = [...answer.matchAll(/`([^`]+\.[a-z]{1,5})`/gi)];
    const seen = new Set<string>();
    return matches
      .map((m) => {
        const path = m[1];
        const parts = path.split(".");
        const ext = parts[parts.length - 1];
        return { path, ext, snippet: "" };
      })
      .filter((f) => {
        if (seen.has(f.path)) return false;
        seen.add(f.path);
        return true;
      })
      .slice(0, 20);
  })();

  const filteredResults = parsedFiles.filter((f) => {
    if (activeTab === "All") return true;
    if (activeTab === "Files") return true;
    if (activeTab === "Repositories") return f.path.split("/").length <= 2;
    if (activeTab === "Functions") return f.path.includes("::") || f.path.includes("function") || f.path.includes("->");
    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className={`text-2xl font-bold font-[Outfit] mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
            <span className="accent-gradient-text">Smart Search</span>
          </h1>
          <p className={`text-sm font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            AI-powered codebase search across all your repositories
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className={`relative rounded-2xl border transition-shadow ${isDark ? "border-white/[0.06] bg-[var(--card-bg)] focus-within:border-[var(--accent)]/30 focus-within:shadow-[0_0_30px_-10px] focus-within:accent-shadow" : "border-slate-200 bg-white focus-within:border-[var(--accent)] focus-within:shadow-lg"}`}>
            <Search size={20} className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Where is authentication implemented?"
              className={`w-full rounded-2xl bg-transparent py-4 pl-13 pr-28 text-base outline-none font-[Inter] ${isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"}`}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 text-sm font-medium font-[Inter] transition-all ${loading || !query.trim() ? isDark ? "bg-white/5 text-slate-600 cursor-not-allowed" : "bg-slate-100 text-slate-400 cursor-not-allowed" : "accent-gradient text-white hover:shadow-lg accent-shadow hover:scale-[1.02] active:scale-[0.98]"}`}
            >
              {loading ? <LoadingIndicator size="sm" /> : <><ArrowRight size={16} /></>}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-medium font-[Inter] transition-all ${activeTab === tab ? isDark ? "accent-bg-light text-white shadow-sm shadow-[var(--accent)]/10" : "accent-bg-light text-slate-700" : isDark ? "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className={`w-2 h-2 rounded-full accent-text-base`} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
                <span className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Searching codebase with AI...</span>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`rounded-xl border p-4 ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl animate-pulse ${isDark ? "bg-white/[0.05]" : "bg-slate-200"}`} />
                    <div className="flex-1 space-y-2">
                      <div className={`h-3 rounded-full w-1/3 animate-pulse ${isDark ? "bg-white/[0.05]" : "bg-slate-200"}`} />
                      <div className={`h-2 rounded-full w-2/3 animate-pulse ${isDark ? "bg-white/[0.03]" : "bg-slate-100"}`} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : !results ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex flex-col items-center justify-center rounded-2xl border py-20 ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-slate-50"}`}>
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-4 accent-bg-light`}>
                <Bot size={28} className="accent-text-base" />
              </div>
              <p className={`text-base font-medium font-[Outfit] mb-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Ask anything about your code</p>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>e.g. "Where is authentication implemented?"</p>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {filteredResults.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-xs font-medium font-[Inter] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {filteredResults.length} result{filteredResults.length !== 1 && "s"}
                  </p>
                  {filteredResults.map((f, i) => {
                    const Icon = fileIcon(f.ext);
                    return (
                      <motion.div
                        key={f.path + i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all cursor-pointer group ${isDark ? "border-white/[0.06] bg-[var(--card-bg)] hover:bg-white/[0.04] hover:border-[var(--accent)]/20" : "border-slate-200 bg-white hover:bg-slate-50 hover:border-[var(--accent)]/30"}`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl accent-bg-light`}>
                          <Icon size={18} className="accent-text-base" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>{f.path}</p>
                        </div>
                        <span className={`text-xs font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>.{f.ext}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg accent-gradient">
                    <Bot size={14} className="text-white" />
                  </div>
                  <h3 className={`text-sm font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>AI Summary</h3>
                </div>
                <div className={`text-sm font-[Inter] leading-relaxed whitespace-pre-wrap ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {results.answer}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Layers size={12} className={isDark ? "text-slate-600" : "text-slate-400"} />
                  <span className={`text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    Searched {repos?.length ?? 0} repositories
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
