import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AIProvider,
  Message,
  ChatOptions,
  ChatResponse,
  EmbeddingOptions,
  EmbeddingResponse,
} from "./types";

export class GeminiProvider implements AIProvider {
  name = "gemini" as const;
  private client: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    this.client = new GoogleGenerativeAI(
      apiKey || process.env.GEMINI_API_KEY || "",
    );
  }

  async chat(
    messages: Message[],
    options: ChatOptions = {},
  ): Promise<ChatResponse> {
    const modelName = options.model || "gemini-2.0-flash";
    const model = this.client.getGenerativeModel({ model: modelName });

    // Convert messages to Gemini format: interleave user/model, prepend system as first user message
    const contents: string[] = [];
    let systemPrompt = options.systemPrompt || "";

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        contents.push(
          `${msg.role === "user" ? "user" : "model"}: ${msg.content}`,
        );
      }
    }

    const prompt = systemPrompt
      ? `${systemPrompt}\n\n${contents.join("\n")}`
      : contents.join("\n");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      content: text || "",
      model: modelName,
    };
  }

  async *streamChat(
    messages: Message[],
    options: ChatOptions = {},
  ): AsyncGenerator<string, void, unknown> {
    const modelName = options.model || "gemini-2.0-flash";
    const model = this.client.getGenerativeModel({ model: modelName });

    const contents: string[] = [];
    let systemPrompt = options.systemPrompt || "";

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        contents.push(
          `${msg.role === "user" ? "user" : "model"}: ${msg.content}`,
        );
      }
    }

    const prompt = systemPrompt
      ? `${systemPrompt}\n\n${contents.join("\n")}`
      : contents.join("\n");

    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  async embed(
    texts: string[],
    options: EmbeddingOptions = {},
  ): Promise<EmbeddingResponse[]> {
    const modelName = options.model || "gemini-embedding-001";
    const model = this.client.getGenerativeModel({ model: modelName });

    const results = await Promise.all(
      texts.map(async (text) => {
        const result = await model.embedContent(text);
        return {
          embedding: result.embedding.values,
          tokens: Math.ceil(text.length / 4),
          model: modelName,
        };
      }),
    );

    return results;
  }
}
