import type { AdmittedMessage, AdmissionState } from '../shared/conversation-admission.ts';
import type { ConversationProcessingContext } from '../ports/ConversationProcessor.ts';
import type { ClassifyTurnRequest } from '../shared/professional-intent.ts';
import { intentText } from '../shared/professional-intent.ts';
import { jcs } from '../shared/public-catalog.ts';
import { resultLanguage } from '../shared/conversation-result.ts';

// State must be the authenticated, ordered snapshot from ConversationStore.
// Future retry fixtures use the existing typed identity; this admits no retries.
export function resolveConversationContext(state: AdmissionState, current: AdmittedMessage, maximumLinks = 20): ConversationProcessingContext {
  const unavailable = { precedingMessages: [], contextAvailable: false };
  if (!Number.isSafeInteger(maximumLinks) || maximumLinks < 1 ||
    new Set(state.messages.map((m) => m.messageId)).size !== state.messages.length ||
    new Set(state.messages.map((m) => m.requestId)).size !== state.messages.length) return unavailable;
  let index = state.messages.findIndex((m) => m.messageId === current.messageId);
  if (index < 0 || jcs(state.messages[index]!) !== jcs(current)) return unavailable;
  let node = current;
  for (let depth = 0; depth < maximumLinks; depth++) {
    if (node.submissionIdentity.kind === 'direct') {
      if (node.question !== node.submissionIdentity.question || node.contextAnchorMessageId !== node.messageId ||
        current.contextAnchorMessageId !== node.messageId) return unavailable;
      return { precedingMessages: state.messages.slice(0, index), contextAvailable: true };
    }
    const originId = node.submissionIdentity.retryOfRequestId;
    const originIndex = state.messages.findIndex((m) => m.requestId === originId);
    const origin = state.messages[originIndex];
    if (!origin || originIndex >= index || origin.result?.status !== 'failed' || origin.result.error?.retryable !== true ||
      origin.result.requestId !== origin.requestId || origin.result.messageId !== origin.messageId ||
      origin.question !== node.question || jcs(origin.submittedScope) !== jcs(node.submittedScope) ||
      origin.contextAnchorMessageId !== node.contextAnchorMessageId) return unavailable;
    node = origin; index = originIndex;
  }
  return unavailable;
}
export function contextFallbackLanguage(context: ConversationProcessingContext): 'en' | 'fr' {
  for (const message of [...context.precedingMessages].reverse()) {
    try {
      const language = resultLanguage(message.result?.language).split('-')[0];
      if (language === 'en' || language === 'fr') return language;
    } catch { /* No valid supported declaration in this exchange. */ }
  }
  return 'fr';
}
export function selectConversationExchanges(context: ConversationProcessingContext, textBound: number,
  fits: (history: ClassifyTurnRequest['conversationContext']) => boolean): ClassifyTurnRequest['conversationContext'] | null {
  if (!context.contextAvailable) return null;
  const turns = context.precedingMessages;
  if (!turns.length) {
    try { return fits([]) ? [] : null; } catch { return null; }
  }
  // The most recent pair is indispensable. Every trailing model clarification
  // belongs to the same pending chain, bridging failed replies: failure is not
  // resolution. Only successful resolution or trusted technical provenance cuts it.
  let firstRequired = turns.length - 1;
  const unresolved = (turn: AdmittedMessage) => !turn.result || turn.result.status === 'clarification' || turn.result?.status === 'failed';
  while (firstRequired > 0 && unresolved(turns[firstRequired]!) &&
    !turns[firstRequired]!.contextReset && unresolved(turns[firstRequired - 1]!)) firstRequired--;
  const exchange = (turn: AdmittedMessage): ClassifyTurnRequest['conversationContext'] => {
    if (!turn.result) throw new Error('Incomplete exchange');
    return [{ role: 'user', text: intentText(turn.question, textBound) },
      { role: 'assistant', text: intentText(turn.result.blocks.map((block) => block.text).join('\n'), textBound) }];
  };
  let history: ClassifyTurnRequest['conversationContext'];
  try { history = turns.slice(firstRequired).flatMap(exchange); if (!fits(history)) return null; }
  catch { return null; }
  if (turns.slice(firstRequired).some((turn) => turn.contextReset)) return history;
  for (let i = firstRequired - 1; i >= 0; i--) {
    try {
      const candidate = [...exchange(turns[i]!), ...history];
      if (!fits(candidate)) break;
      history = candidate;
    } catch { break; }
    if (turns[i]!.contextReset) break;
  }
  return history;
}
