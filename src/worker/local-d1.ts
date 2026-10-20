// Private local verification, not part of health or any public route.
export async function verifyLocalD1(env: Pick<Cloudflare.Env, 'DB'>): Promise<void> {
  if (!env?.DB || typeof env.DB.prepare !== 'function') {
    throw new Error('Local D1 binding DB is missing or invalid; check wrangler.jsonc.');
  }
  try {
    const sql = await env.DB.prepare('SELECT 1 AS ok').all<{ ok: number }>();
    if (!sql.success || sql.results.length !== 1 || sql.results[0]?.ok !== 1) {
      throw new Error('SELECT 1 returned an unexpected result.');
    }
    const marker = '0001_local_bootstrap.sql';
    const ledger = await env.DB.prepare('SELECT name FROM d1_migrations WHERE name = ?')
      .bind(marker).all<{ name: string }>();
    if (!ledger.success || ledger.results.length !== 1 || ledger.results[0]?.name !== marker) {
      throw new Error(`Expected exactly one ${marker} migration marker.`);
    }
  } catch (cause) {
    throw new Error('Local D1 SQL/state verification failed; check the local binding/storage. For new, uninitialized storage run npm run db:init. If migration history was altered, stop and review it rather than reinitializing.', { cause });
  }
}
