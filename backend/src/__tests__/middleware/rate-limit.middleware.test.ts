import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { rateLimiter } from "../../middleware/rate-limit.middleware.js";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    path: "/api/chat",
    ip: "127.0.0.1",
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  } as unknown as Response;
  return res;
}

describe("Rate Limit Middleware", () => {
  it("should skip health checks", () => {
    const req = createMockReq({ path: "/api/health" });
    const res = createMockRes();
    const next = vi.fn();

    rateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should allow requests under the limit", () => {
    const req = createMockReq({ ip: "10.0.0.1" });
    const res = createMockRes();
    const next = vi.fn();

    rateLimiter(req, res, next);
    rateLimiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should include rate limit headers", () => {
    const req = createMockReq({ ip: "10.0.0.2" });
    const res = createMockRes();
    const next = vi.fn();

    rateLimiter(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Limit", expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith("X-RateLimit-Remaining", expect.any(String));
  });

  it("should return 429 once the limit is exceeded", () => {
    const req = createMockReq({ ip: "10.0.0.3" });
    const res = createMockRes();
    const next = vi.fn();

    // Default MAX_REQUESTS is 100; the counter is reset per-IP, so burst through it.
    for (let i = 0; i < 101; i++) {
      rateLimiter(req, res, next);
    }

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(String));
  });

  it("should rate limit auth endpoints more aggressively", () => {
    const req = createMockReq({ path: "/api/auth/login", ip: "10.0.0.4" });
    const res = createMockRes();
    const next = vi.fn();

    // AUTH_MAX_REQUESTS is 10.
    for (let i = 0; i < 12; i++) {
      rateLimiter(req, res, next);
    }

    expect(res.status).toHaveBeenCalledWith(429);
  });

  it("should reset the counter after the window elapses", () => {
    vi.useFakeTimers();
    try {
      const req = createMockReq({ path: "/api/auth/login", ip: "10.0.0.5" });
      const res = createMockRes();
      const next = vi.fn();

      for (let i = 0; i < 12; i++) {
        rateLimiter(req, res, next);
      }
      expect(res.status).toHaveBeenCalledWith(429);

      res.status.mockClear();
      res.json.mockClear();

      vi.advanceTimersByTime(60_000 + 1);
      rateLimiter(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});