import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FolderGit2,
  Bot,
  Code2,
  FlaskConical,
  BookOpen,
  Search,
  BarChart3,
  Shield,
  Activity,
  Bell,
  Headphones,
  HardDrive,
  FileText,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  Sun,
  Moon,
  Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import AuroraBackground from "@/components/motion/AuroraBackground";
import PageTransition from "@/components/motion/PageTransition";

const sidebarSections = [
  {
    items: [
      { key: "overview", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    ],
  },
  {
    items: [
      { key: "users", label: "Users", icon: Users, path: "/admin/users" },
      { key: "admins", label: "Admin Management", icon: UserCog, path: "/admin/admins" },
    ],
  },
  {
    items: [
      { key: "repositories", label: "Repositories", icon: FolderGit2, path: "/admin/repositories" },
      { key: "ai", label: "AI Services", icon: Bot, path: "/admin/ai" },
      { key: "code-reviews", label: "Code Reviews", icon: Code2, path: "/admin/code-reviews" },
      { key: "testing", label: "Testing", icon: FlaskConical, path: "/admin/testing" },
      { key: "documentation", label: "Documentation", icon: BookOpen, path: "/admin/documentation" },
      { key: "search", label: "Search", icon: Search, path: "/admin/search" },
    ],
  },
  {
    items: [
      { key: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
      { key: "security", label: "Security", icon: Shield, path: "/admin/security" },
      { key: "activity", label: "Activity Logs", icon: Activity, path: "/admin/activity-logs" },
    ],
  },
  {
    items: [
      { key: "notifications", label: "Notifications", icon: Bell, path: "/admin/notifications" },
      { key: "support", label: "Support", icon: Headphones, path: "/admin/support" },
      { key: "backup", label: "Backup & Recovery", icon: HardDrive, path: "/admin/backup" },
      { key: "reports", label: "Reports", icon: FileText, path: "/admin/reports" },
    ],
  },
  {
    items: [
      { key: "profile", label: "Profile", icon: UserCircle, path: "/admin/profile" },
      { key: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("admin-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";

  return (
    <div className="app-bg relative flex h-screen overflow-hidden transition-colors duration-300">
      <AuroraBackground />
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out lg:relative ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarWidth} ${
          isDark ? "border-white/[0.06] surface-elevated" : "border-slate-200 bg-white"
        }`}
      >
        {/* Sidebar header */}
        <div className={`flex h-16 shrink-0 items-center border-b px-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <Link to="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/20">
              <Shield size={17} className="text-white" />
            </div>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden">
                <h1 className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Admin Panel</h1>
                <p className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>Management Console</p>
              </motion.div>
            )}
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className={`lg:hidden rounded-lg p-1.5 transition-colors ${isDark ? "text-slate-400 hover:bg-white/5 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}
            >
              <X size={15} />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`hidden lg:flex rounded-lg p-1.5 transition-colors ${
                isDark ? "text-slate-500 hover:bg-white/5 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
            >
              {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <div className="space-y-3">
            {sidebarSections.map((section, si) => (
              <div key={si}>
                {si > 0 && !collapsed && (
                  <div className={`mx-2.5 mb-2 h-px ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`} />
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.key}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                          active
                            ? isDark
                              ? "bg-gradient-to-r from-rose-500/15 to-orange-500/15 text-white shadow-sm shadow-rose-500/5"
                              : "bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700"
                            : isDark
                              ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="admin-active-tab"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/15 to-orange-500/15"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <item.icon
                          size={17}
                          className={`relative z-10 shrink-0 transition-colors ${
                            active ? "text-rose-500" : ""
                          }`}
                        />
                        {!collapsed && (
                          <span className="relative z-10 truncate">{item.label}</span>
                        )}
                        {active && !collapsed && (
                          <ChevronRight size={13} className="relative z-10 ml-auto text-rose-500/60" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className={`shrink-0 border-t px-2.5 py-2.5 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <Link
            to="/dashboard"
            title={collapsed ? "User Dashboard" : undefined}
            className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-colors ${
              isDark ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Home size={17} className="shrink-0" />
            {!collapsed && <span>User Dashboard</span>}
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-colors ${
              isDark ? "text-rose-400 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6 ${isDark ? "border-white/[0.06] bg-[var(--bg-secondary)]/90" : "border-slate-200 bg-white/80"} backdrop-blur-xl`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <Menu size={20} />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`hidden lg:flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                isDark ? "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white" : "border-slate-200 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className={`hidden sm:flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
              isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
            }`}>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-[11px] font-bold text-white shadow-sm">
                {user?.image ? (
                  <img src={user.image} alt="" className="h-7 w-7 rounded-lg object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() ?? "A"
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold leading-none ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {user?.name ?? "Admin"}
                </span>
                <span className={`text-[10px] leading-none mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <PageTransition locationKey={location.pathname} variant="blur">
            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
