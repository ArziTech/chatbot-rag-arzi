import { prisma } from "@/lib/prisma";
import { getProvider } from "./index";
import type { RetrievedChunk, RetrievalOptions } from "./types";

// Types are defined in ./types.ts

const DEFAULT_TOP_K = 5;
const DEFAULT_MIN_SCORE = 0.5;
const DEFAULT_HYBRID_ALPHA = 0.5;

/**
 * Perform vector similarity search using pgvector
 */
async function vectorSearch(
  queryEmbedding: number[],
  userId: string,
  topK: number,
): Promise<RetrievedChunk[]> {
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      documentId: string;
      name: string;
      content: string;
      score: number;
    }>
  >`
    SELECT
      e.id,
      e."documentId",
      d.name,
      e.content,
      1 - (e.embedding <=> ${vectorStr}::vector) AS score
    FROM "Embedding" e
    JOIN "Document" d ON e."documentId" = d.id
    WHERE d."userId" = ${userId}
      AND d.status = 'ready'
    ORDER BY e.embedding <=> ${vectorStr}::vector
    LIMIT ${topK}
  `;

  return results.map((r, i) => ({
    embeddingId: r.id,
    documentId: r.documentId,
    documentName: r.name,
    content: r.content,
    score: Number(r.score),
    rank: i + 1,
  }));
}

/**
 * Perform BM25 keyword search
 */
async function keywordSearch(
  query: string,
  userId: string,
  topK: number,
): Promise<RetrievedChunk[]> {
  // Get all ready documents for user
  const documents = await prisma.document.findMany({
    where: { userId, status: "ready" },
    select: { id: true },
  });

  const documentIds = documents.map((d) => d.id);

  if (documentIds.length === 0) return [];

  // Get embeddings for these documents
  const embeddings = await prisma.embedding.findMany({
    where: { documentId: { in: documentIds } },
    include: { document: { select: { name: true } } },
  });

  if (embeddings.length === 0) return [];

  // Simple keyword search - count query terms in content
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = embeddings.map((e) => {
    const content = e.content.toLowerCase();
    let matchCount = 0;
    for (const term of queryTerms) {
      matchCount += (content.match(new RegExp(term, "g")) || []).length;
    }
    return {
      embeddingId: e.id,
      documentId: e.documentId,
      documentName: e.document.name,
      content: e.content,
      score: matchCount / Math.max(1, content.split(/\s+/).length), // Normalized
      rank: 0,
    };
  });

  // Sort by score descending and limit
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((r, i) => ({ ...r, rank: i + 1 }));
}

/**
 * Reciprocal Rank Fusion - combine vector and keyword results
 */
function reciprocalRankFusion(
  vectorResults: RetrievedChunk[],
  keywordResults: RetrievedChunk[],
  alpha: number = 0.5,
): RetrievedChunk[] {
  const k = 60; // RRF constant
  const scoreMap = new Map<string, RetrievedChunk>();

  // Add vector results with vector weight
  vectorResults.forEach((r, i) => {
    const rrfScore = alpha * (1 / (k + i + 1));
    r.score = rrfScore;
    scoreMap.set(r.embeddingId, r);
  });

  // Add keyword results with keyword weight
  keywordResults.forEach((r, i) => {
    const existing = scoreMap.get(r.embeddingId);
    if (existing) {
      existing.score += (1 - alpha) * (1 / (k + i + 1));
    } else {
      r.score = (1 - alpha) * (1 / (k + i + 1));
      scoreMap.set(r.embeddingId, r);
    }
  });

  // Sort by combined score
  return Array.from(scoreMap.values()).sort((a, b) => b.score - a.score);
}

/**
 * Main retrieval function - hybrid vector + keyword search
 */
export async function retrieve(
  query: string,
  userId: string,
  options: RetrievalOptions = {},
): Promise<RetrievedChunk[]> {
  const topK = options.topK ?? DEFAULT_TOP_K;
  const hybridAlpha = options.hybridAlpha ?? DEFAULT_HYBRID_ALPHA;

  // Get query embedding
  const provider = getProvider("openai");
  const embeddingResults = await provider.embed([query], {
    model: "text-embedding-ada-002",
  });
  const queryEmbedding = embeddingResults[0].embedding;

  // Run vector and keyword searches in parallel
  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch(queryEmbedding, userId, topK * 2),
    keywordSearch(query, userId, topK * 2),
  ]);

  // If one is empty, return the other
  if (vectorResults.length === 0) return keywordResults.slice(0, topK);
  if (keywordResults.length === 0) return vectorResults.slice(0, topK);

  // RRF fusion
  const fused = reciprocalRankFusion(
    vectorResults,
    keywordResults,
    hybridAlpha,
  );

  // Filter by min score and limit
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  return fused.filter((r) => r.score >= minScore).slice(0, topK);
}
