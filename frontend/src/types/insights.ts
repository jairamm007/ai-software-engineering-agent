export interface InsightSummary {
  name: string;
  description?: string | null;
  primaryLanguage: string;
  frontendFramework: string | null;
  backendFramework: string | null;
  database: string | null;
  vectorDb: string | null;
  aiFramework: string | null;
  totalFiles: number;
  totalFolders: number;
  moduleCount: number;
}

export interface TechStackItem {
  name: string;
  category: string;
  version?: string;
}

export interface ArchitectureLayer {
  name: string;
  modules: string[];
}

export interface ArchitectureResult {
  layers: ArchitectureLayer[];
  entryPoints: string[];
  requestFlow: string;
  prose: string;
}

export interface InsightModule {
  name: string;
  path: string;
  fileCount: number;
  lineCount: number;
  responsibilities: string[];
  dependencies: string[];
}

export interface DependencyNode {
  id: string;
  label: string;
  group?: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  weight: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface TimelineEvent {
  type: "created" | "initial_commit" | "milestone" | "last_commit" | "module_added";
  label: string;
  date: string;
  author?: string;
  description?: string;
}

export interface InsightTimeline {
  events: TimelineEvent[];
  totalCommits: number;
  startedAt: string | null;
  lastActiveAt: string | null;
  contributors: number;
}

export type RecommendationCategory = "security" | "performance" | "code_quality" | "documentation" | "general";

export interface Recommendation {
  category: RecommendationCategory;
  severity: "high" | "medium" | "low";
  text: string;
  detail?: string;
}

export interface InsightReport {
  id: string;
  format: "markdown" | "pdf";
  filename: string;
  size: number;
  createdAt: string;
}

export interface ProjectInsights {
  id: string;
  repositoryId: string;
  summary: InsightSummary;
  overview: string;
  architecture: ArchitectureResult;
  modules: InsightModule[];
  dependencies: DependencyGraph;
  techStack: TechStackItem[];
  timeline: InsightTimeline;
  recommendations: Recommendation[];
  docHealth: number | null;
  securityHealth: number | null;
  performanceHealth: number | null;
  maintainabilityHealth: number | null;
  overallHealth: number | null;
  createdAt: string;
  updatedAt: string;
  stale?: boolean;
  reports?: InsightReport[];
}

export type InsightSectionKey =
  | "summary"
  | "overview"
  | "architecture"
  | "modules"
  | "dependencies"
  | "techstack"
  | "timeline"
  | "health"
  | "recommendations";
