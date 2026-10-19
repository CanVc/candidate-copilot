import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from '../../frontend/src/App';
import worker from '../../src/worker/index';

describe('credential-free foundation', () => {
  it('renders only a static technical shell', () => {
    const html = renderToStaticMarkup(App());
    expect(html).toContain('<h1>Application foundation</h1>');
    expect(html).toContain('No services are connected.');
    expect(html).not.toMatch(/<script|<form|<input/);
  });

  it.each([
    ['GET', '/'],
    ['GET', '/api/health'],
    ['POST', '/api/conversations'],
    ['DELETE', '/unmatched'],
  ])('returns default 404 for %s %s without bindings', async (method, path) => {
    const response = await worker.request(`https://example.invalid${path}`, { method });
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('404 Not Found');
  });
});
