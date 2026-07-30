import { useState, useCallback, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  Shield,
  Eye,
  PackageSearch,
  SearchCode,
  Lightbulb,
  FileText,
  Clock,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Info,
  Loader2,
  Download,
  Copy,
  CheckCheck,
  FileCode2,
  Bug,
} from "lucide-react";
import { toast } from "sonner";
import {
  runSecurityScan,
  getSecurityHistory,
  getSecurityReport,
  updateSecurityIssue,
} from "@/services/security";
import type { SecurityTab, SecurityScan, SecurityIssue, SecurityReport } from "@/types/security";

const tabs: { id: SecurityTab; label: string; icon: typeof Shield }[] = [
  { id: "dashboard", label: "Dashboard", icon: Shield },
  { id: "secret-detection", label: "Secret Detection", icon: Eye },
  { id: "dependency-scan", label: "Dependency Scan", icon: PackageSearch },
  { id: "ai-review", label: "AI Security Review", icon: SearchCode },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "history", label: "History", icon: Clock },
];

function inputClass(isDark: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm font-[Inter] transition-colors outline-none ${
    isDark
      ? "border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
  }`;
}

function buttonClass(isDark: boolean) {
  return `inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all font-[Inter] cursor-pointer ${
    isDark
      ? "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
      : "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
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

function EmptyState({ isDark, text }: { isDark: boolean; text: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
      <Shield size={32} className="mb-3 opacity-30" />
      <p className="text-sm font-[Inter]">{text}</p>
    </div>
  );
}

function ScoreGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-20 w-20 text-xl" : size === "lg" ? "h-40 w-40 text-5xl" : "h-32 w-32 text-4xl";
  const stroke = size === "sm" ? 6 : size === "lg" ? 10 : 8;
  const r = size === "sm" ? 32 : size === "lg" ? 64 : 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500";

  return (
    <div className={`relative inline-flex items-center justify-center ${dims}`}>
      <svg className="absolute inset-0 -rotate-90" viewBox={size === "sm" ? "0 0 80 80" : size === "lg" ? "0 0 160 160" : "0 0 120 120"}>
        <circle cx="50%" cy="50%" r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="opacity-10" />
        <circle cx="50%" cy="50%" r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className={color}
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
      </svg>
      <span className={`font-[Outfit] font-bold ${size === "sm" ? "text-lg" : size === "lg" ? "text-5xl" : "text-3xl"} ${isDark ? "text-white" : "text-slate-900"}`}>
        {score}
      </span>
    </div>
  );
}

function IssueCard({ issue, isDark, onResolve }: { issue: SecurityIssue; isDark: boolean; onResolve: (id: string) => void }) {
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
          isDark ? "bg-emerald-500/5 border border-emerald-500/10" : "bg-emerald-50 border border-emerald-100"
        }`}>
          <p className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs mb-1">
            <Lightbulb size={12} /> Recommendation
          </p>
          <p className={`${isDark ? "text-emerald-300" : "text-emerald-700"}`}>{issue.recommendation}</p>
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
          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
        {issue.status === "open" && (
          <button
            type="button"
            onClick={() => onResolve(issue.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isDark ? "text-emerald-400 hover:bg-emerald-500/10" : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            Mark Resolved
          </button>
        )}
        {issue.status !== "open" && (
          <span className={`text-xs px-3 py-1.5 rounded-lg ${issue.status === "resolved" ? "text-emerald-500" : "text-slate-500"}`}>
            {issue.status}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<SecurityTab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<(SecurityScan & { criticalCount?: number; highCount?: number; mediumCount?: number; lowCount?: number }) | null>(null);
  const [history, setHistory] = useState<{ scans: SecurityScan[]; total: number } | null>(null);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const handleScan = useCallback(async () => {
    setLoading(true);
    setScanResult(null);
    setIssues([]);
    try {
      const result = await runSecurityScan();
      setScanResult(result);
      setIssues(result.issues || []);
      toast.success(`Scan complete — Score: ${result.securityScore}/100`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Scan failed");
    } finally { setLoading(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSecurityHistory();
      setHistory(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load history");
    } finally { setLoading(false); }
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!scanResult) { toast.error("Run a scan first"); return; }
    setLoading(true);
    try {
      const result = await getSecurityReport(scanResult.id);
      setReport(result);
      toast.success("Report generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Report failed");
    } finally { setLoading(false); }
  }, [scanResult]);

  const handleResolve = useCallback(async (issueId: string) => {
    try {
      await updateSecurityIssue({ issueId, status: "resolved" });
      setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: "resolved" } : i)));
      if (scanResult) {
        setScanResult((prev) => prev ? { ...prev, issues: prev.issues.map((i) => (i.id === issueId ? { ...i, status: "resolved" } : i)) } : prev);
      }
      toast.success("Issue resolved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }, [scanResult]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  const filteredIssues = filterSeverity === "all" ? issues : issues.filter((i) => i.severity === filterSeverity);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Run a security scan to detect vulnerabilities, secrets, and code issues.
              </p>
              <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                {loading ? "Scanning..." : "Run Security Scan"}
              </button>
            </div>

            {scanResult && (
              <div className={`rounded-2xl border p-6 sm:p-8 ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white shadow-sm"}`}>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="text-center">
                    <ScoreGauge score={scanResult.securityScore} />
                    <p className={`mt-2 text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>Security Score</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                    {[
                      { label: "Total Issues", value: scanResult.issues?.length || 0, color: "text-slate-900" },
                      { label: "Critical", value: scanResult.criticalCount || 0, color: "text-red-500" },
                      { label: "High", value: scanResult.highCount || 0, color: "text-orange-400" },
                      { label: "Medium", value: scanResult.mediumCount || 0, color: "text-amber-400" },
                      { label: "Low", value: scanResult.lowCount || 0, color: "text-blue-400" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className={`text-2xl font-bold font-[Outfit] ${isDark ? "text-white" : s.color}`}>{s.value}</div>
                        <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {scanResult.summary && (
                  <p className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{scanResult.summary}</p>
                )}
              </div>
            )}

            {!loading && !scanResult && <EmptyState isDark={isDark} text="No scan data yet. Click 'Run Security Scan' to get started." />}
          </div>
        );

      case "secret-detection":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Detected API keys, tokens, passwords, and other secrets exposed in your codebase.
            </p>
            {!scanResult && (
              <div className="mb-4">
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                  Scan for Secrets
                </button>
              </div>
            )}
            {renderIssues("secret")}
          </div>
        );

      case "dependency-scan":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Known vulnerabilities in your project's dependencies and packages.
            </p>
            {!scanResult && (
              <div className="mb-4">
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <PackageSearch size={15} />}
                  Scan Dependencies
                </button>
              </div>
            )}
            {renderIssues("dependency")}
          </div>
        );

      case "ai-review":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              AI-powered code review for SQL injection, XSS, input validation, and other security flaws.
            </p>
            {!scanResult && (
              <div className="mb-4">
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <SearchCode size={15} />}
                  Run AI Review
                </button>
              </div>
            )}
            {renderIssues("ai")}
          </div>
        );

      case "recommendations":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              All detected issues with AI-generated recommendations for fixing them.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {["all", "critical", "high", "medium", "low"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSeverity(s)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterSeverity === s
                      ? severityBg(s === "all" ? "low" : s) + " ring-1 ring-current"
                      : isDark ? "text-slate-400 hover:bg-white/[0.04]" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
              {!scanResult && (
                <button type="button" onClick={handleScan} disabled={loading} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 ml-auto">
                  {loading ? <Loader2 size={12} className="animate-spin inline" /> : null}
                  Run Scan
                </button>
              )}
            </div>
            {renderIssues()}
          </div>
        );

      case "reports":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Generate and download security scan reports.
            </p>
            {scanResult ? (
              <div className="space-y-4">
                <div className={`rounded-xl border p-5 ${isDark ? "border-white/[0.06] bg-white/[0.03]" : "border-slate-200 bg-white"}`}>
                  <h3 className={`text-sm font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Latest Scan</h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Score: {scanResult.securityScore}/100 | Issues: {scanResult.issues?.length || 0} | {new Date(scanResult.createdAt).toLocaleString()}
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
                      <Copy size={13} /> Copy Report
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button type="button" onClick={handleScan} disabled={loading} className={buttonClass(isDark)}>
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
                  Run Scan First
                </button>
                <EmptyState isDark={isDark} text="Run a security scan before generating a report" />
              </div>
            )}
          </div>
        );

      case "history":
        return (
          <div>
            <p className={`mb-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Previous security scans — track improvements over time.
            </p>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
            ) : history && history.scans.length > 0 ? (
              <div className="space-y-3">
                {history.scans.map((scan) => (
                  <button
                    type="button"
                    key={scan.id}
                    onClick={() => { setScanResult(scan); setIssues(scan.issues || []); setActiveTab("dashboard"); }}
                    className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer ${
                      isDark ? "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06]" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ScoreGauge score={scan.securityScore} size="sm" />
                        <div>
                          <div className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                            Score: {scan.securityScore}/100
                          </div>
                          <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                            {scan.issues?.length || 0} issues · {new Date(scan.createdAt).toLocaleDateString()}
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
              <EmptyState isDark={isDark} text="No security scans yet" />
            )}
          </div>
        );
    }
  };

  function renderIssues(filterType?: string) {
    let displayIssues = issues;
    if (filterType === "secret") displayIssues = issues.filter((i) => i.issueType === "secret");
    else if (filterType === "dependency") displayIssues = issues.filter((i) => i.issueType === "dependency");
    else if (filterType === "ai") displayIssues = issues.filter((i) => !["secret", "dependency"].includes(i.issueType));
    if (filterSeverity !== "all") displayIssues = displayIssues.filter((i) => i.severity === filterSeverity);

    if (displayIssues.length === 0) {
      return <EmptyState isDark={isDark} text={scanResult ? "No issues of this type found" : "Run a scan to detect issues"} />;
    }
    return (
      <div className="space-y-3">
        {displayIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} isDark={isDark} onResolve={handleResolve} />
        ))}
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`font-[Outfit] text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Security Analysis</h1>
              <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Detect vulnerabilities, secrets, and security issues before deployment
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
                    onClick={() => { setActiveTab(tab.id); setFilterSeverity("all"); }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all font-[Inter] cursor-pointer ${
                      active
                        ? isDark ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700"
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

          {/* Content */}
          <div className="flex-1 min-w-0">
            {loading && activeTab !== "history" && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 size={32} className="mx-auto mb-3 animate-spin text-emerald-500" />
                  <p className={`text-sm font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Scanning for vulnerabilities...
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
