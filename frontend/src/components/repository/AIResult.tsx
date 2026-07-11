import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default function AIResult({
  title,
  content,
  source,
}: Props) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([content], {
      type: "text/markdown",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "ai-output.md";

    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="flex items-center justify-between border-b p-4">

        <h2 className="text-xl font-bold">
          🤖 {title}
        </h2>

        <div className="flex gap-2">

          <button
            onClick={copyToClipboard}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-100"
          >
            📋 Copy
          </button>

          <button
            onClick={downloadMarkdown}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-slate-100"
          >
            ⬇ Download
          </button>

        </div>

      </div>

      <div className="max-h-[500px] overflow-y-auto p-6">

        {content ? (

          <>
            {source && (
              <div className="mb-5 rounded-lg border bg-slate-50 p-4">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>📄 Source:</strong>{" "}
                    {source.filePath}
                  </p>

                  <p>
                    <strong>📍 Lines:</strong>{" "}
                    {source.startLine}–{source.endLine}
                  </p>

                  <p>
                    <strong>🧠 Confidence:</strong>{" "}
                    {source.confidence}%
                  </p>
                </div>
              </div>
            )}

            <article className="prose max-w-none">

              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>

            </article>
          </>

        ) : (

          <div className="text-center text-slate-500">

            <p className="text-lg font-medium">
              🤖 AI Assistant
            </p>

            <p className="mt-3">
              Select a file and click one of the AI actions.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}
