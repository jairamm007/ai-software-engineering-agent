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
  const buttonClass =
    "rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-blue-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400";
  const disabledClass = loading
    ? "cursor-not-allowed opacity-50"
    : "";

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-sm">
      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onExplain}
      >
        🤖 Explain File
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onReview}
      >
        🔍 Code Review
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onFix}
      >
        ✨ Suggest Fix
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onGenerateCommit}
      >
        📝 Generate Commit
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onGeneratePullRequest}
      >
        🚀 Generate PR
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onGenerateTests}
      >
        🧪 Generate Tests
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onSecurityScan}
      >
        🛡️ Security Scan
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onArchitecture}
      >
        🏗 Architecture
      </button>

      <button
        disabled={loading}
        className={`${buttonClass} ${disabledClass}`}
        onClick={onDocs}
      >
        📝 Generate Docs
      </button>
    </div>
  );
}
