import "dotenv/config";

import { prisma } from "../src/database/prisma";

async function main() {
  const id = process.argv[2];
  const r = await prisma.debugRun.findUnique({
    where: { id },
    include: { failures: true, diagnoses: true, patches: true, security: true },
  });
  if (!r) {
    console.error("run not found", id);
    process.exit(1);
  }
  console.log("STATUS:", r.status, "STAGE:", r.stage);
  console.log("SUMMARY:", r.summary);
  console.log("FAILURES:", JSON.stringify(r.failures, null, 2));
  console.log(
    "DIAGNOSES:",
    JSON.stringify(
      r.diagnoses.map((d) => ({
        file: d.file,
        confidence: d.confidence,
        summary: d.summary,
      })),
      null,
      2
    )
  );
  for (const p of r.patches) {
    console.log(
      `PATCH ${p.attemptNumber} status=${p.status} err=${p.error ?? "(none)"} notes=${p.notes ?? "(none)"}`
    );
    console.log("--- DIFF ---");
    console.log((p.diffText ?? "").slice(0, 2000));
    console.log("--- END DIFF ---");
  }
  if (r.security) {
    console.log("SECURITY:", JSON.stringify(r.security, null, 2));
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
