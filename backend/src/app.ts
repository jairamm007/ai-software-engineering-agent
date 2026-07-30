import express from "express";
import cors from "cors";
import compression from "compression";

import { requestIdMiddleware, requestLogger } from "./middleware/logging.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { rateLimiter } from "./middleware/rate-limit.middleware.js";
import { securityHeaders } from "./middleware/security.middleware.js";

import authRoutes from "./auth/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import githubRoutes from "./routes/github.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";
import dependencyGraphRoutes from "./routes/dependency-graph.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import userRoutes from "./routes/user.routes.js";
import userPreferenceRoutes from "./routes/user-preference.routes.js";
import aiProvidersRoutes from "./routes/ai-providers.routes.js";
import repositoryIntelligenceRoutes from "./routes/repository-intelligence.routes.js";
import documentationGeneratorRoutes from "./routes/documentation-generator.routes.js";
import semanticSearchRoutes from "./routes/semantic-search.routes.js";
import multiAgentRoutes from "./routes/multi-agent.routes.js";
import teamRoutes from "./routes/team.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import teamChatRoutes from "./routes/team-chat.routes.js";
import teamNotificationRoutes from "./routes/team-notification.routes.js";
import teamAnalyticsRoutes from "./routes/team-analytics.routes.js";
import githubIntegrationRoutes from "./routes/github-integration.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import aiPRRoutes from "./routes/ai-pr-assistant.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import codeGenerationRoutes from "./routes/code-generation.routes.js";
import debugRoutes from "./routes/debug.routes.js";
import securityRoutes from "./routes/security.routes.js";
import performanceRoutes from "./routes/performance.routes.js";

const app = express();

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Accept", "X-Requested-With", "X-Request-Id", "Set-Cookie", "Cache-Control"],
}));

app.use(express.json({ limit: "1mb" }));
app.use(securityHeaders);
app.use(requestIdMiddleware);
app.use(rateLimiter);
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/repository", repositoryRoutes);
app.use("/api/repository", dependencyGraphRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user/preferences", userPreferenceRoutes);
app.use("/api/ai-providers", aiProvidersRoutes);
app.use("/api/repository", repositoryIntelligenceRoutes);
app.use("/api/repository", documentationGeneratorRoutes);
app.use("/api/repository", semanticSearchRoutes);
app.use("/api", multiAgentRoutes);
app.use("/api", teamRoutes);
app.use("/api", commentRoutes);
app.use("/api", activityRoutes);
app.use("/api", teamChatRoutes);
app.use("/api", teamNotificationRoutes);
app.use("/api", teamAnalyticsRoutes);
app.use("/api", githubIntegrationRoutes);
app.use("/api", webhookRoutes);
app.use("/api", aiPRRoutes);
app.use("/api", adminRoutes);
app.use("/api/ai", codeGenerationRoutes);
app.use("/api", debugRoutes);
app.use("/api", securityRoutes);
app.use("/api", performanceRoutes);

// Catch Better Auth /error requests and redirect to frontend login
app.get("/error", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendUrl}/login`);
});

app.use(errorHandler);

export default app;
