import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import type { AuthRequest } from "../../auth/auth.middleware.js";

const mockUserUpdate = vi.fn();
const mockUserFindFirst = vi.fn();

vi.mock("../../database/prisma.js", () => ({
  prisma: {
    user: {
      update: (...args: any[]) => mockUserUpdate(...args),
      findFirst: (...args: any[]) => mockUserFindFirst(...args),
    },
  },
}));

import { updateProfileController } from "../../controllers/user.controller.js";

function createMockReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    userId: "user-1",
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

const SELECT = expect.objectContaining({ role: true });

describe("User Controller - updateProfileController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if no userId", async () => {
    const req = createMockReq({ userId: undefined });
    const res = createMockRes();

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("should never write the role field even when a user sends it", async () => {
    const req = createMockReq({
      body: { name: "Hacker", role: "admin" },
    });
    const res = createMockRes();
    mockUserUpdate.mockResolvedValue({ id: "user-1", name: "Hacker", role: "user" });

    await updateProfileController(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(mockUserUpdate).toHaveBeenCalledTimes(1);
    const [args] = mockUserUpdate.mock.calls[0];
    expect(args.data).not.toHaveProperty("role");
    expect(args.data).toEqual({ name: "Hacker" });
  });

  it("should update allowed profile fields", async () => {
    const req = createMockReq({
      body: { name: "Alice", bio: "dev", linkedinUrl: "https://linkedin.in/alice" },
    });
    const res = createMockRes();
    mockUserUpdate.mockResolvedValue({ id: "user-1", name: "Alice", role: "user" });

    await updateProfileController(req, res);

    const [args] = mockUserUpdate.mock.calls[0];
    expect(args.data).toEqual({
      name: "Alice",
      bio: "dev",
      linkedinUrl: "https://linkedin.in/alice",
    });
    expect(args.select).toEqual(SELECT);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("should return 400 when there are no fields to update", async () => {
    const req = createMockReq({ body: { role: "admin" } });
    const res = createMockRes();

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("should reject a duplicate email", async () => {
    const req = createMockReq({ body: { email: "taken@example.com" } });
    const res = createMockRes();
    mockUserFindFirst.mockResolvedValue({ id: "other-user" });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});