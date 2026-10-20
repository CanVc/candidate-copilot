import { Hono } from 'hono';
import type { HealthResponse } from '../shared/health';

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.get('/api/health', (context) => context.json({ status: 'ok' } satisfies HealthResponse));

export default app;
