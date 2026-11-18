import type { CreationAllowance, CreationWindow } from '../shared/conversation.ts';

export interface StoredConversation {
  conversationId: string;
  sessionTokenHash: string;
  createdAt: string;
  modifiedAt: string;
}

export interface ConversationStore {
  dailyCreationKey(window: CreationWindow): Promise<string>;
  create(conversation: StoredConversation, allowance: CreationAllowance): Promise<'created' | 'rate_limited'>;
  cleanupCreationLimits(): Promise<void>;
  // This identity-only lookup authenticates before any transcript/result lookup.
  findAuthenticated(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<{ conversationId: string } | null>;
}
