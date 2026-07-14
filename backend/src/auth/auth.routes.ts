import { Router } from "express";
import type { Request } from "express";
import { auth } from "./auth.config.js";

const router = Router();

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
    const host = req.headers.host ?? "localhost";
    // Use req.originalUrl to preserve the full path including the mount prefix.
    // Express strips "/api/auth" from req.url, but Better Auth needs the full path.
    const url = new URL(req.originalUrl, `http://${host}`);

    const init: RequestInit = {
      method: req.method,
      headers: toHeaders(req),
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = JSON.stringify(req.body);
    }

    const response = await auth.handler(new Request(url.toString(), init));

    // Forward Set-Cookie headers properly (getSetCookie returns individual cookies)
    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    if (setCookieHeaders.length > 0) {
      res.setHeader("set-cookie", setCookieHeaders);
    }

    // Forward Location header for redirects (3xx responses like OAuth callbacks)
    const location = response.headers.get("location");
    if (location) {
      res.setHeader("location", location);
    }

    // Read the body as text first, then parse as JSON if applicable
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
