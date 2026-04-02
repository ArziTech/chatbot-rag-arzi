import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamRAGPipeline } from "@/lib/ai";
import { z } from "zod";

const chatSchema = z.object({
  conversationId: z.string().optional().nullable(),
  content: z.string().min(1),
  model: z.string().optional(),
  provider: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validated = chatSchema.safeParse(body);
    if (!validated.success) {
      return new Response("Invalid request", { status: 400 });
    }

    const { conversationId, content, model, provider } = validated.data;
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

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    // Get conversation history
    const history = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
    });

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
            conversationHistory
          )) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
            );
          }

          // Save assistant message with citations
          await prisma.message.create({
            data: {
              conversationId: convId,
              role: "assistant",
              content: fullResponse,
            },
          });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
