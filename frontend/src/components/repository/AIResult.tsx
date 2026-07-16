import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/context/ThemeContext";
import CodeBlock from "@/components/ui/CodeBlock";
import { ChevronDown, Copy, Check, Download, FileText, FileType, FileImage, Bot } from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

interface Props {
  title: string;
  content: string;
  loading?: boolean;
  source?: {
    filePath: string;
    startLine: number;
    endLine: number;
    confidence: number;
  } | null;
}

export default function AIResult({ title, content, loading = false, source }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    downloadBlob(new Blob([content], { type: "text/plain" }), "ai-output.txt");
    setMenuOpen(false);
  };

  const downloadMarkdown = () => {
    downloadBlob(new Blob([content], { type: "text/markdown" }), "ai-output.md");
    setMenuOpen(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFont("Courier", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(content, 180);
    let y = 15;
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 15; }
      doc.text(line, 15, y);
      y += 4;
    }
    doc.save("ai-output.pdf");
    setMenuOpen(false);
  };

  const downloadDOCX = async () => {
    const paragraphs = content.split("\n").map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, font: "Courier New", size: 20 })],
        })
    );
    const doc = new Document({ sections: [{ children: paragraphs }] });
    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, "ai-output.docx");
    setMenuOpen(false);
  };

  return (
    <div className={`rounded-2xl border shadow-sm ${isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"}`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={`flex w-full items-center justify-between border-b p-4 text-left transition-colors ${
          isDark ? "border-white/10 hover:bg-white/[0.02]" : "border-slate-200 hover:bg-slate-50/80"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${collapsed ? "" : "rotate-180"}`}>
            <ChevronDown size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />
          </div>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h2>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isDark
                    ? "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <Download size={13} />
                Download
              </button>

              {menuOpen && (
                <div className={`absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border shadow-xl ${
                  isDark ? "border-white/10 bg-[#1a1a2e]" : "border-slate-200 bg-white"
                }`}>
                  <button type="button" onClick={downloadMarkdown} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}>
                    <FileText size={13} className="text-slate-400" />
                    Markdown (.md)
                  </button>
                  <button type="button" onClick={downloadTXT} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}>
                    <FileText size={13} className="text-blue-500" />
                    Plain Text (.txt)
                  </button>
                  <button type="button" onClick={downloadPDF} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}>
                    <FileType size={13} className="text-red-500" />
                    PDF (.pdf)
                  </button>
                  <button type="button" onClick={() => void downloadDOCX()} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors ${isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"}`}>
                    <FileImage size={13} className="text-[var(--accent)]" />
                    Word (.docx)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </button>

      {!collapsed && (
        <div className={content ? "max-h-[600px] overflow-y-auto p-6" : "flex min-h-[180px] items-center justify-center p-4"}>
          {loading && !content ? (
            <div className="flex w-full flex-col items-center gap-4 py-4">
              {/* Animated AI icon */}
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/20">
                  <Bot size={22} className={isDark ? "text-[var(--accent)]" : "text-[var(--accent)]"} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[var(--accent)]" />
                </span>
              </div>

              {/* Typing dots */}
              <div className="flex items-center gap-1.5">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className={`h-2 w-2 animate-bounce rounded-full ${isDark ? "bg-[var(--accent)]" : "bg-[var(--accent)]"}`}
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>

              <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                AI is generating...
              </p>

              {/* Skeleton lines */}
              <div className="w-full max-w-md space-y-2.5">
                {[100, 85, 70, 90, 60].map((w, i) => (
                  <div
                    key={i}
                    className={`h-2.5 rounded-full animate-pulse ${isDark ? "bg-white/[0.06]" : "bg-slate-200"}`}
                    style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : content ? (
            <>
              {source && (
                <div className={`mb-5 rounded-lg border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                  <div className={`space-y-2 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <p><strong>Source:</strong> {source.filePath}</p>
                    <p><strong>Lines:</strong> {source.startLine}–{source.endLine}</p>
                    <p><strong>Confidence:</strong> {source.confidence}%</p>
                  </div>
                </div>
              )}
              <article className={`prose max-w-none ${isDark ? "prose-invert" : ""}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ className, children }: any) => {
                      const match = /language-(\w+)/.exec(className ?? "");
                      if (match) {
                        return <CodeBlock language={match[1]}>{String(children).replace(/\n$/, "")}</CodeBlock>;
                      }
                      return (
                        <code className={`rounded px-1.5 py-0.5 font-mono text-[0.875em] ${isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-900"}`}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
              {/* Streaming cursor */}
              {loading && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-[var(--accent)] ml-0.5 align-middle" />
              )}
            </>
          ) : (
            <div className={`text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <p className="text-lg font-medium">AI Assistant</p>
              <p className="mt-1 text-sm">Select a file and click one of the AI actions.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
