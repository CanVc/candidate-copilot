import { D1ResourceCatalog } from '../../src/adapters/d1/publication.ts';
import app from '../../src/worker/index.ts';

export default {
  async fetch(request: Request, env: Cloudflare.Env): Promise<Response> {
    if (new URL(request.url).pathname === '/snapshot') {
      const snapshot = await new D1ResourceCatalog(env.DB).readSnapshot();
      return Response.json(snapshot, { status: snapshot ? 200 : 503 });
    }
    return app.fetch(request, env);
  },
};
