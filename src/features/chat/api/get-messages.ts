import type { ChatMessage } from "../types";

export async function fetchMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const res = await fetch(
    `/api/messages?conversationId=${conversationId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json();
  return data.messages || [];
}
