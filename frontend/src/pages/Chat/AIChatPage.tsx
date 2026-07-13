import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  FolderGit2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { askRepository } from "@/services/chat";
import { getRepositories } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import type { ChatMessage } from "@/types/chat";
import type { Repository } from "@/types/repository";

const suggestedQuestions = [
  "Explain the overall architecture of this repository",
  "What are the main entry points and how do they connect?",
  "Are there any potential security issues in the code?",
  "Summarize the key modules and their responsibilities",
  "What dependencies does this project use and why?",
  "Generate documentation for the main functions",
];

export default function AIChatPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: repositories = [], isLoading: reposLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const send = async (question: string) => {
    if (!question.trim() || loading || !selectedRepo) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const answer = await askRepository({
        question,
        repositoryId: selectedRepo.id,
      });
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer.answer ?? JSON.stringify(answer),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Sorry, I couldn't process your request. Make sure the backend server is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const handleSuggestion = (question: string) => {
    void send(question);
  };

  const handleSelectRepo = (repo: Repository) => {
    setSelectedRepo(repo);
    setShowDropdown(false);
    setMessages([]);
    setInput("");
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/20">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              AI Chat
            </h1>
            <p
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Ask questions about your repositories and get AI-powered answers
            </p>
          </div>
        </div>
      </div>

      {/* Repository Selector */}
      <div className="mb-6">
        <label
          className={`mb-2 block text-sm font-medium ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          Select Repository
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={reposLoading}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
              isDark
                ? "border-white/10 bg-white/5 text-white hover:border-violet-500/50"
                : "border-slate-200 bg-white text-slate-900 hover:border-violet-300"
            }`}
          >
            {reposLoading ? (
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                Loading repositories...
              </span>
            ) : selectedRepo ? (
              <span className="flex items-center gap-2">
                <FolderGit2 size={16} className="text-violet-500" />
                {selectedRepo.name}
              </span>
            ) : (
              <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                Choose a repository to chat with...
              </span>
            )}
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform ${
                showDropdown ? "rotate-180" : ""
              } ${isDark ? "text-slate-400" : "text-slate-500"}`}
            />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute z-50 mt-2 w-full overflow-hidden rounded-xl border shadow-xl ${
                  isDark
                    ? "border-white/10 bg-slate-800"
                    : "border-slate-200 bg-white"
                }`}
              >
                {repositories.length === 0 ? (
                  <div className="p-4 text-center">
                    <p
                      className={`mb-3 text-sm ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      No repositories found
                    </p>
                    <Link
                      to="/repositories"
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
                    >
                      <FolderGit2 size={14} />
                      Add Repository
                    </Link>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {repositories.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => handleSelectRepo(repo)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                          selectedRepo?.id === repo.id
                            ? isDark
                              ? "bg-violet-500/20 text-white"
                              : "bg-violet-50 text-violet-700"
                            : isDark
                              ? "text-slate-300 hover:bg-white/5"
                              : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <FolderGit2
                          size={16}
                          className={
                            selectedRepo?.id === repo.id
                              ? "text-violet-500"
                              : isDark
                                ? "text-slate-500"
                                : "text-slate-400"
                          }
                        />
                        <span className="flex-1 truncate">{repo.name}</span>
                        {selectedRepo?.id === repo.id && (
                          <Check size={16} className="text-violet-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`mb-4 flex h-[500px] flex-col overflow-hidden rounded-xl border shadow-sm ${
          isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
        }`}
      >
        {!selectedRepo ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Sparkles size={32} className="text-violet-500" />
            </div>
            <h3
              className={`mb-2 text-xl font-semibold ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              Select a Repository to Start
            </h3>
            <p
              className={`mb-6 text-center text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Choose a repository from the dropdown above to start chatting with
              your codebase
            </p>
            {repositories.length === 0 && !reposLoading && (
              <Link
                to="/repositories"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl hover:shadow-violet-500/40"
              >
                <FolderGit2 size={16} />
                Add Your First Repository
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
              </svg>
            </div>
            <h3
              className={`mb-2 text-lg font-semibold ${
                isDark ? "text-white" : "text-slate-800"
              }`}
            >
              What would you like to know about {selectedRepo.name}?
            </h3>
            <p
              className={`mb-8 text-center text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
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
              <div
                key={message.id}
                className={`mb-5 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-3xl gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      message.role === "user"
                        ? "bg-blue-600"
                        : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
                    }`}
                  >
                    {message.role === "user" ? "U" : "AI"}
                  </div>
                  <div
                    className={`rounded-2xl px-5 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : isDark
                          ? "border border-white/10 bg-white/5 text-slate-200"
                          : "border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
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
                  <div
                    className={`rounded-2xl border px-5 py-4 ${
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex gap-1.5">
                      <span
                        className={`h-2 w-2 animate-bounce rounded-full [animation-delay:0ms] ${
                          isDark ? "bg-slate-500" : "bg-slate-400"
                        }`}
                      />
                      <span
                        className={`h-2 w-2 animate-bounce rounded-full [animation-delay:150ms] ${
                          isDark ? "bg-slate-500" : "bg-slate-400"
                        }`}
                      />
                      <span
                        className={`h-2 w-2 animate-bounce rounded-full [animation-delay:300ms] ${
                          isDark ? "bg-slate-500" : "bg-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-3 rounded-xl border p-3 shadow-sm ${
          isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
        }`}
      >
        <input
          type="text"
          value={input}
          disabled={loading || !selectedRepo}
          placeholder={
            selectedRepo
              ? `Ask about ${selectedRepo.name}...`
              : "Select a repository first..."
          }
          onChange={(e) => setInput(e.target.value)}
          className={`flex-1 rounded-lg border-0 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50 ${
            isDark
              ? "text-white placeholder:text-slate-500"
              : "text-slate-800 placeholder:text-slate-400"
          }`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !selectedRepo}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Thinking...
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </DashboardLayout>
  );
}
