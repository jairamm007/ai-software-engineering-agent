import {
  useEffect,
  useRef,
} from "react";

import type { ChatMessage } from "@/types/chat";

import ChatMessageItem from "./ChatMessage";

interface Props {
  messages: ChatMessage[];
}

export default function ChatWindow({
  messages,
}: Props) {
  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="mb-6 h-[500px] overflow-y-auto rounded-xl border bg-white p-6 shadow">
      {messages.length === 0 && (
        <p className="text-slate-400">
          Ask anything about this repository...
        </p>
      )}

      {messages.map((message) => (
        <ChatMessageItem
          key={message.id}
          role={message.role}
          message={message.content}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}