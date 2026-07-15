export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
  source?: {
    filePath: string;
    startLine: number;
    endLine: number;
    confidence: number;
  } | null;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  repositoryId?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface StreamEvent {
  type: "token" | "done" | "error" | "conversation_id";
  token?: string;
  conversationId?: string;
  messageType?: string;
  source?: ChatMessage["source"];
  message?: string;
}
