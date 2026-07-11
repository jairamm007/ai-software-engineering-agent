import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { AIMessage } from "@/types/ai-conversation";

interface Props {
  messages: AIMessage[];
}

export default function ConversationHistory({ messages }: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">🤖 AI Conversation</h2>
      </div>

      <div className="max-h-[500px] space-y-4 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500">
            <p className="text-lg font-medium">🤖 AI Assistant</p>
            <p className="mt-3">
              Select a file and click one of the AI actions.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl p-4 ${
                message.role === "user"
                  ? "bg-blue-50"
                  : "bg-slate-50"
              }`}
            >
              <p className="mb-2 font-semibold">
                {message.role === "user" ? "👤 You" : "🤖 AI Assistant"}
              </p>

              {message.role === "assistant" ? (
                <article className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </article>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
