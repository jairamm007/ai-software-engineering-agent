import {
  createChat,
  listChats,
  getChat,
  sendMessage,
  removeChat,
} from "../services/team-chat.service.js";
import { successResponse, errorResponse } from "../utils/api-response.js";
import type { AuthRequest } from "../auth/auth.middleware.js";
import type { Response } from "express";

export const createChatController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const teamId = req.params.teamId as string;
    const { title } = req.body;
    const chat = await createChat(teamId, userId, title);
    res.status(201).json(successResponse(chat, "Chat created"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create chat";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const listChatsController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const teamId = req.params.teamId as string;
    const chats = await listChats(teamId, userId);
    res.status(200).json(successResponse(chats, "Chats fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch chats";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const getChatController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const chatId = req.params.chatId as string;
    const chat = await getChat(chatId, userId);
    res.status(200).json(successResponse(chat, "Chat fetched"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch chat";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const sendMessageController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const chatId = req.params.chatId as string;
    const { content, repositoryId } = req.body;
    if (!content) { res.status(400).json(errorResponse("Content is required")); return; }

    const messages = await sendMessage(chatId, userId, content, repositoryId);
    res.status(201).json(successResponse(messages, "Message sent"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to send message";
    res.status(msg.includes("not a member") ? 403 : 500).json(errorResponse(msg));
  }
};

export const deleteChatController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) { res.status(401).json(errorResponse("Unauthorized")); return; }

  try {
    const chatId = req.params.chatId as string;
    await removeChat(chatId, userId);
    res.status(200).json(successResponse(null, "Chat deleted"));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete chat";
    res.status(msg.includes("permissions") ? 403 : 500).json(errorResponse(msg));
  }
};
