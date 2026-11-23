import type { AnswerGenerator, ClassificationOptions, LLMProvider } from '../../ports/LLMProvider.ts';
import type { ModelContextBudget, ModelPrompt, ModelTokenAccounting, PreparedModelCall } from '../../ports/ModelTokenAccounting.ts';
import { INTENT_REASONS } from '../../shared/professional-intent.ts';
import { receiverIdentity, validateModelCallIntegrity } from '../../shared/model-context-budget.ts';
import { SimulatedLLMProvider } from './simulated.ts';

export const WORKERS_AI_CANDIDATE = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
type Role = 'classifier' | 'generator';
interface RoleConfig { model: typeof WORKERS_AI_CANDIDATE; budget: ModelContextBudget }
interface BindingInput {
  messages: [{ role: 'system'; content: string }, { role: 'user'; content: string }];
  response_format: { type: 'json_schema'; json_schema: object };
  stream: false;
  max_tokens: number;
}
// A real binding is deliberately not a valid fixture port.
export interface FixtureInferenceBinding {
  readonly kind: 'local-fixture';
  run(model: string, input: BindingInput, options?: ClassificationOptions): Promise<unknown>;
}
interface FixtureConfig {
  mode: 'workers-ai-offline'; binding: FixtureInferenceBinding; classifier: RoleConfig; generator: RoleConfig;
  // Supplied by the trusted fixture runtime (util.types.isProxy). Standard JS
  // reflection alone cannot distinguish a Proxy without executing its traps.
  isProxy: (value: unknown) => boolean;
}

type Failure = 'daily_quota' | 'temporary_capacity' | 'rate_limited' | 'timeout' | 'aborted' | 'paid_required' | 'unavailable' | 'invalid_output' | 'configuration';
export class WorkersAIRejected extends Error {
  constructor(readonly reason: Failure) { super(reason); }
}
// These pairs apply ONLY if the binding supplies structured numeric fields.
// Never infer an account-wide outage or a reset from diagnostic text/status alone.
function bindingFailure(error: unknown, isProxy: FixtureConfig['isProxy']): WorkersAIRejected {
  let reason: Failure = 'unavailable';
  try {
    if (isProxy(error)) return new WorkersAIRejected('unavailable');
    const status = Object.getOwnPropertyDescriptor(error, 'status')?.value;
    const code = Object.getOwnPropertyDescriptor(error, 'code')?.value;
    if (status === 429) reason = code === 3036 ? 'daily_quota' : code === 3040 ? 'temporary_capacity' : 'rate_limited';
    if (status === 408 && code === 3007) reason = 'timeout';
    if (status === 408 && code === 3008) reason = 'aborted';
    if (status === 403 && code === 5035) reason = 'paid_required';
  } catch { /* Non-object or uninspectable rejection. */ }
  return new WorkersAIRejected(reason);
}

const string = { type: 'string' };
const strings = { type: 'array', items: string };
function object(properties: Record<string, object>) {
  return { type: 'object', properties, required: Object.keys(properties), additionalProperties: false };
}
const schemas = {
  classifier: { type: 'object', oneOf: Object.entries(INTENT_REASONS).map(([decision, reasons]) => object({
    decision: { enum: [decision] }, reasonCode: { enum: reasons }, responseLanguage: string,
    ...(decision === 'refuse' ? { refusalMessage: string } : decision === 'clarify' ? { clarificationQuestion: string }
      : { professionalTopic: string, resolvedQuestion: string, searchTerms: strings }),
  })) },
  generator: object({ status: { enum: ['answered', 'partial', 'refused', 'failed'] }, outputLanguage: string,
    blocks: { type: 'array', items: object({ kind: { enum: ['paragraph', 'summary', 'limitation', 'refusal', 'transition', 'error'] }, text: string, sourceIds: strings }) } }),
};
function receiver(role: Role, config: RoleConfig): ModelTokenAccounting {
  if (config?.model !== WORKERS_AI_CANDIDATE || !config.budget) throw new WorkersAIRejected('configuration');
  const budget = Object.freeze({ output: config.budget.output, components: Object.freeze({ ...config.budget.components }) });
  const descriptor = Object.freeze({ model: config.model, modelVersion: 'offline-candidate', tokenizer: 'fixture-unicode-scalar', tokenizerVersion: '1',
    capacity: 24000, maximumOutput: budget.output, serializationVersion: `workers-ai-${role}-schema-v1`, budget,
    count: (text: string) => Array.from(text).length,
    serialize: ({ instructions, data }: ModelPrompt) => JSON.stringify({ messages: [{ role: 'system', content: instructions }, { role: 'user', content: data }],
      stream: false, response_format: { type: 'json_schema', json_schema: schemas[role] }, max_tokens: budget.output } satisfies BindingInput),
  });
  try { receiverIdentity(descriptor); } catch { throw new WorkersAIRejected('configuration'); }
  return descriptor;
}

// Never stringify a provider object. Construct bounded JSON from data descriptors
// and primitive spellings, and hand the core a detached ordinary JSON object.
function decode(raw: unknown, descriptor: ModelTokenAccounting, reservation: number, isProxy: FixtureConfig['isProxy']): object {
  const invalid = (): never => { throw new WorkersAIRejected('invalid_output'); };
  const plain = (value: object) => {
    if (isProxy(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  };
  try {
    if (!raw || typeof raw !== 'object' || !plain(raw)) return invalid();
    let value: unknown = Object.getOwnPropertyDescriptor(raw, 'response')?.value;
    if (typeof value === 'string') {
      if (value.length > 2 * reservation || descriptor.count(value) > reservation) return invalid();
      value = JSON.parse(value);
    }
    if (!value || typeof value !== 'object' || !plain(value)) return invalid();
    const parts: string[] = [], seen = new WeakSet<object>();
    let remaining = reservation;
    function append(part: string) {
      remaining -= descriptor.count(part); // Additive only for this offline scalar receiver.
      if (remaining < 0) invalid();
      parts.push(part);
    }
    function quoted(text: string) {
      if (text.length > 2 * remaining) invalid(); // Bound escaping even for a pre-decoded object.
      append(JSON.stringify(text));
    }
    function visit(node: unknown, depth: number) {
      if (node === null || typeof node === 'boolean' || (typeof node === 'number' && Number.isFinite(node))) return append(JSON.stringify(node));
      if (typeof node === 'string') return quoted(node);
      if (typeof node !== 'object' || node === null || isProxy(node) || seen.has(node) || depth > 8) return invalid();
      seen.add(node);
      const array = Array.isArray(node);
      if (array ? Object.getPrototypeOf(node) !== Array.prototype || node.length > remaining : !plain(node)) return invalid();
      append(array ? '[' : '{');
      const keys = Reflect.ownKeys(node);
      if (keys.length > remaining + 1 || (array && keys.length !== node.length + 1)) return invalid();
      let index = 0;
      for (const key of keys) {
        if (array && key === 'length') continue;
        if (typeof key !== 'string' || (array && key !== String(index))) return invalid();
        const field = Object.getOwnPropertyDescriptor(node, key);
        if (!field?.enumerable || !Object.hasOwn(field, 'value')) return invalid();
        if (index++) append(',');
        if (!array) { quoted(key); append(':'); }
        visit(field.value, depth + 1);
      }
      append(array ? ']' : '}');
      seen.delete(node); // Only an active ancestor is a cycle.
    }
    visit(value, 0);
    return JSON.parse(parts.join('')); // Core owns the complete role-specific schema checks.
  } catch { return invalid(); }
}

function workersAIFixture(config: FixtureConfig): LLMProvider & AnswerGenerator {
  if (config?.mode !== 'workers-ai-offline' || config.binding?.kind !== 'local-fixture' || typeof config.binding.run !== 'function' || typeof config.isProxy !== 'function') throw new WorkersAIRejected('configuration');
  const run = config.binding.run.bind(config.binding), isProxy = config.isProxy;
  const classifier = receiver('classifier', config.classifier), generator = receiver('generator', config.generator);
  async function invoke(descriptor: ModelTokenAccounting, call: PreparedModelCall, { signal }: ClassificationOptions = {}) {
    try { validateModelCallIntegrity(descriptor, call); } catch { throw new WorkersAIRejected('configuration'); }
    if (signal?.aborted) throw new WorkersAIRejected('aborted');
    // Consume the same bytes the role receiver accounted. Nothing from the
    // caller's request, environment or binding is spread into model input.
    const payload: BindingInput = JSON.parse(call.serializedInput);
    let abort: (() => void) | undefined;
    let raw: unknown;
    try {
      const pending = run(descriptor.model, payload, signal ? { signal } : undefined);
      if (!signal) raw = await pending;
      else {
        const cancelled = new Promise<never>((_, reject) => {
          abort = () => reject(new WorkersAIRejected('aborted'));
          if (signal.aborted) abort();
          else signal.addEventListener('abort', abort, { once: true });
        });
        raw = await Promise.race([pending, cancelled]);
      }
    } catch (error) { throw signal?.aborted ? new WorkersAIRejected('aborted') : bindingFailure(error, isProxy); }
    finally { if (abort) signal?.removeEventListener('abort', abort); }
    if (signal?.aborted) throw new WorkersAIRejected('aborted');
    // A completed but invalid response is not a transport outage. Both core
    // validators reject null as invalid_result without exposing provider data.
    try { return decode(raw, descriptor, call.outputTokens, isProxy); }
    catch { return null; }
  }
  return Object.freeze({ receiver: classifier, answerReceiver: generator,
    generate: async () => { throw new WorkersAIRejected('configuration'); },
    classify: (call: PreparedModelCall, options?: ClassificationOptions) => invoke(classifier, call, options),
    generateAnswer: (call: PreparedModelCall, options?: ClassificationOptions) => invoke(generator, call, options),
  });
}
export function selectProvider(): SimulatedLLMProvider;
export function selectProvider(config: FixtureConfig): LLMProvider & AnswerGenerator;
export function selectProvider(config?: FixtureConfig): LLMProvider {
  return config === undefined ? new SimulatedLLMProvider() : workersAIFixture(config);
}
