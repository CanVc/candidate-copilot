import { describe, expect, it, vi } from 'vitest';
import { deterministicReceiver } from '../../src/adapters/llm/deterministic-accounting.ts';
import { ScriptedLLMProvider } from '../../src/adapters/llm/scripted.ts';
import { classifyProfessionalIntent, prepareProfessionalIntent, professionalIntentInput } from '../../src/application/classify-professional-intent.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET, MODEL_COMPONENTS, prepareModelCall, validatePreparedModelCall } from '../../src/shared/model-context-budget.ts';
import { intentBounds, type ClassifyTurnRequest } from '../../src/shared/professional-intent.ts';
import type { ModelCallInput, ModelComponent, ModelTokenAccounting } from '../../src/ports/ModelTokenAccounting.ts';

const input = (overrides: Partial<ModelCallInput['components']> = {}): ModelCallInput => {
  const components = { instructions: 'Policy', question: 'é😀\n"\\企业', history: '', catalog: '', evidence: 'current evidence', handoff: 'answer en', ...overrides };
  const { instructions, ...data } = components;
  return { instructions, data: JSON.stringify(data), components };
};
const request: ClassifyTurnRequest = { question: 'Please answer in English.', documentaryScope: { mode: 'global_public', resourceNames: [] },
  conversationContext: [], publicCatalog: [], languagePolicy: 'follow-current-question-or-explicit-request' };
const profile = (component: ModelComponent, bound: number) => deterministicReceiver('scalar-v1', { budget: {
  ...DEFAULT_MODEL_CONTEXT_BUDGET, components: { ...DEFAULT_MODEL_CONTEXT_BUDGET.components, [component]: bound },
} });

describe('model-context-budget receiver-bound exact preflight', () => {
  it.each([['', 0, 0], ['a', 1, 1], ['abc', 3, 2], ['é😀企业', 4, 2], ['e\u0301\n"\\', 5, 3]] as const)('local tokenizer golden vector %j (not provider tokens)', (text, scalar, pair) => {
    expect(deterministicReceiver('scalar-v1').count(text)).toBe(scalar);
    expect(deterministicReceiver('scalar-pair-v1').count(text)).toBe(pair);
  });
  it('accepts exactly 3000 history tokens, rejects 3001 and respects configured caps', () => {
    expect(prepareModelCall(profile('history', 3000), input({ history: 'x'.repeat(3000) })).componentTokens.history).toBe(3000);
    expect(() => prepareModelCall(profile('history', 3000), input({ history: 'x'.repeat(3001) }))).toThrow();
    expect(prepareModelCall(profile('history', 7), input({ history: 'x'.repeat(7) })).componentTokens.history).toBe(7);
    expect(() => prepareModelCall(profile('history', 7), input({ history: 'x'.repeat(8) }))).toThrow();
    expect(DEFAULT_MODEL_CONTEXT_BUDGET.components.history).toBe(3000);
  });
  it('counts the actual serialized classifier history at exactly 3000/3001', async () => {
    const history = [{ role: 'user' as const, text: 'x' }, { role: 'assistant' as const, text: 'Which project?' }];
    history[0]!.text = 'x'.repeat(3001 - Array.from(JSON.stringify(history)).length);
    const exact = { ...request, conversationContext: history };
    const script = vi.fn(async () => ({ decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: 'en', clarificationQuestion: 'Which project?' }));
    const provider = new ScriptedLLMProvider(script, deterministicReceiver('scalar-v1'));
    expect(prepareProfessionalIntent(provider.receiver, exact, intentBounds()).componentTokens.history).toBe(3000);
    expect((await classifyProfessionalIntent(provider, exact)).kind).toBe('direct');
    history[0]!.text += 'x';
    expect(await classifyProfessionalIntent(provider, exact)).toEqual({ kind: 'limit' });
    expect(script).toHaveBeenCalledTimes(1);
  });
  it.each(MODEL_COMPONENTS)('independently bounds %s, including generation evidence/handoff and trusted policy', (key) => {
    const value = input({ [key]: 'x'.repeat(10) });
    const { instructions, ...data } = value.components;
    expect(value.instructions).toBe(instructions); expect(JSON.parse(value.data)).toEqual(data);
    expect(prepareModelCall(profile(key, 10), value).componentTokens[key]).toBe(10);
    expect(() => prepareModelCall(profile(key, 9), value)).toThrow();
  });
  it('counts exact assembled multilingual/escaped framing, with independent output reservation', () => {
    const receiver = deterministicReceiver('scalar-v1');
    const call = prepareModelCall(receiver, input());
    expect(call.serializedInput).toBe(JSON.stringify({ version: 1, messages: [{ role: 'system', content: 'Policy' },
      { role: 'user', content: input().data }], responseFormat: 'json' }));
    const { instructions: _instructions, ...projectedData } = input().components;
    expect(JSON.parse(call.data)).toEqual(projectedData);
    expect(call.inputTokens).toBe(Array.from(call.serializedInput).length);
    expect(call.inputTokens).toBeGreaterThan(Object.values(call.componentTokens).reduce((a, b) => a + b, 0));
    const capacity = call.inputTokens + call.outputTokens;
    expect(prepareModelCall(deterministicReceiver('scalar-v1', { capacity, maximumOutput: call.outputTokens }), input()).inputTokens).toBe(call.inputTokens);
    expect(() => prepareModelCall(deterministicReceiver('scalar-v1', { capacity: capacity - 1, maximumOutput: call.outputTokens }), input())).toThrow();
    expect(() => prepareModelCall(deterministicReceiver('scalar-v1', { maximumOutput: call.outputTokens - 1 }), input())).toThrow();
  });
  it('recounts for another receiving model and never reuses a classifier envelope for generation', () => {
    const a = deterministicReceiver('scalar-v1'), b = deterministicReceiver('scalar-pair-v1');
    const first = prepareModelCall(a, input()), second = prepareModelCall(b, input());
    expect(first.inputTokens).toBeGreaterThan(second.inputTokens);
    expect(() => validatePreparedModelCall(b, first, input())).toThrow();
    expect(() => validatePreparedModelCall(a, second, input())).toThrow();
    expect(() => validatePreparedModelCall(b, second, input())).not.toThrow();
    expect(() => prepareModelCall(a, input({ history: 'x'.repeat(3001) }))).toThrow();
    expect(prepareModelCall(b, input({ history: 'x'.repeat(3001) })).componentTokens.history).toBe(1501);
  });
  it.each([NaN, Infinity, -1, 0, 0.5, undefined])('fails closed on invalid counts %s', (count) => {
    expect(() => prepareModelCall({ ...deterministicReceiver(), count: () => count as number }, input())).toThrow();
  });
  it('checks whole-input counts independently of component counts', () => {
    const receiver = deterministicReceiver();
    expect(() => prepareModelCall({ ...receiver, count: (text) => text === receiver.serialize(input()) ? 0 : 1 }, input())).toThrow();
  });
  it.each(['model', 'modelVersion', 'tokenizer', 'tokenizerVersion', 'serializationVersion', 'capacity', 'maximumOutput', 'budget', 'count', 'serialize'])('requires valid %s', (key) => {
    expect(() => prepareModelCall({ ...deterministicReceiver(), [key]: undefined } as unknown as ModelTokenAccounting, input())).toThrow();
  });
  it.each([0, -1, NaN, Infinity, 1.5])('rejects invalid capacities/budgets %s', (n) => {
    const receiver = deterministicReceiver();
    for (const key of ['capacity', 'maximumOutput']) expect(() => prepareModelCall({ ...receiver, [key]: n }, input())).toThrow();
    for (const key of MODEL_COMPONENTS) expect(() => prepareModelCall(profile(key, n), input())).toThrow();
    expect(() => prepareModelCall({ ...receiver, budget: { ...receiver.budget, output: n } }, input())).toThrow();
  });
  it('freezes exact payload, counts and reservation; rejects clones and descriptor changes at dispatch', () => {
    const receiver = { ...deterministicReceiver() };
    const value = input(), call = prepareModelCall(receiver, value);
    expect(Object.isFrozen(call)).toBe(true); expect(Object.isFrozen(call.componentTokens)).toBe(true);
    expect(() => Object.assign(call, { data: 'mutated' })).toThrow();
    expect(() => Object.assign(call, { outputTokens: 1 })).toThrow();
    expect(() => validatePreparedModelCall(receiver, { ...call, outputTokens: 1 }, input())).toThrow();
    expect(() => validatePreparedModelCall(receiver, { ...call }, input())).toThrow();
    Object.assign(value, { data: 'mutated after preparation' });
    expect(() => validatePreparedModelCall(receiver, call, input())).not.toThrow();
    receiver.modelVersion = '2'; expect(() => validatePreparedModelCall(receiver, call, input())).toThrow();
    receiver.modelVersion = '1'; receiver.serialize = () => 'different framing';
    expect(() => validatePreparedModelCall(receiver, call, input())).toThrow();
  });
  it('detects stateful/replaced counters even if descriptor labels stay the same', () => {
    let extra = 0;
    const receiver = { ...deterministicReceiver(), count: (text: string) => Array.from(text).length + extra };
    const call = prepareModelCall(receiver, input()); extra++;
    expect(() => validatePreparedModelCall(receiver, call, input())).toThrow(); extra--;
    receiver.count = (text) => Array.from(text).length;
    expect(() => validatePreparedModelCall(receiver, call, input())).toThrow();
  });
  it('classifier refuses absent accounting, mismatched receiver, mutated prompt and aggregate overflow with zero calls', async () => {
    const script = vi.fn(), provider = new ScriptedLLMProvider(script);
    const call = prepareProfessionalIntent(provider.receiver, request, intentBounds());
    expect(await classifyProfessionalIntent(new ScriptedLLMProvider(script), request, intentBounds(), [], {}, call)).toEqual({ kind: 'limit' });
    expect(await classifyProfessionalIntent(provider, { ...request, question: 'changed' }, intentBounds(), [], {}, call)).toEqual({ kind: 'limit' });
    expect(await classifyProfessionalIntent({ ...provider, receiver: undefined } as unknown as ScriptedLLMProvider, request)).toEqual({ kind: 'limit' });
    const small = new ScriptedLLMProvider(script, deterministicReceiver('scalar-v1', { capacity: 4000 }));
    expect(await classifyProfessionalIntent(small, request)).toEqual({ kind: 'limit' });
    expect(script).not.toHaveBeenCalled();
  });
  it.each(['question', 'history', 'catalog', 'handoff'] as const)('binds genuine classifier envelopes to actual %s projection, not supplied component text', async (component) => {
    const script = vi.fn();
    const provider = new ScriptedLLMProvider(script, profile(component, 1));
    const expected = professionalIntentInput({ ...request, conversationContext: [{ role: 'user', text: 'Actual history' }, { role: 'assistant', text: 'Prior reply' }],
      publicCatalog: [{ topic: 'Actual public topic', aliases: [] }] }, intentBounds());
    const forged = prepareModelCall(provider.receiver, { ...expected, components: { ...expected.components, [component]: '' } });
    expect(await classifyProfessionalIntent(provider, JSON.parse(expected.data), intentBounds(), [], {}, forged)).toEqual({ kind: 'limit' });
    expect(script).not.toHaveBeenCalled();
  });
  it.each(['evidence', 'handoff'] as const)('future generation consumption requires independent expected %s projection', (component) => {
    const receiver = profile(component, 1), expected = input();
    const forged = prepareModelCall(receiver, { ...expected, components: { ...expected.components, [component]: '' } });
    expect(() => validatePreparedModelCall(receiver, forged, expected)).toThrow();
    expect(() => validatePreparedModelCall(receiver, forged, undefined as never)).toThrow();
  });
  it('rejects forged nonempty evidence projection for the evidence-free classifier', async () => {
    const script = vi.fn(), provider = new ScriptedLLMProvider(script);
    const expected = professionalIntentInput(request, intentBounds());
    const forged = prepareModelCall(provider.receiver, { ...expected, components: { ...expected.components, evidence: 'old attachment' } });
    expect(await classifyProfessionalIntent(provider, request, intentBounds(), [], {}, forged)).toEqual({ kind: 'limit' });
    expect(script).not.toHaveBeenCalled();
  });
  it('enforces the actual serialized multilingual question component exactly, not its raw length', async () => {
    const actual = { ...request, question: 'é😀\n"\\企业' };
    const count = deterministicReceiver('scalar-v1').count(JSON.stringify(actual.question));
    const script = vi.fn(async () => ({ decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: 'en', clarificationQuestion: 'Which project?' }));
    const exact = new ScriptedLLMProvider(script, profile('question', count));
    expect(prepareProfessionalIntent(exact.receiver, actual, intentBounds()).componentTokens.question).toBe(count);
    expect((await classifyProfessionalIntent(exact, actual)).kind).toBe('direct');
    expect(await classifyProfessionalIntent(new ScriptedLLMProvider(script, profile('question', count - 1)), actual)).toEqual({ kind: 'limit' });
    expect(script).toHaveBeenCalledTimes(1);
  });

  it('enforces exact serialized scripted output tokens and rejects one-token overrun without retry', async () => {
    const output = { decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: 'en', clarificationQuestion: 'Which é😀 project?' };
    const tokens = deterministicReceiver('scalar-v1').count(JSON.stringify(output));
    for (const reservation of [tokens, tokens - 1]) {
      const script = vi.fn(async () => output), provider = new ScriptedLLMProvider(script, deterministicReceiver('scalar-v1', {
        budget: { ...DEFAULT_MODEL_CONTEXT_BUDGET, output: reservation },
      }));
      const result = await classifyProfessionalIntent(provider, request);
      if (reservation === tokens) expect(result).toMatchObject({ kind: 'direct', draft: { blocks: [{ text: output.clarificationQuestion }] } });
      else expect(result).toEqual({ kind: 'failure', failure: 'invalid_result' });
      expect(script).toHaveBeenCalledTimes(1);
      expect(output.clarificationQuestion).toBe('Which é😀 project?');
    }
  });
  it.each([undefined, null, 'not JSON', 1n, { decision: 'invalid' }])('keeps malformed scripted output %s a controlled invalid result', async (output) => {
    const script = vi.fn(async () => output);
    expect(await classifyProfessionalIntent(new ScriptedLLMProvider(script), request)).toEqual({ kind: 'failure', failure: 'invalid_result' });
    expect(script).toHaveBeenCalledTimes(1);
  });
  it('rejects cyclic scripted output without exposing serialization errors or retrying', async () => {
    const output: Record<string, unknown> = {}; output.self = output;
    const script = vi.fn(async () => output);
    expect(await classifyProfessionalIntent(new ScriptedLLMProvider(script), request)).toEqual({ kind: 'failure', failure: 'invalid_result' });
    expect(script).toHaveBeenCalledTimes(1);
  });

});
