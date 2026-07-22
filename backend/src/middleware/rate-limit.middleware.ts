import type { Request, Response, NextFunction } from "express";

const requestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;
const SKIP_PATHS = new Set(["/api/health"]);

const getClientKey = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userId = (req as any).userId || "";
  return `${ip}:${userId}`;
};

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  if (SKIP_PATHS.has(req.path)) {
    next();
    return;
  }

  const key = getClientKey(req);
  const now = Date.now();

  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + WINDOW_MS });
    next();
    return;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
    });
    return;
  }

  next();
};

const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts) {
    if (now > entry.resetTime) {
      requestCounts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);
