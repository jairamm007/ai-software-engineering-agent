import api from "@/lib/axios";

interface AskRepositoryInput {
  question: string;
  repositoryId?: string;
  filePath?: string;
}

export const askRepository = async ({
  question,
  repositoryId,
  filePath,
}: AskRepositoryInput) => {
  const response = await api.post("/chat", {
    question,
    repositoryId,
    filePath,
  });

  return response.data.data;
};
