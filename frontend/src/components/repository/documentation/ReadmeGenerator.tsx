import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/ui/CodeBlock";
import { generateReadme } from "@/services/documentationGenerator";
import { Copy, Check, FileText, FileType } from "lucide-react";
import { jsPDF } from "jspdf";

interface Props {
  repositoryId: string;
}

export default function ReadmeGenerator({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [copied, setCopied] = useState(false);

  const query = useQuery({
    queryKey: ["readme-gen", repositoryId],
    queryFn: () => generateReadme(repositoryId),
  });

  const data = query.data;

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.rawMarkdown);
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

  const downloadMD = () => {
    if (!data) return;
    downloadBlob(new Blob([data.rawMarkdown], { type: "text/markdown" }), "README.md");
  };

  const downloadPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFont("Courier", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(data.rawMarkdown, 180);
    let y = 15;
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 15; }
      doc.text(line, 15, y);
      y += 4;
    }
    doc.save("README.pdf");
  };

  if (query.isLoading) return <div className={`h-[400px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (query.isError || !data) return <p className="text-red-500">Failed to generate README.</p>;

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <span className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>README.md</span>
        {data.badges.length > 0 && (
          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{data.badges.length} badges</span>
        )}
        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{data.sections.length} sections</span>
        <div className="flex gap-2 ml-auto">
          <button onClick={handleCopy} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${copied ? "bg-emerald-500/15 text-emerald-500" : isDark ? "border border-white/20 hover:bg-white/10" : "border border-slate-200 hover:bg-slate-50"}`}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={downloadMD} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${isDark ? "border-white/20 hover:bg-white/10" : "border-slate-200 hover:bg-slate-50"}`}>
            <FileText size={14} /> Markdown
          </button>
          <button onClick={downloadPDF} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${isDark ? "border-white/20 hover:bg-white/10" : "border-slate-200 hover:bg-slate-50"}`}>
            <FileType size={14} /> PDF
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <article className={`prose max-w-none ${isDark ? "prose-invert" : ""}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ className, children }: any) => {
                const match = /language-(\w+)/.exec(className ?? "");
                if (match) return <CodeBlock language={match[1]}>{String(children).replace(/\n$/, "")}</CodeBlock>;
                return <code className={`rounded px-1.5 py-0.5 font-mono text-[0.875em] ${isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-900"}`}>{children}</code>;
              },
            }}
          >
            {data.rawMarkdown}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
