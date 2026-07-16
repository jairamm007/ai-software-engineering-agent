import {
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { useTheme } from "@/context/ThemeContext";

import DashboardLayout from "@/layouts/DashboardLayout";
import RepositoryWorkspaceLayout from "@/layouts/RepositoryWorkspaceLayout";

import BackButton from "@/components/common/BackButton";
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
    localStorage.setItem(`workspace:${id}`, JSON.stringify({ selectedFileId: selectedFile?.id, conversation }));
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

    try {
      const response = await askRepository({
        question,
        repositoryId: data.id,
        filePath: selectedFile.path,
      });
      const answer = formatAnswer(response.answer);

      addMessage("assistant", answer);
      addAiResult(title, answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      addMessage("assistant", failureMessage);
      addAiResult(title, failureMessage);
    } finally {
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

    try {
      const response = await askRepository({
        question,
        repositoryId: data.id,
      });
      const answer = formatAnswer(response.answer);

      addMessage("assistant", answer);
      addAiResult("Generate Commit", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      const failureMessage = "Failed to generate a commit message.";
      addMessage("assistant", failureMessage);
      addAiResult("Generate Commit", failureMessage);
    } finally {
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

    try {
      const response = await askRepository({
        question,
        repositoryId: data.id,
      });
      const answer = formatAnswer(response.answer);

      setPullRequest(answer);
      addMessage("assistant", answer);
      addAiResult("Pull Request", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      const failureMessage = "Failed to generate a pull request.";

      setPullRequest(failureMessage);
      addMessage("assistant", failureMessage);
      addAiResult("Pull Request", failureMessage);
    } finally {
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

    try {
      const response = await askRepository({
        question,
        repositoryId: data?.id,
        filePath: selectedFile.path,
      });
      const answer = formatAnswer(response.answer);

      setTests(answer);
      addMessage("assistant", answer);
      addAiResult("Generate Tests", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      const failureMessage = "Failed to generate tests.";

      setTests(failureMessage);
      addMessage("assistant", failureMessage);
      addAiResult("Generate Tests", failureMessage);
    } finally {
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

    try {
      const response = await askRepository({
        question,
        repositoryId: data?.id,
        filePath: selectedFile.path,
      });
      const answer = formatAnswer(response.answer);

      setSecurityReport(answer);
      addMessage("assistant", answer);
      addAiResult("Security Scan", answer);
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      const failureMessage = "Failed to complete the security scan.";

      setSecurityReport(failureMessage);
      addMessage("assistant", failureMessage);
      addAiResult("Security Scan", failureMessage);
    } finally {
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenCommandPalette(true);
      }
      if (event.key === "Escape") setOpenCommandPalette(false);
      if (!event.ctrlKey) return;
      if (event.key === "/") { event.preventDefault(); void runSelectionAction("Explain"); }
      if (event.shiftKey && event.key.toLowerCase() === "r") { event.preventDefault(); void reviewFile(); }
      if (event.shiftKey && event.key.toLowerCase() === "t") { event.preventDefault(); void generateTests(); }
      if (event.shiftKey && event.key.toLowerCase() === "s") { event.preventDefault(); void securityScan(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

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
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Loading repository...
          </p>
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

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {data.name}
            </h1>

            <p className={`mt-2 break-all ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {data.githubUrl}
            </p>
          </div>

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
