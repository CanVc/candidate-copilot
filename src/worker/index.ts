import type { ConversationProcessor } from '../ports/ConversationProcessor.ts';
import type { ResourceCatalog } from '../ports/ResourceCatalog.ts';
import { admissionLimits, AdmissionRejected, type AdmissionLimits, type AdmissionErrorCode } from '../shared/conversation-admission.ts';
import { submitConversationQuestion } from '../application/conversation-results.ts';
import { authenticateConversation } from '../application/conversations.ts';
import { Hono } from 'hono';
import type { HealthResponse } from '../shared/health';
import { D1ResourceCatalog } from '../adapters/d1/publication.ts';
import { D1ConversationStore } from '../adapters/d1/conversations.ts';
import { createConversation, readConversation } from '../application/conversations.ts';
import type { Clock } from '../ports/Clock.ts';
import { creationLimit } from '../application/conversation-creation-limits.ts';
import { trustedCreationAddress } from '../adapters/cloudflare/creation-address.ts';
import { ConversationRateLimited, ConversationUnavailable, CREATION_UNCERTAINTY_NOTICE } from '../shared/conversation.ts';

const CREATION_BODY_LIMIT_BYTES = 1024;

// Safe development guidance, not final approved visitor-facing UX copy.
const admissionMessages: Record<AdmissionErrorCode, string> = {
  invalid_request: 'Vérifiez le format de la demande et la longueur de la question avant de l’envoyer.',
  invalid_scope: 'Vérifiez la sélection et le catalogue. Seul le périmètre public global est disponible ici.',
  invalid_retry: 'Cette relance n’est pas disponible. Consultez le résultat de la question d’origine.',
  catalog_stale: 'Actualisez le catalogue, vérifiez votre sélection puis envoyez explicitement la question.',
  scope_unavailable: 'Les documents du périmètre initial sont indisponibles. Le périmètre ne sera pas élargi.',
  request_conflict: 'Cet identifiant appartient à une autre demande. Conservez le texte et le périmètre d’origine pour la vérifier.',
  request_in_progress: 'Cette question est en cours de traitement. Consultez son état sans la renvoyer.',
  conversation_busy: 'Une autre question est en cours. Attendez sa fin avant d’envoyer une nouvelle question.',
  turn_limit_reached: 'La limite de questions de cette conversation est atteinte. Les résultats enregistrés restent consultables.',
  result_unavailable: 'Impossible de récupérer le résultat pour le moment.',
};

export function createWorker(clockOverride?: Clock, addressAdapter = trustedCreationAddress, options: {
  limits?: Partial<AdmissionLimits>; processor?: (catalog: ResourceCatalog) => ConversationProcessor;
} = {}) {
  const limits = admissionLimits(options.limits);
  const clock = clockOverride ?? { now: () => new Date() };
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
      const address = addressAdapter(context.req.raw, context.env?.CREATION_ADDRESS_MODE);
      const limit = creationLimit(context.env?.CONVERSATION_CREATION_LIMIT);
      return context.json(await createConversation(new D1ConversationStore(context.env.DB, clockOverride), clock, address, limit), 201);
    } catch (error) {
      if (error instanceof ConversationRateLimited) {
        context.header('Retry-After', new Date(error.expiresAt).toUTCString());
        return context.json({ error: 'rate_limited' }, 429);
      }
      // Persistence may have committed. Never promise that a retry is safe or automatic.
      return context.json({ error: 'creation_uncertain', message: CREATION_UNCERTAINTY_NOTICE }, 503);
    }
  });

  app.post('/api/conversations/:id/messages', async (context) => {
    let requestId: string | undefined;
    try {
      const store = new D1ConversationStore(context.env?.DB, clockOverride);
      const id = context.req.param('id'), authorization = context.req.header('Authorization');
      // Authentication precedes body parsing and all saved-result lookup.
      await authenticateConversation(store, clock, id, authorization);
      let body: unknown;
      try { body = await context.req.json(); } catch { throw new AdmissionRejected('invalid_request'); }
      if (body && typeof body === 'object' && 'requestId' in body && typeof body.requestId === 'string') requestId = body.requestId;
      const catalog = new D1ResourceCatalog(context.env?.DB);
      return context.json(await submitConversationQuestion(store, catalog, clock, options.processor ? { process: (message, processingContext) => options.processor!(catalog).process(message, processingContext) } : undefined, id, authorization, body, limits), 200);
    } catch (error) {
      if (error instanceof ConversationUnavailable) {
        context.header('WWW-Authenticate', 'Bearer');
        return context.json({ error: 'conversation_unavailable' }, 401);
      }
      const code = error instanceof AdmissionRejected ? error.code : 'result_unavailable';
      const status = code === 'result_unavailable' ? 503 : code === 'turn_limit_reached' ? 429
        : ['invalid_request', 'invalid_scope', 'invalid_retry'].includes(code) ? 400 : 409;
      return context.json({ ...(requestId === undefined ? {} : { requestId }),
        ...(error instanceof AdmissionRejected && error.currentCatalog ? error.currentCatalog : {}), error: {
        code, message: admissionMessages[code],
        retryable: code === 'result_unavailable', retryMode: code === 'result_unavailable' ? 'same_request' : 'none',
      } }, status);
    }
  });

  app.get('/api/conversations/:id', async (context) => {
    try {
      return context.json(await readConversation(new D1ConversationStore(context.env?.DB, clockOverride), clock,
        context.req.param('id'), context.req.header('Authorization'), new D1ResourceCatalog(context.env?.DB), limits, !!options.processor));
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

export async function cleanupCreationLimits(env: Cloudflare.Env, clock?: Clock): Promise<void> {
  try { await new D1ConversationStore(env.DB, clock).cleanupCreationLimits(); }
  catch { throw new Error('conversation_creation_cleanup_unavailable'); }
}

const app = createWorker();
export default Object.assign(app, {
  async scheduled(_event: ScheduledController, env: Cloudflare.Env): Promise<void> {
    await cleanupCreationLimits(env);
  },
});
