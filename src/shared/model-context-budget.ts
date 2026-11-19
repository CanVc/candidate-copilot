import type { ModelCallInput, ModelComponent, ModelContextBudget, ModelTokenAccounting, PreparedModelCall } from '../ports/ModelTokenAccounting.ts';

export const MODEL_COMPONENTS: readonly ModelComponent[] = ['instructions', 'question', 'history', 'catalog', 'evidence', 'handoff'];
export const DEFAULT_MODEL_CONTEXT_BUDGET: ModelContextBudget = Object.freeze({
  components: Object.freeze({ instructions: 6000, question: 4000, history: 3000, catalog: 4000, evidence: 12000, handoff: 2000 }), output: 2000,
});
export class ModelContextUnavailable extends Error {
  constructor() { super('Model context unavailable'); }
}
function integer(value: number, minimum = 0): number {
  if (!Number.isSafeInteger(value) || value < minimum) throw new ModelContextUnavailable();
  return value;
}
export function receiverIdentity(receiver: ModelTokenAccounting): string {
  if (!receiver || [receiver.model, receiver.modelVersion, receiver.tokenizer, receiver.tokenizerVersion, receiver.serializationVersion]
    .some((value) => typeof value !== 'string' || !value.trim()) || typeof receiver.count !== 'function' || typeof receiver.serialize !== 'function') throw new ModelContextUnavailable();
  integer(receiver.capacity, 1); integer(receiver.maximumOutput, 1); integer(receiver.budget?.output, 1);
  for (const key of MODEL_COMPONENTS) integer(receiver.budget?.components?.[key], 1);
  if (receiver.budget.output > receiver.maximumOutput || receiver.maximumOutput > receiver.capacity) throw new ModelContextUnavailable();
  return JSON.stringify([receiver.model, receiver.modelVersion, receiver.tokenizer, receiver.tokenizerVersion,
    receiver.serializationVersion, receiver.capacity, receiver.maximumOutput, MODEL_COMPONENTS.map((key) => receiver.budget.components[key]), receiver.budget.output]);
}
const preparedCalls = new WeakMap<PreparedModelCall, { receiver: ModelTokenAccounting; input: ModelCallInput; count: ModelTokenAccounting['count']; serialize: ModelTokenAccounting['serialize'] }>();
function account(receiver: ModelTokenAccounting, input: ModelCallInput): PreparedModelCall {
  const identity = receiverIdentity(receiver);
  if (typeof input.instructions !== 'string' || typeof input.data !== 'string' || input.components.instructions !== input.instructions) throw new ModelContextUnavailable();
  const tokens = {} as Record<ModelComponent, number>;
  for (const key of MODEL_COMPONENTS) {
    if (typeof input.components[key] !== 'string') throw new ModelContextUnavailable();
    tokens[key] = integer(receiver.count(input.components[key]), input.components[key].length ? 1 : 0);
    if (tokens[key] > receiver.budget.components[key]) throw new ModelContextUnavailable();
  }
  const serializedInput = receiver.serialize({ instructions: input.instructions, data: input.data });
  if (typeof serializedInput !== 'string' || !serializedInput.length) throw new ModelContextUnavailable();
  const inputTokens = integer(receiver.count(serializedInput), 1);
  if (inputTokens + receiver.budget.output > receiver.capacity) throw new ModelContextUnavailable();
  return Object.freeze({ instructions: input.instructions, data: input.data, receiverIdentity: identity, serializedInput,
    inputTokens, outputTokens: receiver.budget.output, componentTokens: Object.freeze(tokens) });
}
// Shared classifier/future-generator gate. Evidence and handoff are independently
// budgeted, while the exact serialized input is always counted again as a whole.
export function prepareModelCall(receiver: ModelTokenAccounting, input: ModelCallInput): PreparedModelCall {
  const snapshot = Object.freeze({ ...input, components: Object.freeze({ ...input.components }) });
  const prepared = account(receiver, snapshot);
  preparedCalls.set(prepared, { receiver, input: snapshot, count: receiver.count, serialize: receiver.serialize });
  return prepared;
}
// Receiver-side integrity check; typed consumers must also bind their expected input below.
export function validateModelCallIntegrity(receiver: ModelTokenAccounting, prepared: PreparedModelCall): void {
  const saved = preparedCalls.get(prepared);
  if (!saved || saved.receiver !== receiver || saved.count !== receiver.count || saved.serialize !== receiver.serialize ||
    JSON.stringify(account(receiver, saved.input)) !== JSON.stringify(prepared)) throw new ModelContextUnavailable();
}

// The typed consumer derives expected from its actual request and trusted policy,
// independently of the envelope. Generic accounting cannot infer data semantics.
export function validatePreparedModelCall(receiver: ModelTokenAccounting, prepared: PreparedModelCall, expected: ModelCallInput): void {
  const saved = preparedCalls.get(prepared);
  if (!saved || !expected || saved.input.instructions !== expected.instructions || saved.input.data !== expected.data ||
    MODEL_COMPONENTS.some((key) => saved.input.components[key] !== expected.components[key])) throw new ModelContextUnavailable();
  validateModelCallIntegrity(receiver, prepared);
}
