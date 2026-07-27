import api from "@/lib/axios";

const requestAgent = async (
  question: string,
  signal?: AbortSignal
) => {
  const response = await api.post("/agent", {
    question,
  }, { signal });

  return response.data.data;
};

export const explainFile = async (
  filePath: string,
  signal?: AbortSignal
) => {
  return requestAgent(
    `Explain this file: ${filePath}`,
    signal
  );
};

export const reviewFile = async (
  filePath: string,
  signal?: AbortSignal
) => {
  return requestAgent(
    `Perform a code review for this file: ${filePath}`,
    signal
  );
};

export const architectureFile = async (
  filePath: string,
  signal?: AbortSignal
) => {
  return requestAgent(
    `Describe the architecture implications of this file: ${filePath}`,
    signal
  );
};

export const documentationFile =
  async (filePath: string, signal?: AbortSignal) => {
    return requestAgent(
      `Generate documentation for this file: ${filePath}`,
      signal
    );
  };