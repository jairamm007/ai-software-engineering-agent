import { useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import BackButton from "@/components/common/BackButton";
import { askRepository } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";
import type { ChatMessage } from "@/types/chat";

const suggestedQuestions = [
  "Explain the overall architecture of this repository",
  "What are the main entry points and how do they connect?",
  "Are there any potential security issues in the code?",
  "Summarize the key modules and their responsibilities",
  "What dependencies does this project use and why?",
  "Generate documentation for the main functions",
];

export default function RepositoryChatPage() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const answer = await askRepository({ question, repositoryId: id });
      const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: answer.answer ?? JSON.stringify(answer) };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Sorry, I couldn't process your request. Make sure the backend server is running and try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); void send(input); };
  const handleSuggestion = (question: string) => { void send(question); };

  return (
    <DashboardLayout>
      <BackButton fallback="/dashboard" />

      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          AI Repository Chat
        </h1>
        <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Ask questions about this repository and get AI-powered answers
        </p>
      </div>

      <div className={`mb-4 flex h-[500px] flex-col overflow-hidden rounded-xl border shadow-sm ${
        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}>
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
              </svg>
            </div>
            <h3 className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              What would you like to know?
            </h3>
            <p className={`mb-8 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Ask anything about the code, architecture, dependencies, or logic
            </p>
            <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleSuggestion(question)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((message) => (
              <div key={message.id} className={`mb-5 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-3xl gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    message.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
                  }`}>
                    {message.role === "user" ? "U" : "AI"}
                  </div>
                  <div className={`rounded-2xl px-5 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : isDark
                        ? "border border-white/10 bg-white/5 text-slate-200"
                        : "border border-slate-200 bg-slate-50 text-slate-800"
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="mb-5 flex justify-start">
                <div className="flex max-w-3xl gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white">
                    AI
                  </div>
                  <div className={`rounded-2xl border px-5 py-4 ${
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                  }`}>
                    <div className="flex gap-1.5">
                      <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:0ms] ${isDark ? "bg-slate-500" : "bg-slate-400"}`} />
                      <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:150ms] ${isDark ? "bg-slate-500" : "bg-slate-400"}`} />
                      <span className={`h-2 w-2 animate-bounce rounded-full [animation-delay:300ms] ${isDark ? "bg-slate-500" : "bg-slate-400"}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={`flex items-center gap-3 rounded-xl border p-3 shadow-sm ${
        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
      }`}>
        <input
          type="text"
          value={input}
          disabled={loading}
          placeholder="Ask about this repository..."
          onChange={(e) => setInput(e.target.value)}
          className={`flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50 ${
            isDark ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
          }`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Thinking...
            </span>
          ) : "Send"}
        </button>
      </form>
    </DashboardLayout>
  );
}
