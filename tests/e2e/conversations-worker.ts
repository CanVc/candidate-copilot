import { createWorker } from '../../src/worker/index.ts';

// Disposable test-only clock. The application Worker never interprets this header.
export default {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    const time = request.headers.get('X-Fixture-Now') ?? '2026-01-01T00:00:00.000Z';
    // Node's fetch transport overwrites Sec-Fetch-Mode. Inject only here so the
    // real application handler still receives and rejects the contradictory value.
    const mode = request.headers.get('X-Fixture-Fetch-Mode');
    const input = new Request(request);
    if (mode) input.headers.set('Sec-Fetch-Mode', mode);
    const response = await createWorker({ now: () => new Date(time) }).fetch(input, env, context);
    if (mode) response.headers.set('X-Fixture-Observed-Fetch-Mode', input.headers.get('Sec-Fetch-Mode')!);
    return response;
  },
};
