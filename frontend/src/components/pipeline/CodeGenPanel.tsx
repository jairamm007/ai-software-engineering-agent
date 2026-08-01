import { Code2, FileCode2, Sparkles } from "lucide-react";
import Badge from "./Badge";
import CodeBlock from "@/components/ui/CodeBlock";
import type { PipelinePatch, RunFull } from "@/types/pipeline";
import { PATCH_STYLES } from "./runStatus.tsx";

function PatchCard({ patch }: { patch: PipelinePatch }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge className={PATCH_STYLES[patch.status] ?? "bg-slate-500/15 text-slate-500"}>
          {patch.status}
        </Badge>
        <span className="text-sm font-semibold">Attempt {patch.attemptNumber}</span>
        {patch.testResult && (
          <Badge
            className={
              patch.testResult === "pass"
                ? "bg-emerald-500/15 text-emerald-500"
                : patch.testResult === "fail"
                  ? "bg-rose-500/15 text-rose-500"
                  : "bg-slate-500/15 text-slate-500"
            }
          >
            test: {patch.testResult}
          </Badge>
        )}
      </div>
      {Array.isArray(patch.filesTouched) && patch.filesTouched.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {patch.filesTouched.map((f) => (
            <span key={f} className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <FileCode2 size={11} /> {f}
            </span>
          ))}
        </div>
      )}
      {patch.diffText && <CodeBlock language="diff">{patch.diffText}</CodeBlock>}
      {patch.testOutput && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-slate-500">Test output</summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-200">
            {patch.testOutput}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function CodeGenPanel({ run }: { run?: RunFull }) {
  if (!run) {
    return <p className="text-sm text-slate-500">Loading run state…</p>;
  }
  if (run.diagnoses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Sparkles size={32} className="text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium">No diagnosis yet — check the Debugging tab</p>
        <p className="text-xs text-slate-500">Repair patches are generated after failures are diagnosed.</p>
      </div>
    );
  }
  const patches = [...run.patches].sort((a, b) => a.attemptNumber - b.attemptNumber);
  if (patches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Code2 size={32} className="text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium">
          {run.status === "rejected" ? "Repair attempts were rejected" : "Waiting for a repair attempt…"}
        </p>
        <p className="text-xs text-slate-500">
          {run.status === "rejected"
            ? "Maximum fix attempts were reached; the patch has been escalated for human review."
            : "The code generation stage will produce a unified diff to apply."}
        </p>
      </div>
    );
  }

  const last = patches[patches.length - 1];
  const previous = patches.slice(0, -1);

  return (
    <div className="space-y-3">
      {previous.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300">
            {previous.length} previous attempt{previous.length > 1 ? "s" : ""} (failed)
          </summary>
          <div className="mt-2 space-y-3">
            {previous.map((patch) => (
              <PatchCard key={patch.id} patch={patch} />
            ))}
          </div>
        </details>
      )}
      <PatchCard patch={last} />
    </div>
  );
}
