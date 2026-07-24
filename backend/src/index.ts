import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { logger } from "./middleware/logging.middleware.js";

const server = app.listen(process.env.PORT || 3000, () => {
  logger.info(`Server started`, {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
    pid: process.pid,
  });
});

function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown`);

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { message: error.message, stack: error.stack });
  process.exit(1);
});
