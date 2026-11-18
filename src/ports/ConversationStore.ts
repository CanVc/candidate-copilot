export interface StoredConversation {
  conversationId: string;
  sessionTokenHash: string;
  createdAt: string;
  modifiedAt: string;
}

export interface ConversationStore {
  create(conversation: StoredConversation): Promise<void>;
  // This identity-only lookup authenticates before any transcript/result lookup.
  findAuthenticated(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<{ conversationId: string } | null>;
}
