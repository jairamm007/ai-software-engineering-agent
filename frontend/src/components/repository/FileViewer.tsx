import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  filePath?: string;
  content?: string;
  onSelectionChange?: (selection: string) => void;
}

export default function FileViewer({ filePath, content, onSelectionChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const displayName = filePath?.replace(/\\/g, "/").split("/").pop();

  const language = (() => {
    const ext = filePath?.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts": return "typescript";
      case "tsx": return "tsx";
      case "js": return "javascript";
      case "jsx": return "jsx";
      case "json": return "json";
      case "css": return "css";
      case "html": return "html";
      case "md": return "markdown";
      case "c": return "c";
      case "cpp": return "cpp";
      case "java": return "java";
      case "py": return "python";
      default: return "text";
    }
  })();

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 ${
      isDark ? "bg-slate-900" : "bg-white"
    }`}>
      <div className={`flex items-center justify-between border-b p-3 ${
        isDark ? "border-slate-700" : "border-slate-200"
      }`}>
        <div>
          <h2 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            📄 {displayName ?? "Select a file"}
          </h2>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{language.toUpperCase()}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto" onMouseUp={() => onSelectionChange?.(window.getSelection()?.toString().trim() ?? "")}>
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          showLineNumbers
          wrapLongLines
          customStyle={{
            height: "100%",
            minHeight: "100%",
            maxHeight: "none",
            borderRadius: 0,
            margin: 0,
            fontSize: "14px",
            background: isDark ? "#0f172a" : "#ffffff",
          }}
        >
          {content ?? "Select a file from the left panel."}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
