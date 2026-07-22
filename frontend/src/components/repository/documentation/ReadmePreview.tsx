import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/context/ThemeContext";
import CodeBlock from "@/components/ui/CodeBlock";
import type { ReadmeResult } from "@/services/documentationGenerator";

interface Props { data: ReadmeResult; }

export default function ReadmePreview({ data }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tableOfContents = useMemo(() =>
    data.sections.map(s => ({ title: s.title, level: s.level })),
    [data]
  );

  return (
    <div className="space-y-6">
      {data.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.badges.map((badge, i) => (
            <span key={i} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              {badge.replace(/!\[.*?\]\(.*?\)/g, "").trim()}
            </span>
          ))}
        </div>
      )}

      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{data.title}</h1>
        {data.description && <p className={`mt-3 text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>{data.description}</p>}
      </div>

      {tableOfContents.length > 1 && (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Table of Contents</h3>
          <div className="space-y-1">
            {tableOfContents.map((item, i) => (
              <a key={i} href={`#section-${i}`} className={`block text-sm hover:underline ${isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`} style={{ paddingLeft: `${(item.level - 2) * 16}px` }}>
                {item.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {data.sections.map((section, i) => (
        <div key={i} id={`section-${i}`} className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
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
              {`## ${section.title}\n\n${section.content}`}
            </ReactMarkdown>
          </article>
        </div>
      ))}
    </div>
  );
}
