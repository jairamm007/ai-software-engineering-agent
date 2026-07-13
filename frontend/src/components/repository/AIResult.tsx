import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  title: string;
  content: string;
  source?: {
    filePath: string;
    startLine: number;
    endLine: number;
    confidence: number;
  } | null;
}

export default function AIResult({ title, content, source }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-output.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`rounded-2xl border shadow-sm ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <div className={`flex items-center justify-between border-b p-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>🤖 {title}</h2>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
              isDark ? "border-white/20 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"
            }`}
          >
            📋 Copy
          </button>
          <button
            onClick={downloadMarkdown}
            className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
              isDark ? "border-white/20 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"
            }`}
          >
            ⬇ Download
          </button>
        </div>
      </div>

      <div className={content ? "max-h-[500px] overflow-y-auto p-6" : "flex h-28 items-center justify-center p-4"}>
        {content ? (
          <>
            {source && (
              <div className={`mb-5 rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                <div className={`space-y-2 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <p><strong>📄 Source:</strong> {source.filePath}</p>
                  <p><strong>📍 Lines:</strong> {source.startLine}–{source.endLine}</p>
                  <p><strong>🧠 Confidence:</strong> {source.confidence}%</p>
                </div>
              </div>
            )}
            <article className={`prose max-w-none ${isDark ? "prose-invert" : ""}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          </>
        ) : (
          <div className={`text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <p className="text-lg font-medium">🤖 AI Assistant</p>
            <p className="mt-1 text-sm">Select a file and click one of the AI actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
