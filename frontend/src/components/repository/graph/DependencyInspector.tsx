import { useTheme } from "@/context/ThemeContext";

interface Props {
  source: string;
  target: string;
  importPath?: string;
  importStatement?: string;
}

export default function DependencyInspector({ source, target, importPath, importStatement }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className={`rounded-2xl border p-5 shadow-sm ${
      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
    }`}>
      <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Dependency Details</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        <div>
          <dt className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Imported from</dt>
          <dd className={isDark ? "text-slate-200" : "text-slate-800"}>{source}</dd>
        </div>
        <div>
          <dt className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Imports</dt>
          <dd className={isDark ? "text-slate-200" : "text-slate-800"}>{importPath ?? target}</dd>
        </div>
        <div>
          <dt className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Import statement</dt>
          <dd><code className={isDark ? "text-slate-200" : "text-slate-800"}>{importStatement ?? "Relative import"}</code></dd>
        </div>
        <div>
          <dt className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Type</dt>
          <dd className={isDark ? "text-slate-200" : "text-slate-800"}>Relative import</dd>
        </div>
      </dl>
    </aside>
  );
}
