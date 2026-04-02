import { AIProvider, Message, ChatOptions, ChatResponse, EmbeddingOptions, EmbeddingResponse } from "./types";

export class OllamaProvider implements AIProvider {
  name = "ollama" as const;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    const model = options.model || "llama3";

    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || "",
      model,
    };
  }

  async *streamChat(
    messages: Message[],
    options: ChatOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || "llama3";

    const response = await fetch(`${this.baseURL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 4096,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            yield data.message.content;
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  async embed(texts: string[], options: EmbeddingOptions = {}): Promise<EmbeddingResponse[]> {
    const model = options.model || "nomic-embed-text";

    const results = await Promise.all(
      texts.map(async (text) => {
        const response = await fetch(`${this.baseURL}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, prompt: text }),
        });

        if (!response.ok) {
          throw new Error(`Ollama embedding error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          embedding: data.embedding,
          tokens: Math.ceil(text.length / 4),
          model,
        };
      })
    );

    return results;
  }
}
