import { describe, it, expect } from "vitest";
import {
  computeDocumentationHealth,
  computeSecurityHealth,
  computePerformanceHealth,
  computeMaintainabilityHealth,
  computeOverallHealth,
  computeHealth,
  buildRecommendationsFromSources,
  scoreToLabel,
} from "../../../modules/insights/generators/health.generator.js";

describe("insights health scoring", () => {
  it("doc health is null when no source data", () => {
    expect(computeDocumentationHealth(null)).toBeNull();
  });

  it("doc health is 100 when all five checks pass", () => {
    expect(
      computeDocumentationHealth({
        readme: true,
        apiDocs: true,
        functionDocs: true,
        classDocs: true,
        architecture: true,
      })
    ).toBe(100);
  });

  it("doc health reflects partial coverage (only readme present)", () => {
    expect(
      computeDocumentationHealth({
        readme: true,
        apiDocs: false,
        functionDocs: false,
        classDocs: false,
        architecture: false,
      })
    ).toBe(20);
  });

  it("security health is null when no scan data", () => {
    expect(computeSecurityHealth(null)).toBeNull();
  });

  it("security health is 100 when a scan found nothing", () => {
    expect(computeSecurityHealth({ findings: [] })).toBe(100);
  });

  it("security health penalizes critical/high findings but never below 0", () => {
    const score = computeSecurityHealth({
      findings: [
        { tool: "semgrep", severity: "critical", rule: "x", file: "a.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "b.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "c.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "d.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "e.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "f.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "g.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "h.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "i.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "j.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "k.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "l.ts" },
        { tool: "semgrep", severity: "critical", rule: "x", file: "m.ts" },
        { tool: "semgrep", severity: "high", rule: "y", file: "n.ts" },
      ],
    });
    expect(score).toBe(0);
  });

  it("security health is a number for moderate findings", () => {
    const score = computeSecurityHealth({
      findings: [{ tool: "semgrep", severity: "medium", rule: "z", file: "d.ts" }],
    });
    expect(score).toBe(98);
  });

  it("perf health is null when no perf data exists", () => {
    expect(computePerformanceHealth(null)).toBeNull();
  });

  it("perf health is null when comparisons list is empty", () => {
    expect(computePerformanceHealth({ comparisons: [] })).toBeNull();
  });

  it("perf health penalizes flagged regressions", () => {
    const score = computePerformanceHealth({
      comparisons: [
        { metric: "time_ms", beforeValue: 100, afterValue: 200, pctChange: 100, flagged: true },
        { metric: "query_count", beforeValue: 5, afterValue: 5, pctChange: 0, flagged: false },
      ],
    });
    expect(score).toBe(85);
  });

  it("maintainability health is null when no review data", () => {
    expect(computeMaintainabilityHealth(null)).toBeNull();
  });

  it("maintainability health is 100 for a clean review", () => {
    expect(
      computeMaintainabilityHealth({ issuesFound: 0, criticalCount: 0, warningCount: 0, infoCount: 0 })
    ).toBe(100);
  });

  it("maintainability health penalizes critical issues", () => {
    const score = computeMaintainabilityHealth({
      issuesFound: 5,
      criticalCount: 2,
      warningCount: 5,
      infoCount: 10,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(100);
  });

  it("overall health is null when every sub-score is missing", () => {
    expect(computeOverallHealth(null, null, null, null)).toBeNull();
  });

  it("overall health averages only present sub-scores", () => {
    const score = computeOverallHealth(80, null, 60, 100);
    expect(score).toBe(80);
  });

  it("computeHealth wires the sub-scores together", () => {
    const health = computeHealth({
      docs: null,
      security: null,
      perf: null,
      codeReview: null,
    });
    expect(health.docHealth).toBeNull();
    expect(health.securityHealth).toBeNull();
    expect(health.performanceHealth).toBeNull();
    expect(health.maintainabilityHealth).toBeNull();
    expect(health.overallHealth).toBeNull();
  });

  it("computeHealth with data produces numbers, never 0 from missing sources", () => {
    const health = computeHealth({
      docs: { readme: true, apiDocs: true, functionDocs: true, classDocs: false, architecture: true },
      security: { findings: [] },
      perf: null,
      codeReview: { issuesFound: 0, criticalCount: 0, warningCount: 0, infoCount: 0 },
    });
    expect(health.docHealth).toBe(80);
    expect(health.securityHealth).toBe(100);
    expect(health.performanceHealth).toBeNull();
    expect(health.overallHealth).not.toBeNull();
    expect(health.overallHealth).toBeGreaterThan(0);
  });

  it("scoreToLabel maps scores to labels", () => {
    expect(scoreToLabel(null)).toBe("No data");
    expect(scoreToLabel(90)).toBe("Healthy");
    expect(scoreToLabel(70)).toBe("Fair");
    expect(scoreToLabel(50)).toBe("At risk");
    expect(scoreToLabel(20)).toBe("Critical");
  });

  it("buildRecommendationsFromSources caps at 15 and is grounded in sources", () => {
    const recs = buildRecommendationsFromSources({
      security: {
        findings: Array.from({ length: 20 }, (_, i) => ({
          tool: "semgrep",
          severity: "high",
          message: `finding ${i}`,
          file: `f${i}.ts`,
        })),
      },
      perf: null,
      codeReview: { issuesFound: 10, criticalCount: 3, warningCount: 4, infoCount: 5 },
      docHealth: { readme: false, apiDocs: false, functionDocs: false, classDocs: false, architecture: false },
    });
    expect(recs.length).toBeLessThanOrEqual(15);
    expect(recs.some((r) => r.category === "security")).toBe(true);
    expect(recs.some((r) => r.category === "documentation")).toBe(true);
    expect(recs.some((r) => r.category === "code_quality")).toBe(true);
  });
});
