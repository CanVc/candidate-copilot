import type { OperationControls } from '../shared/attempt-timing.ts';
import type { AdmittedMessage } from '../shared/conversation-admission.ts';
import type { LoadedSource, ResultFailureCode } from '../shared/conversation-result.ts';

// Server-owned interpretation inputs only; never accepted from HTTP bodies.
export interface ConversationProcessingContext extends Partial<OperationControls> {
  precedingMessages: readonly AdmittedMessage[];
  contextAvailable: boolean;
  // Retain validated language for a timeout even if the continuation never returns.
  classifiedLanguage?: (language: string) => void;
  withinClassification?: <T>(run: (controls: OperationControls) => Promise<T>) => Promise<T>;
}
export interface ConversationProcessor {
  process(message: AdmittedMessage, context: ConversationProcessingContext): Promise<
    // Optional language is validated classification metadata, never read from an invalid draft.
    | { draft: unknown; sources: LoadedSource[]; language?: string; contextReset?: true }
    | { failure: ResultFailureCode; language?: string }
  >;
}
