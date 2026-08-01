import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import type { ContextBlock } from "../types.js";
import { fileExistsInRepo } from "./repo.js";

const MAX_BLOCK_CHARS = 16_000;
const MAX_SIGNATURE_CHARS = 600;

const JS_TS_EXT = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

const extractFileLines = (
  stackTrace: string,
  relPath: string
): number[] => {
  const escaped = relPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}:?(\\d+)?(?::(\\d+))?`, "g");
  const lines: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(stackTrace)) !== null) {
    const line = Number(m[1]);
    if (line > 0) lines.push(line);
  }
  return lines.length > 0 ? lines : [1];
};

const truncateWithMarker = (
  text: string,
  maxChars: number
): { content: string; omittedLines: number } => {
  const lines = text.split("\n");
  if (text.length <= maxChars) {
    return { content: text, omittedLines: 0 };
  }
  const keepStart = Math.floor(maxChars * 0.5);
  const keepEnd = Math.floor(maxChars * 0.35);
  const start = lines.slice(0, keepStart).join("\n");
  const end = lines.slice(-keepEnd).join("\n");
  const omitted = lines.length - keepStart - keepEnd;
  return {
    content: `${start}\n# ... [truncated, ${omitted} lines omitted] ...\n${end}`,
    omittedLines: omitted,
  };
};

const signatureOf = (node: ts.Node): string => {
  const print = (n: ts.Node) =>
    n
      .getText()
      .split("\n")[0]
      .slice(0, MAX_SIGNATURE_CHARS);
  return print(node);
};

const findCalledNames = (node: ts.Node): string[] => {
  const names = new Set<string>();
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) || ts.isNewExpression(n)) {
      const callee = n.expression;
      const name = ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : callee.getText().trim();
      if (name && !name.includes(" ")) names.add(name);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return Array.from(names);
};

const extractTsContext = (
  fileName: string,
  sourceText: string,
  lines: number[]
): ContextBlock | null => {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );
  const lineStarts = sourceFile.getLineStarts();
  const positions = lines
    .map((line) => lineStarts[line - 1])
    .filter((p): p is number => p !== undefined);

  const target = positions[0];
  if (target === undefined) return null;

  let enclosing: ts.Node | null = null;
  const visit = (node: ts.Node) => {
    if (node.getStart(sourceFile) <= target && node.getEnd() >= target) {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isSourceFile(node)
      ) {
        if (enclosing === null || node.getStart(sourceFile) >= enclosing.getStart(sourceFile)) {
          enclosing = node;
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  let node: ts.Node | null = null;
  if (enclosing && !ts.isSourceFile(enclosing as ts.Node)) {
    node = enclosing as ts.Node;
  }
  const startLine = node
    ? sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    : 1;
  const endLine = node
    ? sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1
    : sourceText.split("\n").length;

  let content: string;
  if (node) {
    const allLines = sourceText.split("\n");
    content = allLines
      .slice(startLine - 1, endLine)
      .join("\n");
    const calledNames = findCalledNames(node);
    if (calledNames.length > 0) {
      const signatures: string[] = [];
      const visitSig = (n: ts.Node) => {
        if (
          (ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n) || ts.isFunctionExpression(n) ||
            ts.isArrowFunction(n)) &&
          n !== node
        ) {
          const nameNode = (n as ts.FunctionLikeDeclaration).name;
          const name = nameNode ? nameNode.getText() : "";
          if (name && calledNames.includes(name)) {
            signatures.push(`${name} ${signatureOf(n)}`);
          }
        }
        ts.forEachChild(n, visitSig);
      };
      visitSig(sourceFile);
      if (signatures.length > 0) {
        content += `\n\n--- Called signatures in this file ---\n${Array.from(new Set(signatures)).join("\n")}`;
      }
    }
  } else {
    const start = Math.max(0, target - 800);
    const end = Math.min(sourceText.length, target + 1200);
    content = sourceText.slice(start, end);
  }

  const { content: final } = truncateWithMarker(content, MAX_BLOCK_CHARS);
  return {
    file: fileName,
    startLine,
    endLine,
    content: final,
  };
};

const extractPythonContext = (
  fileName: string,
  sourceText: string,
  lines: number[]
): ContextBlock | null => {
  const all = sourceText.split("\n");
  const line = lines[0] ?? 1;
  const targetIdx = Math.min(Math.max(line - 1, 0), all.length - 1);

  let startIdx = targetIdx;
  let endIdx = targetIdx;
  let blockIndent: number | null = null;

  for (let i = targetIdx; i >= 0; i--) {
    const trimmed = all[i].trim();
    if (!trimmed) continue;
    const indent = all[i].match(/^\s*/)![0].length;
    if (/^(def|class)\s/.test(trimmed)) {
      startIdx = i;
      blockIndent = indent;
      break;
    }
    if (blockIndent === null) {
      blockIndent = indent;
      continue;
    }
    if (indent < blockIndent) {
      startIdx = i;
      break;
    }
  }

  const indentOfStart = all[startIdx].match(/^\s*/)![0].length;
  for (let i = startIdx + 1; i < all.length; i++) {
    const lineText = all[i];
    if (!lineText.trim()) continue;
    const indent = lineText.match(/^\s*/)![0].length;
    if (indent <= indentOfStart) {
      endIdx = i - 1;
      break;
    }
  }
  if (endIdx <= startIdx) endIdx = Math.min(all.length - 1, startIdx + 40);

  const content = all.slice(startIdx, endIdx + 1).join("\n");
  const { content: final, omittedLines } = truncateWithMarker(content, MAX_BLOCK_CHARS);
  return {
    file: fileName,
    startLine: startIdx + 1,
    endLine: endIdx + 1,
    content: final,
  };
};

export const buildContextBlocks = (
  repoDir: string,
  stackTrace: string,
  implicatedFiles: string[]
): ContextBlock[] => {
  const blocks: ContextBlock[] = [];
  for (const relPath of implicatedFiles) {
    if (!fileExistsInRepo(repoDir, relPath)) continue;
    const absolute = path.resolve(repoDir, relPath);
    const sourceText = fs.readFileSync(absolute, "utf-8");
    const lines = extractFileLines(stackTrace, relPath);

    if (JS_TS_EXT.test(relPath)) {
      const block = extractTsContext(relPath, sourceText, lines);
      if (block) blocks.push(block);
    } else if (/\.py$/.test(relPath)) {
      const block = extractPythonContext(relPath, sourceText, lines);
      if (block) blocks.push(block);
    } else {
      const all = sourceText.split("\n");
      const line = lines[0] ?? 1;
      const start = Math.max(0, line - 20);
      const end = Math.min(all.length, line + 20);
      const content = all.slice(start, end).join("\n");
      blocks.push({
        file: relPath,
        startLine: start + 1,
        endLine: end,
        content,
      });
    }
  }
  return blocks;
};
