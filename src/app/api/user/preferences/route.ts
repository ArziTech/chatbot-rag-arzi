import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        defaultModel: true,
        defaultProvider: true,
        openaiKey: true,
        anthropicKey: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        defaultModel: user.defaultModel,
        defaultProvider: user.defaultProvider,
        hasOpenAIKey: !!user.openaiKey,
        hasAnthropicKey: !!user.anthropicKey,
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json({ success: false, error: "Failed to get preferences" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { defaultModel, defaultProvider, openaiKey, anthropicKey } = body;

    const updateData: Record<string, unknown> = {};
    if (defaultModel !== undefined) updateData.defaultModel = defaultModel;
    if (defaultProvider !== undefined) updateData.defaultProvider = defaultProvider;
    if (openaiKey !== undefined) updateData.openaiKey = openaiKey || null;
    if (anthropicKey !== undefined) updateData.anthropicKey = anthropicKey || null;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        defaultModel: true,
        defaultProvider: true,
        openaiKey: true,
        anthropicKey: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        defaultModel: user.defaultModel,
        defaultProvider: user.defaultProvider,
        hasOpenAIKey: !!user.openaiKey,
        hasAnthropicKey: !!user.anthropicKey,
      },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json({ success: false, error: "Failed to update preferences" }, { status: 500 });
  }
}
