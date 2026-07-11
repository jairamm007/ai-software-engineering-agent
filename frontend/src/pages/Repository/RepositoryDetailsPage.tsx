import {
  useEffect,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "@/layouts/DashboardLayout";
import RepositoryWorkspaceLayout from "@/layouts/RepositoryWorkspaceLayout";

import AIActionPanel from "@/components/repository/AIActionPanel";
import ConversationHistory from "@/components/repository/ConversationHistory";
import RepositoryTabs from "@/components/repository/RepositoryTabs";
import FileExplorer from "@/components/repository/FileExplorer";
import FileViewer from "@/components/repository/FileViewer";
import RepositoryOverview from "@/components/repository/RepositoryOverview";

import { askRepository } from "@/services/chat";
import { deleteRepository, getRepository } from "@/services/repository";

import type { RepositoryFile } from "@/types/repository";
import type { AIMessage } from "@/types/ai-conversation";

export default function RepositoryDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] =
    useState<RepositoryFile | null>(null);
  const [conversation, setConversation] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>({});

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
    if (data && data.files.length > 0 && !selectedFile) {
      setSelectedFile(data.files[0]);
    }
  }, [data, selectedFile]);

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

  const runAiAction = async (
    question: string,
    cacheKey: string,
    failureMessage: string
  ) => {
    if (!selectedFile || !data) return;

    addMessage("user", question);

    if (cache[cacheKey]) {
      addMessage("assistant", cache[cacheKey]);

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
      setCache((prev) => ({ ...prev, [cacheKey]: answer }));
    } catch {
      addMessage("assistant", failureMessage);
    } finally {
      setLoading(false);
    }
  };

  const explainFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Explain this file: ${selectedFile.path}`,
      `${selectedFile.path}-explain`,
      "Failed to generate explanation."
    );
  };

  const reviewFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Review this file for bugs, security and best practices: ${selectedFile.path}`,
      `${selectedFile.path}-review`,
      "Review failed."
    );
  };

  const suggestFix = async () => {
    if (!selectedFile) return;

    await runAiAction(
      "Suggest improvements for this file.",
      `${selectedFile.path}-fix`,
      "Failed to suggest a fix."
    );
  };

  const architectureFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Explain the architecture of this file: ${selectedFile.path}`,
      `${selectedFile.path}-architecture`,
      "Architecture analysis failed."
    );
  };

  const docsFile = async () => {
    if (!selectedFile) return;

    await runAiAction(
      `Generate documentation for this file: ${selectedFile.path}`,
      `${selectedFile.path}-docs`,
      "Documentation generation failed."
    );
  };

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
          <p className="text-lg font-medium">
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
      <div className="space-y-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              {data.name}
            </h1>

            <p className="mt-2 break-all text-slate-500">
              {data.githubUrl}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDeleteRepository}
            title="Delete Repository"
            className="rounded-xl border border-slate-300 p-3 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600"
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
                onArchitecture={architectureFile}
                onDocs={docsFile}
              />

              <ConversationHistory messages={conversation} />

            <RepositoryOverview
              repository={data}
            />

            <FileViewer
              filePath={selectedFile?.path}
              content={selectedFile?.chunks
                .map((chunk) => chunk.content)
                .join("\n\n")}
            />
            </>
          }
        />
      </div>
    </DashboardLayout>
  );
}
