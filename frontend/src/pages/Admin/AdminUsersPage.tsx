import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShieldCheck,
  User,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  X,
  FolderGit2,
  MessageSquare,
  Ban,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  LogOut,
  Eye,
  MoreVertical,
  Users,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  listUsers,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  promoteUser,
  demoteUser,
  forceLogoutAllUserSessions,
  getAdminUser,
  type AdminUser,
  type AdminUserDetail,
} from "@/services/admin";

export default function AdminUsersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        suspended: statusFilter || undefined,
        page,
        limit: 10,
      });
      setUsers(result.users);
      setPagination(result.pagination);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, { name: editName, role: editRole });
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      setConfirmDelete(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await suspendUser(userId);
      toast.success("User suspended");
      setOpenMenuId(null);
      fetchUsers();
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await activateUser(userId);
      toast.success("User activated");
      setOpenMenuId(null);
      fetchUsers();
    } catch {
      toast.error("Failed to activate user");
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      await promoteUser(userId);
      toast.success("User promoted to admin");
      setOpenMenuId(null);
      fetchUsers();
    } catch {
      toast.error("Failed to promote user");
    }
  };

  const handleDemote = async (userId: string) => {
    try {
      await demoteUser(userId);
      toast.success("User demoted to regular user");
      setOpenMenuId(null);
      fetchUsers();
    } catch {
      toast.error("Failed to demote user");
    }
  };

  const handleForceLogout = async (userId: string) => {
    try {
      await forceLogoutAllUserSessions(userId);
      toast.success("All sessions terminated");
      setOpenMenuId(null);
    } catch {
      toast.error("Failed to terminate sessions");
    }
  };

  const handleViewDetail = async (userId: string) => {
    setDetailLoading(true);
    setOpenMenuId(null);
    try {
      const detail = await getAdminUser(userId);
      setDetailUser(detail);
    } catch {
      toast.error("Failed to load user details");
    } finally {
      setDetailLoading(false);
    }
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

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
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              View, edit, and manage all platform users
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-[13px] outline-none transition-all ${
                isDark
                  ? "border-white/[0.06] bg-[#111118] text-white placeholder:text-slate-600 focus:border-rose-500/50"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50"
              }`}
            />
          </div>
          <div className="flex gap-2">
            {(["", "admin", "user"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setRoleFilter(role);
                  setPage(1);
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  roleFilter === role
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20"
                    : isDark
                      ? "border border-white/[0.06] bg-[#111118] text-slate-400 hover:bg-white/[0.04]"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {role === "" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
            <div className="w-px" />
            {(["", "false", "true"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20"
                    : isDark
                      ? "border border-white/[0.06] bg-[#111118] text-slate-400 hover:bg-white/[0.04]"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {status === "" ? "All Status" : status === "true" ? "Suspended" : "Active"}
              </button>
            ))}
          </div>
        </form>
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
                {["User", "Role", "Status", "Stats", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider ${
                      h === "Actions" ? "text-right " : ""
                    }${h === "Stats" || h === "Joined" ? "hidden sm:table-cell " : ""}${h === "Joined" ? "!hidden md:!table-cell " : ""}${isDark ? "text-slate-500" : "text-slate-400"}`}
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
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                      <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        Loading users...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-5 py-16 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-xs font-bold text-white">
                          {user.image ? (
                            <img src={user.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            user.name[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`truncate text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                          >
                            {user.name}
                          </p>
                          <p
                            className={`truncate text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
                            : isDark
                              ? "bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/[0.06]"
                              : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                        }`}
                      >
                        {user.role === "admin" ? <ShieldCheck size={11} /> : <User size={11} />}
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.suspended
                            ? "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                        }`}
                      >
                        {user.suspended ? <Ban size={11} /> : <CheckCircle size={11} />}
                        {user.suspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          <FolderGit2 size={12} /> {user.repositoryCount}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          <MessageSquare size={12} /> {user.conversationCount}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => void handleViewDetail(user.id)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            isDark
                              ? "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(user);
                            setEditName(user.name);
                            setEditRole(user.role || "user");
                          }}
                          className={`rounded-lg p-1.5 transition-colors ${
                            isDark
                              ? "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                          title="Edit user"
                        >
                          <Edit3 size={15} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                              className={`rounded-lg p-1.5 transition-colors ${
                                isDark
                                  ? "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              }`}
                              title="More actions"
                            >
                              <MoreVertical size={15} />
                            </button>
                            <AnimatePresence>
                              {openMenuId === user.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    className={`absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border py-1 shadow-2xl ${
                                      isDark
                                        ? "border-white/[0.06] bg-[#1a1a24]"
                                        : "border-slate-200 bg-white"
                                    }`}
                                  >
                                    {user.suspended ? (
                                      <MenuButton
                                        icon={<CheckCircle size={14} />}
                                        label="Activate User"
                                        color="emerald"
                                        onClick={() => void handleActivate(user.id)}
                                        isDark={isDark}
                                      />
                                    ) : (
                                      <MenuButton
                                        icon={<Ban size={14} />}
                                        label="Suspend User"
                                        color="amber"
                                        onClick={() => void handleSuspend(user.id)}
                                        isDark={isDark}
                                      />
                                    )}
                                    {user.role === "admin" ? (
                                      <MenuButton
                                        icon={<ArrowDownCircle size={14} />}
                                        label="Demote to User"
                                        color="slate"
                                        onClick={() => void handleDemote(user.id)}
                                        isDark={isDark}
                                      />
                                    ) : (
                                      <MenuButton
                                        icon={<ArrowUpCircle size={14} />}
                                        label="Promote to Admin"
                                        color="violet"
                                        onClick={() => void handlePromote(user.id)}
                                        isDark={isDark}
                                      />
                                    )}
                                    <MenuButton
                                      icon={<LogOut size={14} />}
                                      label="Force Logout"
                                      color="orange"
                                      onClick={() => void handleForceLogout(user.id)}
                                      isDark={isDark}
                                    />
                                    <div className={`my-1 h-px ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`} />
                                    <MenuButton
                                      icon={<Trash2 size={14} />}
                                      label="Delete User"
                                      color="red"
                                      onClick={() => {
                                        setConfirmDelete(user.id);
                                        setOpenMenuId(null);
                                      }}
                                      isDark={isDark}
                                    />
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div
            className={`flex items-center justify-between border-t px-5 py-3 ${
              isDark ? "border-white/[0.06]" : "border-slate-100"
            }`}
          >
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Page {page} of {pagination.pages} ({pagination.total} users)
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
        {detailUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setDetailUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
                isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">User Details</h3>
                <button
                  type="button"
                  onClick={() => setDetailUser(null)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isDark ? "text-slate-400 hover:bg-white/[0.06]" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
              {detailLoading ? (
                <div className="py-10 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-xl font-bold text-white">
                      {detailUser.image ? (
                        <img
                          src={detailUser.image}
                          alt=""
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        detailUser.name[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold">{detailUser.name}</p>
                      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {detailUser.email}
                      </p>
                      <div className="mt-1.5 flex gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                            detailUser.role === "admin"
                              ? "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
                              : "bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/[0.06]"
                          }`}
                        >
                          {detailUser.role === "admin" ? (
                            <ShieldCheck size={10} />
                          ) : (
                            <User size={10} />
                          )}
                          {detailUser.role || "user"}
                        </span>
                        {detailUser.suspended && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
                            <Ban size={10} /> Suspended
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {detailUser.bio && (
                    <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {detailUser.bio}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Repositories", value: detailUser.repositoryCount },
                      { label: "Conversations", value: detailUser.conversationCount },
                      { label: "Comments", value: detailUser.comments },
                      { label: "Active Sessions", value: detailUser.sessions },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className={`rounded-xl border p-3.5 ${
                          isDark
                            ? "border-white/[0.04] bg-white/[0.02]"
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {s.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`rounded-xl border p-3.5 text-xs ${
                      isDark
                        ? "border-white/[0.04] bg-white/[0.02] text-slate-500"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <p>Joined: {new Date(detailUser.createdAt).toLocaleDateString()}</p>
                    <p>Last updated: {new Date(detailUser.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
                isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Edit User</h3>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isDark ? "text-slate-400 hover:bg-white/[0.06]" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    className={`mb-1.5 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full rounded-xl border py-2.5 px-4 text-[13px] outline-none transition-all ${
                      isDark
                        ? "border-white/[0.06] bg-white/[0.03] text-white focus:border-rose-500/50"
                        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-rose-500/50"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`mb-1.5 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  >
                    Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className={`w-full rounded-xl border py-2.5 px-4 text-[13px] outline-none transition-all ${
                      isDark
                        ? "border-white/[0.06] bg-white/[0.03] text-white focus:border-rose-500/50"
                        : "border-slate-200 bg-slate-50 text-slate-900 focus:border-rose-500/50"
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      isDark
                        ? "text-slate-300 hover:bg-white/[0.04]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleUpdate()}
                    className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h3 className="text-lg font-bold">Delete User</h3>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                This action cannot be undone. The user and all associated data will be permanently deleted.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isDark
                      ? "text-slate-300 hover:bg-white/[0.04]"
                      : "text-slate-600 hover:bg-slate-100"
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

function MenuButton({
  icon,
  label,
  color,
  onClick,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  color: "emerald" | "amber" | "violet" | "orange" | "slate" | "red";
  onClick: () => void;
  isDark: boolean;
}) {
  const colors: Record<string, string> = {
    emerald: isDark ? "text-emerald-400 hover:bg-emerald-500/10" : "text-emerald-600 hover:bg-emerald-50",
    amber: isDark ? "text-amber-400 hover:bg-amber-500/10" : "text-amber-600 hover:bg-amber-50",
    violet: isDark ? "text-violet-400 hover:bg-violet-500/10" : "text-violet-600 hover:bg-violet-50",
    orange: isDark ? "text-orange-400 hover:bg-orange-500/10" : "text-orange-600 hover:bg-orange-50",
    slate: isDark ? "text-slate-400 hover:bg-white/[0.04]" : "text-slate-500 hover:bg-slate-100",
    red: isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${colors[color]}`}
    >
      {icon}
      {label}
    </button>
  );
}
