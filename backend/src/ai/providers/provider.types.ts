export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

export interface LLMProvider {
  generateText(prompt: string): Promise<string>;
  readonly name: string;
}