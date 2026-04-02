import OpenAI from "openai";
import { AIProvider, Message, ChatOptions, ChatResponse, EmbeddingOptions, EmbeddingResponse } from "./types";

export class OpenAIProvider implements AIProvider {
  name = "openai" as const;
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async chat(messages: Message[], options: ChatOptions = {}): Promise<ChatResponse> {
    const model = options.model || "gpt-4o";
    const systemMessage = options.systemPrompt
      ? [{ role: "system" as const, content: options.systemPrompt }]
      : [];

    const response = await this.client.chat.completions.create({
      model,
      messages: [...systemMessage, ...messages] as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    });

    const usage = response.usage;
    return {
      content: response.choices[0]?.message?.content || "",
      usage: usage
        ? {
            promptTokens: usage.prompt_tokens || 0,
            completionTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
          }
        : undefined,
      model,
    };
  }

  async *streamChat(
    messages: Message[],
    options: ChatOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    const model = options.model || "gpt-4o";
    const systemMessage = options.systemPrompt
      ? [{ role: "system" as const, content: options.systemPrompt }]
      : [];

    const stream = await this.client.chat.completions.create({
      model,
      messages: [...systemMessage, ...messages] as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }

  async embed(texts: string[], options: EmbeddingOptions = {}): Promise<EmbeddingResponse[]> {
    const model = options.model || "text-embedding-ada-002";

    const response = await this.client.embeddings.create({
      model,
      input: texts,
    });

    return texts.map((text, i) => ({
      embedding: response.data[i].embedding,
      tokens: Math.ceil(text.length / 4),
      model,
    }));
  }
}
