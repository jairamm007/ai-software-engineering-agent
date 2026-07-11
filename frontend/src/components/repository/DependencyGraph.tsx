import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import dagre from "dagre";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import { askRepository } from "@/services/chat";
import {
  getDependencyGraph,
  summarizeDependencyGraph,
} from "@/services/dependencyGraph";
import { getRepository } from "@/services/repository";
import FileViewer from "@/components/repository/FileViewer";
import FileNode, { type FileNodeData } from "@/components/repository/graph/FileNode";
import GraphContextMenu from "@/components/repository/graph/GraphContextMenu";
import GraphSearch from "@/components/repository/graph/GraphSearch";
import DependencyInspector from "@/components/repository/graph/DependencyInspector";

interface Props {
  repositoryId: string;
}

interface GraphContextMenu {
  x: number;
  y: number;
  node: Node<FileNodeData>;
}

const nodeWidth = 220;
const nodeHeight = 58;

const getExtension = (value: string) =>
  value.split(".").pop()?.toLowerCase() ?? "";

const findCircularNodes = (nodes: string[], edges: Edge[]) => {
  const neighbors = new Map<string, string[]>();
  const circular = new Set<string>();
  const visiting = new Set<string>();
  const visited = new Set<string>();

  for (const node of nodes) neighbors.set(node, []);
  for (const edge of edges) neighbors.get(edge.source)?.push(edge.target);

  const visit = (node: string, trail: string[]) => {
    if (visiting.has(node)) {
      const cycleStart = trail.indexOf(node);
      trail.slice(cycleStart).forEach((item) => circular.add(item));
      return;
    }
    if (visited.has(node)) return;

    visiting.add(node);
    neighbors.get(node)?.forEach((target) => visit(target, [...trail, node]));
    visiting.delete(node);
    visited.add(node);
  };

  nodes.forEach((node) => visit(node, []));
  return circular;
};

const layoutGraph = (nodes: Node<FileNodeData>[], edges: Edge[]) => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", nodesep: 48, ranksep: 92, marginx: 32, marginy: 32 });

  nodes.forEach((node) => graph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    return {
      ...node,
      position: { x: position.x - nodeWidth / 2, y: position.y - nodeHeight / 2 },
    };
  });
};

export default function DependencyGraph({ repositoryId }: Props) {
  const graphRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node<FileNodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [contextMenu, setContextMenu] = useState<GraphContextMenu | null>(null);
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const graphQuery = useQuery({
    queryKey: ["dependency-graph", repositoryId],
    queryFn: () => getDependencyGraph(repositoryId),
  });
  const repositoryQuery = useQuery({
    queryKey: ["repository", repositoryId],
    queryFn: () => getRepository(repositoryId),
  });

  const { nodes, edges, circularNodes, disconnectedCount, averageDependencies } = useMemo(() => {
    const rawEdges: Edge[] = (graphQuery.data?.edges ?? []).map((edge) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: false,
    }));
    const circular = findCircularNodes(
      (graphQuery.data?.nodes ?? []).map((node) => node.id),
      rawEdges
    );
    const search = query.trim().toLowerCase();
    const rawNodes: Node<FileNodeData>[] = (graphQuery.data?.nodes ?? []).map((node) => ({
      id: node.id,
      type: "fileNode",
      data: {
        label: node.label,
        extension: getExtension(node.label),
        isCircular: circular.has(node.id),
        isSearchMatch: Boolean(search) && node.label.toLowerCase().includes(search),
      },
      position: { x: 0, y: 0 },
    }));
    const connected = new Set(rawEdges.flatMap((edge) => [edge.source, edge.target]));

    return {
      nodes: layoutGraph(rawNodes, rawEdges),
      edges: rawEdges.map((edge) => ({ ...edge, style: circular.has(edge.source) && circular.has(edge.target) ? { stroke: "#ef4444", strokeWidth: 2 } : undefined })),
      circularNodes: circular,
      disconnectedCount: rawNodes.filter((node) => !connected.has(node.id)).length,
      averageDependencies: rawNodes.length ? (rawEdges.length / rawNodes.length).toFixed(1) : "0",
    };
  }, [graphQuery.data, query]);

  const selectedFile = useMemo(() => {
    if (!selectedNode) return null;
    return repositoryQuery.data?.files.find((file) =>
      file.path.replaceAll("\\", "/").endsWith(selectedNode.id)
    ) ?? null;
  }, [repositoryQuery.data, selectedNode]);

  const selectedImport = useMemo(() => {
    if (!selectedEdge) return null;
    return graphQuery.data?.edges.find(
      (edge) => edge.source === selectedEdge.source && edge.target === selectedEdge.target
    ) ?? null;
  }, [graphQuery.data, selectedEdge]);

  useEffect(() => {
    if (!query.trim() || !flow) return;
    const match = nodes.find((node) => node.data.isSearchMatch);
    if (match) {
      flow.setCenter(match.position.x + nodeWidth / 2, match.position.y + nodeHeight / 2, { zoom: 1.2, duration: 350 });
    }
  }, [flow, nodes, query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null);
        setSelectedNode(null);
        setSelectedEdge(null);
      }
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key.toLowerCase() === "f" && document.activeElement?.tagName !== "INPUT") {
        flow?.fitView({ duration: 350, padding: 0.2 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flow]);

  const selectNode = useCallback((node: Node<FileNodeData>) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    flow?.setCenter(node.position.x + nodeWidth / 2, node.position.y + nodeHeight / 2, { zoom: 1.25, duration: 400 });
  }, [flow]);

  const openSelectedFile = () => {
    if (selectedFile) {
      navigate(`/repositories/${repositoryId}`, {
        state: { selectedFilePath: selectedFile.path },
      });
    }
  };

  const summarizeGraph = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await summarizeDependencyGraph(repositoryId);
      setAiResult(typeof result === "string" ? result : JSON.stringify(result, null, 2));
    } catch {
      setAiResult("The dependency graph summary could not be completed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const runAiAction = async (action: string, node = selectedNode) => {
    const subject = node?.id ?? "the dependency graph";
    setAiLoading(true);
    setAiResult(null);
    try {
      const response = await askRepository({
        repositoryId,
        filePath: repositoryQuery.data?.files.find((file) => file.path.replaceAll("\\", "/").endsWith(subject))?.path,
        question: `${action} ${subject} in this repository.`,
      });
      setAiResult(typeof response.answer === "string" ? response.answer : JSON.stringify(response.answer, null, 2));
    } catch {
      setAiResult("The AI action could not be completed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const downloadBlob = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const download = (name: string, content: string, type: string) =>
    downloadBlob(name, new Blob([content], { type }));

  const exportSvg = () => {
    const svgNodes = nodes.map((node) => `<g transform="translate(${node.position.x},${node.position.y})"><rect width="${nodeWidth}" height="${nodeHeight}" rx="12" fill="#eff6ff" stroke="#93c5fd"/><text x="16" y="26" font-family="sans-serif" font-size="14" font-weight="600">${node.data.label.replaceAll("&", "&amp;")}</text><text x="16" y="45" font-family="sans-serif" font-size="10">${node.data.extension}</text></g>`).join("");
    const svgEdges = edges.map((edge) => {
      const source = nodes.find((node) => node.id === edge.source);
      const target = nodes.find((node) => node.id === edge.target);
      if (!source || !target) return "";
      return `<path d="M ${source.position.x + nodeWidth / 2} ${source.position.y + nodeHeight} L ${target.position.x + nodeWidth / 2} ${target.position.y}" stroke="#64748b" fill="none" marker-end="url(#arrow)"/>`;
    }).join("");
    download("dependency-graph.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#64748b"/></marker></defs>${svgEdges}${svgNodes}</svg>`, "image/svg+xml");
  };

  const exportPng = async () => {
    const svg = graphRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 1000;
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob("dependency-graph.png", blob);
      }, "image/png");
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  };

  if (graphQuery.isLoading) return <div className="h-[680px] animate-pulse rounded-2xl bg-slate-100" />;
  if (graphQuery.isError) return <p className="text-red-600">Failed to load dependency graph.</p>;
  if (nodes.length === 0) return <p className="text-slate-500">No TypeScript or JavaScript files were found in this repository.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <GraphSearch inputRef={searchRef} value={query} onChange={setQuery} />
        <span className="text-sm text-slate-500">{nodes.length} files · {edges.length} imports · {averageDependencies} avg/file · {circularNodes.size} circular · {disconnectedCount} disconnected</span>
        <button onClick={summarizeGraph} disabled={aiLoading} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">Summarize graph</button>
        <button onClick={() => download("dependency-graph.json", JSON.stringify(graphQuery.data, null, 2), "application/json")} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">JSON</button>
        <button onClick={exportSvg} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">SVG</button>
        <button onClick={exportPng} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">PNG</button>
      </div>
      {circularNodes.size > 0 && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">Circular dependency found across {circularNodes.size} file{circularNodes.size === 1 ? "" : "s"}.</div>}
      <div ref={graphRef} className="relative h-[min(680px,70vh)] min-h-[420px] overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={{ fileNode: FileNode }} fitView nodesDraggable panOnDrag onInit={setFlow} onNodeClick={(_, node) => selectNode(node as Node<FileNodeData>)} onNodeContextMenu={(event, node) => { event.preventDefault(); setContextMenu({ x: event.clientX, y: event.clientY, node: node as Node<FileNodeData> }); }} onPaneClick={() => setContextMenu(null)} onEdgeClick={(_, edge) => { setSelectedEdge(edge); setSelectedNode(null); }}>
          <Background gap={16} />
          <Controls />
          <MiniMap nodeColor={(node) => node.data?.isCircular ? "#ef4444" : "#60a5fa"} />
        </ReactFlow>
        {contextMenu && <GraphContextMenu x={contextMenu.x} y={contextMenu.y} label={contextMenu.node.data.label} onAction={(action) => { selectNode(contextMenu.node); setContextMenu(null); void runAiAction(action, contextMenu.node); }} />}
      </div>
      {(selectedNode || selectedEdge) && <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {selectedNode && <><h2 className="text-lg font-semibold">📄 {selectedNode.id}</h2><p className="mt-1 text-sm text-slate-500">Click a graph node to inspect it and use repository-aware AI actions.</p><div className="mt-4 flex flex-wrap gap-2">{["Explain", "Review", "Generate tests for", "Run a security scan on", "Suggest a fix for"].map((action) => <button key={action} disabled={aiLoading} onClick={() => runAiAction(action)} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">{action}</button>)}<button onClick={openSelectedFile} disabled={!selectedFile} className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">Open in Files</button></div>{selectedFile && <div className="mt-4"><FileViewer filePath={selectedFile.path} content={selectedFile.chunks.map((chunk) => chunk.content).join("\n")} /></div>}</>}
        {selectedEdge && <DependencyInspector source={selectedEdge.source} target={selectedEdge.target} importPath={selectedImport?.importPath} importStatement={selectedImport?.importStatement} />}
        {aiResult && <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm text-slate-100">{aiResult}</pre>}
      </div>}
      {aiResult && !selectedNode && <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm text-slate-100 shadow-sm">{aiResult}</pre>}
    </div>
  );
}
