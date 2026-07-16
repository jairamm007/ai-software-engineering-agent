import express from "express";
import cors from "cors";

import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

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
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Accept", "X-Requested-With"],
}));

app.use(express.json());
app.use(loggerMiddleware);

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

app.use(errorHandler);

export default app;
