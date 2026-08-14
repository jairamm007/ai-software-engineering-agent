import { useParams, Link, useLocation, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Users, FolderGit2, MessageSquare, Activity, FileText, Code2, FlaskConical, BarChart3, Bell, Settings, ArrowLeft } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getTeam } from "@/services/team";
import { useAuth } from "@/context/AuthContext";
import type { TeamMember, TeamRole } from "@/types/team";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import AuroraBackground from "@/components/motion/AuroraBackground";
import PageTransition from "@/components/motion/PageTransition";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "" },
  { icon: Users, label: "Members", path: "/members" },
  { icon: FolderGit2, label: "Repositories", path: "/repositories" },
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: MessageSquare, label: "Discussions", path: "/discussions" },
  { icon: FileText, label: "Documentation", path: "/documentation" },
  { icon: Code2, label: "Code Reviews", path: "/code-reviews" },
  { icon: FlaskConical, label: "Testing", path: "/testing" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Activity, label: "Activity", path: "/activity" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function TeamLayout() {
  const { teamId } = useParams<{ teamId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const { user } = useAuth();

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeam(teamId!),
    enabled: !!teamId,
  });

  const myMember = team?.members?.find((m: TeamMember) => m.userId === user?.id);
  const myRole = myMember?.role as TeamRole | undefined;

  const basePath = `/teams/${teamId}`;
  const currentPath = location.pathname.replace(basePath, "") || "";

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator size="md" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Team not found</p>
        <Link to="/teams" className="text-sm accent-text hover:underline">Back to Teams</Link>
      </div>
    );
  }

  return (
    <div className="app-bg relative flex h-screen overflow-hidden">
      <AuroraBackground />
      {/* Team Sidebar */}
      <aside
        className={`relative z-10 w-60 shrink-0 border-r flex flex-col ${
          isDark ? "border-white/[0.06] surface-elevated" : "border-slate-200/80 bg-white"
        }`}
      >
        {/* Team Header */}
        <div className={`border-b px-4 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <Link
            to="/teams"
            className={`inline-flex items-center gap-1 text-[10px] font-medium mb-2 ${
              isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"
            }`}
          >
            <ArrowLeft size={11} />
            All Teams
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light">
              <Users size={13} className="accent-text-base" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-sm font-semibold font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                {team.name}
              </h2>
              <p className={`text-[10px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {team._count?.members ?? team.members?.length ?? 0} members
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = currentPath === item.path || (item.path === "" && currentPath === "");
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={`${basePath}${item.path}`}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all font-[Inter] ${
                  active
                    ? isDark
                      ? "bg-[var(--accent)]/10 text-white"
                      : "accent-bg-light accent-text-base"
                    : isDark
                      ? "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={16} className={`shrink-0 ${active ? "accent-text" : ""}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role Badge */}
        <div className={`border-t px-4 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
            isDark ? "bg-white/[0.02]" : "bg-slate-50"
          }`}>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full accent-gradient text-[8px] font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-medium font-[Inter] truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {myRole || "viewer"}
              </p>
              <p className={`text-[9px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {team.name}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <PageTransition locationKey={location.pathname} variant="slide-up">
          <div className="p-4 sm:p-6 md:p-8">
            <Outlet context={{ team, myRole, myMember }} />
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
