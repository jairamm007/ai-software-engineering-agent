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
];

export default function RepositoryTabs({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`mb-8 flex gap-6 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={`/repositories/${repositoryId}/${tab.path}`}
          end
          className={({ isActive }) =>
            `pb-3 transition-colors ${
              isActive
                ? "border-b-2 border-violet-500 font-semibold text-violet-500"
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
