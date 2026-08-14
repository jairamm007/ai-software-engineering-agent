import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, Plus, Trash2, X, Info, AlertTriangle, Megaphone } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import {
  listNotifications,
  createNotification,
  deleteNotification,
  type Notification,
} from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const typeIcons = { info: Info, warning: AlertTriangle, announcement: Megaphone };
const typeColors = {
  info: { gradient: "from-blue-500 to-cyan-600", bg: "from-blue-500/10 to-cyan-500/10", text: "text-blue-500" },
  warning: { gradient: "from-amber-500 to-orange-600", bg: "from-amber-500/10 to-orange-500/10", text: "text-amber-500" },
  announcement: { gradient: "from-rose-500 to-orange-500", bg: "from-rose-500/10 to-orange-500/10", text: "text-rose-500" },
};

export default function AdminNotificationsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "announcement">("info");
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchNotifications();
    })();
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      await createNotification({ title, message, type });
      toast.success("Announcement sent successfully");
      setTitle("");
      setMessage("");
      setType("info");
      setShowCreate(false);
      fetchNotifications();
    } catch {
      toast.error("Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
      fetchNotifications();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const cardClass = isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const textFaint = isDark ? "text-slate-600" : "text-slate-300";
  const hoverBg = isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Notifications</h1>
          <p className={`mt-1 text-[13px] ${textSecondary}`}>
            Send platform-wide announcements and alerts
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2.5 text-[13px] font-medium text-white shadow-lg shadow-rose-500/20 transition-all hover:shadow-rose-500/30"
        >
          <Plus size={14} />
          New Announcement
        </button>
      </motion.div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`rounded-2xl border p-6 ${cardClass}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                  <Send size={14} />
                </div>
                <div>
                  <h3 className={`text-[15px] font-semibold ${textPrimary}`}>Create Announcement</h3>
                  <p className={`text-[12px] ${textMuted}`}>Send a new notification to all users</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className={`rounded-lg p-1.5 transition-colors ${isDark ? "text-slate-400 hover:bg-white/[0.06]" : "text-slate-400 hover:bg-slate-100"}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`mb-2 block text-[13px] font-medium ${textSecondary}`}>Type</label>
                <div className="flex gap-2">
                  {(["info", "warning", "announcement"] as const).map((t) => {
                    const Icon = typeIcons[t];
                    const colors = typeColors[t];
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-all ${
                          type === t
                            ? `border-transparent bg-gradient-to-r ${colors.bg} ${colors.text} ring-1 ring-inset ring-current/20`
                            : isDark
                              ? "border-white/[0.06] bg-[var(--card-bg)] text-slate-400 hover:bg-white/[0.04]"
                              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={14} />
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-[13px] font-medium ${textSecondary}`}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  className={`w-full rounded-xl border py-2.5 px-4 text-[13px] outline-none transition-all ${
                    isDark
                      ? "border-white/[0.06] bg-[#0a0a0f] text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  }`}
                />
              </div>

              <div>
                <label className={`mb-2 block text-[13px] font-medium ${textSecondary}`}>Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Write your announcement message..."
                  className={`w-full resize-none rounded-xl border py-2.5 px-4 text-[13px] outline-none transition-all ${
                    isDark
                      ? "border-white/[0.06] bg-[#0a0a0f] text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className={`rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors ${isDark ? "text-slate-400 hover:bg-white/[0.06]" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={sending}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-[13px] font-medium text-white shadow-lg shadow-rose-500/20 transition-all hover:shadow-rose-500/30 disabled:opacity-50"
                >
                  {sending ? (
                    <LoadingIndicator size="sm" />
                  ) : (
                    <Send size={13} />
                  )}
                  {sending ? "Sending..." : "Send Announcement"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border ${cardClass}`}
      >
        <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
              <Bell size={14} className={isDark ? "text-slate-400" : "text-slate-500"} />
            </div>
            <div>
              <h3 className={`text-[15px] font-semibold ${textPrimary}`}>All Announcements</h3>
              <p className={`text-[12px] ${textMuted}`}>{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="py-16">
              <LoadingIndicator size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                <Bell size={24} className={isDark ? "text-slate-600" : "text-slate-300"} />
              </div>
              <p className={`mt-4 text-[13px] font-medium ${textPrimary}`}>No announcements yet</p>
              <p className={`mt-1 text-[12px] ${textMuted}`}>Create your first platform announcement to get started.</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((n, i) => {
                const Icon = typeIcons[n.type as keyof typeof typeIcons] || Info;
                const colors = typeColors[n.type as keyof typeof typeColors] || typeColors.info;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors ${hoverBg}`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white shadow-lg`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-[13px] font-semibold ${textPrimary}`}>{n.title}</p>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-gradient-to-r ${colors.bg} ${colors.text}`}>
                          {n.type}
                        </span>
                      </div>
                      <p className={`mt-1.5 text-[13px] leading-relaxed ${textSecondary}`}>{n.message}</p>
                      <p className={`mt-2 text-[12px] ${textFaint}`}>{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(n.id)}
                      className={`mt-1 shrink-0 rounded-lg p-2 transition-all ${isDark ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
