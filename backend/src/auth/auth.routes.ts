import { Router } from "express";
import type { Request } from "express";
import { auth } from "./auth.config.js";

const router = Router();
const authBaseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

const HOP_BY_HOP = new Set([
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "te",
  "trailer",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
]);

function toHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined && !HOP_BY_HOP.has(key)) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return headers;
}

router.all("/*", async (req: Request, res) => {
  try {
    const url = new URL(req.originalUrl, authBaseURL);

    const init: RequestInit = {
      method: req.method,
      headers: toHeaders(req),
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = JSON.stringify(req.body);
    }

    const response = await auth.handler(new Request(url.toString(), init));

    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    const bodyText = await response.text();
    const location = response.headers.get("location");

    for (const cookie of setCookieHeaders) {
      res.append("Set-Cookie", cookie);
    }

    if (bodyText) {
      try {
        const body = JSON.parse(bodyText);
        res.status(response.status).json(body);
      } catch {
        res.status(response.status).send(bodyText);
      }
    } else if (location) {
      res.redirect(response.status || 302, location);
    } else {
      res.status(response.status).end();
    }
  } catch (error) {
    console.error("[AUTH] Handler error:", error);
    const message = error instanceof Error ? error.message : "Auth handler error";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
