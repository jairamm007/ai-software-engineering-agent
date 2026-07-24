import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../auth/auth.middleware.js";

const mockGetTeamMember = vi.fn();

vi.mock("../../repository/team.repository.js", () => ({
  getTeamMember: (...args: any[]) => mockGetTeamMember(...args),
}));

import { requireTeamRole } from "../../middleware/team.middleware.js";

function createMockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    userId: "user-1",
    params: { teamId: "team-1" },
    body: {},
    ...overrides,
  } as unknown as AuthRequest;
}

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe("Team Middleware - requireTeamRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if no userId", async () => {
    const req = createMockReq({ userId: undefined });
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireTeamRole("member");
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if no teamId", async () => {
    const req = createMockReq({ params: {} });
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireTeamRole("member");
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if not a team member", async () => {
    mockGetTeamMember.mockResolvedValue(null);
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireTeamRole("member");
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 if role is insufficient", async () => {
    mockGetTeamMember.mockResolvedValue({ role: "viewer" });
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireTeamRole("admin");
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if role is sufficient", async () => {
    mockGetTeamMember.mockResolvedValue({ role: "admin" });
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireTeamRole("member");
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should call next for owner on any role check", async () => {
    mockGetTeamMember.mockResolvedValue({ role: "owner" });
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireTeamRole("admin");
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should attach teamRole to request", async () => {
    mockGetTeamMember.mockResolvedValue({ role: "admin" });
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    const middleware = requireTeamRole("member");
    await middleware(req, res, next);

    expect((req as any).teamRole).toBe("admin");
  });
});
