import type { HealthScores, Recommendation } from "../types.js";
import type { SecurityFinding } from "../../../pipeline/types.js";

export interface DocHealthSource {
  readme: boolean;
  apiDocs: boolean;
  functionDocs: boolean;
  classDocs: boolean;
  architecture: boolean;
}

export interface SecurityHealthSource {
  findings: SecurityFinding[];
  blocked?: boolean;
  status?: string;
}

export interface PerfComparisonLite {
  metric: string;
  beforeValue?: number | null;
  afterValue?: number | null;
  pctChange?: number | null;
  flagged?: boolean;
}

export interface PerfHealthSource {
  comparisons: PerfComparisonLite[];
}

export interface CodeReviewHealthSource {
  issuesFound?: number;
  criticalCount?: number;
  warningCount?: number;
  infoCount?: number;
}

export interface HealthInput {
  docs: DocHealthSource | null;
  security: SecurityHealthSource | null;
  perf: PerfHealthSource | null;
  codeReview: CodeReviewHealthSource | null;
}

const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

export const computeDocumentationHealth = (docs: DocHealthSource | null): number | null => {
  if (!docs) return null;
  const checks = [docs.readme, docs.apiDocs, docs.functionDocs, docs.classDocs, docs.architecture];
  const present = checks.filter(Boolean).length;
  return clamp((present / checks.length) * 100);
};

export const computeSecurityHealth = (security: SecurityHealthSource | null): number | null => {
  if (!security) return null;
  const findings = security.findings ?? [];
  const weights: Record<string, number> = { critical: 8, high: 5, medium: 2, low: 1 };
  let penalty = 0;
  for (const finding of findings) {
    penalty += weights[finding.severity?.toLowerCase()] ?? 1;
  }
  return clamp(100 - penalty);
};

export const computePerformanceHealth = (perf: PerfHealthSource | null): number | null => {
  if (!perf) return null;
  const comparisons = perf.comparisons ?? [];
  if (comparisons.length === 0) return null;
  const flagged = comparisons.filter((c) => c.flagged).length;
  const regressions = comparisons.filter(
    (c) => (c.pctChange ?? 0) > 0 || ((c.beforeValue ?? 0) > 0 && (c.afterValue ?? 0) > (c.beforeValue ?? 0))
  ).length;
  return clamp(100 - flagged * 15 - Math.max(0, regressions - flagged) * 10);
};

export const computeMaintainabilityHealth = (
  review: CodeReviewHealthSource | null
): number | null => {
  if (!review) return null;
  const critical = review.criticalCount ?? 0;
  const warnings = review.warningCount ?? 0;
  const info = review.infoCount ?? 0;
  const issues = review.issuesFound ?? critical + warnings + info;
  if (issues === 0 && critical === 0 && warnings === 0) return 100;
  return clamp(100 - critical * 10 - warnings * 3 - info * 0.5);
};

export const computeOverallHealth = (
  doc: number | null,
  security: number | null,
  perf: number | null,
  maintainability: number | null
): number | null => {
  const scores = [doc, security, perf, maintainability].filter(
    (s): s is number => s !== null
  );
  if (scores.length === 0) return null;
  return clamp(scores.reduce((sum, s) => sum + s, 0) / scores.length);
};

export const computeHealth = (input: HealthInput): HealthScores => {
  const docHealth = computeDocumentationHealth(input.docs);
  const securityHealth = computeSecurityHealth(input.security);
  const performanceHealth = computePerformanceHealth(input.perf);
  const maintainabilityHealth = computeMaintainabilityHealth(input.codeReview);

  return {
    docHealth,
    securityHealth,
    performanceHealth,
    maintainabilityHealth,
    overallHealth: computeOverallHealth(
      docHealth,
      securityHealth,
      performanceHealth,
      maintainabilityHealth
    ),
  };
};

export const scoreToLabel = (score: number | null): string => {
  if (score === null) return "No data";
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Fair";
  if (score >= 40) return "At risk";
  return "Critical";
};

export const buildDocHealthFromSources = (source: {
  readme: boolean;
  totalEndpoints: number;
  functionCount: number;
  classCount: number;
  moduleCount: number;
}): DocHealthSource => ({
  readme: source.readme,
  apiDocs: source.totalEndpoints > 0,
  functionDocs: source.functionCount > 0,
  classDocs: source.classCount > 0,
  architecture: source.moduleCount > 0,
});

export const severityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

export const sortFindings = (findings: SecurityFinding[]): SecurityFinding[] =>
  [...findings].sort((a, b) => {
    const ra = severityRank[a.severity?.toLowerCase() ?? "low"] ?? 4;
    const rb = severityRank[b.severity?.toLowerCase() ?? "low"] ?? 4;
    return ra - rb;
  });

export const buildRecommendationsFromSources = (input: {
  security: SecurityHealthSource | null;
  perf: PerfHealthSource | null;
  codeReview: CodeReviewHealthSource | null;
  docHealth: DocHealthSource | null;
}): Recommendation[] => {
  const recommendations: Recommendation[] = [];

  const securityFindings = sortFindings(input.security?.findings ?? []);
  const topSecurity = securityFindings
    .filter((f) => f.severity?.toLowerCase() === "critical" || f.severity?.toLowerCase() === "high")
    .slice(0, 5);
  for (const finding of topSecurity) {
    recommendations.push({
      category: "security",
      severity: "high",
      text: `Fix ${finding.severity} security finding${finding.rule ? ` (${finding.rule})` : ""}`,
      detail: [
        finding.message ?? "",
        finding.file ? `File: ${finding.file}${finding.line ? `:${finding.line}` : ""}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }

  const flaggedPerf = (input.perf?.comparisons ?? []).filter((c) => c.flagged);
  for (const comp of flaggedPerf.slice(0, 5)) {
    recommendations.push({
      category: "performance",
      severity: "medium",
      text: `Address performance regression in ${comp.metric}`,
      detail: comp.pctChange != null ? `+${comp.pctChange.toFixed(1)}% change detected` : "Flagged as a regression",
    });
  }

  if (input.codeReview && (input.codeReview.criticalCount ?? 0) > 0) {
    recommendations.push({
      category: "code_quality",
      severity: "high",
      text: `Resolve ${input.codeReview.criticalCount} critical code review findings`,
      detail: `Latest review found ${input.codeReview.issuesFound ?? 0} issues total.`,
    });
  }

  if (input.codeReview && (input.codeReview.warningCount ?? 0) > 3) {
    recommendations.push({
      category: "code_quality",
      severity: "low",
      text: `Reduce warning count (${input.codeReview.warningCount}) in the latest code review`,
    });
  }

  if (input.docHealth) {
    const missing: string[] = [];
    if (!input.docHealth.readme) missing.push("a README");
    if (!input.docHealth.apiDocs) missing.push("API endpoint documentation");
    if (!input.docHealth.functionDocs) missing.push("function documentation");
    if (missing.length > 0) {
      recommendations.push({
        category: "documentation",
        severity: "medium",
        text: `Add ${missing.join(" and ")}`,
      });
    }
  }

  return recommendations.slice(0, 15);
};
