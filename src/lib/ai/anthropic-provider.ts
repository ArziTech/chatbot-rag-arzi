import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, Message, ChatOptions, ChatResponse, EmbeddingOptions, EmbeddingResponse } from "./types";

export class AnthropicProvider implements AIProvider {
  name = "anthropic" as const;
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    const model = options.model || "claude-3-5-sonnet-20241022";
    const systemMessage = options.systemPrompt || "";

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

    return {
      content: response.content[0].type === "text" ? response.content[0].text : "",
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
    const model = options.model || "claude-3-5-sonnet-20241022";
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
    }
  }

  async embed(_texts: string[], _options?: EmbeddingOptions): Promise<EmbeddingResponse[]> {
    // Anthropic doesn't have an embeddings API (yet)
    // For RAG, use OpenAI embeddings even with Anthropic chat
    throw new Error("Anthropic does not support embeddings. Use OpenAI provider for embeddings.");
  }
}
