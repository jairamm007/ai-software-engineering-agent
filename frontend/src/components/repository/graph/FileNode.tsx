import { Handle, Position, type NodeProps } from "reactflow";

export interface FileNodeData {
  label: string;
  extension: string;
  isCircular: boolean;
  isSearchMatch: boolean;
}

const extensionColors: Record<string, string> = {
  ts: "border-blue-300 bg-blue-50 text-blue-950",
  tsx: "border-cyan-300 bg-cyan-50 text-cyan-950",
  js: "border-amber-300 bg-amber-50 text-amber-950",
  jsx: "border-orange-300 bg-orange-50 text-orange-950",
  json: "border-orange-300 bg-orange-50 text-orange-950",
  md: "border-violet-300 bg-violet-50 text-violet-950",
  css: "border-emerald-300 bg-emerald-50 text-emerald-950",
};

export default function FileNode({ data }: NodeProps<FileNodeData>) {
  const color = extensionColors[data.extension] ?? "border-slate-300 bg-slate-50 text-slate-950";
  const circularClass = data.isCircular ? "border-red-500 bg-red-50 text-red-950 ring-2 ring-red-200" : color;
  const searchClass = data.isSearchMatch ? "ring-2 ring-indigo-500 ring-offset-2" : "";

  return (
    <div title={data.label} className={`min-w-[220px] rounded-xl border px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${circularClass} ${searchClass}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <div className="flex items-center gap-2 font-semibold"><span aria-hidden="true">📄</span><span className="truncate">{data.label}</span></div>
      <p className="mt-1 text-xs uppercase opacity-60">{data.extension || "file"}</p>
      {data.isCircular && <p className="mt-1 text-xs font-medium">⚠ Circular Dependency</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}
