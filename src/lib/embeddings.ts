import { getProvider, type EmbeddingResponse } from "./ai";

export const EMBEDDING_MODEL = "text-embedding-ada-002";
export const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

/**
 * Generate embedding for a single text chunk.
 * Uses OpenAI by default (most reliable for embeddings).
 * Gemini supports embeddings too but OpenAI is used for consistency.
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  const provider = getProvider("openai");
  const results = await provider.embed([text], { model: EMBEDDING_MODEL });
  return {
    embedding: results[0].embedding,
    tokens: results[0].tokens,
  };
}

/**
 * Generate embeddings for multiple chunks (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const provider = getProvider("openai");
  const results = await provider.embed(texts, { model: EMBEDDING_MODEL });
  return results.map((r: EmbeddingResponse) => ({
    embedding: r.embedding,
    tokens: r.tokens,
  }));
}

/**
 * Convert embedding array to Prisma-compatible format
 * Prisma uses Unsupported("vector(N)") for pgvector
 */
export function toPrismaVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
