import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { FolderOpen, File, Folder, ChevronRight, CheckSquare, Square, FileCode2, GitBranch, Database } from "lucide-react";
import { getRepositories, getRepository } from "@/services/repository";
import { buildFileTree, type FileTreeNode } from "@/utils/buildFileTree";
import CustomSelect from "@/components/ui/CustomSelect";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface Props {
  onSelectionChange: (data: { repositoryId: string; filePaths: string[]; selectionLabel: string }) => void;
  selectedRepositoryId?: string;
}

type SelMode = "none" | "all" | "some";

export default function RepoFilePicker({ onSelectionChange, selectedRepositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [repoId, setRepoId] = useState(selectedRepositoryId || "");
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [checkedFiles, setCheckedFiles] = useState<Set<string>>(new Set());

  const { data: repos } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
  });

  const { data: repoDetail, isLoading: repoLoading } = useQuery({
    queryKey: ["repository", repoId],
    queryFn: () => getRepository(repoId),
    enabled: !!repoId,
  });

  const treeNodes: FileTreeNode[] = repoDetail ? buildFileTree(repoDetail.files) : [];

  const toggleDir = (dirPath: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(dirPath)) next.delete(dirPath);
      else next.add(dirPath);
      return next;
    });
  };

  // collect all file paths under a node
  const collectFilePaths = (nodes: FileTreeNode[]): string[] => {
    const result: string[] = [];
    for (const n of nodes) {
      if (!n.isFolder) {
        result.push(n.path);
      } else {
        result.push(...collectFilePaths(n.children));
      }
    }
    return result;
  };

  const selectionMode: SelMode = !repoDetail || checkedFiles.size === 0
    ? "none"
    : checkedFiles.size === collectFilePaths(treeNodes).length && treeNodes.length > 0
      ? "all"
      : "some";

  const handleSelectAll = () => {
    if (!repoDetail) return;
    if (selectionMode === "all") {
      setCheckedFiles(new Set());
      onSelectionChange({ repositoryId: repoId, filePaths: [], selectionLabel: "No files selected" });
    } else {
      const all = new Set(collectFilePaths(treeNodes));
      setCheckedFiles(all);
      onSelectionChange({ repositoryId: repoId, filePaths: [...all], selectionLabel: `All files (${all.size})` });
    }
  };

  const handleFileCheck = (filePath: string) => {
    setCheckedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) next.delete(filePath);
      else next.add(filePath);
      const arr = [...next];
      const label = arr.length === 1 ? filePath : `${arr.length} files selected`;
      onSelectionChange({ repositoryId: repoId, filePaths: arr, selectionLabel: label });
      return next;
    });
  };

  const handleRepoChange = useCallback((val: string) => {
    setRepoId(val);
    setCheckedFiles(new Set());
    setExpandedDirs(new Set());
    onSelectionChange({ repositoryId: val, filePaths: [], selectionLabel: "" });
  }, [onSelectionChange]);

  const renderTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map((node) => {
      if (node.isFolder) {
        const isExpanded = expandedDirs.has(node.path);
        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleDir(node.path)}
              className={`group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-all ${
                isDark
                  ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <ChevronRight size={12} className={`shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""} opacity-50`} />
              {isExpanded
                ? <FolderOpen size={14} className="shrink-0 text-amber-400" />
                : <Folder size={14} className="shrink-0 text-amber-400" />
              }
              <span className="truncate">{node.name}</span>
              <span className={`ml-auto text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                {collectFilePaths(node.children).length}
              </span>
            </button>
            {isExpanded && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      }

      const isChecked = checkedFiles.has(node.path);
      const ext = node.file?.extension?.replace(".", "").toLowerCase() || "unknown";
      const fileColorMap: Record<string, string> = {
        ts: "text-blue-400", tsx: "text-blue-400", js: "text-yellow-400", jsx: "text-yellow-400",
        py: "text-blue-300", go: "text-cyan-400", rs: "text-orange-400",
        java: "text-orange-400", json: "text-green-400", css: "text-pink-400", html: "text-orange-300",
        md: "text-slate-400", yaml: "text-red-300", yml: "text-red-300",
      };
      const fileColor = fileColorMap[ext] || (isDark ? "text-slate-500" : "text-slate-400");

      return (
        <div
          key={node.path}
          className={`group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-all ${
            isChecked
              ? isDark
                ? "bg-[var(--accent)]/10 text-white"
                : "accent-bg-light accent-text-base"
              : isDark
                ? "text-slate-400 hover:bg-white/5"
                : "text-slate-600 hover:bg-slate-50"
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          <button
            type="button"
            onClick={() => handleFileCheck(node.path)}
            className="shrink-0 cursor-pointer"
          >
            {isChecked
              ? <CheckSquare size={14} className="accent-text-base" />
              : <Square size={14} className={isDark ? "text-slate-600" : "text-slate-300"} />
            }
          </button>
          <File size={13} className={`shrink-0 ${isChecked ? "accent-text-base" : fileColor}`} />
          <span className="truncate">{node.name}</span>
          {node.file?.size && node.file.size > 0 && (
            <span className={`ml-auto shrink-0 text-[10px] opacity-0 transition-opacity group-hover:opacity-100 ${
              isDark ? "text-slate-600" : "text-slate-400"
            }`}>
              {node.file.size < 1024 ? `${node.file.size}B` : `${(node.file.size / 1024).toFixed(1)}KB`}
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <CustomSelect
            value={repoId}
            onChange={handleRepoChange}
            options={[
              { value: "", label: "Select a repository..." },
              ...(repos?.map((r) => ({ value: r.id, label: r.name })) ?? []),
            ]}
            placeholder="Select a repository..."
            ariaLabel="Repository selection"
          />
        </div>
      </div>

      {repoLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingIndicator size="md" />
        </div>
      )}

      {repoDetail && !repoLoading && (
        <div className="space-y-3 animate-fadeIn">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-lg border p-2.5 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white/50"}`}>
              <FileCode2 size={14} className="mx-auto mb-1 accent-text-base" />
              <p className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>{repoDetail.files.length}</p>
              <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Files</p>
            </div>
            <div className={`rounded-lg border p-2.5 text-center ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white/50"}`}>
              <Database size={14} className="mx-auto mb-1 accent-text-base" />
              <p className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                {repoDetail.files.reduce((s, f) => s + f.chunks.length, 0)}
              </p>
              <p className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Chunks</p>
            </div>
          </div>

          {/* Select All toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                selectionMode === "all"
                  ? isDark
                    ? "bg-[var(--accent)]/15 accent-text-base ring-1 ring-[var(--accent)]/20"
                    : "accent-bg-light accent-text-base ring-1 ring-[var(--accent)]/30"
                  : isDark
                    ? "text-slate-400 hover:bg-white/5"
                    : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {selectionMode === "all" ? <CheckSquare size={13} /> : <Square size={13} />}
              {selectionMode === "all" ? "Deselect All" : "Select All"}
            </button>
            {checkedFiles.size > 0 && (
              <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {checkedFiles.size} file{checkedFiles.size !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>

          {/* File tree */}
          <div className={`max-h-64 overflow-y-auto rounded-xl border p-2 ${
            isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white/30"
          }`}>
            {treeNodes.length === 0 ? (
              <p className={`py-8 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files in this repository</p>
            ) : (
              renderTree(treeNodes)
            )}
          </div>

          {checkedFiles.size > 0 && (
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${
              isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700"
            }`}>
              <CheckSquare size={13} />
              {checkedFiles.size === 1
                ? <span>Selected: <code className="font-mono font-medium">{[...checkedFiles][0]}</code></span>
                : <span>{checkedFiles.size} files selected</span>
              }
            </div>
          )}
        </div>
      )}

      {!repoId && !repoLoading && (
        <div className={`flex flex-col items-center justify-center py-8 text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          <GitBranch size={28} className="mb-2 opacity-30" />
          <p className="text-xs font-[Inter]">Select a repository to browse its files</p>
        </div>
      )}
    </div>
  );
}
