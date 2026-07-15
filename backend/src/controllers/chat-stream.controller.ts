import { streamRepositoryChat } from "../services/chat-stream.service.js";
import { getRepositoryById } from "../repository/repository.repository.js";
import {
  getConversationById,
  addMessage,
  touchConversation,
  createConversation,
} from "../repository/conversation.repository.js";
import { errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const chatStreamController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse("Unauthorized"));
    return;
  }

  try {
    const { question, repositoryId, filePath, conversationId } = req.body;

    if (!question) {
      return res.status(400).json(errorResponse("Question is required"));
    }

    // Verify repo ownership if provided
    if (repositoryId) {
      const repo = await getRepositoryById(repositoryId, userId);
      if (!repo) {
        return res.status(404).json(errorResponse("Repository not found"));
      }
    }

    // Get or create conversation
    let convId = conversationId;
    if (convId) {
      const conv = await getConversationById(convId, userId);
      if (!conv) {
        return res.status(404).json(errorResponse("Conversation not found"));
      }
    } else {
      const title = question.length > 60 ? question.slice(0, 60) + "..." : question;
      const conv = await createConversation(userId, title, repositoryId);
      convId = conv.id;
    }

    // Save user message
    await addMessage(convId, "user", question);

    // Get conversation history for context
    const conv = await getConversationById(convId, userId);
    const history = conv?.messages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    })) ?? [];

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Conversation-Id", convId);
    res.flushHeaders();

    let fullResponse = "";
    let sourceInfo = null;
    let typeInfo = "answer";

    // Send conversation ID first
    res.write(`data: ${JSON.stringify({ type: "conversation_id", conversationId: convId })}\n\n`);

    try {
      for await (const chunk of streamRepositoryChat({
        question,
        repositoryId,
        filePath,
        history,
      })) {
        fullResponse += chunk.token;
        sourceInfo = chunk.source;
        typeInfo = chunk.type;

        res.write(`data: ${JSON.stringify({ type: "token", token: chunk.token })}\n\n`);
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: "done",
        messageType: typeInfo,
        source: sourceInfo,
      })}\n\n`);

      // Save assistant message to DB
      await addMessage(convId, "assistant", fullResponse);
      await touchConversation(convId);
    } catch (streamError) {
      console.error("Stream error:", streamError);
      res.write(`data: ${JSON.stringify({
        type: "error",
        message: "Failed to generate response",
      })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error("Chat stream error:", error);
    if (!res.headersSent) {
      return res.status(500).json(
        errorResponse(error instanceof Error ? error.message : "Internal Server Error")
      );
    }
    res.end();
  }
};
