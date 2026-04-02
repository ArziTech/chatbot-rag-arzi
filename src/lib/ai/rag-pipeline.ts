import { retrieve } from "./retriever";
import { getProvider, type ProviderName } from "./index";
import type { Message, RAGOptions, RAGResult, RetrievedChunk } from "./types";

// Types are defined in ./types.ts

const DEFAULT_MAX_CONTEXT_TOKENS = 6000;

/**
 * Build context string from retrieved chunks
 */
function buildContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const sections = chunks.map((c, i) => {
    return `[${i + 1}] ${c.documentName}\n${c.content}`;
  });

  return `## Relevant Context\n\n${sections.join("\n\n")}`;
}

/**
 * Build conversation history string
 */
function buildConversationHistory(
  messages: Array<{ role: string; content: string }>,
  maxMessages: number,
): string {
  if (maxMessages === 0) return "";

  const recent = messages.slice(-maxMessages);
  return recent
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");
}

/**
 * Full RAG pipeline: retrieve + generate
 */
export async function runRAGPipeline(
  query: string,
  userId: string,
  conversationHistory: Message[] = [],
  options: RAGOptions = {},
): Promise<RAGResult> {
  const topK = options.topK ?? 5;
  const maxHistory = options.includeConversaionHistory ?? 10;
  const maxContextTokens =
    options.maxContextTokens ?? DEFAULT_MAX_CONTEXT_TOKENS;

  // Step 1: Retrieve relevant chunks
  const chunks = await retrieve(query, userId, {
    topK,
    hybridAlpha: options.hybridAlpha,
  });

  // Step 2: Build context
  const retrievedContext = buildContext(chunks);
  const historyContext = buildConversationHistory(
    conversationHistory,
    maxHistory,
  );

  // Step 3: Build system prompt with context
  let systemPrompt = `You are a helpful AI assistant with access to the user's documents. `;

  if (retrievedContext) {
    systemPrompt += `Use the following context to answer the user's question. If the answer is not in the context, say so.\n\n${retrievedContext}`;
  }

  // Step 4: Build messages array
  const messages: Message[] = [];

  if (historyContext) {
    // Inject conversation history as a combined message
    messages.push({
      role: "system",
      content: `Previous conversation:\n${historyContext}`,
    });
  }

  messages.push({ role: "user", content: query });

  // Step 5: Generate response
  const provider = getProvider("openai");
  const response = await provider.chat(messages, {
    systemPrompt,
    maxTokens: 2048,
  });

  // Step 6: Return result with citations
  return {
    response: response.content,
    citations: chunks,
    usage: response.usage,
  };
}

/**
 * Streaming RAG pipeline
 */
export async function* streamRAGPipeline(
  query: string,
  userId: string,
  conversationHistory: Message[] = [],
  options: RAGOptions = {},
): AsyncGenerator<string, void, unknown> {
  const topK = options.topK ?? 5;
  const maxHistory = options.includeConversaionHistory ?? 10;
  const providerName = options.provider ?? "openai";
  const apiKey = options.apiKey;

  // Retrieve chunks
  const chunks = await retrieve(query, userId, {
    topK,
    hybridAlpha: options.hybridAlpha,
  });
  const retrievedContext = buildContext(chunks);
  const historyContext = buildConversationHistory(
    conversationHistory,
    maxHistory,
  );

  // Build messages
  const messages: Message[] = [];

  if (historyContext) {
    messages.push({
      role: "system",
      content: `Previous conversation:\n${historyContext}`,
    });
  }

  messages.push({ role: "user", content: query });

  let systemPrompt = `You are a helpful AI assistant with access to the user's documents. `;

  if (retrievedContext) {
    systemPrompt += `Use the following context to answer the user's question. If the answer is not in the context, say so.\n\n${retrievedContext}`;
  }

  // Stream response - use provider with optional per-user API key
  const provider = getProvider(providerName as ProviderName, apiKey);

  yield* provider.streamChat(messages, {
    systemPrompt,
    maxTokens: 2048,
  });
}
