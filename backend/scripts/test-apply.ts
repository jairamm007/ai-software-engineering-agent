import fs from "node:fs";
import path from "node:path";
import { rebuildPatch, repairDiff } from "../src/pipeline/sandbox/diff";
import { exec } from "../src/pipeline/sandbox/docker";

const repoDir = "temp/pipeline/cms8xmhco00006g8r9bemcgwq";

const diff = [
  "diff --git a/src/__tests__/math.test.js b/src/__tests__/math.test.js",
  "--- a/src/__tests__/math.test.js",
  "+++ b/src/__tests__/math.test.js",
  '@@ -4,7 +4,7 @@',
  'it("adds two numbers", () => {',
  "-  const add = (a, b) => a - b;",
  "+  const add = (a, b) => a + b;",
  "  expect(add(2, 3)).toBe(5);",
  "});",
].join("\n");

const fileLines = fs
  .readFileSync(path.resolve(repoDir, "src/__tests__/math.test.js"), "utf-8")
  .split("\n");

console.log("fileLines[3]:", JSON.stringify(fileLines[3]));
console.log("wanted context1:", JSON.stringify('it("adds two numbers", () => {'));
console.log(
  "trim match:",
  fileLines[3].trim() === 'it("adds two numbers", () => {'
);

const out = repairDiff(rebuildPatch(diff, repoDir));
console.log("REBUILT+REPAIRED:");
for (const l of out.split("\n")) console.log(JSON.stringify(l));

fs.writeFileSync(path.join(repoDir, ".repoverify.patch"), out + "\n");
const r = await exec("git", ["apply", ".repoverify.patch"], {
  cwd: repoDir,
  timeoutMs: 20_000,
});
console.log("git apply exit:", r.exitCode, "stderr:", JSON.stringify(r.stderr));
