// Adapters must keep trusted instructions separate from serialized untrusted data.
export interface ClassificationPrompt { instructions: string; data: string }
// The attempt orchestrator owns deadlines; cancellation does not prove remote work stopped.
export interface ClassificationOptions { signal?: AbortSignal }
export interface LLMProvider {
  generate(input: string): Promise<string>;
  classify(input: ClassificationPrompt, options?: ClassificationOptions): Promise<unknown>;
}
