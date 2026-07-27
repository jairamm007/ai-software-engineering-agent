import api from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────

export interface AdminStats {
  stats: {
    totalUsers: number;
    totalRepos: number;
    totalConversations: number;
    totalFiles: number;
    totalChunks: number;
    newUsersToday: number;
    newUsers7Days: number;
    newUsers30Days: number;
    reposLast7Days: number;
    suspendedUsers: number;
    adminCount: number;
    activeSessions: number;
    conversationsToday: number;
    storageUsedMB: number;
  };
  charts: {
    usersByDay: { date: string; count: number }[];
    reposByDay: { date: string; count: number }[];
  };
  recent: {
    users: { id: string; name: string; email: string; image: string | null; role: string | null; createdAt: string }[];
    repositories: { id: string; name: string; githubUrl: string; createdAt: string; userId: string }[];
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string | null;
  suspended: boolean;
  emailVerified: boolean;
  createdAt: string;
  repositoryCount: number;
  conversationCount: number;
}

export interface AdminUserDetail extends AdminUser {
  bannerUrl: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  updatedAt: string;
  comments: number;
  sessions: number;
}

export interface AdminRepository {
  id: string;
  name: string;
  githubUrl: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  fileCount: number;
}

export interface RepositoryStats {
  totalRepos: number;
  totalFiles: number;
  totalChunks: number;
  totalStorageBytes: number;
  totalStorageMB: string;
  storageByRepo: { name: string; totalSize: number; fileCount: number }[];
  filesByExtension: { extension: string; count: number }[];
}

export interface AIStats {
  totalConversations: number;
  totalMessages: number;
  aiResponses: number;
  userMessages: number;
  conversationsLast24h: number;
  conversationsLast7d: number;
  messagesByDay: { date: string; count: number }[];
  providers: { name: string; tier: string; status: string; model: string }[];
}

export interface AnalyticsData {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  languages: { extension: string; count: number }[];
  aiUsageByDay: { date: string; count: number }[];
  storageByDay: { date: string; totalSize: number }[];
}

export interface SecurityData {
  activeSessions: {
    id: string;
    createdAt: string;
    expiresAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
    user: { name: string; email: string };
  }[];
  auditLogs: {
    id: string;
    action: string;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
    user: { name: string; email: string } | null;
  }[];
  suspendedUsers: { id: string; name: string; email: string; createdAt: string }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export interface SystemHealth {
  status: string;
  checks: { name: string; status: string; latencyMs: number }[];
  uptime: number;
  memoryUsage: { rss: number; heapUsed: number; heapTotal: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface AdminAdmin {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  suspended: boolean;
}

export interface AdminDoc {
  id: string;
  title: string;
  format: string;
  status: string;
  createdAt: string;
  repository: { id: string; name: string };
}

export interface AdminReview {
  id: string;
  status: string;
  summary: string | null;
  issuesFound: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  createdAt: string;
  repository: { id: string; name: string };
  user: { id: string; name: string } | null;
}

export interface AdminTestReport {
  id: string;
  status: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number | null;
  createdAt: string;
  repository: { id: string; name: string };
  user: { id: string; name: string } | null;
}

export interface AdminSupportMessage {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

export interface AdminBackup {
  id: string;
  filename: string;
  size: number;
  status: string;
  type: string;
  note: string | null;
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  bannerUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  role: string | null;
  createdAt: string;
}

// ─── API Functions ────────────────────────────────────────────────

// Dashboard
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get("/admin/stats");
  return response.data.data;
};

// Users
export const listUsers = async (params?: { search?: string; role?: string; suspended?: string; page?: number; limit?: number }): Promise<{ users: AdminUser[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get("/admin/users", { params });
  return response.data.data;
};

export const getAdminUser = async (userId: string): Promise<AdminUserDetail> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data.data;
};

export const updateUser = async (userId: string, data: { name?: string; role?: string }): Promise<{ id: string; name: string; email: string; role: string }> => {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

export const suspendUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/suspend`);
};

export const activateUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/activate`);
};

export const promoteUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/promote`);
};

export const demoteUser = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/demote`);
};

export const forceLogoutAllUserSessions = async (userId: string): Promise<void> => {
  await api.post(`/admin/users/${userId}/logout-all`);
};

// Repositories
export const listAllRepositories = async (params?: { search?: string; page?: number; limit?: number }): Promise<{ repositories: AdminRepository[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get("/admin/repositories", { params });
  return response.data.data;
};

export const getRepositoryStats = async (): Promise<RepositoryStats> => {
  const response = await api.get("/admin/repositories/stats");
  return response.data.data;
};

export const deleteRepository = async (repoId: string): Promise<void> => {
  await api.delete(`/admin/repositories/${repoId}`);
};

// AI
export const getAIStats = async (): Promise<AIStats> => {
  const response = await api.get("/admin/ai/stats");
  return response.data.data;
};

// Analytics
export const getAnalytics = async (): Promise<AnalyticsData> => {
  const response = await api.get("/admin/analytics");
  return response.data.data;
};

// Security
export const getSecurityLogs = async (): Promise<SecurityData> => {
  const response = await api.get("/admin/security");
  return response.data.data;
};

export const forceLogoutSession = async (sessionId: string): Promise<void> => {
  await api.post(`/admin/security/sessions/${sessionId}/force-logout`);
};

// Notifications
export const listNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/admin/notifications");
  return response.data.data;
};

export const createNotification = async (data: { title: string; message: string; type: string }): Promise<Notification> => {
  const response = await api.post("/admin/notifications", data);
  return response.data.data;
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await api.delete(`/admin/notifications/${notificationId}`);
};

// Settings
export const getSystemSettings = async (): Promise<Record<string, string>> => {
  const response = await api.get("/admin/settings");
  return response.data.data;
};

export const updateSystemSettings = async (settings: Record<string, string>): Promise<void> => {
  await api.put("/admin/settings", { settings });
};

// Health
export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get("/admin/health");
  return response.data.data;
};

// Reports
export const generateReport = async (type: string): Promise<Record<string, unknown>> => {
  const response = await api.get(`/admin/reports/${type}`);
  return response.data.data;
};

// Admin Management
export const listAdmins = async (): Promise<AdminAdmin[]> => {
  const response = await api.get("/admin/admins");
  return response.data.data;
};

// Documentation
export const listDocumentations = async (params?: { page?: number; limit?: number; repositoryId?: string }): Promise<{ docs: AdminDoc[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get("/admin/docs", { params });
  return response.data.data;
};
export const createDocumentation = async (data: { repositoryId: string; title: string; format?: string }): Promise<AdminDoc> => {
  const response = await api.post("/admin/docs", data);
  return response.data.data;
};
export const deleteDocumentation = async (docId: string): Promise<void> => {
  await api.delete(`/admin/docs/${docId}`);
};

// Code Reviews
export const listCodeReviews = async (params?: { page?: number; limit?: number; repositoryId?: string }): Promise<{ reviews: AdminReview[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get("/admin/reviews", { params });
  return response.data.data;
};
export const createCodeReview = async (data: { repositoryId: string }): Promise<AdminReview> => {
  const response = await api.post("/admin/reviews", data);
  return response.data.data;
};
export const deleteCodeReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/admin/reviews/${reviewId}`);
};

// Testing
export const listTestReports = async (params?: { page?: number; limit?: number; repositoryId?: string }): Promise<{ reports: AdminTestReport[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get("/admin/tests", { params });
  return response.data.data;
};
export const createTestReport = async (data: { repositoryId: string }): Promise<AdminTestReport> => {
  const response = await api.post("/admin/tests", data);
  return response.data.data;
};
export const deleteTestReport = async (reportId: string): Promise<void> => {
  await api.delete(`/admin/tests/${reportId}`);
};

// Support
export const listSupportMessages = async (params?: { page?: number; limit?: number; status?: string; category?: string }): Promise<{ messages: AdminSupportMessage[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get("/admin/support", { params });
  return response.data.data;
};
export const replyToSupportMessage = async (messageId: string, reply: string): Promise<void> => {
  await api.post(`/admin/support/${messageId}/reply`, { reply });
};
export const updateSupportMessageStatus = async (messageId: string, status: string): Promise<void> => {
  await api.put(`/admin/support/${messageId}/status`, { status });
};
export const deleteSupportMessage = async (messageId: string): Promise<void> => {
  await api.delete(`/admin/support/${messageId}`);
};

// Backups
export const listBackups = async (): Promise<AdminBackup[]> => {
  const response = await api.get("/admin/backups");
  return response.data.data;
};
export const createBackup = async (): Promise<AdminBackup> => {
  const response = await api.post("/admin/backups");
  return response.data.data;
};
export const deleteBackup = async (backupId: string): Promise<void> => {
  await api.delete(`/admin/backups/${backupId}`);
};

// Activity Logs
export const listActivityLogs = async (params?: { page?: number; limit?: number; action?: string; userId?: string }): Promise<{ logs: AdminActivityLog[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
  const response = await api.get("/admin/activity-logs", { params });
  return response.data.data;
};

// Profile
export const getAdminProfile = async (): Promise<AdminProfile> => {
  const response = await api.get("/admin/profile");
  return response.data.data;
};
export const updateAdminProfile = async (data: Partial<Pick<AdminProfile, "name" | "bio" | "image" | "bannerUrl" | "linkedinUrl" | "githubUrl" | "portfolioUrl">>): Promise<AdminProfile> => {
  const response = await api.put("/admin/profile", data);
  return response.data.data;
};
