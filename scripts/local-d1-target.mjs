import { dirname, join, resolve } from 'node:path';

export async function assertLocalD1Target(root) {
  const configPath = join(root, 'wrangler.jsonc');
  // Apply before importing Wrangler, which reads settings at module load time.
  process.env.CI = 'true';
  process.env.WRANGLER_SEND_METRICS = 'false';
  process.env.CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = 'false';
  process.env.CLOUDFLARE_INCLUDE_PROCESS_ENV = 'false';
  delete process.env.WRANGLER_ENV;
  delete process.env.CLOUDFLARE_ENV;
  const { unstable_readConfig } = await import('wrangler');
  const config = unstable_readConfig({ config: configPath });
  const [database] = config.d1_databases;
  if (config.configPath !== configPath || config.d1_databases.length !== 1 ||
      database?.binding !== 'DB' || database.database_name !== 'candidate-copilot-local' ||
      database.database_id !== '00000000-0000-0000-0000-000000000000' ||
      database.remote !== false || database.preview_database_id !== undefined ||
      (database.migrations_table ?? 'd1_migrations') !== 'd1_migrations' ||
      (database.migrations_pattern ?? 'migrations/*.sql') !== 'migrations/*.sql' ||
      resolve(dirname(configPath), database.migrations_dir ?? '') !== join(root, 'migrations')) {
    throw new Error('Unsafe local D1 identity: require only DB / candidate-copilot-local / all-zero UUID, remote:false, no preview, migrations_dir:migrations, default migrations_table:d1_migrations and migrations_pattern:migrations/*.sql in wrangler.jsonc.');
  }

  return configPath;
}
