import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Activity,
  User,
  Clock,
  CheckCircle,
  LogOut,
  Ban,
  Search,
  FileText,
  Globe,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import {
  getSecurityLogs,
  forceLogoutSession,
  type SecurityData,
} from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

export default function AdminSecurityPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sessions" | "audit" | "blocked">("sessions");
  const [auditSearch, setAuditSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await getSecurityLogs();
      setData(d);
    } catch {
      toast.error("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleForceLogout = async (sessionId: string) => {
    try {
      await forceLogoutSession(sessionId);
      toast.success("Session terminated");
      fetchData();
    } catch {
      toast.error("Failed to terminate session");
    }
  };

  const filteredAuditLogs = data?.auditLogs?.filter((log) =>
    !auditSearch ||
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.details?.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.user?.name?.toLowerCase().includes(auditSearch.toLowerCase())
  ) ?? [];

  const actionColors: Record<string, { bg: string; text: string; dot: string }> = {
    user_login: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
    user_logout: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
    user_deleted: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
    user_suspended: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-500" },
    user_activated: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500" },
    user_updated: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-500" },
    role_changed: { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-500" },
    repo_deleted: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-500" },
    session_revoked: { bg: "bg-orange-500/10", text: "text-orange-400", dot: "bg-orange-500" },
    settings_changed: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-500" },
    notification_created: { bg: "bg-pink-500/10", text: "text-pink-400", dot: "bg-pink-500" },
    report_generated: { bg: "bg-indigo-500/10", text: "text-indigo-400", dot: "bg-indigo-500" },
  };

  const tabs = [
    { key: "sessions" as const, label: "Active Sessions", icon: Activity, count: data?.activeSessions?.length ?? 0 },
    { key: "audit" as const, label: "Audit Logs", icon: FileText, count: data?.auditLogs?.length ?? 0 },
    { key: "blocked" as const, label: "Suspended Users", icon: Ban, count: data?.suspendedUsers?.length ?? 0 },
  ];

  const stats = [
    { icon: Lock, label: "Active Sessions", value: data?.activeSessions?.length ?? 0, gradient: "from-rose-500 to-orange-500", shadow: "shadow-rose-500/10" },
    { icon: FileText, label: "Audit Events", value: data?.auditLogs?.length ?? 0, gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/10" },
    { icon: Ban, label: "Suspended", value: data?.suspendedUsers?.length ?? 0, gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/10" },
    { icon: CheckCircle, label: "System Status", value: "Secure", gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/10" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/20">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Security Center
            </h1>
            <p className={`mt-0.5 text-[13px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Monitor sessions, audit logs, and user access
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
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

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`flex gap-1 rounded-2xl border p-1.5 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-slate-50"}`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? isDark
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20"
                  : "bg-white text-slate-900 shadow-sm"
                : isDark
                  ? "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white"
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
              activeTab === tab.key
                ? isDark
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
                : isDark
                  ? "bg-white/[0.06] text-slate-500"
                  : "bg-slate-100 text-slate-400"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white shadow-sm"}`}
      >
        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <>
            <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500">
                <Activity size={15} className="text-white" />
              </div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Active Sessions
              </h3>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingIndicator size="md" />
                </div>
              ) : data?.activeSessions?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                    <Activity size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
                  </div>
                  <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No active sessions</p>
                </div>
              ) : (
                data?.activeSessions?.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"}`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500`}>
                      <User size={16} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {s.user.name}
                      </p>
                      <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {s.user.email}
                      </p>
                      {s.ipAddress && (
                        <div className="mt-1 flex items-center gap-1">
                          <Globe size={10} className={isDark ? "text-slate-600" : "text-slate-300"} />
                          <span className={`text-[10px] font-mono ${isDark ? "text-slate-600" : "text-slate-300"}`}>
                            {s.ipAddress}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                        <Clock size={11} className={isDark ? "text-slate-500" : "text-slate-400"} />
                        <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(s.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleForceLogout(s.id)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all ${
                          isDark
                            ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                            : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                        }`}
                        title="Force logout"
                      >
                        <LogOut size={12} />
                        <span className="hidden sm:inline">Logout</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "audit" && (
          <>
            <div className={`flex items-center justify-between border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <FileText size={15} className="text-white" />
                </div>
                <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Audit Logs
                </h3>
              </div>
              <div className="relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className={`w-48 rounded-xl border py-2 pl-9 pr-3 text-[12px] outline-none transition-all ${
                    isDark
                      ? "border-white/[0.08] bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  }`}
                />
              </div>
            </div>
            <div className="max-h-[32rem] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingIndicator size="md" />
                </div>
              ) : filteredAuditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                    <FileText size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
                  </div>
                  <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No audit logs found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAuditLogs.map((log, i) => {
                    const colors = actionColors[log.action] || { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" };
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.02 * i }}
                        className={`px-6 py-3.5 transition-colors ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                            {log.action.replace(/_/g, " ")}
                          </span>
                          {log.user && (
                            <span className={`text-[12px] font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              {log.user.name}
                            </span>
                          )}
                          <span className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {log.details && (
                          <p className={`mt-1.5 pl-[1.1rem] text-[12px] leading-relaxed ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {log.details}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Suspended Users Tab */}
        {activeTab === "blocked" && (
          <>
            <div className={`flex items-center gap-2.5 border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                <Ban size={15} className="text-white" />
              </div>
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Suspended Users
              </h3>
            </div>
            <div className="divide-y">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingIndicator size="md" />
                </div>
              ) : data?.suspendedUsers?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-white/[0.04]" : "bg-slate-50"}`}>
                    <Ban size={20} className={isDark ? "text-slate-600" : "text-slate-300"} />
                  </div>
                  <p className={`mt-3 text-[13px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>No suspended users</p>
                </div>
              ) : (
                data?.suspendedUsers?.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.03 * i }}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.04]" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                      <Ban size={16} className="text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {u.name}
                      </p>
                      <p className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                        isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Suspended
                      </span>
                      <span className={`text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
