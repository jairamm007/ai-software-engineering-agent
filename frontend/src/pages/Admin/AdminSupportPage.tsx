import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  Mail,
  Inbox,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import {
  listSupportMessages,
  replyToSupportMessage,
  updateSupportMessageStatus,
  deleteSupportMessage,
  type AdminSupportMessage,
} from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function categoryBadge(category: string, isDark: boolean) {
  const map: Record<string, string> = {
    feedback: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
    bug: "bg-red-500/10 text-red-400 ring-red-500/20",
    feature: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  };
  const base = map[category] ?? (isDark ? "bg-white/[0.04] text-slate-400 ring-white/[0.06]" : "bg-slate-100 text-slate-600 ring-slate-200");
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${base}`;
}

function priorityBadge(priority: string, isDark: boolean) {
  const map: Record<string, string> = {
    normal: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
    high: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    urgent: "bg-red-500/10 text-red-400 ring-red-500/20",
  };
  const base = map[priority] ?? (isDark ? "bg-white/[0.04] text-slate-400 ring-white/[0.06]" : "bg-slate-100 text-slate-600 ring-slate-200");
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${base}`;
}

function statusBadge(status: string, isDark: boolean) {
  const map: Record<string, string> = {
    open: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    in_progress: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    resolved: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  };
  const base = map[status] ?? (isDark ? "bg-white/[0.04] text-slate-400 ring-white/[0.06]" : "bg-slate-100 text-slate-600 ring-slate-200");
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${base}`;
}

export default function AdminSupportPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [messages, setMessages] = useState<AdminSupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSupportMessages({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      setMessages(result.messages);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load support messages");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    void (async () => {
      await fetchMessages();
    })();
  }, [fetchMessages]);

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await replyToSupportMessage(messageId, replyText.trim());
      toast.success("Reply sent");
      setReplyText("");
      setExpandedId(null);
      await fetchMessages();
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (messageId: string, status: string) => {
    try {
      await updateSupportMessageStatus(messageId, status);
      toast.success("Status updated");
      await fetchMessages();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteSupportMessage(messageId);
      toast.success("Message deleted");
      setConfirmDelete(null);
      setExpandedId(null);
      await fetchMessages();
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const openCount = messages.filter((m) => m.status === "open").length;
  const inProgressCount = messages.filter((m) => m.status === "in_progress").length;
  const resolvedCount = messages.filter((m) => m.status === "resolved").length;

  const statusCounts = [
    { icon: Inbox, label: "Total", value: pagination.total, gradient: "from-rose-500 to-orange-500", shadow: "shadow-rose-500/10" },
    { icon: Mail, label: "Open", value: openCount, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/10" },
    { icon: Clock, label: "In Progress", value: inProgressCount, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/10" },
    { icon: CheckCircle, label: "Resolved", value: resolvedCount, gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/10" },
  ];

  return (
    <motion.div
      className={`space-y-6 ${isDark ? "bg-[#0a0a0f] text-white" : "bg-[#f8fafc] text-slate-900"} min-h-full`}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Support Messages</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Manage user feedback and support requests
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusCounts.map((s) => (
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

      <motion.div variants={fadeUp}>
        <div className="flex gap-2">
          {["", "open", "in_progress", "resolved", "closed"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                statusFilter === status
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20"
                  : isDark
                    ? "border border-white/[0.06] bg-[#111118] text-slate-400 hover:bg-white/[0.04]"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              {status === "" ? "All" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="divide-y">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingIndicator size="sm" />
            </div>
          ) : messages.length === 0 ? (
            <div className={`py-16 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              No support messages found
            </div>
          ) : (
            messages.map((msg) => {
              const expanded = expandedId === msg.id;
              return (
                <div key={msg.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : msg.id)}
                    className={`w-full px-6 py-4 text-left transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`truncate text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                            {msg.subject}
                          </p>
                          <span className={categoryBadge(msg.category, isDark)}>
                            {msg.category}
                          </span>
                          <span className={priorityBadge(msg.priority, isDark)}>
                            {msg.priority}
                          </span>
                          <span className={statusBadge(msg.status, isDark)}>
                            {msg.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {msg.user?.name ?? "Unknown"} ({msg.user?.email ?? "—"})
                          </span>
                          <span className={`text-xs ${isDark ? "text-slate-600" : "text-slate-300"}`}>|</span>
                          <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.reply && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <CheckCircle size={10} /> Replied
                          </span>
                        )}
                        {expanded ? <ChevronUp size={16} className={isDark ? "text-slate-400" : "text-slate-500"} /> : <ChevronDown size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`border-t px-6 py-5 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                          <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {msg.message}
                          </p>

                          {msg.reply && (
                            <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                              <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Your Reply ({new Date(msg.repliedAt!).toLocaleDateString()})
                              </p>
                              <p className={`mt-1.5 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                {msg.reply}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1">
                              <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Reply
                              </label>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                                placeholder="Type your reply..."
                                className={`w-full rounded-xl border py-2.5 px-4 text-sm outline-none transition-all resize-none ${
                                  isDark
                                    ? "border-white/[0.06] bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-rose-500/50"
                                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50"
                                }`}
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              <label className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Status:
                              </label>
                              <select
                                value={msg.status}
                                onChange={(e) => void handleStatusChange(msg.id, e.target.value)}
                                className={`rounded-lg border py-1.5 px-3 text-xs font-medium outline-none ${
                                  isDark
                                    ? "border-white/[0.06] bg-white/[0.03] text-white focus:border-rose-500/50"
                                    : "border-slate-200 bg-white text-slate-900 focus:border-rose-500/50"
                                }`}
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(msg.id)}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                                  isDark
                                    ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                                    : "text-slate-500 hover:bg-red-50 hover:text-red-500"
                                }`}
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleReply(msg.id)}
                                disabled={replying || !replyText.trim()}
                                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30 disabled:opacity-50"
                              >
                                {replying ? (
                                  <LoadingIndicator size="sm" />
                                ) : (
                                  <Send size={13} />
                                )}
                                Send Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {pagination.pages > 1 && (
          <div
            className={`flex items-center justify-between border-t px-5 py-3 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Page {page} of {pagination.pages} ({pagination.total} messages)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`rounded-lg p-1.5 transition-colors ${
                  isDark ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"
                } disabled:opacity-30`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className={`rounded-lg p-1.5 transition-colors ${
                  isDark ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"
                } disabled:opacity-30`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
              <h3 className="text-lg font-bold">Delete Message</h3>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                This action cannot be undone. The support message will be permanently removed.
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
