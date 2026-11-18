import type { ConversationStore, StoredConversation } from '../../ports/ConversationStore.ts';

export class D1ConversationStore implements ConversationStore {
  constructor(private readonly db: D1Database) {}
  async create(conversation: StoredConversation): Promise<void> {
    const result = await this.db.prepare('INSERT INTO conversations (id, session_token_hash, created_at, modified_at) VALUES (?, ?, ?, ?)')
      .bind(conversation.conversationId, conversation.sessionTokenHash, conversation.createdAt, conversation.modifiedAt).run();
    if (!result.success) throw new Error('Conversation persistence unavailable');
  }
  async findAuthenticated(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<{ conversationId: string } | null> {
    const row = await this.db.prepare('SELECT id FROM conversations WHERE id = ? AND session_token_hash = ? AND created_at > ?')
      .bind(conversationId, sessionTokenHash, createdAfter).first<{ id: string }>();
    return row ? { conversationId: row.id } : null;
  }
}
