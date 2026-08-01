import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  HardDrive,
  Download,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import {
  listBackups,
  createBackup,
  deleteBackup,
  type AdminBackup,
} from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminBackupPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [backups, setBackups] = useState<AdminBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await listBackups();
      setBackups(data);
    } catch {
      toast.error("Failed to load backups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBackups();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await createBackup();
      toast.success("Backup created successfully");
      await fetchBackups();
    } catch {
      toast.error("Failed to create backup");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (backupId: string) => {
    try {
      await deleteBackup(backupId);
      toast.success("Backup deleted");
      setConfirmDelete(null);
      await fetchBackups();
    } catch {
      toast.error("Failed to delete backup");
    }
  };

  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  const lastBackup = backups.length > 0 ? backups[0] : null;

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={13} />;
      case "failed":
        return <XCircle size={13} />;
      case "in_progress":
        return <AlertTriangle size={13} />;
      default:
        return <Clock size={13} />;
    }
  };

  return (
    <motion.div
      className={`space-y-6 ${isDark ? "bg-[#0a0a0f] text-white" : "bg-[#f8fafc] text-slate-900"} min-h-full`}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
              <Database size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Backups</h1>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Manage system backups and data snapshots
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30 disabled:opacity-50"
          >
            {creating ? (
              <LoadingIndicator size="sm" />
            ) : (
              <Plus size={16} />
            )}
            Create Backup
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: Database, label: "Total Backups", value: backups.length, gradient: "from-rose-500 to-orange-500", shadow: "shadow-rose-500/10" },
          { icon: HardDrive, label: "Storage Used", value: formatSize(totalSize), gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/10" },
          { icon: Clock, label: "Last Backup", value: lastBackup ? new Date(lastBackup.createdAt).toLocaleDateString() : "Never", gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/10" },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
              isDark
                ? "border-white/[0.06] bg-[#111118] hover:border-white/[0.1] hover:bg-[#13131b]"
                : "border-slate-200 bg-white shadow-sm hover:shadow-md"
            }`}
          >
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg ${s.shadow}`}>
              <s.icon size={18} strokeWidth={2} />
            </div>
            <p className={`mt-3.5 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {s.label}
            </p>
            <p className={`mt-1 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              {loading ? (
                <span className={`inline-block h-7 w-16 animate-pulse rounded-lg ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
              ) : (
                s.value
              )}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                {["Filename", "Type", "Size", "Status", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                      h === "Actions" ? "text-right " : ""
                    }${h === "Size" ? "hidden sm:table-cell " : ""}${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/[0.04]" : "divide-slate-100"}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <LoadingIndicator size="sm" />
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Loading backups...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-5 py-16 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    No backups found
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr
                    key={backup.id}
                    className={`transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                          <HardDrive size={15} className={isDark ? "text-slate-400" : "text-slate-500"} />
                        </div>
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                            {backup.filename}
                          </p>
                          {backup.note && (
                            <p className={`truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                              {backup.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          backup.type === "full"
                            ? "bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20"
                            : isDark
                              ? "bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/[0.06]"
                              : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                        }`}
                      >
                        {backup.type}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {formatSize(backup.size)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          backup.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                            : backup.status === "failed"
                              ? "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
                              : "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20"
                        }`}
                      >
                        {statusIcon(backup.status)}
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(backup.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled
                          className={`rounded-lg p-1.5 opacity-30 ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                          title="Download (coming soon)"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(backup.id)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            isDark
                              ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                              : "text-slate-400 hover:bg-red-50 hover:text-red-500"
                          }`}
                          title="Delete backup"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
                isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold">Delete Backup</h3>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                This action cannot be undone. The backup file will be permanently removed.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDark ? "text-slate-300 hover:bg-white/[0.04]" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(confirmDelete)}
                  className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
