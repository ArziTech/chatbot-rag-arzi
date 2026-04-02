import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, Message, ChatOptions, ChatResponse, EmbeddingOptions, EmbeddingResponse } from "./types";

export class MiniMaxProvider implements AIProvider {
  name = "minimax" as const;
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.MINIMAX_API_KEY,
      baseURL: "https://api.minimax.io/v1",
    });
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    const model = options.model || "MiniMax-M2.7";
    const systemMessage = options.systemPrompt || "";

    // Convert messages to Anthropic-compatible format
    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await this.client.messages.create({
      model,
      system: systemMessage,
      messages: anthropicMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    });

    // Collect text content from response (may include thinking blocks)
    let content = "";
    for (const block of response.content) {
      if (block.type === "text") {
        content += block.text;
      }
      // Skip thinking blocks - they are metadata, not visible output
    }

    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model,
    };
  }

  async *streamChat(
    messages: Message[],
    options: ChatOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || "MiniMax-M2.7";
    const systemMessage = options.systemPrompt || "";

    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const stream = await this.client.messages.stream({
      model,
      system: systemMessage,
      messages: anthropicMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        yield chunk.delta.text;
      }
      // MiniMax may also stream "thinking" blocks - skip them in output
    }
  }

  async embed(_texts: string[], _options?: EmbeddingOptions): Promise<EmbeddingResponse[]> {
    // MiniMax does not have a public embeddings API
    throw new Error("MiniMax does not support embeddings. Use OpenAI provider for embeddings.");
  }
}
