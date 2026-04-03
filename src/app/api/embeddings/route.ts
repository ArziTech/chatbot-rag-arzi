import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { processSchema } from "@/lib/validations/document";
import { processDocument } from "@/lib/document-processor";
import { generateEmbeddings, toPrismaVector } from "@/lib/embeddings";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = processSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
    }

    const { documentId, chunkSize, chunkOverlap } = validated.data;

    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (document.status === "ready") {
      return NextResponse.json(
        { error: "Document already processed" },
        { status: 400 },
      );
    }

    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "processing" },
    });

    try {
      // Download file from R2
      const downloadUrl = await getPresignedDownloadUrl(document.r2Key);
      const response = await fetch(downloadUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      // Extract text and chunk
      const chunks = await processDocument(buffer, document.type, {
        chunkSize,
        chunkOverlap,
      });

      // Generate embeddings
      const texts = chunks.map((c) => c.content);
      const embeddings = await generateEmbeddings(texts);

      // Store embeddings in DB using raw query
      // Note: Prisma doesn't generate CRUD for Unsupported("vector") types,
      // so we use $executeRaw with proper pgvector syntax
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embeddingVector = toPrismaVector(embeddings[i].embedding);
        const metadataJson = JSON.stringify(chunk.metadata);

        await prisma.$executeRaw`
          INSERT INTO "Embedding" ("id", "documentId", "content", "chunkIndex", "metadata", "embedding", "createdAt")
          VALUES (
            gen_random_uuid()::text,
            ${documentId}::text,
            ${chunk.content}::text,
            ${chunk.chunkIndex}::integer,
            ${metadataJson}::jsonb,
            ${embeddingVector}::vector,
            NOW()
          )
        `;
      }

      // Update document status
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "ready" },
      });

      return NextResponse.json({
        message: "Document processed successfully",
        chunksCreated: chunks.length,
      });
    } catch (processingError) {
      // Mark as failed
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "failed" },
      });
      throw processingError;
    }
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
