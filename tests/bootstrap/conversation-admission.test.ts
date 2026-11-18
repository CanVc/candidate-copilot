import { describe, expect, it, vi } from 'vitest';
import { admitConversationQuestion } from '../../src/application/conversation-admission.ts';
import { CONVERSATION_RETENTION_MS, hashSessionToken, readConversation } from '../../src/application/conversations.ts';
import { AdmissionRejected, admissionLimits, countQuestionCharacters, normalizeSubmission, sameIdentity, type AdmissionState } from '../../src/shared/conversation-admission.ts';
import { ConversationUnavailable } from '../../src/shared/conversation.ts';
import type { AtomicAdmission, ConversationStore } from '../../src/ports/ConversationStore.ts';
import type { PublicPublication } from '../../src/ports/ResourceCatalog.ts';

const conversationId = '11111111-1111-4111-8111-111111111111';
const token = 'a'.repeat(64);
const revision = 'b'.repeat(40), hash = 'c'.repeat(64);
const request = (requestId = 'request-1', question = '  Épreuve 😀\r\n e\u0301  ') => ({ requestId, question, selection: { resourceIds: [], catalogRevision: revision, catalogHash: hash } });
const publication: PublicPublication = {
  catalogRevision: revision, catalogHash: hash, catalogAssetPath: `/assets/resources-catalog.${hash}.json`,
  catalog: { version: 1, catalogRevision: revision, resources: [], documents: [{ documentId: 'd-a', sourcePath: 'content/public/a.md' }, { documentId: 'zero-chunk', sourcePath: 'content/public/empty.md' }] },
  documents: [], chunks: [],
};
async function fixture() {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const created = now, tokenHash = await hashSessionToken(token);
  let exists = true;
  const state: AdmissionState = { messages: [], lease: null };
  const clock = { now: () => new Date(now) };
  const catalog = { readSnapshot: vi.fn(async (): Promise<PublicPublication | null> => structuredClone(publication)) };
  const store: ConversationStore = {
    create: vi.fn(), cleanupCreationLimits: vi.fn(), dailyCreationKey: vi.fn(),
    findAuthenticated: vi.fn(async (id, credential, after) => exists && id === conversationId && credential === tokenHash && new Date(created).toISOString() > after ? { conversationId } : null),
    readAdmissionState: vi.fn(async () => structuredClone(state)),
    admit: vi.fn(async (command: AtomicAdmission) => {
      if (!exists || now >= created + CONVERSATION_RETENTION_MS) throw new ConversationUnavailable();
      let message = state.messages.find((m) => m.requestId === command.requestId);
      const status = message ? 'recovered' as const : 'admitted' as const;
      if (!message) {
        if (command.identity.kind !== 'direct') throw new Error('unsupported fixture');
        message = { messageId: command.messageId, requestId: command.requestId, question: command.identity.question, createdAt: clock.now().toISOString(),
          contextAnchorMessageId: command.messageId, submissionIdentity: command.identity, submittedScope: { version: 1, mode: 'global_public', resources: [],
            catalogRevision: command.publication.catalogRevision, catalogHash: command.publication.catalogHash, eligibleDocumentIds: command.publication.catalog.documents.map((d) => d.documentId) } };
        state.messages.push(message);
      }
      state.lease = { requestId: command.requestId, attemptId: command.attemptId, until: now + command.limits.leaseMilliseconds };
      return structuredClone({ status, message, lease: state.lease });
    }),
  };
  const submit = (body: unknown = request(), action: 'submit' | 'recover' = 'submit', limits = {}) => admitConversationQuestion(store, catalog, clock, conversationId, `Bearer ${token}`, body, action, limits);
  return { store, state, clock, catalog, submit, advance: (ms = 40_000) => { now += ms; }, remove: () => { exists = false; } };
}

describe('conversation-admission portable service', () => {
  it('atomically passes exact identity/global membership and fresh server ownership with self context anchor', async () => {
    const f = await fixture();
    const result = await f.submit();
    expect(result.status).toBe('admitted');
    expect(result.message.question).toBe(request().question);
    expect(result.message.contextAnchorMessageId).toBe(result.message.messageId);
    expect(result.message.submittedScope).toEqual({ version: 1, mode: 'global_public', resources: [], catalogRevision: revision, catalogHash: hash, eligibleDocumentIds: ['d-a', 'zero-chunk'] });
    expect(f.store.admit).toHaveBeenCalledOnce();
    expect(f.state.lease?.attemptId).not.toBe(result.message.requestId);
    expect(f.state.lease?.until).toBe(f.clock.now().getTime() + 40_000);
  });
  it.each(['é', '😀', '\r', '\n', '\u0301'])('counts 1000 %j code points without truncation', async (character) => {
    const f = await fixture();
    expect(countQuestionCharacters(character.repeat(1000))).toBe(1000);
    const prefix = character === '\r' || character === '\n' ? 'a' : character;
    await expect(f.submit(request('long', prefix + character.repeat(1000)))).rejects.toMatchObject({ code: 'invalid_request' });
    expect(f.state.messages).toEqual([]);
    const exact = prefix + character.repeat(999);
    expect((await f.submit(request('exact', exact))).message.question).toBe(exact);
  });
  it('counts CRLF twice, astral once and decomposed accent twice without normalization', () => {
    expect(countQuestionCharacters('é😀\r\ne\u0301')).toBe(6);
    expect(normalizeSubmission(request('x', 'é')).identity).not.toEqual(normalizeSubmission(request('x', 'e\u0301')).identity);
  });
  it('normalizes duplicate reordered case-sensitive Resource sets and preserves body variants', () => {
    const a = normalizeSubmission({ ...request(), selection: { ...request().selection, resourceIds: ['b', 'A', 'b', 'a'] } });
    const b = normalizeSubmission({ ...request(), selection: { ...request().selection, resourceIds: ['a', 'b', 'A'] } });
    expect(sameIdentity(a.identity, b.identity)).toBe(true);
    expect(a.identity).toMatchObject({ resourceIds: ['A', 'a', 'b'] });
    expect(sameIdentity(a.identity, normalizeSubmission(request()).identity)).toBe(false);
    expect(sameIdentity(normalizeSubmission({ requestId: 'r', retryOfRequestId: 'a' }).identity, normalizeSubmission({ requestId: 'r', retryOfRequestId: 'b' }).identity)).toBe(false);
  });
  it.each([
    {}, null, { ...request(), extra: true }, { ...request(), retryOfRequestId: 'old' }, { ...request(), submittedScope: {} },
    request('x', ''), request('x', ' \r\n '), request('x', '\ud800'), { ...request(), selection: { ...request().selection, documentIds: ['d-a'] } },
    { ...request(), selection: { ...request().selection, catalogHash: 'invalid' } },
  ])('rejects malformed request without mutation: %j', async (body) => {
    const f = await fixture();
    await expect(f.submit(body)).rejects.toBeInstanceOf(AdmissionRejected);
    expect(f.store.admit).not.toHaveBeenCalled();
  });
  it('authenticates before normalization or saved lookup, including expired/deleted/crossed access', async () => {
    const f = await fixture();
    for (const auth of [undefined, 'Bearer bad', `Bearer ${'f'.repeat(64)}`]) {
      await expect(admitConversationQuestion(f.store, f.catalog, f.clock, conversationId, auth, {}, 'submit')).rejects.toBeInstanceOf(ConversationUnavailable);
    }
    f.advance(CONVERSATION_RETENTION_MS);
    await expect(f.submit()).rejects.toBeInstanceOf(ConversationUnavailable);
    expect(f.store.readAdmissionState).not.toHaveBeenCalled();
    expect(f.catalog.readSnapshot).not.toHaveBeenCalled();
  });
  it.each([
    { ...request(), question: request().question.trim() },
    { ...request(), selection: { ...request().selection, catalogRevision: 'd'.repeat(40) } },
    { ...request(), selection: { ...request().selection, catalogHash: 'd'.repeat(64) } },
    { ...request(), selection: { ...request().selection, resourceIds: ['x'] } },
    { requestId: request().requestId, retryOfRequestId: 'old' },
  ])('saved identity conflicts before live catalog validation: %j', async (body) => {
    const f = await fixture(); await f.submit(); f.catalog.readSnapshot.mockClear(); f.catalog.readSnapshot.mockResolvedValue(null);
    await expect(f.submit(body)).rejects.toMatchObject({ code: 'request_conflict' });
    expect(f.catalog.readSnapshot).not.toHaveBeenCalled(); expect(f.state.messages).toHaveLength(1);
  });
  it.each(['', ' \r\n '])('blank text %j is new-message eligibility, not saved identity normalization', async (question) => {
    const f = await fixture();
    expect(normalizeSubmission(request('blank', question)).identity).toMatchObject({ question });
    await expect(f.submit(request('blank', question))).rejects.toMatchObject({ code: 'invalid_request' });
    expect(f.store.admit).not.toHaveBeenCalled();
    await f.submit(); const before = structuredClone(f.state);
    await expect(f.submit(request('request-1', question))).rejects.toMatchObject({ code: 'request_conflict' });
    f.advance();
    await expect(f.submit(request('request-1', question), 'recover')).rejects.toMatchObject({ code: 'request_conflict' });
    expect(f.state).toEqual(before);
    for (const malformed of [{ ...request(), question: null }, request('request-1', '\ud800'), { ...request(), extra: true }]) {
      await expect(f.submit(malformed)).rejects.toMatchObject({ code: 'invalid_request' });
    }
  });
  it.each(['absent', 'empty', 'stale'] as const)('rechecks saved identity/owner before %s publication rejection', async (kind) => {
    for (const changed of [false, true]) {
      const f = await fixture();
      let winnerState: AdmissionState;
      f.catalog.readSnapshot.mockImplementationOnce(async () => {
        await f.submit(changed ? request('request-1', 'winner text') : request());
        winnerState = structuredClone(f.state);
        if (kind === 'absent') return null;
        if (kind === 'empty') return { ...publication, catalog: { ...publication.catalog, documents: [] } };
        return { ...publication, catalogHash: 'd'.repeat(64) };
      });
      await expect(f.submit()).rejects.toMatchObject({ code: changed ? 'request_conflict' : 'request_in_progress' });
      expect(f.state).toEqual(winnerState!);
      expect(f.store.admit).toHaveBeenCalledTimes(1);
      expect(f.store.readAdmissionState).toHaveBeenCalledTimes(3);
      expect(f.catalog.readSnapshot).toHaveBeenCalledTimes(2);
    }
  });
  it('rechecks the saved owner before withdrawn-scope rejection without remapping or reacquiring', async () => {
    const f = await fixture(); const first = await f.submit(); f.advance();
    let winnerState: AdmissionState;
    f.catalog.readSnapshot.mockImplementationOnce(async () => {
      await f.submit(request(), 'recover');
      winnerState = structuredClone(f.state);
      return { ...publication, catalog: { ...publication.catalog, documents: [publication.catalog.documents[0]!] } };
    });
    await expect(f.submit(request(), 'recover')).rejects.toMatchObject({ code: 'request_in_progress' });
    expect(f.state).toEqual(winnerState!);
    expect(f.state.messages).toEqual([first.message]);
    expect(f.store.admit).toHaveBeenCalledTimes(2);
    expect(f.catalog.readSnapshot).toHaveBeenCalledTimes(3);
  });
  it('rechecked interrupted identity wins over publication rejection without automatic recovery', async () => {
    const f = await fixture();
    let winnerState: AdmissionState;
    f.catalog.readSnapshot.mockImplementationOnce(async () => {
      await f.submit(); f.advance(); winnerState = structuredClone(f.state);
      return null;
    });
    const result = await f.submit();
    expect(result).toEqual({ status: 'interrupted', message: winnerState!.messages[0] });
    expect(f.state).toEqual(winnerState!); expect(f.store.admit).toHaveBeenCalledTimes(1);
  });
  it('distinguishes duplicate in-progress and distinct busy without live-catalog dependence/count', async () => {
    const f = await fixture(); await f.submit(); f.catalog.readSnapshot.mockClear(); f.catalog.readSnapshot.mockResolvedValue(null);
    await expect(f.submit()).rejects.toMatchObject({ code: 'request_in_progress' });
    await expect(f.submit(request('other'))).rejects.toMatchObject({ code: 'conversation_busy' });
    expect(f.catalog.readSnapshot).not.toHaveBeenCalled(); expect(f.state.messages).toHaveLength(1);
  });
  it('never automatically recovers; explicit recovery preserves immutable scope/count/anchor at cap', async () => {
    const f = await fixture(); const first = await f.submit(request(), 'submit', { maxMessages: 1 }); const lease = f.state.lease;
    f.advance();
    expect((await f.submit()).status).toBe('interrupted'); expect(f.state.lease).toEqual(lease);
    const recovered = await f.submit(request(), 'recover', { maxMessages: 1 });
    expect(recovered.status).toBe('recovered'); expect(recovered.message).toEqual(first.message);
    expect(f.state.lease?.attemptId).not.toBe(lease?.attemptId); expect(f.state.messages).toHaveLength(1);
  });
  it('new normal question after interruption counts and protects its owner from old recovery', async () => {
    const f = await fixture(); const original = await f.submit(); f.advance(); await f.submit(request('new'));
    await expect(f.submit(request(), 'recover')).rejects.toMatchObject({ code: 'conversation_busy' });
    expect(f.state.messages[0]).toEqual(original.message); expect(f.state.messages).toHaveLength(2);
    f.advance(); const recovered = await f.submit(request(), 'recover'); expect(recovered.message).toEqual(original.message);
  });
  it('enforces default 20 admitted turns and configurable count/character/lease limits', async () => {
    const f = await fixture();
    for (let i = 0; i < 20; i++) { await f.submit(request(`r-${i}`)); f.advance(); }
    await expect(f.submit(request('21'))).rejects.toMatchObject({ code: 'turn_limit_reached' });
    await f.submit(request('r-0'), 'recover'); expect(f.state.messages).toHaveLength(20);
    const g = await fixture();
    await expect(g.submit(request('x', 'abc'), 'submit', { maxQuestionCharacters: 2 })).rejects.toMatchObject({ code: 'invalid_request' });
    await g.submit(request('x', '😀é'), 'submit', { maxQuestionCharacters: 2, maxMessages: 1, leaseMilliseconds: 7 });
    expect(g.state.lease?.until).toBe(g.clock.now().getTime() + 7); g.advance(7);
    await expect(g.submit(request('y'), 'submit', { maxMessages: 1 })).rejects.toMatchObject({ code: 'turn_limit_reached' });
    for (const n of [0, -1, NaN, Infinity, 1.5]) expect(() => admissionLimits({ maxMessages: n })).toThrow();
  });
  it('rejects unsupported new variants and explicit recovery of unknown requests without admission', async () => {
    const f = await fixture();
    await expect(f.submit({ ...request(), selection: { ...request().selection, resourceIds: ['x'] } })).rejects.toMatchObject({ code: 'invalid_scope' });
    await expect(f.submit({ requestId: 'retry', retryOfRequestId: 'x' })).rejects.toMatchObject({ code: 'invalid_retry' });
    await expect(f.submit(request(), 'recover')).rejects.toMatchObject({ code: 'invalid_request' });
    expect(f.store.admit).not.toHaveBeenCalled();
  });
  it('rejects stale/absent/empty publication without count, and withdrawn recovery never remaps', async () => {
    const f = await fixture();
    await expect(f.submit({ ...request(), selection: { ...request().selection, catalogHash: 'e'.repeat(64) } })).rejects.toMatchObject({ code: 'catalog_stale' });
    f.catalog.readSnapshot.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...publication, catalog: { ...publication.catalog, documents: [] } });
    for (let i = 0; i < 2; i++) await expect(f.submit()).rejects.toMatchObject({ code: 'scope_unavailable' });
    expect(f.state.messages).toEqual([]); const admitted = await f.submit(); f.advance();
    f.catalog.readSnapshot.mockResolvedValue({ ...publication, catalog: { ...publication.catalog, documents: [publication.catalog.documents[0]!] } });
    await expect(f.submit(request(), 'recover')).rejects.toMatchObject({ code: 'scope_unavailable' });
    expect(f.state.messages).toEqual([admitted.message]);
  });
  it('retains original scope when current publication adds members and changes identity', async () => {
    const f = await fixture(); const original = await f.submit(); f.advance();
    f.catalog.readSnapshot.mockResolvedValue({ ...publication, catalogHash: 'd'.repeat(64), catalog: { ...publication.catalog, documents: [...publication.catalog.documents, { documentId: 'new', sourcePath: 'content/public/new.md' }] } });
    expect((await f.submit(request(), 'recover')).message).toEqual(original.message);
  });
  it('rechecks existence/retention at the mutation port and redacts rollback errors', async () => {
    const f = await fixture();
    f.catalog.readSnapshot.mockImplementationOnce(async () => { f.remove(); return publication; });
    await expect(f.submit()).rejects.toBeInstanceOf(ConversationUnavailable);
    expect(f.state.messages).toEqual([]);
    const g = await fixture(); g.store.admit = vi.fn(async () => { throw new Error('private SQL'); });
    await expect(g.submit()).rejects.toMatchObject({ code: 'result_unavailable', message: 'result_unavailable' });
  });
  it.each(['state', 'catalog'] as const)('classifies lease expiry after a delayed %s read', async (delayed) => {
    const f = await fixture(); await f.submit(); const before = structuredClone(f.state);
    if (delayed === 'state') vi.mocked(f.store.readAdmissionState).mockImplementationOnce(async () => {
      f.advance(); return structuredClone(f.state);
    });
    else f.catalog.readSnapshot.mockImplementationOnce(async () => { f.advance(); return publication; });
    const view = await readConversation(f.store, f.clock, conversationId, `Bearer ${token}`, f.catalog);
    expect(view.processing).toEqual({ status: 'idle' });
    expect(view.admission).toEqual({ available: true });
    expect(view.transcript[0]?.status).toBe('interrupted'); expect(f.state).toEqual(before);
  });
  it('authoritative reads expose ordered immutable transcript, never attempts or saved identities, and never renew', async () => {
    const f = await fixture(); await f.submit(); const original = structuredClone(f.state);
    const view = await readConversation(f.store, f.clock, conversationId, `Bearer ${token}`, f.catalog);
    expect(view.processing).toEqual({ status: 'in_progress', requestId: 'request-1' });
    expect(view.admission).toEqual({ available: false, reason: 'conversation_busy' });
    expect(view.transcript[0]?.status).toBe('in_progress'); expect(JSON.stringify(view)).not.toContain(f.state.lease!.attemptId);
    expect(view.transcript[0]).not.toHaveProperty('submissionIdentity'); expect(f.state).toEqual(original);
    f.advance(); expect((await readConversation(f.store, f.clock, conversationId, `Bearer ${token}`, f.catalog)).transcript[0]?.status).toBe('interrupted');
  });
});
