import "dotenv/config";

import { prisma } from "../src/database/prisma";

const p = prisma;

async function main() {
  const runs = await p.debugRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      failures: true,
      diagnoses: true,
      patches: true,
      security: true,
      baselines: true,
      comparisons: true,
    },
  });
  for (const r of runs) {
    console.log(
      JSON.stringify(
        {
          id: r.id,
          repo: r.repoName,
          status: r.status,
          stage: r.stage,
          stack: r.stackDetected,
          failures: r.failures.length,
          diagnoses: r.diagnoses.length,
          patches: r.patches.map((x) => ({
            a: x.attemptNumber,
            s: x.status,
            test: x.testResult,
          })),
          security: r.security
            ? {
                blocked: r.security.blocked,
                findings: (r.security.findings as any[] ?? []).length,
                summary: r.security.summary,
              }
            : null,
          baselines: r.baselines.map((b) => ({
            stage: b.stage,
            timeMs: b.timeMs,
            mem: b.memoryMb,
            heur: (b.heuristic as any[] ?? []).length,
          })),
          comparisons: r.comparisons.map((c) => ({
            m: c.metric,
            b: c.beforeValue,
            a: c.afterValue,
            pct: c.pctChange,
            f: c.flagged,
          })),
          summary: r.summary,
        },
        null,
        2
      )
    );
  }
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
