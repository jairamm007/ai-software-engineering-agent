import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ROLE_HIERARCHY,
  canManageRole,
  hasPermission,
} from "../../services/team.service.js";

vi.mock("../../database/prisma.js", () => ({
  prisma: {
    team: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    teamMember: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), update: vi.fn() },
    teamInvitation: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    teamRepository: { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    teamActivity: { create: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    comment: { findMany: vi.fn(), count: vi.fn() },
  },
}));

describe("Team Service - Role Hierarchy", () => {
  it("should define correct role hierarchy", () => {
    expect(ROLE_HIERARCHY.owner).toBe(4);
    expect(ROLE_HIERARCHY.admin).toBe(3);
    expect(ROLE_HIERARCHY.member).toBe(2);
    expect(ROLE_HIERARCHY.viewer).toBe(1);
  });

  it("owner can manage admin", () => {
    expect(canManageRole("owner", "admin")).toBe(true);
  });

  it("admin can manage member", () => {
    expect(canManageRole("admin", "member")).toBe(true);
  });

  it("member cannot manage admin", () => {
    expect(canManageRole("member", "admin")).toBe(false);
  });

  it("admin cannot manage owner", () => {
    expect(canManageRole("admin", "owner")).toBe(false);
  });

  it("same role cannot manage each other", () => {
    expect(canManageRole("member", "member")).toBe(false);
  });

  it("viewer cannot manage anyone", () => {
    expect(canManageRole("viewer", "viewer")).toBe(false);
    expect(canManageRole("viewer", "member")).toBe(false);
  });
});

describe("Team Service - Permissions", () => {
  it("owner can manage", () => {
    expect(hasPermission("owner", "manage")).toBe(true);
  });

  it("admin can manage", () => {
    expect(hasPermission("admin", "manage")).toBe(true);
  });

  it("member cannot manage", () => {
    expect(hasPermission("member", "manage")).toBe(false);
  });

  it("member can invite", () => {
    expect(hasPermission("member", "invite")).toBe(true);
  });

  it("viewer cannot invite", () => {
    expect(hasPermission("viewer", "invite")).toBe(false);
  });

  it("member can comment", () => {
    expect(hasPermission("member", "comment")).toBe(true);
  });

  it("viewer cannot comment", () => {
    expect(hasPermission("viewer", "comment")).toBe(false);
  });

  it("everyone can view", () => {
    expect(hasPermission("viewer", "view")).toBe(true);
    expect(hasPermission("member", "view")).toBe(true);
    expect(hasPermission("admin", "view")).toBe(true);
    expect(hasPermission("owner", "view")).toBe(true);
  });
});
