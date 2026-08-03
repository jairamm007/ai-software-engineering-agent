import type { ProjectInsightsRecord } from "../types.js";
import { scoreToLabel } from "../generators/health.generator.js";

const fmtDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

export const buildMarkdownReport = (insights: ProjectInsightsRecord): string => {
  const s = insights.summary;
  const lines: string[] = [];
  lines.push(`# ${s.name} — Project Insights`);
  lines.push("");
  lines.push(`> Generated on ${new Date().toLocaleString()}. ` +
    `Overview, architecture prose and recommendations may include AI-generated text; ` +
    `all other sections are derived deterministically from repository data.`);
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Name**: ${s.name}`);
  if (s.description) lines.push(`- **Description**: ${s.description}`);
  lines.push(`- **Primary language**: ${s.primaryLanguage}`);
  if (s.frontendFramework) lines.push(`- **Frontend**: ${s.frontendFramework}`);
  if (s.backendFramework) lines.push(`- **Backend**: ${s.backendFramework}`);
  if (s.database) lines.push(`- **Database**: ${s.database}`);
  if (s.vectorDb) lines.push(`- **Vector database**: ${s.vectorDb}`);
  if (s.aiFramework) lines.push(`- **AI framework**: ${s.aiFramework}`);
  lines.push(`- **Files**: ${s.totalFiles}`);
  lines.push(`- **Folders**: ${s.totalFolders}`);
  lines.push(`- **Modules**: ${s.moduleCount}`);
  lines.push("");

  lines.push("## Overview");
  lines.push("");
  lines.push(insights.overview);
  lines.push("");

  lines.push("## Architecture");
  lines.push("");
  lines.push(insights.architecture.prose);
  lines.push("");
  for (const layer of insights.architecture.layers) {
    lines.push(`### ${layer.name}`);
    lines.push("");
    lines.push(layer.modules.map((m) => `- ${m}`).join("\n"));
    lines.push("");
  }
  lines.push(`**Request flow**: ${insights.architecture.requestFlow}`);
  if (insights.architecture.entryPoints.length > 0) {
    lines.push("");
    lines.push(`**Entry points**: ${insights.architecture.entryPoints.join(", ")}`);
  }
  lines.push("");

  lines.push("## Modules");
  lines.push("");
  if (insights.modules.length === 0) {
    lines.push("No modules detected.");
  } else {
    lines.push("| Module | Path | Files | Lines | Dependencies |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const m of insights.modules) {
      lines.push(
        `| ${m.name} | \`${m.path}\` | ${m.fileCount} | ${m.lineCount} | ${m.dependencies.join(", ") || "—"} |`
      );
    }
    lines.push("");
    lines.push("**Responsibilities**:");
    for (const m of insights.modules) {
      lines.push(`- **${m.name}**: ${m.responsibilities.join("; ")}`);
    }
  }
  lines.push("");

  lines.push("## Dependencies");
  lines.push("");
  if (insights.dependencies.edges.length === 0) {
    lines.push("No inter-module dependencies detected.");
  } else {
    lines.push("| From | To | Weight |");
    lines.push("| --- | --- | --- |");
    for (const edge of insights.dependencies.edges) {
      lines.push(`| ${edge.from} | ${edge.to} | ${edge.weight} |`);
    }
  }
  lines.push("");

  lines.push("## Tech Stack");
  lines.push("");
  if (insights.techStack.length === 0) {
    lines.push("No tech stack detected.");
  } else {
    lines.push(
      insights.techStack
        .map((t) => (t.version ? `- ${t.name} ${t.version}` : `- ${t.name}`))
        .join("\n")
    );
  }
  lines.push("");

  lines.push("## Timeline");
  lines.push("");
  if (insights.timeline.totalCommits > 0) {
    lines.push(`- **Total commits**: ${insights.timeline.totalCommits}`);
    lines.push(`- **Contributors**: ${insights.timeline.contributors}`);
    if (insights.timeline.startedAt) lines.push(`- **Started**: ${fmtDate(insights.timeline.startedAt)}`);
    if (insights.timeline.lastActiveAt) lines.push(`- **Last active**: ${fmtDate(insights.timeline.lastActiveAt)}`);
    lines.push("");
  }
  for (const event of insights.timeline.events) {
    const author = event.author ? ` — ${event.author}` : "";
    const description = event.description ? ` (${event.description})` : "";
    lines.push(`- ${fmtDate(event.date)}: ${event.label}${author}${description}`);
  }
  lines.push("");

  lines.push("## Health");
  lines.push("");
  lines.push("| Area | Score | Status |");
  lines.push("| --- | --- | --- |");
  const healthRows: [string, number | null][] = [
    ["Documentation", insights.docHealth],
    ["Security", insights.securityHealth],
    ["Performance", insights.performanceHealth],
    ["Maintainability", insights.maintainabilityHealth],
    ["Overall", insights.overallHealth],
  ];
  for (const [area, score] of healthRows) {
    lines.push(`| ${area} | ${score === null ? "N/A" : `${score}/100`} | ${scoreToLabel(score)} |`);
  }
  lines.push("");

  lines.push("## Recommendations");
  lines.push("");
  if (insights.recommendations.length === 0) {
    lines.push("No recommendations available.");
  } else {
    for (const rec of insights.recommendations) {
      const sev = rec.severity.toUpperCase();
      const detail = rec.detail ? ` — ${rec.detail}` : "";
      lines.push(`- **[${sev}] ${rec.text}**${detail}`);
    }
  }
  lines.push("");

  return lines.join("\n");
};
