import { AIProvider } from "./types";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import { OllamaProvider } from "./ollama-provider";
import { MiniMaxProvider } from "./minimax-provider";
import { GeminiProvider } from "./gemini-provider";

export type ProviderName = "openai" | "anthropic" | "ollama" | "minimax" | "gemini";

// Lazy provider factory - only instantiates when requested
const providerFactories: Record<ProviderName, () => AIProvider> = {
  openai: () => new OpenAIProvider(),
  anthropic: () => new AnthropicProvider(),
  ollama: () => new OllamaProvider(),
  minimax: () => new MiniMaxProvider(),
  gemini: () => new GeminiProvider(),
};

// Cache for instantiated providers
const providerCache: Partial<Record<ProviderName, AIProvider>> = {};

export function getProvider(name: ProviderName): AIProvider {
  if (!providerCache[name]) {
    const factory = providerFactories[name];
    if (!factory) {
      throw new Error(`Unknown AI provider: ${name}. Available: ${Object.keys(providerFactories).join(", ")}`);
    }
    providerCache[name] = factory();
  }
  return providerCache[name]!;
}

export function getDefaultProvider(): AIProvider {
  return getProvider("openai");
}

export function getProviderNameForModel(model: string): ProviderName {
  if (model.startsWith("gpt-") || model.startsWith("text-embedding")) {
    return "openai";
  }
  if (model.startsWith("claude-")) {
    return "anthropic";
  }
  if (model.startsWith("gemini-")) {
    return "gemini";
  }
  if (model.startsWith("MiniMax-")) {
    return "minimax";
  }
  // Ollama models are typically local models
  return "ollama";
}

export { type AIProvider, type Message, type ChatOptions, type ChatResponse, type EmbeddingOptions, type EmbeddingResponse } from "./types";
