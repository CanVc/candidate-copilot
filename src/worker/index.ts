import { Hono } from 'hono';
import type { HealthResponse } from '../shared/health';
import { D1ResourceCatalog } from '../adapters/d1/publication.ts';

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.get('/api/health', async (context) => {
  context.header('Cache-Control', 'no-store');
  const publication = await new D1ResourceCatalog(context.env?.DB).readSnapshot();
  if (!publication) return context.json({ status: 'unavailable' } satisfies HealthResponse, 503);
  const { catalogRevision, catalogHash, catalogAssetPath } = publication;
  return context.json({ status: 'ok', catalogRevision, catalogHash, catalogAssetPath } satisfies HealthResponse);
});

export default app;
