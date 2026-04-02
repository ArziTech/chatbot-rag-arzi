import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  deleteR2Object,
} from "@/lib/r2";
import {
  uploadSchema,
  validateFileType,
  getFileExtension,
} from "@/lib/validations/document";

// POST - Get presigned URL for upload
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = uploadSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validated.error.issues },
        { status: 400 },
      );
    }

    const { fileName, fileType, fileSize } = validated.data;

    // Validate file type
    if (!validateFileType(fileType)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    // Generate R2 key
    const ext = getFileExtension(fileName);
    const r2Key = `documents/${session.user.id}/${crypto.randomUUID()}.${ext}`;

    // Get presigned URL
    const presignedUrl = await getPresignedUploadUrl(r2Key, fileType);

    // Create document record in DB
    const document = await prisma.document.create({
      data: {
        name: fileName,
        type: ext,
        size: fileSize,
        r2Key,
        userId: session.user.id,
        status: "pending",
      },
    });

    return NextResponse.json({
      presignedUrl,
      documentId: document.id,
      r2Key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// DELETE - Delete a document
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 },
      );
    }

    // Get document and verify ownership
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

    // Delete from R2
    await deleteR2Object(document.r2Key);

    // Delete from DB (cascade to embeddings)
    await prisma.document.delete({ where: { id: documentId } });

    return NextResponse.json({ message: "Document deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
