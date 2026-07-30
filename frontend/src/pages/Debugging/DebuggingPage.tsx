import { useState, useCallback, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  Bug,
  Siren,
  ScanSearch,
  Wrench,
  ScrollText,
  PackageSearch,
  Clock,
  Copy,
  CheckCheck,
  Loader2,
  Terminal,
  AlertTriangle,
  FileCode2,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import {
  analyzeError,
  analyzeStacktrace,
  detectBugs,
  analyzeLogs,
  suggestFix,
  getDebugHistory,
  recordDebugAction,
} from "@/services/debug";
import type { DebugTab, DebugSession, DebugIssue, DebugHistoryResponse } from "@/types/debug";

const tabs: { id: DebugTab; label: string; icon: typeof Bug }[] = [
  { id: "error-analyzer", label: "Error Analyzer", icon: Siren },
  { id: "stack-trace", label: "Stack Trace", icon: Terminal },
  { id: "bug-detection", label: "Bug Detection", icon: ScanSearch },
  { id: "fix-suggestions", label: "Fix Suggestions", icon: Wrench },
  { id: "log-analysis", label: "Log Analysis", icon: ScrollText },
  { id: "dependency-checker", label: "Dependency Checker", icon: PackageSearch },
  { id: "history", label: "History", icon: Clock },
];

function inputClass(isDark: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm font-[Inter] transition-colors outline-none ${
    isDark
      ? "border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
  }`;
}

function buttonClass(isDark: boolean, primary = true) {
  if (primary) {
    return `inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all font-[Inter] cursor-pointer ${
      isDark
        ? "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
        : "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
    }`;
  }
  return `inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all font-[Inter] cursor-pointer ${
    isDark
      ? "border-white/[0.08] text-slate-300 hover:bg-white/[0.04]"
      : "border-slate-200 text-slate-600 hover:bg-slate-50"
  }`;
}

function ResultCard({ session, isDark }: { session: DebugSession; isDark: boolean }) {
  const [copied, setCopied] = useState(false);
  const [resolved, setResolved] = useState(session.status === "resolved");

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = async () => {
    try {
      await recordDebugAction({ sessionId: session.id, action: "resolved" });
      setResolved(true);
      toast.success("Marked as resolved");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className={`mt-4 space-y-4 rounded-2xl border p-5 ${
      isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-slate-50"
    }`}>
      {session.explanation && (
        <div>
          <h4 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            <Lightbulb size={15} className="text-amber-400" /> Explanation
          </h4>
          <div className={`whitespace-pre-wrap text-sm leading-relaxed font-[Inter] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {session.explanation}
          </div>
        </div>
      )}

      {session.suggestedFix && (
        <div>
          <h4 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            <Wrench size={15} className="text-emerald-400" /> Suggested Fix
          </h4>
          <div className={`whitespace-pre-wrap rounded-xl p-4 text-sm font-mono leading-relaxed ${
            isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-700 border border-slate-200"
          }`}>
            {session.suggestedFix}
          </div>
        </div>
      )}

      {session.fixedCode && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`flex items-center gap-2 text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              <FileCode2 size={15} className="text-cyan-400" /> Fixed Code
            </h4>
            <button
              type="button"
              onClick={() => handleCopy(session.fixedCode!)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                isDark ? "text-slate-400 hover:bg-white/[0.04]" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className={`rounded-xl p-4 text-sm font-mono leading-relaxed overflow-x-auto ${
            isDark ? "bg-slate-900 text-emerald-300" : "bg-white text-emerald-700 border border-slate-200"
          }`}>
            {session.fixedCode}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button type="button" onClick={handleResolve}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            resolved
              ? "bg-emerald-500/10 text-emerald-500"
              : isDark
                ? "text-slate-400 hover:bg-white/[0.04]"
                : "text-slate-500 hover:bg-slate-100"
          }`}>
          {resolved ? "Resolved" : "Mark Resolved"}
        </button>
        <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {new Date(session.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function IssuesList({ issues, isDark }: { issues: DebugIssue[]; isDark: boolean }) {
  const severityColor = (s: string) => {
    if (s === "critical") return "text-red-400 bg-red-500/10";
    if (s === "warning") return "text-amber-400 bg-amber-500/10";
    return "text-blue-400 bg-blue-500/10";
  };

  return (
    <div className="mt-4 space-y-3">
      {issues.map((issue, i) => (
        <div key={i} className={`rounded-xl border p-4 ${
          isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className={issue.severity === "critical" ? "text-red-400" : issue.severity === "warning" ? "text-amber-400" : "text-blue-400"} />
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityColor(issue.severity)}`}>
                {issue.severity.toUpperCase()}
              </span>
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Line {issue.line}</span>
            </div>
            <span className={`text-[10px] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>{issue.type}</span>
          </div>
          <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{issue.description}</p>
          {issue.suggestion && (
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Suggestion: {issue.suggestion}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ isDark, text }: { isDark: boolean; text: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
      <Bug size={32} className="mb-3 opacity-30" />
      <p className="text-sm font-[Inter]">{text}</p>
    </div>
  );
}

export default function DebuggingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<DebugTab>("error-analyzer");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<DebugSession | null>(null);
  const [issues, setIssues] = useState<DebugIssue[]>([]);
  const [history, setHistory] = useState<DebugHistoryResponse | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [logContent, setLogContent] = useState("");
  const [fixError, setFixError] = useState("");
  const [deps, setDeps] = useState<{ name: string; status: "ok" | "missing" | "mismatch" | "unknown"; detail?: string }[] | null>(null);

  const handleAnalyzeError = useCallback(async () => {
    if (!errorMessage.trim()) { toast.error("Paste an error message first"); return; }
    setLoading(true); setSession(null);
    try {
      const result = await analyzeError({ errorMessage: errorMessage.trim(), inputCode: inputCode.trim() || undefined });
      setSession(result);
      toast.success("Error analyzed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally { setLoading(false); }
  }, [errorMessage, inputCode]);

  const handleAnalyzeStacktrace = useCallback(async () => {
    if (!stackTrace.trim()) { toast.error("Paste a stack trace first"); return; }
    setLoading(true); setSession(null);
    try {
      const result = await analyzeStacktrace({ stackTrace: stackTrace.trim() });
      setSession(result);
      toast.success("Stack trace analyzed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally { setLoading(false); }
  }, [stackTrace]);

  const handleDetectBugs = useCallback(async () => {
    if (!inputCode.trim()) { toast.error("Enter code to analyze"); return; }
    setLoading(true); setSession(null); setIssues([]);
    try {
      const result = await detectBugs({ inputCode: inputCode.trim() });
      setSession(result);
      setIssues(result.issues || []);
      toast.success(`Found ${(result.issues || []).length} issues`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bug detection failed");
    } finally { setLoading(false); }
  }, [inputCode]);

  const handleAskFix = useCallback(async () => {
    const err = fixError.trim() || errorMessage.trim();
    if (!err && !inputCode.trim()) { toast.error("Provide an error or code context"); return; }
    setLoading(true); setSession(null);
    try {
      const result = await suggestFix({
        errorMessage: err || undefined,
        inputCode: inputCode.trim() || undefined,
      });
      setSession(result.session);
      toast.success("Fix suggested");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to get fix");
    } finally { setLoading(false); }
  }, [fixError, errorMessage, inputCode]);

  const handleAnalyzeLogs = useCallback(async () => {
    if (!logContent.trim()) { toast.error("Paste log content first"); return; }
    setLoading(true); setSession(null);
    try {
      const result = await analyzeLogs({ logContent: logContent.trim() });
      setSession(result);
      toast.success("Logs analyzed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Log analysis failed");
    } finally { setLoading(false); }
  }, [logContent]);

  const checkDependencies = useCallback(() => {
    setDeps(null);
    const code = inputCode.trim();
    if (!code) { toast.error("Enter code to check dependencies"); return; }

    const issues_: typeof deps = [];
    const importMatch = code.matchAll(/(?:from\s+["']([^"']+)["']|require\(["']([^"']+)["']\)|import\s+["']([^"']+)["'])/g);
    const imports = new Set<string>();
    for (const m of importMatch) {
      const pkg = m[1] || m[2] || m[3];
      if (pkg && !pkg.startsWith(".") && !pkg.startsWith("/")) {
        const name = pkg.split("/")[0];
        if (name.startsWith("@")) {
          imports.add(`${name.split("/")[0]}/${name.split("/")[1]}`);
        } else {
          imports.add(name);
        }
      }
    }

    const envMatch = code.matchAll(/(?:process\.env\.([A-Z_]+)|Deno\.env\.get\(["']([A-Z_]+)["']\))/g);
    const envVars = new Set<string>();
    for (const m of envMatch) {
      envVars.add(m[1] || m[2]);
    }

    imports.forEach((name) => {
      if (["react", "react-dom", "next", "express", "typescript", "tailwindcss"].includes(name)) {
        issues_?.push({ name, status: "ok" });
      } else if (name.startsWith("@")) {
        issues_?.push({ name, status: "unknown", detail: "Can't verify without package.json" });
      } else {
        issues_?.push({ name, status: "unknown", detail: "Check if this package is installed" });
      }
    });

    envVars.forEach((v) => {
      issues_?.push({ name: `env:${v}`, status: "unknown", detail: "Verify this env var is set in your environment" });
    });

    if (issues_.length === 0) {
      issues_.push({ name: "No external dependencies detected", status: "ok" });
    }

    setDeps(issues_);
    toast.success(`Checked ${issues_.length} dependencies`);
  }, [inputCode]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDebugHistory();
      setHistory(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load history");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "error-analyzer":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Paste an error message to get an explanation, root cause, and suggested fix.
            </p>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Paste error message here..."
              rows={4}
              className={inputClass(isDark)}
            />
            <div className="mt-3">
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Optional: paste the relevant code..."
                rows={3}
                className={inputClass(isDark)}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleAnalyzeError} disabled={loading} className={buttonClass(isDark)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Siren size={15} />}
                Analyze
              </button>
            </div>
            {!loading && !session && <EmptyState isDark={isDark} text="Paste an error and click Analyze" />}
          </div>
        );

      case "stack-trace":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Paste a full stack trace to find where the error originated and the root cause.
            </p>
            <textarea
              value={stackTrace}
              onChange={(e) => setStackTrace(e.target.value)}
              placeholder="Paste stack trace here..."
              rows={6}
              className={inputClass(isDark)}
            />
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleAnalyzeStacktrace} disabled={loading} className={buttonClass(isDark)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Terminal size={15} />}
                Analyze Stack Trace
              </button>
            </div>
            {!loading && !session && <EmptyState isDark={isDark} text="Paste a stack trace and click Analyze" />}
          </div>
        );

      case "bug-detection":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Paste code to scan for null references, missing returns, async issues, and more.
            </p>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste code to analyze..."
              rows={8}
              className={inputClass(isDark)}
            />
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleDetectBugs} disabled={loading} className={buttonClass(isDark)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ScanSearch size={15} />}
                Scan for Bugs
              </button>
            </div>
            {!loading && !session && <EmptyState isDark={isDark} text="Paste code and click Scan for Bugs" />}
            {issues.length > 0 && <IssuesList issues={issues} isDark={isDark} />}
          </div>
        );

      case "fix-suggestions":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Describe the problem or paste the error to get a suggested fix with corrected code.
            </p>
            <textarea
              value={fixError}
              onChange={(e) => setFixError(e.target.value)}
              placeholder="Describe the problem or paste the error..."
              rows={3}
              className={inputClass(isDark)}
            />
            <div className="mt-3">
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Optional: paste the relevant code for context..."
                rows={4}
                className={inputClass(isDark)}
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleAskFix} disabled={loading} className={buttonClass(isDark)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Wrench size={15} />}
                Suggest Fix
              </button>
            </div>
            {!loading && !session && <EmptyState isDark={isDark} text="Describe the problem and click Suggest Fix" />}
          </div>
        );

      case "log-analysis":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Paste application logs to get a summary of what happened, why, and how to fix it.
            </p>
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              placeholder="Paste application logs here..."
              rows={8}
              className={inputClass(isDark)}
            />
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleAnalyzeLogs} disabled={loading} className={buttonClass(isDark)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ScrollText size={15} />}
                Analyze Logs
              </button>
            </div>
            {!loading && !session && <EmptyState isDark={isDark} text="Paste logs and click Analyze Logs" />}
          </div>
        );

      case "dependency-checker":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Paste code to check for missing imports, incorrect package names, and environment variables.
            </p>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste code with imports to check..."
              rows={6}
              className={inputClass(isDark)}
            />
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={checkDependencies} className={buttonClass(isDark)}>
                <PackageSearch size={15} />
                Check Dependencies
              </button>
            </div>
            {deps && (
              <div className="mt-4 space-y-2">
                {deps.map((d, i) => (
                  <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${
                      d.status === "ok" ? "bg-emerald-500" : d.status === "missing" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{d.name}</span>
                    {d.detail && <span className={`ml-auto text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{d.detail}</span>}
                  </div>
                ))}
              </div>
            )}
            {!deps && !loading && <EmptyState isDark={isDark} text="Paste code and click Check Dependencies" />}
          </div>
        );

      case "history":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Previous debugging sessions — revisit errors, fixes, and their status.
            </p>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : history && history.sessions.length > 0 ? (
              <div className="space-y-3">
                {history.sessions.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => { setSession(s); setActiveTab("error-analyzer"); }}
                    className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                      isDark ? "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          s.status === "resolved" ? "bg-emerald-500/10 text-emerald-500" : s.status === "unresolved" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {s.status}
                        </span>
                        <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.sessionType.replace(/_/g, " ")}</span>
                      </div>
                      <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm truncate ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {s.errorMessage || s.explanation?.slice(0, 120) || "No details"}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState isDark={isDark} text="No debugging history yet" />
            )}
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/20">
              <Bug size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`font-[Outfit] text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>AI Debugging</h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Identify, understand, and fix code errors with AI
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar + Content */}
        <div className="flex gap-6">
          {/* Tab sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setActiveTab(tab.id); setSession(null); setIssues([]); }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all font-[Inter] cursor-pointer ${
                      active
                        ? isDark
                          ? "bg-violet-500/10 text-violet-300"
                          : "bg-violet-50 text-violet-700"
                        : isDark
                          ? "text-slate-400 hover:bg-white/[0.04]"
                          : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 size={32} className="mx-auto mb-3 animate-spin text-violet-500" />
                  <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    AI is analyzing...
                  </p>
                </div>
              </div>
            )}
            {!loading && renderTabContent()}
            {!loading && session && activeTab !== "history" && (
              <ResultCard session={session} isDark={isDark} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
