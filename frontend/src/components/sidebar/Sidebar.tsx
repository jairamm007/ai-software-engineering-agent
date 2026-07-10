import {
  LayoutDashboard,
  FolderGit2,
  MessageSquare,
  GitBranch,
  FileCode2,
  BookOpen,
  Settings,
} from "lucide-react";

import { Link } from "react-router-dom";

const menu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: FolderGit2,
    label: "Repositories",
    path: "/repositories",
  },
  {
    icon: MessageSquare,
    label: "AI Chat",
    path: "/chat",
  },
  {
    icon: GitBranch,
    label: "Architecture",
    path: "/architecture",
  },
  {
    icon: FileCode2,
    label: "Code Review",
    path: "/review",
  },
  {
    icon: BookOpen,
    label: "Documentation",
    path: "/docs",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 260,
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <h2
        style={{
          marginBottom: 32,
        }}
      >
        AI Software
        <br />
        Engineering Agent
      </h2>

      {menu.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
              color: "white",
              textDecoration: "none",
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}