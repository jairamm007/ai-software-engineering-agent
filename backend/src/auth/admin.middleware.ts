import { auth } from "./auth.config.js";
import type { Request, Response, NextFunction } from "express";
import type { ParamsFlatDictionary } from "express-serve-static-core";

type Session = typeof auth.$Infer.Session;

export interface AuthRequest extends Request<ParamsFlatDictionary> {
  userId?: string;
  session?: Session;
}

function toHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return headers;
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({ headers: toHeaders(req) });
    if (!session) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    if ((session.user as Record<string, unknown>).role !== "admin") {
      res.status(403).json({ success: false, error: "Forbidden: Admin access required" });
      return;
    }
    req.userId = session.user.id;
    req.session = session;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
}
