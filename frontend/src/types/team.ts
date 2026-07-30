export interface TeamUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  userCode?: string;
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
  teamCode: string;
  description?: string | null;
  logo?: string | null;
  visibility: string;
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

export interface SharedDocument {
  id: string;
  teamId: string;
  authorId: string;
  title: string;
  content?: string | null;
  format: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: TeamUser;
}

export interface TeamCodeReview {
  id: string;
  repositoryId: string;
  teamId?: string | null;
  userId?: string | null;
  status: string;
  summary?: string | null;
  issuesFound: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  createdAt: string;
  repository: { id: string; name: string };
  user?: TeamUser | null;
}

export interface SearchedUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  userCode: string;
}

export interface TeamTestReport {
  id: string;
  repositoryId: string;
  teamId?: string | null;
  userId?: string | null;
  status: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage?: number | null;
  createdAt: string;
  repository: { id: string; name: string };
  user?: TeamUser | null;
}
