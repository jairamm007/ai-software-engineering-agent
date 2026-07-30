import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, Search, CheckCircle, XCircle, AlertCircle, Users, GitBranch, FileText } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { getGitHubBranchProtection } from "@/services/github-integration";
import type { GitHubBranchProtection } from "@/types/github-integration";

interface GitHubBranchProtectionTabProps {
  integrationId: string;
  owner: string;
  repo: string;
  timeAgo: (d: string | Date) => string;
}

function ProtectionBadge({ enabled }: { enabled: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        <CheckCircle size={10} />
        Enabled
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
      <XCircle size={10} />
      Disabled
    </span>
  );
}

function SectionCard({ title, icon: Icon, children, isDark }: { title: string; icon: React.ElementType; children: React.ReactNode; isDark: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ListBadge({ label }: { label: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
      {label}
    </span>
  );
}

export default function GitHubBranchProtectionTab({ integrationId, owner, repo: repoName, timeAgo }: GitHubBranchProtectionTabProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [branch, setBranch] = useState("main");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data: protection, isLoading, error } = useQuery({
    queryKey: ["github-branch-protection", integrationId, owner, repoName, branch],
    queryFn: () => getGitHubBranchProtection(integrationId, owner, repoName, branch),
    enabled: searchTriggered,
  });

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const inputClasses = isDark
    ? "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
    : "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-500";

  const baseCardClasses = isDark
    ? "rounded-xl border border-white/10 bg-white/5 p-6"
    : "rounded-xl border border-slate-200 bg-white p-6";

  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const subtleText = isDark ? "text-slate-500" : "text-slate-400";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <div className="mb-4 flex items-center gap-2">
        <input
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter branch name (e.g. main, develop)"
          className={inputClasses}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading || !branch.trim()}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isDark
              ? "bg-slate-700 text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              : "bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          }`}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Load Protection Rules
        </button>
      </div>

      {!searchTriggered && (
        <div className={`rounded-xl border p-12 text-center ${baseCardClasses}`}>
          <Shield size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-700" : "text-slate-200"}`} />
          <h3 className={`mb-2 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Branch Protection
          </h3>
          <p className={`text-sm ${mutedText}`}>
            Enter a branch name and click <strong>Load Protection Rules</strong> to view its branch protection settings
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-16 animate-pulse rounded-xl ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
          ))}
        </div>
      )}

      {error && (
        <div className={`rounded-xl border p-6 text-center ${baseCardClasses}`}>
          <AlertCircle size={32} className={`mx-auto mb-3 ${isDark ? "text-red-400" : "text-red-500"}`} />
          <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>
            Failed to load branch protection rules. Please try again.
          </p>
          <p className={`mt-1 text-xs ${subtleText}`}>
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {searchTriggered && !isLoading && !error && !protection && (
        <div className={`rounded-xl border p-12 text-center ${baseCardClasses}`}>
          <Shield size={32} className={`mx-auto mb-3 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${mutedText}`}>No branch protection rules configured for this branch</p>
          <p className={`mt-1 text-xs ${subtleText}`}>
            Branch: <code className={`rounded px-1 py-0.5 font-mono ${isDark ? "bg-white/5" : "bg-slate-100"}`}>{branch}</code>
          </p>
        </div>
      )}

      {protection && (
        <div className="space-y-4">
          <div className={`flex items-center gap-2 ${mutedText}`}>
            <GitBranch size={14} />
            <span className="text-xs">
              Showing protection rules for <code className={`rounded px-1 py-0.5 font-mono ${isDark ? "bg-white/5" : "bg-slate-100"}`}>{owner}/{repoName}:{branch}</code>
            </span>
          </div>

          <SectionCard title="Required Status Checks" icon={CheckCircle} isDark={isDark}>
            {protection.requiredStatusChecks ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${mutedText}`}>Strict (up-to-date required)</span>
                  <ProtectionBadge enabled={protection.requiredStatusChecks.strict} />
                </div>
                {protection.requiredStatusChecks.contexts.length > 0 && (
                  <div>
                    <span className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Contexts</span>
                    <div className="flex flex-wrap gap-1.5">
                      {protection.requiredStatusChecks.contexts.map((ctx) => (
                        <ListBadge key={ctx} label={ctx} />
                      ))}
                    </div>
                  </div>
                )}
                {protection.requiredStatusChecks.checks.length > 0 && (
                  <div>
                    <span className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Checks</span>
                    <div className="flex flex-wrap gap-1.5">
                      {protection.requiredStatusChecks.checks.map((chk) => (
                        <ListBadge key={`${chk.context}-${chk.appId}`} label={`${chk.context}${chk.appId ? ` (app:${chk.appId})` : ""}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className={`text-xs ${subtleText}`}>Not configured</p>
            )}
          </SectionCard>

          <SectionCard title="Required Pull Request Reviews" icon={FileText} isDark={isDark}>
            {protection.requiredPullRequestReviews ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${mutedText}`}>Dismiss stale reviews</span>
                  <ProtectionBadge enabled={protection.requiredPullRequestReviews.dismissStaleReviews} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${mutedText}`}>Require code owner reviews</span>
                  <ProtectionBadge enabled={protection.requiredPullRequestReviews.requireCodeOwnerReviews} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${mutedText}`}>Require last push approval</span>
                  <ProtectionBadge enabled={protection.requiredPullRequestReviews.requireLastPushApproval} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${mutedText}`}>Required approving reviews:</span>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900"}`}>
                    {protection.requiredPullRequestReviews.requiredApprovingReviewCount}
                  </span>
                </div>
                {protection.requiredPullRequestReviews.dismissalRestrictions && (
                  <div>
                    <span className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Dismissal restrictions</span>
                    {protection.requiredPullRequestReviews.dismissalRestrictions.users.length > 0 && (
                      <div className="mb-1.5">
                        <span className={`mr-2 text-[10px] ${subtleText}`}>Users:</span>
                        <div className="mt-0.5 flex flex-wrap gap-1.5">
                          {protection.requiredPullRequestReviews.dismissalRestrictions.users.map((u) => (
                            <ListBadge key={u} label={u} />
                          ))}
                        </div>
                      </div>
                    )}
                    {protection.requiredPullRequestReviews.dismissalRestrictions.teams.length > 0 && (
                      <div>
                        <span className={`mr-2 text-[10px] ${subtleText}`}>Teams:</span>
                        <div className="mt-0.5 flex flex-wrap gap-1.5">
                          {protection.requiredPullRequestReviews.dismissalRestrictions.teams.map((t) => (
                            <ListBadge key={t} label={t} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className={`text-xs ${subtleText}`}>Not configured</p>
            )}
          </SectionCard>

          <SectionCard title="Restrictions" icon={Users} isDark={isDark}>
            {protection.restrictions ? (
              <div className="space-y-3">
                {protection.restrictions.users.length > 0 && (
                  <div>
                    <span className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Users</span>
                    <div className="flex flex-wrap gap-1.5">
                      {protection.restrictions.users.map((u) => (
                        <ListBadge key={u} label={u} />
                      ))}
                    </div>
                  </div>
                )}
                {protection.restrictions.teams.length > 0 && (
                  <div>
                    <span className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Teams</span>
                    <div className="flex flex-wrap gap-1.5">
                      {protection.restrictions.teams.map((t) => (
                        <ListBadge key={t} label={t} />
                      ))}
                    </div>
                  </div>
                )}
                {protection.restrictions.apps.length > 0 && (
                  <div>
                    <span className={`mb-1.5 block text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Apps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {protection.restrictions.apps.map((a) => (
                        <ListBadge key={a} label={a} />
                      ))}
                    </div>
                  </div>
                )}
                {protection.restrictions.users.length === 0 && protection.restrictions.teams.length === 0 && protection.restrictions.apps.length === 0 && (
                  <p className={`text-xs ${subtleText}`}>No push restrictions configured</p>
                )}
              </div>
            ) : (
              <p className={`text-xs ${subtleText}`}>Not configured</p>
            )}
          </SectionCard>

          <SectionCard title="Additional Settings" icon={Shield} isDark={isDark}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${mutedText}`}>Required linear history</span>
                <ProtectionBadge enabled={protection.requiredLinearHistory} />
              </div>
              <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${mutedText}`}>Allow force pushes</span>
                <ProtectionBadge enabled={protection.allowForcePushes} />
              </div>
              <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${mutedText}`}>Allow deletions</span>
                <ProtectionBadge enabled={protection.allowDeletions} />
              </div>
              <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${mutedText}`}>Required conversation resolution</span>
                <ProtectionBadge enabled={protection.requiredConversationResolution} />
              </div>
              <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${mutedText}`}>Lock branch</span>
                <ProtectionBadge enabled={protection.lockBranch} />
              </div>
              <div className={`border-t ${isDark ? "border-white/5" : "border-slate-100"}`} />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${mutedText}`}>Allow fork syncing</span>
                <ProtectionBadge enabled={protection.allowForkSyncing} />
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </motion.div>
  );
}
