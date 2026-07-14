import { auth } from "./auth.config.js";
import type { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  session?: Session;
}

type Session = typeof auth.$Infer.Session;

function toHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return headers;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: toHeaders(req),
    });

    if (!session) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    req.userId = session.user.id;
    req.session = session;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: toHeaders(req),
    });

    if (session) {
      req.userId = session.user.id;
      req.session = session;
    }
  } catch {
    // ignore — user stays unauthenticated
  }
  next();
}
