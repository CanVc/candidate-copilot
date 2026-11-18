import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConversation, readConversation, CONVERSATION_RETENTION_MS, hashSessionToken } from '../../src/application/conversations.ts';
import type { ConversationStore, StoredConversation } from '../../src/ports/ConversationStore.ts';
import { ConversationUnavailable, CREATION_UNCERTAINTY_NOTICE } from '../../src/shared/conversation.ts';
import { createWorker } from '../../src/worker/index.ts';

const CREATION_BODY_LIMIT_BYTES = 1024;
const origin = 'http://127.0.0.1:5173';
const now = new Date('2026-01-01T00:00:00.000Z');
const clock = { now: () => now };
const app = createWorker(clock);
const jsonHeaders = { Origin: origin, 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'same-origin', 'Sec-Fetch-Mode': 'cors', 'Sec-Fetch-Dest': 'empty' };
const view = (conversationId: string) => ({ conversationId, transcript: [], processing: { status: 'idle' }, admission: { available: false, reason: 'scope_unavailable' } });

function fixture() {
  const rows: StoredConversation[] = [];
  const store: ConversationStore = {
    readAdmissionState: vi.fn(async () => ({ messages: [], lease: null })),
    admit: vi.fn(),
    dailyCreationKey: vi.fn(async () => 'a'.repeat(64)),
    cleanupCreationLimits: vi.fn(async () => {}),
    create: vi.fn(async (row) => { rows.push({ ...row }); return 'created' as const; }),
    findAuthenticated: vi.fn(async (id, hash, after) => {
      const row = rows.find((r) => r.conversationId === id && r.sessionTokenHash === hash && r.createdAt > after);
      return row ? { conversationId: row.conversationId } : null;
    }),
  };
  return { rows, store };
}
function dbFixture() {
  const { rows, store } = fixture();
  const prepare = vi.fn((sql: string) => ({ sql, values: [] as unknown[], bind(...values: unknown[]) {
    return { sql, values, first: async () => {
      const row = await store.findAuthenticated(String(values[0]), String(values[1]), String(values[2]));
      return row ? { id: row.conversationId } : null;
    } };
  } }));
  const batch = vi.fn(async (statements: { sql: string; values: unknown[] }[]) => {
    if (statements[0]!.sql.startsWith('SELECT id FROM conversations')) {
      const [id, hash, after] = statements[0]!.values as string[];
      const row = await store.findAuthenticated(id!, hash!, after!);
      return [{ success: true, results: row ? [{ id: row.conversationId }] : [] }, { success: true, results: [] }, { success: true, results: [] }];
    }
    if (statements[0]!.sql === 'SELECT * FROM active_publication') return statements.map(() => ({ success: true, results: [] }));
    if (statements[0]!.sql.startsWith('UPDATE conversation_creation_key')) {
      return [{ success: true, results: [] }, { success: true, results: [{ day: now.getTime(), expires_at: now.getTime() + 86400000, daily_key: await store.dailyCreationKey({ day: now.getTime(), expiresAt: now.getTime() + 86400000 }) }] }];
    }
    const values = statements[1]!.values as string[];
    const outcome = await store.create({ conversationId: values[0]!, sessionTokenHash: values[1]!, createdAt: values[2]!, modifiedAt: values[3]! }, { day: now.getTime(), expiresAt: now.getTime() + 86400000, dailyKey: 'a'.repeat(64), pseudonym: 'b'.repeat(64), limit: 10 });
    return [{ success: true, meta: { changes: outcome === 'created' ? 1 : 0 } }, { success: true, meta: { changes: outcome === 'created' ? 1 : 0 } }, { success: true, results: [{ valid: 1 }] }];
  });
  const env = { DB: { prepare, batch } as unknown as D1Database, TRUSTED_BROWSER_ORIGIN: origin, CREATION_ADDRESS_MODE: 'local-fixed', CONVERSATION_CREATION_LIMIT: '10' };
  return { rows, store, prepare, env };
}
afterEach(() => vi.unstubAllGlobals());

describe('conversation creation and authenticated reads', () => {
  it('persists unpredictable hash-only credentials before returning and binds independent conversations', async () => {
    const { rows, store } = fixture();
    const a = await createConversation(store, clock, '127.0.0.1', 10), b = await createConversation(store, clock, '127.0.0.1', 10);
    expect(Object.keys(a).sort()).toEqual(['conversationId', 'sessionToken']);
    expect(a.conversationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(a.sessionToken).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toEqual(b);
    expect(rows[0]).toEqual({ conversationId: a.conversationId, sessionTokenHash: await hashSessionToken(a.sessionToken), createdAt: now.toISOString(), modifiedAt: now.toISOString() });
    expect(JSON.stringify(rows)).not.toContain(a.sessionToken);
    for (const c of [a, b]) expect(await readConversation(store, clock, c.conversationId, `Bearer ${c.sessionToken}`)).toEqual(view(c.conversationId));
    for (const [id, token] of [[a.conversationId, b.sessionToken], [b.conversationId, a.sessionToken], [crypto.randomUUID(), a.sessionToken]]) {
      await expect(readConversation(store, clock, id!, `Bearer ${token}`)).rejects.toBeInstanceOf(ConversationUnavailable);
    }
    const before = structuredClone(rows);
    await readConversation(store, clock, a.conversationId, `Bearer ${a.sessionToken}`);
    expect(rows).toEqual(before);
  });

  it('allows strictly before the creation-based 90-day deadline, denies at/after, never extends with modified_at', async () => {
    const { store, rows } = fixture();
    const c = await createConversation(store, clock, '127.0.0.1', 10);
    rows[0]!.modifiedAt = new Date(now.getTime() + CONVERSATION_RETENTION_MS).toISOString();
    for (const offset of [-1, 0, 1]) {
      const read = readConversation(store, { now: () => new Date(now.getTime() + CONVERSATION_RETENTION_MS + offset) }, c.conversationId, `Bearer ${c.sessionToken}`);
      if (offset < 0) expect(await read).toEqual(view(c.conversationId));
      else await expect(read).rejects.toBeInstanceOf(ConversationUnavailable);
    }
  });

  it('returns one neutral no-store HTTP failure for missing, malformed, wrong, crossed, absent, deleted and expired access', async () => {
    const f = dbFixture();
    const a = await createConversation(f.store, clock, '127.0.0.1', 10), b = await createConversation(f.store, clock, '127.0.0.1', 10);
    const cases: [string, string | undefined][] = [
      [a.conversationId, undefined], [a.conversationId, ''], [a.conversationId, a.sessionToken],
      [a.conversationId, `Basic ${a.sessionToken}`], [a.conversationId, `Bearer ${a.sessionToken} extra`],
      [a.conversationId, `Bearer\t${a.sessionToken}`], [a.conversationId, `Bearer  ${a.sessionToken} extra`],
      [a.conversationId, `Bearer ${'f'.repeat(64)}`], [a.conversationId, `Bearer ${b.sessionToken}`],
      [b.conversationId, `Bearer ${a.sessionToken}`], [crypto.randomUUID(), `Bearer ${a.sessionToken}`],
      ['not-an-id', `Bearer ${a.sessionToken}`],
    ];
    f.rows[1]!.createdAt = new Date(now.getTime() - CONVERSATION_RETENTION_MS).toISOString();
    cases.push([b.conversationId, `Bearer ${b.sessionToken}`]);
    const deleted = await createConversation(f.store, clock, '127.0.0.1', 10);
    f.rows.pop(); cases.push([deleted.conversationId, `Bearer ${deleted.sessionToken}`]);
    for (const [id, authorization] of cases) {
      const response = await app.request(`http://worker/api/conversations/${id}`, { headers: authorization === undefined ? {} : { Authorization: authorization } }, f.env);
      expect(response.status).toBe(401);
      expect(response.headers.get('www-authenticate')).toBe('Bearer');
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(await response.json()).toEqual({ error: 'conversation_unavailable' });
    }
    f.prepare.mockClear();
    await app.request(`http://worker/api/conversations/${a.conversationId}?sessionToken=${a.sessionToken}`, {}, f.env);
    expect(f.prepare).not.toHaveBeenCalled();
  });

  it.each([
    { Origin: '' }, { Origin: 'null' }, { Origin: 'https://foreign.invalid' },
    { Origin: 'http://127.0.0.1:8787' }, { 'Sec-Fetch-Site': 'cross-site' }, { 'Sec-Fetch-Site': 'same-site' },
    { 'Sec-Fetch-Mode': 'navigate' }, { 'Sec-Fetch-Dest': 'document' },
    { 'Content-Type': 'text/plain' }, { 'Content-Type': 'application/x-www-form-urlencoded' },
    { 'Content-Type': 'application/json; charset=iso-8859-1' }, { 'Content-Type': 'application/json; charset="iso-8859-1"' },
  ])('rejects policy %j before any persistence/allowance seam', async (overrides) => {
    const f = dbFixture();
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers: { ...jsonHeaders, ...overrides }, body: '{}' }, f.env);
    expect([403, 415]).toContain(response.status);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(f.prepare).not.toHaveBeenCalled();
  });

  it('rejects headerless clients, missing trusted config and forwarded-host spoofing', async () => {
    const f = dbFixture();
    for (const headers of [{}, { 'Content-Type': 'application/json', 'X-Forwarded-Host': '127.0.0.1:5173', 'X-Forwarded-Proto': 'http' }]) {
      expect((await app.request('http://worker/api/conversations', { method: 'POST', headers, body: '{}' }, f.env)).status).toBe(403);
    }
    expect((await app.request('http://worker/api/conversations', { method: 'POST', headers: jsonHeaders, body: '{}' })).status).toBe(403);
    expect(f.prepare).not.toHaveBeenCalled();
  });

  it.each(['null', '[]', '{"question":"never send"}', '{', ''])('rejects invalid creation body %s before mutation', async (body) => {
    const f = dbFixture();
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers: jsonHeaders, body }, f.env);
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(f.prepare).not.toHaveBeenCalled();
  });

  it('creates once and repeats read-only authoritative state without publication, network, provider or token disclosure', async () => {
    const f = dbFixture();
    const network = vi.fn(() => { throw new Error('forbidden'); }); vi.stubGlobal('fetch', network);
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers: jsonHeaders, body: '{}' }, f.env);
    expect(response.status).toBe(201); expect(response.headers.get('cache-control')).toBe('no-store');
    const c = await response.json() as { conversationId: string; sessionToken: string };
    expect(f.rows).toHaveLength(1);
    const baseline = structuredClone(f.rows);
    for (let i = 0; i < 3; i++) {
      const read = await app.request(`http://worker/api/conversations/${c.conversationId}`, { headers: { Authorization: `Bearer ${c.sessionToken}` } }, f.env);
      expect(read.status).toBe(200); expect(read.headers.get('cache-control')).toBe('no-store');
      expect(await read.json()).toEqual(view(c.conversationId));
    }
    expect(f.rows).toEqual(baseline); expect(network).not.toHaveBeenCalled();
    for (const path of ['', '/admin/list', `/${c.conversationId}/messages`, `/${c.conversationId}/deletion-request`]) {
      const r = await app.request(`http://worker/api/conversations${path}`, { method: path === '' || path === '/admin/list' ? 'GET' : 'POST' }, f.env);
      expect(r.status).toBe(404); expect(r.headers.get('cache-control')).toBe('no-store');
    }
    expect(f.rows).toEqual(baseline);
  });

  it.each(['application/json', 'application/json; charset=utf-8', 'application/json; charset="utf-8"', 'Application/JSON; Charset = "UTF-8"'])('accepts equivalent JSON media type %s', async (contentType) => {
    const f = dbFixture();
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers: { ...jsonHeaders, 'Content-Type': contentType }, body: '{}' }, f.env);
    expect(response.status).toBe(201);
    const c = await response.json() as { conversationId: string; sessionToken: string };
    expect(f.rows[0]?.sessionTokenHash).toBe(await hashSessionToken(c.sessionToken));
    expect(f.rows[0]?.conversationId).toBe(c.conversationId);
  });

  it.each([
    { Origin: origin, 'Content-Type': 'application/json' },
    { ...jsonHeaders, 'Sec-Fetch-Mode': 'same-origin' },
  ])('accepts supported Fetch Metadata variant %j', async (headers) => {
    const f = dbFixture();
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers, body: '{}' }, f.env);
    expect(response.status).toBe(201);
    const c = await response.json() as { conversationId: string; sessionToken: string };
    expect(f.rows).toEqual([{ conversationId: c.conversationId, sessionTokenHash: await hashSessionToken(c.sessionToken), createdAt: now.toISOString(), modifiedAt: now.toISOString() }]);
  });

  it('accepts multiple Bearer separator spaces without accepting malformed tokens', async () => {
    const f = dbFixture();
    const c = await createConversation(f.store, clock, '127.0.0.1', 10);
    const response = await app.request(`http://worker/api/conversations/${c.conversationId}`, { headers: { Authorization: `Bearer   ${c.sessionToken}` } }, f.env);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(view(c.conversationId));
  });

  it('rejects declared excess before reading while preserving origin/media-type ordering', async () => {
    const f = dbFixture();
    const pull = vi.fn();
    for (const [overrides, status] of [[{}, 413], [{ Origin: 'null' }, 403], [{ 'Content-Type': 'text/plain' }, 415]] as const) {
      const request = new Request('http://worker/api/conversations', {
        method: 'POST', headers: { ...jsonHeaders, 'Content-Length': String(CREATION_BODY_LIMIT_BYTES + 1), ...overrides },
        body: new ReadableStream({ pull }, { highWaterMark: 0 }), duplex: 'half',
      } as RequestInit);
      const response = await app.request(request, undefined, f.env);
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
    expect(pull).not.toHaveBeenCalled();
    expect(f.prepare).not.toHaveBeenCalled();
  });

  it.each([undefined, '2'])('bounds streaming bytes even with absent or understated Content-Length %s', async (length) => {
    const f = dbFixture();
    const cancel = vi.fn();
    const chunks = [new TextEncoder().encode(' '.repeat(CREATION_BODY_LIMIT_BYTES)), new TextEncoder().encode('{}')];
    const body = new ReadableStream<Uint8Array>({ pull(controller) { controller.enqueue(chunks.shift()!); }, cancel }, { highWaterMark: 0 });
    const request = new Request('http://worker/api/conversations', { method: 'POST', headers: { ...jsonHeaders, ...(length ? { 'Content-Length': length } : {}) }, body, duplex: 'half' } as RequestInit);
    const response = await app.request(request, undefined, f.env);
    expect(response.status).toBe(413);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'creation_body_too_large' });
    expect(cancel).toHaveBeenCalledOnce();
    expect(f.prepare).not.toHaveBeenCalled();
  });

  it('accepts an empty object exactly at the byte limit', async () => {
    const f = dbFixture();
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers: jsonHeaders, body: ' '.repeat(CREATION_BODY_LIMIT_BYTES - 2) + '{}' }, f.env);
    expect(response.status).toBe(201);
    expect(f.rows).toHaveLength(1);
  });

  it('keeps the creation response and credentials pending until persistence resolves', async () => {
    const f = dbFixture();
    let release!: () => void, started!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const writeStarted = new Promise<void>((resolve) => { started = resolve; });
    vi.mocked(f.store.create).mockImplementation(async (row) => { started(); await gate; f.rows.push(row); return 'created'; });
    let responseReturned = false;
    const pending = Promise.resolve(app.request('http://worker/api/conversations', { method: 'POST', headers: jsonHeaders, body: '{}' }, f.env)).then((response) => { responseReturned = true; return response; });
    await writeStarted;
    expect(responseReturned).toBe(false);
    expect(f.rows).toEqual([]);
    release();
    const response = await pending;
    expect(response.status).toBe(201);
    const c = await response.json() as { conversationId: string; sessionToken: string };
    expect(f.rows[0]?.sessionTokenHash).toBe(await hashSessionToken(c.sessionToken));
  });

  it.each(['rejected', 'unsuccessful'])('redacts %s writes without returning credentials', async (failure) => {
    const f = dbFixture();
    if (failure === 'rejected') vi.mocked(f.store.create).mockRejectedValue(new Error('private database failure'));
    else vi.spyOn(f.env.DB, 'batch').mockResolvedValue([{ success: false }] as unknown as D1Result[]);
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers: jsonHeaders, body: '{}' }, f.env);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE });
    expect(f.rows).toEqual([]);
  });

  it('keeps HEAD unsupported, empty and no-store without database access for either credential', async () => {
    const f = dbFixture();
    const c = await createConversation(f.store, clock, '127.0.0.1', 10);
    for (const token of [c.sessionToken, 'invalid']) {
      const response = await app.request(`http://worker/api/conversations/${c.conversationId}`, { method: 'HEAD', headers: { Authorization: `Bearer ${token}` } }, f.env);
      expect(response.status).toBe(404);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(await response.text()).toBe('');
    }
    expect(f.prepare).not.toHaveBeenCalled();
  });

  it('redacts internal failures including after a committed creation, without logging or retrying', async () => {
    const f = dbFixture();
    const secret = 'secret-token-and-sql-details';
    vi.mocked(f.store.create).mockImplementation(async (row) => { f.rows.push(row); throw new Error(secret); });
    const log = vi.fn(); vi.stubGlobal('console', { ...console, error: log, log });
    const response = await app.request('http://worker/api/conversations', { method: 'POST', headers: jsonHeaders, body: '{}' }, f.env);
    expect(response.status).toBe(503); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE });
    expect(f.rows).toHaveLength(1); expect(f.store.create).toHaveBeenCalledTimes(1);
    vi.mocked(f.store.findAuthenticated).mockRejectedValue(new Error(secret));
    const read = await app.request(`http://worker/api/conversations/${f.rows[0]!.conversationId}`, { headers: { Authorization: `Bearer ${'a'.repeat(64)}` } }, f.env);
    expect(read.status).toBe(503); expect(read.headers.get('cache-control')).toBe('no-store');
    expect(await read.json()).toEqual({ error: 'conversation_dependency_unavailable' });
    expect(log).not.toHaveBeenCalled();
  });
});
