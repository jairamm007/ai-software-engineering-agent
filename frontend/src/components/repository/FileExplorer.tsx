import { useMemo, useState } from "react";

import type { RepositoryFile } from "@/types/repository";

import { buildFileTree } from "@/utils/buildFileTree";

import FileTreeNode from "./tree/FileTreeNode";

interface Props {
  files: RepositoryFile[];
  selectedFileId?: string;
  onSelect: (file: RepositoryFile) => void;
}

export default function FileExplorer({
  files,
  selectedFileId,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredFiles = useMemo(() => {
    if (!search.trim()) {
      return files;
    }

    return files.filter((file) =>
      file.path.toLowerCase().includes(search.toLowerCase())
    );
  }, [files, search]);

  const tree = buildFileTree(filteredFiles);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">
          📁 Repository Files
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="border-b p-3">
        <input
          type="text"
          placeholder="🔍 Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="max-h-[650px] overflow-y-auto p-3">
        {tree.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            No files found.
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                selectedFileId={selectedFileId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
