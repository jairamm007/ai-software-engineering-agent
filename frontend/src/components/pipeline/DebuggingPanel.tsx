import { useState } from "react";
import { Bug, CheckCircle2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import Badge from "./Badge";
import CodeBlock from "@/components/ui/CodeBlock";
import type { PipelineDiagnosis, PipelineFailure, RunFull } from "@/types/pipeline";

function DiagnosisBlock({
  diagnosis,
  expanded,
  onToggle,
}: {
  diagnosis: PipelineDiagnosis;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {expanded ? (
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-slate-400" />
        )}
        <Badge className="bg-violet-500/15 text-violet-500">
          <Sparkles size={12} /> {Math.round(diagnosis.confidence * 100)}% confidence
        </Badge>
        <span className="truncate text-sm font-medium">AI diagnosis</span>
        {diagnosis.rootCauseFile && (
          <span className="ml-auto hidden font-mono text-xs text-slate-500 sm:inline">
            {diagnosis.rootCauseFile}
            {diagnosis.rootCauseLine ? `:${diagnosis.rootCauseLine}` : ""}
          </span>
        )}
      </button>
      {expanded && (
        <div className="border-t border-slate-200 px-3 py-3 dark:border-white/10">
          {diagnosis.rootCauseFile && (
            <p className="mb-2 font-mono text-xs text-slate-500 sm:hidden">
              {diagnosis.rootCauseFile}
              {diagnosis.rootCauseLine ? `:${diagnosis.rootCauseLine}` : ""}
            </p>
          )}
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {diagnosis.reasoning}
          </p>
          {diagnosis.modelUsed && (
            <p className="mt-2 text-[11px] text-slate-400">model: {diagnosis.modelUsed}</p>
          )}
        </div>
      )}
    </div>
  );
}

function FailureCard({
  failure,
  diagnoses,
  live,
}: {
  failure: PipelineFailure;
  diagnoses: PipelineDiagnosis[];
  live: boolean;
}) {
  const [open, setOpen] = useState(false);
  const linked = diagnoses.filter((d) => d.failureId === failure.id);

  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-white/10">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Badge className="bg-rose-500/15 text-rose-500">{failure.errorType ?? "TestFailure"}</Badge>
        {failure.testName && <span className="text-sm font-semibold">{failure.testName}</span>}
        {failure.testFile && <span className="text-xs text-slate-500">{failure.testFile}</span>}
      </div>
      {failure.errorMessage && <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">{failure.errorMessage}</p>}
      {Array.isArray(failure.implicatedFiles) && failure.implicatedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {failure.implicatedFiles.map((f) => (
            <span key={f} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {f}
            </span>
          ))}
        </div>
      )}
      {linked.length > 0 ? (
        <div className="mt-2 space-y-2">
          {linked.map((diagnosis) => (
            <DiagnosisBlock
              key={diagnosis.id}
              diagnosis={diagnosis}
              expanded={open}
              onToggle={() => setOpen((v) => !v)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs italic text-slate-400">
          {live ? "Waiting for diagnosis…" : "No diagnosis recorded."}
        </p>
      )}
      {failure.stackTrace && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-slate-500">Stack trace</summary>
          <CodeBlock language="text" filename="stack-trace.txt">
            {failure.stackTrace}
          </CodeBlock>
        </details>
      )}
    </div>
  );
}

export default function DebuggingPanel({ run }: { run?: RunFull }) {
  if (!run) {
    return <p className="text-sm text-slate-500">Loading run state…</p>;
  }
  if (run.status === "queued") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Bug size={32} className="text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium">Tests haven't run yet</p>
        <p className="text-xs text-slate-500">The pipeline is queued and will start shortly.</p>
      </div>
    );
  }
  if (run.failures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <CheckCircle2 size={32} className="text-emerald-400" />
        <p className="text-sm font-medium">All tests passing, nothing to debug</p>
        <p className="text-xs text-slate-500">
          {run.status === "done" ? "The test suite passed on the first run." : "No failing tests have been detected."}
        </p>
      </div>
    );
  }
  const live = run.status === "running";
  return (
    <div className="space-y-3">
      {run.failures.map((failure) => (
        <FailureCard
          key={failure.id}
          failure={failure}
          diagnoses={run.diagnoses}
          live={live}
        />
      ))}
    </div>
  );
}
