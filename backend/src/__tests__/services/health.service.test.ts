import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../database/prisma.js", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { getHealthStatus } from "../../services/health.service.js";
import { prisma } from "../../database/prisma.js";

const mockPrisma = vi.mocked(prisma);

describe("Health Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return healthy status when database is reachable", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const health = await getHealthStatus();

    expect(health.status).toBe("healthy");
    expect(health.checks.database.status).toBe("ok");
    expect(health.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
    expect(health.checks.memory.status).toBe("ok");
    expect(health.uptime).toBeGreaterThanOrEqual(0);
    expect(health.timestamp).toBeDefined();
    expect(health.version).toBeDefined();
  });

  it("should return unhealthy when database fails", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("Connection refused"));

    const health = await getHealthStatus();

    expect(health.status).toBe("unhealthy");
    expect(health.checks.database.status).toBe("error");
    expect(health.checks.database.error).toBeDefined();
  });

  it("should include memory usage", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const health = await getHealthStatus();

    expect(health.checks.memory.usageMb).toBeGreaterThanOrEqual(0);
    expect(health.checks.memory.totalMb).toBeGreaterThan(0);
    expect(health.checks.memory.percentage).toBeGreaterThanOrEqual(0);
    expect(health.checks.memory.percentage).toBeLessThanOrEqual(100);
  });

  it("should calculate uptime", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const health = await getHealthStatus();

    expect(health.uptime).toBeTypeOf("number");
    expect(health.uptime).toBeGreaterThanOrEqual(0);
  });

  it("should have valid timestamp format", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const health = await getHealthStatus();

    expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
