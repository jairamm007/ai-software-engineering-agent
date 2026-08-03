import { useTheme } from "@/context/ThemeContext";
import Badge from "@/components/pipeline/Badge";
import type { ProjectInsights, TechStackItem } from "@/types/insights";

const CATEGORY_COLORS: Record<string, string> = {
  frontend: "bg-blue-500/15 text-blue-500",
  ui: "bg-indigo-500/15 text-indigo-500",
  backend: "bg-emerald-500/15 text-emerald-500",
  data: "bg-purple-500/15 text-purple-500",
  database: "bg-purple-500/15 text-purple-500",
  vector_database: "bg-fuchsia-500/15 text-fuchsia-500",
  ai: "bg-rose-500/15 text-rose-500",
  testing: "bg-amber-500/15 text-amber-600",
  tooling: "bg-slate-500/15 text-slate-500",
  state: "bg-cyan-500/15 text-cyan-500",
  http: "bg-sky-500/15 text-sky-500",
  validation: "bg-teal-500/15 text-teal-600",
  cache: "bg-orange-500/15 text-orange-500",
  message_queue: "bg-yellow-500/15 text-yellow-600",
  search: "bg-lime-500/15 text-lime-600",
  storage: "bg-stone-500/15 text-stone-500",
  infrastructure: "bg-slate-500/15 text-slate-500",
  misc: "bg-slate-500/15 text-slate-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  ui: "UI",
  backend: "Backend",
  data: "Data / ORM",
  database: "Database",
  vector_database: "Vector Database",
  ai: "AI",
  testing: "Testing",
  tooling: "Tooling",
  state: "State",
  http: "HTTP / Data Fetching",
  validation: "Validation",
  cache: "Cache",
  message_queue: "Message Queue",
  search: "Search",
  storage: "Storage",
  infrastructure: "Infrastructure",
  misc: "Miscellaneous",
};

const groupByCategory = (items: TechStackItem[]): Record<string, TechStackItem[]> => {
  const groups: Record<string, TechStackItem[]> = {};
  for (const item of items) {
    (groups[item.category] ??= []).push(item);
  }
  return groups;
};

export default function TechStackPanel({ insights }: { insights: ProjectInsights }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (insights.techStack.length === 0) {
    return (
      <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        No tech stack detected for this repository.
      </p>
    );
  }

  const groups = groupByCategory(insights.techStack);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className={`rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {CATEGORY_LABELS[category] ?? category}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {items.map((item) => (
              <Badge key={item.name} className={CATEGORY_COLORS[category] ?? "bg-slate-500/15 text-slate-500"}>
                {item.name}
                {item.version ? <span className="opacity-70">{item.version}</span> : null}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
