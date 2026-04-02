"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "../keys";
import type { ChatMessage } from "../types";

interface UseChatOptions {
  conversationId?: string | null;
}

export function useChat(options: UseChatOptions = {}) {
  const { conversationId: initialConversationId } = options;
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId ?? null
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsTyping(true);
      setError(null);

      // Optimistically add user message
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      const currentConvId = conversationId || "new";

      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(currentConvId),
        (old) => [...(old || []), tempUserMessage]
      );

      try {
        // Use fetch with SSE
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantContent = "";
        let newConversationId = conversationId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter(Boolean);

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.chunk) {
                assistantContent += data.chunk;
                // Update with streaming content
                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(newConversationId || currentConvId),
                  (old) => {
                    const last = old?.[old.length - 1];
                    if (last?.role === "assistant") {
                      return [
                        ...(old || []).slice(0, -1),
                        { ...last, content: assistantContent },
                      ];
                    }
                    return [
                      ...(old || []),
                      {
                        id: `temp-${Date.now()}`,
                        role: "assistant" as const,
                        content: assistantContent,
                        createdAt: new Date().toISOString(),
                      },
                    ];
                  }
                );
              }

              if (data.done) {
                newConversationId = data.conversationId;
                // Update conversation ID if this was a new conversation
                if (!conversationId && data.conversationId) {
                  setConversationId(data.conversationId);
                  // Migrate cached messages to the new conversation ID
                  const cachedMessages = queryClient.getQueryData<ChatMessage[]>(
                    chatKeys.messages(currentConvId)
                  );
                  if (cachedMessages) {
                    queryClient.setQueryData(
                      chatKeys.messages(data.conversationId),
                      cachedMessages
                    );
                    queryClient.removeQueries({
                      queryKey: chatKeys.messages(currentConvId),
                    });
                  }
                }
                // Invalidate to refetch real messages
                queryClient.invalidateQueries({
                  queryKey: chatKeys.messages(newConversationId || ""),
                });
                queryClient.invalidateQueries({
                  queryKey: chatKeys.conversations(),
                });
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsTyping(false);
      }
    },
    [conversationId, queryClient]
  );

  const cleanup = useCallback(() => {
    // Cleanup is handled automatically by the fetch API
  }, []);

  return {
    sendMessage,
    isTyping,
    error,
    conversationId,
    setConversationId,
    cleanup,
  };
}
