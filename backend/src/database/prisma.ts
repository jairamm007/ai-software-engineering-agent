import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createAdapter() {
  const connectionString = process.env.DATABASE_URL!;
  const needsSSL = connectionString.includes("sslmode=");

  return new PrismaPg({
    connectionString,
    max: 20,
    ...(needsSSL ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

function createPrismaClient() {
  const adapter = createAdapter();
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function resetPrismaClient() {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore — connection may already be broken
  }
  const fresh = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = fresh;
  }
  return fresh;
}