import { useMemo, useState } from "react";
import type { RepositoryFile } from "@/types/repository";
import { buildFileTree } from "@/utils/buildFileTree";
import FileTreeNode from "./tree/FileTreeNode";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  files: RepositoryFile[];
  selectedFileId?: string;
  onSelect: (file: RepositoryFile) => void;
}

export default function FileExplorer({ files, selectedFileId, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    return files.filter((file) => file.path.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  const tree = buildFileTree(filteredFiles);

  return (
    <aside className={`flex max-h-[calc(100vh-14rem)] min-h-0 flex-col overflow-hidden rounded-xl border shadow-sm ${
      isDark ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-white text-slate-800"
    }`}>
      <div className={`border-b px-4 py-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <h2 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>📁 Repository Files</h2>
        <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {files.length} file{files.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className={`border-b p-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <input
          type="text"
          placeholder="🔍 Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${
            isDark
              ? "border-white/20 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-500"
              : "border-slate-300 placeholder:text-slate-400 focus:border-blue-500"
          }`}
        />
      </div>

      <div className="min-h-0 overflow-y-auto p-3">
        {tree.length === 0 ? (
          <div className={`py-8 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>No files found.</div>
        ) : (
          <div className="space-y-1">
            {tree.map((node) => (
              <FileTreeNode key={node.path} node={node} selectedFileId={selectedFileId} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
