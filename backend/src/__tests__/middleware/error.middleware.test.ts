import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../middleware/error.middleware.js";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    method: "GET",
    path: "/test",
    originalUrl: "/test",
    ...overrides,
  } as unknown as Request;
}

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("Error Middleware - errorHandler", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should return 400 for body parse failures", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();
    const err = Object.assign(new Error("Unexpected token"), { type: "entity.parse.failed" });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Invalid JSON body" });
  });

  it("should return 400 for generic SyntaxError", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(new SyntaxError("bad"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should respect error.status", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();
    const err = Object.assign(new Error("Not found"), { status: 404 });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Not found" });
  });

  it("should return generic message for 5xx in production", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(new Error("db connection string leaked"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "Internal Server Error" });
    process.env.NODE_ENV = originalEnv;
  });

  it("should expose the message for 5xx in development", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(new Error("debug message"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "debug message" });
    process.env.NODE_ENV = originalEnv;
  });

  it("should default unknown errors to 500", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    errorHandler(new Error("boom"), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});