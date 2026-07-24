import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { securityHeaders } from "../../middleware/security.middleware.js";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function createMockRes() {
  const headers: Record<string, string> = {};
  const res = {
    setHeader: vi.fn((key: string, value: string) => {
      headers[key] = value;
    }),
    _headers: headers,
  } as unknown as Response;
  return res;
}

describe("Security Middleware", () => {
  it("should set X-Content-Type-Options", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
  });

  it("should set X-Frame-Options", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
  });

  it("should set X-XSS-Protection", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-XSS-Protection", "1; mode=block");
  });

  it("should set Referrer-Policy", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("Referrer-Policy", "strict-origin-when-cross-origin");
  });

  it("should set Permissions-Policy", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()"
    );
  });

  it("should call next", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should set HSTS in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );

    process.env.NODE_ENV = originalEnv;
  });

  it("should set CSP in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Security-Policy",
      expect.stringContaining("default-src 'self'")
    );

    process.env.NODE_ENV = originalEnv;
  });

  it("should not set HSTS in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    securityHeaders(req, res, next);

    const calls = (res.setHeader as any).mock.calls;
    const hstsCall = calls.find((c: any[]) => c[0] === "Strict-Transport-Security");
    expect(hstsCall).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});
