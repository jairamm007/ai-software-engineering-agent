import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { getFolderTree, type FolderNode } from "@/services/repositoryIntelligence";
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from "lucide-react";

interface Props {
  repositoryId: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_COLORS: Record<string, string> = {
  ".ts": "#3178c6", ".tsx": "#3178c6", ".js": "#f1e05a", ".jsx": "#f1e05a",
  ".py": "#3572A5", ".json": "#292929", ".md": "#083fa1", ".css": "#563d7c",
  ".html": "#e34c26", ".yml": "#cb171e", ".yaml": "#cb171e", ".prisma": "#2D3748",
  ".go": "#00ADD8", ".rs": "#dea584", ".java": "#b07219", ".rb": "#701516",
};

function TreeNode({ node, depth = 0 }: { node: FolderNode; depth?: number }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expanded, setExpanded] = useState(depth < 2);
  const isDir = node.type === "directory";
  const color = !isDir ? EXT_COLORS[node.extension || ""] || (isDark ? "#94a3b8" : "#64748b") : undefined;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-sm cursor-pointer transition-colors ${
          isDark ? "hover:bg-white/5" : "hover:bg-slate-100"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isDir && setExpanded(!expanded)}
      >
        {isDir ? (
          expanded ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronRight size={14} className="shrink-0 text-slate-400" />
        ) : (
          <span className="w-[14px] shrink-0" />
        )}
        {isDir ? (
          expanded ? <FolderOpen size={14} className="shrink-0 text-blue-400" /> : <Folder size={14} className="shrink-0 text-blue-400" />
        ) : (
          <FileText size={14} className="shrink-0" style={{ color }} />
        )}
        <span className={`truncate ${isDir ? "font-medium" : ""} ${isDark ? "text-slate-200" : "text-slate-700"}`}>
          {node.name}
        </span>
        {isDir ? (
          <span className={`ml-auto text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {node.children?.length ?? 0}
          </span>
        ) : (
          <span className={`ml-auto text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {formatSize(node.size)}
          </span>
        )}
      </div>
      {isDir && expanded && node.children?.map((child) => (
        <TreeNode key={child.path} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function FolderVisualization({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["folder-tree", repositoryId],
    queryFn: () => getFolderTree(repositoryId),
  });

  const stats = useMemo(() => {
    if (!query.data) return { files: 0, dirs: 0, totalSize: 0 };
    let files = 0, dirs = 0;
    const walk = (node: FolderNode) => {
      if (node.type === "directory") { dirs++; node.children?.forEach(walk); }
      else files++;
    };
    walk(query.data);
    return { files, dirs, totalSize: query.data.size };
  }, [query.data]);

  if (query.isLoading) return <div className={`h-[400px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (query.isError || !query.data) return <p className="text-red-500">Failed to load folder tree.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${
            isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          }`}
        />
        <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {stats.dirs} folders · {stats.files} files · {formatSize(stats.totalSize)}
        </span>
      </div>
      <div className={`rounded-2xl border overflow-auto max-h-[600px] ${
        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}>
        <TreeNode node={query.data} />
      </div>
    </div>
  );
}
