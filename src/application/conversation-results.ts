import type { Clock } from '../ports/Clock.ts';
import type { ConversationStore } from '../ports/ConversationStore.ts';
import type { ConversationProcessor } from '../ports/ConversationProcessor.ts';
import type { ResourceCatalog } from '../ports/ResourceCatalog.ts';
import { AdmissionRejected, normalizeSubmission, sameIdentity, type AdmissionLimits } from '../shared/conversation-admission.ts';
import { completeResult, controlledFailure, type ConversationResult } from '../shared/conversation-result.ts';
import { ConversationUnavailable } from '../shared/conversation.ts';
import { admitConversationQuestion } from './conversation-admission.ts';
import { authenticateConversation, CONVERSATION_RETENTION_MS } from './conversations.ts';

export async function submitConversationQuestion(
  store: ConversationStore, catalog: ResourceCatalog, clock: Clock, processor: ConversationProcessor | undefined,
  conversationId: string, authorization: string | undefined, body: unknown, limits: Partial<AdmissionLimits> = {},
): Promise<ConversationResult> {
  const tokenHash = await authenticateConversation(store, clock, conversationId, authorization);
  try {
    const { requestId, identity } = normalizeSubmission(body);
    // Replay needs neither live publication nor configured processing, even at cap.
    const state = await store.readAdmissionState(conversationId, tokenHash, new Date(clock.now().getTime() - CONVERSATION_RETENTION_MS).toISOString());
    if (!state) throw new ConversationUnavailable();
    const saved = state.messages.find((m) => m.requestId === requestId);
    if (saved && !sameIdentity(saved.submissionIdentity, identity)) throw new AdmissionRejected('request_conflict');
    if (saved?.result) return saved.result;
    if (state.lease && state.lease.until > clock.now().getTime()) throw new AdmissionRejected(state.lease.requestId === requestId ? 'request_in_progress' : 'conversation_busy');
    if (!processor) throw new AdmissionRejected('result_unavailable');
    const admission = await admitConversationQuestion(store, catalog, clock, conversationId, authorization, body, 'submit', limits);
    if (admission.status === 'completed' && admission.message.result) return admission.message.result;
    // Recovery execution is explicit and belongs to a later story. Never turn a
    // repeated interrupted POST into an automatic processing restart.
    if (!('lease' in admission)) throw new AdmissionRejected('result_unavailable');
    const { message, lease } = admission;
    let lastLanguage = [...state.messages].reverse().find((m) => m.result)?.result?.language;
    let result: ConversationResult;
    try {
      // Admission can race another completed turn. Read authoritative context
      // after acquisition, anchored before this message, never later turns.
      const contextState = await store.readAdmissionState(conversationId, tokenHash, new Date(clock.now().getTime() - CONVERSATION_RETENTION_MS).toISOString());
      if (!contextState) throw new ConversationUnavailable();
      const anchor = contextState.messages.findIndex((m) => m.messageId === message.contextAnchorMessageId);
      const precedingMessages = anchor >= 0 ? contextState.messages.slice(0, anchor) : [];
      lastLanguage = [...precedingMessages].reverse().find((m) => m.result)?.result?.language;
      const output = await processor.process(message, {
        precedingMessages,
        contextAvailable: anchor >= 0,
      });
      try {
        result = 'failure' in output ? controlledFailure(message, output.failure, output.language, lastLanguage)
          : completeResult(message, output.draft, output.sources);
      } catch { result = controlledFailure(message, 'invalid_result', output.language, lastLanguage); }
    } catch { result = controlledFailure(message, 'processing_unavailable', lastLanguage); }
    // Persistence uncertainty is NOT a recorded failure. Never replace an
    // unconfirmed commit with a second answer or return an unchecked draft.
    return await store.finalize({ conversationId, sessionTokenHash: tokenHash, requestId, attemptId: lease.attemptId, result,
      ...(lastLanguage === undefined ? {} : { previousLanguage: lastLanguage }) });
  } catch (error) {
    if (error instanceof ConversationUnavailable || error instanceof AdmissionRejected) throw error;
    throw new AdmissionRejected('result_unavailable');
  }
}
