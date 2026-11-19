import type { ModelTokenAccounting, PreparedModelCall } from './ModelTokenAccounting.ts';
// Adapters must keep trusted instructions separate from serialized untrusted data.
export interface ClassificationPrompt { instructions: string; data: string }
// The attempt orchestrator owns deadlines; cancellation does not prove remote work stopped.
export interface ClassificationOptions { signal?: AbortSignal }
export interface LLMProvider {
  readonly receiver: ModelTokenAccounting;
  generate(input: string): Promise<string>;
  // Adapters enforce the prepared output-token reservation on serialized output,
  // using this receiver, without truncation, repair or retry. Invalid output must
  // remain a controlled rejection, never an accepted unaccounted response.
  classify(input: PreparedModelCall, options?: ClassificationOptions): Promise<unknown>;
}

// Structured factual continuation is separate from the bootstrap string ping.
export interface AnswerGenerator {
  readonly answerReceiver: ModelTokenAccounting;
  generateAnswer(input: PreparedModelCall, options?: ClassificationOptions): Promise<unknown>;
}
