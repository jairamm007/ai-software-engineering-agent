import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import {
  oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  filePath?: string;
  content?: string;
  onSelectionChange?: (selection: string) => void;
}

export default function FileViewer({
  filePath,
  content,
  onSelectionChange,
}: Props) {
  const displayName = filePath
    ?.replace(/\\/g, "/")
    .split("/")
    .pop();

  const language = (() => {
    const ext = filePath?.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "ts":
        return "typescript";

      case "tsx":
        return "tsx";

      case "js":
        return "javascript";

      case "jsx":
        return "jsx";

      case "json":
        return "json";

      case "css":
        return "css";

      case "html":
        return "html";

      case "md":
        return "markdown";

      case "c":
        return "c";

      case "cpp":
        return "cpp";

      case "java":
        return "java";

      case "py":
        return "python";

      default:
        return "text";
    }
  })();

  return (
    <div className="rounded-xl border bg-white shadow-sm">

      <div className="flex items-center justify-between border-b px-6 py-4">

        <div>

          <h2 className="text-xl font-semibold">
            📄 {displayName ?? "Select a file"}
          </h2>

          <p className="text-sm text-slate-500">
            {language.toUpperCase()}
          </p>

        </div>

      </div>

      <div className="max-h-[650px] overflow-auto" onMouseUp={() => onSelectionChange?.(window.getSelection()?.toString().trim() ?? "")}>

        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          wrapLongLines
          customStyle={{
            maxHeight: "650px",
            borderRadius: "12px",
            margin: 0,
            fontSize: "14px",
          }}
        >
          {content ?? "Select a file from the left panel."}
        </SyntaxHighlighter>

      </div>

    </div>
  );
}
