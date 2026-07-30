import {
  createTeamChat,
  getTeamChats,
  getTeamChatById,
  addTeamMessage,
  deleteTeamChat,
} from "../repository/team-chat.repository.js";
import { getTeamMember } from "../repository/team.repository.js";
import { createActivity } from "../repository/activity.repository.js";
import { notifyTeamMembers } from "../repository/team-notification.repository.js";
import { askRepository } from "../services/rag.service.js";

export const createChat = async (teamId: string, userId: string, title?: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  const chat = await createTeamChat(teamId, title);
  await createActivity(teamId, userId, "chat_created", `New team chat created`);
  return chat;
};

export const listChats = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) throw new Error("You are not a member of this team");
  return getTeamChats(teamId);
};

export const getChat = async (chatId: string, userId: string) => {
  const chat = await getTeamChatById(chatId);
  if (!chat) throw new Error("Chat not found");

  const member = await getTeamMember(chat.teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  return chat;
};

export const sendMessage = async (
  chatId: string,
  userId: string,
  content: string,
  repositoryId?: string
) => {
  const chat = await getTeamChatById(chatId);
  if (!chat) throw new Error("Chat not found");

  const member = await getTeamMember(chat.teamId, userId);
  if (!member) throw new Error("You are not a member of this team");

  const userMessage = await addTeamMessage(chatId, userId, "user", content);

  let aiResponse = "I'm processing your request...";
  try {
    const response = await askRepository({
      question: content,
      repositoryId,
    });
    if (response && typeof response === "object" && "answer" in response) {
      aiResponse = (response as { answer: string }).answer;
    } else if (typeof response === "string") {
      aiResponse = response;
    }
  } catch {
    aiResponse = "I was unable to process this request. Please try again.";
  }

  const assistantMessage = await addTeamMessage(chatId, userId, "assistant", aiResponse);

  await createActivity(chat.teamId, userId, "chat_message", `Message sent in team chat`);
  await notifyTeamMembers(
    chat.teamId,
    userId,
    "chat_message",
    "New message in team chat",
    `A new message was posted in team chat`,
    `/teams/${chat.teamId}/chat`
  );

  return { userMessage, assistantMessage };
};

export const removeChat = async (chatId: string, userId: string) => {
  const chat = await getTeamChatById(chatId);
  if (!chat) throw new Error("Chat not found");

  const member = await getTeamMember(chat.teamId, userId);
  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    throw new Error("Insufficient permissions to delete chat");
  }

  await deleteTeamChat(chatId);
  return true;
};
