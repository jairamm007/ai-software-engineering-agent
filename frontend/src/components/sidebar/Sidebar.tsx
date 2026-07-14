import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderGit2,
  Settings,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const menu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderGit2, label: "Repositories", path: "/repositories" },
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { collapsed, toggle } = useSidebar();
  const isDark = theme === "dark";
  const { user, isAuthenticated, logout } = useAuth();

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !collapsed) {
        toggle();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && !collapsed) {
      toggle();
    }
  }, [location.pathname]);

  const sidebarContent = (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`sticky top-0 flex h-screen flex-col border-r ${
        isDark
          ? "border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white"
          : "border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50 text-slate-900"
      }`}
    >
      <div className={`flex items-center gap-3 border-b px-4 py-5 ${
        isDark ? "border-white/5" : "border-slate-200/80"
      }`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/25">
          <Sparkles size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h2 className="text-base font-bold leading-tight">AI Software</h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Engineering Agent
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={toggle}
          className={`ml-auto hidden rounded-lg p-1.5 transition-colors lg:flex ${
            isDark ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"
          }`}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <div className={`border-b px-3 py-3 space-y-1 ${
        isDark ? "border-white/5" : "border-slate-200/80"
      }`}>
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            isDark
              ? "text-slate-400 hover:bg-white/5 hover:text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {isDark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all lg:hidden ${
            isDark
              ? "text-slate-400 hover:bg-white/5 hover:text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} className="shrink-0" />
          ) : (
            <PanelLeftClose size={18} className="shrink-0" />
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4">
        {!collapsed && (
          <p className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}>
            Navigation
          </p>
        )}
        <ul className="space-y-1">
          {menu.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.li
                key={`${item.label}-${index}`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.03 }}
              >
                <Link
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? isDark
                        ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 text-white shadow-sm"
                        : "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5 text-violet-700 shadow-sm"
                      : isDark
                        ? "text-slate-400 hover:bg-white/5 hover:text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-violet-500"
                        : isDark
                          ? "text-slate-500 group-hover:text-slate-300"
                          : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className={`border-t px-3 py-4 space-y-2 ${
        isDark ? "border-white/5" : "border-slate-200/80"
      }`}>
        {isAuthenticated && user && (
          <AnimatePresence>
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`overflow-hidden rounded-xl p-3 ${
                  isDark
                    ? "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
                    : "bg-gradient-to-br from-violet-50 to-fuchsia-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-xs font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      {user.name || "User"}
                    </p>
                    <p className={`truncate text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
            )}
          </AnimatePresence>
        )}

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`overflow-hidden rounded-xl p-3 ${
                isDark
                  ? "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
                  : "bg-gradient-to-br from-violet-50 to-fuchsia-50"
              }`}
            >
              <p className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                AI Status
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  All systems operational
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => logout()}
            title="Sign out"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              isDark
                ? "text-red-400 hover:bg-red-500/10"
                : "text-red-500 hover:bg-red-50"
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>
    </motion.aside>
  );

  return sidebarContent;
}
