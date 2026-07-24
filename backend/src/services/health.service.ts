import { prisma } from "../database/prisma.js";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: number;
  timestamp: string;
  checks: {
    database: { status: string; latencyMs?: number; error?: string };
    memory: { status: string; usageMb: number; totalMb: number; percentage: number };
    disk?: { status: string };
  };
}

const startTime = Date.now();

export async function getHealthStatus(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkMemory(),
  ]);

  const dbResult = checks[0].status === "fulfilled" ? checks[0].value : { status: "error", error: "Check failed" };
  const memResult = checks[1].status === "fulfilled" ? checks[1].value : { status: "error", usageMb: 0, totalMb: 0, percentage: 0 };

  const overallStatus =
    dbResult.status === "error" || memResult.status === "error"
      ? "unhealthy"
      : memResult.percentage > 90
        ? "degraded"
        : "healthy";

  return {
    status: overallStatus,
    version: process.env.npm_package_version || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    checks: {
      database: dbResult,
      memory: memResult,
    },
  };
}

async function checkDatabase(): Promise<{ status: string; latencyMs: number }> {
  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  return { status: "ok", latencyMs: Date.now() - start };
}

function checkMemory(): { status: string; usageMb: number; totalMb: number; percentage: number } {
  const mem = process.memoryUsage();
  const usageMb = Math.round(mem.heapUsed / 1024 / 1024);
  const totalMb = Math.round(mem.heapTotal / 1024 / 1024);
  const percentage = Math.round((mem.heapUsed / mem.heapTotal) * 100);

  return {
    status: percentage > 90 ? "warning" : "ok",
    usageMb,
    totalMb,
    percentage,
  };
}
