import { useState, useCallback, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  Gauge,
  GitFork,
  Copy,
  FileJson,
  Lightbulb,
  FileText,
  Clock,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Info,
  Loader2,
  Download,
  Copy as CopyIcon,
  CheckCheck,
  FileCode2,
  Lines,
  BarChart3,
  Layers,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  runPerformanceAnalysis,
  getPerformanceHistory,
  getPerformanceReport,
} from "@/services/performance";
import type { PerformanceTab, PerformanceScan, PerformanceIssue, PerformanceReport as PerfReport } from "@/types/performance";

const tabs: { id: PerformanceTab; label: string; icon: typeof Gauge }[] = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "complexity", label: "Complexity", icon: GitFork },
  { id: "duplicate", label: "Duplicate Code", icon: Copy },
  { id: "large-files", label: "Large Files", icon: FileJson },
  { id: "ai-suggestions", label: "AI Suggestions", icon: Lightbulb },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "history", label: "History", icon: Clock },
];

function inputClass(isDark: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm font-[Inter] transition-colors outline-none ${
    isDark
      ? "border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
  }`;
}

function buttonClass(isDark: boolean) {
  return `inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all font-[Inter] cursor-pointer ${
    isDark
      ? "bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/20"
      : "bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/20"
  } disabled:opacity-50 disabled:cursor-not-allowed`;
}

const severityIcon = (s: string, size = 15) => {
  if (s === "critical") return <AlertOctagon key={s} size={size} className="text-red-500" />;
  if (s === "high") return <AlertTriangle key={s} size={size} className="text-orange-400" />;
  if (s === "medium") return <AlertCircle key={s} size={size} className="text-amber-400" />;
  return <Info key={s} size={size} className="text-blue-400" />;
};

const severityBg = (s: string) => {
  if (s === "critical") return "bg-red-500/10 text-red-400";
  if (s === "high") return "bg-orange-500/10 text-orange-400";
  if (s === "medium") return "bg-amber-500/10 text-amber-400";
  return "bg-blue-500/10 text-blue-400";
};

const typeIcon = (t: string, size = 14) => {
  if (t === "complexity") return <GitFork key={t} size={size} />;
  if (t === "duplicate") return <Copy key={t} size={size} />;
  if (t === "large_file") return <FileJson key={t} size={size} />;
  return <Lightbulb key={t} size={size} />;
};

function EmptyState({ isDark, text }: { isDark: boolean; text: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
      <Gauge size={32} className="mb-3 opacity-30" />
      <p className="text-sm font-[Inter]">{text}</p>
    </div>
  );
}

function ScoreGauge({ score, label, size = "md" }: { score: number; label?: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-20 w-20 text-xl" : size === "lg" ? "h-40 w-40 text-5xl" : "h-28 w-28 text-3xl";
  const stroke = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const r = size === "sm" ? 32 : size === "lg" ? 64 : 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className={`relative inline-flex items-center justify-center ${dims}`}>
      <svg className="absolute inset-0 -rotate-90" viewBox={size === "sm" ? "0 0 80 80" : size === "lg" ? "0 0 160 160" : "0 0 104 104"}>
        <circle cx="50%" cy="50%" r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="opacity-10" />
        <circle cx="50%" cy="50%" r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className={color}
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
      </svg>
      <span className={`font-[Outfit] font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
        {score}
      </span>
      {label && (
        <span className={`absolute -bottom-5 text-[10px] whitespace-nowrap ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          {label}
        </span>
      )}
    </div>
  );
}

function IssueCard({ issue, isDark }: { issue: PerformanceIssue; isDark: boolean }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${
      isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {severityIcon(issue.severity)}
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityBg(issue.severity)}`}>
            {issue.severity.toUpperCase()}
          </span>
          {typeIcon(issue.issueType)}
          <span className={`text-[10px] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {issue.issueType.replace(/_/g, " ")}
          </span>
        </div>
        {issue.filePath && (
          <span className={`text-[11px] shrink-0 max-w-[200px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            <FileCode2 size={11} className="inline mr-1" />
            {issue.filePath}
          </span>
        )}
      </div>
      <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{issue.title}</h4>
      {issue.description && (
        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{issue.description}</p>
      )}
      {issue.recommendation && (
        <div className={`rounded-lg p-3 text-sm ${
          isDark ? "bg-amber-500/5 border border-amber-500/10" : "bg-amber-50 border border-amber-100"
        }`}>
          <p className="flex items-center gap-1.5 text-amber-600 font-medium text-xs mb-1">
            <Lightbulb size={12} /> Recommendation
          </p>
          <p className={`${isDark ? "text-amber-300" : "text-amber-700"}`}>{issue.recommendation}</p>
        </div>
      )}
      {issue.snippet && (
        <pre className={`rounded-lg p-3 text-xs font-mono overflow-x-auto ${
          isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-600"
        }`}>{issue.snippet}</pre>
      )}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => { navigator.clipboard.writeText(issue.recommendation || issue.description || ""); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 2000); }}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            isDark ? "text-slate-400 hover:bg-white/[0.04]" : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          {copied ? <CheckCheck size={13} /> : <CopyIcon size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<PerformanceTab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<(PerformanceScan & {
    complexityIssues?: number;
    duplicateIssues?: number;
    largeFileIssues?: number;
    totalIssues?: number;
    avgComplexity?: number;
    maxComplexity?: number;
  }) | null>(null);
  const [history, setHistory] = useState<{ scans: PerformanceScan[]; total: number } | null>(null);
  const [report, setReport] = useState<PerfReport | null>(null);
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);

  const handleScan = useCallback(async () => {
    setLoading(true);
    setScanResult(null);
    setIssues([]);
    try {
      const result = await runPerformanceAnalysis();
      setScanResult(result);
      setIssues(result.issues || []);
      toast.success(`Analysis complete — Score: ${result.performanceScore}/100`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally { setLoading(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPerformanceHistory();
      setHistory(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load history");
    } finally { setLoading(false); }
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!scanResult) { toast.error("Run an analysis first"); return; }
    setLoading(true);
    try {
      const result = await getPerformanceReport(scanResult.id);
      setReport(result);
      toast.success("Report generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Report failed");
    } finally { setLoading(false); }
  }, [scanResult]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  const filteredIssues = (type?: string) => {
    if (!type) return issues;
    return issues.filter((i) => i.issueType === type);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Analyze repository performance, complexity, and code quality.
              </p>
              <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Gauge size={15} />}
                {loading ? "Analyzing..." : "Run Performance Analysis"}
              </button>
            </div>

            {scanResult && (
              <div className="space-y-6">
                <div className={`rounded-2xl border p-6 sm:p-8 ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white shadow-sm"}`}>
                  <div className="flex flex-col items-center mb-6">
                    <ScoreGauge score={scanResult.overallHealth} label="Overall Health" size="lg" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Performance", value: scanResult.performanceScore, color: "text-emerald-500" },
                      { label: "Maintainability", value: scanResult.maintainabilityScore, color: "text-amber-500" },
                      { label: "Readability", value: scanResult.readabilityScore, color: "text-blue-400" },
                      { label: "Files Analyzed", value: scanResult.filesAnalyzed, color: "" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className={`text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : s.color || "text-slate-900"}`}>{s.value}</div>
                        <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Total Issues", value: scanResult.totalIssues || 0, icon: AlertTriangle },
                      { label: "Complexity", value: scanResult.complexityIssues || 0, icon: GitFork },
                      { label: "Duplicates", value: scanResult.duplicateIssues || 0, icon: Copy },
                      { label: "Large Files", value: scanResult.largeFileIssues || 0, icon: FileJson },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-xl border p-3 text-center ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
                        <s.icon size={16} className="mx-auto mb-1 text-amber-500" />
                        <div className={`text-lg font-bold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>{s.value}</div>
                        <div className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {scanResult.summary && (
                    <p className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{scanResult.summary}</p>
                  )}
                  {scanResult.avgComplexity !== undefined && (
                    <div className={`mt-4 flex gap-6 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      <span>Avg Complexity: {scanResult.avgComplexity}</span>
                      <span>Max Complexity: {scanResult.maxComplexity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loading && !scanResult && <EmptyState isDark={isDark} text="No analysis data yet. Click 'Run Performance Analysis' to get started." />}
          </div>
        );

      case "complexity":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Code complexity analysis — nested loops, long functions, high cyclomatic complexity.
            </p>
            {!scanResult && (
              <div className="mb-4">
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <GitFork size={15} />}
                  Analyze Complexity
                </button>
              </div>
            )}
            {renderIssues("complexity")}
          </div>
        );

      case "duplicate":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Repeated code and logic across the project.
            </p>
            {!scanResult && (
              <div className="mb-4">
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} />}
                  Find Duplicates
                </button>
              </div>
            )}
            {renderIssues("duplicate")}
          </div>
        );

      case "large-files":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Files that exceed recommended size limits and should be split up.
            </p>
            {!scanResult && (
              <div className="mb-4">
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <FileJson size={15} />}
                  Detect Large Files
                </button>
              </div>
            )}
            {renderIssues("large_file")}
          </div>
        );

      case "ai-suggestions":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              AI-powered performance optimization suggestions — loops, queries, caching, and more.
            </p>
            {!scanResult && (
              <div className="mb-4">
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Lightbulb size={15} />}
                  Get AI Suggestions
                </button>
              </div>
            )}
            {renderIssues("ai_suggestion")}
          </div>
        );

      case "reports":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Generate and download performance analysis reports.
            </p>
            {scanResult ? (
              <div className="space-y-4">
                <div className={`rounded-xl border p-5 ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}>
                  <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Latest Analysis</h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Overall: {scanResult.overallHealth}/100 | Performance: {scanResult.performanceScore}/100 | Files: {scanResult.filesAnalyzed} | Issues: {scanResult.totalIssues || 0}
                  </p>
                </div>
                <button type="button" onClick={handleGenerateReport} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Generate Markdown Report
                </button>
                {report && (
                  <div>
                    <pre className={`rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-96 ${
                      isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}>{report.content}</pre>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(report.content || ""); toast.success("Report copied"); }}
                      className={`mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        isDark ? "text-slate-400 hover:bg-white/[0.04]" : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <CopyIcon size={13} /> Copy Report
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Gauge size={15} />}
                  Run Analysis First
                </button>
                <EmptyState isDark={isDark} text="Run a performance analysis before generating a report" />
              </div>
            )}
          </div>
        );

      case "history":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Previous performance analyses — track code quality improvements over time.
            </p>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : history && history.scans.length > 0 ? (
              <div className="space-y-3">
                {history.scans.map((scan) => (
                  <button
                    type="button"
                    key={scan.id}
                    onClick={() => { setScanResult(scan as any); setIssues(scan.issues || []); setActiveTab("dashboard"); }}
                    className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                      isDark ? "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ScoreGauge score={scan.overallHealth} size="sm" />
                        <div>
                          <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Health: {scan.overallHealth}/100 · Perf: {scan.performanceScore}/100
                          </div>
                          <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {scan.issues?.length || 0} issues · {scan.filesAnalyzed} files · {new Date(scan.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(scan.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState isDark={isDark} text="No performance analyses yet" />
            )}
          </div>
        );
    }
  };

  function renderIssues(type?: string) {
    const displayIssues = type ? filteredIssues(type) : issues;

    if (displayIssues.length === 0) {
      return <EmptyState isDark={isDark} text={scanResult ? `No ${type?.replace(/_/g, " ") || ""} issues found` : "Run an analysis to detect issues"} />;
    }
    return (
      <div className="space-y-3">
        {displayIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} isDark={isDark} />
        ))}
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <Gauge size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`font-[Outfit] text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Performance Analysis</h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Analyze code complexity, duplicates, file sizes, and get AI performance suggestions
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all font-[Inter] cursor-pointer ${
                      active
                        ? isDark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"
                        : isDark ? "text-slate-400 hover:bg-white/[0.04]" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 min-w-0">
            {loading && activeTab !== "history" && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 size={32} className="mx-auto mb-3 animate-spin text-amber-500" />
                  <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Analyzing repository performance...
                  </p>
                </div>
              </div>
            )}
            {!loading && renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
