import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  FolderGit2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Copy,
  Download,
  FileText,
  FileType,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  Send,
  Square,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  getConversations,
  getConversation,
  deleteConversation,
  streamChat,
} from "@/services/chat";
import { getRepositories } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import MarkdownMessage from "@/components/chat/MarkdownMessage";
import type { ChatMessage } from "@/types/chat";
import type { RepositoryListItem } from "@/types/repository";

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
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── State ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryListItem | null>(null);
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // ── Queries ──
  const { data: repositories = [], isLoading: reposLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const { data: conversations = [], isLoading: convosLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (activeConversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    },
  });

  // ── Load conversation messages ──
  useEffect(() => {
    if (!activeConversationId) return;
    getConversation(activeConversationId).then((conv) => {
      if (conv.messages) {
        setMessages(
          conv.messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt: m.createdAt,
          }))
        );
      }
    });
  }, [activeConversationId]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // ── Send message ──
  const send = useCallback(
    (question: string) => {
      if (!question.trim() || streaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: question,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setStreaming(true);
      setStreamingContent("");

      let fullContent = "";

      streamChat({
        question,
        repositoryId: selectedRepo?.id,
        conversationId: activeConversationId ?? undefined,
        onToken: (token) => {
          fullContent += token;
          setStreamingContent(fullContent);
        },
        onDone: (data) => {
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: fullContent,
            source: data.source,
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent("");
          setStreaming(false);
          if (data.conversationId) {
            setActiveConversationId(data.conversationId);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        },
        onError: (message) => {
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: message || "Sorry, I couldn't process your request. Please try again.",
          };
          setMessages((prev) => [...prev, errorMsg]);
          setStreamingContent("");
          setStreaming(false);
        },
      });
    },
    [streaming, selectedRepo, activeConversationId, queryClient]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  // ── New conversation ──
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    setStreamingContent("");
  };

  // ── Select repo ──
  const handleSelectRepo = (repo: RepositoryListItem) => {
    setSelectedRepo(repo);
    setShowRepoDropdown(false);
    handleNewChat();
  };

  // ── Copy message ──
  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  // ── Download message ──
  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (content: string, format: "txt" | "pdf" | "docx" | "md") => {
    if (format === "txt" || format === "md") {
      const ext = format === "md" ? "md" : "txt";
      downloadBlob(new Blob([content], { type: "text/plain" }), `response.${ext}`);
    } else if (format === "pdf") {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFont("Courier", "normal");
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(content, 180);
      let y = 15;
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 15; }
        doc.text(line, 15, y);
        y += 4;
      }
      doc.save("response.pdf");
    } else {
      const paragraphs = content.split("\n").map(
        (line) => new Paragraph({ children: [new TextRun({ text: line, font: "Courier New", size: 20 })] })
      );
      const doc = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, "response.docx");
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden -m-4 sm:-m-6 md:-m-8">
        {/* ── Conversation Sidebar ── */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex shrink-0 flex-col border-r overflow-hidden ${
                isDark ? "border-white/[0.06] bg-[#0B0614]" : "border-slate-200 bg-white"
              }`}
            >
              <div className={`flex items-center justify-between border-b px-4 py-3 ${
                isDark ? "border-white/[0.06]" : "border-slate-100"
              }`}>
                <h3 className={`font-[Outfit] text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Conversations
                </h3>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className={`rounded-lg p-1.5 transition-colors ${
                    isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="New chat"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {convosLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={18} className={`animate-spin ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className={`px-3 py-8 text-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    No conversations yet
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          activeConversationId === conv.id
                            ? isDark ? "bg-violet-500/10 text-white" : "bg-violet-50 text-violet-700"
                            : isDark ? "text-slate-400 hover:bg-white/[0.04] hover:text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          setStreamingContent("");
                        }}
                      >
                        <MessageSquare size={14} className="shrink-0" />
                        <span className="flex-1 truncate text-xs font-[Inter]">{conv.title}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(conv.id); }}
                          className={`hidden rounded p-1 transition-colors group-hover:block ${
                            isDark ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"
                          }`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main Chat Area ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <div className={`flex items-center gap-3 border-b px-4 py-2.5 ${
            isDark ? "border-white/[0.06]" : "border-slate-100"
          }`}>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`rounded-lg p-1.5 transition-colors ${
                isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>

            {/* Repo selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRepoDropdown(!showRepoDropdown)}
                disabled={reposLoading}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/50"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                }`}
              >
                <FolderGit2 size={13} className="text-violet-500" />
                {selectedRepo ? selectedRepo.name : "Select repo"}
                <ChevronDown size={12} className={`transition-transform ${showRepoDropdown ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showRepoDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border shadow-xl ${
                      isDark ? "border-white/10 bg-[#110C1D]" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="max-h-64 overflow-y-auto p-1.5">
                      {repositories.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className={`mb-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            No repositories found
                          </p>
                          <Link
                            to="/repositories"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            <FolderGit2 size={12} /> Add Repository
                          </Link>
                        </div>
                      ) : (
                        repositories.map((repo) => (
                          <button
                            key={repo.id}
                            type="button"
                            onClick={() => handleSelectRepo(repo)}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                              selectedRepo?.id === repo.id
                                ? isDark ? "bg-violet-500/20 text-white" : "bg-violet-50 text-violet-700"
                                : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <FolderGit2 size={13} className={selectedRepo?.id === repo.id ? "text-violet-500" : isDark ? "text-slate-500" : "text-slate-400"} />
                            <span className="flex-1 truncate">{repo.name}</span>
                            {selectedRepo?.id === repo.id && <Check size={13} className="text-violet-500" />}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {!selectedRepo ? (
              <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <Sparkles size={32} className="text-violet-500" />
                </div>
                <h3 className={`mb-2 text-xl font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-800"}`}>
                  Select a Repository to Start
                </h3>
                <p className={`mb-6 text-center text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Choose a repository from the dropdown above to start chatting with your codebase
                </p>
                {repositories.length === 0 && !reposLoading && (
                  <Link
                    to="/repositories"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-shadow hover:shadow-xl"
                  >
                    <FolderGit2 size={16} /> Add Your First Repository <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            ) : messages.length === 0 && !streaming ? (
              <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
                  <MessageSquare size={28} className="text-white" />
                </div>
                <h3 className={`mb-2 text-lg font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-800"}`}>
                  What would you like to know about {selectedRepo.name}?
                </h3>
                <p className={`mb-8 text-center text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Ask anything about the code, architecture, dependencies, or logic
                </p>
                <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-[Inter] transition-colors ${
                        isDark
                          ? "border-white/10 bg-white/5 text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-300"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl px-4 py-6">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isDark={isDark}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                  />
                ))}
                {streaming && streamingContent && (
                  <MessageBubble
                    message={{ id: "streaming", role: "assistant", content: streamingContent }}
                    isDark={isDark}
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    streaming
                  />
                )}
                {streaming && !streamingContent && (
                  <div className="mb-6 flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white font-[Inter]">
                      AI
                    </div>
                    <div className={`rounded-2xl border px-5 py-4 ${
                      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                    }`}>
                      <div className="flex gap-1.5">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className={`h-2 w-2 animate-bounce rounded-full ${isDark ? "bg-slate-500" : "bg-slate-400"}`}
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className={`border-t px-4 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <form
              onSubmit={handleSubmit}
              className={`mx-auto max-w-3xl flex items-end gap-2 rounded-2xl border p-2 ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
                onKeyDown={handleKeyDown}
                disabled={!selectedRepo}
                placeholder={selectedRepo ? `Ask about ${selectedRepo.name}...` : "Select a repository first..."}
                rows={1}
                className={`flex-1 resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50 font-[Inter] ${
                  isDark ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
                }`}
              />
              {streaming ? (
                <button
                  type="button"
                  onClick={() => { abortRef.current?.abort(); setStreaming(false); setStreamingContent(""); }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
                  title="Stop generating"
                >
                  <Square size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || !selectedRepo}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white transition-all hover:shadow-lg disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Message Bubble Component ──

function MessageBubble({
  message,
  isDark,
  onCopy,
  onDownload,
  streaming = false,
}: {
  message: ChatMessage;
  isDark: boolean;
  onCopy: (content: string) => void;
  onDownload: (content: string, format: "txt" | "pdf" | "docx" | "md") => void;
  streaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-full gap-3 ${isUser ? "flex-row-reverse" : ""} w-full`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white font-[Inter] ${
          isUser ? "bg-blue-600" : "bg-gradient-to-br from-violet-500 to-fuchsia-600"
        }`}>
          {isUser ? "U" : "AI"}
        </div>

        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0 flex-1`}>
          <div className={`w-full rounded-2xl px-5 py-3 ${
            isUser
              ? "bg-blue-600 text-white"
              : isDark ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-slate-50"
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed font-[Inter]">{message.content}</p>
            ) : (
              <MarkdownMessage content={message.content} />
            )}
            {streaming && (
              <span className="inline-block h-4 w-0.5 animate-pulse bg-violet-400 ml-0.5" />
            )}
          </div>

          {/* Action bar for assistant messages */}
          {!isUser && !streaming && message.content && (
            <div className="mt-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all font-[Inter] ${
                  copied
                    ? "text-emerald-500"
                    : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all font-[Inter] ${
                    isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Download size={11} /> Export
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className={`absolute left-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border shadow-xl ${
                        isDark ? "border-white/10 bg-[#110C1D]" : "border-slate-200 bg-white"
                      }`}
                    >
                      {([
                        ["txt", "Plain Text", FileText, "text-blue-500"],
                        ["md", "Markdown", FileText, "text-violet-500"],
                        ["pdf", "PDF", FileType, "text-red-500"],
                        ["docx", "Word", FileType, "text-blue-400"],
                      ] as const).map(([fmt, label, Icon, color]) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => { onDownload(message.content, fmt); setMenuOpen(false); }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium font-[Inter] transition-colors ${
                            isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={12} className={color} /> {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {message.source && (
                <span className={`ml-2 text-[10px] font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {message.source.filePath}:{message.source.startLine}-{message.source.endLine}
                  {" "}({message.source.confidence}% confidence)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
