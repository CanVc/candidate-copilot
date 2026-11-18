import type { ConversationStore, StoredConversation } from '../../ports/ConversationStore.ts';
import type { CreationAllowance, CreationWindow } from '../../shared/conversation.ts';
import type { Clock } from '../../ports/Clock.ts';

export class D1ConversationStore implements ConversationStore {
  // A clock override is only used by isolated deterministic runtime composition.
  // Production window checks execute against SQLite time, including queue delay.
  constructor(private readonly db: D1Database, private readonly clock?: Clock) {}
  private nowSql(): string {
    if (!this.clock) return "CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)";
    const now = this.clock.now().getTime();
    if (!Number.isSafeInteger(now)) throw new Error('Creation clock unavailable');
    return String(now);
  }
  async dailyCreationKey(window: CreationWindow): Promise<string> {
    const candidate = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
    const now = this.nowSql();
    const results = await this.db.batch([
      this.db.prepare(`UPDATE conversation_creation_key SET day = ?, expires_at = ?, daily_key = ?
        WHERE id = 1 AND day < ? AND expires_at = day + 86400000
        AND (daily_key IS NULL OR (length(daily_key) = 64 AND daily_key NOT GLOB '*[^0-9a-f]*'))
        AND ? <= ${now} AND ${now} < ?`)
        .bind(window.day, window.expiresAt, candidate, window.day, window.day, window.expiresAt),
      this.db.prepare('SELECT day, expires_at, daily_key FROM conversation_creation_key WHERE id = 1'),
    ]);
    const row = results[1]?.results[0] as { day: number; expires_at: number; daily_key: string | null } | undefined;
    if (results.some((r) => !r.success) || !row || row.day !== window.day || row.expires_at !== window.expiresAt ||
        typeof row.daily_key !== 'string' || !/^[0-9a-f]{64}$/.test(row.daily_key)) throw new Error('Creation key unavailable');
    return row.daily_key;
  }
  async create(conversation: StoredConversation, allowance: CreationAllowance): Promise<'created' | 'rate_limited'> {
    const { day, expiresAt, dailyKey, pseudonym, limit } = allowance;
    const now = this.nowSql();
    const guard = `EXISTS (SELECT 1 FROM conversation_creation_key WHERE id = 1 AND day = ? AND expires_at = ? AND daily_key = ?)
      AND ? <= ${now} AND ${now} < ?`;
    const guards = [day, expiresAt, dailyKey, day, expiresAt];
    // changes() must immediately follow the capped UPSERT in the same atomic batch.
    // The UPSERT is the admission-time window guard for the entire transaction.
    // Do not recheck time between its increment and INSERT: midnight must not
    // leave a consumed allowance without a Conversation. Concurrent key rollover
    // cannot interleave inside this batch. Failed INSERT rolls back the allowance.
    const results = await this.db.batch([
      this.db.prepare(`INSERT INTO conversation_creation_counters (pseudonym, expires_at, creations)
        SELECT ?, ?, 1 WHERE ${guard}
        ON CONFLICT(pseudonym) DO UPDATE SET creations = creations + 1
        WHERE creations < ? AND expires_at = excluded.expires_at`).bind(pseudonym, expiresAt, ...guards, limit),
      this.db.prepare(`INSERT INTO conversations (id, session_token_hash, created_at, modified_at)
        SELECT ?, ?, ?, ? WHERE changes() = 1`)
        .bind(conversation.conversationId, conversation.sessionTokenHash, conversation.createdAt, conversation.modifiedAt),
      this.db.prepare(`SELECT 1 AS valid FROM conversation_creation_counters
        WHERE pseudonym = ? AND expires_at = ? AND creations >= ? AND ${guard}`)
        .bind(pseudonym, expiresAt, limit, ...guards),
    ]);
    if (results.some((r) => !r.success)) throw new Error('Creation persistence unavailable');
    if (results[1]?.meta.changes === 1) return 'created';
    if (!results[2]?.results.length) throw new Error('Creation persistence unavailable');
    if (results[0]?.meta.changes !== 0) throw new Error('Creation persistence unavailable');
    return 'rate_limited';
  }
  async cleanupCreationLimits(): Promise<void> {
    const now = this.nowSql();
    const results = await this.db.batch([
      this.db.prepare(`DELETE FROM conversation_creation_counters WHERE expires_at <= ${now}`),
      this.db.prepare(`UPDATE conversation_creation_key SET daily_key = NULL WHERE daily_key IS NOT NULL AND expires_at <= ${now}`),
    ]);
    if (results.some((r) => !r.success)) throw new Error('Creation cleanup unavailable');
  }
  async findAuthenticated(conversationId: string, sessionTokenHash: string, createdAfter: string): Promise<{ conversationId: string } | null> {
    const row = await this.db.prepare('SELECT id FROM conversations WHERE id = ? AND session_token_hash = ? AND created_at > ?')
      .bind(conversationId, sessionTokenHash, createdAfter).first<{ id: string }>();
    return row ? { conversationId: row.id } : null;
  }
}
