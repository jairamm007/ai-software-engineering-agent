import { useTheme } from "@/context/ThemeContext";

interface Props {
  loading: boolean;
  onExplain: () => void;
  onReview: () => void;
  onFix: () => void;
  onGenerateCommit: () => void;
  onGeneratePullRequest: () => void;
  onGenerateTests: () => void;
  onSecurityScan: () => void;
  onArchitecture: () => void;
  onDocs: () => void;
}

export default function AIActionPanel({
  loading,
  onExplain,
  onReview,
  onFix,
  onGenerateCommit,
  onGeneratePullRequest,
  onGenerateTests,
  onSecurityScan,
  onArchitecture,
  onDocs,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const buttonClass = isDark
    ? "rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-[var(--accent)] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
    : "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--accent)] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
  const disabledClass = loading ? "cursor-not-allowed opacity-50" : "";

  return (
    <div className={`flex flex-wrap gap-2 rounded-xl border p-3 shadow-sm ${
      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
    }`}>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onExplain}>🤖 Explain File</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onReview}>🔍 Code Review</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onFix}>✨ Suggest Fix</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onGenerateCommit}>📝 Generate Commit</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onGeneratePullRequest}>🚀 Generate PR</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onGenerateTests}>🧪 Generate Tests</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onSecurityScan}>🛡️ Security Scan</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onArchitecture}>🏗 Architecture</button>
      <button disabled={loading} className={`${buttonClass} ${disabledClass}`} onClick={onDocs}>📝 Generate Docs</button>
    </div>
  );
}
