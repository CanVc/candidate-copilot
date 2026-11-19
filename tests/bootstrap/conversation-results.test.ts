import { describe, expect, it, vi } from 'vitest';
import { completeResult, controlledFailure, validateConversationResult, type ResultDraft, type LoadedSource } from '../../src/shared/conversation-result.ts';
import { AdmissionRejected, type AdmissionState, type AdmittedMessage } from '../../src/shared/conversation-admission.ts';
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
      const admitted = { ...structuredClone(message), messageId: command.messageId, contextAnchorMessageId: command.messageId, requestId: command.requestId };
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
  it('normalizes malformed output into recorded failure, preserving the admitted exact message and scope', async () => {
    const f = await fixture(); f.processor.process.mockResolvedValue({ draft: { ...draft, blocks: [{ kind: 'paragraph', text: 'unchecked', sourceIds: ['forged'] }] }, sources: [source] });
    const result = await f.submit(); expect(result.status).toBe('failed'); expect(result.error?.code).toBe('invalid_result');
    expect(JSON.stringify(result)).not.toContain('unchecked'); expect(result.submittedScope).toEqual(message.submittedScope);
    expect(f.state.messages[0]?.question).toBe(body.question); expect(f.processor.process).toHaveBeenCalledOnce();
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
    expect(f.store.finalize).toHaveBeenCalledWith(expect.objectContaining({ previousLanguage: 'en', result: expect.objectContaining({ language: 'de' }) }));
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
