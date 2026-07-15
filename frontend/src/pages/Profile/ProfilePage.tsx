import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  Save,
  FolderGit2,
  MessageSquare,
  FileCode2,
  Shield,
  Clock,
  Lock,
  Trash2,
  ExternalLink,
  Check,
  X,
  Loader2,
  User,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getRepositories } from "@/services/repository";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function ProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, updateProfile, deleteAccount, changePassword } = useAuth();

  const [name, setName] = useState(user?.name ?? "AI Engineer");
  const [email, setEmail] = useState(user?.email ?? "engineer@example.com");
  const [bio, setBio] = useState(user?.bio ?? "Full-stack developer building AI-powered tools.");
  const [role, setRole] = useState(user?.role ?? "Software Engineer");
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { data: repos } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const totalFiles = repos?.reduce((sum, r) => sum + r.files.length, 0) ?? 0;

  const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const recentActivity = [
    user?.createdAt ? { action: "Account created", target: user.email, time: timeAgo(user.createdAt), icon: User, color: "text-violet-500" } : null,
    ...(repos ?? []).slice(0, 5).map((repo) => ({
      action: "Indexed repository",
      target: repo.name,
      time: timeAgo(repo.createdAt),
      icon: FolderGit2,
      color: "text-amber-500" as const,
    })),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 5);

  const stats = [
    { icon: FolderGit2, label: "Repositories", value: repos?.length ?? 0, color: "from-violet-500 to-purple-600" },
    { icon: FileCode2, label: "Files Indexed", value: totalFiles, color: "from-cyan-500 to-blue-600" },
    { icon: MessageSquare, label: "AI Questions", value: 0, color: "from-emerald-500 to-teal-600" },
    { icon: Shield, label: "Security Scans", value: 0, color: "from-rose-500 to-pink-600" },
  ];

  const handleSave = async () => {
    try {
      await updateProfile({ name, email, bio, role });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // profile update failed silently
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      window.location.href = "/login";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
      setDeleting(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setShowPasswordDialog(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (user?.name ?? name).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>Profile</h1>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Manage your account and view activity
          </p>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl border shadow-sm overflow-hidden ${
            isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="relative h-28 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-500">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRhMiAyIDAgMSAxLTQgMCAyIDIgMCAwIDEgNCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10">
              <div className="relative">
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-2xl font-bold text-white shadow-lg ${
                  isDark ? "ring-4 ring-slate-900" : "ring-4 ring-white"
                }`}>
                  {initials}
                </div>
                <button
                  type="button"
                  className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg border shadow-sm transition-colors ${
                    isDark ? "border-white/20 bg-slate-800 text-slate-400 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Camera size={13} />
                </button>
              </div>
              <div className="pb-1">
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{user?.name ?? name}</h2>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{role}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href="/settings"
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Lock size={12} />
                Settings
              </a>
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                Connected
                <ExternalLink size={10} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Activity Stats */}
        <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={item}
              className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              }`}
            >
              <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.color}`} />
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                <stat.icon size={16} />
              </div>
              <p className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Edit Profile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl border shadow-sm ${
            isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`flex items-center justify-between border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Personal Information</h3>
            <button
              type="button"
              onClick={() => { if (editing) handleSave(); else setEditing(true); }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                saved
                  ? "bg-emerald-500/15 text-emerald-500"
                  : editing
                    ? "bg-violet-600 text-white hover:bg-violet-500"
                    : isDark
                      ? "border border-white/10 text-slate-300 hover:bg-white/5"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {saved ? <><Check size={13} /> Saved</> : editing ? <><Save size={13} /> Save Changes</> : "Edit Profile"}
            </button>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-60"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 disabled:opacity-60"
                  }`}
                />
              </div>
              <div>
                <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-60"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 disabled:opacity-60"
                  }`}
                />
              </div>
            </div>
            <div>
              <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!editing}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-60"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 disabled:opacity-60"
                }`}
              />
            </div>
            <div>
              <label className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!editing}
                rows={3}
                className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500 disabled:opacity-60"
                    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-500 disabled:opacity-60"
                }`}
              />
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl border shadow-sm ${
            isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Activity</h3>
          </div>
          <div className="divide-y divide-white/5">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={i} className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  isDark ? "bg-white/5" : "bg-slate-50"
                }`}>
                  <activity.icon size={15} className={activity.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {activity.action} <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{activity.target}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock size={12} className={isDark ? "text-slate-600" : "text-slate-400"} />
                  <span className={`text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>{activity.time}</span>
                </div>
              </div>
            )) : (
              <div className={`px-5 py-8 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                No activity yet. Analyze a repository to get started.
              </div>
            )}
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-2xl border shadow-sm ${
            isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
          }`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Account</h3>
          </div>
          <div className="space-y-3 p-5">
            <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-amber-500" />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Change Password</p>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Update your account password</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordDialog(true);
                    setPasswordError("");
                    setPasswordSuccess(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  Update
                </button>
              </div>
            </div>
            <div className={`rounded-xl border p-4 ${isDark ? "border-red-500/10 bg-red-500/5" : "border-red-100 bg-red-50/80"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 size={16} className="text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-600">Delete Account</p>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Permanently delete your account and all data</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(true); setDeleteError(""); }}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={12} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Delete Account</h3>
                  <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    This will permanently delete your account, all repositories, chat history, and settings. This action cannot be undone.
                  </p>
                  {deleteError && (
                    <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                      {deleteError}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`shrink-0 rounded-lg p-1 transition-colors ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Dialog */}
      <AnimatePresence>
        {showPasswordDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPasswordDialog(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                  <Lock size={18} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Change Password</h3>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Enter your current and new password</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordDialog(false)}
                  className={`shrink-0 rounded-lg p-1 transition-colors ${isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"}`}
                >
                  <X size={16} />
                </button>
              </div>

              {passwordError && (
                <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
                  Password changed successfully!
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                    }`}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                    }`}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div>
                  <label className={`mb-1 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordDialog(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordLoading || passwordSuccess}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {passwordLoading && <Loader2 size={14} className="animate-spin" />}
                  {passwordLoading ? "Changing..." : passwordSuccess ? "Done" : "Change Password"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
