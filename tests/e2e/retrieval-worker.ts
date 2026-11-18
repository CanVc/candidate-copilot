import { retrieveEvidence } from '../../src/application/retrieve-evidence.ts';
import { D1Retriever } from '../../src/adapters/d1/retriever.ts';
import { RetrievalUnavailable } from '../../src/ports/Retriever.ts';

// Test-only transport; never imported into the application Worker.
export default {
  async fetch(request: Request, env: Cloudflare.Env): Promise<Response> {
    try {
      const { input, limits } = await request.json() as { input: Parameters<D1Retriever['retrieve']>[0]; limits?: ConstructorParameters<typeof D1Retriever>[1] };
      return Response.json(await retrieveEvidence(new D1Retriever(env.DB, limits), input));
    } catch (error) {
      if (!(error instanceof RetrievalUnavailable)) throw error;
      return Response.json({ error: error.code }, { status: 503 });
    }
  },
};
