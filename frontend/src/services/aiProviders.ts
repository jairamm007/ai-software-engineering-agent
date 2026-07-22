import api from "@/lib/axios";

export interface AIProvider {
  name: string;
  key: string;
  configured: boolean;
}

export interface AIProvidersResponse {
  count: number;
  providers: AIProvider[];
}

export const getAIProviders = async (): Promise<AIProvidersResponse> => {
  const response = await api.get<{ success: boolean; data: AIProvidersResponse }>("/ai-providers");
  return response.data.data;
};
