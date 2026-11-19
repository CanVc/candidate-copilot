import type { AdmittedMessage } from '../shared/conversation-admission.ts';
import type { LoadedSource, ResultFailureCode } from '../shared/conversation-result.ts';

// Development composition only in Story 2.8; no classifier/provider integration.
export interface ConversationProcessor {
  process(message: AdmittedMessage): Promise<
    | { draft: unknown; sources: LoadedSource[] }
    | { failure: ResultFailureCode; language?: string }
  >;
}
