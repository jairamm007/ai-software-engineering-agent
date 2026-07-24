export interface AgentTool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (params: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ToolContext {
  repositoryId?: string;
  filePath?: string;
  codeContent?: string;
  fileExtension?: string;
  projectName?: string;
}

export interface ToolResult {
  success: boolean;
  output: string;
  data?: unknown;
  metadata?: Record<string, unknown>;
}

const registeredTools = new Map<string, AgentTool>();

export function registerTool(tool: AgentTool): void {
  registeredTools.set(tool.name, tool);
}

export function getTool(name: string): AgentTool | undefined {
  return registeredTools.get(name);
}

export function getAllTools(): AgentTool[] {
  return Array.from(registeredTools.values());
}

export function getToolsForAgent(agentType: string): AgentTool[] {
  const agentToolMap: Record<string, string[]> = {
    planner: ["analyze_query_complexity", "extract_entities"],
    retriever: ["search_variants", "expand_query", "filter_chunks"],
    reasoner: ["summarize_chunks", "extract_patterns", "build_context"],
    answer: ["format_evidence", "generate_references"],
    review: ["analyze_complexity", "extract_dependencies", "find_similar_issues"],
    fix: ["generate_diff", "validate_syntax", "suggest_alternatives"],
    test: ["generate_test_cases", "analyze_coverage", "create_mocks"],
    architecture: ["build_dependency_map", "analyze_layers", "identify_patterns"],
    documentation: ["extract_api_signature", "generate_examples", "create_toc"],
    security: ["scan_vulnerabilities", "check_owasp", "analyze_input_flows"],
    commit: ["analyze_changes", "format_conventional"],
    pullRequest: ["summarize_changes", "generate_checklist"],
    fix: ["generate_diff", "validate_syntax"],
  };

  const toolNames = agentToolMap[agentType] ?? [];
  return toolNames
    .map((name) => registeredTools.get(name))
    .filter((t): t is AgentTool => t !== undefined);
}

export function describeTools(tools: AgentTool[]): string {
  return tools.map((t) => {
    const params = t.parameters.map((p) =>
      `  - ${p.name} (${p.type}${p.required ? ", required" : ", optional"}): ${p.description}`
    ).join("\n");
    return `${t.name}: ${t.description}\n${params}`;
  }).join("\n\n");
}

registerTool({
  name: "analyze_query_complexity",
  description: "Analyzes the complexity and intent of a user query",
  parameters: [
    { name: "query", type: "string", description: "The user query to analyze", required: true },
  ],
  execute: async (params) => {
    const query = String(params.query);
    const wordCount = query.split(/\s+/).length;
    const hasCodeRefs = /\b(file|function|class|method|endpoint)\b/i.test(query);
    const hasAction = /\b(review|fix|generate|create|analyze|explain|test|audit)\b/i.test(query);

    let complexity: "simple" | "moderate" | "complex" = "simple";
    if (wordCount > 10 || (hasCodeRefs && hasAction)) complexity = "moderate";
    if (wordCount > 20 || (hasCodeRefs && hasAction && query.includes("and"))) complexity = "complex";

    return {
      success: true,
      output: JSON.stringify({ complexity, wordCount, hasCodeRefs, hasAction }),
      data: { complexity, wordCount, hasCodeRefs, hasAction },
    };
  },
});

registerTool({
  name: "extract_entities",
  description: "Extracts code entities (files, functions, classes) from a query",
  parameters: [
    { name: "query", type: "string", description: "The user query", required: true },
  ],
  execute: async (params) => {
    const query = String(params.query);
    const filePattern = /`([^`]+\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c|rb|php))`/g;
    const files: string[] = [];
    let match;
    while ((match = filePattern.exec(query)) !== null) {
      files.push(match[1]);
    }

    const funcPattern = /\b(\w+)\s*\(/g;
    const functions: string[] = [];
    while ((match = funcPattern.exec(query)) !== null) {
      functions.push(match[1]);
    }

    return {
      success: true,
      output: JSON.stringify({ files, functions }),
      data: { files, functions },
    };
  },
});

registerTool({
  name: "search_variants",
  description: "Generates multiple search query variants for better retrieval",
  parameters: [
    { name: "query", type: "string", description: "Original search query", required: true },
    { name: "taskType", type: "string", description: "Type of task being performed", required: true },
  ],
  execute: async (params) => {
    const query = String(params.query);
    const taskType = String(params.taskType);
    const variants: string[] = [query];

    const words = query.split(/\s+/).filter((w) => w.length > 3);
    if (words.length >= 2) {
      variants.push(words.slice(0, 4).join(" "));
    }

    const taskSpecific: Record<string, string> = {
      review: "code quality error",
      test: "test case assert mock",
      security: "auth input validation vulnerability",
      architecture: "module dependency structure",
      documentation: "API interface export",
    };

    if (taskSpecific[taskType]) {
      variants.push(`${words.slice(0, 2).join(" ")} ${taskSpecific[taskType]}`);
    }

    return {
      success: true,
      output: JSON.stringify(variants),
      data: variants,
    };
  },
});

registerTool({
  name: "expand_query",
  description: "Expands a query with synonyms and related terms",
  parameters: [
    { name: "query", type: "string", description: "Query to expand", required: true },
  ],
  execute: async (params) => {
    const query = String(params.query);
    const synonyms: Record<string, string[]> = {
      fix: ["improve", "refactor", "optimize", "clean"],
      bug: ["error", "issue", "defect", "problem"],
      test: ["spec", "assertion", "coverage", "mock"],
      security: ["vulnerability", "exploit", "injection", "XSS"],
      review: ["audit", "inspection", "analysis"],
    };

    const expandedTerms: string[] = [];
    for (const [key, syns] of Object.entries(synonyms)) {
      if (query.toLowerCase().includes(key)) {
        expandedTerms.push(...syns);
      }
    }

    return {
      success: true,
      output: JSON.stringify({ original: query, expandedTerms }),
      data: { original: query, expandedTerms },
    };
  },
});

registerTool({
  name: "filter_chunks",
  description: "Filters and ranks code chunks by relevance",
  parameters: [
    { name: "chunks", type: "array", description: "Array of code chunks", required: true },
    { name: "maxChunks", type: "number", description: "Maximum chunks to return", required: false, default: 15 },
  ],
  execute: async (params) => {
    const chunks = params.chunks as Array<{ distance: number; filePath: string; startLine: number; endLine: number }>;
    const maxChunks = Number(params.maxChunks ?? 15);

    const sorted = [...chunks].sort((a, b) => a.distance - b.distance);
    const filtered = sorted.slice(0, maxChunks);

    return {
      success: true,
      output: `Filtered ${chunks.length} chunks to ${filtered.length} most relevant`,
      data: filtered,
    };
  },
});

registerTool({
  name: "summarize_chunks",
  description: "Summarizes retrieved code chunks into key points",
  parameters: [
    { name: "chunks", type: "array", description: "Array of code chunks", required: true },
  ],
  execute: async (params) => {
    const chunks = params.chunks as Array<{ filePath: string; content: string; startLine: number; endLine: number }>;
    const fileMap = new Map<string, number>();

    for (const chunk of chunks) {
      fileMap.set(chunk.filePath, (fileMap.get(chunk.filePath) ?? 0) + 1);
    }

    const summary = Array.from(fileMap.entries())
      .map(([fp, count]) => `${fp}: ${count} chunks`)
      .join("\n");

    return {
      success: true,
      output: summary,
      data: { fileCount: fileMap.size, totalChunks: chunks.length },
    };
  },
});

registerTool({
  name: "extract_patterns",
  description: "Extracts design patterns and code patterns from context",
  parameters: [
    { name: "context", type: "string", description: "Code context to analyze", required: true },
  ],
  execute: async (params) => {
    const context = String(params.context);
    const patterns: string[] = [];

    if (/\bclass\b.*\bextends\b/.test(context)) patterns.push("Inheritance");
    if (/\binterface\b/.test(context)) patterns.push("Interface-based design");
    if (/\b(export|import)\b.*\b(default)\b/.test(context)) patterns.push("Module pattern");
    if (/\basync\b.*\bawait\b/.test(context)) patterns.push("Async/Await");
    if (/\btry\b.*\bcatch\b/.test(context)) patterns.push("Error handling");
    if (/\bnew\s+Map\b|\bnew\s+Set\b/.test(context)) patterns.push("Collection usage");
    if (/\bPromise\b.*\ball\b|\bPromise\b.*\brace\b/.test(context)) patterns.push("Promise combinators");

    return {
      success: true,
      output: `Found patterns: ${patterns.join(", ") || "No specific patterns detected"}`,
      data: patterns,
    };
  },
});

registerTool({
  name: "analyze_complexity",
  description: "Analyzes code complexity metrics",
  parameters: [
    { name: "code", type: "string", description: "Code to analyze", required: true },
  ],
  execute: async (params) => {
    const code = String(params.code);
    const lines = code.split("\n");
    const lineCount = lines.length;

    let cyclomaticComplexity = 1;
    const branchKeywords = /\b(if|else|elif|else if|for|while|switch|case|catch|&&|\|\|)\b/g;
    let match;
    while ((match = branchKeywords.exec(code)) !== null) {
      cyclomaticComplexity++;
    }

    const nestingDepth = Math.max(
      ...lines.map((line) => {
        const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;
        return Math.floor(indent / 2);
      }),
      0
    );

    let complexity: "low" | "medium" | "high" | "very_high" = "low";
    if (cyclomaticComplexity > 10 || nestingDepth > 4) complexity = "very_high";
    else if (cyclomaticComplexity > 7 || nestingDepth > 3) complexity = "high";
    else if (cyclomaticComplexity > 4 || nestingDepth > 2) complexity = "medium";

    return {
      success: true,
      output: JSON.stringify({ lineCount, cyclomaticComplexity, nestingDepth, complexity }),
      data: { lineCount, cyclomaticComplexity, nestingDepth, complexity },
    };
  },
});

registerTool({
  name: "extract_dependencies",
  description: "Extracts import dependencies from code",
  parameters: [
    { name: "code", type: "string", description: "Code to extract dependencies from", required: true },
  ],
  execute: async (params) => {
    const code = String(params.code);
    const importPattern = /(?:import|from|require)\s+[{(]?([^;{}\n]+)[})]?/g;
    const deps: string[] = [];
    let match;
    while ((match = importPattern.exec(code)) !== null) {
      deps.push(match[1].trim());
    }

    return {
      success: true,
      output: `Found ${deps.length} dependencies`,
      data: deps,
    };
  },
});

registerTool({
  name: "generate_test_cases",
  description: "Generates structured test case definitions",
  parameters: [
    { name: "functionName", type: "string", description: "Name of function to test", required: true },
    { name: "parameters", type: "string", description: "Function parameters description", required: false },
    { name: "returnType", type: "string", description: "Return type", required: false },
  ],
  execute: async (params) => {
    const fn = String(params.functionName);
    const testCases = [
      { name: `should handle valid input for ${fn}`, type: "happy_path" },
      { name: `should handle empty input for ${fn}`, type: "edge_case" },
      { name: `should handle null input for ${fn}`, type: "error_case" },
      { name: `should handle boundary values for ${fn}`, type: "edge_case" },
    ];

    return {
      success: true,
      output: `Generated ${testCases.length} test cases for ${fn}`,
      data: testCases,
    };
  },
});

registerTool({
  name: "analyze_coverage",
  description: "Analyzes test coverage gaps",
  parameters: [
    { name: "functions", type: "array", description: "List of functions in file", required: true },
    { name: "testFile", type: "string", description: "Existing test file content", required: false },
  ],
  execute: async (params) => {
    const functions = params.functions as string[];
    const gaps = functions.filter((fn) => fn.length > 0);

    return {
      success: true,
      output: `Found ${gaps.length} functions potentially needing tests`,
      data: { uncovered: gaps, coverageScore: functions.length > 0 ? ((functions.length - gaps.length) / functions.length * 100).toFixed(1) + "%" : "100%" },
    };
  },
});

registerTool({
  name: "create_mocks",
  description: "Creates mock definitions for dependencies",
  parameters: [
    { name: "dependencies", type: "array", description: "Dependencies to mock", required: true },
  ],
  execute: async (params) => {
    const deps = params.dependencies as string[];
    const mocks = deps.map((dep) => ({
      dependency: dep,
      mock: `vi.mock('${dep}', () => ({ default: vi.fn(), ...vi.fn() }))`,
    }));

    return {
      success: true,
      output: `Generated ${mocks.length} mock definitions`,
      data: mocks,
    };
  },
});

registerTool({
  name: "format_evidence",
  description: "Formats evidence references with file:line format",
  parameters: [
    { name: "references", type: "array", description: "Array of {file, line, description}", required: true },
  ],
  execute: async (params) => {
    const refs = params.references as Array<{ file: string; line: number; description: string }>;
    const formatted = refs.map((r) => `- \`${r.file}:${r.line}\` — ${r.description}`).join("\n");

    return {
      success: true,
      output: formatted,
      data: formatted,
    };
  },
});

registerTool({
  name: "build_dependency_map",
  description: "Builds a dependency relationship map from code context",
  parameters: [
    { name: "context", type: "string", description: "Code context", required: true },
  ],
  execute: async (params) => {
    const context = String(params.context);
    const importPattern = /from\s+['"]([^'"]+)['"]/g;
    const modules = new Map<string, string[]>();
    let match;

    while ((match = importPattern.exec(context)) !== null) {
      modules.set(match[1], []);
    }

    return {
      success: true,
      output: `Mapped ${modules.size} module dependencies`,
      data: Object.fromEntries(modules),
    };
  },
});

registerTool({
  name: "scan_vulnerabilities",
  description: "Scans code for common security vulnerabilities",
  parameters: [
    { name: "code", type: "string", description: "Code to scan", required: true },
    { name: "language", type: "string", description: "Programming language", required: false },
  ],
  execute: async (params) => {
    const code = String(params.code);
    const vulns: Array<{ type: string; severity: string; line?: number }> = [];

    const checks: Array<{ pattern: RegExp; type: string; severity: string }> = [
      { pattern: /eval\s*\(/g, type: "Code Injection (eval)", severity: "critical" },
      { pattern: /innerHTML\s*=/g, type: "XSS (innerHTML)", severity: "high" },
      { pattern: /dangerouslySetInnerHTML/g, type: "XSS (dangerouslySetInnerHTML)", severity: "high" },
      { pattern: /\bsql`[^`]*\$\{/g, type: "SQL Injection (template literal)", severity: "critical" },
      { pattern: /password\s*[:=]\s*['"][^'"]+['"]/g, type: "Hardcoded Password", severity: "critical" },
      { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/g, type: "Hardcoded Secret", severity: "critical" },
      { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/g, type: "Hardcoded API Key", severity: "high" },
      { pattern: /exec\s*\(/g, type: "Command Injection (exec)", severity: "critical" },
      { pattern: /child_process/g, type: "Child Process Usage", severity: "medium" },
      { pattern: /\.random\(\)/g, type: "Insecure Randomness", severity: "medium" },
    ];

    for (const check of checks) {
      let m;
      while ((m = check.pattern.exec(code)) !== null) {
        const lineNumber = code.slice(0, m.index).split("\n").length;
        vulns.push({ type: check.type, severity: check.severity, line: lineNumber });
      }
    }

    return {
      success: true,
      output: `Found ${vulns.length} potential vulnerabilities`,
      data: vulns,
    };
  },
});

registerTool({
  name: "generate_diff",
  description: "Generates a structured diff description",
  parameters: [
    { name: "original", type: "string", description: "Original code", required: true },
    { name: "improved", type: "string", description: "Improved code", required: true },
  ],
  execute: async (params) => {
    const original = String(params.original).split("\n");
    const improved = String(params.improved).split("\n");

    const added = improved.filter((l) => !original.includes(l));
    const removed = original.filter((l) => !improved.includes(l));

    return {
      success: true,
      output: `+${added.length} lines added, -${removed.length} lines removed`,
      data: { added, removed, addedCount: added.length, removedCount: removed.length },
    };
  },
});

registerTool({
  name: "validate_syntax",
  description: "Performs basic syntax validation on code",
  parameters: [
    { name: "code", type: "string", description: "Code to validate", required: true },
    { name: "language", type: "string", description: "Programming language", required: false },
  ],
  execute: async (params) => {
    const code = String(params.code);
    const issues: string[] = [];

    const openBraces = (code.match(/{/g) ?? []).length;
    const closeBraces = (code.match(/}/g) ?? []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
    }

    const openParens = (code.match(/\(/g) ?? []).length;
    const closeParens = (code.match(/\)/g) ?? []).length;
    if (openParens !== closeParens) {
      issues.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
    }

    return {
      success: true,
      output: issues.length > 0 ? `Found ${issues.length} syntax issues` : "No syntax issues detected",
      data: { valid: issues.length === 0, issues },
    };
  },
});
