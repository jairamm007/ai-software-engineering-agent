export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

export interface LLMProvider {
  generateText(systemPrompt: string, userPrompt: string): Promise<string>;
  generateTextStream?(systemPrompt: string, userPrompt: string): AsyncGenerator<string>;
  readonly name: string;
}
