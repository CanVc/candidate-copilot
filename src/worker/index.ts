import { Hono } from 'hono';
import type { HealthResponse } from '../shared/health';
import { D1ResourceCatalog } from '../adapters/d1/publication.ts';
import { D1ConversationStore } from '../adapters/d1/conversations.ts';
import { createConversation, readConversation } from '../application/conversations.ts';
import type { Clock } from '../ports/Clock.ts';
import { ConversationUnavailable, CREATION_UNCERTAINTY_NOTICE } from '../shared/conversation.ts';

const CREATION_BODY_LIMIT_BYTES = 1024;

export function createWorker(clock: Clock = { now: () => new Date() }) {
  const app = new Hono<{ Bindings: Cloudflare.Env }>();

  app.use('/api/conversations*', async (context, next) => {
    context.header('Cache-Control', 'no-store');
    // Hono internally dispatches HEAD through GET; an explicit HEAD route is insufficient.
    if (context.req.method === 'HEAD') return context.body(null, 404);
    await next();
  });

  app.post('/api/conversations', async (context) => {
    const headers = context.req.raw.headers;
    const trustedOrigin = context.env?.TRUSTED_BROWSER_ORIGIN;
    // Vite preserves the browser Origin. Never trust forwarded host/proto headers.
    if (!trustedOrigin || headers.get('Origin') !== trustedOrigin ||
        (headers.has('Sec-Fetch-Site') && headers.get('Sec-Fetch-Site') !== 'same-origin') ||
        (headers.has('Sec-Fetch-Mode') && !['cors', 'same-origin'].includes(headers.get('Sec-Fetch-Mode')!)) ||
        (headers.has('Sec-Fetch-Dest') && headers.get('Sec-Fetch-Dest') !== 'empty')) {
      return context.json({ error: 'creation_origin_rejected' }, 403);
    }
    if (!/^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?$/i.test(headers.get('Content-Type') ?? '')) {
      return context.json({ error: 'creation_content_type_rejected' }, 415);
    }
    const length = headers.get('Content-Length');
    if (length !== null && !/^\d+$/.test(length)) return context.json({ error: 'creation_body_rejected' }, 400);
    if (length !== null && Number(length) > CREATION_BODY_LIMIT_BYTES) {
      return context.json({ error: 'creation_body_too_large' }, 413);
    }
    const reader = context.req.raw.body?.getReader();
    try {
      let size = 0, text = '';
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > CREATION_BODY_LIMIT_BYTES) {
            // Do not await cancellation of an untrusted, potentially stalled stream.
            void reader.cancel().catch(() => {});
            return context.json({ error: 'creation_body_too_large' }, 413);
          }
          text += decoder.decode(value, { stream: true });
        }
      }
      const body: unknown = JSON.parse(text + decoder.decode());
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length) throw new Error();
    } catch { return context.json({ error: 'creation_body_rejected' }, 400); }
    finally { reader?.releaseLock(); }
    try {
      return context.json(await createConversation(new D1ConversationStore(context.env.DB), clock), 201);
    } catch {
      // Persistence may have committed. Never promise that a retry is safe or automatic.
      return context.json({ error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE }, 503);
    }
  });

  app.get('/api/conversations/:id', async (context) => {
    try {
      return context.json(await readConversation(new D1ConversationStore(context.env?.DB), clock,
        context.req.param('id'), context.req.header('Authorization')));
    } catch (error) {
      if (error instanceof ConversationUnavailable) {
        context.header('WWW-Authenticate', 'Bearer');
        return context.json({ error: 'conversation_unavailable' }, 401);
      }
      return context.json({ error: 'conversation_dependency_unavailable' }, 503);
    }
  });

  app.get('/api/health', async (context) => {
    context.header('Cache-Control', 'no-store');
    const publication = await new D1ResourceCatalog(context.env?.DB).readSnapshot();
    if (!publication) return context.json({ status: 'unavailable' } satisfies HealthResponse, 503);
    const { catalogRevision, catalogHash, catalogAssetPath } = publication;
    return context.json({ status: 'ok', catalogRevision, catalogHash, catalogAssetPath } satisfies HealthResponse);
  });

  return app;
}

export default createWorker();
