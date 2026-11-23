import { attemptTiming, beforeCutoff, startAttemptTimer, type AttemptTiming, type AttemptTimer } from '../shared/attempt-timing.ts';
import type { ProcessingAvailability } from '../ports/ProcessingAvailability.ts';
import { assertContextResetResult } from '../shared/professional-intent.ts';
import { contextFallbackLanguage, resolveConversationContext } from './conversation-context.ts';
import type { Clock } from '../ports/Clock.ts';
import type { ConversationStore } from '../ports/ConversationStore.ts';
import type { ConversationProcessor } from '../ports/ConversationProcessor.ts';
import type { ResourceCatalog } from '../ports/ResourceCatalog.ts';
import { admissionLimits, AdmissionRejected, normalizeSubmission, sameIdentity, type AdmissionLimits } from '../shared/conversation-admission.ts';
import { completeResult, controlledFailure, type ConversationResult } from '../shared/conversation-result.ts';
import { ConversationUnavailable } from '../shared/conversation.ts';
import { admitConversationQuestion } from './conversation-admission.ts';
import { authenticateConversation, CONVERSATION_RETENTION_MS } from './conversations.ts';

export async function submitConversationQuestion(
  store: ConversationStore, catalog: ResourceCatalog, clock: Clock, processor: ConversationProcessor | undefined,
  conversationId: string, authorization: string | undefined, body: unknown, limits: Partial<AdmissionLimits> = {},
  availability?: ProcessingAvailability, timingOverrides: Partial<AttemptTiming> = {}, timer: AttemptTimer = startAttemptTimer,
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
    const timing = attemptTiming(timingOverrides);
    const configuredLimits = admissionLimits(limits);
    const duration = Math.min(configuredLimits.leaseMilliseconds, timing.attemptMs);
    if (duration <= timing.finalizeReserveMs) throw new AdmissionRejected('result_unavailable');
    let localEnd = 0;
    const admission = await admitConversationQuestion(store, catalog, clock, conversationId, authorization, body, 'submit', configuredLimits, availability,
      admit => {
        localEnd = clock.now().getTime() + duration;
        return beforeCutoff(clock, timer, localEnd, ({ check }) => admit(check));
      });
    if (admission.status === 'completed' && admission.message.result) return admission.message.result;
    // Recovery execution is explicit and belongs to a later story. Never turn a
    // repeated interrupted POST into an automatic processing restart.
    if (!('lease' in admission)) throw new AdmissionRejected('result_unavailable');
    const { message, lease } = admission;
    const acquiredAt = lease.until - configuredLimits.leaseMilliseconds;
    const totalEnd = Math.min(localEnd, acquiredAt + duration);
    const workEnd = totalEnd - timing.finalizeReserveMs;
    // Only a genuinely new direct admission can safely use the initial snapshot
    // if the post-admission read fails. Existing roots must never borrow later topics.
    let lastLanguage: string | undefined = admission.status === 'admitted' && !saved && identity.kind === 'direct' && message.submissionIdentity.kind === 'direct' &&
      message.contextAnchorMessageId === message.messageId
      ? contextFallbackLanguage({ precedingMessages: state.messages, contextAvailable: true }) : undefined;
    let currentLanguage: string | undefined;
    let contextReset = false;
    let result: ConversationResult;
    try {
      result = await beforeCutoff(clock, timer, workEnd, async work => {
        // Admission can race another completed turn. Read authoritative context
        // after acquisition, anchored before this message, never later turns.
        const contextState = await store.readAdmissionState(conversationId, tokenHash, new Date(clock.now().getTime() - CONVERSATION_RETENTION_MS).toISOString(), work.check);
        work.check();
        if (!contextState) throw new ConversationUnavailable();
        const context = resolveConversationContext(contextState, message, limits.maxMessages);
        lastLanguage = contextFallbackLanguage(context);
        work.check();
        const output = await processor.process(message, { ...context, ...work,
          classifiedLanguage: language => { work.check(); currentLanguage = language; },
          withinClassification: run => beforeCutoff(clock, timer, Math.min(workEnd, clock.now().getTime() + timing.classifierMs), run, work.signal) });
        work.check();
        try {
          const candidate = 'failure' in output ? controlledFailure(message, output.failure, output.language, lastLanguage)
            : completeResult(message, output.draft, output.sources);
          if ('draft' in output && output.contextReset === true) {
            assertContextResetResult(candidate);
            contextReset = true;
          }
          return candidate;
        } catch { return controlledFailure(message, 'invalid_result', output.language, lastLanguage); }
      });
    } catch {
      if (!(clock.now().getTime() < totalEnd)) throw new AdmissionRejected('result_unavailable');
      contextReset = false;
      result = controlledFailure(message, 'processing_unavailable', currentLanguage, lastLanguage);
    }
    // Persistence uncertainty is NOT a recorded failure. Never replace an
    // unconfirmed commit with a second answer or return an unchecked draft.
    try {
      return await beforeCutoff(clock, timer, totalEnd, ({ check }) => store.finalize({
        conversationId, sessionTokenHash: tokenHash, requestId, attemptId: lease.attemptId, result, contextReset,
        ...(lastLanguage === undefined ? {} : { previousLanguage: lastLanguage }),
      }, check));
    } catch (error) {
      if (error instanceof ConversationUnavailable) throw error;
      throw new AdmissionRejected('result_unavailable');
    }
  } catch (error) {
    if (error instanceof ConversationUnavailable || error instanceof AdmissionRejected) throw error;
    throw new AdmissionRejected('result_unavailable');
  }
}
