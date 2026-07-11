import { NavLink } from "react-router-dom";

interface Props {
  repositoryId: string;
}

const tabs = [
  {
    label: "Overview",
    path: "overview",
  },
  {
    label: "Files",
    path: "files",
  },
  {
    label: "AI Chat",
    path: "chat",
  },
  {
    label: "Review",
    path: "review",
  },
  {
    label: "Architecture",
    path: "architecture",
  },
  {
    label: "Documentation",
    path: "documentation",
  },
  {
    label: "Dependency Graph",
    path: "dependency-graph",
  },
];

export default function RepositoryTabs({
  repositoryId,
}: Props) {
  return (
    <div className="mb-8 flex gap-6 border-b">
      {tabs.map((tab) => (
        <NavLink
          key={tab.label}
          to={`/repositories/${repositoryId}/${tab.path}`}
          end
          className={({ isActive }) =>
            `pb-3 ${
              isActive
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
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
