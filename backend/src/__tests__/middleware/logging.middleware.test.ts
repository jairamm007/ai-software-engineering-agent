import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import {
  logger,
  requestIdMiddleware,
  requestLogger,
} from "../../middleware/logging.middleware.js";

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    method: "GET",
    path: "/test",
    ip: "127.0.0.1",
    headers: { "user-agent": "test-agent" },
    ...overrides,
  } as unknown as Request;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    setHeader: vi.fn(),
    on: vi.fn((event: string, cb: () => void) => {
      if (event === "finish") res._finishCb = cb;
    }),
    _finishCb: null as (() => void) | null,
  } as unknown as Response;
  return res;
}

describe("Logging Middleware", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    consoleSpy.mockRestore();
  });

  describe("logger", () => {
    it("should log info messages as JSON", () => {
      logger.info("test message", { key: "value" });
      expect(consoleSpy).toHaveBeenCalledOnce();
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.level).toBe("info");
      expect(output.message).toBe("test message");
      expect(output.key).toBe("value");
      expect(output.timestamp).toBeDefined();
    });

    it("should include timestamp in log output", () => {
      logger.info("timestamped");
      const output = JSON.parse(consoleSpy.mock.calls[0][0]);
      expect(output.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("requestIdMiddleware", () => {
    it("should set x-request-id header if not present", () => {
      const req = createMockReq({ headers: {} });
      const res = createMockRes();
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.headers["x-request-id"]).toBeDefined();
      expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", expect.any(String));
    });

    it("should preserve existing x-request-id", () => {
      const existingId = "my-custom-id";
      const req = createMockReq({ headers: { "x-request-id": existingId } });
      const res = createMockRes();
      const next = vi.fn();

      requestIdMiddleware(req, res, next);

      expect(req.headers["x-request-id"]).toBe(existingId);
      expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", existingId);
    });
  });

  describe("requestLogger", () => {
    it("should call next", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = vi.fn();

      requestLogger(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should log on response finish", () => {
      const req = createMockReq({ method: "POST", path: "/api/test" });
      const res = createMockRes();
      const next = vi.fn();

      requestLogger(req, res, next);

      // Simulate response finish
      res.statusCode = 200;
      res._finishCb?.();

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
