import type { Request, Response, NextFunction } from "express";

const requestCounts = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX || 100);
const AUTH_MAX_REQUESTS = Number(process.env.AUTH_RATE_LIMIT_MAX || 10);
const SKIP_PATHS = new Set(["/api/health"]);

const AUTH_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/resend-verification-email",
]);

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
    res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
    res.setHeader("X-RateLimit-Remaining", String(MAX_REQUESTS - 1));
    next();
    return;
  }

  entry.count++;

  const isAuthPath = AUTH_PATHS.has(req.path);
  const max = isAuthPath ? AUTH_MAX_REQUESTS : MAX_REQUESTS;

  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));

  if (entry.count > max) {
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