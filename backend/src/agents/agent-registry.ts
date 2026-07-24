import { AgentType } from "./agent.types.js";

export interface AgentCapability {
  name: string;
  description: string;
}

export interface AgentMetadata {
  type: AgentType;
  displayName: string;
  description: string;
  capabilities: AgentCapability[];
  requiredContext: string[];
  optionalContext: string[];
  outputFormat: "text" | "structured" | "code" | "report";
  maxInputTokens: number;
  estimatedLatencyMs: number;
  canParallelize: boolean;
  dependencies: AgentType[];
}

const AGENT_REGISTRY: Map<AgentType, AgentMetadata> = new Map();

function registerAgentMetadata(meta: AgentMetadata): void {
  AGENT_REGISTRY.set(meta.type, meta);
}

registerAgentMetadata({
  type: "answer",
  displayName: "Answer Agent",
  description: "Provides precise, actionable answers about the codebase based on retrieved context",
  capabilities: [
    { name: "code-explanation", description: "Explain code functionality and behavior" },
    { name: "file-location", description: "Locate specific code references with file:line" },
    { name: "impact-analysis", description: "Analyze impact of changes across modules" },
    { name: "recommendation", description: "Provide actionable improvement recommendations" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["fileFilter", "dependencyGraph"],
  outputFormat: "text",
  maxInputTokens: 60000,
  estimatedLatencyMs: 3000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "review",
  displayName: "Code Review Agent",
  description: "Performs comprehensive code review identifying bugs, security issues, and quality problems",
  capabilities: [
    { name: "bug-detection", description: "Identify logic errors and bugs" },
    { name: "security-scan", description: "Detect security vulnerabilities" },
    { name: "performance-analysis", description: "Find performance bottlenecks" },
    { name: "quality-assessment", description: "Rate code quality across dimensions" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["fileFilter", "architectureContext"],
  outputFormat: "structured",
  maxInputTokens: 60000,
  estimatedLatencyMs: 5000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "fix",
  displayName: "Fix Agent",
  description: "Generates production-ready code fixes and improvements",
  capabilities: [
    { name: "bug-fix", description: "Generate complete bug fixes" },
    { name: "refactoring", description: "Produce refactored code" },
    { name: "optimization", description: "Generate optimized implementations" },
    { name: "diff-generation", description: "Create structured diffs" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["reviewFindings", "architectureContext"],
  outputFormat: "code",
  maxInputTokens: 60000,
  estimatedLatencyMs: 4000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "commit",
  displayName: "Commit Message Agent",
  description: "Generates professional Conventional Commit messages from code changes",
  capabilities: [
    { name: "change-analysis", description: "Analyze code changes" },
    { name: "message-generation", description: "Generate Conventional Commit messages" },
    { name: "breaking-change-detection", description: "Identify breaking changes" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["gitDiff"],
  outputFormat: "text",
  maxInputTokens: 30000,
  estimatedLatencyMs: 2000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "architecture",
  displayName: "Architecture Agent",
  description: "Analyzes system architecture, patterns, and provides structural recommendations",
  capabilities: [
    { name: "system-overview", description: "Provide high-level system overview" },
    { name: "module-analysis", description: "Analyze module responsibilities and coupling" },
    { name: "pattern-detection", description: "Identify design patterns in use" },
    { name: "debt-identification", description: "Identify technical debt" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["dependencyGraph", "fileTree"],
  outputFormat: "report",
  maxInputTokens: 60000,
  estimatedLatencyMs: 4000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "documentation",
  displayName: "Documentation Agent",
  description: "Generates comprehensive API documentation and code documentation",
  capabilities: [
    { name: "api-doc-generation", description: "Generate API documentation" },
    { name: "jsdoc-creation", description: "Create JSDoc/TSDoc comments" },
    { name: "example-generation", description: "Generate usage examples" },
    { name: "readme-generation", description: "Generate README sections" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["apiSignatures", "typeDefinitions"],
  outputFormat: "text",
  maxInputTokens: 60000,
  estimatedLatencyMs: 4000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "pullRequest",
  displayName: "Pull Request Agent",
  description: "Creates professional Pull Request descriptions from code changes",
  capabilities: [
    { name: "change-summary", description: "Summarize all changes" },
    { name: "checklist-generation", description: "Generate review checklists" },
    { name: "risk-assessment", description: "Assess deployment risks" },
    { name: "rollback-planning", description: "Plan rollback procedures" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["gitDiff", "testResults"],
  outputFormat: "text",
  maxInputTokens: 30000,
  estimatedLatencyMs: 3000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "test",
  displayName: "Test Generator Agent",
  description: "Generates comprehensive unit and integration test suites",
  capabilities: [
    { name: "unit-test-generation", description: "Generate unit tests" },
    { name: "integration-test-generation", description: "Generate integration tests" },
    { name: "mock-creation", description: "Create test mocks and stubs" },
    { name: "coverage-analysis", description: "Analyze test coverage gaps" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["testFramework", "existingTests"],
  outputFormat: "code",
  maxInputTokens: 60000,
  estimatedLatencyMs: 5000,
  canParallelize: false,
  dependencies: [],
});

registerAgentMetadata({
  type: "security",
  displayName: "Security Agent",
  description: "Conducts thorough security audits identifying vulnerabilities and recommending fixes",
  capabilities: [
    { name: "vulnerability-scan", description: "Scan for security vulnerabilities" },
    { name: "owasp-check", description: "Check OWASP Top 10 compliance" },
    { name: "injection-detection", description: "Detect injection vulnerabilities" },
    { name: "auth-analysis", description: "Analyze authentication/authorization" },
  ],
  requiredContext: ["codeChunks"],
  optionalContext: ["authFlow", "apiEndpoints"],
  outputFormat: "report",
  maxInputTokens: 60000,
  estimatedLatencyMs: 5000,
  canParallelize: false,
  dependencies: [],
});

export function getAgentMetadata(type: AgentType): AgentMetadata | undefined {
  return AGENT_REGISTRY.get(type);
}

export function getAllAgentMetadata(): AgentMetadata[] {
  return Array.from(AGENT_REGISTRY.values());
}

export function getAgentCapabilities(type: AgentType): AgentCapability[] {
  return AGENT_REGISTRY.get(type)?.capabilities ?? [];
}

export function getAgentsByCapability(capabilityName: string): AgentMetadata[] {
  return Array.from(AGENT_REGISTRY.values()).filter((meta) =>
    meta.capabilities.some((c) => c.name === capabilityName)
  );
}

export function getParallelizableAgents(): AgentMetadata[] {
  return Array.from(AGENT_REGISTRY.values()).filter((meta) => meta.canParallelize);
}

export function getAgentDependencies(type: AgentType): AgentType[] {
  return AGENT_REGISTRY.get(type)?.dependencies ?? [];
}
