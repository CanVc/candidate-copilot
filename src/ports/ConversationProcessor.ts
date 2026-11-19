import type { AdmittedMessage } from '../shared/conversation-admission.ts';
import type { LoadedSource, ResultFailureCode } from '../shared/conversation-result.ts';

// Server-owned interpretation inputs only; never accepted from HTTP bodies.
export interface ConversationProcessingContext {
  precedingMessages: readonly AdmittedMessage[];
  contextAvailable: boolean;
  signal?: AbortSignal;
}
export interface ConversationProcessor {
  process(message: AdmittedMessage, context: ConversationProcessingContext): Promise<
    // Optional language is validated classification metadata, never read from an invalid draft.
    | { draft: unknown; sources: LoadedSource[]; language?: string; contextReset?: true }
    | { failure: ResultFailureCode; language?: string }
  >;
}
