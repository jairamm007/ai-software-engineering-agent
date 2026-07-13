import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  content: string;
}

export default function MarkdownMessage({ content }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className={`mb-3 last:mb-0 text-sm leading-7 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className={`mb-3 list-disc space-y-1 pl-5 text-sm leading-7 last:mb-0 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className={`mb-3 list-decimal space-y-1 pl-5 text-sm leading-7 last:mb-0 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
            {children}
          </ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => (
          <h1 className={`mb-3 text-2xl font-semibold tracking-tight last:mb-0 ${isDark ? "text-white" : "text-slate-900"}`}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={`mb-3 text-xl font-semibold tracking-tight last:mb-0 ${isDark ? "text-white" : "text-slate-900"}`}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={`mb-3 text-lg font-semibold tracking-tight last:mb-0 ${isDark ? "text-white" : "text-slate-900"}`}>
            {children}
          </h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className={`mb-3 border-l-4 pl-4 text-sm italic last:mb-0 ${isDark ? "border-slate-600 text-slate-400" : "border-slate-200 text-slate-500"}`}>
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="mb-3 overflow-x-auto last:mb-0">
            <table className={`w-full border-collapse text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className={`border px-3 py-2 text-left font-semibold ${isDark ? "border-slate-600 bg-white/5 text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className={`border px-3 py-2 align-top ${isDark ? "border-slate-600" : "border-slate-200"}`}>
            {children}
          </td>
        ),
        code: ({ className, children }: any) => {
          const match = /language-(\w+)/.exec(className ?? "");
          const isBlock = Boolean(match);

          if (!isBlock) {
            return (
              <code className={`rounded px-1.5 py-0.5 font-mono text-[0.875em] ${isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-900"}`}>
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter
              language={match?.[1] ?? "tsx"}
              style={isDark ? oneDark : oneLight}
              customStyle={{
                margin: "0 0 0.75rem 0",
                borderRadius: "0.875rem",
                padding: "1rem",
                background: isDark ? "#1a1a2e" : "#f8fafc",
              }}
              codeTagProps={{
                style: {
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
                  fontSize: "0.875rem",
                },
              }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
