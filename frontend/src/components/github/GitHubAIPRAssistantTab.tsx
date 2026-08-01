import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, CheckCircle, XCircle, MessageSquare, Lightbulb, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { generatePRDescription, suggestPRTitle, reviewPRWithAI } from "@/services/github-integration";
import type {
  AIPRAssistGeneratedDescription,
  AIPRAssistReviewResult,
  AIPRAssistTitleSuggestion,
} from "@/types/github-integration";
import { LoadingIndicator } from "@/components/LoadingIndicator";

export default function GitHubAIPRAssistantTab() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ── Description Generator state ──
  const [descOwner, setDescOwner] = useState("");
  const [descRepo, setDescRepo] = useState("");
  const [descCommits, setDescCommits] = useState("");
  const [descBase, setDescBase] = useState("main");
  const [descHead, setDescHead] = useState("");
  const [generating, setGenerating] = useState(false);
  const [description, setDescription] = useState<AIPRAssistGeneratedDescription | null>(null);
  const [descError, setDescError] = useState("");

  // ── Title Suggestion state ──
  const [titleCommits, setTitleCommits] = useState("");
  const [titleBase, setTitleBase] = useState("main");
  const [titleHead, setTitleHead] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [titleSuggestion, setTitleSuggestion] = useState<AIPRAssistTitleSuggestion | null>(null);
  const [titleError, setTitleError] = useState("");

  // ── Review state ──
  const [reviewOwner, setReviewOwner] = useState("");
  const [reviewRepo, setReviewRepo] = useState("");
  const [reviewPullNumber, setReviewPullNumber] = useState("");
  const [reviewFiles, setReviewFiles] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<AIPRAssistReviewResult | null>(null);
  const [reviewError, setReviewError] = useState("");

  const inputClass = isDark
    ? "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-violet-500"
    : "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500";

  const labelClass = isDark ? "text-sm font-medium text-slate-300" : "text-sm font-medium text-slate-700";

  const typeBadgeClass = (type: string) => {
    const map: Record<string, string> = {
      feat: isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700",
      fix: isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700",
      refactor: isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-100 text-blue-700",
      docs: isDark ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700",
      test: isDark ? "bg-purple-500/15 text-purple-400" : "bg-purple-100 text-purple-700",
      chore: isDark ? "bg-slate-500/15 text-slate-400" : "bg-slate-100 text-slate-700",
      other: isDark ? "bg-white/10 text-slate-400" : "bg-slate-100 text-slate-600",
    };
    return map[type] ?? map.other;
  };

  const verdictBadgeClass = (verdict: string) => {
    if (verdict === "approve") return isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-100 text-emerald-700";
    if (verdict === "changes_requested") return isDark ? "bg-red-500/15 text-red-400" : "bg-red-100 text-red-700";
    return isDark ? "bg-yellow-500/15 text-yellow-400" : "bg-yellow-100 text-yellow-700";
  };

  const severityColor = (severity: string) => {
    if (severity === "error") return isDark ? "text-red-400" : "text-red-600";
    if (severity === "warning") return isDark ? "text-yellow-400" : "text-yellow-600";
    return isDark ? "text-blue-400" : "text-blue-600";
  };

  const handleGenerateDescription = async () => {
    setGenerating(true);
    setDescError("");
    setDescription(null);
    try {
      const commits = descCommits
        .split("\n")
        .filter((l) => l.trim())
        .map((msg) => ({ message: msg.trim(), sha: "", author: "" }));
      const result = await generatePRDescription({
        owner: descOwner,
        repo: descRepo,
        commits,
        baseBranch: descBase,
        headBranch: descHead,
      });
      setDescription(result);
    } catch {
      setDescError("Failed to generate PR description. Please check your inputs and try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestTitles = async () => {
    setSuggesting(true);
    setTitleError("");
    setTitleSuggestion(null);
    try {
      const commits = titleCommits
        .split("\n")
        .filter((l) => l.trim())
        .map((msg) => ({ message: msg.trim(), sha: "" }));
      const result = await suggestPRTitle({
        commits,
        headBranch: titleHead,
        baseBranch: titleBase,
      });
      setTitleSuggestion(result);
    } catch {
      setTitleError("Failed to suggest PR titles. Please check your inputs and try again.");
    } finally {
      setSuggesting(false);
    }
  };

  const handleReview = async () => {
    setReviewing(true);
    setReviewError("");
    setReviewResult(null);
    try {
      const files = JSON.parse(reviewFiles || "[]");
      const result = await reviewPRWithAI({
        owner: reviewOwner,
        repo: reviewRepo,
        pullNumber: Number(reviewPullNumber),
        files,
      });
      setReviewResult(result);
    } catch {
      setReviewError("Failed to review PR. Check your inputs and ensure file patches are valid JSON.");
    } finally {
      setReviewing(false);
    }
  };

  const verdictIcon = (verdict: string) => {
    if (verdict === "approve") return <CheckCircle size={16} className="text-emerald-400" />;
    if (verdict === "changes_requested") return <XCircle size={16} className="text-red-400" />;
    return <MessageSquare size={16} className="text-yellow-400" />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
      {/* ── PR Description Generator ── */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <FileText size={18} className="text-violet-400" />
          <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>PR Description Generator</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Owner</label>
            <Input value={descOwner} onChange={(e) => setDescOwner(e.target.value)} placeholder="e.g. facebook" className="mt-1" />
          </div>
          <div>
            <label className={labelClass}>Repo</label>
            <Input value={descRepo} onChange={(e) => setDescRepo(e.target.value)} placeholder="e.g. react" className="mt-1" />
          </div>
          <div>
            <label className={labelClass}>Base Branch</label>
            <Input value={descBase} onChange={(e) => setDescBase(e.target.value)} placeholder="main" className="mt-1" />
          </div>
          <div>
            <label className={labelClass}>Head Branch</label>
            <Input value={descHead} onChange={(e) => setDescHead(e.target.value)} placeholder="e.g. feature-branch" className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Commit Messages (one per line)</label>
          <textarea
            value={descCommits}
            onChange={(e) => setDescCommits(e.target.value)}
            placeholder="feat: add new button&#10;fix: resolve overflow issue"
            rows={4}
            className={`mt-1 ${inputClass} resize-none font-mono text-xs`}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleGenerateDescription} disabled={generating || !descOwner || !descRepo || !descHead}>
            {generating ? <LoadingIndicator size="sm" /> : <Sparkles size={14} />}
            <span className="ml-1.5">{generating ? "Generating..." : "Generate Description"}</span>
          </Button>
          {descError && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={12} /> {descError}
            </span>
          )}
        </div>
        {description && (
          <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-3">
              <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{description.title}</h4>
              <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${typeBadgeClass(description.type)}`}>
                {description.type}
              </span>
            </div>
            <div className={`mt-3 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg p-3 text-xs leading-relaxed ${isDark ? "bg-black/30 text-slate-300" : "bg-white text-slate-700"}`}>
              {description.description}
            </div>
          </div>
        )}
      </Card>

      {/* ── PR Title Suggestion ── */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb size={18} className="text-yellow-400" />
          <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>PR Title Suggestion</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Head Branch</label>
            <Input value={titleHead} onChange={(e) => setTitleHead(e.target.value)} placeholder="e.g. feature-branch" className="mt-1" />
          </div>
          <div>
            <label className={labelClass}>Base Branch</label>
            <Input value={titleBase} onChange={(e) => setTitleBase(e.target.value)} placeholder="main" className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Commit Messages (one per line)</label>
          <textarea
            value={titleCommits}
            onChange={(e) => setTitleCommits(e.target.value)}
            placeholder="feat: add new button&#10;fix: resolve overflow issue"
            rows={4}
            className={`mt-1 ${inputClass} resize-none font-mono text-xs`}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSuggestTitles} disabled={suggesting || !titleHead}>
            {suggesting ? <LoadingIndicator size="sm" /> : <Sparkles size={14} />}
            <span className="ml-1.5">{suggesting ? "Suggesting..." : "Suggest Titles"}</span>
          </Button>
          {titleError && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={12} /> {titleError}
            </span>
          )}
        </div>
        {titleSuggestion && (
          <div className={`mt-4 space-y-3 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
            <div>
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Suggested Title</span>
              <p className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{titleSuggestion.suggestedTitle}</p>
              <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${typeBadgeClass(titleSuggestion.type)}`}>
                {titleSuggestion.type}
              </span>
            </div>
            <div className={`pt-3 ${isDark ? "border-t border-white/10" : "border-t border-slate-200"}`}>
              <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Alternative Titles</span>
              <ul className="mt-1 space-y-1">
                {titleSuggestion.titles.map((t, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <span className="text-violet-400">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* ── PR Review ── */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <ListChecks size={18} className="text-emerald-400" />
          <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>PR Review</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Owner</label>
            <Input value={reviewOwner} onChange={(e) => setReviewOwner(e.target.value)} placeholder="e.g. facebook" className="mt-1" />
          </div>
          <div>
            <label className={labelClass}>Repo</label>
            <Input value={reviewRepo} onChange={(e) => setReviewRepo(e.target.value)} placeholder="e.g. react" className="mt-1" />
          </div>
          <div>
            <label className={labelClass}>Pull Number</label>
            <Input value={reviewPullNumber} onChange={(e) => setReviewPullNumber(e.target.value)} placeholder="e.g. 42" className="mt-1" />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>File Patches (JSON array)</label>
          <textarea
            value={reviewFiles}
            onChange={(e) => setReviewFiles(e.target.value)}
            placeholder='[{"filename":"src/index.ts","additions":5,"deletions":2,"status":"modified","patch":"@@ -1 +1,2 @@..."}]'
            rows={4}
            className={`mt-1 ${inputClass} resize-none font-mono text-xs`}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleReview} disabled={reviewing || !reviewOwner || !reviewRepo || !reviewPullNumber}>
            {reviewing ? <LoadingIndicator size="sm" /> : <ListChecks size={14} />}
            <span className="ml-1.5">{reviewing ? "Reviewing..." : "Review PR"}</span>
          </Button>
          {reviewError && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={12} /> {reviewError}
            </span>
          )}
        </div>
        {reviewResult && (
          <div className={`mt-4 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-start justify-between">
              <h4 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Review Summary</h4>
              <span className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${verdictBadgeClass(reviewResult.verdict)}`}>
                {verdictIcon(reviewResult.verdict)}
                {reviewResult.verdict.replace("_", " ")}
              </span>
            </div>
            <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {reviewResult.summary}
            </p>
            {reviewResult.comments.length > 0 && (
              <div className={`mt-4 max-h-72 space-y-2 overflow-y-auto ${isDark ? "border-t border-white/10" : "border-t border-slate-200"} pt-3`}>
                <span className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Comments ({reviewResult.comments.length})
                </span>
                {reviewResult.comments.map((c, i) => (
                  <div key={i} className={`rounded-lg p-3 ${isDark ? "bg-white/[0.03]" : "bg-white"}`}>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className={severityColor(c.severity)}>
                        {c.severity === "error" ? <XCircle size={11} /> : c.severity === "warning" ? <AlertCircle size={11} /> : <MessageSquare size={11} />}
                      </span>
                      <span className={isDark ? "text-slate-400" : "text-slate-500"}>{c.path}:{c.line}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${isDark ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-500"}`}>
                        {c.severity}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>{c.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function ListChecks(props: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size ?? 24} height={props.size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}
