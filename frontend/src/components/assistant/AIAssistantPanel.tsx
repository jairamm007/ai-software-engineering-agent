import AIActionPanel from "@/components/repository/AIActionPanel";
import ConversationHistory from "@/components/repository/ConversationHistory";
import type { AIMessage } from "@/types/ai-conversation";

interface Props {
  loading: boolean;
  messages: AIMessage[];
  onExplain: () => void;
  onReview: () => void;
  onFix: () => void;
  onGenerateCommit: () => void;
  onGeneratePullRequest: () => void;
  onGenerateTests: () => void;
  onSecurityScan: () => void;
  onArchitecture: () => void;
  onDocs: () => void;
}

export default function AIAssistantPanel({ messages, ...actions }: Props) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const selectedMessage = messages.find((message) => message.id === selectedMessageId);

  return <aside className="flex h-full min-h-0 flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"><div className="border-b border-slate-200 p-4 dark:border-slate-700"><h2 className="font-semibold">AI Assistant</h2><p className="text-xs text-slate-500">Actions, history, and results stay in context.</p></div><div className="border-b border-slate-200 p-3 dark:border-slate-700"><AIActionPanel {...actions} /></div>{messages.length > 0 && <div className="border-y border-slate-200 px-3 py-2 dark:border-slate-700"><p className="mb-1 text-xs font-semibold text-slate-500">AI TIMELINE</p><div className="flex gap-1 overflow-x-auto">{messages.filter((message) => message.role === "assistant").map((message) => <button key={message.id} onClick={() => setSelectedMessageId(message.id)} className={`shrink-0 rounded px-2 py-1 text-xs ${selectedMessageId === message.id ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800"}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</button>)}</div></div>}{selectedMessage && <div className="max-h-32 overflow-auto border-b border-slate-200 bg-blue-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800"><p className="mb-1 text-xs font-semibold">Selected result</p><p className="whitespace-pre-wrap">{selectedMessage.content}</p></div>}<div className="min-h-0 flex-1 overflow-auto px-3 pb-3"><ConversationHistory messages={messages} /></div></aside>;
}
import { useState } from "react";
