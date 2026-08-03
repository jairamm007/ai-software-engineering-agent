import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ProjectInsightsRecord } from "../types.js";
import { scoreToLabel } from "../generators/health.generator.js";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

const sanitize = (value: string): string =>
  value
    .replace(/→/g, "->")
    .replace(/—/g, "-")
    .replace(/·/g, "-")
    .replace(/…/g, "...")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

interface WriterState {
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
}

const fmtDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
};

const buildPdf = async (insights: ProjectInsightsRecord): Promise<Uint8Array> => {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const state: WriterState = {
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - MARGIN,
    regular,
    bold,
  };

  const ensureSpace = (needed: number) => {
    if (state.y - needed < MARGIN) {
      state.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      state.y = PAGE_HEIGHT - MARGIN;
    }
  };

  const wrap = (text: string, size: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (state.regular.widthOfTextAtSize(test, size) > MAX_WIDTH && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const text = (content: string, opts: { size?: number; bold?: boolean } = {}) => {
    const size = opts.size ?? 10;
    const font = opts.bold ? state.bold : state.regular;
    const lineHeight = size * 1.35;
    for (const line of wrap(content, size)) {
      ensureSpace(lineHeight);
      state.page.drawText(line, { x: MARGIN, y: state.y, size, font, color: rgb(0.15, 0.15, 0.17) });
      state.y -= lineHeight;
    }
  };

  const paragraph = (content: string) => {
    text(content);
    state.y -= 6;
  };

  const bullet = (content: string) => {
    const size = 10;
    const lineHeight = size * 1.35;
    const indent = 16;
    const bulletWidth = state.regular.widthOfTextAtSize("- ", size);
    for (const line of wrap(content, size)) {
      ensureSpace(lineHeight);
      state.page.drawText("- ", { x: MARGIN, y: state.y, size, font: state.regular, color: rgb(0.35, 0.35, 0.4) });
      state.page.drawText(line, { x: MARGIN + bulletWidth, y: state.y, size, font: state.regular, color: rgb(0.15, 0.15, 0.17) });
      state.y -= lineHeight;
    }
    state.y -= 2;
  };

  const heading = (content: string, size = 13) => {
    const lineHeight = size * 1.4;
    ensureSpace(lineHeight * 1.8);
    state.y -= 8;
    state.page.drawText(content, { x: MARGIN, y: state.y, size, font: state.bold, color: rgb(0.05, 0.05, 0.1) });
    state.y -= lineHeight;
    state.page.drawLine({
      start: { x: MARGIN, y: state.y + 5 },
      end: { x: PAGE_WIDTH - MARGIN, y: state.y + 5 },
      thickness: 0.6,
      color: rgb(0.75, 0.75, 0.8),
    });
    state.y -= 10;
  };

  const table = (headers: string[], rows: string[][]) => {
    const size = 9;
    const lineHeight = size * 1.4;
    const colWidth = (MAX_WIDTH - (headers.length - 1) * 8) / headers.length;
    for (const row of [headers, ...rows]) {
      ensureSpace(lineHeight);
      let x = MARGIN;
      row.forEach((cell, index) => {
        const truncated = state.regular.widthOfTextAtSize(cell, size) > colWidth
          ? `${cell.slice(0, Math.floor(colWidth / (size * 0.6)))}...`
          : cell;
        state.page.drawText(sanitize(truncated), {
          x,
          y: state.y,
          size,
          font: index === 0 ? state.bold : state.regular,
          color: rgb(0.15, 0.15, 0.17),
        });
        x += colWidth + 8;
      });
      state.y -= lineHeight;
    }
    state.y -= 4;
  };

  const s = insights.summary;

  heading(sanitize(`${s.name} - Project Insights`), 16);
  state.y -= 4;
  paragraph(`Generated on ${new Date().toLocaleString()}. Overview, architecture prose and recommendations may include AI-generated text; all other sections are derived deterministically from repository data.`);

  heading("Summary");
  table(["Attribute", "Value"], [
    ["Name", sanitize(s.name)],
    ["Description", sanitize(s.description ?? "N/A")],
    ["Primary language", sanitize(s.primaryLanguage)],
    ["Frontend", sanitize(s.frontendFramework ?? "N/A")],
    ["Backend", sanitize(s.backendFramework ?? "N/A")],
    ["Database", sanitize(s.database ?? "N/A")],
    ["Vector database", sanitize(s.vectorDb ?? "N/A")],
    ["AI framework", sanitize(s.aiFramework ?? "N/A")],
    ["Files", String(s.totalFiles)],
    ["Folders", String(s.totalFolders)],
    ["Modules", String(s.moduleCount)],
  ]);

  heading("Overview");
  paragraph(sanitize(insights.overview));

  heading("Architecture");
  paragraph(sanitize(insights.architecture.prose));
  for (const layer of insights.architecture.layers) {
    heading(sanitize(layer.name), 11);
    layer.modules.forEach((m) => bullet(sanitize(m)));
  }
  paragraph(`Request flow: ${sanitize(insights.architecture.requestFlow)}`);
  if (insights.architecture.entryPoints.length > 0) {
    paragraph(`Entry points: ${sanitize(insights.architecture.entryPoints.join(", "))}`);
  }

  heading("Modules");
  if (insights.modules.length === 0) {
    paragraph("No modules detected.");
  } else {
    table(["Module", "Path", "Files", "Lines", "Dependencies"], insights.modules.map((m) => [
      sanitize(m.name),
      m.path,
      String(m.fileCount),
      String(m.lineCount),
      sanitize(m.dependencies.join(", ") || "-"),
    ]));
    paragraph("Responsibilities:");
    insights.modules.forEach((m) => bullet(sanitize(`${m.name}: ${m.responsibilities.join("; ")}`)));
  }

  heading("Dependencies");
  if (insights.dependencies.edges.length === 0) {
    paragraph("No inter-module dependencies detected.");
  } else {
    table(["From", "To", "Weight"], insights.dependencies.edges.map((e) => [
      e.from,
      e.to,
      String(e.weight),
    ]));
  }

  heading("Tech Stack");
  if (insights.techStack.length === 0) {
    paragraph("No tech stack detected.");
  } else {
    insights.techStack.forEach((t) => bullet(sanitize(t.version ? `${t.name} ${t.version}` : t.name)));
  }

  heading("Timeline");
  if (insights.timeline.totalCommits > 0) {
    table(["Metric", "Value"], [
      ["Total commits", String(insights.timeline.totalCommits)],
      ["Contributors", String(insights.timeline.contributors)],
      ["Started", insights.timeline.startedAt ? fmtDate(insights.timeline.startedAt) : "N/A"],
      ["Last active", insights.timeline.lastActiveAt ? fmtDate(insights.timeline.lastActiveAt) : "N/A"],
    ]);
  }
  for (const event of insights.timeline.events) {
    const author = event.author ? ` - ${event.author}` : "";
    const description = event.description ? ` (${sanitize(event.description)})` : "";
    bullet(sanitize(`${fmtDate(event.date)}: ${event.label}${author}${description}`));
  }

  heading("Health");
  table(["Area", "Score", "Status"], [
    ["Documentation", insights.docHealth === null ? "N/A" : `${insights.docHealth}/100`, scoreToLabel(insights.docHealth)],
    ["Security", insights.securityHealth === null ? "N/A" : `${insights.securityHealth}/100`, scoreToLabel(insights.securityHealth)],
    ["Performance", insights.performanceHealth === null ? "N/A" : `${insights.performanceHealth}/100`, scoreToLabel(insights.performanceHealth)],
    ["Maintainability", insights.maintainabilityHealth === null ? "N/A" : `${insights.maintainabilityHealth}/100`, scoreToLabel(insights.maintainabilityHealth)],
    ["Overall", insights.overallHealth === null ? "N/A" : `${insights.overallHealth}/100`, scoreToLabel(insights.overallHealth)],
  ]);

  heading("Recommendations");
  if (insights.recommendations.length === 0) {
    paragraph("No recommendations available.");
  } else {
    insights.recommendations.forEach((rec) => {
      const detail = rec.detail ? ` - ${sanitize(rec.detail)}` : "";
      bullet(sanitize(`[${rec.severity.toUpperCase()}] ${rec.text}${detail}`));
    });
  }

  return doc.save();
};

export const writePdfReport = async (insights: ProjectInsightsRecord, filePath: string): Promise<void> => {
  const bytes = await buildPdf(insights);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, bytes);
};
