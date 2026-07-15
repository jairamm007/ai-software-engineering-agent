import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderGit2,
  MessageSquare,
  Search,
  BookOpen,
  GitPullRequest,
  Boxes,
  FlaskConical,
  BarChart3,
  Star,
  History,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: FolderGit2, label: "Repositories", path: "/repositories" },
      { icon: MessageSquare, label: "AI Chat", path: "/chat" },
      { icon: Search, label: "Search", path: "/search" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { icon: BookOpen, label: "Documentation", path: "/docs" },
      { icon: GitPullRequest, label: "Code Review", path: "/code-review" },
      { icon: Boxes, label: "Architecture", path: "/architecture" },
    ],
  },
  {
    label: "Quality",
    items: [
      { icon: FlaskConical, label: "Testing", path: "/testing" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
    ],
  },
  {
    label: "Personal",
    items: [
      { icon: Star, label: "Favorites", path: "/favorites" },
      { icon: History, label: "History", path: "/history" },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { collapsed, toggle } = useSidebar();
  const isDark = theme === "dark";
  const { user, isAuthenticated, logout } = useAuth();

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
    if (window.innerWidth < 1024 && !collapsed) {
      toggle();
    }
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`relative flex h-screen shrink-0 flex-col border-r ${
        isDark
          ? "border-white/[0.06] bg-[#0B0614]"
          : "border-slate-200/80 bg-white"
      }`}
    >
      {/* Decorative left accent line */}
      <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-violet-500/40 via-fuchsia-500/20 to-transparent" />

      {/* Header: Logo + Settings + Collapse */}
      <div className={`flex items-center gap-3 border-b px-4 py-4 ${
        isDark ? "border-white/[0.06]" : "border-slate-100"
      }`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/25">
          <Sparkles size={17} className="text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h2 className="font-[Outfit] text-sm font-bold leading-tight">Repo Verify</h2>
              <p className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                AI Software Agent
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`rounded-lg p-1.5 transition-colors ${
              isDark ? "text-slate-500 hover:bg-white/5 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest font-[Inter] ${
                    isDark ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      title={collapsed ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 font-[Inter] ${
                        active
                          ? isDark
                            ? "bg-violet-500/10 text-white"
                            : "bg-violet-50 text-violet-700"
                          : isDark
                            ? "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active-glow"
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-500"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                      <Icon
                        size={17}
                        className={`shrink-0 transition-colors duration-200 ${
                          active
                            ? "text-violet-400"
                            : isDark
                              ? "text-slate-500 group-hover:text-slate-300"
                              : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {active && !collapsed && (
                        <motion.div
                          layoutId="sidebar-active-dot"
                          className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`border-t px-3 py-3 space-y-2 ${
        isDark ? "border-white/[0.06]" : "border-slate-100"
      }`}>
        {/* AI Status */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`overflow-hidden rounded-xl px-3 py-2.5 ${
                isDark ? "bg-white/[0.02]" : "bg-slate-50"
              }`}
            >
              <p className={`text-[11px] font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                AI Status
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className={`text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  All systems operational
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User card — clickable to profile */}
        {isAuthenticated && user && (
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.button
                key="user-expanded"
                type="button"
                onClick={() => navigate("/profile")}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`w-full overflow-hidden rounded-xl p-3 text-left transition-colors ${
                  isDark
                    ? "bg-gradient-to-br from-violet-500/[0.06] to-fuchsia-500/[0.06] hover:from-violet-500/[0.10] hover:to-fuchsia-500/[0.10]"
                    : "bg-gradient-to-br from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white font-[Inter]">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-xs font-medium font-[Inter] ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      {user.name || "User"}
                    </p>
                    <p className={`truncate text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </motion.button>
            ) : (
              <motion.button
                key="user-collapsed"
                type="button"
                onClick={() => navigate("/profile")}
                title={user.name || "Profile"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex w-full justify-center"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white font-[Inter]">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        )}

        {/* Sign out */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => logout()}
            title="Sign out"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 font-[Inter] ${
              isDark
                ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                : "text-slate-400 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <LogOut size={17} className="shrink-0" />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
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
}
