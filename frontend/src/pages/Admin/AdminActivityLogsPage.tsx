import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { listActivityLogs, type AdminActivityLog } from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const actionColors: Record<string, string> = {
  user_login: "bg-emerald-500/10 text-emerald-400",
  user_logout: "bg-slate-500/10 text-slate-400",
  user_deleted: "bg-red-500/10 text-red-400",
  repo_deleted: "bg-red-500/10 text-red-400",
  user_updated: "bg-blue-500/10 text-blue-400",
  settings_changed: "bg-amber-500/10 text-amber-400",
  admin_action: "bg-violet-500/10 text-violet-400",
  role_changed: "bg-purple-500/10 text-purple-400",
  password_reset: "bg-amber-500/10 text-amber-400",
  session_revoked: "bg-red-500/10 text-red-400",
  report_generated: "bg-cyan-500/10 text-cyan-400",
  backup_created: "bg-emerald-500/10 text-emerald-400",
  doc_generated: "bg-violet-500/10 text-violet-400",
  review_created: "bg-blue-500/10 text-blue-400",
  test_created: "bg-cyan-500/10 text-cyan-400",
};

export default function AdminActivityLogsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listActivityLogs({ page, limit: 20, action: actionFilter || undefined });
      setLogs(result.logs);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const todayLogs = logs.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white"><Activity size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold">Activity Logs</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>All platform activity and audit trails</p>
          </div>
        </div>
        <button onClick={() => void fetchLogs()} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{loading ? <LoadingIndicator size="sm" /> : <RefreshCw size={14} />}</button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[{ label: "Total Logs", value: pagination.total, gradient: "from-cyan-500 to-blue-500" }, { label: "Today", value: todayLogs, gradient: "from-emerald-500 to-teal-500" }, { label: "Unique Actions", value: new Set(logs.map((l) => l.action)).size, gradient: "from-amber-500 to-orange-500" }].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <div className={`flex items-center gap-2 rounded-xl border p-2 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
          <Search size={14} className={`ml-2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          <input value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} placeholder="Filter by action type..." className={`flex-1 bg-transparent text-sm outline-none ${isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"}`} />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className={`h-14 animate-pulse rounded-xl ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`} />)}</div>
        ) : logs.length === 0 ? (
          <p className={`py-12 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No activity logs found</p>
        ) : (
          <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
            {logs.map((log) => (
              <div key={log.id} className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${actionColors[log.action] || (isDark ? "bg-white/[0.06] text-slate-400" : "bg-slate-100 text-slate-500")}`}>{log.action}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{log.details || "No details"}</p>
                  <p className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>{log.user ? `${log.user.name} (${log.user.email})` : "System"}</p>
                </div>
                {log.ipAddress && <span className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>{log.ipAddress}</span>}
                <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-500" : "text-slate-400"}`}>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
        {pagination.pages > 1 && (
          <div className={`flex items-center justify-between border-t px-6 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Page {page} of {pagination.pages} ({pagination.total} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"><ChevronLeft size={12} /></button>
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"><ChevronRight size={12} /></button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
