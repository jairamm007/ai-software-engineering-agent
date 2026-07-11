interface Props {
  filePath?: string;
  content?: string;
}

export default function FileViewer({
  filePath,
  content,
}: Props) {
  const displayName = filePath
    ?.replace(/\\/g, "/")
    .split("/")
    .pop();

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        {displayName ?? "Select a file"}
      </h2>

      <pre className="max-h-[600px] overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
        <code>
          {content ??
            "Select a file from the left panel."}
        </code>
      </pre>
    </div>
  );
}