import type { RepositoryFile } from "@/types/repository";

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
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Repository Files
      </h2>

      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id}>
            <button
              type="button"
              onClick={() => onSelect(file)}
              className={`block w-full rounded-md px-3 py-2 text-left ${
                selectedFileId === file.id
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-slate-100"
              }`}
            >
                {file.path
                  .replace(/\\/g, "/")
                  .split("/")
                  .pop()}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}