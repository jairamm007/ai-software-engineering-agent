import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Boxes, GitBranch, Database, Globe,
  FolderOpen, FileCode2, ArrowRight, ChevronRight,
  ChevronDown, Play, RotateCcw, Search,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import AIResult from "@/components/repository/AIResult";
import { getRepositories, getRepository } from "@/services/repository";
import { askRepository } from "@/services/chat";
import { useTheme } from "@/context/ThemeContext";

/* ── Helpers ─────────────────────────────────────────── */

interface TreeNode {
  name: string;
  fullPath: string;
  isDir: boolean;
  children: TreeNode[];
  fileCount: number;
}

function buildTree(paths: string[]): TreeNode {
  const root: TreeNode = { name: "/", fullPath: "", isDir: true, children: [], fileCount: 0 };
  for (const p of paths) {
    const parts = p.split("/").filter(Boolean);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      const isFile = i === parts.length - 1;
      const existing = cursor.children.find((c) => c.name === parts[i]);
      if (existing) {
        if (isFile) existing.fileCount++;
        cursor = existing;
      } else {
        const node: TreeNode = {
          name: parts[i],
          fullPath: parts.slice(0, i + 1).join("/"),
          isDir: !isFile,
          children: [],
          fileCount: isFile ? 1 : 0,
        };
        cursor.children.push(node);
        cursor = node;
      }
    }
    /* increment fileCount up the tree */
    cursor = root;
    for (let i = 0; i < parts.length; i++) {
      const child = cursor.children.find((c) => c.name === parts[i]);
      if (child) { child.fileCount++; cursor = child; }
    }
  }
  return root;
}

const LAYER_COLORS: Record<string, { icon: typeof Globe; gradient: string; text: string; bg: string }> = {
  frontend:    { icon: Globe,     gradient: "accent-gradient", text: "accent-text-base", bg: "accent-bg-light" },
  backend:     { icon: Database,  gradient: "accent-gradient", text: "accent-text-base", bg: "accent-bg-light" },
  shared:      { icon: GitBranch, gradient: "from-cyan-500 to-sky-500",      text: "text-cyan-500",   bg: "bg-cyan-500/10" },
  "src":       { icon: Boxes,     gradient: "from-emerald-500 to-teal-500",  text: "text-emerald-500", bg: "bg-emerald-500/10" },
  lib:         { icon: Layers,    gradient: "from-amber-500 to-orange-500",  text: "text-amber-500",  bg: "bg-amber-500/10" },
  config:      { icon: Layers,    gradient: "from-slate-500 to-zinc-500",    text: "text-slate-500",  bg: "bg-slate-500/10" },
};

const DEFAULT_LAYER = { icon: Layers, gradient: "from-slate-500 to-zinc-500", text: "text-slate-500", bg: "bg-slate-500/10" };

function categorizeFiles(paths: string[]) {
  const map = new Map<string, { files: string[]; count: number }>();
  for (const p of paths) {
    const topDir = p.split("/")[0]?.toLowerCase() ?? "other";
    const key = Object.keys(LAYER_COLORS).includes(topDir) ? topDir : "src";
    const entry = map.get(key) ?? { files: [], count: 0 };
    entry.files.push(p);
    entry.count++;
    map.set(key, entry);
  }
  return map;
}

function inferConnections(paths: string[]) {
  const cats = Array.from(categorizeFiles(paths).keys());
  const conns: { from: string; to: string; label: string; strength: number }[] = [];
  if (cats.includes("frontend") && cats.includes("backend"))
    conns.push({ from: "Frontend", to: "Backend", label: "REST API / WebSocket", strength: 92 });
  if (cats.includes("backend") && cats.includes("shared"))
    conns.push({ from: "Backend", to: "Shared", label: "Type Imports", strength: 85 });
  if (cats.includes("frontend") && cats.includes("shared"))
    conns.push({ from: "Frontend", to: "Shared", label: "Shared Types", strength: 78 });
  if (cats.includes("backend") && cats.includes("lib"))
    conns.push({ from: "Backend", to: "Lib", label: "Utility Imports", strength: 70 });
  if (cats.includes("src") && cats.includes("shared"))
    conns.push({ from: "Src", to: "Shared", label: "Common Utilities", strength: 65 });
  if (conns.length === 0 && cats.length > 1) {
    for (let i = 0; i < cats.length - 1; i++) {
      conns.push({ from: cats[i], to: cats[i + 1], label: "Internal Modules", strength: 50 });
    }
  }
  return conns;
}

function findApiRoutes(paths: string[]): string[] {
  const routePatterns = [/\/api\//i, /\/routes\//i, /\/controller/i, /router\./i, /endpoint/i];
  return paths.filter((p) => routePatterns.some((r) => r.test(p)));
}

function dirCount(tree: TreeNode): number {
  return tree.children.filter((c) => c.isDir).length + tree.children.reduce((s, c) => s + dirCount(c), 0);
}

/* ── Sub-components ──────────────────────────────────── */

function TreeItem({ node, depth, expanded, toggle, isDark }: {
  node: TreeNode; depth: number; expanded: Set<string>; toggle: (p: string) => void; isDark: boolean;
}) {
  const isOpen = expanded.has(node.fullPath);
  return (
    <div>
      <button
        type="button"
        onClick={() => { if (node.isDir) toggle(node.fullPath); }}
        className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-[Inter] transition-colors ${
          isDark ? "text-slate-300 hover:bg-white/[0.04]" : "text-slate-700 hover:bg-slate-50"
        }`}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {node.isDir ? (
          isOpen ? <ChevronDown size={12} className="shrink-0 text-slate-500" /> : <ChevronRight size={12} className="shrink-0 text-slate-500" />
        ) : <span className="w-3" />}
        {node.isDir ? (
          <FolderOpen size={13} className={`shrink-0 ${isOpen ? "accent-text-base" : isDark ? "text-slate-500" : "text-slate-400"}`} />
        ) : (
          <FileCode2 size={13} className={`shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        )}
        <span className="truncate">{node.name}</span>
        {node.isDir && (
          <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
            isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
          }`}>
            {node.fileCount}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {node.isDir && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeItem key={child.fullPath} node={child} depth={depth + 1} expanded={expanded} toggle={toggle} isDark={isDark} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────── */

export default function ArchitecturePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [treeFilter, setTreeFilter] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const { data: repos, isLoading: reposLoading } = useQuery({
    queryKey: ["repositories"],
    queryFn: () => getRepositories(),
  });

  const { data: repoData, isLoading: repoLoading } = useQuery({
    queryKey: ["repository", selectedRepoId],
    queryFn: () => getRepository(selectedRepoId),
    enabled: !!selectedRepoId,
  });

  const filePaths = useMemo(() => repoData?.files.map((f) => f.path) ?? [], [repoData]);
  const filteredPaths = useMemo(
    () => (treeFilter ? filePaths.filter((p) => p.toLowerCase().includes(treeFilter.toLowerCase())) : filePaths),
    [filePaths, treeFilter],
  );

  const tree = useMemo(() => buildTree(filteredPaths), [filteredPaths]);
  const layers = useMemo(() => categorizeFiles(filePaths), [filePaths]);
  const connections = useMemo(() => inferConnections(filePaths), [filePaths]);
  const apiRoutes = useMemo(() => findApiRoutes(filePaths), [filePaths]);

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const handleRepoSelect = (id: string) => {
    setSelectedRepoId(id);
    setExpandedDirs(new Set());
    setResult("");
    setTreeFilter("");
  };

  const analyze = async () => {
    if (!repoData) return;
    setLoading(true);
    setResult("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await askRepository({
        question: "Provide a detailed architecture analysis of this repository including: 1) Overall structure and design patterns 2) Key modules and their responsibilities 3) Data flow between components 4) Strengths and potential improvements 5) Technology stack assessment",
        repositoryId: repoData.id,
        signal: controller.signal,
      });
      setResult(res.answer ?? JSON.stringify(res));
    } catch {
      if (controller.signal.aborted) return;
      setResult("Failed to generate architecture analysis. Please try again.");
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient shadow-lg accent-shadow">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>Architecture</h1>
            <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Analyze repository structure, layers, and module connections
            </p>
          </div>
        </motion.div>

        {/* 1. Repo Select */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`rounded-2xl border shadow-sm ${isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"}`}
        >
          <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <h2 className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>1. Select Repository</h2>
          </div>
          <div className="p-5">
            {reposLoading ? (
              <div className="flex h-20 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              </div>
            ) : !repos || repos.length === 0 ? (
              <p className={`py-6 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No repositories found.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {repos.map((repo) => (
                  <button
                    key={repo.id} type="button" onClick={() => handleRepoSelect(repo.id)}
                    className={`group flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      selectedRepoId === repo.id
                        ? isDark ? "border-[var(--accent)]/30 accent-bg-light ring-1 ring-[var(--accent)]/20" : "border-[var(--accent)]/20 accent-bg-light ring-1 ring-[var(--accent)]/20"
                        : isDark ? "border-white/10 bg-white/[0.02] hover:border-white/20" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      selectedRepoId === repo.id ? "accent-bg-light" : (isDark ? "bg-white/5" : "bg-slate-100")
                    }`}>
                      <FolderOpen size={16} className={selectedRepoId === repo.id ? "accent-text-base" : isDark ? "text-slate-400" : "text-slate-500"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium font-[Inter] ${selectedRepoId === repo.id ? (isDark ? "text-white" : "accent-text-base") : isDark ? "text-slate-200" : "text-slate-700"}`}>{repo.name}</p>
                      <p className={`mt-0.5 truncate text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{repo._count.files} files</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* 2. Main Grid: Tree + Panels */}
        {selectedRepoId && (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* Sidebar: File Tree */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className={`rounded-2xl border shadow-sm ${isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"}`}
            >
              <div className={`border-b px-5 py-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <h2 className={`text-base font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>File Structure</h2>
                <div className="relative mt-3">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="text" placeholder="Filter files..." value={treeFilter} onChange={(e) => setTreeFilter(e.target.value)}
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none font-[Inter] ${
                      isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-[var(--accent)]" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
                    }`}
                  />
                </div>
              </div>
              {repoLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                </div>
              ) : (
                <div className="max-h-[520px] overflow-y-auto p-3">
                  {tree.children.length === 0 ? (
                    <p className={`py-6 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No files found.</p>
                  ) : (
                    tree.children.map((child) => (
                      <TreeItem key={child.fullPath} node={child} depth={0} expanded={expandedDirs} toggle={toggleDir} isDark={isDark} />
                    ))
                  )}
                </div>
              )}
              <div className={`border-t px-5 py-3 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <p className={`text-[11px] font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {filePaths.length} files · {dirCount(tree)} directories
                </p>
              </div>
            </motion.div>

            {/* Right column: Layers, Connections, Routes */}
            <div className="space-y-6">
              {/* Architecture Layers */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className={`mb-3 text-sm font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>Architecture Layers</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from(layers.entries()).map(([key, { count }], i) => {
                    const style = LAYER_COLORS[key] ?? DEFAULT_LAYER;
                    const Icon = style.icon;
                    return (
                      <motion.div
                        key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.06 }} whileHover={{ y: -4 }}
                        className={`rounded-2xl border p-5 transition-shadow ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:accent-shadow" : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"}`}
                      >
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}>
                          <Icon size={18} className={style.text} />
                        </div>
                        <h3 className={`font-[Outfit] text-sm font-bold capitalize mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{key}</h3>
                        <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{count} files</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Module Connections */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
              >
                <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                  <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Module Connections</h2>
                </div>
                {connections.length === 0 ? (
                  <p className={`px-6 py-8 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Not enough directory variation to infer connections.</p>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {connections.map((conn, i) => (
                      <motion.div key={`${conn.from}-${conn.to}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + i * 0.05 }} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>{conn.from}</span>
                          <ArrowRight size={12} className={`shrink-0 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                          <span className={`text-sm font-medium font-[Inter] ${isDark ? "text-white" : "text-slate-900"}`}>{conn.to}</span>
                        </div>
                        <span className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{conn.label}</span>
                        <div className="ml-auto flex items-center gap-2">
                          <div className={`h-1.5 w-20 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${conn.strength}%` }} transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }} className="h-full rounded-full accent-gradient" />
                          </div>
                          <span className={`text-xs font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{conn.strength}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Request Flow / API Routes */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}
              >
                <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                  <h2 className={`font-[Outfit] text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Request Flow</h2>
                  <p className={`mt-0.5 text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Detected API route files</p>
                </div>
                <div className="p-4">
                  {apiRoutes.length === 0 ? (
                    <p className={`py-4 text-center text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      No API route files detected in the repository structure.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {apiRoutes.slice(0, 15).map((route) => (
                        <div key={route} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-[Inter] ${
                          isDark ? "bg-white/[0.03] text-slate-300" : "bg-slate-50 text-slate-700"
                        }`}>
                          <Database size={12} className="shrink-0 accent-text-base" />
                          <span className="truncate">{route}</span>
                        </div>
                      ))}
                      {apiRoutes.length > 15 && (
                        <p className={`pt-1 text-center text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          +{apiRoutes.length - 15} more route files
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Analyze Button + AI Result */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
                <button
                  type="button" onClick={() => void analyze()} disabled={loading || !repoData}
                  className="flex items-center gap-2 rounded-xl accent-gradient px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg accent-shadow disabled:opacity-50 disabled:shadow-none font-[Inter]"
                >
                  {loading ? (
                    <><RotateCcw size={14} className="animate-spin" /> Analyzing...</>
                  ) : (
                    <><Play size={14} /> Analyze Architecture</>
                  )}
                </button>

                {(result || loading) && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <AIResult title="Architecture Summary" content={result} loading={loading} />
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
