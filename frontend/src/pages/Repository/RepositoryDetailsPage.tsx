import {
  useEffect,
  useState,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Trash2, Settings, ExternalLink, FolderGit2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/context/ThemeContext";

import DashboardLayout from "@/layouts/DashboardLayout";
import RepositoryWorkspaceLayout from "@/layouts/RepositoryWorkspaceLayout";

import BackButton from "@/components/common/BackButton";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import FileExplorer from "@/components/repository/FileExplorer";
import FileViewer from "@/components/repository/FileViewer";
import AIActionPanel from "@/components/repository/AIActionPanel";
import AIHistory from "@/components/repository/AIHistory";
import AIResult from "@/components/repository/AIResult";
import RepositoryAnalytics from "@/components/repository/RepositoryAnalytics";
import RepositoryOverview from "@/components/repository/RepositoryOverview";
import CommandPalette, { type CommandAction } from "@/components/assistant/CommandPalette";

import { askRepository } from "@/services/chat";
import { deleteRepository, getRepository } from "@/services/repository";

import type { RepositoryFile } from "@/types/repository";
import type { AIHistoryItem } from "@/types/ai";
import type { AIMessage } from "@/types/ai-conversation";

export default function RepositoryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedFile, setSelectedFile] =
    useState<RepositoryFile | null>(null);
  const [conversation, setConversation] = useState<AIMessage[]>([]);
  const [aiResult, setAiResult] = useState("");
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [selectedHistoryItemId, setSelectedHistoryItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>({});
  const [, setPullRequest] = useState<string | null>(null);
  const [, setTests] = useState<string | null>(null);
  const [, setSecurityReport] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState("");
  const [openCommandPalette, setOpenCommandPalette] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["repository", id],
    queryFn: () => getRepository(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (!data || data.files.length === 0) return;

    const selectedFilePath = (location.state as { selectedFilePath?: string } | null)
      ?.selectedFilePath;
    const requestedFile = data.files.find(
      (file) => file.path.replaceAll("\\", "/") === selectedFilePath?.replaceAll("\\", "/")
    );

    if (requestedFile) {
      setSelectedFile(requestedFile);
    } else if (!selectedFile) {
      setSelectedFile(data.files[0]);
    }
  }, [data, location.state, selectedFile]);

  useEffect(() => {
    if (!id) return;
    const saved = localStorage.getItem(`workspace:${id}`);
    if (!saved) return;
    const state = JSON.parse(saved) as { selectedFileId?: string; conversation?: AIMessage[] };
    const file = data?.files.find((item) => item.id === state.selectedFileId);
    if (file) setSelectedFile(file);
    if (state.conversation?.length) setConversation(state.conversation);
  }, [data?.files, id]);

  useEffect(() => {
    if (!id) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(`workspace:${id}`, JSON.stringify({ selectedFileId: selectedFile?.id, conversation }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [conversation, id, selectedFile?.id]);

  const formatAnswer = (answer: unknown) =>
    typeof answer === "string"
      ? answer
      : JSON.stringify(answer, null, 2);

  const addMessage = (role: AIMessage["role"], content: string) => {
    setConversation((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const addAiResult = (title: string, content: string) => {
    const item: AIHistoryItem = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date(),
    };

    setAiResult(content);
    setSelectedHistoryItemId(item.id);
    setHistory((previous) => [item, ...previous]);
  };

  const runAiAction = async (
    question: string,
    cacheKey: string,
    failureMessage: string,
    title: string
  ) => {
    if (!selectedFile || !data) return;

    addMessage("user", question);

    if (cache[cacheKey]) {
      addMessage("assistant", cache[cacheKey]);
      addAiResult(title, cache[cacheKey]);

      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await askRepository({
        question,
        repositoryId: data.id,
        filePath: selectedFile.path,
        signal: controller.signal,
      });
      const answer = formatAnswer(response.answer);

      addMessage("assistant", answer);
      addAiResult(title, answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      if (controller.signal.aborted) return;
      addMessage("assistant", failureMessage);
      addAiResult(title, failureMessage);
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const explainFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Explain this file: ${selectedFile.path}`,
      `${selectedFile.path}-explain`,
      "Failed to generate explanation.",
      "Explain File"
    );
  };

  const reviewFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Review this file for bugs, security and best practices: ${selectedFile.path}`,
      `${selectedFile.path}-review`,
      "Review failed.",
      "Code Review"
    );
  };

  const suggestFix = async () => {
    if (!selectedFile) return;

    await runAiAction(
      "Suggest improvements for this file.",
      `${selectedFile.path}-fix`,
      "Failed to suggest a fix.",
      "Suggest Fix"
    );
  };

  const generateCommit = async () => {
    if (!data) return;

    const question = "Generate a professional git commit message.";
    const cacheKey = `${data.id}-commit`;

    addMessage("user", question);

    if (cache[cacheKey]) {
      addMessage("assistant", cache[cacheKey]);
      addAiResult("Generate Commit", cache[cacheKey]);

      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await askRepository({
        question,
        repositoryId: data.id,
        signal: controller.signal,
      });
      const answer = formatAnswer(response.answer);

      addMessage("assistant", answer);
      addAiResult("Generate Commit", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      if (controller.signal.aborted) return;
      const failureMessage = "Failed to generate a commit message.";
      addMessage("assistant", failureMessage);
      addAiResult("Generate Commit", failureMessage);
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const generatePullRequest = async () => {
    if (!data) return;

    const question = "Generate a professional GitHub pull request.";
    const cacheKey = `${data.id}-pull-request`;

    addMessage("user", question);

    if (cache[cacheKey]) {
      setPullRequest(cache[cacheKey]);
      addMessage("assistant", cache[cacheKey]);
      addAiResult("Pull Request", cache[cacheKey]);

      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await askRepository({
        question,
        repositoryId: data.id,
        signal: controller.signal,
      });
      const answer = formatAnswer(response.answer);

      setPullRequest(answer);
      addMessage("assistant", answer);
      addAiResult("Pull Request", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      if (controller.signal.aborted) return;
      const failureMessage = "Failed to generate a pull request.";

      setPullRequest(failureMessage);
      addMessage("assistant", failureMessage);
      addAiResult("Pull Request", failureMessage);
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const generateTests = async () => {
    if (!selectedFile) return;

    const question = "Generate production-ready unit tests for this file.";
    const cacheKey = `${selectedFile.path}-tests`;

    addMessage("user", question);

    if (cache[cacheKey]) {
      setTests(cache[cacheKey]);
      addMessage("assistant", cache[cacheKey]);
      addAiResult("Generate Tests", cache[cacheKey]);

      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await askRepository({
        question,
        repositoryId: data?.id,
        filePath: selectedFile.path,
        signal: controller.signal,
      });
      const answer = formatAnswer(response.answer);

      setTests(answer);
      addMessage("assistant", answer);
      addAiResult("Generate Tests", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      if (controller.signal.aborted) return;
      const failureMessage = "Failed to generate tests.";

      setTests(failureMessage);
      addMessage("assistant", failureMessage);
      addAiResult("Generate Tests", failureMessage);
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const securityScan = async () => {
    if (!selectedFile) return;

    const question = "Perform a security audit of this file and identify potential vulnerabilities.";
    const cacheKey = `${selectedFile.path}-security`;

    addMessage("user", question);

    if (cache[cacheKey]) {
      setSecurityReport(cache[cacheKey]);
      addMessage("assistant", cache[cacheKey]);
      addAiResult("Security Scan", cache[cacheKey]);

      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await askRepository({
        question,
        repositoryId: data?.id,
        filePath: selectedFile.path,
        signal: controller.signal,
      });
      const answer = formatAnswer(response.answer);

      setSecurityReport(answer);
      addMessage("assistant", answer);
      addAiResult("Security Scan", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      if (controller.signal.aborted) return;
      const failureMessage = "Failed to complete the security scan.";

      setSecurityReport(failureMessage);
      addMessage("assistant", failureMessage);
      addAiResult("Security Scan", failureMessage);
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  const architectureFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Explain the architecture of this file: ${selectedFile.path}`,
      `${selectedFile.path}-architecture`,
      "Architecture analysis failed.",
      "Architecture"
    );
  };

  const docsFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Generate documentation for this file: ${selectedFile.path}`,
      `${selectedFile.path}-docs`,
      "Documentation generation failed.",
      "Documentation"
    );
  };

  const runSelectionAction = async (action: string) => {
    if (!selectedCode || !selectedFile) return;
    await runAiAction(`${action} only this selected code from ${selectedFile.path}:\n\n${selectedCode}`, `${selectedFile.path}-${action}-${selectedCode}`, `Failed to ${action.toLowerCase()} the selection.`, action === "Review" ? "Code Review" : action === "Explain" ? "Explain File" : `${action} Selection`);
  };

  const runCommand = (action: CommandAction) => {
    const actions: Record<CommandAction, () => Promise<void>> = {
      explain: explainFile,
      review: reviewFile,
      fix: suggestFix,
      security: securityScan,
      tests: generateTests,
      commit: generateCommit,
      pr: generatePullRequest,
      docs: docsFile,
    };

    void actions[action]();
  };

  const actionsRef = useRef({ runSelectionAction, reviewFile, generateTests, securityScan });
  actionsRef.current = { runSelectionAction, reviewFile, generateTests, securityScan };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenCommandPalette(true);
      }
      if (event.key === "Escape") setOpenCommandPalette(false);
      if (!event.ctrlKey) return;
      const { runSelectionAction: run, reviewFile: review, generateTests: tests, securityScan: scan } = actionsRef.current;
      if (event.key === "/") { event.preventDefault(); void run("Explain"); }
      if (event.shiftKey && event.key.toLowerCase() === "r") { event.preventDefault(); void review(); }
      if (event.shiftKey && event.key.toLowerCase() === "t") { event.preventDefault(); void tests(); }
      if (event.shiftKey && event.key.toLowerCase() === "s") { event.preventDefault(); void scan(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleDeleteRepository = async () => {
    if (!id) return;

    const confirmed = window.confirm(
      "Delete this repository?\n\nThis cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteRepository(id);

      navigate("/repositories");
    } catch {
      alert("Failed to delete repository.");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <LoadingIndicator size="md" label="Loading repository" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-red-600">
            Repository not found.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <BackButton />

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className={`text-2xl font-bold sm:text-3xl lg:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
              {data.name}
            </h1>

            <a
              href={data.githubUrl}
              target="_blank"
              rel="noreferrer"
              title={`Open ${data.githubUrl} on GitHub`}
              className={`mt-2 flex min-w-0 items-center gap-1.5 truncate text-sm transition-colors hover:text-[var(--accent)] sm:text-base ${
                isDark ? "text-slate-400 hover:text-[var(--accent)]" : "text-slate-500 hover:text-[var(--accent)]"
              }`}
            >
              <span className="truncate">{data.githubUrl}</span>
              <ExternalLink size={14} className="shrink-0" />
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={data.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="Open repository on GitHub"
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)] ${
                isDark ? "border-white/20 text-white" : "border-slate-300 text-slate-700"
              }`}
            >
              <FolderGit2 size={18} />
              <span className="hidden sm:inline">Open in GitHub</span>
              <ExternalLink size={14} />
            </a>
            <button
              type="button"
              onClick={() => navigate(`/repositories/${id}/settings`)}
              title="Repository Settings"
              className={`rounded-xl border p-3 transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)] ${
                isDark ? "border-white/20" : "border-slate-300"
              }`}
            >
              <Settings size={20} />
            </button>

            <button
              type="button"
              onClick={handleDeleteRepository}
              title="Delete Repository"
              className={`rounded-xl border p-3 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 ${
                isDark ? "border-white/20" : "border-slate-300"
              }`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <RepositoryTabs
          repositoryId={data.id}
        />

        <RepositoryWorkspaceLayout
          sidebar={
            <FileExplorer
              files={data.files}
              selectedFileId={selectedFile?.id}
              onSelect={setSelectedFile}
            />
          }
          content={
            <>
              <AIActionPanel
                loading={loading}
                onExplain={explainFile}
                onReview={reviewFile}
                onFix={suggestFix}
                onGenerateCommit={generateCommit}
                onGeneratePullRequest={generatePullRequest}
                onGenerateTests={generateTests}
                onSecurityScan={securityScan}
                onArchitecture={architectureFile}
                onDocs={docsFile}
              />
              <AIResult
                title="AI Output"
                content={aiResult}
                loading={loading}
              />
              <AIHistory
                items={history}
                selectedItemId={selectedHistoryItemId}
                onSelect={(item) => {
                  setAiResult(item.content);
                  setSelectedHistoryItemId(item.id);
                }}
                onClear={() => {
                  setHistory([]);
                  setSelectedHistoryItemId(null);
                }}
              />
              <RepositoryOverview repository={data} />
              <RepositoryAnalytics repositoryId={data.id} />
              <div className="relative">
                {selectedCode && <div className={`absolute right-3 top-3 z-10 flex gap-1 rounded-lg border p-1 shadow-lg ${isDark ? "border-white/20 bg-slate-800" : "border-slate-200 bg-white"}`}>{["Explain", "Review", "Fix", "Tests", "Security"].map((action) => <button key={action} onClick={() => void runSelectionAction(action)} className={`rounded px-2 py-1 text-xs ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>{action}</button>)}</div>}
                <FileViewer
                  filePath={selectedFile?.path}
                  content={selectedFile?.chunks
                    .map((chunk) => chunk.content)
                    .join("\n\n")}
                  onSelectionChange={setSelectedCode}
                />
              </div>
            </>
          }
        />
        {openCommandPalette && (
          <CommandPalette
            onClose={() => setOpenCommandPalette(false)}
            onSelect={runCommand}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
