import { Router } from "express";
import { requireAdmin } from "../auth/admin.middleware.js";
import {
  getAdminStats,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  promoteUser,
  demoteUser,
  listAllRepositories,
  getRepositoryStats,
  deleteRepository,
  getAIStats,
  getAnalytics,
  getSecurityLogs,
  forceLogout,
  forceLogoutAllUserSessions,
  listNotifications,
  createNotification,
  deleteNotification,
  getSystemSettings,
  updateSystemSettings,
  getSystemHealth,
  generateReport,
  listAdmins,
  listDocumentations,
  createDocumentation,
  deleteDocumentation,
  listCodeReviews,
  createCodeReview,
  deleteCodeReview,
  listTestReports,
  createTestReport,
  deleteTestReport,
  listSupportMessages,
  replyToSupportMessage,
  updateSupportMessageStatus,
  deleteSupportMessage,
  listBackups,
  createBackup,
  deleteBackup,
  listActivityLogs,
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/admin.controller.js";

const router = Router();

router.use("/admin", requireAdmin);

// Dashboard
router.get("/admin/stats", getAdminStats);

// User Management
router.get("/admin/users", listUsers);
router.get("/admin/users/:userId", getUser);
router.put("/admin/users/:userId", updateUser);
router.delete("/admin/users/:userId", deleteUser);
router.post("/admin/users/:userId/suspend", suspendUser);
router.post("/admin/users/:userId/activate", activateUser);
router.post("/admin/users/:userId/promote", promoteUser);
router.post("/admin/users/:userId/demote", demoteUser);
router.post("/admin/users/:userId/logout-all", forceLogoutAllUserSessions);

// Admin Management
router.get("/admin/admins", listAdmins);

// Repository Management
router.get("/admin/repositories", listAllRepositories);
router.get("/admin/repositories/stats", getRepositoryStats);
router.delete("/admin/repositories/:repoId", deleteRepository);

// AI Services
router.get("/admin/ai/stats", getAIStats);

// Analytics
router.get("/admin/analytics", getAnalytics);

// Security
router.get("/admin/security", getSecurityLogs);
router.post("/admin/security/sessions/:sessionId/force-logout", forceLogout);

// Documentation Management
router.get("/admin/docs", listDocumentations);
router.post("/admin/docs", createDocumentation);
router.delete("/admin/docs/:docId", deleteDocumentation);

// Code Review Management
router.get("/admin/reviews", listCodeReviews);
router.post("/admin/reviews", createCodeReview);
router.delete("/admin/reviews/:reviewId", deleteCodeReview);

// Testing Management
router.get("/admin/tests", listTestReports);
router.post("/admin/tests", createTestReport);
router.delete("/admin/tests/:reportId", deleteTestReport);

// Notifications
router.get("/admin/notifications", listNotifications);
router.post("/admin/notifications", createNotification);
router.delete("/admin/notifications/:notificationId", deleteNotification);

// Support Center
router.get("/admin/support", listSupportMessages);
router.post("/admin/support/:messageId/reply", replyToSupportMessage);
router.put("/admin/support/:messageId/status", updateSupportMessageStatus);
router.delete("/admin/support/:messageId", deleteSupportMessage);

// System Settings
router.get("/admin/settings", getSystemSettings);
router.put("/admin/settings", updateSystemSettings);

// System Health
router.get("/admin/health", getSystemHealth);

// Activity Logs
router.get("/admin/activity-logs", listActivityLogs);

// Backup & Recovery
router.get("/admin/backups", listBackups);
router.post("/admin/backups", createBackup);
router.delete("/admin/backups/:backupId", deleteBackup);

// Reports
router.get("/admin/reports/:type", generateReport);

// Profile
router.get("/admin/profile", getAdminProfile);
router.put("/admin/profile", updateAdminProfile);

export default router;
