import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { documentListSchema } from "@/lib/validations/document";

// GET - List user's documents
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const validated = documentListSchema.safeParse({
      cursor: searchParams.get("cursor"),
      limit: searchParams.get("limit"),
    });

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const { cursor, limit } = validated.data;

    const documents = await prisma.document.findMany({
      where: { userId: session.user.id },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        status: true,
        createdAt: true,
      },
    });

    const hasMore = documents.length > limit;
    const items = hasMore ? documents.slice(0, -1) : documents;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      documents: items,
      nextCursor,
    });
  } catch (error) {
    console.error("List documents error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
