import { useState } from "react";
import type { RepositoryFile } from "@/types/repository";
import type { FileTreeNode as TreeNode } from "@/utils/buildFileTree";
import { useTheme } from "@/context/ThemeContext";
import { getFileTypeInfo, formatFileSize } from "@/utils/fileIcons";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";

interface Props {
  node: TreeNode;
  selectedFileId?: string;
  onSelect: (file: RepositoryFile) => void;
}

export default function FileTreeNode({ node, selectedFileId, onSelect }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expanded, setExpanded] = useState(true);

  if (node.isFolder) {
    return (
      <div className="ml-1">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors ${
            isDark ? "text-slate-400 hover:bg-white/5 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          <ChevronRight size={12} className={`shrink-0 transition-transform ${expanded ? "rotate-90" : ""} opacity-50`} />
          {expanded ? (
            <FolderOpen size={14} className="shrink-0 text-amber-400" />
          ) : (
            <Folder size={14} className="shrink-0 text-amber-400" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {expanded && (
          <div className={`ml-2.5 border-l ${isDark ? "border-white/10" : "border-slate-200"}`}>
            <div className="pl-2">
              {node.children.map((child) => (
                <FileTreeNode key={child.path} node={child} selectedFileId={selectedFileId} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const ext = node.name.split(".").pop()?.toLowerCase() ?? "";
  const typeInfo = getFileTypeInfo(ext);
  const isSelected = selectedFileId === node.file?.id;
  const Icon = typeInfo.icon;

  return (
    <button
      type="button"
      onClick={() => node.file && onSelect(node.file)}
      className={`group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-all ${
        isSelected
          ? isDark
            ? "bg-violet-500/15 text-white shadow-sm ring-1 ring-violet-500/20"
            : "bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-200"
          : isDark
            ? "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
        isSelected ? (isDark ? "bg-violet-500/20" : "bg-violet-100") : typeInfo.bg
      }`}>
        <Icon size={11} className={isSelected ? "text-violet-500" : typeInfo.color} />
      </div>
      <span className="truncate">{node.name}</span>
      {node.file && (
        <span className={`ml-auto shrink-0 text-[10px] opacity-0 transition-opacity group-hover:opacity-100 ${
          isDark ? "text-slate-600" : "text-slate-400"
        }`}>
          {formatFileSize(node.file.size)}
        </span>
      )}
    </button>
  );
}
