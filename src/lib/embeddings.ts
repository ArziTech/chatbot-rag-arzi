// Note: This depends on Task 5 AI provider abstraction.
// Until then, we create a placeholder that can be replaced.
// For MVP, directly use OpenAI embeddings API.

import OpenAI from "openai";

export const EMBEDDING_MODEL = "text-embedding-ada-002";
export const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

/**
 * Get OpenAI client instance (lazy initialization)
 */
function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate embedding for a single text chunk
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  return {
    embedding: response.data[0].embedding,
    tokens: response.usage?.total_tokens ?? 0,
  };
}

/**
 * Generate embeddings for multiple chunks (batch)
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<EmbeddingResult[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });

  return texts.map((text, i) => ({
    embedding: response.data[i].embedding,
    tokens: Math.ceil(text.length / 4), // rough estimate
  }));
}

/**
 * Convert embedding array to Prisma-compatible format
 * Prisma uses Unsupported("vector(N)") for pgvector
 */
export function toPrismaVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
