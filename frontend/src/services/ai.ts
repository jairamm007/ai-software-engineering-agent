import api from "@/lib/axios";

const requestAgent = async (
  question: string
) => {
  const response = await api.post("/agent", {
    question,
  });

  return response.data.data;
};

export const explainFile = async (
  filePath: string
) => {
  return requestAgent(
    `Explain this file: ${filePath}`
  );
};

export const reviewFile = async (
  filePath: string
) => {
  return requestAgent(
    `Perform a code review for this file: ${filePath}`
  );
};

export const architectureFile = async (
  filePath: string
) => {
  return requestAgent(
    `Describe the architecture implications of this file: ${filePath}`
  );
};

export const documentationFile =
  async (filePath: string) => {
    return requestAgent(
      `Generate documentation for this file: ${filePath}`
    );
  };