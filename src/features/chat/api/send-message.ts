"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamRAGPipeline } from "@/lib/ai";

export interface SendMessageInput {
  conversationId?: string | null;
  content: string;
  model?: string;
  provider?: string;
}

export interface SendMessageResult {
  success: true;
  conversationId: string;
  userMessage: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  };
}

export interface StreamingChatResult {
  success: true;
  conversationId: string;
  conversation: {
    id: string;
    title: string | null;
    model: string | null;
    provider: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Non-streaming send message - creates conversation and saves user message.
 * Returns immediately without waiting for AI response.
 */
export async function sendMessage(
  conversationId: string | null,
  content: string,
  model?: string,
  provider?: string,
): Promise<{ success: false; error: string } | SendMessageResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    let convId = conversationId;

    // Create new conversation if needed
    if (!convId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: content.slice(0, 50), // First 50 chars as title
          model: model || "gpt-4o",
          provider: provider || "openai",
        },
      });
      convId = conversation.id;
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content,
      },
    });

    return {
      success: true,
      conversationId: convId,
      userMessage,
    };
  } catch (error) {
    console.error("Send message error:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Streaming chat endpoint - returns SSE response.
 * Creates conversation, saves user message, and streams AI response.
 */
export async function createStreamingChat(
  conversationId: string | null,
  content: string,
  model?: string,
  provider?: string,
): Promise<
  { success: false; error: string } | { success: true; response: Response }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    let convId = conversationId;

    // Create new conversation if needed
    if (!convId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: content.slice(0, 50),
          model: model || "gpt-4o",
          provider: provider || "openai",
        },
      });
      convId = conversation.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "user",
        content,
      },
    });

    // Get conversation history for context
    const history = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
    });

    // Build conversation history (excluding the just-added user message)
    const conversationHistory = history.slice(0, -1).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Create SSE stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";

          for await (const chunk of streamRAGPipeline(
            content,
            session.user.id,
            conversationHistory,
          )) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`),
            );
          }

          // Save assistant message with citations (citations would come from the RAG pipeline in a full implementation)
          await prisma.message.create({
            data: {
              conversationId: convId,
              role: "assistant",
              content: fullResponse,
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`,
            ),
          );
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return {
      success: true,
      response: new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }),
    };
  } catch (error) {
    console.error("Create streaming chat error:", error);
    return { success: false, error: "Failed to create streaming chat" };
  }
}
