import { prisma } from "../src/database/prisma";
import { runPipeline } from "../src/pipeline/pipeline.service";

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found in DB");
    process.exit(1);
  }
  const fixtureUrl = "file:///C:/ai_mj/ai-software-engineering-agent/backend/temp/fixture-repo";
  console.log(`Starting pipeline for ${fixtureUrl} as user ${user.id}`);
  const run = await runPipeline({
    userId: user.id,
    repoUrl: fixtureUrl,
    branch: "main",
  });
  console.log(
    JSON.stringify(
      {
        id: run.id,
        status: run.status,
        stage: run.stage,
        summary: run.summary,
        failures: run.failures.length,
        diagnoses: run.diagnoses.length,
        patches: run.patches.map((p) => ({
          attempt: p.attemptNumber,
          status: p.status,
          test: p.testResult,
        })),
        security: run.security
          ? { blocked: run.security.blocked, findings: (run.security.findings as any[] ?? []).length, summary: run.security.summary }
          : null,
        baselines: run.baselines.map((b) => ({
          stage: b.stage,
          timeMs: b.timeMs,
          memoryMb: b.memoryMb,
          heuristics: (b.heuristic as any[] ?? []).length,
        })),
        comparisons: run.comparisons.map((c) => ({
          metric: c.metric,
          before: c.beforeValue,
          after: c.afterValue,
          pct: c.pctChange,
          flagged: c.flagged,
        })),
      },
      null,
      2
    )
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
