import { useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import CodeBlock from "@/components/ui/CodeBlock";

interface Props {
  content: string;
}

function MarkdownComponents({ isDark }: { isDark: boolean }) {
  return useMemo<Components>(() => ({
    p: ({ children }) => (
      <p className={`mb-3 last:mb-0 text-sm leading-7 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className={`mb-3 list-disc space-y-1.5 pl-5 text-sm leading-7 last:mb-0 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className={`mb-3 list-decimal space-y-1.5 pl-5 text-sm leading-7 last:mb-0 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    h1: ({ children }) => (
      <h1 className={`mb-4 mt-6 text-2xl font-bold tracking-tight first:mt-0 last:mb-0 ${isDark ? "text-white" : "text-slate-900"}`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`mb-3 mt-5 text-xl font-bold tracking-tight first:mt-0 last:mb-0 ${isDark ? "text-white" : "text-slate-900"}`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`mb-3 mt-4 text-lg font-semibold tracking-tight first:mt-0 last:mb-0 ${isDark ? "text-white" : "text-slate-900"}`}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`mb-2 mt-3 text-base font-semibold tracking-tight first:mt-0 last:mb-0 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`mb-3 border-l-4 pl-4 text-sm italic last:mb-0 ${isDark ? "border-slate-600 text-slate-400" : "border-slate-300 text-slate-500"}`}>
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className={`my-6 border-t ${isDark ? "border-white/10" : "border-slate-200"}`} />
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 font-medium underline-offset-2 transition-colors hover:underline ${
          isDark
            ? "text-violet-400 hover:text-violet-300"
            : "text-violet-600 hover:text-violet-700"
        }`}
      >
        {children}
        <ExternalLink size={11} className="opacity-50" />
      </a>
    ),
    strong: ({ children }) => (
      <strong className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic">{children}</em>
    ),
    del: ({ children }) => (
      <del className={`line-through ${isDark ? "text-slate-500" : "text-slate-400"}`}>
        {children}
      </del>
    ),
    table: ({ children }) => (
      <div className="mb-3 overflow-x-auto last:mb-0 rounded-lg border">
        <table className={`w-full border-collapse text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className={isDark ? "bg-white/5" : "bg-slate-50"}>
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className={`border-b px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider ${
        isDark ? "border-slate-600 text-slate-400" : "border-slate-200 text-slate-500"
      }`}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className={`border-b px-3 py-2 align-top last:border-b-0 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        {children}
      </td>
    ),
    input: ({ checked, ...rest }) => (
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className={`mr-2 h-3.5 w-3.5 rounded accent-[var(--accent)]`}
        {...rest}
      />
    ),
    code: ({ className, children }) => {
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
  }), [isDark]);
}

export default function MarkdownMessage({ content }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const components = MarkdownComponents({ isDark });

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
