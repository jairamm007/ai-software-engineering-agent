import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node, type ReactFlowInstance } from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { getImportGraph, type ImportGraphNode } from "@/services/repositoryIntelligence";
import { Search } from "lucide-react";

interface Props {
  repositoryId: string;
}

const nodeWidth = 200;
const nodeHeight = 40;

const layoutGraph = (nodes: Node[], edges: Edge[]) => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "LR", nodesep: 32, ranksep: 80, marginx: 32, marginy: 32 });
  nodes.forEach((n) => graph.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => graph.setEdge(e.source, e.target));
  dagre.layout(graph);
  return nodes.map((n) => {
    const pos = graph.node(n.id);
    return { ...n, position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 } };
  });
};

const getNodeColor = (node: ImportGraphNode, isDark: boolean) => {
  if (node.isExternal) return "#f59e0b";
  if (node.imports === 0 && node.importedBy > 0) return "#22c55e";
  if (node.imports > 0 && node.importedBy === 0) return "#ef4444";
  return isDark ? "#818cf8" : "#6366f1";
};

export default function ImportGraph({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const graphQuery = useQuery({
    queryKey: ["import-graph", repositoryId],
    queryFn: () => getImportGraph(repositoryId),
  });

  const { nodes, edges, externalDeps, internalNodes } = useMemo(() => {
    if (!graphQuery.data) return { nodes: [], edges: [], externalDeps: 0, internalNodes: 0 };

    const searchTerm = query.toLowerCase();
    const allNodes = graphQuery.data.nodes;
    const internal = allNodes.filter(n => !n.isExternal);
    const externalCount = allNodes.filter(n => n.isExternal).length;

    const rfNodes: Node[] = internal.map((n) => ({
      id: n.id,
      type: "default",
      data: { label: n.id.split("/").pop() || n.id },
      position: { x: 0, y: 0 },
      style: {
        background: getNodeColor(n, isDark),
        color: "#fff",
        borderRadius: 8,
        border: searchTerm && n.id.toLowerCase().includes(searchTerm) ? "2px solid #fbbf24" : "none",
        fontSize: 11,
        padding: "6px 12px",
        width: nodeWidth,
      },
    }));

    const nodeIds = new Set(internal.map(n => n.id));
    const rfEdges: Edge[] = graphQuery.data.edges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        animated: e.importType === "namespace",
        style: { stroke: isDark ? "#475569" : "#94a3b8", strokeWidth: 1.5 },
      }));

    return {
      nodes: layoutGraph(rfNodes, rfEdges),
      edges: rfEdges,
      externalDeps: externalCount,
      internalNodes: internal.length,
    };
  }, [graphQuery.data, query, isDark]);

  useEffect(() => {
    if (!query.trim() || !flow) return;
    const match = nodes.find(n => (n.data.label as string).toLowerCase().includes(query.toLowerCase()));
    if (match) flow.setCenter(match.position.x + nodeWidth / 2, match.position.y + nodeHeight / 2, { zoom: 1.2, duration: 350 });
  }, [flow, nodes, query]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  if (graphQuery.isLoading) return <div className={`h-[500px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;
  if (graphQuery.isError) return <p className="text-red-500">Failed to load import graph.</p>;

  const selectedData = selectedNode ? graphQuery.data?.nodes.find(n => n.id === selectedNode.id) : null;

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`rounded-lg border pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${
              isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
        <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {internalNodes} modules · {edges.length} imports · {externalDeps} external
        </span>
        <div className="flex gap-2 ml-auto text-xs">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Imported only</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Imports only</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> External</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Both</span>
        </div>
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
          onPaneClick={onPaneClick}
        >
          <Background gap={16} />
          <Controls />
          <MiniMap nodeColor={isDark ? "#334155" : "#e2e8f0"} />
        </ReactFlow>
      </div>

      {selectedData && (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <h3 className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{selectedData.id}</h3>
          <div className={`mt-2 flex gap-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span>Imports: {selectedData.imports}</span>
            <span>Imported by: {selectedData.importedBy}</span>
            <span>Type: {selectedData.isExternal ? "External" : "Internal"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
