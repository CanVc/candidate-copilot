import { readFileSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { canonicalAddress, trustedCreationAddress } from '../../src/adapters/cloudflare/creation-address.ts';
import { creationLimit, creationPseudonym, creationWindow } from '../../src/application/conversation-creation-limits.ts';
import { createConversation } from '../../src/application/conversations.ts';
import { D1ConversationStore } from '../../src/adapters/d1/conversations.ts';
import { ConversationDependencyUnavailable, ConversationRateLimited, CREATION_UNCERTAINTY_NOTICE } from '../../src/shared/conversation.ts';
import worker, { createWorker, cleanupCreationLimits } from '../../src/worker/index.ts';
import type { ConversationStore } from '../../src/ports/ConversationStore.ts';

const now = new Date('2026-11-18T23:59:59.001Z');
const clock = { now: () => now };
const window = creationWindow(now);
const key = 'ab'.repeat(32);
const origin = 'http://127.0.0.1:5173';
const headers = { Origin: origin, 'Content-Type': 'application/json' };
const env = { DB: {} as D1Database, TRUSTED_BROWSER_ORIGIN: origin as 'http://127.0.0.1:5173', CREATION_ADDRESS_MODE: 'local-fixed', CONVERSATION_CREATION_LIMIT: '10' } as const;
function cloudflare(address: string, extra: Record<string, string> = {}) {
  const request = new Request('https://example.invalid/api/conversations', { headers: { 'CF-Connecting-IP': address, ...extra } });
  Object.defineProperty(request, 'cf', { value: { colo: 'CDG', asn: 123 } });
  return request;
}
afterEach(() => vi.restoreAllMocks());

describe('conversation-creation-limits', () => {
  it('uses UTC days at exact midnight and validates configuration without fallback', () => {
    expect(window).toEqual({ day: Date.parse('2026-11-18T00:00:00Z'), expiresAt: Date.parse('2026-11-19T00:00:00Z') });
    expect(creationWindow(new Date(window.expiresAt)).day).toBe(window.expiresAt);
    expect(creationWindow(new Date('2026-11-19T01:00:00+02:00'))).toEqual(window);
    expect(creationLimit(undefined)).toBe(10);
    expect(creationLimit('3')).toBe(3);
    for (const value of ['', '0', '-1', '1.5', '01', ' 10', '1e2', 'Infinity', '9007199254740992']) expect(() => creationLimit(value)).toThrow(ConversationDependencyUnavailable);
    expect(() => creationWindow(new Date(NaN))).toThrow(ConversationDependencyUnavailable);
  });

  it.each([
    ['192.0.2.1', '192.0.2.1'], ['2001:0DB8:0000:0000:0000:0000:0000:0001', '2001:db8::1'],
    ['2001:db8::1', '2001:db8::1'], ['::FFFF:192.0.2.1', '192.0.2.1'], ['::ffff:c000:201', '192.0.2.1'], ['::', '::'],
  ])('normalizes equivalent address %s', (input, expected) => expect(canonicalAddress(input)).toBe(expected));

  it.each(['', ' 192.0.2.1', '192.0.2.1:80', '192.0.2.1,192.0.2.2', '192.00.2.1', '256.1.1.1', '127.1', '0x7f000001', '[::1]', 'fe80::1%eth0', '::ffff:192.00.2.1', '2001::db8::1', 'example.com', '1:2:3:4:5:6:7:8:9'])('rejects malformed/multiple/zone address %s', (input) => expect(() => canonicalAddress(input)).toThrow(ConversationDependencyUnavailable));

  it('ignores every address header in local mode and arbitrary forwarding in hosted mode', () => {
    expect(trustedCreationAddress(cloudflare('malformed', { 'X-Forwarded-For': '198.51.100.1', 'X-Real-IP': '198.51.100.2' }), 'local-fixed')).toBe('127.0.0.1');
    expect(trustedCreationAddress(cloudflare('2001:DB8::1', { 'X-Forwarded-For': 'malformed', 'X-Real-IP': 'malformed' }), 'cloudflare-direct')).toBe('2001:db8::1');
  });

  it('fails closed without configured trusted provenance and on Worker/Pseudo IPv4 indications', () => {
    for (const mode of [undefined, '', 'unknown']) expect(() => trustedCreationAddress(cloudflare('192.0.2.1'), mode)).toThrow(ConversationDependencyUnavailable);
    expect(() => trustedCreationAddress(new Request('https://example.invalid', { headers: { 'CF-Connecting-IP': '192.0.2.1' } }), 'cloudflare-direct')).toThrow(ConversationDependencyUnavailable);
    for (const extra of [{ 'CF-Worker': 'example.invalid' }, { 'CF-Pseudo-IPv4': '240.1.1.1' }, { 'CF-Connecting-IPv6': '::1' }]) expect(() => trustedCreationAddress(cloudflare('192.0.2.1', extra), 'cloudflare-direct')).toThrow(ConversationDependencyUnavailable);
    for (const address of ['', '192.0.2.1, 192.0.2.2', '2a06:98c0:3600::103']) expect(() => trustedCreationAddress(cloudflare(address), 'cloudflare-direct')).toThrow(ConversationDependencyUnavailable);
    for (const cf of [{}, { colo: 'CDG' }, { colo: 'CDG', asn: 0 }, { colo: 'bad', asn: 123 }]) {
      const request = new Request('https://example.invalid', { headers: { 'CF-Connecting-IP': '192.0.2.1' } });
      Object.defineProperty(request, 'cf', { value: cf });
      expect(() => trustedCreationAddress(request, 'cloudflare-direct')).toThrow(ConversationDependencyUnavailable);
    }
  });

  it('domain-separated HMAC is stable only for the same canonical address/day/key', async () => {
    const pseudonym = await creationPseudonym('192.0.2.1', window, key);
    expect(pseudonym).toMatch(/^[0-9a-f]{64}$/);
    expect(await creationPseudonym(canonicalAddress('::ffff:c000:201'), window, key)).toBe(pseudonym);
    expect(await creationPseudonym('192.0.2.2', window, key)).not.toBe(pseudonym);
    expect(await creationPseudonym('192.0.2.1', creationWindow(new Date(window.expiresAt)), key)).not.toBe(pseudonym);
    expect(await creationPseudonym('192.0.2.1', window, 'cd'.repeat(32))).not.toBe(pseudonym);
    await expect(creationPseudonym('192.0.2.1', window, '')).rejects.toThrow(ConversationDependencyUnavailable);
  });

  it('passes only the pseudonym to the atomic creation seam and preserves confirmed rate limits', async () => {
    const store: ConversationStore = {
      dailyCreationKey: vi.fn(async () => key), create: vi.fn(async () => 'rate_limited' as const),
      readAdmissionState: vi.fn(), admit: vi.fn(), findAuthenticated: vi.fn(), cleanupCreationLimits: vi.fn(),
    };
    await expect(createConversation(store, clock, '192.0.2.1', 3)).rejects.toEqual(new ConversationRateLimited(window.expiresAt));
    expect(store.create).toHaveBeenCalledOnce();
    const [row, allowance] = vi.mocked(store.create).mock.calls[0]!;
    expect(Object.keys(row).sort()).toEqual(['conversationId', 'createdAt', 'modifiedAt', 'sessionTokenHash']);
    expect(allowance).toEqual({ ...window, dailyKey: key, pseudonym: await creationPseudonym('192.0.2.1', window, key), limit: 3 });
    expect(JSON.stringify([row, allowance])).not.toContain('192.0.2.1');
  });

  it('rejects A07 before key lookup and returns no-store 429 with authoritative next-midnight HTTP date', async () => {
    const daily = vi.spyOn(D1ConversationStore.prototype, 'dailyCreationKey').mockResolvedValue(key);
    const create = vi.spyOn(D1ConversationStore.prototype, 'create').mockResolvedValue('rate_limited');
    const app = createWorker(clock);
    for (const [overrides, body, status] of [[{ Origin: 'null' }, '{}', 403], [{ 'Content-Type': 'text/plain' }, '{}', 415], [{}, '{"x":1}', 400]] as const) {
      expect((await app.request('/api/conversations', { method: 'POST', headers: { ...headers, ...overrides }, body }, env)).status).toBe(status);
    }
    expect(daily).not.toHaveBeenCalled(); expect(create).not.toHaveBeenCalled();
    const response = await app.request('/api/conversations', { method: 'POST', headers, body: '{}' }, env);
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('Thu, 19 Nov 2026 00:00:00 GMT');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'rate_limited' });
    expect(create).toHaveBeenCalledOnce();
  });

  it('composes opt-in Cloudflare provenance into the real HTTP creation boundary', async () => {
    vi.spyOn(D1ConversationStore.prototype, 'dailyCreationKey').mockResolvedValue(key);
    const create = vi.spyOn(D1ConversationStore.prototype, 'create').mockResolvedValue('created');
    const request = new Request('https://example.invalid/api/conversations', {
      method: 'POST', headers: { ...headers, 'CF-Connecting-IP': '::ffff:192.0.2.1', 'X-Forwarded-For': '192.0.2.2' }, body: '{}',
    });
    Object.defineProperty(request, 'cf', { value: { colo: 'CDG', asn: 123 } });
    const response = await createWorker(clock).request(request, undefined, { ...env, CREATION_ADDRESS_MODE: 'cloudflare-direct' });
    expect(response.status).toBe(201);
    expect(create.mock.calls[0]![1].pseudonym).toBe(await creationPseudonym('192.0.2.1', window, key));
  });

  it('redacts adapter/config/key failures without logs, mutation or automatic retries', async () => {
    const daily = vi.spyOn(D1ConversationStore.prototype, 'dailyCreationKey').mockRejectedValue(new Error('192.0.2.1 private-key raw SQL'));
    const create = vi.spyOn(D1ConversationStore.prototype, 'create');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const app = createWorker(clock);
    for (const overrides of [{ CREATION_ADDRESS_MODE: 'unknown' }, { CREATION_ADDRESS_MODE: 'cloudflare-direct' }, { CONVERSATION_CREATION_LIMIT: '0' }, {}]) {
      const response = await app.request('/api/conversations', { method: 'POST', headers, body: '{}' }, { ...env, ...overrides });
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE });
    }
    expect(daily).toHaveBeenCalledOnce(); expect(create).not.toHaveBeenCalled(); expect(log).not.toHaveBeenCalled();
  });

  it('wires the minute Cron to cleanup without traffic and leaves hosted activation disabled', async () => {
    const config = JSON.parse(readFileSync(new NodeURL('../../wrangler.jsonc', import.meta.url), 'utf8'));
    expect(config.triggers.crons).toEqual(['* * * * *']);
    expect(config.observability.enabled).toBe(false);
    expect(config.vars.CREATION_ADDRESS_MODE).toBe('local-fixed');
    expect(config.vars.CONVERSATION_CREATION_LIMIT).toBe('10');
    const cleanup = vi.spyOn(D1ConversationStore.prototype, 'cleanupCreationLimits').mockResolvedValue();
    await worker.scheduled({} as ScheduledController, env);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('scheduled cleanup failures expose only a fixed operational code', async () => {
    vi.spyOn(D1ConversationStore.prototype, 'cleanupCreationLimits').mockRejectedValue(new Error('raw SQL secret'));
    await expect(cleanupCreationLimits(env, clock)).rejects.toThrow(/^conversation_creation_cleanup_unavailable$/);
  });
});
