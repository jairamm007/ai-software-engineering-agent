import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface Props {
  filePath?: string;
  content?: string;
  onSelectionChange?: (selection: string) => void;
}

export default function FileViewer({ filePath, content, onSelectionChange }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayName = filePath?.replace(/\\/g, "/").split("/").pop();
  const code = content ?? "";

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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 ${
      isDark ? "bg-slate-900" : "bg-white"
    }`}>
      <div className={`flex items-center justify-between border-b p-3 ${
        isDark ? "border-slate-700" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded p-0.5 transition-colors ${
              isDark ? "text-slate-400 hover:bg-white/10 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
            title={collapsed ? "Expand code" : "Collapse code"}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {displayName ?? "Select a file"}
            </h2>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{language.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {code && (
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? "bg-emerald-500/15 text-emerald-500"
                  : isDark
                    ? "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
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
            {code || "Select a file from the left panel."}
          </SyntaxHighlighter>
        </div>
      )}

      {collapsed && (
        <div className={`flex items-center justify-center py-6 text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {code ? `${code.split("\n").length} lines hidden` : "No file selected"}
        </div>
      )}
    </div>
  );
}
