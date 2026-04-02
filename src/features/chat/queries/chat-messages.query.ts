import { fetchMessages } from "../api/get-messages";
import { chatKeys } from "../keys";

export const chatMessagesQuery = (conversationId: string) => ({
  queryKey: chatKeys.messages(conversationId),
  queryFn: () => fetchMessages(conversationId),
  enabled: !!conversationId,
});
