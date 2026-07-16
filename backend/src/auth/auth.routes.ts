import { Router } from "express";
import type { Request } from "express";
import { auth } from "./auth.config.js";

const router = Router();
const authBaseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

function toHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  return headers;
}

router.all("/{*path}", async (req: Request, res) => {
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
    if (setCookieHeaders.length > 0) {
      res.setHeader("set-cookie", setCookieHeaders);
    }

    const location = response.headers.get("location");
    if (location) {
      res.redirect(response.status, location);
      return;
    }

    const bodyText = await response.text();

    if (bodyText) {
      try {
        const body = JSON.parse(bodyText);
        res.status(response.status).json(body);
      } catch {
        res.status(response.status).send(bodyText);
      }
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
