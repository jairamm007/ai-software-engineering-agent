import { ScanSearch, ShieldCheck, ShieldX } from "lucide-react";
import Badge from "./Badge";
import type { PipelineSecurityFinding, RunFull } from "@/types/pipeline";
import { severityBadge } from "./runStatus.tsx";

function FindingsTable({ findings }: { findings: PipelineSecurityFinding[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5">
          <tr>
            <th className="px-3 py-2">Tool</th>
            <th className="px-3 py-2">Severity</th>
            <th className="px-3 py-2">Rule</th>
            <th className="px-3 py-2">Location</th>
            <th className="px-3 py-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding, index) => (
            <tr key={index} className="border-t border-slate-200 dark:border-white/10">
              <td className="px-3 py-2 font-mono text-xs">{finding.tool}</td>
              <td className="px-3 py-2">
                <Badge className={severityBadge(finding.severity)}>{finding.severity}</Badge>
              </td>
              <td className="px-3 py-2 font-mono text-xs">{finding.rule ?? "—"}</td>
              <td className="px-3 py-2 font-mono text-xs">
                {finding.file}
                {finding.line ? `:${finding.line}` : ""}
              </td>
              <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                {finding.message ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SecurityPanel({ run }: { run?: RunFull }) {
  if (!run) {
    return <p className="text-sm text-slate-500">Loading run state…</p>;
  }
  if (run.patches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <ScanSearch size={32} className="text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium">No patch to scan yet</p>
        <p className="text-xs text-slate-500">The security gate runs once a patch has been applied.</p>
      </div>
    );
  }

  const scan = run.security;
  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <ScanSearch size={32} className="text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-medium">
          {run.status === "running" ? "Scanning the patch…" : "No security scan performed"}
        </p>
        <p className="text-xs text-slate-500">
          {run.status === "running" ? "Bandit, semgrep, gitleaks and OSV are running in the sandbox." : ""}
        </p>
      </div>
    );
  }

  const findings = Array.isArray(scan.findings) ? scan.findings : [];

  return (
    <div className="space-y-3">
      {scan.blocked ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <Badge className="bg-red-500/15 text-red-500">
            <ShieldX size={12} /> BLOCKED
          </Badge>
          <span className="text-sm text-red-600 dark:text-red-300">
            This patch is blocked pending review.
          </span>
        </div>
      ) : findings.length === 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
          <Badge className="bg-emerald-500/15 text-emerald-500">
            <ShieldCheck size={12} /> PASSED
          </Badge>
          <span className="text-sm text-emerald-700 dark:text-emerald-300">No findings.</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-500">
            <ShieldCheck size={12} /> PASSED
          </Badge>
          <span className="text-sm text-slate-600 dark:text-slate-300">{scan.summary}</span>
        </div>
      )}
      {scan.summary && scan.blocked && (
        <p className="text-sm text-slate-600 dark:text-slate-300">{scan.summary}</p>
      )}
      {findings.length > 0 && <FindingsTable findings={findings} />}
    </div>
  );
}
