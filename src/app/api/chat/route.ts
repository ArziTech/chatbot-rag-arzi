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

    // Get user's preferences + API keys
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        defaultModel: true,
        defaultProvider: true,
        openaiKey: true,
        anthropicKey: true,
      },
    });

    // Get user's runtime envs for API keys
    const runtimeEnvs = await prisma.runtimeEnv.findMany({
      where: { userId: session.user.id, isActive: true },
    });

    // Map provider to API key env var name
    const PROVIDER_API_KEYS: Record<string, string> = {
      openai: "OPENAI_API_KEY",
      anthropic: "ANTHROPIC_API_KEY",
      gemini: "GEMINI_API_KEY",
      minimax: "MINIMAX_API_KEY",
    };

    const effectiveModel = model || user?.defaultModel || "gpt-4o";
    const effectiveProvider = provider || user?.defaultProvider || "openai";

    // Get the appropriate API key for the provider
    let apiKey: string | undefined;
    if (effectiveProvider === "openai" && user?.openaiKey) {
      apiKey = user.openaiKey;
    } else if (effectiveProvider === "anthropic" && user?.anthropicKey) {
      apiKey = user.anthropicKey;
    } else {
      // Check runtime envs for other providers (gemini, minimax, etc.)
      const apiKeyName = PROVIDER_API_KEYS[effectiveProvider];
      if (apiKeyName) {
        const runtimeEnv = runtimeEnvs.find((env) => env.key === apiKeyName);
        if (runtimeEnv) {
          apiKey = runtimeEnv.value;
        }
      }
    }

    // Get Gemini API key for embeddings (always use Gemini for RAG)
    const geminiEnv = runtimeEnvs.find((env) => env.key === "GEMINI_API_KEY");
    const embeddingApiKey = geminiEnv?.value;

    // Create new conversation if needed
    if (!convId) {
      const conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: content.slice(0, 50),
          model: effectiveModel,
          provider: effectiveProvider,
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
            conversationHistory,
            {
              provider: effectiveProvider,
              apiKey,
              embeddingApiKey,
            },
          )) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`),
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
