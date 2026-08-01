import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderGit2,
  MessageSquare,
  Search,
  BookOpen,
  GitPullRequest,
  GitBranch,
  Workflow,
  Boxes,
  FlaskConical,
  BarChart3,
  Star,
  History,
  Users,
  PanelLeftClose,
  PanelLeft,
  PanelRightOpen,
  LogOut,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
import type { SidebarMode } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Logo from "@/components/common/Logo";
import { getIntegrations } from "@/services/github-integration";

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
      { icon: GitBranch, label: "GitHub", path: "/github" },
      { icon: Users, label: "Teams", path: "/teams" },
      { icon: MessageSquare, label: "AI Chat", path: "/chat" },
      { icon: Search, label: "Search", path: "/search" },
    ],
  },
  {
    label: "AI Development",
    items: [
      { icon: Workflow, label: "Runs", path: "/runs" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { icon: BookOpen, label: "Documentation", path: "/documentation" },
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

function toggleIcon(mode: SidebarMode): [typeof PanelLeftClose, string] {
  if (mode === "expanded") return [PanelLeftClose, "Collapse to icons"];
  if (mode === "icons") return [PanelLeft, "Collapse to hidden"];
  return [PanelRightOpen, "Expand sidebar"];
}

const sidebarWidth: Record<SidebarMode, number> = {
  expanded: 260,
  icons: 72,
  hidden: 0,
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { mode, toggle } = useSidebar();
  const isDark = theme === "dark";
  const { user, isAuthenticated, logout } = useAuth();
  const iconsOnly = mode === "icons";
  const isHidden = mode === "hidden";

  const { data: integrations } = useQuery({
    queryKey: ["github-integrations"],
    queryFn: getIntegrations,
  });
  const githubConnected = integrations?.some((i: { isActive: boolean }) => i.isActive);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && mode === "expanded") {
        toggle();
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024 && mode === "expanded") {
      toggle();
    }
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const width = sidebarWidth[mode];

  return (
    <>
      <aside
        style={{ width, transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
        className={`relative flex h-screen shrink-0 flex-col border-r overflow-hidden ${
          isDark
            ? "border-white/[0.06] bg-[#0B0614]"
            : "border-slate-200/80 bg-white"
        }`}
      >
        {/* Decorative left accent line */}
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-[var(--accent)]/40 via-transparent to-transparent" />

        {/* Header: Logo + Collapse toggle */}
        <div className={`flex items-center justify-between border-b ${
          iconsOnly ? "px-2" : "gap-3 px-4"
        } py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            title="Go to Dashboard"
          >
            <Logo size="md" showText />
          </button>
          <button
            type="button"
            onClick={toggle}
            title={toggleIcon(mode)[1]}
            className={`rounded-lg p-1.5 transition-colors ${
              isDark ? "text-slate-500 hover:bg-white/5 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            {(() => {
              const [Icon] = toggleIcon(mode);
              return <Icon size={15} />;
            })()}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {sections.map((section) => (
            <div key={section.label}>
              {!iconsOnly && (
                <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest font-[Inter] transition-opacity duration-200 ${
                  isDark ? "text-slate-600" : "text-slate-400"
                }`}>
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        title={iconsOnly ? item.label : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 font-[Inter] ${
                          active
                            ? isDark
                              ? "bg-[var(--accent)]/10 text-white"
                              : "accent-bg-light accent-text-base"
                            : isDark
                              ? "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full accent-gradient" />
                        )}
                        <Icon
                          size={17}
                          className={`shrink-0 transition-colors duration-200 ${
                            active
                              ? "accent-text"
                              : isDark
                                ? "text-slate-500 group-hover:text-slate-300"
                                : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        <span
                          className="overflow-hidden whitespace-nowrap transition-opacity duration-200"
                          style={{ opacity: iconsOnly ? 0 : 1, width: iconsOnly ? 0 : "auto" }}
                        >
                          {item.label}
                        </span>
                        {item.path === "/github" && !githubConnected && !iconsOnly && (
                          <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                            isDark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600"
                          }`}>
                            Connect
                          </span>
                        )}
                        {active && !iconsOnly && item.path !== "/github" && (
                          <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full accent-bg" />
                        )}
                      </Link>
                    </li>
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
          {!iconsOnly && (
            <div className={`rounded-xl px-3 py-2.5 transition-opacity duration-200 ${
              isDark ? "bg-white/[0.02]" : "bg-slate-50"
            }`}>
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
            </div>
          )}

          {/* User card */}
          {isAuthenticated && user && (
            <>
              {!iconsOnly ? (
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className={`w-full overflow-hidden rounded-xl p-3 text-left transition-colors ${
                    isDark
                      ? "bg-[var(--accent)]/[0.06] hover:bg-[var(--accent)]/[0.10]"
                      : "bg-[var(--accent)]/[0.06] hover:bg-[var(--accent)]/[0.10]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full accent-gradient text-xs font-bold text-white font-[Inter]">
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
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  title={user.name || "Profile"}
                  className="flex w-full justify-center"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full accent-gradient text-xs font-bold text-white font-[Inter]">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                </button>
              )}
            </>
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
              <span
                className="overflow-hidden whitespace-nowrap transition-opacity duration-200"
                style={{ opacity: iconsOnly ? 0 : 1, width: iconsOnly ? 0 : "auto" }}
              >
                Sign Out
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Floating toggle button when hidden */}
      {isHidden && (
        <button
          type="button"
          onClick={toggle}
          title="Expand sidebar"
          className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 flex h-12 w-5 items-center justify-center rounded-r-lg border-l-0 transition-colors ${
            isDark
              ? "border-white/[0.06] bg-[#0B0614] text-slate-400 hover:text-white"
              : "border-slate-200/80 bg-white text-slate-400 hover:text-slate-900"
          }`}
          style={{
            borderWidth: "1px 1px 1px 0",
          }}
        >
          <PanelRightOpen size={12} />
        </button>
      )}
    </>
  );
}
