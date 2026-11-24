import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import type { GenerationRetriever } from '../../src/ports/Retriever.ts';
import { ScriptedAnswerGenerator } from '../../src/adapters/llm/scripted-answer.ts';
import { ScriptedLLMProvider } from '../../src/adapters/llm/scripted.ts';
import { manualTime, deferred } from './attempt-time.fixture.ts';
import { attemptTiming, type AttemptTiming } from '../../src/shared/attempt-timing.ts';
import { messageTransportWaitMs } from '../../frontend/src/message-transport.ts';
import { isProxy } from 'node:util/types';
import { selectProvider, WORKERS_AI_CANDIDATE, type FixtureInferenceBinding } from '../../src/adapters/llm/workers-ai.ts';
import { EligibleEvidenceContinuation } from '../../src/application/generate-answer.ts';
import { ModelAwareIntentPreparation, ProfessionalIntentProcessor } from '../../src/application/professional-intent-processor.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET } from '../../src/shared/model-context-budget.ts';
import { describe, expect, it, vi } from 'vitest';
import { completeResult, controlledFailure, validateConversationResult, type ResultDraft, type LoadedSource, type SourceExcerpt } from '../../src/shared/conversation-result.ts';
import { AdmissionRejected, type AdmissionState, type AdmittedMessage } from '../../src/shared/conversation-admission.ts';
import { CONTEXT_RESTATEMENT } from '../../src/shared/professional-intent.ts';
import { submitConversationQuestion } from '../../src/application/conversation-results.ts';
import { admitConversationQuestion } from '../../src/application/conversation-admission.ts';
import { hashSessionToken, readConversation } from '../../src/application/conversations.ts';
import type { ConversationStore } from '../../src/ports/ConversationStore.ts';
import type { ConversationProcessor } from '../../src/ports/ConversationProcessor.ts';
import type { PublicPublication } from '../../src/ports/ResourceCatalog.ts';
import { SyntheticConversationProcessor } from '../../src/adapters/simulated/conversation-processor.ts';

const id = '11111111-1111-4111-8111-111111111111', token = 'a'.repeat(64), revision = 'b'.repeat(40), hash = 'c'.repeat(64);
const body = { requestId: 'question', question: '  Fictional fixture 😀\r\n', selection: { resourceIds: [], catalogRevision: revision, catalogHash: hash } };
const message: AdmittedMessage = { messageId: 'message', requestId: body.requestId, question: body.question, createdAt: '2026-01-01T00:00:00.000Z',
  contextAnchorMessageId: 'message', submissionIdentity: { kind: 'direct', question: body.question, resourceIds: [], catalogRevision: revision, catalogHash: hash },
  submittedScope: { version: 1, mode: 'global_public', catalogRevision: revision, catalogHash: hash, resources: [], eligibleDocumentIds: ['doc', 'uncited'] } };
const source: LoadedSource = { responseLocalId: 'S1', chunk: { chunkId: 'chunk', documentId: 'doc', sourcePath: 'content/public/fiction.md',
  sourceRevision: 'd'.repeat(40), contentHash: 'e'.repeat(64), sourceTitle: 'Fiction, not BC', sectionTitle: null,
  text: 'Texte original fictif, aucune attribution à BC.', location: 'lines:1-2', rank: 0 } };
const draft: ResultDraft = { status: 'answered', language: 'en', blocks: [
  { kind: 'paragraph', text: 'Synthetic development example, not evidence about BC.', sourceIds: ['S1'] },
  { kind: 'summary', text: 'Another synthetic block.', sourceIds: ['S1'] },
] };
const publication: PublicPublication = { catalogRevision: revision, catalogHash: hash, catalogAssetPath: `/assets/resources-catalog.${hash}.json`,
  catalog: { version: 1, catalogRevision: revision, resources: [], documents: ['doc', 'uncited'].map((documentId) => ({ documentId, sourcePath: `content/public/${documentId}.md` })) }, documents: [], chunks: [] };
async function fixture() {
  const state: AdmissionState = { messages: [], lease: null };
  const clock = { now: () => new Date('2026-01-01T00:00:00.000Z') };
  const tokenHash = await hashSessionToken(token);
  const catalog = { readSnapshot: vi.fn(async (): Promise<PublicPublication | null> => structuredClone(publication)) };
  const store: ConversationStore = {
    create: vi.fn(), cleanupCreationLimits: vi.fn(), dailyCreationKey: vi.fn(),
    findAuthenticated: vi.fn(async (conversationId, hash) => conversationId === id && hash === tokenHash ? { conversationId: id } : null),
    readAdmissionState: vi.fn(async () => structuredClone(state)),
    admit: vi.fn(async (command) => {
      const admitted = { ...structuredClone(message), submissionIdentity: command.identity,
        question: command.identity.kind === 'direct' ? command.identity.question : message.question, messageId: command.messageId, contextAnchorMessageId: command.messageId, requestId: command.requestId };
      state.messages.push(admitted); state.lease = { attemptId: command.attemptId, requestId: command.requestId, until: clock.now().getTime() + command.limits.leaseMilliseconds };
      return { status: 'admitted' as const, message: admitted, lease: state.lease };
    }),
    finalize: vi.fn(async (command) => {
      validateConversationResult(command.result);
      const saved = state.messages.find((m) => m.requestId === command.requestId)!;
      saved.result = structuredClone(command.result); state.lease = null;
      return structuredClone(command.result);
    }),
  };
  const processor = { process: vi.fn<ConversationProcessor['process']>(async () => ({ draft: structuredClone(draft), sources: [structuredClone(source)] })) };
  const submit = (input: unknown = body, processing: ConversationProcessor | undefined = processor) => submitConversationQuestion(store, catalog, clock, processing, id, `Bearer ${token}`, input, { maxMessages: 1 });
  return { state, clock, catalog, store, processor, submit };
}

describe('conversation-result mechanical contract', () => {
  it('uses trusted historical provenance, unique saved IDs, ordered blocks/edges and actual declared language', () => {
    const result = completeResult(message, { ...draft, language: 'EN-us' }, [source]);
    expect(result.language).toBe('en-US'); expect(result.blocks.map((b) => b.kind)).toEqual(['paragraph', 'summary']);
    expect(result.blocks.map((b) => b.sourceIds)).toEqual([['S1'], ['S1']]);
    expect(result.sourceExcerpts).toEqual([{ sourceExcerptId: expect.any(String), responseLocalId: 'S1', documentId: 'doc', sourceChunkId: 'chunk',
      contentHash: source.chunk.contentHash, sourceTitle: source.chunk.sourceTitle, sectionTitle: null, sourcePath: source.chunk.sourcePath,
      sourceRevision: source.chunk.sourceRevision, excerpt: source.chunk.text, location: source.chunk.location }]);
    expect(result.submittedScope.catalogRevision).not.toBe(result.sourceExcerpts[0]?.sourceRevision);
    expect(new Set([result.answerId, ...result.blocks.map((b) => b.blockId), ...result.sourceExcerpts.map((s) => s.sourceExcerptId)]).size).toBe(4);
    expect(() => validateConversationResult(result)).not.toThrow();
  });
  it.each([
    null, {}, { ...draft, status: 'invented' }, { ...draft, status: 'failed' }, { ...draft, language: '' }, { ...draft, language: 'not_a_tag' },
    { ...draft, sourceExcerpts: [] }, { ...draft, submittedScope: message.submittedScope },
    { ...draft, blocks: [] }, { ...draft, blocks: [{ kind: 'paragraph', text: 'x', sourceIds: [] }] },
    { ...draft, blocks: [{ kind: 'summary', text: 'x', sourceIds: ['unknown'] }] },
    { ...draft, blocks: [{ kind: 'paragraph', text: 'x', sourceIds: ['S1', 'S1'] }] },
    { ...draft, blocks: [{ kind: 'made-up', text: 'x', sourceIds: [] }] },
    { ...draft, blocks: [{ kind: 'limitation', text: '\ud800', sourceIds: [] }] },
    { ...draft, blocks: [{ kind: 'limitation', text: 'x'.repeat(16_001), sourceIds: [] }] },
    { ...draft, blocks: [{ kind: 'paragraph', text: 'x', sourceIds: ['S1'], excerpt: 'forged' }] },
    { ...draft, status: 'clarification' },
  ])('rejects malformed/untrusted output without repair: %j', (value) => expect(() => completeResult(message, value, [source])).toThrow());
  it.each([
    { documentId: 'outside' }, { sourcePath: 'content/private/hidden.md' }, { sourcePath: 'content/public/../outside.md' },
    { sourceRevision: 'not-provenance' }, { contentHash: 'wrong' }, { sourceTitle: '' }, { location: '' }, { sectionTitle: 2 },
  ])('rejects ineligible or malformed loaded provenance: %j', (changed) => {
    expect(() => completeResult(message, draft, [{ ...source, chunk: { ...source.chunk, ...changed } } as LoadedSource])).toThrow();
  });
  it.each(['lines:9-8', 'lines:0-1', 'lines:1-9007199254740992', 'lines:01-2', 'lines:3-4;context:2-1',
    'lines:3-4;context:1-1;context:0-2', 'lines:3-4;context:1-', 'lines:3-4;other:1-1'])(
    'rejects impossible or malformed declared ranges: %s', location => {
      const result = completeResult(message, draft, [source]); result.sourceExcerpts[0]!.location = location;
      expect(() => validateConversationResult(result)).toThrow('Invalid line location');
    });
  it.each(['lines:9007199254740991-9007199254740991;context:1-1;context:2-3', 'heading:solution'])(
    'preserves complete valid ranges and other diagnostic locations: %s', location => {
      const result = completeResult(message, draft, [source]); result.sourceExcerpts[0]!.location = location;
      expect(() => validateConversationResult(result)).not.toThrow();
    });
  it('requires one source publication per result, not the admission revision', () => {
    const second = { responseLocalId: 'S2', chunk: { ...source.chunk, chunkId: 'second-chunk', contentHash: 'f'.repeat(64),
      location: 'lines:3-4', text: 'Deuxième exemple fictif, sans rapport avec BC.' } };
    const result = completeResult(message, { ...draft, blocks: [{ ...draft.blocks[0], sourceIds: ['S1', 'S2'] }] }, [source, second]);
    expect(result.sourceExcerpts.map(s => s.sourceRevision)).toEqual([source.chunk.sourceRevision, source.chunk.sourceRevision]);
    expect(source.chunk.sourceRevision).not.toBe(message.submittedScope.catalogRevision);
    expect(() => validateConversationResult(result)).not.toThrow();
    result.sourceExcerpts[1]!.sourceRevision = 'a'.repeat(40);
    expect(() => validateConversationResult(result)).toThrow('Mixed source revisions');
  });
  it('keeps chunk and file identities local to one result, not to each block or display title', () => {
    const second = { responseLocalId: 'S2', chunk: { ...source.chunk, chunkId: 'chunk-2', contentHash: 'f'.repeat(64),
      location: 'lines:3-4', text: 'Autre passage fictif, sans rapport avec BC.' } };
    const result = completeResult(message, { ...draft, blocks: [draft.blocks[0]!, { ...draft.blocks[1]!, sourceIds: ['S1', 'S2'] }] }, [source, second]);
    const [first, next] = result.sourceExcerpts;
    const validate = (patch: Partial<SourceExcerpt>) => validateConversationResult({ ...result, sourceExcerpts: [first!, { ...next!, ...patch }] });
    expect(() => validate({})).not.toThrow(); // two chunks, one file, S1 cited twice
    expect(() => validate({ sourceChunkId: first!.sourceChunkId })).toThrow('Duplicate source chunk');
    expect(() => validate({ sourceTitle: 'Autre titre' })).toThrow('Inconsistent source file');
    const reuse = { contentHash: first!.contentHash, excerpt: first!.excerpt, location: first!.location };
    expect(() => validate(reuse)).not.toThrow(); // distinct citation and chunk, same saved content
    expect(() => validate({ ...reuse, contentHash: next!.contentHash })).toThrow('Inconsistent content hash');
    const otherSection = { ...reuse, contentHash: next!.contentHash, sectionTitle: 'Autre section' };
    expect(() => validate(otherSection)).toThrow('line passage');
    expect(() => validate({ ...reuse, contentHash: next!.contentHash, excerpt: next!.excerpt })).toThrow('line passage');
    expect(() => validate({ ...otherSection, location: next!.location })).not.toThrow();
    expect(() => validate({ ...reuse, excerpt: 'Passage différent.' })).toThrow('Inconsistent content hash');
    const sourcePath = 'content/public/other.md';
    expect(() => validate({ sourcePath })).toThrow('Inconsistent source file');
    expect(() => validate({ documentId: 'uncited' })).toThrow('Inconsistent source file');
    expect(() => validate({ documentId: 'uncited', sourcePath })).not.toThrow(); // same title, different files
  });
  it('requires a string content hash in a saved excerpt', () => {
    const result = completeResult(message, draft, [source]);
    expect(() => validateConversationResult(result)).not.toThrow();
    const excerpt = result.sourceExcerpts[0]!;
    Object.assign(excerpt, { contentHash: [excerpt.contentHash] }); // Non-string JSON field in an inert receipt.
    expect(() => validateConversationResult(result)).toThrow('Invalid excerpt');
  });
  it('does not exempt factual examples after a refusal from citation validation', () => {
    const result = completeResult(message, { ...draft, status: 'refused', blocks: [
      { kind: 'refusal', text: 'Synthetic boundary, not BC evidence.', sourceIds: [] }, ...draft.blocks,
    ] }, [source]);
    expect(result.status).toBe('refused'); expect(result.sourceExcerpts).toHaveLength(1);
    expect(() => completeResult(message, { ...draft, status: 'refused' }, [])).toThrow();
  });
  it.each(['\0Synthetic', 'Synthetic\0text'])('rejects NUL-containing result text %j', (text) => {
    expect(() => completeResult(message, { ...draft, blocks: [{ ...draft.blocks[0], text }] }, [source])).toThrow();
    const result = completeResult(message, draft, [source]); result.blocks[0]!.text = text;
    expect(() => validateConversationResult(result)).toThrow();
  });
  it('rejects sparse draft and citation arrays, while preserving dense arrays', () => {
    for (const blocks of [new Array(1), [{ kind: 'paragraph', text: 'Synthetic', sourceIds: new Array(1) }]]) {
      expect(() => completeResult(message, { ...draft, blocks }, [source])).toThrow();
    }
    const result = completeResult(message, draft, [source]);
    result.blocks[0]!.sourceIds = new Array(1);
    expect(() => validateConversationResult(result)).toThrow();
    expect(() => completeResult(message, draft, [source])).not.toThrow();
  });
  it('bounds generated output without imposing a new limit on immutable request identity', () => {
    const large = { ...message, requestId: 'r'.repeat(500_001) };
    expect(() => validateConversationResult(controlledFailure(large, 'scope_unavailable'))).not.toThrow();
    expect(completeResult(large, draft, [source]).requestId).toBe(large.requestId);
  });
  it('rejects duplicate source IDs and block/excerpt IDs or malformed canonical metadata', () => {
    expect(() => completeResult(message, draft, [source, source])).toThrow();
    const result = completeResult(message, draft, [source]); result.blocks[1]!.blockId = result.blocks[0]!.blockId;
    expect(() => validateConversationResult(result)).toThrow();
    const failure = controlledFailure(message, 'scope_unavailable', 'en');
    failure.error!.retryable = true; failure.error!.retryMode = 'new_request';
    expect(() => validateConversationResult(failure)).toThrow();
  });
  it('validates historical saved failure copy/retry metadata without rebuilding current templates', () => {
    const result = controlledFailure(message, 'processing_unavailable', 'en');
    result.error!.message = 'Historical synthetic failure copy; not BC evidence.';
    result.error!.retryable = false; result.error!.retryMode = 'none';
    result.blocks[0]!.text = result.error!.message;
    expect(() => validateConversationResult(result)).not.toThrow();
    expect(() => controlledFailure(message, 'constructor' as 'invalid_result')).toThrow();
  });
  it.each(['fr', 'en-GB', 'de', undefined])('records actual controlled-template language and immutable false/none for scope failure (%j)', (language) => {
    const result = controlledFailure(message, 'scope_unavailable', language);
    expect(result.language).toBe(language?.startsWith('en') ? 'en' : 'fr');
    expect(result.error).toMatchObject({ code: 'scope_unavailable', retryable: false, retryMode: 'none' });
    expect(result.sourceExcerpts).toEqual([]); expect(result.blocks[0]?.kind).toBe('error');
    expect(() => validateConversationResult(result)).not.toThrow();
  });
});

describe('conversation-results portable service', () => {
  it.each(['answered', 'partial', 'clarification', 'refused', 'failed'] as const)('persists and replays %s identically across POST/GET without calls, turns or catalog at cap', async (status) => {
    const f = await fixture();
    f.processor.process.mockImplementation(new SyntheticConversationProcessor(f.catalog, status, 'en').process.bind(new SyntheticConversationProcessor(f.catalog, status, 'en')));
    // Factual fixture uses the explicit loaded source rather than needing real index data.
    if (status === 'answered' || status === 'partial') f.processor.process.mockResolvedValue({ draft: { ...draft, status }, sources: [source] });
    const result = await f.submit(); expect(result.status).toBe(status);
    const originalMessage = structuredClone(f.state.messages[0]);
    f.catalog.readSnapshot.mockClear(); f.catalog.readSnapshot.mockResolvedValue(null);
    f.state.lease = { requestId: 'newer-owner', attemptId: 'internal-owner', until: f.clock.now().getTime() + 1000 };
    for (const input of [body, { ...body, selection: { ...body.selection, resourceIds: [] } }]) expect(await f.submit(input)).toEqual(result);
    expect(await submitConversationQuestion(f.store, f.catalog, f.clock, undefined, id, `Bearer ${token}`, body)).toEqual(result);
    expect(f.catalog.readSnapshot).not.toHaveBeenCalled();
    const view = await readConversation(f.store, f.clock, id, `Bearer ${token}`, f.catalog);
    expect(view.transcript[0]).toMatchObject({ status: 'completed', result }); expect(JSON.stringify(view)).not.toContain('internal-owner');
    expect(f.state.messages).toEqual([originalMessage]); expect(f.processor.process).toHaveBeenCalledOnce(); expect(f.store.admit).toHaveBeenCalledOnce(); expect(f.store.finalize).toHaveBeenCalledOnce();
  });
  it('authenticates before body normalization and saved lookup', async () => {
    const f = await fixture();
    for (const credential of [undefined, 'Bearer bad', `Bearer ${'0'.repeat(64)}`]) {
      await expect(submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, credential, null)).rejects.toMatchObject({ code: 'conversation_unavailable' });
    }
    expect(f.store.readAdmissionState).not.toHaveBeenCalled(); expect(f.processor.process).not.toHaveBeenCalled();
  });
  it('preserves changed-identity conflict before disabled processing or live availability', async () => {
    const f = await fixture(); await f.submit(); f.catalog.readSnapshot.mockClear();
    for (const input of [{ ...body, question: '' }, { ...body, question: body.question.trim() }, { ...body, selection: { ...body.selection, catalogHash: 'f'.repeat(64) } }, { requestId: body.requestId, retryOfRequestId: 'old' }]) {
      await expect(submitConversationQuestion(f.store, f.catalog, f.clock, undefined, id, `Bearer ${token}`, input)).rejects.toMatchObject({ code: 'request_conflict' });
    }
    expect(f.catalog.readSnapshot).not.toHaveBeenCalled(); expect(f.state.messages).toHaveLength(1);
  });
  it('does not admit when processing is unconfigured and never auto-recovers interrupted POSTs', async () => {
    const f = await fixture();
    await expect(submitConversationQuestion(f.store, f.catalog, f.clock, undefined, id, `Bearer ${token}`, body)).rejects.toMatchObject({ code: 'result_unavailable' });
    expect(f.store.admit).not.toHaveBeenCalled();
    f.state.messages.push(structuredClone(message));
    await expect(f.submit()).rejects.toMatchObject({ code: 'result_unavailable' });
    expect(f.processor.process).not.toHaveBeenCalled(); expect(f.store.admit).not.toHaveBeenCalled();
  });
  it.each(['question', 'other'])('preserves live lease %s precedence with processing disabled', async (requestId) => {
    const f = await fixture();
    f.state.messages.push(structuredClone(message));
    f.state.lease = { requestId, attemptId: 'owner', until: f.clock.now().getTime() + 1000 };
    await expect(submitConversationQuestion(f.store, f.catalog, f.clock, undefined, id, `Bearer ${token}`, body))
      .rejects.toMatchObject({ code: requestId === body.requestId ? 'request_in_progress' : 'conversation_busy' });
    expect(f.catalog.readSnapshot).not.toHaveBeenCalled(); expect(f.store.admit).not.toHaveBeenCalled();
  });
  it('reports processing readiness honestly without blocking saved history', async () => {
    const f = await fixture();
    expect((await readConversation(f.store, f.clock, id, `Bearer ${token}`, f.catalog, undefined, false)).admission)
      .toEqual({ available: false, reason: 'processing_unavailable' });
    const result = await f.submit();
    expect((await readConversation(f.store, f.clock, id, `Bearer ${token}`, f.catalog, undefined, false)).transcript[0]?.result).toEqual(result);
  });
  it('includes the authoritative catalog identity on direct stale rejection', async () => {
    const f = await fixture();
    const input = { ...body, selection: { ...body.selection, catalogHash: 'f'.repeat(64) } };
    await expect(f.submit(input)).rejects.toMatchObject({ code: 'catalog_stale', currentCatalog: { catalogRevision: revision, catalogHash: hash } });
  });
  it('uses saved terminal precedence when completion races a failing catalog read', async () => {
    const f = await fixture(); const result = completeResult(message, draft, [source]);
    f.catalog.readSnapshot.mockImplementation(async () => { f.state.messages.push({ ...message, result }); return null; });
    const replay = await admitConversationQuestion(f.store, f.catalog, f.clock, id, `Bearer ${token}`, body, 'submit');
    expect(replay).toEqual({ status: 'completed', message: { ...message, result } }); expect(f.store.admit).not.toHaveBeenCalled();
  });
  it('returns an atomic-race winner instead of invoking processing again', async () => {
    const f = await fixture(); const result = completeResult(message, draft, [source]);
    vi.mocked(f.store.admit).mockResolvedValue({ status: 'completed', message: { ...message, result } });
    expect(await f.submit()).toEqual(result); expect(f.processor.process).not.toHaveBeenCalled(); expect(f.store.finalize).not.toHaveBeenCalled();
  });
  it('reads post-admission context before the immutable anchor and uses its language, never later turns', async () => {
    const f = await fixture(), admit = vi.mocked(f.store.admit).getMockImplementation()!;
    const prior: AdmittedMessage = { ...structuredClone(message), messageId: 'prior', requestId: 'prior' };
    prior.result = controlledFailure(prior, 'processing_unavailable', 'en');
    const later: AdmittedMessage = { ...structuredClone(message), messageId: 'later', requestId: 'later' };
    later.result = controlledFailure(later, 'processing_unavailable', 'fr');
    vi.mocked(f.store.admit).mockImplementation(async (command) => {
      const result = await admit(command);
      // Simulate authoritative state differing from the original preflight read.
      f.state.messages.unshift(prior); f.state.messages.push(later);
      return result;
    });
    f.processor.process.mockResolvedValue({ failure: 'processing_unavailable' });
    const result = await f.submit();
    expect(f.processor.process).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ precedingMessages: [prior], contextAvailable: true }));
    expect(result.language).toBe('en');
    expect(vi.mocked(f.store.finalize).mock.calls[0]?.[0].previousLanguage).toBe('en');
  });
  it('passes unavailable context explicitly when the authoritative anchor is missing', async () => {
    const f = await fixture(), read = vi.mocked(f.store.readAdmissionState).getMockImplementation()!;
    vi.mocked(f.store.readAdmissionState).mockImplementation(async (...args) => {
      const state = await read(...args);
      if (state?.lease) state.messages = [];
      return state;
    });
    await f.submit();
    expect(f.processor.process).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ precedingMessages: [], contextAvailable: false }));
  });

  it.each(['en', 'fr', 'wrong-text', 'wrong-language', 'wrong-status'])('validates reset provenance inside canonical handling: %s', async (kind) => {
    const f = await fixture();
    const valid = kind === 'en' || kind === 'fr';
    const language = kind === 'fr' ? 'fr' : kind === 'wrong-language' ? 'de' : 'en';
    f.processor.process.mockResolvedValue({ draft: { status: kind === 'wrong-status' ? 'refused' : 'clarification', language,
      blocks: [{ kind: kind === 'wrong-status' ? 'refusal' : 'clarification', text: valid ? CONTEXT_RESTATEMENT[kind] : 'Which project?', sourceIds: [] }] }, sources: [], contextReset: true });
    const result = await f.submit();
    expect(result.status).toBe(valid ? 'clarification' : 'failed');
    if (!valid) expect(result.error?.code).toBe('invalid_result');
    expect(f.store.finalize).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ contextReset: valid }), expect.any(Function));
    expect(f.state.lease).toBeNull(); expect(await f.submit()).toEqual(result); expect(f.processor.process).toHaveBeenCalledTimes(1);
  });
  it('retains authenticated initial English fallback only for a new direct admission when reread throws', async () => {
    const f = await fixture();
    const prior = { ...structuredClone(message), messageId: 'prior', requestId: 'prior' };
    prior.result = controlledFailure(prior, 'processing_unavailable', 'en'); f.state.messages.push(prior);
    const read = vi.mocked(f.store.readAdmissionState).getMockImplementation()!;
    vi.mocked(f.store.readAdmissionState).mockImplementation(async (...args) => {
      if (f.state.lease) throw new Error('Read failed');
      return read(...args);
    });
    const result = await submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { maxMessages: 2 });
    expect(result.error?.code).toBe('processing_unavailable'); expect(result.language).toBe('en');
    expect(f.processor.process).not.toHaveBeenCalled(); expect(f.store.finalize).toHaveBeenCalledTimes(1);
  });
  it.each(['recovered', 'missing-root'] as const)('does not borrow initial later English context for %s admission fixtures', async (kind) => {
    // Synthetic internal outcomes only; HTTP retry/recovery remains unsupported.
    const f = await fixture(), prior = { ...structuredClone(message), messageId: 'later-topic', requestId: 'later-topic' };
    prior.result = controlledFailure(prior, 'processing_unavailable', 'en'); f.state.messages.push(prior);
    const admit = vi.mocked(f.store.admit).getMockImplementation()!;
    vi.mocked(f.store.admit).mockImplementation(async (command) => {
      const result = await admit(command);
      if (!('lease' in result)) throw new Error('Expected admitted fixture');
      return kind === 'recovered' ? { ...result, status: 'recovered' } : { ...result, message: { ...result.message, contextAnchorMessageId: 'missing' } };
    });
    const read = vi.mocked(f.store.readAdmissionState).getMockImplementation()!;
    vi.mocked(f.store.readAdmissionState).mockImplementation(async (...args) => {
      if (f.state.lease) throw new Error('Read failed');
      return read(...args);
    });
    const result = await submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { maxMessages: 2 });
    expect(result.error?.code).toBe('processing_unavailable'); expect(result.language).toBe('fr');
    expect(f.processor.process).not.toHaveBeenCalled();
  });
  it('normalizes malformed output into recorded failure, preserving the admitted exact message and scope', async () => {
    const f = await fixture(); f.processor.process.mockResolvedValue({ draft: { ...draft, blocks: [{ kind: 'paragraph', text: 'unchecked', sourceIds: ['forged'] }] }, sources: [source] });
    const result = await f.submit(); expect(result.status).toBe('failed'); expect(result.error?.code).toBe('invalid_result');
    expect(JSON.stringify(result)).not.toContain('unchecked'); expect(result.submittedScope).toEqual(message.submittedScope);
    expect(f.state.messages[0]?.question).toBe(body.question); expect(f.processor.process).toHaveBeenCalledOnce();
  });
  it('uses validated processor language, not invalid draft language, for canonical validation failure', async () => {
    const f = await fixture();
    const previous = { ...structuredClone(message), messageId: 'prior', requestId: 'prior' };
    previous.result = controlledFailure(previous, 'processing_unavailable', 'fr');
    f.state.messages.push(previous);
    f.processor.process.mockResolvedValue({ draft: { language: 'fr', blocks: 'invalid' }, sources: [], language: 'en-US' });
    const result = await submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { maxMessages: 2 });
    expect(result.status).toBe('failed'); expect(result.error?.code).toBe('invalid_result');
    expect(result.language).toBe('en'); expect(result.blocks[0]?.text).toBe('A valid result could not be produced at this time.');
    expect(f.processor.process).toHaveBeenCalledTimes(1);
  });
  it('records a safe invalid_result for NUL text instead of passing it to persistence', async () => {
    const f = await fixture();
    f.processor.process.mockResolvedValue({ draft: { ...draft, blocks: [{ ...draft.blocks[0], text: '\0Synthetic' }] }, sources: [source] });
    const result = await f.submit();
    expect(result.error?.code).toBe('invalid_result'); expect(result.status).toBe('failed');
    expect(result.blocks[0]?.text).not.toContain('\0'); expect(f.state.lease).toBeNull();
    expect(await f.submit()).toEqual(result); expect(f.processor.process).toHaveBeenCalledOnce();
  });
  it('forwards previous language for atomic factual-withdrawal conversion', async () => {
    const f = await fixture();
    f.state.messages.push({ ...message, requestId: 'prior', result: completeResult(message, draft, [source]) });
    f.processor.process.mockResolvedValue({ draft: { ...draft, language: 'de' }, sources: [source] });
    await submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { maxMessages: 2 });
    expect(f.store.finalize).toHaveBeenCalledWith(expect.objectContaining({ previousLanguage: 'en', result: expect.objectContaining({ language: 'de' }) }), expect.any(Function));
  });
  it('normalizes processor exceptions without publishing raw diagnostics or another call', async () => {
    const f = await fixture(); f.processor.process.mockRejectedValue(new Error('PRIVATE raw stack provider SQL'));
    const result = await f.submit(); expect(result.error?.code).toBe('processing_unavailable'); expect(JSON.stringify(result)).not.toContain('PRIVATE');
    expect(f.processor.process).toHaveBeenCalledOnce();
  });
  it('keeps unconfirmed persistence unknown instead of returning a draft or falsely recording failure', async () => {
    const f = await fixture(); vi.mocked(f.store.finalize).mockRejectedValue(new Error('D1 raw failure'));
    await expect(f.submit()).rejects.toEqual(new AdmissionRejected('result_unavailable'));
    expect(f.state.messages).toHaveLength(1); expect(f.state.messages[0]?.result).toBeUndefined(); expect(f.store.finalize).toHaveBeenCalledOnce();
    expect(f.state.lease).not.toBeNull(); expect(f.processor.process).toHaveBeenCalledOnce();
  });
  it('recovers a lost commit receipt through saved replay only', async () => {
    const f = await fixture();
    vi.mocked(f.store.finalize).mockImplementation(async (command) => {
      f.state.messages[0]!.result = structuredClone(command.result); f.state.lease = null;
      throw new Error('Lost commit receipt');
    });
    await expect(f.submit()).rejects.toMatchObject({ code: 'result_unavailable' });
    const canonical = f.state.messages[0]!.result; f.processor.process.mockClear();
    expect(await f.submit()).toEqual(canonical); expect(f.processor.process).not.toHaveBeenCalled(); expect(f.state.messages).toHaveLength(1);
  });
  it('keeps recorded scope failure non-retryable after restoration', async () => {
    const f = await fixture(); f.processor.process.mockResolvedValue({ failure: 'scope_unavailable', language: 'en' });
    const failed = await f.submit(); f.processor.process.mockResolvedValue({ draft, sources: [source] });
    expect(await f.submit()).toEqual(failed); expect(failed.error).toMatchObject({ retryable: false, retryMode: 'none' });
    expect(f.processor.process).toHaveBeenCalledOnce(); expect(f.state.messages).toHaveLength(1);
  });
  it('uses supported last saved language for a failure before processing supplies language', async () => {
    const f = await fixture(); const prior = { ...message, requestId: 'prior', result: completeResult(message, draft, [source]) };
    f.state.messages.push(prior); f.processor.process.mockRejectedValue(new Error('unavailable'));
    const result = await submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { maxMessages: 2 });
    expect(result.language).toBe('en'); expect(result.error?.message).toBe('Processing is currently unavailable.');
  });
  it.each(['de', 'EN-gb', 'fr-CA', 'invalid_tag'])('selects supported current then previous failure language (%s)', async (language) => {
    const f = await fixture();
    f.state.messages.push({ ...message, requestId: 'prior', result: completeResult(message, draft, [source]) });
    f.processor.process.mockResolvedValue({ failure: 'processing_unavailable', language });
    const result = await submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { maxMessages: 2 });
    expect(result.language).toBe(language === 'fr-CA' ? 'fr' : 'en');
    expect(f.processor.process).toHaveBeenCalledOnce();
  });
  it('synthetic adapter checks all original members and never adds new documents to its loaded pool', async () => {
    const f = await fixture();
    f.catalog.readSnapshot.mockResolvedValue({ ...publication, catalog: { ...publication.catalog, documents: publication.catalog.documents.slice(0, 1) } });
    expect(await new SyntheticConversationProcessor(f.catalog).process(message)).toEqual({ failure: 'scope_unavailable', language: 'fr' });
    for (const status of ['clarification', 'refused'] as const) {
      f.catalog.readSnapshot.mockClear();
      const output = await new SyntheticConversationProcessor(f.catalog, status).process(message);
      expect(JSON.stringify(output)).toContain('aucune attribution à BC'); expect(f.catalog.readSnapshot).not.toHaveBeenCalled();
    }
  });
});

describe('acquisition-to-confirmation deadlines', () => {
  async function bounded() {
    const f = await fixture(), time = manualTime(f.clock.now().getTime());
    f.clock.now = time.clock.now;
    const submit = (timing: Partial<AttemptTiming> = {}, processor: ConversationProcessor = f.processor) =>
      submitConversationQuestion(f.store, f.catalog, f.clock, processor, id, `Bearer ${token}`, body, {}, undefined, timing, time.timer);
    return { ...f, ...time, submit };
  }
  it('keeps the message transport wait separate and rejects invalid intervals before mutation', async () => {
    expect(messageTransportWaitMs()).toBe(45_000); expect(messageTransportWaitMs(60_000)).toBe(60_000);
    const f = await bounded();
    for (const overrides of [{ attemptMs: 0 }, { classifierMs: 29_000 }, { finalizeReserveMs: 30_000 },
      { browserWaitMs: Infinity }, { classifierMs: 0.1 }]) {
      expect(() => attemptTiming(overrides)).toThrow();
      await expect(f.submit(overrides)).rejects.toMatchObject({ code: 'result_unavailable' });
    }
    expect(f.store.admit).not.toHaveBeenCalled(); expect(f.timers.size).toBe(0);
  });
  it.each([27_999, 28_000, 30_000])('charges %i ms spent waiting for the acquisition receipt', async delay => {
    const f = await bounded(), admit = vi.mocked(f.store.admit).getMockImplementation()!;
    vi.mocked(f.store.admit).mockImplementation(async command => {
      const receipt = await admit(command); f.advance(delay, false); return receipt;
    });
    if (delay < 30_000) {
      const saved = await f.submit(); expect(saved.status).toBe(delay < 28_000 ? 'answered' : 'failed');
      if (saved.status === 'failed') expect(saved.error?.code).toBe('processing_unavailable');
      expect(f.store.finalize).toHaveBeenCalledOnce();
    } else {
      await expect(f.submit()).rejects.toMatchObject({ code: 'result_unavailable' });
      expect(f.store.finalize).not.toHaveBeenCalled(); expect(f.state.lease).not.toBeNull();
    }
    expect(f.processor.process).toHaveBeenCalledTimes(delay < 28_000 ? 1 : 0); expect(f.timers.size).toBe(0);
  });
  it.each([[40_000, 28_000, false], [3_000, 999, true], [3_000, 1_000, false]] as const)(
    'never borrows time from a future storage clock (lease %i, delay %i)', async (leaseMilliseconds, delay, canProcess) => {
      const f = await bounded(), admit = vi.mocked(f.store.admit).getMockImplementation()!;
      vi.mocked(f.store.admit).mockImplementation(async command => {
        const receipt = await admit(command);
        if ('lease' in receipt) receipt.lease.until += 60_000; // D1 clock independent of local clock
        f.advance(delay, false); return receipt;
      });
      const result = await submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { leaseMilliseconds }, undefined, {}, f.timer);
      expect(result.status).toBe(canProcess ? 'answered' : 'failed'); expect(f.processor.process).toHaveBeenCalledTimes(Number(canProcess));
    });
  it.each([1_999, 2_000])('rejects an unusable lease %i without a processing mutation', async leaseMilliseconds => {
    const f = await bounded();
    await expect(submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { leaseMilliseconds }))
      .rejects.toMatchObject({ code: 'result_unavailable' }); expect(f.store.admit).not.toHaveBeenCalled();
  });
  it('rechecks the last millisecond of outer work during classifier preparation without timer delivery', async () => {
    const f = await bounded(), admit = vi.mocked(f.store.admit).getMockImplementation()!;
    vi.mocked(f.store.admit).mockImplementation(async command => { const receipt = await admit(command); f.advance(27_999, false); return receipt; });
    const script = vi.fn(), continuation = { continue: vi.fn() }, provider = new ScriptedLLMProvider(script);
    const prepare = new ModelAwareIntentPreparation({ readSnapshot: async () => { f.advance(1, false); return publication; } }, provider);
    const saved = await f.submit({}, new ProfessionalIntentProcessor(provider, prepare, continuation));
    expect(saved.error?.code).toBe('processing_unavailable'); expect(script).not.toHaveBeenCalled(); expect(continuation.continue).not.toHaveBeenCalled();
  });
  it('retains validated direct English classification for timeout after classification despite French history', async () => {
    const f = await bounded(), prior = { ...message, messageId: 'prior', requestId: 'prior' };
    f.state.messages.push({ ...prior, result: controlledFailure(prior, 'processing_unavailable', 'fr') });
    const provider = new ScriptedLLMProvider(() => ({ decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: 'en', clarificationQuestion: 'Which project?' }));
    const professional = new ProfessionalIntentProcessor(provider, new ModelAwareIntentPreparation(f.catalog, provider), { continue: vi.fn() });
    const saved = await f.submit({}, { process: async (...args) => { const direct = await professional.process(...args); expect(direct).toHaveProperty('draft'); f.advance(28_000, false); return direct; } });
    expect(saved.error?.code).toBe('processing_unavailable'); expect(saved.language).toBe('en');
  });
  it('default timer wakes a stalled attempt at its configured cutoff, not before, and cleans up', async () => {
    const f = await fixture(), started = deferred<void>();
    f.processor.process.mockImplementation(async () => { started.resolve(); return new Promise<never>(() => {}); });
    vi.useFakeTimers();
    try {
      let settled = false;
      const post = submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body,
        {}, undefined, { attemptMs: 100, classifierMs: 5, finalizeReserveMs: 20 }).then(result => { settled = true; return result; });
      await started.promise; await vi.advanceTimersByTimeAsync(79);
      expect(settled).toBe(false); expect(f.store.finalize).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1); expect((await post).error?.code).toBe('processing_unavailable');
      expect(f.store.finalize).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
  it.each(['batch', 'between messages'])('stops historical graph reconstruction after cutoff at %s', async when => {
    let expired = false;
    const decode = vi.fn(), row = { id: 'first', submission_identity: '{}', get submitted_scope() { if (when === 'between messages') expired = true; return '{}'; } };
    const late = { get id() { decode(); return 'late'; } };
    const db = { prepare: () => ({ bind() { return this; } }), batch: async () => {
      if (when === 'batch') expired = true;
      return [[{}], when === 'batch' ? [late] : [row, late], [], [], [], [], []].map(results => ({ success: true, results }));
    } } as unknown as D1Database;
    await expect(new D1ConversationStore(db).readAdmissionState(id, hash, message.createdAt, () => { if (expired) throw new Error('deadline'); })).rejects.toThrow('deadline');
    expect(decode).not.toHaveBeenCalled();
  });
  it.each([19, 20])('bounds confirmation of the timeout failure itself (receipt after %i ms)', async delay => {
    const f = await bounded(), finalize = vi.mocked(f.store.finalize).getMockImplementation()!;
    f.processor.process.mockImplementation(async () => { f.advance(80, false); return { draft, sources: [source] }; });
    vi.mocked(f.store.finalize).mockImplementation(async command => {
      const canonical = await finalize(command); f.advance(delay, false); return canonical;
    });
    const post = f.submit({ attemptMs: 100, classifierMs: 15, finalizeReserveMs: 20 });
    if (delay === 20) await expect(post).rejects.toMatchObject({ code: 'result_unavailable' });
    else expect((await post).error?.code).toBe('processing_unavailable');
    expect((await f.submit()).error?.code).toBe('processing_unavailable'); expect(f.state.messages).toHaveLength(1);
    expect(f.store.finalize).toHaveBeenCalledOnce(); expect(f.processor.process).toHaveBeenCalledOnce(); expect(f.timers.size).toBe(0);
  });
  it('abandons a hanging acquisition without starting work when its receipt eventually arrives', async () => {
    const f = await bounded(), admit = vi.mocked(f.store.admit).getMockImplementation()!;
    const entered = deferred<void>(), release = deferred<void>();
    vi.mocked(f.store.admit).mockImplementation(async command => {
      const receipt = await admit(command); entered.resolve(); await release.promise; return receipt;
    });
    const post = f.submit(); await entered.promise; f.advance(30_000);
    await expect(post).rejects.toMatchObject({ code: 'result_unavailable' }); release.resolve();
    f.advance(10_000); await expect(f.submit()).rejects.toMatchObject({ code: 'result_unavailable' });
    expect(f.state.messages).toHaveLength(1); expect(f.store.admit).toHaveBeenCalledOnce();
    expect(f.processor.process).not.toHaveBeenCalled(); expect(f.store.finalize).not.toHaveBeenCalled(); expect(f.timers.size).toBe(0);
  });
  it('bounds a hung post-acquisition read; a late snapshot cannot start processing', async () => {
    const f = await bounded(), read = vi.mocked(f.store.readAdmissionState).getMockImplementation()!;
    const entered = deferred<void>(), release = deferred<void>();
    vi.mocked(f.store.readAdmissionState).mockImplementation(async (...args) => {
      const state = await read(...args); if (state?.lease) { entered.resolve(); await release.promise; } return state;
    });
    const post = f.submit(); await entered.promise; f.advance(28_000); const saved = await post;
    expect(saved.error).toMatchObject({ code: 'processing_unavailable', retryMode: 'new_request', retryable: true });
    release.resolve(); expect(await f.submit()).toEqual(saved); expect(f.processor.process).not.toHaveBeenCalled();
    expect(f.store.finalize).toHaveBeenCalledOnce(); expect(f.state.lease).toBeNull(); expect(f.timers.size).toBe(0);
  });
  it.each(['classifier', 'retrieval', 'generator'])('bounds ignoring %s and never continues or overwrites its failure', async stage => {
    const f = await bounded(), entered = deferred<void>(), release = deferred<void>();
    async function hang() { entered.resolve(); await release.promise; }
    const classifier = new ScriptedLLMProvider(vi.fn(async () => {
      if (stage === 'classifier') await hang();
      return { decision: 'answer', reasonCode: 'professional_question', responseLanguage: 'en', professionalTopic: 'Fiction', resolvedQuestion: 'Which example?', searchTerms: ['fiction'] };
    }));
    const generate = new ScriptedAnswerGenerator(async () => {
      if (stage === 'generator') await hang(); return { status: 'answered', outputLanguage: 'en', blocks: draft.blocks };
    });
    const classify = vi.spyOn(classifier, 'classify'), generation = vi.spyOn(generate, 'generateAnswer');
    const retrieve = vi.fn<GenerationRetriever['retrieveForGeneration']>(async () => { if (stage === 'retrieval') await hang(); return { chunks: [source.chunk] }; });
    const processor = new ProfessionalIntentProcessor(classifier, new ModelAwareIntentPreparation(f.catalog, classifier), new EligibleEvidenceContinuation({ retrieveForGeneration: retrieve }, generate));
    const post = f.submit({}, processor); await entered.promise;
    f.advance(stage === 'classifier' ? 5_000 : 28_000);
    const saved = await post; expect(saved.error?.code).toBe('processing_unavailable');
    expect(saved.sourceExcerpts).toEqual([]);
    expect(saved.language).toBe(stage === 'classifier' ? 'fr' : 'en');
    if (stage === 'retrieval') expect(retrieve.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    else expect((stage === 'classifier' ? classify : generation).mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    release.reject(new Error('Late synthetic rejection')); expect(await f.submit()).toEqual(saved);
    expect(classify).toHaveBeenCalledOnce(); expect(retrieve).toHaveBeenCalledTimes(stage === 'classifier' ? 0 : 1);
    expect(generation).toHaveBeenCalledTimes(stage === 'generator' ? 1 : 0); expect(f.store.finalize).toHaveBeenCalledOnce();
    expect(f.state.messages).toHaveLength(1); expect(f.timers.size).toBe(0);
  });
  it('bounds a never-confirmed finalization and leaves its lease and logical message intact', async () => {
    const f = await bounded(), entered = deferred<void>(), release = deferred<never>();
    vi.mocked(f.store.finalize).mockImplementation(async () => { entered.resolve(); return release.promise; });
    const post = f.submit(); await entered.promise; f.advance(30_000);
    await expect(post).rejects.toMatchObject({ code: 'result_unavailable' }); release.reject(new Error('Late failure'));
    expect(f.state.lease).not.toBeNull(); expect(f.state.messages[0]?.result).toBeUndefined(); expect(f.state.messages).toHaveLength(1);
    expect(f.store.finalize).toHaveBeenCalledOnce(); expect(f.timers.size).toBe(0);
  });
});

describe('offline provider with authenticated admission and finalization', () => {
  const question = '  Fictional API key DEMO-123 and visitor@example.invalid: what is documented?\r\n';
  const input = { ...body, requestId: 'APP_REQUEST_ID', question };
  async function pipeline() {
    const f = await fixture(), run = vi.fn<FixtureInferenceBinding['run']>();
    const classifier = { model: WORKERS_AI_CANDIDATE, budget: DEFAULT_MODEL_CONTEXT_BUDGET } as const;
    const provider = selectProvider({ mode: 'workers-ai-offline', isProxy, binding: { kind: 'local-fixture', run }, classifier,
      generator: { ...classifier, budget: { ...classifier.budget, output: 1000 } } });
    const retrieve = vi.fn(async () => ({ chunks: [source.chunk] }));
    const processor = new ProfessionalIntentProcessor(provider, new ModelAwareIntentPreparation(f.catalog, provider), new EligibleEvidenceContinuation({ retrieveForGeneration: retrieve }, provider));
    const snapshot = vi.fn<() => { confirmedUnavailable: true; resumeAt?: number } | null>(() => null);
    const submit = (value = input) => submitConversationQuestion(f.store, f.catalog, f.clock, processor, id, `Bearer ${token}`, value, {}, snapshot);
    return { ...f, run, snapshot, submit, retrieve };
  }
  it.each(['object', 'text'])('preserves visitor text without application sentinels in both wire payloads (%s responses)', async (format) => {
    const response = (value: object) => ({ response: format === 'text' ? JSON.stringify(value) : value });
    const f = await pipeline();
    f.catalog.readSnapshot.mockResolvedValue({ ...publication, documents: [{ documentId: 'doc', sourceTitle: 'Public topic', sourceRevision: revision, sourcePath: 'content/public/doc.md', metadata: { document_id: 'doc', visibility: 'public', title: 'Public topic', aliases: ['Public alias'], created_at: message.createdAt, modified_at: message.createdAt, reviewed_at: message.createdAt, reviewed_by: 'EXCLUDED_REVIEWER' } }] });
    const prior = { ...structuredClone(message), question: 'A fictional prior question', requestId: 'APP_PRIOR_ID' };
    const result = completeResult(prior, draft, [source]);
    result.sourceExcerpts[0]!.excerpt = 'PRIVATE_SOURCE_FIXTURE_NOT_FOR_PROMPT';
    f.state.messages.push({ ...prior, result });
    f.run.mockResolvedValueOnce(response({ decision: 'answer', reasonCode: 'professional_question', responseLanguage: 'en', professionalTopic: 'Fiction', resolvedQuestion: 'Which example?', searchTerms: ['fiction'] }))
      .mockResolvedValueOnce(response({ status: 'answered', outputLanguage: 'en', blocks: draft.blocks }));
    const saved = await f.submit(); expect(saved.status).toBe('answered'); expect(saved.sourceExcerpts[0]?.excerpt).toBe(source.chunk.text);
    expect(f.run).toHaveBeenCalledTimes(2); expect(f.retrieve).toHaveBeenCalledOnce();
    for (const [index, [model, wire, options]] of f.run.mock.calls.entries()) {
      expect(model).toBe(WORKERS_AI_CANDIDATE); expect(options).toEqual({ signal: expect.any(AbortSignal) });
      expect(Object.keys(wire).sort()).toEqual(['max_tokens', 'messages', 'response_format', 'stream']);
      expect(wire.stream).toBe(false); expect(wire.max_tokens).toBe(index === 0 ? 2000 : 1000);
      expect(wire.messages.map((m) => m.role)).toEqual(['system', 'user']); expect(wire.messages[0].content).not.toContain('DEMO-123');
      const data = JSON.parse(wire.messages[1].content); expect(data.question).toBe(question);
      expect(data.conversationContext).toEqual([{ role: 'user', text: prior.question }, { role: 'assistant', text: draft.blocks.map((b) => b.text).join('\n') }]);
      if (index === 0) {
        expect(Object.keys(data).sort()).toEqual(['conversationContext', 'documentaryScope', 'languagePolicy', 'publicCatalog', 'question']);
        expect(data.publicCatalog).toEqual([{ topic: 'Public topic', aliases: ['Public alias'] }]);
        expect(data.documentaryScope).toEqual({ mode: 'global_public', resourceNames: [] });
      } else {
        expect(Object.keys(data).sort()).toEqual(['answerPolicy', 'conversationContext', 'question', 'reasonCode', 'resolvedQuestion', 'responseLanguage', 'scopeDecision', 'sourceChunks']);
        expect(wire.response_format.json_schema).toMatchObject({ additionalProperties: false, required: ['status', 'outputLanguage', 'blocks'] });
        expect(data.sourceChunks).toEqual([{ responseLocalId: 'S1', documentId: 'doc', sourcePath: source.chunk.sourcePath, sourceTitle: source.chunk.sourceTitle,
          sectionTitle: null, location: source.chunk.location, text: source.chunk.text }]);
      }
      for (const sentinel of [id, token, await hashSessionToken(token), input.requestId, prior.requestId, saved.messageId, revision, hash,
        'PRIVATE_SOURCE_FIXTURE_NOT_FOR_PROMPT', 'EXCLUDED_REVIEWER', 'chunkId']) expect(JSON.stringify(wire)).not.toContain(sentinel);
    }
  });
  it.each([true, false])('blocks only new affected admissions, confirmed time present: %s', async (known) => {
    const f = await pipeline(), resumeAt = f.clock.now().getTime() + 86400000;
    f.snapshot.mockReturnValue({ confirmedUnavailable: true, ...(known ? { resumeAt } : {}) });
    const original = structuredClone(input);
    await expect(f.submit()).rejects.toMatchObject({ code: 'provider_unavailable', resumeAt: known ? new Date(resumeAt).toISOString() : undefined });
    expect(input).toEqual(original); expect(f.state).toEqual({ messages: [], lease: null }); expect(f.store.admit).not.toHaveBeenCalled(); expect(f.run).not.toHaveBeenCalled();
    expect((await readConversation(f.store, f.clock, id, `Bearer ${token}`, f.catalog, undefined, true, f.snapshot)).admission)
      .toEqual({ available: false, reason: 'processing_unavailable', ...(known ? { resumeAt: new Date(resumeAt).toISOString() } : {}) });
    f.snapshot.mockReturnValue({ confirmedUnavailable: true, resumeAt: f.clock.now().getTime() });
    f.run.mockRejectedValue({ status: 429, code: 3036, message: 'RAW_DIAGNOSTIC' });
    const saved = await f.submit(); expect(saved.error?.code).toBe('processing_unavailable'); expect(JSON.stringify(saved)).not.toContain('RAW_DIAGNOSTIC');
    f.snapshot.mockClear(); f.snapshot.mockReturnValue({ confirmedUnavailable: true });
    expect(await f.submit()).toEqual(saved); await expect(f.submit({ ...input, question: 'changed' })).rejects.toMatchObject({ code: 'request_conflict' });
    expect(f.snapshot).not.toHaveBeenCalled(); expect(f.run).toHaveBeenCalledOnce(); expect(f.retrieve).not.toHaveBeenCalled(); expect(f.state.messages).toHaveLength(1);
  });
  const answer = { response: { decision: 'answer', reasonCode: 'professional_question', responseLanguage: 'en', professionalTopic: 'Fiction', resolvedQuestion: 'Which example?', searchTerms: ['fiction'] } };
  it.each(['classifier', 'generator'])('saves invalid_result for malformed %s JSON, without repair', async (role) => {
    const f = await pipeline(); if (role === 'generator') f.run.mockResolvedValueOnce(answer);
    f.run.mockResolvedValueOnce({ response: 'RAW_MALFORMED' });
    const saved = await f.submit(); expect(saved.error?.code).toBe('invalid_result'); expect(JSON.stringify(saved)).not.toContain('RAW_MALFORMED');
    expect(await f.submit()).toEqual(saved); expect(f.run).toHaveBeenCalledTimes(role === 'generator' ? 2 : 1);
  });
  it('saves generator-only refusal, replays it, and permits classifier-only work', async () => {
    const f = await pipeline(); f.run.mockResolvedValueOnce(answer).mockRejectedValueOnce({ status: 429, code: 3040 });
    const saved = await f.submit(); expect(saved.error?.code).toBe('processing_unavailable'); expect(await f.submit()).toEqual(saved); expect(f.run).toHaveBeenCalledTimes(2);
    f.run.mockResolvedValueOnce({ response: { decision: 'clarify', reasonCode: 'material_ambiguity', responseLanguage: 'en', clarificationQuestion: 'Which example?' } });
    expect((await f.submit({ ...input, requestId: 'new', question: 'Which one?' })).status).toBe('clarification'); expect(f.run).toHaveBeenCalledTimes(3); expect(f.retrieve).toHaveBeenCalledOnce();
  });
  it('preserves authenticated history when readiness or its fields throw; never shows expired time after I/O', async () => {
    const f = await fixture(); const saved = await f.submit(); let now = f.clock.now().getTime(); f.clock.now = () => new Date(now);
    const fail = (): never => { throw new Error('Fixture observation failed'); };
    const view = (snapshot: () => { confirmedUnavailable: true; resumeAt?: number } | null) => readConversation(f.store, f.clock, id, `Bearer ${token}`, f.catalog, undefined, true, snapshot);
    for (const snapshot of [fail, () => ({ get confirmedUnavailable(): true { return fail(); } })]) {
      const result = await view(snapshot); expect(result.transcript[0]?.result).toEqual(saved); expect(result.admission).toEqual({ available: true });
    }
    expect((await view(() => ({ confirmedUnavailable: true, get resumeAt(): number { return fail(); } }))).admission).toEqual({ available: false, reason: 'processing_unavailable' });
    const resumeAt = now + 100; f.catalog.readSnapshot.mockImplementationOnce(async () => { now = resumeAt; return publication; });
    expect((await view(() => ({ confirmedUnavailable: true, resumeAt }))).admission).toEqual({ available: true });
  });
  it.each([true, false])('rechecks replay and last-slot races before outage rejection (same request: %s)', async (same) => {
    const f = await fixture(), saved = completeResult(message, draft, [source]);
    f.catalog.readSnapshot.mockImplementationOnce(async () => { f.state.messages.push({ ...message, requestId: same ? body.requestId : 'other', result: saved }); return publication; });
    const pending = submitConversationQuestion(f.store, f.catalog, f.clock, f.processor, id, `Bearer ${token}`, body, { maxMessages: 1 }, () => ({ confirmedUnavailable: true }));
    if (same) await expect(pending).resolves.toEqual(saved); else await expect(pending).rejects.toMatchObject({ code: 'turn_limit_reached' });
    expect(f.store.admit).not.toHaveBeenCalled(); expect(f.processor.process).not.toHaveBeenCalled();
  });
  it('does not retry a rejected admitted call when saving its failure is uncertain', async () => {
    const f = await pipeline(); f.run.mockRejectedValue({ status: 408, code: 3007 }); vi.mocked(f.store.finalize).mockRejectedValue(new Error('Injected failure'));
    await expect(f.submit()).rejects.toMatchObject({ code: 'result_unavailable' }); f.snapshot.mockReturnValue({ confirmedUnavailable: true });
    await expect(f.submit()).rejects.toMatchObject({ code: 'request_in_progress' }); expect(f.run).toHaveBeenCalledOnce();
    expect(f.state.messages).toHaveLength(1); expect(f.state.messages[0]?.result).toBeUndefined(); expect(f.store.finalize).toHaveBeenCalledOnce();
  });
});
