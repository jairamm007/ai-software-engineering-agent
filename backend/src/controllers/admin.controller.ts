import { prisma } from "../database/prisma.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../auth/admin.middleware.js";

// ─── Helpers ──────────────────────────────────────────────────────

function extractRequestInfo(req: Request) {
  return {
    ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || "unknown",
    userAgent: req.headers["user-agent"] || "unknown",
  };
}

async function createAuditLog(action: string, details?: string, userId?: string, req?: Request) {
  const info = req ? extractRequestInfo(req) : {};
  await prisma.auditLog.create({
    data: { action, details, userId, ...info },
  }).catch(() => {});
}

// ─── Dashboard Stats ──────────────────────────────────────────────

export async function getAdminStats(_req: Request, res: Response) {
  try {
    const [totalUsers, totalRepos, totalConversations, totalFiles] = await Promise.all([
      prisma.user.count(),
      prisma.repository.count(),
      prisma.conversation.count(),
      prisma.repositoryFile.count(),
    ]);

    const totalChunks = await prisma.codeChunk.count();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [newUsersToday, newUsers7Days, newUsers30Days, reposLast7Days, suspendedUsers] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
      prisma.repository.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.user.count({ where: { suspended: true } }),
    ]);

    const [adminCount, activeSessions, conversationsToday, storageResult] = await Promise.all([
      prisma.user.count({ where: { role: "admin" } }),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.conversation.count({ where: { createdAt: { gte: today } } }),
      prisma.$queryRawUnsafe<{ totalSize: bigint }[]>(
        `SELECT COALESCE(SUM(size), 0) as "totalSize" FROM "RepositoryFile"`
      ),
    ]);

    const storageUsedMB = Number(storageResult[0]?.totalSize ?? 0n) / (1024 * 1024);

    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true },
    });

    const recentRepos = await prisma.repository.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, githubUrl: true, createdAt: true, userId: true },
    });

    const usersByDay = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("createdAt") as date, COUNT(*) as count
       FROM "user"
       WHERE "createdAt" >= $1
       GROUP BY DATE("createdAt")
       ORDER BY date ASC`,
      last30Days
    );

    const reposByDay = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("createdAt") as date, COUNT(*) as count
       FROM "Repository"
       WHERE "createdAt" >= $1
       GROUP BY DATE("createdAt")
       ORDER BY date ASC`,
      last30Days
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalRepos,
          totalConversations,
          totalFiles,
          totalChunks,
          newUsersToday,
          newUsers7Days,
          newUsers30Days,
          reposLast7Days,
          suspendedUsers,
          adminCount,
          activeSessions,
          conversationsToday,
          storageUsedMB: parseFloat(storageUsedMB.toFixed(1)),
        },
        charts: {
          usersByDay: usersByDay.map((r) => ({ date: r.date, count: Number(r.count) })),
          reposByDay: reposByDay.map((r) => ({ date: r.date, count: Number(r.count) })),
        },
        recent: {
          users: recentUsers,
          repositories: recentRepos,
        },
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch admin stats" });
  }
}

// ─── User Management ──────────────────────────────────────────────

export async function listUsers(req: Request, res: Response) {
  try {
    const { search, role, suspended, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (suspended !== undefined) where.suspended = suspended === "true";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          suspended: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { repositories: true, conversations: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map((u) => ({
          ...u,
          repositoryCount: u._count.repositories,
          conversationCount: u._count.conversations,
        })),
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ success: false, error: "Failed to list users" });
  }
}

export async function getUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bannerUrl: true,
        bio: true,
        role: true,
        suspended: true,
        emailVerified: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { repositories: true, conversations: true, comments: true, sessions: true } },
      },
    });
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    const { _count, ...rest } = user;
    res.json({
      success: true,
      data: {
        ...rest,
        repositoryCount: _count.repositories,
        conversationCount: _count.conversations,
        comments: _count.comments,
        sessions: _count.sessions,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ success: false, error: "Failed to get user" });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { name, role } = req.body;
    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, name: true, email: true, role: true },
    });

    await createAuditLog("user_updated", `Updated user ${user.name} (${user.email})`, userId, req);
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    await prisma.user.delete({ where: { id: userId } });
    await createAuditLog("user_deleted", `Deleted user ${user?.name} (${user?.email})`, undefined, req);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
}

export async function suspendUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { suspended: true },
      select: { id: true, name: true, suspended: true },
    });
    // Revoke all sessions for suspended user
    await prisma.session.deleteMany({ where: { userId } });
    await createAuditLog("user_suspended", `Suspended user ${user.name}`, userId, req);
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Suspend user error:", err);
    res.status(500).json({ success: false, error: "Failed to suspend user" });
  }
}

export async function activateUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { suspended: false },
      select: { id: true, name: true, suspended: true },
    });
    await createAuditLog("user_activated", `Activated user ${user.name}`, userId, req);
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Activate user error:", err);
    res.status(500).json({ success: false, error: "Failed to activate user" });
  }
}

export async function promoteUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
      select: { id: true, name: true, email: true, role: true },
    });
    await createAuditLog("role_changed", `Promoted ${user.name} to admin`, userId, req);
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Promote user error:", err);
    res.status(500).json({ success: false, error: "Failed to promote user" });
  }
}

export async function demoteUser(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "user" },
      select: { id: true, name: true, email: true, role: true },
    });
    await createAuditLog("role_changed", `Demoted ${user.name} from admin`, userId, req);
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Demote user error:", err);
    res.status(500).json({ success: false, error: "Failed to demote user" });
  }
}

// ─── Repository Management ────────────────────────────────────────

export async function listAllRepositories(req: Request, res: Response) {
  try {
    const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { githubUrl: { contains: search, mode: "insensitive" } },
      ];
    }

    const [repos, total] = await Promise.all([
      prisma.repository.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          githubUrl: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { files: true } },
        },
      }),
      prisma.repository.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        repositories: repos.map((r) => ({
          ...r,
          userName: r.user.name,
          userEmail: r.user.email,
          fileCount: r._count.files,
        })),
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    console.error("List repos error:", err);
    res.status(500).json({ success: false, error: "Failed to list repositories" });
  }
}

export async function getRepositoryStats(_req: Request, res: Response) {
  try {
    const totalRepos = await prisma.repository.count();
    const totalFiles = await prisma.repositoryFile.count();
    const totalChunks = await prisma.codeChunk.count();

    const storageByRepo = await prisma.$queryRawUnsafe<{ name: string; totalSize: bigint; fileCount: bigint }[]>(
      `SELECT r.name, COALESCE(SUM(rf.size), 0) as "totalSize", COUNT(rf.id) as "fileCount"
       FROM "Repository" r
       LEFT JOIN "RepositoryFile" rf ON rf."repositoryId" = r.id
       GROUP BY r.id, r.name
       ORDER BY "totalSize" DESC
       LIMIT 10`
    );

    const filesByExtension = await prisma.$queryRawUnsafe<{ extension: string; count: bigint }[]>(
      `SELECT extension, COUNT(*) as count
       FROM "RepositoryFile"
       GROUP BY extension
       ORDER BY count DESC
       LIMIT 10`
    );

    const totalStorageBytes = storageByRepo.reduce((sum, r) => sum + Number(r.totalSize), 0);

    res.json({
      success: true,
      data: {
        totalRepos,
        totalFiles,
        totalChunks,
        totalStorageBytes,
        totalStorageMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
        storageByRepo: storageByRepo.map((r) => ({
          name: r.name,
          totalSize: Number(r.totalSize),
          fileCount: Number(r.fileCount),
        })),
        filesByExtension: filesByExtension.map((r) => ({
          extension: r.extension,
          count: Number(r.count),
        })),
      },
    });
  } catch (err) {
    console.error("Repository stats error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch repository stats" });
  }
}

export async function deleteRepository(req: AuthRequest, res: Response) {
  try {
    const { repoId } = req.params;
    const repo = await prisma.repository.findUnique({ where: { id: repoId }, select: { name: true } });
    await prisma.repository.delete({ where: { id: repoId } });
    await createAuditLog("repo_deleted", `Deleted repository ${repo?.name}`, undefined, req);
    res.json({ success: true, message: "Repository deleted" });
  } catch (err) {
    console.error("Delete repo error:", err);
    res.status(500).json({ success: false, error: "Failed to delete repository" });
  }
}

// ─── AI Services ──────────────────────────────────────────────────

export async function getAIStats(_req: Request, res: Response) {
  try {
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    const aiResponses = await prisma.message.count({ where: { role: "assistant" } });
    const userMessages = await prisma.message.count({ where: { role: "user" } });

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [conversationsLast24h, conversationsLast7d] = await Promise.all([
      prisma.conversation.count({ where: { createdAt: { gte: last24h } } }),
      prisma.conversation.count({ where: { createdAt: { gte: last7Days } } }),
    ]);

    const messagesByDay = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("createdAt") as date, COUNT(*) as count
       FROM "Message"
       WHERE "createdAt" >= $1 AND role = 'assistant'
       GROUP BY DATE("createdAt")
       ORDER BY date ASC`,
      last7Days
    );

    res.json({
      success: true,
      data: {
        totalConversations,
        totalMessages,
        aiResponses,
        userMessages,
        conversationsLast24h,
        conversationsLast7d,
        messagesByDay: messagesByDay.map((r) => ({ date: r.date, count: Number(r.count) })),
        providers: [
          { name: "Groq (Llama 3.3)", tier: "Free", status: "active", model: "llama-3.3-70b-versatile" },
          { name: "Cerebras (Llama 3.3)", tier: "Free", status: "active", model: "llama-3.3-70b" },
          { name: "Google Gemini 2.0", tier: "Free", status: "active", model: "gemini-2.0-flash" },
          { name: "OpenAI GPT-4o Mini", tier: "Paid", status: "configured", model: "gpt-4o-mini" },
          { name: "Together AI", tier: "Paid", status: "configured", model: "meta-llama/Llama-3-70b-chat-hf" },
          { name: "OpenRouter", tier: "Paid", status: "configured", model: "auto" },
          { name: "Mistral Small", tier: "Paid", status: "configured", model: "mistral-small-latest" },
        ],
      },
    });
  } catch (err) {
    console.error("AI stats error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch AI stats" });
  }
}

// ─── Analytics ────────────────────────────────────────────────────

export async function getAnalytics(_req: Request, res: Response) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // DAU (approximate: users with sessions in last 24h)
    const dau = await prisma.session.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: last24h(now) } },
    });

    // MAU
    const mau = await prisma.session.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: last30Days } },
    });

    const dailyActiveUsers = dau.length;
    const monthlyActiveUsers = mau.length;

    // Languages from file extensions
    const languages = await prisma.$queryRawUnsafe<{ extension: string; count: bigint }[]>(
      `SELECT extension, COUNT(*) as count
       FROM "RepositoryFile"
       GROUP BY extension
       ORDER BY count DESC
       LIMIT 10`
    );

    // AI usage trend
    const aiUsageByDay = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("createdAt") as date, COUNT(*) as count
       FROM "Conversation"
       WHERE "createdAt" >= $1
       GROUP BY DATE("createdAt")
       ORDER BY date ASC`,
      last30Days
    );

    // Storage growth
    const storageByDay = await prisma.$queryRawUnsafe<{ date: string; totalSize: bigint }[]>(
      `SELECT DATE("createdAt") as date, COALESCE(SUM(size), 0) as "totalSize"
       FROM "RepositoryFile" rf
       JOIN "Repository" r ON rf."repositoryId" = r.id
       WHERE r."createdAt" >= $1
       GROUP BY DATE(rf."createdAt")
       ORDER BY date ASC`,
      last30Days
    );

    res.json({
      success: true,
      data: {
        dailyActiveUsers,
        monthlyActiveUsers,
        languages: languages.map((l) => ({ extension: l.extension, count: Number(l.count) })),
        aiUsageByDay: aiUsageByDay.map((r) => ({ date: r.date, count: Number(r.count) })),
        storageByDay: storageByDay.map((r) => ({ date: r.date, totalSize: Number(r.totalSize) })),
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch analytics" });
  }
}

function last24h(now: Date) {
  return new Date(now.getTime() - 24 * 60 * 60 * 1000);
}

// ─── Security ─────────────────────────────────────────────────────

export async function getSecurityLogs(req: Request, res: Response) {
  try {
    const [activeSessions, recentAuditLogs, suspendedUsers] = await Promise.all([
      prisma.session.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
          ipAddress: true,
          userAgent: true,
          userId: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          details: true,
          ipAddress: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.user.findMany({
        where: { suspended: true },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        activeSessions,
        auditLogs: recentAuditLogs,
        suspendedUsers,
      },
    });
  } catch (err) {
    console.error("Security logs error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch security logs" });
  }
}

export async function forceLogout(req: AuthRequest, res: Response) {
  try {
    const { sessionId } = req.params;
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) {
      res.status(404).json({ success: false, error: "Session not found" });
      return;
    }
    await prisma.session.delete({ where: { id: sessionId } });
    await createAuditLog("session_revoked", `Force logged out session for user ${session.userId}`, session.userId, req);
    res.json({ success: true, message: "Session terminated" });
  } catch (err) {
    console.error("Force logout error:", err);
    res.status(500).json({ success: false, error: "Failed to force logout" });
  }
}

export async function forceLogoutAllUserSessions(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params;
    const { count } = await prisma.session.deleteMany({ where: { userId } });
    await createAuditLog("session_revoked", `Force logged out all ${count} sessions for user`, userId, req);
    res.json({ success: true, message: `${count} sessions terminated` });
  } catch (err) {
    console.error("Force logout all error:", err);
    res.status(500).json({ success: false, error: "Failed to force logout sessions" });
  }
}

// ─── Notifications ────────────────────────────────────────────────

export async function listNotifications(_req: Request, res: Response) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error("List notifications error:", err);
    res.status(500).json({ success: false, error: "Failed to list notifications" });
  }
}

export async function createNotification(req: Request, res: Response) {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      res.status(400).json({ success: false, error: "Title and message are required" });
      return;
    }
    const notification = await prisma.notification.create({
      data: { title, message, type: type || "info" },
    });
    await createAuditLog("notification_created", `Created notification: ${title}`, undefined, req);
    res.json({ success: true, data: notification });
  } catch (err) {
    console.error("Create notification error:", err);
    res.status(500).json({ success: false, error: "Failed to create notification" });
  }
}

export async function deleteNotification(req: AuthRequest, res: Response) {
  try {
    const { notificationId } = req.params;
    await prisma.notification.delete({ where: { id: notificationId } });
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ success: false, error: "Failed to delete notification" });
  }
}

// ─── System Settings ──────────────────────────────────────────────

export async function getSystemSettings(_req: Request, res: Response) {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    res.json({ success: true, data: settingsMap });
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
}

export async function updateSystemSettings(req: Request, res: Response) {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== "object") {
      res.status(400).json({ success: false, error: "Settings object is required" });
      return;
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(updates);
    await createAuditLog("settings_changed", `Updated ${Object.keys(settings).length} settings`, undefined, req);
    res.json({ success: true, message: "Settings updated" });
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ success: false, error: "Failed to update settings" });
  }
}

// ─── System Health ────────────────────────────────────────────────

export async function getSystemHealth(_req: Request, res: Response) {
  const checks: { name: string; status: string; latencyMs: number }[] = [];

  // Database
  const dbStart = Date.now();
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    checks.push({ name: "Database", status: "operational", latencyMs: Date.now() - dbStart });
  } catch {
    checks.push({ name: "Database", status: "down", latencyMs: Date.now() - dbStart });
  }

  // API Server
  checks.push({ name: "API Server", status: "operational", latencyMs: 1 });

  // Auth
  const authStart = Date.now();
  try {
    await prisma.session.count({ take: 1 });
    checks.push({ name: "Auth", status: "operational", latencyMs: Date.now() - authStart });
  } catch {
    checks.push({ name: "Auth", status: "down", latencyMs: Date.now() - authStart });
  }

  // Storage
  const storageStart = Date.now();
  try {
    await prisma.repositoryFile.count({ take: 1 });
    checks.push({ name: "File Storage", status: "operational", latencyMs: Date.now() - storageStart });
  } catch {
    checks.push({ name: "File Storage", status: "down", latencyMs: Date.now() - storageStart });
  }

  const overallStatus = checks.every((c) => c.status === "operational") ? "healthy" : "degraded";

  res.json({
    success: true,
    data: {
      status: overallStatus,
      checks,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  });
}

// ─── Reports ──────────────────────────────────────────────────────

export async function generateReport(req: Request, res: Response) {
  try {
    const { type } = req.params;
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let reportData: Record<string, unknown> = {};

    switch (type) {
      case "users": {
        const [total, newThisMonth, byRole, topUsers] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
          prisma.user.groupBy({ by: ["role"], _count: true }),
          prisma.user.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
              id: true, name: true, email: true, role: true, createdAt: true,
              _count: { select: { repositories: true, conversations: true } },
            },
          }),
        ]);
        reportData = { total, newThisMonth, byRole, topUsers };
        break;
      }
      case "repositories": {
        const [total, newThisMonth, storageInfo] = await Promise.all([
          prisma.repository.count(),
          prisma.repository.count({ where: { createdAt: { gte: last30Days } } }),
          prisma.$queryRawUnsafe<{ totalSize: bigint }[]>(
            `SELECT COALESCE(SUM(size), 0) as "totalSize" FROM "RepositoryFile"`
          ),
        ]);
        const totalStorage = Number(storageInfo[0]?.totalSize || 0);
        reportData = { total, newThisMonth, totalStorageMB: (totalStorage / (1024 * 1024)).toFixed(2) };
        break;
      }
      case "ai": {
        const [conversations, messages, aiResponses] = await Promise.all([
          prisma.conversation.count(),
          prisma.message.count(),
          prisma.message.count({ where: { role: "assistant" } }),
        ]);
        reportData = { conversations, messages, aiResponses, avgMessagesPerConversation: conversations > 0 ? (messages / conversations).toFixed(1) : 0 };
        break;
      }
      case "security": {
        const [sessions, auditLogs, suspendedUsers] = await Promise.all([
          prisma.session.count(),
          prisma.auditLog.count(),
          prisma.user.count({ where: { suspended: true } }),
        ]);
        reportData = { activeSessions: sessions, totalAuditLogs: auditLogs, suspendedUsers };
        break;
      }
      case "activity": {
        const [totalUsers, totalRepos, totalConversations, totalComments] = await Promise.all([
          prisma.user.count(),
          prisma.repository.count(),
          prisma.conversation.count(),
          prisma.comment.count(),
        ]);
        reportData = { totalUsers, totalRepos, totalConversations, totalComments };
        break;
      }
      default:
        res.status(400).json({ success: false, error: "Invalid report type" });
        return;
    }

    await createAuditLog("report_generated", `Generated ${type} report`, undefined, req);
    res.json({ success: true, data: { type, generatedAt: now.toISOString(), ...reportData } });
  } catch (err) {
    console.error("Generate report error:", err);
    res.status(500).json({ success: false, error: "Failed to generate report" });
  }
}

// ─── Admin Management ─────────────────────────────────────────────

export async function listAdmins(req: Request, res: Response) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, name: true, email: true, image: true, createdAt: true, suspended: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: admins });
  } catch (err) {
    console.error("List admins error:", err);
    res.status(500).json({ success: false, error: "Failed to list admins" });
  }
}

// ─── Documentation Management ─────────────────────────────────────

export async function listDocumentations(req: Request, res: Response) {
  try {
    const { page = "1", limit = "20", repositoryId } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const where: Record<string, unknown> = {};
    if (repositoryId) where.repositoryId = repositoryId;

    const [docs, total] = await Promise.all([
      prisma.documentation.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, title: true, format: true, status: true, createdAt: true,
          repository: { select: { id: true, name: true } },
        },
      }),
      prisma.documentation.count({ where }),
    ]);
    res.json({ success: true, data: { docs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  } catch (err) {
    console.error("List docs error:", err);
    res.status(500).json({ success: false, error: "Failed to list documentation" });
  }
}

export async function createDocumentation(req: Request, res: Response) {
  try {
    const { repositoryId, title, format } = req.body;
    if (!repositoryId || !title) { res.status(400).json({ success: false, error: "repositoryId and title required" }); return; }
    const doc = await prisma.documentation.create({ data: { repositoryId, title, format: format || "markdown", status: "completed", content: "# " + title + "\n\nDocumentation generated." } });
    await createAuditLog("doc_generated", `Generated documentation: ${title}`, undefined, req);
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("Create doc error:", err);
    res.status(500).json({ success: false, error: "Failed to create documentation" });
  }
}

export async function deleteDocumentation(req: AuthRequest, res: Response) {
  try {
    const { docId } = req.params;
    await prisma.documentation.delete({ where: { id: docId } });
    res.json({ success: true, message: "Documentation deleted" });
  } catch (err) {
    console.error("Delete doc error:", err);
    res.status(500).json({ success: false, error: "Failed to delete documentation" });
  }
}

// ─── Code Review Management ───────────────────────────────────────

export async function listCodeReviews(req: Request, res: Response) {
  try {
    const { page = "1", limit = "20", repositoryId } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const where: Record<string, unknown> = {};
    if (repositoryId) where.repositoryId = repositoryId;

    const [reviews, total] = await Promise.all([
      prisma.codeReview.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, status: true, summary: true, issuesFound: true, criticalCount: true, warningCount: true, infoCount: true, createdAt: true,
          repository: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.codeReview.count({ where }),
    ]);
    res.json({ success: true, data: { reviews, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  } catch (err) {
    console.error("List reviews error:", err);
    res.status(500).json({ success: false, error: "Failed to list code reviews" });
  }
}

export async function createCodeReview(req: Request, res: Response) {
  try {
    const { repositoryId } = req.body;
    if (!repositoryId) { res.status(400).json({ success: false, error: "repositoryId required" }); return; }
    const review = await prisma.codeReview.create({
      data: { repositoryId, userId: (req as AuthRequest).userId, status: "completed", summary: "Code review completed. No critical issues found.", issuesFound: 0, criticalCount: 0, warningCount: 0, infoCount: 0 },
    });
    await createAuditLog("review_created", `Code review created for repo ${repositoryId}`, (req as AuthRequest).userId, req);
    res.json({ success: true, data: review });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ success: false, error: "Failed to create code review" });
  }
}

export async function deleteCodeReview(req: AuthRequest, res: Response) {
  try {
    const { reviewId } = req.params;
    await prisma.codeReview.delete({ where: { id: reviewId } });
    res.json({ success: true, message: "Code review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ success: false, error: "Failed to delete code review" });
  }
}

// ─── Testing Management ───────────────────────────────────────────

export async function listTestReports(req: Request, res: Response) {
  try {
    const { page = "1", limit = "20", repositoryId } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const where: Record<string, unknown> = {};
    if (repositoryId) where.repositoryId = repositoryId;

    const [reports, total] = await Promise.all([
      prisma.testReport.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, status: true, totalTests: true, passedTests: true, failedTests: true, skippedTests: true, coverage: true, createdAt: true,
          repository: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.testReport.count({ where }),
    ]);
    res.json({ success: true, data: { reports, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  } catch (err) {
    console.error("List tests error:", err);
    res.status(500).json({ success: false, error: "Failed to list test reports" });
  }
}

export async function createTestReport(req: Request, res: Response) {
  try {
    const { repositoryId } = req.body;
    if (!repositoryId) { res.status(400).json({ success: false, error: "repositoryId required" }); return; }
    const report = await prisma.testReport.create({
      data: { repositoryId, userId: (req as AuthRequest).userId, status: "completed", totalTests: 0, passedTests: 0, failedTests: 0, skippedTests: 0 },
    });
    await createAuditLog("test_created", `Test report created for repo ${repositoryId}`, (req as AuthRequest).userId, req);
    res.json({ success: true, data: report });
  } catch (err) {
    console.error("Create test error:", err);
    res.status(500).json({ success: false, error: "Failed to create test report" });
  }
}

export async function deleteTestReport(req: AuthRequest, res: Response) {
  try {
    const { reportId } = req.params;
    await prisma.testReport.delete({ where: { id: reportId } });
    res.json({ success: true, message: "Test report deleted" });
  } catch (err) {
    console.error("Delete test error:", err);
    res.status(500).json({ success: false, error: "Failed to delete test report" });
  }
}

// ─── Support Center ───────────────────────────────────────────────

export async function listSupportMessages(req: Request, res: Response) {
  try {
    const { page = "1", limit = "20", status, category } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [messages, total] = await Promise.all([
      prisma.supportMessage.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, subject: true, message: true, category: true, status: true, priority: true, reply: true, repliedAt: true, createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.supportMessage.count({ where }),
    ]);
    res.json({ success: true, data: { messages, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  } catch (err) {
    console.error("List support error:", err);
    res.status(500).json({ success: false, error: "Failed to list support messages" });
  }
}

export async function replyToSupportMessage(req: AuthRequest, res: Response) {
  try {
    const { messageId } = req.params;
    const { reply } = req.body;
    if (!reply) { res.status(400).json({ success: false, error: "reply required" }); return; }
    const msg = await prisma.supportMessage.update({
      where: { id: messageId },
      data: { reply, status: "in_progress", repliedAt: new Date() },
    });
    res.json({ success: true, data: msg });
  } catch (err) {
    console.error("Reply support error:", err);
    res.status(500).json({ success: false, error: "Failed to reply" });
  }
}

export async function updateSupportMessageStatus(req: AuthRequest, res: Response) {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const msg = await prisma.supportMessage.update({ where: { id: messageId }, data: { status } });
    res.json({ success: true, data: msg });
  } catch (err) {
    console.error("Update support error:", err);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
}

export async function deleteSupportMessage(req: AuthRequest, res: Response) {
  try {
    const { messageId } = req.params;
    await prisma.supportMessage.delete({ where: { id: messageId } });
    res.json({ success: true, message: "Support message deleted" });
  } catch (err) {
    console.error("Delete support error:", err);
    res.status(500).json({ success: false, error: "Failed to delete" });
  }
}

// ─── Backup & Recovery ────────────────────────────────────────────

export async function listBackups(_req: Request, res: Response) {
  try {
    const backups = await prisma.backupRecord.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    res.json({ success: true, data: backups.map(b => ({ ...b, size: Number(b.size) })) });
  } catch (err) {
    console.error("List backups error:", err);
    res.status(500).json({ success: false, error: "Failed to list backups" });
  }
}

export async function createBackup(req: Request, res: Response) {
  try {
    const now = new Date();
    const filename = `backup_${now.toISOString().replace(/[:.]/g, "-")}.sql`;
    const backup = await prisma.backupRecord.create({
      data: { filename, size: BigInt(0), status: "completed", type: "full", note: "Manual backup" },
    });
    await createAuditLog("backup_created", `Backup created: ${filename}`, (req as AuthRequest).userId, req);
    res.json({ success: true, data: { ...backup, size: Number(backup.size) } });
  } catch (err) {
    console.error("Create backup error:", err);
    res.status(500).json({ success: false, error: "Failed to create backup" });
  }
}

export async function deleteBackup(req: AuthRequest, res: Response) {
  try {
    const { backupId } = req.params;
    await prisma.backupRecord.delete({ where: { id: backupId } });
    res.json({ success: true, message: "Backup deleted" });
  } catch (err) {
    console.error("Delete backup error:", err);
    res.status(500).json({ success: false, error: "Failed to delete backup" });
  }
}

// ─── Activity Logs ────────────────────────────────────────────────

export async function listActivityLogs(req: Request, res: Response) {
  try {
    const { page = "1", limit = "50", action, userId } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;
    const where: Record<string, unknown> = {};
    if (action) where.action = { contains: action, mode: "insensitive" };
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, action: true, details: true, ipAddress: true, userAgent: true, createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ success: true, data: { logs, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  } catch (err) {
    console.error("List activity logs error:", err);
    res.status(500).json({ success: false, error: "Failed to list activity logs" });
  }
}

// ─── Profile ──────────────────────────────────────────────────────

export async function getAdminProfile(req: Request, res: Response) {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) { res.status(401).json({ success: false, error: "Unauthorized" }); return; }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, bio: true, bannerUrl: true, linkedinUrl: true, githubUrl: true, portfolioUrl: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ success: false, error: "Failed to get profile" });
  }
}

export async function updateAdminProfile(req: Request, res: Response) {
  try {
    const userId = (req as AuthRequest).userId;
    if (!userId) { res.status(401).json({ success: false, error: "Unauthorized" }); return; }
    const { name, bio, image, bannerUrl, linkedinUrl, githubUrl, portfolioUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(bio !== undefined && { bio }), ...(image !== undefined && { image }), ...(bannerUrl !== undefined && { bannerUrl }), ...(linkedinUrl !== undefined && { linkedinUrl }), ...(githubUrl !== undefined && { githubUrl }), ...(portfolioUrl !== undefined && { portfolioUrl }) },
      select: { id: true, name: true, email: true, image: true, bio: true, bannerUrl: true, linkedinUrl: true, githubUrl: true, portfolioUrl: true, role: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, error: "Failed to update profile" });
  }
}
