import { createServer } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkHealth, HEALTH_TIMEOUT_MS } from '../../frontend/src/health';
import { isHealthResponse } from '../../src/shared/health';
import worker from '../../src/worker/index';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('minimal health exchange', () => {
  it('returns only availability without invoking any network or model', async () => {
    const network = vi.fn(() => { throw new Error('Network forbidden'); });
    vi.stubGlobal('fetch', network);
    const response = await worker.request('https://example.invalid/api/health');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ status: 'ok' });
    expect(network).not.toHaveBeenCalled();
  });

  it.each([null, [], 'ok', {}, { status: 'bad' }, { status: 'ok', diagnostic: true }])('rejects an invalid health contract: %j', (value) => {
    expect(isHealthResponse(value)).toBe(false);
  });

  it('uses the relative proxy path and validates before reporting success', async () => {
    const fetch = vi.fn(async () => new Response('{"status":"ok"}'));
    vi.stubGlobal('fetch', fetch);
    expect(await checkHealth(new AbortController().signal)).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }));
  });

  it.each([
    () => Promise.reject(new Error('Worker absent')),
    async () => new Response('{"status":"ok"}', { status: 503 }),
    async () => new Response('not JSON'),
    async () => new Response('{"status":"not-ok"}'),
    async () => new Response('{"status":"ok","secret":"not allowed"}'),
  ])('reports unavailable for network, HTTP and malformed responses', async (fetch) => {
    vi.stubGlobal('fetch', fetch);
    expect(await checkHealth(new AbortController().signal)).toBe(false);
  });

  it('aborts an unconsumed non-OK streaming response before dropping lifecycle cleanup', async () => {
    let closed!: () => void;
    const responseClosed = new Promise<void>((resolve) => { closed = resolve; });
    const server = createServer((_request, response) => {
      response.on('close', closed);
      response.writeHead(503, { 'content-type': 'application/json' });
      response.write('{"status":'); // Never finish this error body.
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing disposable HTTP address');
    const nativeFetch = globalThis.fetch;
    let requestSignal: AbortSignal | undefined;
    const json = vi.fn();
    vi.stubGlobal('fetch', async (path: string, options: RequestInit) => {
      requestSignal = options.signal ?? undefined;
      const response = await nativeFetch(`http://127.0.0.1:${address.port}${path}`, options);
      vi.spyOn(response, 'json').mockImplementation(json);
      return response;
    });
    try {
      const lifecycle = new AbortController();
      expect(await checkHealth(lifecycle.signal)).toBe(false);
      expect(json).not.toHaveBeenCalled();
      expect(requestSignal?.aborted).toBe(true);
      // The caller remains mounted: cleanup must not depend on a later abort.
      expect(lifecycle.signal.aborted).toBe(false);
      await Promise.race([
        responseClosed,
        new Promise<never>((_resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Streaming error response was not closed')), 1_000);
          void responseClosed.then(() => clearTimeout(timer));
        }),
      ]);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it.each(['headers', 'body'])('bounds stalled %s within five seconds and aborts the request', async (stage) => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal('fetch', (_path: string, options: RequestInit) => {
      requestSignal = options.signal ?? undefined;
      return stage === 'headers' ? new Promise(() => {}) : Promise.resolve({ ok: true, json: () => new Promise(() => {}) });
    });
    const result = checkHealth(new AbortController().signal);
    expect(HEALTH_TIMEOUT_MS).toBeLessThan(5_000);
    await vi.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS);
    expect(await result).toBe(false);
    expect(requestSignal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels on unmount and supports a fresh StrictMode/reload check', async () => {
    const fetch = vi.fn()
      .mockImplementationOnce((_path: string, options: RequestInit) => new Promise((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }))
      .mockResolvedValueOnce(new Response('{"status":"ok"}'));
    vi.stubGlobal('fetch', fetch);
    const first = new AbortController();
    const cancelled = checkHealth(first.signal);
    first.abort();
    expect(await cancelled).toBe(false);
    expect(await checkHealth(new AbortController().signal)).toBe(true);
  });

  it('does not fetch with an already cancelled lifecycle', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();
    controller.abort();
    expect(await checkHealth(controller.signal)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
