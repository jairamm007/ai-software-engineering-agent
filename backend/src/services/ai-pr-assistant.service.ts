export const generatePRDescription = async (params: {
  owner: string;
  repo: string;
  commits: Array<{ message: string; sha: string; author: string }>;
  baseBranch: string;
  headBranch: string;
  title?: string;
}): Promise<{
  title: string;
  description: string;
  type: "feat" | "fix" | "refactor" | "docs" | "test" | "chore" | "other";
}> => {
  const commitMessages = params.commits.map((c) => c.message);

  const type = detectPRType(commitMessages);
  const title = params.title ?? generateTitle(type, commitMessages);
  const description = generateDescriptionText(
    type,
    params.headBranch,
    params.baseBranch,
    commitMessages,
    params.commits
  );

  return { title, description, type };
};

export const generatePRReview = async (params: {
  owner: string;
  repo: string;
  pullNumber: number;
  files: Array<{ filename: string; additions: number; deletions: number; status: string; patch?: string }>;
}): Promise<{
  summary: string;
  comments: Array<{ path: string; line: number; body: string; severity: "info" | "warning" | "error" }>;
  verdict: "approve" | "changes_requested" | "comment";
}> => {
  const comments: Array<{ path: string; line: number; body: string; severity: "info" | "warning" | "error" }> = [];
  let totalIssues = 0;
  let hasErrors = false;

  for (const file of params.files) {
    if (file.patch) {
      const fileComments = analyzeFilePatch(file.filename, file.patch, file.additions + file.deletions);
      comments.push(...fileComments);
      if (fileComments.some((c) => c.severity === "error")) hasErrors = true;
      totalIssues += fileComments.length;
    }
  }

  const addCount = params.files.reduce((s, f) => s + f.additions, 0);
  const delCount = params.files.reduce((s, f) => s + f.deletions, 0);
  const fileCount = params.files.length;

  const summary = generateReviewSummary(addCount, delCount, fileCount, totalIssues, hasErrors);

  const verdict = hasErrors ? "changes_requested" : totalIssues > 5 ? "comment" : "approve";

  return { summary, comments, verdict };
};

export const suggestPRTitle = async (params: {
  commits: Array<{ message: string; sha: string }>;
  headBranch: string;
  baseBranch: string;
}): Promise<{
  titles: string[];
  suggestedTitle: string;
  type: string;
}> => {
  const messages = params.commits.map((c) => c.message);
  const type = detectPRType(messages);
  const titles = generateTitleOptions(type, messages, params.headBranch);
  return {
    titles,
    suggestedTitle: titles[0],
    type,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const PR_TYPES = ["feat", "fix", "refactor", "docs", "test", "chore"] as const;

const TYPE_PATTERNS: Record<string, RegExp[]> = {
  feat: [/^feat/, /^feature/, /^add/, /^implement/, /^new/, /^create/],
  fix: [/^fix/, /^bug/, /^hotfix/, /^patch/, /^resolve/, /^correct/, /^repair/],
  refactor: [/^refactor/, /^clean/, /^improve/, /^optimize/, /^simplify/, /^extract/, /^rework/],
  docs: [/^docs/, /^document/, /^readme/, /^comment/],
  test: [/^test/, /^spec/, /^coverage/, /^assert/],
  chore: [/^chore/, /^bump/, /^update dep/, /^version/, /^ci/, /^config/, /^merge/, /^release/],
};

const detectPRType = (messages: string[]): "feat" | "fix" | "refactor" | "docs" | "test" | "chore" | "other" => {
  for (const msg of messages) {
    const lower = msg.toLowerCase();
    for (const [type, patterns] of Object.entries(TYPE_PATTERNS)) {
      if (patterns.some((p) => p.test(lower))) {
        return type as typeof PR_TYPES[number];
      }
    }
  }
  return "other";
};

const generateTitle = (
  type: string,
  messages: string[]
): string => {
  const firstMsg = messages[0]?.split("\n")[0] ?? "";
  if (type === "other") {
    const branchMsg = firstMsg.replace(/^[^a-zA-Z]+/, "");
    return branchMsg.charAt(0).toUpperCase() + branchMsg.slice(1).slice(0, 72);
  }
  const cleanMsg = firstMsg
    .replace(/^(feat|fix|refactor|docs|test|chore|feature|bug|hotfix)\s*[(:]/i, "")
    .replace(/[)\]]/, "")
    .trim();
  return `${type}: ${cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1)}`.slice(0, 72);
};

const generateTitleOptions = (
  type: string,
  messages: string[],
  headBranch: string
): string[] => {
  const titles: string[] = [];
  const baseTitle = generateTitle(type, messages);
  titles.push(baseTitle);

  if (messages.length > 1) {
    const scope = headBranch.includes("/") ? headBranch.split("/").pop() : headBranch;
    const scopedTitle = `${baseTitle.slice(0, 60)} (${scope})`;
    if (scopedTitle !== baseTitle) titles.push(scopedTitle);
  }

  const shortTitle = messages.length > 1
    ? `Update ${messages.length} files`
    : baseTitle;
  if (shortTitle !== baseTitle) titles.push(shortTitle);

  return [...new Set(titles)];
};

const generateDescriptionText = (
  type: string,
  headBranch: string,
  baseBranch: string,
  messages: string[],
  commits: Array<{ message: string; sha: string; author: string }>
): string => {
  const lines: string[] = [];

  if (messages.length === 1) {
    lines.push(messages[0].split("\n")[0]);
    const body = messages[0].split("\n").slice(1).filter(Boolean).join("\n");
    if (body) lines.push("", body);
  } else {
    lines.push("## Summary");
    lines.push("");
    lines.push(`This PR contains **${commits.length} commits** across \`${headBranch}\` → \`${baseBranch}\`.`);
    lines.push("");
    lines.push("### Changes");
    lines.push("");
    for (const msg of messages) {
      const firstLine = msg.split("\n")[0];
      lines.push(`- ${firstLine}`);
    }
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`**Type:** ${type}`);
  lines.push(`**Branch:** \`${headBranch}\` → \`${baseBranch}\``);

  return lines.join("\n");
};

const analyzeFilePatch = (
  filename: string,
  patch: string,
  totalChanges: number
): Array<{ path: string; line: number; body: string; severity: "info" | "warning" | "error" }> => {
  const comments: Array<{ path: string; line: number; body: string; severity: "info" | "warning" | "error" }> = [];
  const lines = patch.split("\n");

  let currentLine = 0;
  let addedLines = 0;
  let largeFunctions = 0;
  let todoCount = 0;
  let debugCount = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = line.match(/\+(\d+)/);
      if (match) currentLine = parseInt(match[1], 10);
      continue;
    }

    if (line.startsWith("+")) {
      addedLines++;
      const content = line.slice(1).trim();

      if (content.includes("TODO") || content.includes("FIXME") || content.includes("HACK")) {
        todoCount++;
        if (todoCount <= 3) {
          comments.push({
            path: filename,
            line: currentLine,
            body: `Consider addressing this TODO/FIXME before merging.`,
            severity: "info",
          });
        }
      }

      if (content.includes("console.log") || content.includes("debugger") || content.includes("console.debug")) {
        debugCount++;
        if (debugCount <= 3) {
          comments.push({
            path: filename,
            line: currentLine,
            body: `Remove debug statement before merging.`,
            severity: "warning",
          });
        }
      }

      // Check for very long lines
      if (content.length > 200) {
        comments.push({
          path: filename,
          line: currentLine,
          body: `This line is very long (${content.length} chars). Consider breaking it up for readability.`,
          severity: "info",
        });
      }

      // Check for large function-like additions
      if (content.includes("function ") || content.includes("=> {") || content.includes("=>(")) {
        largeFunctions++;
      }
    }

    if (!line.startsWith("-")) currentLine++;
  }

  // Large file warning
  if (totalChanges > 300) {
    comments.push({
      path: filename,
      line: 1,
      body: `This file has ${totalChanges} changes. Consider splitting into smaller PRs.`,
      severity: "warning",
    });
  }

  // No comments for small, clean files
  if (comments.length === 0 && addedLines > 10) {
    comments.push({
      path: filename,
      line: 1,
      body: `Looks clean! ${addedLines} lines added with no obvious issues.`,
      severity: "info",
    });
  }

  return comments;
};

const generateReviewSummary = (
  additions: number,
  deletions: number,
  files: number,
  issues: number,
  hasErrors: boolean
): string => {
  const lines: string[] = [];
  lines.push(`## AI Review Summary`);
  lines.push(``);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Files changed | ${files} |`);
  lines.push(`| Additions | ${additions} |`);
  lines.push(`| Deletions | ${deletions} |`);
  lines.push(`| Issues found | ${issues} |`);
  lines.push(``);

  if (hasErrors) {
    lines.push(`⚠️ **Changes requested**: Found issues that should be addressed before merging.`);
  } else if (issues > 5) {
    lines.push(`💬 **Comments**: Some minor suggestions for improvement.`);
  } else if (issues > 0) {
    lines.push(`✅ **Looks good**: A few minor things to consider.`);
  } else {
    lines.push(`✅ **Approved**: No issues detected in this PR.`);
  }

  return lines.join("\n");
};
