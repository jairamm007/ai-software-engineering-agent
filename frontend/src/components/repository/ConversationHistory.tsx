import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AIMessage } from "@/types/ai-conversation";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  messages: AIMessage[];
}

export default function ConversationHistory({ messages }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`rounded-2xl border shadow-sm ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
      <div className={`border-b p-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
        <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>🤖 AI Conversation</h2>
      </div>

      <div className="max-h-[500px] space-y-4 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className={`text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <p className="text-lg font-medium">🤖 AI Assistant</p>
            <p className="mt-3">Select a file and click one of the AI actions.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl p-4 ${
                message.role === "user"
                  ? isDark ? "bg-blue-500/10" : "bg-blue-50"
                  : isDark ? "bg-white/5" : "bg-slate-50"
              }`}
            >
              <p className={`mb-2 font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                {message.role === "user" ? "👤 You" : "🤖 AI Assistant"}
              </p>

              {message.role === "assistant" ? (
                <article className={`prose max-w-none ${isDark ? "prose-invert" : ""}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </article>
              ) : (
                <p className={`whitespace-pre-wrap ${isDark ? "text-slate-200" : "text-slate-700"}`}>{message.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
