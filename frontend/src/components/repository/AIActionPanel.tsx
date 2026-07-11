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
    "rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-slate-100";
  const disabledClass = loading
    ? "cursor-not-allowed opacity-50"
    : "";

  return (
    <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-sm">
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
