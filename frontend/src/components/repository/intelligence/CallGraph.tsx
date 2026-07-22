import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node, type ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { getCallGraph, type CallGraphFunction } from "@/services/repositoryIntelligence";
import { Search, AlertTriangle, Zap } from "lucide-react";

interface Props {
  repositoryId: string;
}

const nodeWidth = 220;
const nodeHeight = 36;

const layoutGraph = (nodes: Node[], edges: Edge[]) => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 70, marginx: 32, marginy: 32 });
  nodes.forEach((n) => graph.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => graph.setEdge(e.source, e.target));
  dagre.layout(graph);
  return nodes.map((n) => {
    const pos = graph.node(n.id);
    return { ...n, position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 } };
  });
};

export default function CallGraph({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  const [selectedFunc, setSelectedFunc] = useState<CallGraphFunction | null>(null);

  const graphQuery = useQuery({
    queryKey: ["call-graph", repositoryId],
    queryFn: () => getCallGraph(repositoryId),
  });

  const files = useMemo(() => {
    if (!graphQuery.data) return [];
    return [...new Set(graphQuery.data.functions.map(f => f.file))].sort();
  }, [graphQuery.data]);

  const filteredFunctions = useMemo(() => {
    if (!graphQuery.data) return [];
    let funcs = graphQuery.data.functions;
    if (selectedFile) funcs = funcs.filter(f => f.file === selectedFile);
    if (query.trim()) {
      const q = query.toLowerCase();
      funcs = funcs.filter(f => f.name.toLowerCase().includes(q) || f.file.toLowerCase().includes(q));
    }
    return funcs;
  }, [graphQuery.data, selectedFile, query]);

  const { nodes, edges } = useMemo(() => {
    const funcIds = new Set(filteredFunctions.map(f => `${f.file}::${f.name}`));
    const relevantEdges = (graphQuery.data?.edges ?? []).filter(e => funcIds.has(e.source) && funcIds.has(e.target));

    const rfNodes: Node[] = filteredFunctions.map((f) => ({
      id: `${f.file}::${f.name}`,
      type: "default",
      data: { label: f.name },
      position: { x: 0, y: 0 },
      style: {
        background: f.isExported ? (isDark ? "#6366f1" : "#4f46e5") : (isDark ? "#475569" : "#94a3b8"),
        color: "#fff",
        borderRadius: 6,
        fontSize: 11,
        padding: "4px 10px",
        width: nodeWidth,
      },
    }));

    const rfEdges: Edge[] = relevantEdges.map(e => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      style: { stroke: isDark ? "#475569" : "#cbd5e1", strokeWidth: 1 },
    }));

    return {
      nodes: layoutGraph(rfNodes, rfEdges),
      edges: rfEdges,
    };
  }, [filteredFunctions, graphQuery.data, isDark]);

  useEffect(() => {
    if (!query.trim() || !flow) return;
    const match = nodes.find(n => (n.data.label as string).toLowerCase().includes(query.toLowerCase()));
    if (match) flow.setCenter(match.position.x + nodeWidth / 2, match.position.y + nodeHeight / 2, { zoom: 1.2, duration: 350 });
  }, [flow, nodes, query]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const func = graphQuery.data?.functions.find(f => `${f.file}::${f.name}` === node.id);
    if (func) setSelectedFunc(func);
  }, [graphQuery.data]);

  if (graphQuery.isLoading) return <div className={`h-[500px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (graphQuery.isError) return <p className="text-red-500">Failed to load call graph.</p>;

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search functions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`rounded-lg border pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${
              isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
        <select
          value={selectedFile ?? ""}
          onChange={(e) => setSelectedFile(e.target.value || null)}
          className={`rounded-lg border px-3 py-2 text-sm outline-none ${
            isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          <option value="">All files</option>
          {files.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {filteredFunctions.length} functions · {edges.length} calls
        </span>
      </div>

      <div className={`flex flex-wrap gap-2 text-xs`}>
        {graphQuery.data?.highlyConnected.slice(0, 8).map(hc => (
          <span key={hc.name} className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
            <Zap size={10} /> {hc.name} ({hc.connections})
          </span>
        ))}
        {graphQuery.data?.orphanFunctions.length ? (
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${isDark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-700"}`}>
            <AlertTriangle size={10} /> {graphQuery.data.orphanFunctions.length} orphaned
          </span>
        ) : null}
      </div>

      <div className={`relative h-[min(500px,65vh)] min-h-[350px] overflow-hidden rounded-2xl border ${
        isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
      }`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable
          panOnDrag
          onInit={setFlow}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedFunc(null)}
        >
          <Background gap={16} />
          <Controls />
          <MiniMap nodeColor={isDark ? "#334155" : "#e2e8f0"} />
        </ReactFlow>
      </div>

      {selectedFunc && (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`font-mono font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedFunc.name}</h3>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{selectedFunc.file}:{selectedFunc.line}</p>
          <div className={`mt-3 flex flex-wrap gap-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <span>Params: {selectedFunc.params}</span>
            <span>Calls: {selectedFunc.calls.length}</span>
            <span>Called by: {selectedFunc.calledBy.length}</span>
            <span>{selectedFunc.isExported ? "Exported" : "Internal"}</span>
          </div>
          {selectedFunc.calls.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Calls:</p>
              <div className="flex flex-wrap gap-1">
                {selectedFunc.calls.map(c => (
                  <span key={c} className={`rounded px-1.5 py-0.5 text-xs font-mono ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-700"}`}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
