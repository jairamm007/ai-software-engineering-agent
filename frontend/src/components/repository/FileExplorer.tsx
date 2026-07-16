import { useMemo, useState } from "react";
import type { RepositoryFile } from "@/types/repository";
import { buildFileTree } from "@/utils/buildFileTree";
import FileTreeNode from "./tree/FileTreeNode";
import { useTheme } from "@/context/ThemeContext";
import { Search, FolderGit2, ChevronDown } from "lucide-react";

interface Props {
  files: RepositoryFile[];
  selectedFileId?: string;
  onSelect: (file: RepositoryFile) => void;
}

export default function FileExplorer({ files, selectedFileId, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    return files.filter((file) => file.path.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  const tree = buildFileTree(filteredFiles);

  const totalChunks = files.reduce((sum, f) => sum + f.chunks.length, 0);

  return (
    <aside className={`flex max-h-[calc(100vh-6rem)] min-h-0 flex-col overflow-hidden rounded-2xl border shadow-sm transition-all ${
      isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-slate-200" : "border-slate-200 bg-gradient-to-b from-white to-slate-50/80 text-slate-800"
    }`}>
      <div className={`border-b px-4 py-3 ${isDark ? "border-white/10" : "border-slate-200/80"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isDark ? "bg-[var(--accent)]/15" : "bg-[var(--accent)]/10"
            }`}>
              <FolderGit2 size={14} className="text-[var(--accent)]" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Files</h2>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {files.length} files · {totalChunks} chunks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded-lg p-1.5 transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}
          >
            <ChevronDown size={14} className={`transition-transform ${collapsed ? "-rotate-90" : ""} ${isDark ? "text-slate-400" : "text-slate-500"}`} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className={`border-b px-3 py-2.5 ${isDark ? "border-white/10" : "border-slate-200/80"}`}>
            <div className="relative">
              <Search size={14} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-lg border py-2 pl-8 pr-3 text-xs outline-none transition-colors ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                }`}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {tree.length === 0 ? (
              <div className={`py-8 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files found.</div>
            ) : (
              <div className="space-y-0.5">
                {tree.map((node) => (
                  <FileTreeNode key={node.path} node={node} selectedFileId={selectedFileId} onSelect={onSelect} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
