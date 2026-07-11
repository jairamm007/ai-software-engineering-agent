import { useState } from "react";
import type { RepositoryFile } from "@/types/repository";
import type { FileTreeNode as TreeNode } from "@/utils/buildFileTree";

interface Props {
  node: TreeNode;
  selectedFileId?: string;
  onSelect: (file: RepositoryFile) => void;
}

export default function FileTreeNode({
  node,
  selectedFileId,
  onSelect,
}: Props) {
  const [expanded, setExpanded] = useState(true);

  if (node.isFolder) {
    return (
      <div className="ml-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-slate-100"
        >
          <span>{expanded ? "📂" : "📁"}</span>
          <span>{node.name}</span>
        </button>

        {expanded && (
          <div className="ml-4 border-l border-slate-200 pl-2">
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                selectedFileId={selectedFileId}
                onSelect={onSelect}
              />
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
          ? "bg-blue-100 text-blue-700"
          : "hover:bg-slate-100"
      }`}
    >
      <span>📄</span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}