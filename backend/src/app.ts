import express from "express";
import healthRoutes from "./routes/health.routes.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/health", healthRoutes);

export default app;