export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface EmbeddingOptions {
  model?: string; // e.g., "text-embedding-ada-002", "embed-english-v3.0", "gemini-embedding-001"
}

export interface EmbeddingResponse {
  embedding: number[];
  tokens: number;
  model: string;
}

// Provider interface - all AI providers must implement this
export interface AIProvider {
  name: string;

  // Chat completion
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;

  // Streaming chat
  streamChat(
    messages: Message[],
    options?: ChatOptions
  ): AsyncGenerator<string, void, unknown>;

  // Text embeddings (throw if unsupported)
  embed(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResponse[]>;
}
