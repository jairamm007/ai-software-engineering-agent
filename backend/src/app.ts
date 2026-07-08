import express from "express";

import { loggerMiddleware } from "./middleware/logger.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

import healthRoutes from "./routes/health.routes.js";
import githubRoutes from "./routes/github.routes.js";
import repositoryRoutes from "./routes/repository.routes.js";

const app = express();

app.use(express.json());
app.use(loggerMiddleware);

app.use("/api/health", healthRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/repository", repositoryRoutes);

app.use(errorHandler);

export default app;