import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";
import { generateFunctionDocs, generateClassDocs, type FunctionDoc, type ClassDoc } from "@/services/documentationGenerator";
import { Search, ArrowUpDown, ChevronDown, ChevronRight, Code, FileText } from "lucide-react";

interface Props {
  repositoryId: string;
}

function getComplexityColor(c: number): string {
  if (c <= 5) return "#22c55e";
  if (c <= 15) return "#eab308";
  if (c <= 30) return "#f97316";
  return "#ef4444";
}

function FunctionRow({ func, isDark }: { func: FunctionDoc; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const paramsStr = func.params.map(p => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ");

  return (
    <div className={`border-b last:border-b-0 ${isDark ? "border-white/5" : "border-slate-100"}`}>
      <div
        className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronRight size={14} className="shrink-0 text-slate-400" />}
        <Code size={14} className="shrink-0 text-indigo-400" />
        <span className={`font-mono text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{func.name}</span>
        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>({paramsStr})</span>
        <span className="text-xs" style={{ color: getComplexityColor(func.complexity) }}>C:{func.complexity}</span>
        {func.isExported && <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-500">export</span>}
        {func.isAsync && <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-500">async</span>}
        <span className={`ml-auto text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>{func.file}:{func.line}</span>
      </div>
      {expanded && (
        <div className={`px-4 pb-3 pl-10 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {func.description && <p className="mb-2">{func.description}</p>}
          <div className="grid grid-cols-2 gap-2">
            <div><span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Returns:</span> <code className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>{func.returnType}</code></div>
            <div><span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Lines:</span> <span className="text-xs">{func.line}-{func.endLine}</span></div>
          </div>
          {func.params.length > 0 && (
            <div className="mt-2">
              <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Parameters:</p>
              <div className="space-y-0.5">
                {func.params.map(p => (
                  <div key={p.name} className="text-xs">
                    <code className={isDark ? "text-slate-300" : "text-slate-700"}>{p.name}</code>
                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>: {p.type}{p.optional ? " (optional)" : ""}{p.default ? ` = ${p.default}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClassRow({ cls, isDark }: { cls: ClassDoc; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-b last:border-b-0 ${isDark ? "border-white/5" : "border-slate-100"}`}>
      <div
        className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={14} className="shrink-0 text-slate-400" /> : <ChevronRight size={14} className="shrink-0 text-slate-400" />}
        <FileText size={14} className="shrink-0 text-purple-400" />
        <span className={`font-mono text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{cls.name}</span>
        {cls.extends && <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>extends {cls.extends}</span>}
        <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{cls.methods.length} methods · {cls.properties.length} props</span>
        {cls.isExported && <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-500">export</span>}
        <span className={`ml-auto text-xs font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>{cls.file}:{cls.line}</span>
      </div>
      {expanded && (
        <div className={`px-4 pb-3 pl-10 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {cls.description && <p className="mb-2">{cls.description}</p>}
          {cls.implements.length > 0 && (
            <p className="text-xs mb-1"><span className={isDark ? "text-slate-400" : "text-slate-500"}>Implements:</span> {cls.implements.join(", ")}</p>
          )}
          {cls.constructor && (
            <div className="mt-2"><p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Constructor:</p><code className="text-xs">{cls.constructor.params}</code></div>
          )}
          {cls.methods.length > 0 && (
            <div className="mt-2">
              <p className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Methods:</p>
              <div className="space-y-1">
                {cls.methods.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`rounded px-1 py-0.5 text-[10px] ${
                      m.visibility === "public" ? "bg-green-500/10 text-green-500" :
                      m.visibility === "private" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"
                    }`}>{m.visibility}</span>
                    {m.isStatic && <span className="text-[10px] text-blue-500">static</span>}
                    <code className={isDark ? "text-slate-300" : "text-slate-700"}>{m.name}({m.params})</code>
                    <span className={isDark ? "text-slate-500" : "text-slate-400"}>: {m.returnType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FunctionClassDocs({ repositoryId }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"functions" | "classes">("functions");
  const [sortBy, setSortBy] = useState<"complexity" | "name" | "file">("complexity");

  const funcQuery = useQuery({
    queryKey: ["func-docs-gen", repositoryId],
    queryFn: () => generateFunctionDocs(repositoryId),
  });

  const classQuery = useQuery({
    queryKey: ["class-docs-gen", repositoryId],
    queryFn: () => generateClassDocs(repositoryId),
  });

  const filteredFunctions = useMemo(() => {
    if (!funcQuery.data) return [];
    let funcs = funcQuery.data;
    const q = search.toLowerCase();
    if (q) funcs = funcs.filter(f => f.name.toLowerCase().includes(q) || f.file.toLowerCase().includes(q));
    return [...funcs].sort((a, b) => {
      if (sortBy === "complexity") return b.complexity - a.complexity;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.file.localeCompare(b.file);
    });
  }, [funcQuery.data, search, sortBy]);

  const filteredClasses = useMemo(() => {
    if (!classQuery.data) return [];
    let classes = classQuery.data;
    const q = search.toLowerCase();
    if (q) classes = classes.filter(c => c.name.toLowerCase().includes(q) || c.file.toLowerCase().includes(q));
    return classes;
  }, [classQuery.data, search]);

  if (funcQuery.isLoading || classQuery.isLoading) return <div className={`h-[400px] animate-pulse rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />;

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`rounded-lg border pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${
              isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
        <div className="flex gap-1">
          {(["functions", "classes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${tab === t ? "bg-[var(--accent)] text-white" : isDark ? "bg-white/10 text-slate-300 hover:bg-white/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {tab === "functions" && (
          <div className="flex gap-1 ml-auto">
            {(["complexity", "name", "file"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors ${sortBy === s ? "bg-white/20" : ""} ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                <ArrowUpDown size={10} /> {s}
              </button>
            ))}
          </div>
        )}
        <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {tab === "functions" ? `${filteredFunctions.length} functions` : `${filteredClasses.length} classes`}
        </span>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/10" : "border-slate-200"}`}>
        {tab === "functions" ? (
          filteredFunctions.length > 0 ? filteredFunctions.map((f, i) => <FunctionRow key={i} func={f} isDark={isDark} />) : (
            <p className={`text-center py-8 ${isDark ? "text-slate-400" : "text-slate-500"}`}>No functions found.</p>
          )
        ) : (
          filteredClasses.length > 0 ? filteredClasses.map((c, i) => <ClassRow key={i} cls={c} isDark={isDark} />) : (
            <p className={`text-center py-8 ${isDark ? "text-slate-400" : "text-slate-500"}`}>No classes found.</p>
          )
        )}
      </div>
    </div>
  );
}
