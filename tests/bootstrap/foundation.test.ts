import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../../frontend/src/App';
import worker from '../../src/worker/index';

describe('credential-free foundation', () => {
  it('renders a French technical shell in its initial checking state', () => {
    const html = renderToStaticMarkup(createElement(App));
    expect(html).toContain('<h1>Socle technique local</h1>');
    expect(html).toContain('Vérification du Worker…');
    expect(html).toContain('ne signifie pas que le produit est prêt');
    expect(html).not.toMatch(/<script|<form|<input/);
  });

  it.each([
    ['GET', '/'],
    ['POST', '/api/health'],
    ['GET', '/api/llm'],
    ['GET', '/api/simulation'],
    ['GET', '/api/db'],
    ['GET', '/api/diagnostics'],
    ['POST', '/api/conversations'],
    ['DELETE', '/unmatched'],
  ])('returns default 404 for %s %s without bindings', async (method, path) => {
    const response = await worker.request(`https://example.invalid${path}`, { method });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('404 Not Found');
  });
});
