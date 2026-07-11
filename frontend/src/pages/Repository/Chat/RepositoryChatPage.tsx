import { useState } from "react";

import DashboardLayout from "@/layouts/DashboardLayout";

import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";

import { askRepository } from "@/services/chat";

import type { ChatMessage } from "@/types/chat";

export default function RepositoryChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async (question: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      const answer = await askRepository(question);

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          answer.answer ??
          JSON.stringify(answer),
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Failed to contact AI backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-3xl font-bold">
        AI Repository Chat
      </h1>

      <ChatWindow messages={messages} />

      <ChatInput
        onSend={send}
        loading={loading}
      />
    </DashboardLayout>
  );
}