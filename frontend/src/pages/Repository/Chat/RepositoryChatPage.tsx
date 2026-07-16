import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Copy,
  Download,
  Check,
  FileText,
  FileType,
  Send,
  Square,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

import DashboardLayout from "@/layouts/DashboardLayout";
import { streamChat } from "@/services/chat";
import { getRepositories } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import MarkdownMessage from "@/components/chat/MarkdownMessage";
import type { ChatMessage } from "@/types/chat";

const suggestedQuestions = [
  "Explain the overall architecture of this repository",
  "What are the main entry points and how do they connect?",
  "Are there any potential security issues in the code?",
  "Summarize the key modules and their responsibilities",
];

export default function RepositoryChatPage() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();

  const { data: repositories = [] } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  const selectedRepo = repositories.find((r) => r.id === id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const send = useCallback(
    (question: string) => {
      if (!question.trim() || streaming || !id) return;

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
        repositoryId: id,
        conversationId,
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
          if (data.conversationId) setConversationId(data.conversationId);
        },
        onError: (message) => {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "assistant", content: message || "Failed to generate response." },
          ]);
          setStreamingContent("");
          setStreaming(false);
        },
      });
    },
    [streaming, id, conversationId]
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

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

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
      downloadBlob(new Blob([content], { type: "text/plain" }), `response.${format}`);
    } else if (format === "pdf") {
      const doc = new jsPDF();
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
        (l) => new Paragraph({ children: [new TextRun({ text: l, font: "Courier New", size: 20 })] })
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
      <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden -m-4 sm:-m-6 md:-m-8">
        {/* Header */}
        <div className={`flex items-center gap-3 border-b px-4 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <Link
            to={`/repositories/${id}`}
            className={`rounded-lg p-1.5 transition-colors ${isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-[var(--accent)]" />
            <span className={`text-sm font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
              {selectedRepo?.name ?? "Repository"} — AI Chat
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !streaming ? (
            <div className="flex h-full flex-col items-center justify-center p-8">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl accent-gradient">
                <MessageSquare size={28} className="text-white" />
              </div>
              <h3 className={`mb-2 text-lg font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-800"}`}>
                Chat with {selectedRepo?.name ?? "this repository"}
              </h3>
              <p className={`mb-8 text-center text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Ask anything about the code, architecture, or dependencies
              </p>
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-[Inter] transition-colors ${
                      isDark
                        ? "border-white/10 bg-white/5 text-slate-300 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/10 hover:text-[var(--accent-light)]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[var(--accent-light)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
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
                <MessageBubble key={msg.id} message={msg} isDark={isDark} onCopy={handleCopy} onDownload={handleDownload} />
              ))}
              {streaming && streamingContent && (
                <MessageBubble
                  message={{ id: "streaming", role: "assistant", content: streamingContent }}
                  isDark={isDark} onCopy={handleCopy} onDownload={handleDownload} streaming
                />
              )}
              {streaming && !streamingContent && (
                <div className="mb-6 flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full accent-gradient text-xs font-bold text-white font-[Inter]">AI</div>
                  <div className={`rounded-2xl border px-5 py-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className={`h-2 w-2 animate-bounce rounded-full ${isDark ? "bg-slate-500" : "bg-slate-400"}`} style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`border-t px-4 py-3 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <form onSubmit={handleSubmit} className={`mx-auto max-w-3xl flex items-end gap-2 rounded-2xl border p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${selectedRepo?.name ?? "this repository"}...`}
              rows={1}
              className={`flex-1 resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm outline-none font-[Inter] ${isDark ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"}`}
            />
            {streaming ? (
              <button type="button" onClick={() => { setStreaming(false); setStreamingContent(""); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30" title="Stop">
                <Square size={14} />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl accent-gradient text-white hover:shadow-lg disabled:opacity-50">
                <Send size={14} />
              </button>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Message Bubble ──
function MessageBubble({
  message, isDark, onCopy, onDownload, streaming = false,
}: {
  message: ChatMessage; isDark: boolean;
  onCopy: (c: string) => void; onDownload: (c: string, f: "txt" | "pdf" | "docx" | "md") => void;
  streaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isUser = message.role === "user";

  return (
    <div className={`mb-6 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} w-full max-w-full`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white font-[Inter] ${isUser ? "bg-blue-600" : "accent-gradient"}`}>
          {isUser ? "U" : "AI"}
        </div>
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} min-w-0 flex-1`}>
          <div className={`rounded-2xl px-5 py-3 ${isUser ? "bg-blue-600 text-white" : isDark ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-slate-50"}`}>
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed font-[Inter]">{message.content}</p>
            ) : (
              <MarkdownMessage content={message.content} />
            )}
            {streaming && <span className="inline-block h-4 w-0.5 animate-pulse bg-[var(--accent)] ml-0.5" />}
          </div>
          {!isUser && !streaming && message.content && (
            <div className="mt-1.5 flex items-center gap-1">
              <button type="button" onClick={async () => { await onCopy(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium font-[Inter] ${copied ? "text-emerald-500" : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
                {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
              </button>
              <div className="relative">
                <button type="button" onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium font-[Inter] ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}>
                  <Download size={11} /> Export
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className={`absolute left-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border shadow-xl ${isDark ? "border-white/10 bg-[#110C1D]" : "border-slate-200 bg-white"}`}>
                      {([["txt", "Plain Text", FileText, "text-blue-500"], ["md", "Markdown", FileText, "text-[var(--accent)]"], ["pdf", "PDF", FileType, "text-red-500"], ["docx", "Word", FileType, "text-blue-400"]] as const).map(([fmt, label, Icon, color]) => (
                        <button key={fmt} type="button" onClick={() => { onDownload(message.content, fmt); setMenuOpen(false); }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-medium font-[Inter] ${isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-50"}`}>
                          <Icon size={12} className={color} /> {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {message.source && (
                <span className={`ml-2 text-[10px] font-[Inter] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {message.source.filePath}:{message.source.startLine}-{message.source.endLine} ({message.source.confidence}%)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
