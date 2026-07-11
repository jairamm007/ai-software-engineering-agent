import api from "@/lib/axios";

export const askRepository = async (
  question: string
) => {
  const response = await api.post("/chat", {
    question,
  });

  return response.data.data;
};