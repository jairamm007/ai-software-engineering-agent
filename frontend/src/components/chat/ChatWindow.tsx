import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import ChatMessageItem from "./ChatMessage";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  messages: ChatMessage[];
}

export default function ChatWindow({ messages }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`mb-6 h-[500px] overflow-y-auto rounded-xl border p-6 shadow ${
      isDark ? "border-white/10 bg-[var(--card-bg)]" : "border-slate-200 bg-white"
    }`}>
      {messages.length === 0 && (
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>
          Ask anything about this repository...
        </p>
      )}

      {messages.map((message) => (
        <ChatMessageItem key={message.id} role={message.role} message={message.content} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
