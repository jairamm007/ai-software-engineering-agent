import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Send, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import {
  getTeamChats,
  createTeamChat,
  getTeamChat,
  sendTeamMessage,
  deleteTeamChat,
} from "@/services/teamChat";
import type { TeamChat, TeamMessage } from "@/services/teamChat";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function TeamChatPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: chats = [], isLoading: chatsLoading } = useQuery({
    queryKey: ["team-chats", teamId],
    queryFn: () => getTeamChats(teamId!),
    enabled: !!teamId,
  });

  const { data: chatData, isLoading: chatLoading } = useQuery({
    queryKey: ["team-chat", teamId, selectedChat],
    queryFn: () => getTeamChat(teamId!, selectedChat!),
    enabled: !!teamId && !!selectedChat,
  });

  const createChatMutation = useMutation({
    mutationFn: () => createTeamChat(teamId!, "New Chat"),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["team-chats", teamId] });
      setSelectedChat(chat.id);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendTeamMessage(teamId!, selectedChat!, content),
    onMutate: () => setIsSending(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-chat", teamId, selectedChat] });
      setMessageText("");
      setIsSending(false);
    },
    onError: () => setIsSending(false),
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId: string) => deleteTeamChat(teamId!, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-chats", teamId] });
      setSelectedChat(null);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

  const handleSend = () => {
    if (!messageText.trim() || isSending) return;
    sendMutation.mutate(messageText.trim());
  };

  const messages: TeamMessage[] = chatData?.messages || [];

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Chat List Sidebar */}
      <div className={`w-64 shrink-0 rounded-2xl border overflow-hidden flex flex-col ${
        isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"
      }`}>
        <div className={`p-4 border-b ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-semibold font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>
              Team Chats
            </h2>
            <button
              type="button"
              onClick={() => createChatMutation.mutate()}
              disabled={createChatMutation.isPending}
              className="rounded-lg accent-bg-light p-1.5"
            >
              {createChatMutation.isPending ? (
                <LoadingIndicator size="sm" />
              ) : (
                <Plus size={13} className="accent-text" />
              )}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="p-4 flex justify-center">
              <LoadingIndicator size="sm" />
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare size={24} className={`mx-auto mb-2 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No chats yet</p>
            </div>
          ) : (
            chats.map((chat: TeamChat) => (
              <button
                key={chat.id}
                type="button"
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full text-left px-4 py-3 border-b transition-colors ${
                  isDark ? "border-white/[0.04] hover:bg-white/[0.02]" : "border-slate-50 hover:bg-slate-50"
                } ${selectedChat === chat.id ? (isDark ? "bg-white/[0.04]" : "bg-slate-50") : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare size={12} className={`shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                    <span className={`text-xs font-[Inter] truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {chat.title || "New Chat"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChatMutation.mutate(chat.id);
                    }}
                    className={`rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isDark ? "text-slate-500 hover:text-red-400" : "text-slate-400 hover:text-red-500"
                    }`}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${
        isDark ? "border-white/[0.06] bg-[var(--card-bg)]" : "border-slate-200 bg-white"
      }`}>
        {!selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageSquare size={40} className={`mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
            <h3 className={`text-lg font-semibold font-[Inter] mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              Team AI Chat
            </h3>
            <p className={`text-sm font-[Inter] mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Start a new chat or select an existing one
            </p>
            <button
              type="button"
              onClick={() => createChatMutation.mutate()}
              disabled={createChatMutation.isPending}
              className="flex items-center gap-2 rounded-xl accent-gradient px-4 py-2 text-sm font-medium text-white"
            >
              {createChatMutation.isPending ? <LoadingIndicator size="sm" /> : <Plus size={13} />}
              New Chat
            </button>
          </div>
        ) : chatLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingIndicator size="md" />
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Start a conversation with your team AI assistant
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full accent-gradient text-[10px] font-bold text-white">
                      {msg.role === "assistant" ? "AI" : msg.user?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "assistant"
                        ? isDark
                          ? "bg-white/[0.04] text-slate-200"
                          : "bg-slate-50 text-slate-800"
                        : "accent-gradient text-white"
                    }`}>
                      {msg.role === "user" && (
                        <p className={`text-[10px] font-medium mb-1 ${isDark ? "text-white/60" : "text-white/80"}`}>
                          {msg.user?.name || "You"}
                        </p>
                      )}
                      <p className="text-sm font-[Inter] whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask your team AI assistant..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  disabled={isSending}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-[Inter] outline-none transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-[var(--accent)]"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!messageText.trim() || isSending}
                  className="rounded-xl accent-gradient p-2.5 text-white disabled:opacity-50"
                >
                  {isSending ? <LoadingIndicator size="sm" /> : <Send size={15} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
