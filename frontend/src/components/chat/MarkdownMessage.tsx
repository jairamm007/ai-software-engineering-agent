import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  content: string;
}

export default function MarkdownMessage({
  content,
}: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-3 last:mb-0 text-sm leading-7 text-slate-700">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-5 text-sm leading-7 text-slate-700 last:mb-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm leading-7 text-slate-700 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => (
          <h1 className="mb-3 text-2xl font-semibold tracking-tight text-slate-900 last:mb-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 text-xl font-semibold tracking-tight text-slate-900 last:mb-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-3 text-lg font-semibold tracking-tight text-slate-900 last:mb-0">
            {children}
          </h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mb-3 border-l-4 border-slate-200 pl-4 text-sm italic text-slate-500 last:mb-0">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="mb-3 overflow-x-auto last:mb-0">
            <table className="w-full border-collapse text-sm text-slate-700">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-900">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-slate-200 px-3 py-2 align-top">
            {children}
          </td>
        ),
        code: ({ className, children }: any) => {
          const match = /language-(\w+)/.exec(className ?? "");
          const isBlock = Boolean(match);

          if (!isBlock) {
            return (
              <code
                className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.875em] text-slate-900"
              >
                {children}
              </code>
            );
          }

          return (
            <SyntaxHighlighter
              language={match?.[1] ?? "tsx"}
              style={oneLight}
              customStyle={{
                margin: "0 0 0.75rem 0",
                borderRadius: "0.875rem",
                padding: "1rem",
                background: "#f8fafc",
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
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