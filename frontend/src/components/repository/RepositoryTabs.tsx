import { NavLink } from "react-router-dom";

interface Props {
  repositoryId: string;
}

const tabs = [
  {
    label: "Overview",
    path: "",
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
    path: "docs",
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
          end={tab.path === ""}
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