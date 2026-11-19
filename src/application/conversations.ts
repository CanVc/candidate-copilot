import type { ResourceCatalog } from '../ports/ResourceCatalog.ts';
import { DEFAULT_ADMISSION_LIMITS } from '../shared/conversation-admission.ts';
import { creationPseudonym, creationWindow } from './conversation-creation-limits.ts';
import { ConversationRateLimited } from '../shared/conversation.ts';
import type { Clock } from '../ports/Clock.ts';
import type { ConversationStore } from '../ports/ConversationStore.ts';
import { ConversationDependencyUnavailable, ConversationUnavailable, type ConversationView, type CreatedConversation } from '../shared/conversation.ts';

export const CONVERSATION_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const token = /^[0-9a-f]{64}$/;
export async function hashSessionToken(sessionToken: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sessionToken));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createConversation(store: ConversationStore, clock: Clock, address: string, limit: number): Promise<CreatedConversation> {
  try {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new ConversationDependencyUnavailable();
    const window = creationWindow(clock.now());
    const dailyKey = await store.dailyCreationKey(window);
    const pseudonym = await creationPseudonym(address, window, dailyKey);
    const conversationId = crypto.randomUUID();
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) => b.toString(16).padStart(2, '0')).join('');
    const createdAt = clock.now().toISOString();
    const outcome = await store.create({ conversationId, sessionTokenHash: await hashSessionToken(sessionToken), createdAt, modifiedAt: createdAt }, { ...window, dailyKey, pseudonym, limit });
    if (outcome === 'rate_limited') throw new ConversationRateLimited(window.expiresAt);
    return { conversationId, sessionToken };
  } catch (error) {
    if (error instanceof ConversationRateLimited) throw error;
    throw new ConversationDependencyUnavailable();
  }
}

export async function authenticateConversation(store: ConversationStore, clock: Clock, conversationId: string, authorization: string | undefined): Promise<string> {
  const credential = /^Bearer +([0-9a-f]{64})$/i.exec(authorization ?? '');
  if (!uuid.test(conversationId) || !credential || !token.test(credential[1]!)) throw new ConversationUnavailable();
  try {
    const createdAfter = new Date(clock.now().getTime() - CONVERSATION_RETENTION_MS).toISOString();
    const identity = await store.findAuthenticated(conversationId, await hashSessionToken(credential[1]!), createdAfter);
    if (!identity || identity.conversationId !== conversationId) throw new ConversationUnavailable();
    return await hashSessionToken(credential[1]!);
  } catch (error) {
    if (error instanceof ConversationUnavailable) throw error;
    throw new ConversationDependencyUnavailable();
  }
}

export async function readConversation(store: ConversationStore, clock: Clock, conversationId: string, authorization: string | undefined, catalog?: ResourceCatalog, limits = DEFAULT_ADMISSION_LIMITS, processingAvailable = true): Promise<ConversationView> {
  const tokenHash = await authenticateConversation(store, clock, conversationId, authorization);
  try {
    const now = clock.now().getTime();
    const state = await store.readAdmissionState(conversationId, tokenHash, new Date(now - CONVERSATION_RETENTION_MS).toISOString());
    if (!state) throw new ConversationUnavailable();
    const publication = await catalog?.readSnapshot().catch(() => null);
    const active = state.lease && state.lease.until > clock.now().getTime() ? state.lease : null;
    return {
      conversationId,
      transcript: state.messages.map(({ submissionIdentity: _identity, contextAnchorMessageId: _anchor, contextReset: _reset, ...message }) => ({
        ...message, status: message.result ? 'completed' : active?.requestId === message.requestId ? 'in_progress' : 'interrupted',
      })),
      processing: active ? { status: 'in_progress', requestId: active.requestId } : { status: 'idle' },
      admission: active ? { available: false, reason: 'conversation_busy' } : state.messages.length >= limits.maxMessages
        ? { available: false, reason: 'turn_limit_reached' } : !publication?.catalog.documents.length
          ? { available: false, reason: 'scope_unavailable' } : !processingAvailable
            ? { available: false, reason: 'processing_unavailable' } : { available: true },
    };
  } catch (error) {
    if (error instanceof ConversationUnavailable) throw error;
    throw new ConversationDependencyUnavailable();
  }
}
