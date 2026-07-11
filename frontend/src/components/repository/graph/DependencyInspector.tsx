interface Props {
  source: string;
  target: string;
  importPath?: string;
  importStatement?: string;
}

export default function DependencyInspector({ source, target, importPath, importStatement }: Props) {
  return <aside className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"><h2 className="text-lg font-semibold">Dependency details</h2><dl className="mt-3 grid gap-2 text-sm"><div><dt className="font-medium">Imported from</dt><dd>{source}</dd></div><div><dt className="font-medium">Imports</dt><dd>{importPath ?? target}</dd></div><div><dt className="font-medium">Import statement</dt><dd><code>{importStatement ?? "Relative import"}</code></dd></div><div><dt className="font-medium">Type</dt><dd>Relative import</dd></div></dl></aside>;
}
