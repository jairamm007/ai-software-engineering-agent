import { Router } from "express";
import type { Request } from "express";
import { auth } from "./auth.config.js";

const router = Router();
const authBaseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

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

router.all("/{*path}", async (req: Request, res) => {
  try {
    const url = new URL(req.originalUrl, authBaseURL);
    const isWrite = req.method !== "GET" && req.method !== "HEAD";

    const init: RequestInit = {
      method: req.method,
      headers: toHeaders(req),
    };

    if (isWrite) {
      init.body = JSON.stringify(req.body);
      const h = init.headers as Headers;
      if (!h.get("content-type")) {
        h.set("content-type", "application/json");
      }
    }

    const response = await auth.handler(new Request(url.toString(), init));

    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    const location = response.headers.get("location");
    const bodyText = await response.text();

    for (const cookie of setCookieHeaders) {
      res.append("Set-Cookie", cookie);
    }

    // When the response is 200 with a JSON body, always return it as JSON.
    // Better-auth's signIn.social returns 200 + JSON { url, redirect: true } + a Location header.
    // The client's redirectPlugin reads data.url and sets window.location.href itself.
    // Sending a 302 redirect here would cause the client's fetch to follow the redirect
    // to the OAuth provider, losing the JSON body.
    const isRedirectStatus = response.status >= 300 && response.status < 400;
    const hasJsonBody = bodyText && (() => { try { JSON.parse(bodyText); return true; } catch { return false; } })();

    if (location && isRedirectStatus && !hasJsonBody) {
      let redirectUrl = location;
      if (location === "/" || (location.startsWith("/") && !location.startsWith("/api"))) {
        const errorParams = new URL(req.originalUrl, authBaseURL).search;
        redirectUrl = `${frontendUrl}${location === "/" ? "/login" : location}${errorParams}`;
      }
      res.redirect(response.status, redirectUrl);
    } else if (bodyText) {
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
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[AUTH] Stack:", stack);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
