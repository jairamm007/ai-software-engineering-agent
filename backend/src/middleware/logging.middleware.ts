import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.LOG_LEVEL || "info") as LogLevel;

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog("debug")) console.debug(formatLog("debug", message, meta));
  },
  info: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog("info")) console.log(formatLog("info", message, meta));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog("warn")) console.warn(formatLog("warn", message, meta));
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog("error")) console.error(formatLog("error", message, meta));
  },
};

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.headers["x-request-id"] as string;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const meta = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    };

    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.path} ${res.statusCode}`, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.path} ${res.statusCode}`, meta);
    } else {
      logger.info(`${req.method} ${req.path} ${res.statusCode}`, meta);
    }
  });

  next();
}
