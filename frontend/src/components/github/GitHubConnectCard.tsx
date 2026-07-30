import { useState } from "react";
import { Loader2, GitBranch, KeyRound, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface GitHubConnectCardProps {
  isConnecting: boolean;
  onConnect: () => void;
  onConnectWithPAT?: (token: string) => void;
  isConnectingPAT?: boolean;
  error?: string | null;
}

export default function GitHubConnectCard({
  isConnecting,
  onConnect,
  onConnectWithPAT,
  isConnectingPAT,
  error,
}: GitHubConnectCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showPAT, setShowPAT] = useState(false);
  const [pat, setPat] = useState("");

  return (
    <div className={`mx-auto max-w-2xl space-y-6`}>
      <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
        GitHub Integration
      </h1>
      <div className={`rounded-2xl border p-12 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
          <GitBranch size={40} className={isDark ? "text-slate-400" : "text-slate-500"} />
        </div>
        <h2 className={`mb-2 text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Connect your GitHub account
        </h2>
        <p className={`mb-8 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Browse repositories, view pull requests, issues, commits, and analyze your GitHub projects directly from this dashboard.
        </p>

        {/* OAuth Button */}
        <button
          type="button"
          onClick={onConnect}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#24292f] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#32383f] disabled:opacity-50"
        >
          {isConnecting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <GitBranch size={16} />
          )}
          {isConnecting ? "Connecting..." : "Connect with GitHub"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        {/* Divider */}
        <div className={`my-6 flex items-center gap-3 ${isDark ? "text-slate-600" : "text-slate-300"}`}>
          <div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
          <span className="text-xs font-medium uppercase tracking-wider">or</span>
          <div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
        </div>

        {/* PAT Section */}
        <button
          type="button"
          onClick={() => setShowPAT(!showPAT)}
          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
            isDark
              ? "border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20"
              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          <KeyRound size={16} />
          Use Personal Access Token
          {showPAT ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPAT && (
          <div className={`mt-6 rounded-xl border p-5 text-left ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
            <label className={`mb-2 block text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none transition-colors ${
                isDark
                  ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-[var(--accent)]"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)]"
              }`}
            />
            <p className={`mt-2 text-[11px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              Requires <code className={`rounded px-1 py-0.5 text-[10px] ${isDark ? "bg-white/10" : "bg-slate-200"}`}>repo</code>,{" "}
              <code className={`rounded px-1 py-0.5 text-[10px] ${isDark ? "bg-white/10" : "bg-slate-200"}`}>read:org</code>, and{" "}
              <code className={`rounded px-1 py-0.5 text-[10px] ${isDark ? "bg-white/10" : "bg-slate-200"}`}>read:user</code> scopes.
              {" "}
              <a href="https://github.com/settings/tokens/new?scopes=repo,read:org,read:user&description=ASEA" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                Generate one here
              </a>.
            </p>
            <button
              type="button"
              onClick={() => onConnectWithPAT?.(pat)}
              disabled={!pat || isConnectingPAT}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnectingPAT ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <KeyRound size={14} />
              )}
              {isConnectingPAT ? "Connecting..." : "Connect with Token"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
