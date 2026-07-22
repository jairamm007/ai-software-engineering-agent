import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { generateApiDocs, type ApiEndpoint, type ApiDocGroup } from "@/services/documentationGenerator";
import { Lock, Unlock, ChevronDown, ChevronRight, Search } from "lucide-react";

interface Props {
  repositoryId: string;
}

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#22c55e", text: "#fff" },
  POST: { bg: "#3b82f6", text: "#fff" },
  PUT: { bg: "#f59e0b", text: "#fff" },
  DELETE: { bg: "#ef4444", text: "#fff" },
  PATCH: { bg: "#8b5cf6", text: "#fff" },
  ALL: { bg: "#64748b", text: "#fff" },
};

function EndpointRow({ endpoint, isDark }: { endpoint: ApiEndpoint; isDark: boolean }) {
  const colors = METHOD_COLORS[endpoint.method] || METHOD_COLORS.ALL;
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 ${isDark ? "border-white/5 hover:bg-white/[0.02]" : "border-slate-100 hover:bg-slate-50"}`}>
      <span className="shrink-0 rounded px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: colors.bg, color: colors.text }}>
        {endpoint.method}
      </span>
      <span className={`font-mono text-sm flex-1 truncate ${isDark ? "text-slate-200" : "text-slate-700"}`}>{endpoint.path}</span>
      <span className={`text-xs truncate max-w-[200px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{endpoint.handler}</span>
      <span className="shrink-0">
        {endpoint.auth ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} className="text-green-500" />}
      </span>
    </div>
  );
}

function GroupSection({ group, isDark }: { group: ApiDocGroup; isDark: boolean }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? "border-white/10" : "border-slate-200"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-2 px-4 py-3 text-left font-medium transition-colors ${
          isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
        }`}
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{group.group}</span>
        <span className={`ml-auto text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {group.prefix} · {group.endpoints.length} endpoint{group.endpoints.length !== 1 ? "s" : ""}
        </span>
      </button>
      {expanded && group.endpoints.map((ep, i) => (
        <EndpointRow key={i} endpoint={ep} isDark={isDark} />
      ))}
    </div>
  );
}

export default function ApiDocsGenerator({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["api-docs-gen", repositoryId],
    queryFn: () => generateApiDocs(repositoryId),
  });

  const filteredGroups = useMemo(() => {
    if (!query.data) return [];
    const q = search.toLowerCase();
    if (!q) return query.data.groups;
    return query.data.groups
      .map(g => ({
        ...g,
        endpoints: g.endpoints.filter(
          ep => ep.path.toLowerCase().includes(q) || ep.handler.toLowerCase().includes(q) || ep.method.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.endpoints.length > 0);
  }, [query.data, search]);

  if (query.isLoading) return <div className={`h-[400px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (query.isError || !query.data) return <p className="text-red-500">Failed to generate API docs.</p>;

  const data = query.data;

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`rounded-lg border pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${
              isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
        <div className="flex gap-3 text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-500"}>{data.totalEndpoints} endpoints</span>
          <span className="text-green-500">{data.publicEndpoints} public</span>
          <span className="text-amber-500">{data.authEndpoints} auth</span>
        </div>
      </div>

      <div className="space-y-3">
        {filteredGroups.map((group, i) => (
          <GroupSection key={i} group={group} isDark={isDark} />
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <p className={`text-center py-8 ${isDark ? "text-slate-400" : "text-slate-500"}`}>No endpoints found.</p>
      )}
    </div>
  );
}
