export interface ModelPrompt { readonly instructions: string; readonly data: string }
export type ModelComponent = 'instructions' | 'question' | 'history' | 'catalog' | 'evidence' | 'handoff';
export interface ModelContextBudget {
  readonly components: Readonly<Record<ModelComponent, number>>;
  readonly output: number;
}
// An adapter binds this immutable descriptor to the receiver it actually invokes.
// Counting includes the exact wire framing, not a sum of isolated components.
export interface ModelTokenAccounting {
  readonly model: string;
  readonly modelVersion: string;
  readonly tokenizer: string;
  readonly tokenizerVersion: string;
  readonly serializationVersion: string;
  readonly capacity: number;
  readonly maximumOutput: number;
  readonly budget: ModelContextBudget;
  readonly count: (text: string) => number;
  readonly serialize: (prompt: ModelPrompt) => string;
}
export interface ModelCallInput extends ModelPrompt {
  readonly components: Readonly<Record<ModelComponent, string>>;
}
export interface PreparedModelCall extends ModelPrompt {
  readonly receiverIdentity: string;
  readonly serializedInput: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly componentTokens: Readonly<Record<ModelComponent, number>>;
}
