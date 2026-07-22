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
  RefreshCw,
  Pencil,
  Clock,
  GitBranch,
  Brain,
  Search,
  Code2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  getConversations,
  getConversation,
  deleteConversation,
  renameConversation,
  streamChat,
} from "@/services/chat";
import { getRepositories } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import MarkdownMessage from "@/components/chat/MarkdownMessage";
import type { ChatMessage } from "@/types/chat";
import type { RepositoryListItem } from "@/types/repository";

const PROMPT_CATEGORIES = [
  {
    title: "Understand",
    icon: Brain,
    color: "text-violet-400",
    prompts: [
      "Explain the overall architecture of this repository",
      "What are the main entry points and how do they connect?",
      "Summarize the key modules and their responsibilities",
      "Walk me through the data flow of this application",
    ],
  },
  {
    title: "Analyze",
    icon: Search,
    color: "text-blue-400",
    prompts: [
      "Are there any potential security issues in the code?",
      "What dependencies does this project use and why?",
      "Identify any code smells or anti-patterns",
      "What are the potential performance bottlenecks?",
    ],
  },
  {
    title: "Build",
    icon: Code2,
    color: "text-emerald-400",
    prompts: [
      "Generate documentation for the main functions",
      "Write unit tests for the core modules",
      "Suggest improvements for error handling",
      "How would you add a new feature to this codebase?",
    ],
  },
];

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

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
  const [thinkingStage, setThinkingStage] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);

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

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameConversation(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setEditingConvId(null);
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

  // ── Thinking stages ──
  useEffect(() => {
    if (!streaming) {
      setThinkingStage(null);
      return;
    }
    if (streamingContent) {
      setThinkingStage(null);
      return;
    }
    const stages = [
      { delay: 400, text: "Searching codebase..." },
      { delay: 2000, text: "Analyzing relevant code..." },
      { delay: 5000, text: "Generating response..." },
    ];
    const timers = stages.map((s) =>
      setTimeout(() => setThinkingStage(s.text), s.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [streaming, streamingContent]);

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

      const controller = new AbortController();
      abortRef.current = controller;
      let fullContent = "";

      streamChat({
        question,
        repositoryId: selectedRepo?.id,
        conversationId: activeConversationId ?? undefined,
        signal: controller.signal,
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
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
          setStreamingContent("");
          setStreaming(false);
          abortRef.current = null;
          if (data.conversationId) {
            setActiveConversationId(data.conversationId);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        },
        onError: (message) => {
          if (controller.signal.aborted) {
            if (fullContent) {
              setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "assistant", content: fullContent, createdAt: new Date().toISOString() },
              ]);
            }
            setStreamingContent("");
            setStreaming(false);
            abortRef.current = null;
            return;
          }
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: message || "Sorry, I couldn't process your request. Please try again.",
          };
          setMessages((prev) => [...prev, errorMsg]);
          setStreamingContent("");
          setStreaming(false);
          abortRef.current = null;
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

  // ── Stop generating ──
  const handleStop = () => {
    abortRef.current?.abort();
  };

  // ── Regenerate last response ──
  const handleRegenerate = () => {
    if (streaming || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    setMessages((prev) => prev.filter((m) => m.id !== lastUserMsg.id));
    send(lastUserMsg.content);
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

  // ── Rename conversation ──
  const startRename = (conv: { id: string; title: string }) => {
    setEditingConvId(conv.id);
    setEditTitle(conv.title);
  };

  const commitRename = () => {
    if (editingConvId && editTitle.trim()) {
      renameMutation.mutate({ id: editingConvId, title: editTitle.trim() });
    }
    setEditingConvId(null);
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

  const repoConversations = conversations.filter((c) =>
    selectedRepo ? c.repositoryId === selectedRepo.id : true
  );

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
                ) : repoConversations.length === 0 ? (
                  <p className={`px-3 py-8 text-center text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    No conversations yet
                  </p>
                ) : (
                  <div className="space-y-0.5">
                    {repoConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          activeConversationId === conv.id
                            ? isDark ? "accent-bg-light text-white" : "accent-bg-light accent-text-base"
                            : isDark ? "text-slate-400 hover:bg-white/[0.04] hover:text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          if (editingConvId !== conv.id) {
                            setActiveConversationId(conv.id);
                            setStreamingContent("");
                          }
                        }}
                      >
                        <MessageSquare size={14} className="shrink-0" />
                        {editingConvId === conv.id ? (
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") setEditingConvId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex-1 rounded border bg-transparent px-1.5 py-0.5 text-xs font-[Inter] outline-none ${
                              isDark ? "border-white/20 text-white" : "border-slate-300 text-slate-900"
                            }`}
                          />
                        ) : (
                          <span className="flex-1 truncate text-xs font-[Inter]">{conv.title}</span>
                        )}
                        {editingConvId !== conv.id && (
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                              className={`rounded p-1 transition-colors ${
                                isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                              }`}
                              title="Rename"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(conv.id); }}
                              className={`rounded p-1 transition-colors ${
                                isDark ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"
                              }`}
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        )}
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
                <FolderGit2 size={13} className="accent-text-base" />
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
                            className="inline-flex items-center gap-1.5 rounded-lg accent-gradient px-3 py-1.5 text-xs font-medium text-white"
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
                                ? isDark ? "accent-bg-light text-white" : "accent-bg-light accent-text-base"
                                : isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <FolderGit2 size={13} className={selectedRepo?.id === repo.id ? "accent-text-base" : isDark ? "text-slate-500" : "text-slate-400"} />
                            <span className="flex-1 truncate">{repo.name}</span>
                            {selectedRepo?.id === repo.id && <Check size={13} className="accent-text-base" />}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Repo context badge */}
            {selectedRepo && (
              <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium ${
                isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
              }`}>
                <GitBranch size={11} />
                Context: {selectedRepo.name}
              </div>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {!selectedRepo ? (
              <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl accent-bg-light">
                  <Sparkles size={32} className="accent-text-base" />
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
                    className="inline-flex items-center gap-2 rounded-xl accent-gradient accent-shadow px-6 py-3 text-sm font-medium text-white transition-shadow hover:shadow-xl"
                  >
                    <FolderGit2 size={16} /> Add Your First Repository <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            ) : messages.length === 0 && !streaming ? (
              <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl accent-gradient">
                  <MessageSquare size={28} className="text-white" />
                </div>
                <h3 className={`mb-2 text-lg font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-800"}`}>
                  Chat with {selectedRepo.name}
                </h3>
                <p className={`mb-8 text-center text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Ask anything about the code, architecture, dependencies, or logic
                </p>

                <div className="w-full max-w-3xl space-y-6">
                  {PROMPT_CATEGORIES.map((cat) => (
                    <div key={cat.title}>
                      <div className="flex items-center gap-2 mb-3">
                        <cat.icon size={14} className={cat.color} />
                        <span className={`text-xs font-semibold uppercase tracking-wider font-[Inter] ${
                          isDark ? "text-slate-500" : "text-slate-400"
                        }`}>
                          {cat.title}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {cat.prompts.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => send(q)}
                            className={`rounded-xl border px-4 py-3 text-left text-sm font-[Inter] transition-all hover:scale-[1.01] ${
                              isDark
                                ? "border-white/10 bg-white/5 text-slate-300 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
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
                    onRegenerate={msg.role === "assistant" ? handleRegenerate : undefined}
                    isLastAssistant={
                      msg.role === "assistant" &&
                      msg === [...messages].reverse().find((m) => m.role === "assistant")
                    }
                    isHovered={hoveredMsgId === msg.id}
                    onHover={setHoveredMsgId}
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full accent-gradient text-xs font-bold text-white font-[Inter]">
                      AI
                    </div>
                    <div className={`rounded-2xl border px-5 py-4 ${
                      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                    }`}>
                      {thinkingStage ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin accent-text-base" />
                          <span className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {thinkingStage}
                          </span>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              className={`h-2 w-2 animate-bounce rounded-full ${isDark ? "bg-slate-500" : "bg-slate-400"}`}
                              style={{ animationDelay: `${delay}ms` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className={`border-t px-4 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
            <div className={`mx-auto max-w-3xl rounded-2xl border p-2 ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"
            }`}>
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
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
                    onClick={handleStop}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
                    title="Stop generating"
                  >
                    <Square size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || !selectedRepo}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl accent-gradient text-white transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                )}
              </form>

              {/* Regenerate bar */}
              {!streaming && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-medium transition-colors font-[Inter] ${
                      isDark ? "text-slate-500 hover:text-slate-300 hover:bg-white/5" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <RefreshCw size={11} />
                    Regenerate response
                  </button>
                </div>
              )}
            </div>
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
  onRegenerate,
  streaming = false,
  isLastAssistant = false,
  isHovered,
  onHover,
}: {
  message: ChatMessage;
  isDark: boolean;
  onCopy: (content: string) => void;
  onDownload: (content: string, format: "txt" | "pdf" | "docx" | "md") => void;
  onRegenerate?: () => void;
  streaming?: boolean;
  isLastAssistant?: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
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
    <div
      className={`group/msg mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => onHover(message.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={`flex max-w-full gap-3 ${isUser ? "flex-row-reverse" : ""} w-full`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white font-[Inter] ${
          isUser ? "bg-blue-600" : "accent-gradient"
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
              <span className="inline-block h-4 w-0.5 animate-pulse accent-text-base ml-0.5" />
            )}
          </div>

          {/* Action bar for assistant messages */}
          {!isUser && !streaming && message.content && (
            <div className="mt-1.5 flex items-center gap-1">
              {/* Timestamp */}
              {message.createdAt && (
                <span className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-[Inter] ${
                  isDark ? "text-slate-600" : "text-slate-400"
                }`}>
                  <Clock size={10} />
                  {formatRelativeTime(message.createdAt)}
                </span>
              )}

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
                        ["md", "Markdown", FileText, "accent-text-base"],
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

              {/* Regenerate per-message (only on last assistant message) */}
              {isLastAssistant && onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all font-[Inter] ${
                    isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <RefreshCw size={11} /> Regenerate
                </button>
              )}

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
