export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export interface Citation {
  embeddingId: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  score: number;
  content: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  model: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface SendMessageInput {
  conversationId?: string | null;
  content: string;
  model?: string;
  provider?: string;
}

export interface SendMessageResult {
  conversation: Conversation;
  message: ChatMessage;
  streaming?: boolean;
}
