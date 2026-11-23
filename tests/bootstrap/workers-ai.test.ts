import { isProxy } from 'node:util/types';
import { describe, expect, it, vi } from 'vitest';
import { selectProvider, WorkersAIRejected, WORKERS_AI_CANDIDATE, type FixtureInferenceBinding } from '../../src/adapters/llm/workers-ai.ts';
import { prepareProfessionalIntent } from '../../src/application/classify-professional-intent.ts';
import { DEFAULT_INTENT_BOUNDS, INTENT_REASONS, type ClassifyTurnRequest } from '../../src/shared/professional-intent.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET } from '../../src/shared/model-context-budget.ts';

const role = { model: WORKERS_AI_CANDIDATE, budget: DEFAULT_MODEL_CONTEXT_BUDGET } as const;
const request: ClassifyTurnRequest = { question: 'Synthetic question?', documentaryScope: { mode: 'global_public', resourceNames: [] },
  conversationContext: [], publicCatalog: [], languagePolicy: 'follow-current-question-or-explicit-request' };
function fixture() {
  const run = vi.fn<FixtureInferenceBinding['run']>();
  const config = { mode: 'workers-ai-offline', isProxy, binding: { kind: 'local-fixture', run }, classifier: role, generator: role } as const;
  const provider = selectProvider(config);
  return { config, provider, run, call: prepareProfessionalIntent(provider.receiver, request, DEFAULT_INTENT_BOUNDS) };
}

describe('offline Workers AI receiver boundary', () => {
  it('requires explicit complete config; neither bootstrapping nor rejected configuration infers', async () => {
    const { config, provider, run, call } = fixture();
    expect(await selectProvider().generate('bootstrap-ping')).toBe('Simulated LLM: bootstrap-pong');
    await expect(provider.generate('bootstrap-ping')).rejects.toThrow('configuration');
    for (const invalid of [null, {}, { ...config, mode: 'live' }, { ...config, binding: { run } }, { ...config, classifier: undefined },
      { ...config, generator: { ...role, model: 'other-model' } }, { ...config, classifier: { ...role, budget: { output: 5 } } }]) {
      const registerWorker = vi.fn();
      expect(() => registerWorker(selectProvider(invalid as typeof config))).toThrow(WorkersAIRejected);
      expect(registerWorker).not.toHaveBeenCalled();
    }
    await expect(provider.generateAnswer(call)).rejects.toThrow('configuration');
    await expect(selectProvider(config).classify(call)).rejects.toThrow('configuration');
    await expect(provider.classify({ ...call, serializedInput: '{}' })).rejects.toThrow('configuration');
    expect(run).not.toHaveBeenCalled();
  });
  it('accounts for exactly the binding payload, schema framing and output reserve', async () => {
    const { config, provider, run, call } = fixture();
    run.mockResolvedValue({ response: '{"fixture":"object"}', usage: 'ignored' });
    await provider.classify(call);
    const [model, wire] = run.mock.calls[0]!;
    expect(model).toBe(WORKERS_AI_CANDIDATE); expect(JSON.stringify(wire)).toBe(call.serializedInput);
    expect(call.inputTokens).toBe(Array.from(JSON.stringify(wire)).length);
    expect(wire).toMatchObject({ response_format: { type: 'json_schema', json_schema: { oneOf: expect.any(Array) } }, stream: false, max_tokens: call.outputTokens });
    const branches = (wire.response_format.json_schema as { oneOf: Array<{ properties: Record<string, { enum?: string[] }>; required: string[]; additionalProperties: boolean }> }).oneOf;
    expect(branches).toHaveLength(4);
    for (const [decision, reasons] of Object.entries(INTENT_REASONS)) {
      const branch = branches.find((b) => b.properties.decision?.enum?.[0] === decision)!;
      expect(branch.properties.reasonCode?.enum).toEqual(reasons);
      const keys = ['decision', 'reasonCode', 'responseLanguage', ...(decision === 'refuse' ? ['refusalMessage'] : decision === 'clarify' ? ['clarificationQuestion'] : ['professionalTopic', 'resolvedQuestion', 'searchTerms'])].sort();
      expect([...branch.required].sort()).toEqual(keys); expect(Object.keys(branch.properties).sort()).toEqual(keys); expect(branch.additionalProperties).toBe(false);
    }
    const tight = selectProvider({ ...config, classifier: { ...role, budget: { ...role.budget, output: 24001 - call.inputTokens } } });
    expect(() => prepareProfessionalIntent(tight.receiver, request, DEFAULT_INTENT_BOUNDS)).toThrow();
    expect(run).toHaveBeenCalledOnce();
  });
  it.each([
    [429, 3036, 'daily_quota'], [429, 3040, 'temporary_capacity'], [429, undefined, 'rate_limited'], [429, '3036', 'rate_limited'],
    [408, 3007, 'timeout'], [408, 3008, 'aborted'], [403, 5035, 'paid_required'], [500, 3036, 'unavailable'], [undefined, undefined, 'unavailable'],
  ] as const)('normalizes only structured numeric %s/%s, no retry or diagnostic leak', async (status, code, reason) => {
    const { provider, run, call } = fixture();
    run.mockRejectedValue({ status, code, message: '429/3036 RAW_FIXTURE', retryAfter: 'tomorrow' });
    const error = await provider.classify(call).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(WorkersAIRejected); expect(error).toMatchObject({ reason, message: reason });
    expect(JSON.stringify(error)).toBe(JSON.stringify({ reason })); expect(run).toHaveBeenCalledOnce();
  });
  it('normalizes proxy rejection without invoking descriptor traps', async () => {
    const { provider, run, call } = fixture(), trap = vi.fn();
    run.mockRejectedValue(new Proxy({}, { getOwnPropertyDescriptor: trap }));
    await expect(provider.classify(call)).rejects.toMatchObject({ reason: 'unavailable' }); expect(trap).not.toHaveBeenCalled();
  });
  it('accepts shared noncyclic JSON children like their serialized copies', async () => {
    const { provider, run, call } = fixture(), ids = ['S1'];
    run.mockResolvedValue({ response: { first: ids, second: ids } });
    await expect(provider.classify(call)).resolves.toEqual({ first: ids, second: ids });
  });
  it.each([null, 'RAW_FIXTURE', { response: 'not JSON' }, { response: '[]' }, { response: [] },
    { response: ' '.repeat(2000) + '{}' }, { response: '😀'.repeat(2001) }])('rejects unexpected or over-reservation output', async (raw) => {
    const { provider, run, call } = fixture(); run.mockResolvedValue(raw);
    await expect(provider.classify(call)).resolves.toBeNull(); expect(run).toHaveBeenCalledOnce();
  });
  it('rejects non-JSON data, accessors, hooks and exotic containers without invoking supplied code', async () => {
    const { provider, run, call } = fixture(), hook = vi.fn(() => 'should never execute');
    const cyclic: unknown[] = []; cyclic.push(cyclic);
    const proxy = new Proxy({}, { ownKeys: () => { hook(); return []; }, getPrototypeOf: () => { hook(); return Object.prototype; } });
    for (const response of [new Date(0), { extra: new Map() }, { toJSON: hook }, { get text() { return hook(); } },
      Object.defineProperty([], '0', { enumerable: true, get: hook }), Object.create({ inherited: 1 }),
      Object.defineProperty({}, 'hidden', { value: 1 }), { [Symbol('key')]: 1 }, { cyclic }, { nested: proxy },
      { bad: Infinity }, { bad: 2n }, { bad: undefined }, { sparse: new Array(1000000) }, { extra: Object.assign([], { appended: 5 }) },
      { oversized: '😀'.repeat(call.outputTokens) }, { escaped: '\n'.repeat(call.outputTokens / 2) },
      { wide: Array.from({ length: call.outputTokens }, () => 1) }, Array.from({ length: 30 }).reduce<object>((v) => ({ nested: v }), {})]) {
      run.mockResolvedValueOnce({ response });
      await expect(provider.classify(call)).resolves.toBeNull();
    }
    run.mockResolvedValueOnce(Object.defineProperty({}, 'response', { get: hook }));
    await expect(provider.classify(call)).resolves.toBeNull();
    expect(hook).not.toHaveBeenCalled();
  });
  it('accepts an exact-reservation object as detached JSON, rejects one more scalar', async () => {
    const { provider, run, call } = fixture();
    const response = { x: '😀'.repeat(call.outputTokens - '{"x":""}'.length) };
    run.mockResolvedValue({ response });
    const result = await provider.classify(call);
    expect(result).toEqual(response); expect(result).not.toBe(response);
    response.x += 'a'; await expect(provider.classify(call)).resolves.toBeNull();
    expect(run).toHaveBeenCalledTimes(2);
  });
  it('cancels before dispatch or while a binding ignores cancellation without a second call', async () => {
    const { provider, run, call } = fixture();
    const controller = new AbortController(); controller.abort();
    await expect(provider.classify(call, { signal: controller.signal })).rejects.toThrow('aborted'); expect(run).not.toHaveBeenCalled();
    run.mockImplementation(() => new Promise(() => {}));
    const active = new AbortController(), pending = provider.classify(call, { signal: active.signal }); active.abort();
    await expect(pending).rejects.toThrow('aborted'); expect(run.mock.calls[0]?.[2]?.signal).toBe(active.signal); expect(run).toHaveBeenCalledOnce();
  });
});
