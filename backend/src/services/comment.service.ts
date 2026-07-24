import {
  createComment as createCommentRepo,
  getComments,
  getCommentById,
  updateComment as updateCommentRepo,
  deleteComment as deleteCommentRepo,
  resolveComment as resolveCommentRepo,
  getCommentsByMention,
  getUnresolvedCommentCount,
} from "../repository/comment.repository.js";
import { getTeamMember } from "../repository/team.repository.js";
import { createActivity } from "../repository/activity.repository.js";
import type { TeamRole } from "./team.service.js";
import { hasPermission } from "./team.service.js";

export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)];
}

export const createNewComment = async (
  teamId: string,
  userId: string,
  content: string,
  repositoryId?: string,
  parentCommentId?: string
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member || !hasPermission(member.role as TeamRole, "comment")) {
    throw new Error("Insufficient permissions to comment");
  }

  const mentions = extractMentions(content);

  const comment = await createCommentRepo(
    teamId,
    userId,
    content,
    repositoryId,
    parentCommentId,
    mentions
  );

  await createActivity(teamId, userId, "comment_posted", `Comment posted`);

  return comment;
};

export const listComments = async (
  teamId: string,
  userId: string,
  options?: { repositoryId?: string; limit?: number; offset?: number }
) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return getComments(teamId, options);
};

export const getComment = async (commentId: string, userId: string) => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const member = await getTeamMember(comment.teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return comment;
};

export const editComment = async (
  commentId: string,
  userId: string,
  content: string
) => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error("You can only edit your own comments");
  }

  const mentions = extractMentions(content);
  return updateCommentRepo(commentId, content, mentions);
};

export const removeComment = async (commentId: string, userId: string) => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const member = await getTeamMember(comment.teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  if (comment.userId !== userId && !hasPermission(member.role as TeamRole, "manage")) {
    throw new Error("Insufficient permissions to delete this comment");
  }

  return deleteCommentRepo(commentId);
};

export const toggleResolveComment = async (
  commentId: string,
  userId: string,
  resolved: boolean
) => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  const member = await getTeamMember(comment.teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return resolveCommentRepo(commentId, resolved);
};

export const getMentionedComments = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return getCommentsByMention(teamId, userId);
};

export const getUnresolvedCount = async (teamId: string, userId: string) => {
  const member = await getTeamMember(teamId, userId);
  if (!member) {
    throw new Error("You are not a member of this team");
  }

  return getUnresolvedCommentCount(teamId);
};
