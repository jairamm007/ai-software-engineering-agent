export interface TeamUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export type TeamRole = "owner" | "admin" | "member" | "viewer";

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user: TeamUser;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: TeamUser;
  members: TeamMember[];
  repositories?: TeamRepository[];
  _count?: { members: number; repositories: number };
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: string;
  createdAt: string;
}

export interface TeamRepository {
  id: string;
  teamId: string;
  repositoryId: string;
  sharedBy: string;
  permission: "read" | "write" | "admin";
  sharedAt: string;
  repository: {
    id: string;
    name: string;
    githubUrl: string;
    localPath?: string;
    createdAt: string;
  };
}

export interface Comment {
  id: string;
  teamId: string;
  userId: string;
  repositoryId?: string | null;
  parentCommentId?: string | null;
  content: string;
  mentions: string[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  user: TeamUser;
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  details?: string | null;
  createdAt: string;
  user: TeamUser;
}
