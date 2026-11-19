import { describe, expect, it, vi } from 'vitest';
import { contextFallbackLanguage, resolveConversationContext, selectConversationExchanges } from '../../src/application/conversation-context.ts';
import { prepareProfessionalIntent, professionalIntentInput } from '../../src/application/classify-professional-intent.ts';
import { ModelAwareIntentPreparation, ProfessionalIntentProcessor, type ProfessionalIntentContinuation } from '../../src/application/professional-intent-processor.ts';
import { deterministicReceiver } from '../../src/adapters/llm/deterministic-accounting.ts';
import { ScriptedLLMProvider } from '../../src/adapters/llm/scripted.ts';
import { completeResult, controlledFailure } from '../../src/shared/conversation-result.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET, prepareModelCall } from '../../src/shared/model-context-budget.ts';
import { CONTEXT_RESTATEMENT, intentBounds, type ClassifyTurnRequest } from '../../src/shared/professional-intent.ts';
import type { AdmittedMessage, AdmissionState } from '../../src/shared/conversation-admission.ts';
import type { ModelTokenAccounting, ModelCallInput } from '../../src/ports/ModelTokenAccounting.ts';
import type { PublicPublication } from '../../src/ports/ResourceCatalog.ts';

function message(id: string, question = `Question ${id}`): AdmittedMessage {
  return { messageId: id, requestId: `request-${id}`, question, contextAnchorMessageId: id, createdAt: '2026-01-01T00:00:00Z',
    submissionIdentity: { kind: 'direct', question, resourceIds: [], catalogRevision: 'a'.repeat(40), catalogHash: 'b'.repeat(64) },
    submittedScope: { version: 1, mode: 'global_public', catalogRevision: 'a'.repeat(40), catalogHash: 'b'.repeat(64), resources: [], eligibleDocumentIds: ['doc'] } };
}
function exchange(id: string, status: 'clarification' | 'refused' = 'clarification', question = `Original ${id}`, text = `Which ${id}?`): AdmittedMessage {
  const turn = message(id, question);
  turn.result = completeResult(turn, { status, language: 'en', blocks: [{ kind: status === 'clarification' ? 'clarification' : 'refusal', text, sourceIds: [] }] }, []);
  return turn;
}
const context = (precedingMessages: AdmittedMessage[]) => ({ precedingMessages, contextAvailable: true });
const publication: PublicPublication = { catalogRevision: 'a'.repeat(40), catalogHash: 'b'.repeat(64), catalogAssetPath: `/assets/resources-catalog.${'b'.repeat(64)}.json`,
  catalog: { version: 1, catalogRevision: 'a'.repeat(40), resources: [], documents: [{ documentId: 'doc', sourcePath: 'content/public/doc.md' }] }, documents: [], chunks: [] };
function fixture(receiver: ModelTokenAccounting = deterministicReceiver(), bounds = intentBounds()) {
  const script = vi.fn(async (_prompt: { data: string }) => ({ decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: 'fr', clarificationQuestion: 'Quel projet ?' }));
  const provider = new ScriptedLLMProvider(script, receiver);
  const catalog = { readSnapshot: vi.fn(async () => publication) };
  const preparation = new ModelAwareIntentPreparation(catalog, provider, bounds);
  const continuation = { continue: vi.fn<ProfessionalIntentContinuation['continue']>() };
  return { script, provider, preparation, catalog, processor: new ProfessionalIntentProcessor(provider, preparation, continuation, bounds), continuation };
}
function historyReceiver(cap: number, profile: 'scalar-v1' | 'scalar-pair-v1' = 'scalar-v1') {
  return deterministicReceiver(profile, { budget: { ...DEFAULT_MODEL_CONTEXT_BUDGET, components: { ...DEFAULT_MODEL_CONTEXT_BUDGET.components, history: cap } } });
}

const answerClassification = { decision: 'answer', reasonCode: 'professional_question', responseLanguage: 'en', professionalTopic: 'Architecture', resolvedQuestion: 'Which decisions?', searchTerms: ['architecture'] };
const pairs = (turns: AdmittedMessage[]): ClassifyTurnRequest['conversationContext'] => turns.flatMap((turn) => [
  { role: 'user', text: turn.question }, { role: 'assistant', text: turn.result!.blocks.map((block) => block.text).join('\n') },
]);
function generationInput(question: string, history: ClassifyTurnRequest['conversationContext'],
  allocation = { evidence: 'Eligible passage', handoff: 'answer/en' }): ModelCallInput {
  const data = { question, history, catalog: [], evidence: allocation.evidence, handoff: allocation.handoff };
  const instructions = 'Generation policy';
  return { instructions, data: JSON.stringify(data), components: { instructions, question: JSON.stringify(question), history: JSON.stringify(history),
    catalog: JSON.stringify(data.catalog), evidence: JSON.stringify(data.evidence), handoff: JSON.stringify(data.handoff) } };
}

describe('conversation-context whole exchanges and indispensable clarification chains', () => {
  it('preserves original and every consecutive model clarification, once and in chronology', async () => {
    const original = exchange('original', 'clarification', 'Explain the architecture decision'), reply = exchange('reply', 'clarification', 'That project');
    const f = fixture(); const current = message('current', 'The second one. Answer in English.');
    await f.processor.process(current, context([original, reply]));
    const data = JSON.parse(f.script.mock.calls[0]![0].data);
    expect(data.question).toBe(current.question);
    expect(data.conversationContext).toEqual([original, reply].flatMap((t) => [{ role: 'user', text: t.question }, { role: 'assistant', text: t.result!.blocks[0]!.text }]));
    expect(f.script).toHaveBeenCalledTimes(1);
  });
  it('reserves an entire pending chain before optional older turns and never partially trims it', async () => {
    const turns = [exchange('old', 'refused', 'Old topic', 'Old reply'), exchange('original'), exchange('short')];
    const chain = turns.slice(1).flatMap((t) => [{ role: 'user', text: t.question }, { role: 'assistant', text: t.result!.blocks[0]!.text }]);
    const cap = Array.from(JSON.stringify(chain)).length;
    const f = fixture(historyReceiver(cap));
    const ready = await f.preparation.prepare(message('current'), context(turns));
    expect(ready.kind === 'ready' && ready.request.conversationContext).toEqual(chain);
    const rejected = fixture(historyReceiver(cap - 1));
    expect(await rejected.processor.process(message('current'), context(turns))).toMatchObject({ contextReset: true, draft: { status: 'clarification', language: 'en' } });
    expect(rejected.script).not.toHaveBeenCalled(); expect(rejected.continuation.continue).not.toHaveBeenCalled();
  });
  it.each(['missing', 'control', 'unicode', 'individual-size', 'aggregate-size'])('unusable indispensable %s never substitutes older context', async (kind) => {
    const original = exchange('original'), recent = exchange('short');
    if (kind === 'missing') delete recent.result;
    if (kind === 'control') original.question = 'bad\u0001';
    if (kind === 'unicode') original.question = '\ud800';
    if (kind === 'individual-size') original.question = 'x'.repeat(12001);
    const f = fixture(historyReceiver(kind === 'aggregate-size' ? 110 : 3000));
    const output = await f.processor.process(message('current'), context([exchange('old', 'refused'), original, recent]));
    expect(output).toMatchObject({ contextReset: true, draft: { status: 'clarification' } });
    expect(f.script).not.toHaveBeenCalled(); expect(f.continuation.continue).not.toHaveBeenCalled();
  });
  it('does not infer reset from exact local-template text in unmarked model or legacy output', async () => {
    const poison = exchange('poison', 'clarification', 'bad\u0001');
    const mimic = exchange('mimic', 'clarification', 'Clean', CONTEXT_RESTATEMENT.en);
    const f = fixture();
    expect(await f.preparation.prepare(message('current'), context([poison, mimic]))).toEqual({ kind: 'missing_context', contextReset: true });
    mimic.contextReset = true;
    const prepared = await f.preparation.prepare(message('current'), context([poison, mimic]));
    expect(prepared.kind === 'ready' && prepared.request.conversationContext).toEqual([{ role: 'user', text: 'Clean' }, { role: 'assistant', text: CONTEXT_RESTATEMENT.en }]);
  });
  it('an unusable marked pair asks again; a clean marked reformulation recovers without poison', async () => {
    const f = fixture(), poison = exchange('poison', 'clarification', 'bad\u0001', CONTEXT_RESTATEMENT.fr); poison.contextReset = true;
    const clean = message('clean', 'Reformulated architecture question');
    const output = await f.processor.process(clean, context([poison]));
    expect(output).toMatchObject({ contextReset: true, draft: { status: 'clarification' } });
    if (!('draft' in output)) throw new Error('Expected local clarification');
    clean.result = completeResult(clean, output.draft, []); clean.contextReset = output.contextReset === true;
    await f.processor.process(message('reply'), context([poison, clean]));
    expect(f.script).toHaveBeenCalledTimes(1);
    expect(f.continuation.continue).not.toHaveBeenCalled();
  });
  it('keeps immutable current language/topic bytes, never includes old attachments, IDs or scope as evidence', async () => {
    const previous = exchange('old', 'refused');
    previous.result!.sourceExcerpts.push({ excerpt: 'ATTACHMENT_SECRET' } as never);
    previous.submittedScope.eligibleDocumentIds.push('outside');
    const f = fixture(), current = message('current', '  Nouveau sujet 😀\r\nPlease answer in English.  ');
    const prepared = await f.preparation.prepare(current, context([previous]));
    if (prepared.kind !== 'ready') throw new Error('Expected ready');
    expect(prepared.request.question).toBe(current.question);
    expect(prepared.request.languagePolicy).toBe('follow-current-question-or-explicit-request');
    for (const text of ['ATTACHMENT_SECRET', 'request-old', 'eligibleDocumentIds', 'outside', 'sourceExcerpts']) expect(prepared.call!.data).not.toContain(text);
    expect(current.submittedScope.eligibleDocumentIds).toEqual(['doc']);
  });
  it('rejects model-authored reset and strips downstream reset provenance without widening current scope', async () => {
    const f = fixture(), current = message('current'), old = exchange('old', 'refused');
    old.submittedScope.eligibleDocumentIds.push('outside');
    f.script.mockResolvedValue({ decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: 'en', clarificationQuestion: CONTEXT_RESTATEMENT.en, contextReset: true } as never);
    expect(await f.processor.process(current, context([old]))).toEqual({ failure: 'invalid_result' });
    f.script.mockResolvedValue({ decision: 'answer', reasonCode: 'professional_question', responseLanguage: 'en', professionalTopic: 'Architecture', resolvedQuestion: 'Which decisions?', searchTerms: ['architecture'] } as never);
    f.continuation.continue.mockResolvedValue({ draft: { status: 'clarification', language: 'en', blocks: [{ kind: 'clarification', text: CONTEXT_RESTATEMENT.en, sourceIds: [] }] }, sources: [], contextReset: true });
    const result = await f.processor.process(current, context([old]));
    expect(result).not.toHaveProperty('contextReset');
    expect(f.continuation.continue).toHaveBeenCalledWith(expect.objectContaining({ submittedScope: current.submittedScope }));
    expect(current.submittedScope.eligibleDocumentIds).toEqual(['doc']);
  });
  it('reselects canonical attachment-free pairs through the real continuation for a different receiver, preserving chain/reset', async () => {
    const beforeReset = exchange('excluded-id', 'refused', 'PRE_RESET_TOPIC');
    const reset = exchange('reset-id', 'clarification', 'Clean restatement', CONTEXT_RESTATEMENT.en); reset.contextReset = true;
    const resolved = exchange('resolved-id', 'refused', 'Resolved topic', 'Resolved reply');
    const original = exchange('original-id', 'clarification', 'x'.repeat(400), 'Which decision?');
    const failed = message('failed-id', 'That decision'); failed.result = controlledFailure(failed, 'processing_unavailable', 'en');
    const later = exchange('later-id');
    original.result!.sourceExcerpts.push({ excerpt: 'OLD_ATTACHMENT' } as never);
    const turns = [beforeReset, reset, resolved, original, failed, later], required = pairs(turns.slice(3));
    const cap = Array.from(JSON.stringify(required)).length;
    const f = fixture(historyReceiver(cap));
    f.script.mockResolvedValue(answerClassification as never);
    f.continuation.continue.mockImplementation(async (input) => {
      expect(input.conversationContext).toEqual(required); // classifier already pruned optional pairs
      const select = (receiver: ModelTokenAccounting) => input.selectConversationContext((history) => {
        for (const pair of history) expect(Object.keys(pair).sort()).toEqual(['role', 'text']);
        const call = generationInput(input.question, history);
        expect(JSON.parse(call.data).question).toBe(input.question);
        try { prepareModelCall(receiver, call); return true; } catch { return false; }
      });
      expect(select(historyReceiver(cap))).toEqual(required);
      const expanded = select(historyReceiver(cap, 'scalar-pair-v1'));
      expect(expanded).toEqual(pairs(turns.slice(1)));
      for (const marker of ['PRE_RESET_TOPIC', 'OLD_ATTACHMENT', 'original-id', 'eligibleDocumentIds', 'sourceExcerpts']) expect(JSON.stringify(expanded)).not.toContain(marker);
      return { failure: 'scope_unavailable' };
    });
    expect(await f.processor.process(message('current', 'Current question 😀'), context(turns))).toEqual({ failure: 'scope_unavailable', language: 'en' });
    expect(f.script).toHaveBeenCalledTimes(1); expect(f.continuation.continue).toHaveBeenCalledTimes(1);
  });
  it.each(['evidence', 'handoff', 'output'] as const)('continuation uses exact aggregate capacity for %s reservation, omitting optional pairs or rejecting required pairs', async (component) => {
    const turns = [exchange('optional', 'refused'), exchange('required')], required = pairs(turns.slice(1));
    const f = fixture(); f.script.mockResolvedValue(answerClassification as never);
    f.continuation.continue.mockImplementation(async (input) => {
      const base = { evidence: 'Eligible passage', handoff: 'answer/en', output: 100 };
      const reserved = { ...base, [component]: component === 'output' ? 1500 : 'x'.repeat(1500) };
      const budget = (output: number) => ({ components: { instructions: 100000, question: 100000, history: 100000, catalog: 100000, evidence: 100000, handoff: 100000 }, output });
      const requiredInput = generationInput(input.question, required, reserved);
      const roomy = deterministicReceiver('scalar-v1', { budget: budget(reserved.output), maximumOutput: reserved.output });
      const requiredCall = prepareModelCall(roomy, requiredInput), capacity = requiredCall.inputTokens + requiredCall.outputTokens;
      const select = (capacity: number, allocation = reserved) => {
        const receiver = deterministicReceiver('scalar-v1', { capacity, maximumOutput: allocation.output, budget: budget(allocation.output) });
        return input.selectConversationContext((history) => {
          const actual = generationInput(input.question, history, allocation);
          const data = JSON.parse(actual.data);
          expect(data).toEqual({ question: input.question, history, catalog: [], evidence: allocation.evidence, handoff: allocation.handoff });
          for (const key of ['question', 'history', 'catalog', 'evidence', 'handoff'] as const) expect(actual.components[key]).toBe(JSON.stringify(data[key]));
          try { prepareModelCall(receiver, actual); return true; } catch { return false; }
        });
      };
      expect(select(capacity, base)).toEqual(pairs(turns));
      expect(select(capacity)).toEqual(required);
      expect(select(capacity - 1)).toBeNull();
      const all = prepareModelCall(roomy, generationInput(input.question, pairs(turns), reserved));
      expect(select(all.inputTokens + all.outputTokens)).toEqual(pairs(turns));
      expect(all.inputTokens + all.outputTokens).toBeGreaterThan(capacity);
      expect(requiredCall.inputTokens + requiredCall.outputTokens).toBe(capacity);
      return { failure: 'scope_unavailable' };
    });
    expect(await f.processor.process(message('current', 'Current immutable question 😀'), context(turns))).toEqual({ failure: 'scope_unavailable', language: 'en' });
    expect(f.continuation.continue).toHaveBeenCalledTimes(1);
  });
  it.each(['clarification', 'failed'] as const)('an interrupted dependency before a %s suffix cannot drop the original pending clarification', async (status) => {
    const original = exchange('original'), interrupted = message('interrupted'), suffix = exchange('suffix');
    if (status === 'failed') suffix.result = controlledFailure(suffix, 'processing_unavailable', 'en');
    const f = fixture();
    const output = await f.processor.process(message('current'), context([original, interrupted, suffix]));
    expect(output).toEqual({ contextReset: true, sources: [], draft: { status: 'clarification', language: 'en',
      blocks: [{ kind: 'clarification', text: CONTEXT_RESTATEMENT.en, sourceIds: [] }] } });
    expect(f.script).not.toHaveBeenCalled(); expect(f.continuation.continue).not.toHaveBeenCalled();
  });
  it('marks exact local restatement when the receiver changes after real preparation reaches ready', async () => {
    const receiver = { ...deterministicReceiver() }, f = fixture(receiver);
    const preparation = { prepare: vi.fn(async (...args: Parameters<ModelAwareIntentPreparation['prepare']>) => {
      const ready = await f.preparation.prepare(...args);
      expect(ready.kind).toBe('ready');
      receiver.modelVersion = 'changed-after-ready';
      return ready;
    }) };
    const processor = new ProfessionalIntentProcessor(f.provider, preparation, f.continuation);
    expect(await processor.process(message('current'), context([exchange('previous')]))).toEqual({ contextReset: true, sources: [],
      draft: { status: 'clarification', language: 'en', blocks: [{ kind: 'clarification', text: CONTEXT_RESTATEMENT.en, sourceIds: [] }] } });
    expect(preparation.prepare).toHaveBeenCalledTimes(1);
    expect(f.script).not.toHaveBeenCalled(); expect(f.continuation.continue).not.toHaveBeenCalled();
  });

  it.each([false, true])('bridges consecutive failed replies without dropping the original pending question (later clarification=%s)', async (clarifyAgain) => {
    const original = exchange('original', 'clarification', 'Explain this unresolved architecture decision');
    const failures = ['failed-one', 'failed-two'].map((id) => {
      const turn = message(id, 'That one'); turn.result = controlledFailure(turn, 'processing_unavailable', 'en'); return turn;
    });
    const turns = [original, ...failures, ...(clarifyAgain ? [exchange('clarify-again')] : [])];
    const required = turns.flatMap((t) => [{ role: 'user', text: t.question }, { role: 'assistant', text: t.result!.blocks[0]!.text }]);
    const cap = Array.from(JSON.stringify(required)).length;
    const f = fixture(historyReceiver(cap));
    const prepared = await f.preparation.prepare(message('current'), context([exchange('old', 'refused'), ...turns]));
    expect(prepared.kind === 'ready' && prepared.request.conversationContext).toEqual(required);
    const tight = fixture(historyReceiver(cap - 1));
    expect(await tight.processor.process(message('current'), context(turns))).toMatchObject({ contextReset: true, draft: { status: 'clarification' } });
    expect(tight.script).not.toHaveBeenCalled(); expect(tight.continuation.continue).not.toHaveBeenCalled();
  });
  it('preserves the trusted reset boundary after recovery and the next ordinary follow-up', async () => {
    const poison = exchange('poison', 'clarification', 'bad\u0001');
    const reset = exchange('reset', 'clarification', 'Clean restatement', CONTEXT_RESTATEMENT.en); reset.contextReset = true;
    const resolved = exchange('resolved', 'refused', 'A clean topic', 'Please ask about professional work.');
    const f = fixture();
    await f.processor.process(message('next'), context([poison, reset, resolved]));
    expect(JSON.parse(f.script.mock.calls[0]![0].data).conversationContext).toEqual([reset, resolved].flatMap((t) => [
      { role: 'user', text: t.question }, { role: 'assistant', text: t.result!.blocks[0]!.text },
    ]));
  });
  it.each(['accept', 'reject', 'throw'])('applies the generation fit callback even to empty history: %s', (kind) => {
    const fits = vi.fn(() => { if (kind === 'throw') throw new Error('overflow'); return kind === 'accept'; });
    expect(selectConversationExchanges(context([]), 12000, fits)).toEqual(kind === 'accept' ? [] : null);
    expect(fits).toHaveBeenCalledExactlyOnceWith([]);
  });
  it('maps the exact actual question token boundary to local restatement without a call or truncation', async () => {
    const current = message('current', 'é😀\n"\\企业');
    const cap = deterministicReceiver('scalar-v1').count(JSON.stringify(current.question));
    for (const limit of [cap, cap - 1]) {
      const f = fixture(deterministicReceiver('scalar-v1', { budget: { ...DEFAULT_MODEL_CONTEXT_BUDGET,
        components: { ...DEFAULT_MODEL_CONTEXT_BUDGET.components, question: limit } } }));
      const output = await f.processor.process(current, context([]));
      if (limit === cap) {
        expect(f.script).toHaveBeenCalledTimes(1); expect(output).not.toHaveProperty('contextReset');
        expect(JSON.parse(f.script.mock.calls[0]![0].data).question).toBe(current.question);
      } else {
        expect(output).toMatchObject({ contextReset: true, draft: { status: 'clarification', language: 'fr' } });
        expect(f.script).not.toHaveBeenCalled();
      }
      expect(f.continuation.continue).not.toHaveBeenCalled();
    }
  });
  it.each(['catalog-component', 'whole-capacity'])('prunes populated optional metadata using only %s tokens, preserving required history', async (limit) => {
    const bounds = intentBounds({ historyBytes: 100000, catalogBytes: 100000, requestBytes: 200000 });
    const current = message('current'), required = exchange('required');
    const f = fixture(deterministicReceiver('scalar-v1'), bounds);
    const base = await f.preparation.prepare(current, context([required]));
    if (base.kind !== 'ready') throw new Error('Expected base');
    const withTitle = { ...base.request, publicCatalog: [{ topic: 'Public title', aliases: [] }] };
    const exact = prepareProfessionalIntent(deterministicReceiver('scalar-v1'), withTitle, bounds);
    const receiver = deterministicReceiver('scalar-v1', limit === 'catalog-component' ? {
      budget: { ...DEFAULT_MODEL_CONTEXT_BUDGET, components: { ...DEFAULT_MODEL_CONTEXT_BUDGET.components, catalog: exact.componentTokens.catalog } },
    } : { capacity: exact.inputTokens + exact.outputTokens });
    const limited = fixture(receiver, bounds);
    const populated = structuredClone(publication);
    populated.documents = [{ documentId: 'doc', sourcePath: 'content/public/doc.md', sourceRevision: publication.catalogRevision,
      sourceTitle: 'Public title', metadata: { document_id: 'doc', visibility: 'public', title: 'Public title',
        created_at: '2026-01-01T00:00:00Z', modified_at: '2026-01-01T00:00:00Z', reviewed_by: 'Fixture', reviewed_at: '2026-01-01T00:00:00Z',
        aliases: ['Optional alias that cannot fit'], topics: ['Optional topic that cannot fit'] } }];
    populated.catalog.resources = [{ resourceId: 'project', name: 'Optional project', description: 'Optional description', documentIds: ['doc'] }];
    limited.catalog.readSnapshot.mockResolvedValue(populated);
    const prepared = await limited.preparation.prepare(current, context([required]));
    expect(prepared.kind).toBe('ready');
    if (prepared.kind !== 'ready') throw new Error('Expected pruned ready');
    expect(prepared.request).toEqual(withTitle);
    expect(prepared.call!.componentTokens.history).toBe(base.call!.componentTokens.history);
    expect(JSON.stringify(professionalIntentInput(prepared.request, bounds))).not.toContain('Optional');
    await limited.processor.process(current, context([required]));
    expect(limited.script).toHaveBeenCalledTimes(1);
  });
  it('uses supported previous language then French before classification, with no detection', async () => {
    const en = exchange('en'); const de = exchange('de'); de.result!.language = 'de';
    expect(contextFallbackLanguage(context([en, de]))).toBe('en');
    expect(contextFallbackLanguage(context([de]))).toBe('fr');
    const f = fixture(historyReceiver(1));
    expect(await f.processor.process(message('current', 'Answer in English'), context([]))).toMatchObject({ draft: { language: 'fr' }, contextReset: true });
    expect(f.script).not.toHaveBeenCalled();
  });
});

describe('conversation-context authenticated root resolver (synthetic future retry fixtures only)', () => {
  function lineage() {
    const before = exchange('before', 'refused');
    const root = message('root', 'What about that project?'); root.result = controlledFailure(root, 'processing_unavailable', 'en');
    const later = exchange('later', 'refused', 'Unrelated later topic'); later.result!.language = 'fr';
    const retry: AdmittedMessage = { ...message('retry', root.question), contextAnchorMessageId: root.messageId,
      submissionIdentity: { kind: 'retry' as const, retryOfRequestId: root.requestId } };
    retry.result = controlledFailure(retry, 'processing_unavailable', 'en');
    const current = { ...message('current', root.question), contextAnchorMessageId: root.messageId,
      submissionIdentity: { kind: 'retry' as const, retryOfRequestId: retry.requestId } };
    const state: AdmissionState = { messages: [before, root, later, retry, current], lease: null };
    return { state, root, retry, current, before };
  }
  it('direct self-anchor and retry-of-retry both exclude later topics and use anchored fallback language', () => {
    const { state, root, current, before } = lineage();
    expect(resolveConversationContext(state, root)).toEqual(context([before]));
    expect(resolveConversationContext(state, current)).toEqual(context([before]));
    expect(contextFallbackLanguage(resolveConversationContext(state, current))).toBe('en');
  });
  it.each(['missing', 'forward', 'cycle', 'foreign', 'nonretryable', 'nonfailed', 'mismatched-root', 'question', 'scope', 'duplicate-message', 'duplicate-request', 'identity', 'bound'])('unavailable %s cannot use later topic/language', (kind) => {
    const { state, root, retry, current } = lineage();
    if (kind === 'missing' || kind === 'foreign') current.submissionIdentity = { kind: 'retry', retryOfRequestId: 'not-in-authenticated-state' };
    if (kind === 'forward' || kind === 'cycle') retry.submissionIdentity = { kind: 'retry', retryOfRequestId: current.requestId };
    if (kind === 'nonretryable') root.result!.error!.retryable = false;
    if (kind === 'nonfailed') root.result!.status = 'refused';
    if (kind === 'mismatched-root') current.contextAnchorMessageId = 'later';
    if (kind === 'question') retry.question = 'changed';
    if (kind === 'scope') retry.submittedScope = { ...retry.submittedScope, eligibleDocumentIds: ['outside'] };
    if (kind === 'duplicate-message') state.messages.push({ ...message('duplicate'), messageId: root.messageId });
    if (kind === 'duplicate-request') state.messages.push({ ...message('duplicate'), requestId: root.requestId });
    if (kind === 'identity') root.submissionIdentity = { ...message('other').submissionIdentity };
    expect(resolveConversationContext(state, current, kind === 'bound' ? 2 : 20)).toEqual({ contextAvailable: false, precedingMessages: [] });
  });
  it('rejects a caller object differing from canonical current identity', () => {
    const { state, current } = lineage();
    expect(resolveConversationContext(state, { ...current, question: 'forged' }).contextAvailable).toBe(false);
  });
});
