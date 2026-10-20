import { verifyLocalD1 } from '../../src/worker/local-d1';

// Test-only scheduled handler: the production Worker has no SQL diagnostic route.
export default {
  async scheduled(_event, env) {
    await verifyLocalD1(env);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
