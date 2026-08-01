import fs from "node:fs";
import path from "node:path";
import { exec } from "./docker.js";
import { fileExistsInRepo, normalizeRelPath } from "./repo.js";

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
}

export interface ParsedDiff {
  files: {
    path: string;
    hunks: DiffHunk[];
  }[];
}

const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

const stripQuotes = (s: string): string =>
  s.replace(/^["']|["']$/g, "");

interface PatchLine {
  kind: " " | "-" | "+";
  content: string;
}

interface FileBlock {
  path: string;
  hunks: Array<{ oldStart: number; lines: PatchLine[] }>;
}

const parseFileBlocks = (diffText: string): FileBlock[] => {
  const files: FileBlock[] = [];
  let current: FileBlock | null = null;

  for (const raw of diffText.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("diff --git ")) {
      const m = line.match(/diff --git a\/.* b\/(.+)/);
      current = { path: m ? stripQuotes(m[1]) : "", hunks: [] };
      files.push(current);
      continue;
    }
    if (line.startsWith("+++ ")) {
      current = {
        path: normalizeRelPath(stripQuotes(line.slice(4).replace(/^[ab]\//, ""))),
        hunks: [],
      };
      files.push(current);
      continue;
    }
    if (line.startsWith("@@ ")) {
      const m = line.match(HUNK_RE);
      if (m && current) {
        current.hunks.push({ oldStart: Number(m[1]), lines: [] });
      }
      continue;
    }
    if (!current || current.hunks.length === 0) continue;
    if (line.startsWith("\\")) continue;
    if (line.startsWith("--- ") || line.startsWith("+++ ")) continue;
    const hunk = current.hunks[current.hunks.length - 1];
    if (line.startsWith("-")) {
      hunk.lines.push({ kind: "-", content: line.slice(1) });
    } else if (line.startsWith("+")) {
      hunk.lines.push({ kind: "+", content: line.slice(1) });
    } else if (line.startsWith(" ")) {
      hunk.lines.push({ kind: " ", content: line.slice(1) });
    } else {
      hunk.lines.push({ kind: " ", content: line });
    }
  }

  const byPath = new Map<string, FileBlock>();
  for (const f of files) {
    if (!f.path) continue;
    byPath.set(f.path, f);
  }
  return Array.from(byPath.values()).filter((f) => f.path && f.hunks.length > 0);
};

export const parseDiff = (diffText: string): ParsedDiff => {
  const blocks = parseFileBlocks(diffText);
  return {
    files: blocks.map((b) => {
      let shift = 0;
      return {
        path: b.path,
        hunks: b.hunks.map((h) => {
          const oldLines = h.lines.filter((l) => l.kind !== "+").length;
          const newLines = h.lines.filter((l) => l.kind !== "-").length;
          const hunk: DiffHunk = {
            oldStart: h.oldStart,
            oldLines,
            newStart: h.oldStart + shift,
            newLines,
          };
          shift += newLines - oldLines;
          return hunk;
        }),
      };
    }),
  };
};

const readRepoLines = (
  repoDir: string,
  relPath: string
): string[] | null => {
  const absolute = path.resolve(repoDir, relPath);
  if (!absolute.startsWith(path.resolve(repoDir))) return null;
  try {
    return fs.readFileSync(absolute, "utf-8").split("\n");
  } catch {
    return null;
  }
};

const clean = (s: string): string => s.replace(/\r$/, "");

const matchesIgnoringWhitespace = (a: string, b: string): boolean =>
  a.trim() === b.trim();

const findLineForward = (
  fileLines: string[],
  content: string,
  from: number
): number => {
  for (let i = from; i < fileLines.length; i++) {
    if (matchesIgnoringWhitespace(content, fileLines[i])) return i;
  }
  return -1;
};

const findBlankLineForward = (
  fileLines: string[],
  from: number
): number => {
  for (let i = from; i < fileLines.length; i++) {
    if (fileLines[i].trim() === "") return i;
  }
  return -1;
};

/**
 * Locates each `-` line of the LLM hunk in the on-disk file, mapping them to
 * 0-based line indexes by sequential forward matching (whitespace-insensitive).
 * Returns null if a removed line cannot be located, so the caller can fall
 * back to a positional diff.
 */
const mapRemovedLines = (
  fileLines: string[],
  removed: string[],
  oldStart: number
): number[] | null => {
  const indexes: number[] = [];
  let cursor = Math.max(0, oldStart - 1 - 5);
  for (let i = 0; i < removed.length; i++) {
    const target = removed[i];
    let idx = findLineForward(fileLines, target, cursor);
    if (idx === -1 && target.trim() === "") {
      idx = findBlankLineForward(fileLines, cursor);
    }
    if (idx === -1) return null;
    if (indexes.length > 0 && idx <= indexes[indexes.length - 1]) {
      let next = findLineForward(fileLines, target, indexes[indexes.length - 1] + 1);
      if (next === -1 && target.trim() === "") {
        next = findBlankLineForward(fileLines, indexes[indexes.length - 1] + 1);
      }
      if (next === -1) return null;
      idx = next;
    }
    indexes.push(idx);
    cursor = idx + 1;
  }
  return indexes;
};

const withIndent = (addedLine: string, removedLine: string): string => {
  if (addedLine.trim() === "") return addedLine;
  if (addedLine.length === 0 || !/^\s/.test(addedLine)) {
    const indent = (removedLine.match(/^\s*/) ?? [""])[0];
    return `${indent}${addedLine.trim()}`;
  }
  return addedLine;
};

interface RebuiltHunk {
  oldStart: number;
  newStart: number;
  lines: string[];
}

/**
 * Rebuilds one hunk against the real file content. LLM-generated hunks
 * frequently carry wrong context lines and dropped indentation; this anchors
 * the change to the on-disk lines (via the `-` lines) and emits context that
 * is guaranteed to match the file, so `git apply` succeeds.
 */
const rebuildHunk = (
  fileLines: string[],
  oldStart: number,
  lines: PatchLine[]
): RebuiltHunk | null => {
  const removed = lines.filter((l) => l.kind === "-").map((l) => l.content);
  const added = lines.filter((l) => l.kind === "+").map((l) => l.content);

  let removedIndexes: number[];
  if (removed.length === 0) {
    removedIndexes = [];
  } else {
    const mapped = mapRemovedLines(fileLines, removed, oldStart);
    if (mapped === null) return null;
    removedIndexes = mapped;
  }

  const ctxBefore = 3;
  const ctxAfter = 3;
  const removedSet = new Set(removedIndexes);
  let regionStart: number;
  let regionEnd: number;
  let insertAt = -1;

  if (removedIndexes.length > 0) {
    regionStart = Math.max(0, removedIndexes[0] - ctxBefore);
    regionEnd = Math.min(fileLines.length - 1, removedIndexes[removedIndexes.length - 1] + ctxAfter);
  } else {
    const ctx = lines.filter((l) => l.kind === " ").map((l) => l.content);
    let anchor = -1;
    let cursor = Math.max(0, oldStart - 1 - ctxBefore);
    for (const c of ctx) {
      const idx = findLineForward(fileLines, c, cursor);
      if (idx === -1) continue;
      cursor = idx + 1;
      anchor = idx;
    }
    insertAt =
      anchor === -1
        ? Math.max(0, Math.min(oldStart - 1, fileLines.length - 1))
        : anchor + 1;
    regionStart = Math.max(0, insertAt - ctxBefore);
    regionEnd = Math.min(fileLines.length - 1, insertAt - 1 + ctxAfter);
  }

  const out: string[] = [];
  let addedCursor = 0;

  for (let i = regionStart; i <= regionEnd; i++) {
    const actual = clean(fileLines[i] ?? "");
    if (removedIndexes.length > 0) {
      if (removedSet.has(i)) {
        out.push(`-${actual}`);
        if (addedCursor < added.length) {
          out.push(`+${withIndent(added[addedCursor], actual)}`);
          addedCursor++;
        }
        continue;
      }
      out.push(` ${actual}`);
      continue;
    }

    out.push(` ${actual}`);
    if (i === insertAt - 1) {
      for (const a of added) out.push(`+${a}`);
      addedCursor = added.length;
    }
  }

  if (removedIndexes.length > 0) {
    while (addedCursor < added.length) {
      out.push(`+${added[addedCursor]}`);
      addedCursor++;
    }
  } else if (insertAt > regionEnd) {
    for (const a of added) out.push(`+${a}`);
  }

  const oldCount = out.filter((l) => l.startsWith(" ") || l.startsWith("-")).length;
  const newCount = out.filter((l) => l.startsWith(" ") || l.startsWith("+")).length;

  return {
    oldStart: regionStart + 1,
    newStart: regionStart + 1,
    lines: out,
  };
};

const applyHunkToState = (
  state: string[],
  rebuilt: RebuiltHunk
): string[] => {
  const next = [...state];
  const oldBlock = rebuilt.lines.filter((l) => l.startsWith(" ") || l.startsWith("-"));
  const newBlock = rebuilt.lines
    .filter((l) => l.startsWith(" ") || l.startsWith("+"))
    .map((l) => l.slice(1));
  next.splice(rebuilt.oldStart - 1, oldBlock.length, ...newBlock);
  return next;
};

/**
 * Re-anchors every hunk of the diff against the on-disk repository files,
 * producing a unified diff whose context lines come from the actual file
 * content. This makes LLM-generated patches apply reliably.
 */
export const rebuildPatch = (
  diffText: string,
  repoDir: string
): string => {
  const out: string[] = [];
  const blocks = parseFileBlocks(diffText);

  for (const block of blocks) {
    const filePath = normalizeRelPath(block.path);
    const fileExists = fileExistsInRepo(repoDir, filePath);
    const workingLines = fileExists ? readRepoLines(repoDir, filePath) : null;

    out.push(`diff --git a/${filePath} b/${filePath}`);
    out.push(`--- a/${filePath}`);
    out.push(`+++ b/${filePath}`);

    if (workingLines === null) {
      for (const hunk of block.hunks) {
        const oldCount = hunk.lines.filter((l) => l.kind !== "+").length;
        const newCount = hunk.lines.filter((l) => l.kind !== "-").length;
        out.push(
          `@@ -${hunk.oldStart}${oldCount ? `,${oldCount}` : ""} +${hunk.oldStart}${newCount ? `,${newCount}` : ""} @@`
        );
        for (const l of hunk.lines) out.push(`${l.kind}${l.content}`);
      }
      continue;
    }

    let state = [...workingLines];

    for (const hunk of block.hunks) {
      const rebuilt = rebuildHunk(state, hunk.oldStart, hunk.lines);

      if (!rebuilt) {
        const oldCount = hunk.lines.filter((l) => l.kind !== "+").length;
        const newCount = hunk.lines.filter((l) => l.kind !== "-").length;
        out.push(
          `@@ -${hunk.oldStart}${oldCount ? `,${oldCount}` : ""} +${hunk.oldStart}${newCount ? `,${newCount}` : ""} @@`
        );
        for (const l of hunk.lines) out.push(`${l.kind}${l.content}`);
        const oldBlock = hunk.lines.filter((l) => l.kind !== "+").map((l) => l.content);
        const newBlock = hunk.lines.filter((l) => l.kind !== "-").map((l) => l.content);
        const startIdx = Math.max(0, hunk.oldStart - 1);
        state.splice(startIdx, oldBlock.length, ...newBlock);
        continue;
      }

      const oldCount = rebuilt.lines.filter((l) => l.startsWith(" ") || l.startsWith("-")).length;
      const newCount = rebuilt.lines.filter((l) => l.startsWith(" ") || l.startsWith("+")).length;
      out.push(
        `@@ -${rebuilt.oldStart},${oldCount} +${rebuilt.newStart},${newCount} @@`
      );
      out.push(...rebuilt.lines);
      state = applyHunkToState(state, rebuilt);
    }
  }

  return out.join("\n");
};

export const repairDiff = (diffText: string): string => {
  const lines = diffText.split("\n");
  const repaired: string[] = [];
  let hunkHeader: string | null = null;
  let body: string[] = [];
  let oldCount = 0;
  let newCount = 0;

  const flushHunk = () => {
    if (hunkHeader === null) return;
    const m = hunkHeader.match(HUNK_RE);
    if (m) {
      repaired.push(`@@ -${m[1]}${oldCount ? `,${oldCount}` : ""} +${m[3]}${newCount ? `,${newCount}` : ""} @@`);
    } else {
      repaired.push(hunkHeader);
    }
    repaired.push(...body);
    hunkHeader = null;
    body = [];
    oldCount = 0;
    newCount = 0;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("@@ ")) {
      flushHunk();
      hunkHeader = line;
      continue;
    }
    if (hunkHeader !== null) {
      const endsHunk =
        line.startsWith("diff --git ") ||
        line.startsWith("--- ") ||
        line.startsWith("+++ ");
      if (endsHunk) {
        flushHunk();
        repaired.push(line);
        continue;
      }
      let out = line;
      if (!/^[\s+\-\\]/.test(line)) {
        out = ` ${line}`;
      }
      const kind = out[0];
      if (kind === " " || kind === "-") oldCount++;
      if (kind === " " || kind === "+") newCount++;
      body.push(out);
      continue;
    }
    repaired.push(line);
  }
  flushHunk();

  return repaired.join("\n");
};

export const validatePatch = (
  diffText: string,
  allowList: string[]
): { ok: boolean; files: string[]; errors: string[] } => {
  const parsed = parseDiff(diffText);
  const errors: string[] = [];

  if (parsed.files.length === 0) {
    return { ok: false, files: [], errors: ["No files parsed from diff"] };
  }

  if (parsed.files.length > 2) {
    return {
      ok: false,
      files: parsed.files.map((f) => f.path),
      errors: [
        `Patch touches ${parsed.files.length} files (max 2 allowed): ${parsed.files
          .map((f) => f.path)
          .join(", ")}`,
      ],
    };
  }

  const allowed = new Set(allowList.map((a) => normalizeRelPath(a)));
  const outside = parsed.files.filter((f) => !allowed.has(f.path));

  if (outside.length > 0) {
    return {
      ok: false,
      files: parsed.files.map((f) => f.path),
      errors: [
        `Patch touches files outside the implicated allow-list: ${outside
          .map((f) => f.path)
          .join(", ")}. Allowed: ${Array.from(allowed).join(", ")}`,
      ],
    };
  }

  return {
    ok: true,
    files: parsed.files.map((f) => f.path),
    errors: [],
  };
};

export const applyPatch = async (
  repoDir: string,
  diffText: string
): Promise<{ ok: boolean; method: string; stderr?: string }> => {
  const diffFile = path.join(repoDir, ".repoverify.patch");
  fs.writeFileSync(
    diffFile,
    `${repairDiff(rebuildPatch(diffText, repoDir))}\n`,
    "utf-8"
  );

  const attempts: Array<{ label: string; args: string[] }> = [
    { label: "git-apply", args: ["apply"] },
    { label: "git-apply-whitespace", args: ["apply", "--ignore-whitespace", "--recount"] },
  ];

  let lastStderr = "";
  for (const attempt of attempts) {
    const result = await exec(
      "git",
      [...attempt.args, ".repoverify.patch"],
      { cwd: repoDir, timeoutMs: 30_000 }
    );
    if (result.exitCode === 0) {
      fs.rmSync(diffFile, { force: true });
      return { ok: true, method: attempt.label };
    }
    lastStderr = `${result.stderr || result.stdout}`;
  }

  const patchAvailable = await exec("where", ["patch"], { timeoutMs: 10_000 })
    .then((r) => r.exitCode === 0)
    .catch(() => false);

  if (patchAvailable) {
    const patchResult = await exec(
      "patch",
      ["-p1", "--fuzz=3", "-i", ".repoverify.patch"],
      { cwd: repoDir, timeoutMs: 30_000 }
    );
    if (patchResult.exitCode === 0) {
      fs.rmSync(diffFile, { force: true });
      return { ok: true, method: "patch-fuzz3" };
    }
    lastStderr = `${patchResult.stderr || patchResult.stdout}`;
  }

  fs.rmSync(diffFile, { force: true });
  return {
    ok: false,
    method: "none",
    stderr: lastStderr,
  };
};

export const getChangedLineRanges = (
  diffText: string
): Record<string, Array<{ start: number; end: number }>> => {
  const parsed = parseDiff(diffText);
  const ranges: Record<string, Array<{ start: number; end: number }>> = {};
  for (const file of parsed.files) {
    ranges[file.path] = file.hunks
      .filter((h) => h.newLines > 0)
      .map((h) => ({
        start: h.newStart,
        end: h.newStart + h.newLines - 1,
      }));
  }
  return ranges;
};

export const fileIsInRange = (
  file: string,
  line: number,
  ranges: Record<string, Array<{ start: number; end: number }>>,
  padding = 5
): boolean => {
  const fileRanges = ranges[file];
  if (!fileRanges) return false;
  return fileRanges.some(
    (r) => line >= r.start - padding && line <= r.end + padding
  );
};
