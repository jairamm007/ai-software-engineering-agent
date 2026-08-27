import api, { API_BASE_URL } from "@/lib/axios";
import type { Conversation, StreamEvent } from "@/types/chat";

interface AskRepositoryInput {
  question: string;
  repositoryId?: string;
  filePath?: string;
  signal?: AbortSignal;
}

export const askRepository = async ({
  question,
  repositoryId,
  filePath,
  signal,
}: AskRepositoryInput) => {
  const response = await api.post("/chat", { question, repositoryId, filePath }, { signal });
  return response.data.data;
};

// ── Conversation CRUD ──

export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get("/conversations");
  return response.data.data;
};

export const getConversation = async (id: string): Promise<Conversation> => {
  const response = await api.get(`/conversations/${id}`);
  return response.data.data;
};

export const createConversation = async (
  title: string,
  repositoryId?: string
): Promise<Conversation> => {
  const response = await api.post("/conversations", { title, repositoryId });
  return response.data.data;
};

export const deleteConversation = async (id: string): Promise<void> => {
  await api.delete(`/conversations/${id}`);
};

export const renameConversation = async (
  id: string,
  title: string
): Promise<void> => {
  await api.patch(`/conversations/${id}`, { title });
};

// ── Streaming Chat ──

export interface StreamChatInput {
  question: string;
  repositoryId?: string;
  filePath?: string;
  conversationId?: string;
  onToken: (token: string) => void;
  onDone: (data: { conversationId: string; messageType: string; source: StreamEvent["source"] }) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

export const streamChat = async ({
  question,
  repositoryId,
  filePath,
  conversationId,
  onToken,
  onDone,
  onError,
  signal,
}: StreamChatInput): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ question, repositoryId, filePath, conversationId }),
      signal,
    });
  } catch {
    if (signal?.aborted) return;
    onError("Failed to connect to chat service");
    return;
  }

  if (!response.ok) {
    onError("Failed to connect to chat service");
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError("Failed to read response stream");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (!completed && !signal?.aborted) {
        onError("The analysis service ended the response unexpectedly");
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const event: StreamEvent = JSON.parse(jsonStr);
        switch (event.type) {
          case "token":
            if (event.token) onToken(event.token);
            break;
          case "done":
            completed = true;
            onDone({
              conversationId: event.conversationId ?? "",
              messageType: event.messageType ?? "answer",
              source: event.source ?? null,
            });
            break;
          case "error":
            onError(event.message ?? "Unknown error");
            break;
          case "conversation_id":
            // Handled via onDone
            break;
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
};
