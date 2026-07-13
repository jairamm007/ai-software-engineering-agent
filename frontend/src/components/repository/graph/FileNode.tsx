import { Handle, Position, type NodeProps } from "reactflow";
import { useTheme } from "@/context/ThemeContext";

export interface FileNodeData {
  label: string;
  extension: string;
  isCircular: boolean;
  isSearchMatch: boolean;
}

export default function FileNode({ data }: NodeProps<FileNodeData>) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const extensionColors: Record<string, string> = isDark
    ? {
        ts: "border-blue-500/30 bg-blue-500/10 text-blue-300",
        tsx: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
        js: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        jsx: "border-orange-500/30 bg-orange-500/10 text-orange-300",
        json: "border-orange-500/30 bg-orange-500/10 text-orange-300",
        md: "border-violet-500/30 bg-violet-500/10 text-violet-300",
        css: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      }
    : {
        ts: "border-blue-300 bg-blue-50 text-blue-950",
        tsx: "border-cyan-300 bg-cyan-50 text-cyan-950",
        js: "border-amber-300 bg-amber-50 text-amber-950",
        jsx: "border-orange-300 bg-orange-50 text-orange-950",
        json: "border-orange-300 bg-orange-50 text-orange-950",
        md: "border-violet-300 bg-violet-50 text-violet-950",
        css: "border-emerald-300 bg-emerald-50 text-emerald-950",
      };

  const color = extensionColors[data.extension] ?? (isDark ? "border-white/20 bg-white/5 text-slate-300" : "border-slate-300 bg-slate-50 text-slate-950");
  const circularClass = data.isCircular
    ? isDark
      ? "border-red-500 bg-red-500/10 text-red-300 ring-2 ring-red-500/30"
      : "border-red-400 bg-red-50 text-red-700 ring-2 ring-red-400/30"
    : color;
  const searchClass = data.isSearchMatch ? "ring-2 ring-violet-500 ring-offset-2" : "";

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
