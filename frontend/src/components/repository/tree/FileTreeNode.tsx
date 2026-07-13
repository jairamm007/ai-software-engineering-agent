import { useState } from "react";
import type { RepositoryFile } from "@/types/repository";
import type { FileTreeNode as TreeNode } from "@/utils/buildFileTree";
import { useTheme } from "@/context/ThemeContext";

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
      <div className="ml-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left ${
            isDark ? "hover:bg-white/10" : "hover:bg-slate-100"
          }`}
        >
          <span>{expanded ? "📂" : "📁"}</span>
          <span className={isDark ? "text-slate-200" : "text-slate-700"}>{node.name}</span>
        </button>

        {expanded && (
          <div className={`ml-4 border-l pl-2 ${isDark ? "border-white/10" : "border-slate-200"}`}>
            {node.children.map((child) => (
              <FileTreeNode key={child.path} node={child} selectedFileId={selectedFileId} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => node.file && onSelect(node.file)}
      className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left ${
        selectedFileId === node.file?.id
          ? isDark
            ? "bg-violet-500/20 text-violet-300"
            : "bg-violet-100 text-violet-700"
          : isDark
            ? "text-slate-300 hover:bg-white/10"
            : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <span>📄</span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}
