import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GitPullRequest, Plus, Trash2, AlertTriangle, AlertCircle, Info, RefreshCw } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { listCodeReviews, createCodeReview, deleteCodeReview, type AdminReview } from "@/services/admin";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminCodeReviewPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listCodeReviews({ page, limit: 10 });
      setReviews(result.reviews);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load code reviews");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleCreate = async () => {
    try {
      await createCodeReview({ repositoryId: "default" });
      toast.success("Code review started");
      fetchReviews();
    } catch {
      toast.error("Failed to start review");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCodeReview(id);
      toast.success("Review deleted");
      setConfirmDelete(null);
      fetchReviews();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalIssues = reviews.reduce((sum, r) => sum + r.issuesFound, 0);
  const completed = reviews.filter((r) => r.status === "completed").length;

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white"><GitPullRequest size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold">Code Review Management</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Track and manage AI code reviews</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void fetchReviews()} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button>
          <button onClick={() => void handleCreate()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/25"><Plus size={15} /> Run Review</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[{ label: "Total Reviews", value: pagination.total, gradient: "from-cyan-500 to-blue-500" }, { label: "Completed", value: completed, gradient: "from-emerald-500 to-teal-500" }, { label: "Total Issues", value: totalIssues, gradient: "from-amber-500 to-orange-500" }, { label: "Avg Issues/Review", value: reviews.length ? (totalIssues / reviews.length).toFixed(1) : "0", gradient: "from-violet-500 to-purple-500" }].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`} />)}</div>
        ) : reviews.length === 0 ? (
          <p className={`py-12 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No code reviews yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
            {reviews.map((review) => (
              <div key={review.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{review.repository.name}</p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{review.summary || "No summary"}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${review.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : review.status === "running" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{review.status}</span>
                <div className="flex items-center gap-2 text-[11px]">
                  {review.criticalCount > 0 && <span className="flex items-center gap-0.5 text-red-400"><AlertTriangle size={10} />{review.criticalCount}</span>}
                  {review.warningCount > 0 && <span className="flex items-center gap-0.5 text-amber-400"><AlertCircle size={10} />{review.warningCount}</span>}
                  {review.infoCount > 0 && <span className="flex items-center gap-0.5 text-blue-400"><Info size={10} />{review.infoCount}</span>}
                </div>
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{new Date(review.createdAt).toLocaleDateString()}</span>
                <button onClick={() => setConfirmDelete(review.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
        {pagination.pages > 1 && (
          <div className={`flex items-center justify-between border-t px-6 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Page {page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40">Prev</button>
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </motion.div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`rounded-2xl border p-6 shadow-2xl ${isDark ? "border-white/10 bg-[#111118]" : "border-slate-200 bg-white"}`}>
            <h3 className="text-lg font-bold">Delete Review?</h3>
            <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className={`rounded-xl px-4 py-2 text-sm font-medium ${isDark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600"}`}>Cancel</button>
              <button onClick={() => void handleDelete(confirmDelete)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
