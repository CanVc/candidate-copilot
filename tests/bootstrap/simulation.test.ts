import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SimulatedLLMProvider } from '../../src/adapters/llm/simulated';
import type { LLMProvider } from '../../src/ports/LLMProvider';

// Observe attempted transports even if the adapter catches their exceptions.
const transports = vi.hoisted(() => {
  const forbidden = () => vi.fn(() => { throw new Error('Network forbidden'); });
  return {
    fetch: forbidden(), httpRequest: forbidden(), httpGet: forbidden(),
    httpsRequest: forbidden(), httpsGet: forbidden(), connect: forbidden(), createConnection: forbidden(),
  };
});
vi.mock('node:http', () => {
  const http = { request: transports.httpRequest, get: transports.httpGet };
  return { ...http, default: http };
});
vi.mock('node:https', () => {
  const https = { request: transports.httpsRequest, get: transports.httpsGet };
  return { ...https, default: https };
});
vi.mock('node:net', () => {
  const net = { connect: transports.connect, createConnection: transports.createConnection };
  return { ...net, default: net };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', transports.fetch);
});
afterEach(() => {
  try {
    for (const transport of Object.values(transports)) expect(transport).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});

describe('fixture-only LLMProvider', () => {
  it('generates the exact deterministic fixture without model network or configuration', async () => {
    const provider: LLMProvider = new SimulatedLLMProvider();
    expect(await Promise.all(Array.from({ length: 3 }, () => provider.generate('bootstrap-ping'))))
      .toEqual(Array(3).fill('Simulated LLM: bootstrap-pong'));
  });

  it.each(['', 'bootstrap-pong', ' bootstrap-ping', 'bootstrap-ping\n', 'arbitrary prompt'])('rejects unsupported fixture %j', async (input) => {
    await expect(new SimulatedLLMProvider().generate(input)).rejects.toThrow('Unsupported simulated LLM fixture');
  });
});
