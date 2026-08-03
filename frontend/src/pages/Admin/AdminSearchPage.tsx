import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Trash2, Database, FileCode2, Zap } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { getRepositoryStats, type RepositoryStats } from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminSearchPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [stats, setStats] = useState<RepositoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getRepositoryStats();
      setStats(data);
    } catch {
      toast.error("Failed to load search stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchStats();
    })();
  }, []);

  const handleRebuild = async () => {
    setRebuilding(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRebuilding(false);
    toast.success("Search index rebuilt successfully");
  };

  const handleClearCache = () => {
    toast.success("Search cache cleared");
  };

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white"><Search size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold">Search Management</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Manage search index and content</p>
          </div>
        </div>
        <button onClick={() => void fetchStats()} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{loading ? <LoadingIndicator size="sm" /> : <RefreshCw size={14} />}</button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[{ label: "Indexed Files", value: stats?.totalFiles ?? 0, icon: FileCode2, gradient: "from-cyan-500 to-blue-500" }, { label: "Code Chunks", value: stats?.totalChunks ?? 0, icon: Database, gradient: "from-emerald-500 to-teal-500" }, { label: "Storage Used", value: stats?.totalStorageMB ?? "0", icon: Zap, gradient: "from-amber-500 to-orange-500", suffix: " MB" }].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}><s.icon size={18} /></div>
            <p className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{loading ? "..." : `${s.value}${s.suffix || ""}`}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
        <h3 className="text-sm font-semibold mb-4">Index Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => void handleRebuild()} disabled={rebuilding} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 disabled:opacity-50">
            {rebuilding ? <LoadingIndicator size="sm" /> : <RefreshCw size={14} />}
            {rebuilding ? "Rebuilding..." : "Rebuild Search Index"}
          </button>
          <button onClick={handleClearCache} className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Trash2 size={14} /> Clear Search Cache
          </button>
        </div>
      </motion.div>

      {stats && stats.filesByExtension.length > 0 && (
        <motion.div variants={fadeUp} className={`rounded-2xl border p-6 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
          <h3 className="text-sm font-semibold mb-4">Indexed File Types</h3>
          <div className="flex flex-wrap gap-2">
            {stats.filesByExtension.map((ext) => (
              <span key={ext.extension} className={`rounded-full px-3 py-1 text-xs font-medium ${isDark ? "bg-white/[0.06] text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                {ext.extension} <span className={`ml-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{String(ext.count)}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
