import { NavLink } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  repositoryId: string;
}

const tabs = [
  { label: "Overview", path: "overview" },
  { label: "Files", path: "files" },
  { label: "AI Chat", path: "chat" },
  { label: "Review", path: "review" },
  { label: "Architecture", path: "architecture" },
  { label: "Documentation", path: "documentation" },
  { label: "Dependency Graph", path: "dependency-graph" },
  { label: "Intelligence", path: "intelligence" },
  { label: "Doc Generator", path: "doc-generator" },
  { label: "Search", path: "semantic-search" },
  { label: "Multi-Agent", path: "multi-agent" },
];

export default function RepositoryTabs({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`mb-8 flex gap-4 overflow-x-auto border-b scrollbar-thin sm:gap-6 ${isDark ? "border-white/10" : "border-slate-200"}`}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={`/repositories/${repositoryId}/${tab.path}`}
          end
          className={({ isActive }) =>
            `shrink-0 pb-3 text-sm transition-colors ${
              isActive
                ? "border-b-2 border-[var(--accent)] font-semibold text-[var(--accent)]"
                : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
