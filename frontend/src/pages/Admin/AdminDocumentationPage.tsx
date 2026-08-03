import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2, FileText, RefreshCw, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { listDocumentations, createDocumentation, deleteDocumentation, type AdminDoc } from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminDocumentationPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFormat, setNewFormat] = useState("markdown");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listDocumentations({ page, limit: 10 });
      setDocs(result.docs);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load documentation");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void (async () => {
      await fetchDocs();
    })();
  }, [fetchDocs]);

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast.error("Title required"); return; }
    setCreating(true);
    try {
      await createDocumentation({ repositoryId: "default", title: newTitle, format: newFormat });
      toast.success("Documentation generated");
      setShowCreate(false);
      setNewTitle("");
      fetchDocs();
    } catch {
      toast.error("Failed to generate documentation");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocumentation(id);
      toast.success("Documentation deleted");
      setConfirmDelete(null);
      fetchDocs();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const completed = docs.filter((d) => d.status === "completed").length;
  const generating = docs.filter((d) => d.status === "generating").length;

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white"><BookOpen size={20} /></div>
          <div>
            <h1 className="text-2xl font-bold">Documentation Management</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Manage generated documentation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void fetchDocs()} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{loading ? <LoadingIndicator size="sm" /> : <RefreshCw size={14} />}</button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/25"><Plus size={15} /> Generate Doc</button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[{ label: "Total Docs", value: pagination.total, gradient: "from-cyan-500 to-blue-500" }, { label: "Completed", value: completed, gradient: "from-emerald-500 to-teal-500" }, { label: "Generating", value: generating, gradient: "from-amber-500 to-orange-500" }].map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Generate New Documentation</h3>
            <button onClick={() => setShowCreate(false)}><X size={16} /></button>
          </div>
          <div className="flex gap-3">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Documentation title" className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`} />
            <select value={newFormat} onChange={(e) => setNewFormat(e.target.value)} className={`rounded-xl border px-3 py-2.5 text-sm ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-slate-50"}`}>
              <option value="markdown">Markdown</option>
              <option value="pdf">PDF</option>
            </select>
            <button onClick={() => void handleCreate()} disabled={creating} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {creating ? "Generating..." : "Generate"}
            </button>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className={`h-14 animate-pulse rounded-xl ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`} />)}</div>
        ) : docs.length === 0 ? (
          <p className={`py-12 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No documentation yet</p>
        ) : (
          <div className="divide-y" style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9" }}>
            {docs.map((doc) => (
              <div key={doc.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                <FileText size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{doc.title}</p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{doc.repository.name}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${doc.format === "markdown" ? "bg-violet-500/10 text-violet-400" : "bg-red-500/10 text-red-400"}`}>{doc.format}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${doc.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : doc.status === "generating" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{doc.status}</span>
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{new Date(doc.createdAt).toLocaleDateString()}</span>
                <button onClick={() => setConfirmDelete(doc.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
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
            <h3 className="text-lg font-bold">Delete Documentation?</h3>
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
