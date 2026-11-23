import { confirmedProcessingOutage, type ProcessingAvailability } from '../ports/ProcessingAvailability.ts';
import type { Clock } from '../ports/Clock.ts';
import type { ConversationStore } from '../ports/ConversationStore.ts';
import type { ResourceCatalog } from '../ports/ResourceCatalog.ts';
import { ConversationUnavailable } from '../shared/conversation.ts';
import { AdmissionRejected, admissionLimits, countQuestionCharacters, normalizeSubmission, sameIdentity, type AdmissionLimits, type AdmissionOutcome } from '../shared/conversation-admission.ts';
import { authenticateConversation, CONVERSATION_RETENTION_MS } from './conversations.ts';

// Internal service only: acquisition is not a canonical HTTP result. Recovery
// requires a separate explicit caller action, never a read or an automatic retry.
export async function admitConversationQuestion(
  store: ConversationStore, catalog: ResourceCatalog, clock: Clock,
  conversationId: string, authorization: string | undefined, body: unknown,
  action: 'submit' | 'recover', configuration: Partial<AdmissionLimits> = {},
  availability?: ProcessingAvailability,
): Promise<AdmissionOutcome> {
  const tokenHash = await authenticateConversation(store, clock, conversationId, authorization);
  try {
    const limits = admissionLimits(configuration);
    const { requestId, identity } = normalizeSubmission(body);
    const readSavedState = async () => {
      const createdAfter = new Date(clock.now().getTime() - CONVERSATION_RETENTION_MS).toISOString();
      const state = await store.readAdmissionState(conversationId, tokenHash, createdAfter);
      if (!state) throw new ConversationUnavailable();
      const saved = state.messages.find((message) => message.requestId === requestId);
      if (saved && !sameIdentity(saved.submissionIdentity, identity)) throw new AdmissionRejected('request_conflict');
      if (!saved?.result && state.lease && state.lease.until > clock.now().getTime()) throw new AdmissionRejected(state.lease.requestId === requestId ? 'request_in_progress' : 'conversation_busy');
      return { state, saved };
    };
    const rejectAfterLookup = async (rejection: AdmissionRejected): Promise<AdmissionOutcome> => {
      // A competing admission may have committed during the publication read.
      // Recheck saved precedence once; never retry processing or remap its scope.
      const { state, saved } = await readSavedState();
      if (saved?.result) return { status: 'completed', message: saved };
      if (saved && action !== 'recover') return { status: 'interrupted', message: saved };
      if (rejection.code === 'provider_unavailable' && !saved && state.messages.length >= limits.maxMessages) throw new AdmissionRejected('turn_limit_reached');
      throw rejection;
    };
    const { state, saved } = await readSavedState();
    if (saved?.result) return { status: 'completed', message: saved };
    if (saved && action !== 'recover') return { status: 'interrupted', message: saved };
    if (!saved) {
      if (action === 'recover') throw new AdmissionRejected('invalid_request');
      if (identity.kind === 'retry') throw new AdmissionRejected('invalid_retry');
      if (identity.resourceIds.length) throw new AdmissionRejected('invalid_scope');
      if (!identity.question.trim() || countQuestionCharacters(identity.question) > limits.maxQuestionCharacters) throw new AdmissionRejected('invalid_request');
      if (state.messages.length >= limits.maxMessages) throw new AdmissionRejected('turn_limit_reached');
    }
    const publication = await catalog.readSnapshot();
    if (!publication || !publication.catalog.documents.length) return await rejectAfterLookup(new AdmissionRejected('scope_unavailable'));
    if (saved) {
      if (saved.submittedScope.eligibleDocumentIds.some((id) => !publication.catalog.documents.some((d) => d.documentId === id))) return await rejectAfterLookup(new AdmissionRejected('scope_unavailable'));
    } else if (identity.kind !== 'direct' || identity.catalogRevision !== publication.catalogRevision || identity.catalogHash !== publication.catalogHash) {
      return await rejectAfterLookup(new AdmissionRejected('catalog_stale', { catalogRevision: publication.catalogRevision, catalogHash: publication.catalogHash }));
    }
    const outage = confirmedProcessingOutage(availability, clock.now().getTime());
    if (outage) return await rejectAfterLookup(new AdmissionRejected('provider_unavailable', undefined, outage.resumeAt));
    return await store.admit({ conversationId, sessionTokenHash: tokenHash, requestId, identity,
      messageId: crypto.randomUUID(), attemptId: crypto.randomUUID(), recover: action === 'recover', limits, publication });
  } catch (error) {
    if (error instanceof ConversationUnavailable || error instanceof AdmissionRejected) throw error;
    throw new AdmissionRejected('result_unavailable');
  }
}
