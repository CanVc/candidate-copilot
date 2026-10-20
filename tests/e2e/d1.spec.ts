import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, ownedProcesses } from './local-fixture';
import type { LocalFixture } from './local-fixture';

async function run(local: LocalFixture, args: string[]) {
  return local.completed(local.startCommand(process.execPath, args));
}
async function fail(local: LocalFixture, args: string[]) {
  const command = local.startCommand(process.execPath, args);
  try { return await local.rejected(command); } finally { await local.stop(command); }
}
const setup = (action: string, ...args: string[]) => ['scripts/local-d1.mjs', action, ...args];
async function sql(local: LocalFixture, command: string) {
  const output = await run(local, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'candidate-copilot-local',
    '--config', 'wrangler.jsonc', '--local', '--persist-to', '.wrangler/state', '--env-file', '/dev/null', '--json', '--command', command]);
  const results = JSON.parse(output) as { success: boolean; results: Record<string, unknown>[] }[];
  expect(results.every((result) => result.success)).toBe(true);
  return results.map(({ success, results }) => ({ success, results }));
}

// No page/browser fixture is requested: this entire suite works without Chromium.
test.describe('local D1', () => {
  test('initializes, reruns without data loss, and proves CLI/proxy shared state in both directions', async ({ local }) => {
    // Instrument only the disposable helper so actual init/check proxy options,
    // not a separately constructed proxy, must exclude the synthetic env files.
    const helper = join(local.project, 'src/worker/local-d1.ts');
    const source = readFileSync(helper, 'utf8');
    const entry = "  if (!env?.DB || typeof env.DB.prepare !== 'function') {";
    expect(source.split(entry)).toHaveLength(2);
    writeFileSync(helper, source.replace(entry, `  if (Object.keys(env).join(',') !== 'DB') {
    throw new Error('Unexpected binding keys in production local D1 command');
  }
${entry}`));
    expect(await fail(local, setup('check'))).toContain('For new, uninitialized storage run npm run db:init');
    // Exercise the documented npm entrypoints without inherited CI protection.
    local.env.CI = 'false';
    expect(await local.completed(local.startCommand('npm', ['run', 'db:init']))).toContain('PASS: local D1 SQL and exact bootstrap migration marker');
    expect(await local.completed(local.startCommand('npm', ['run', 'db:check']))).toContain('PASS: local D1');
    expect(await local.completed(local.startCommand('npm', ['run', 'db:types']))).toContain('Types written to src/worker/env.d.ts');
    const declarations = readFileSync(join(local.project, 'src/worker/env.d.ts'), 'utf8');
    expect(declarations).toContain('DB: D1Database');
    local.assertNoLeaks(declarations);
    local.env.CI = 'true';
    const tables = await sql(local, "SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name");
    expect(tables[0]?.results.map((row) => row.name)).toEqual(['_cf_METADATA', 'd1_migrations', 'sqlite_sequence']);
    const before = await sql(local, 'SELECT * FROM d1_migrations');
    expect(before[0]?.results).toHaveLength(1);
    expect(before[0]?.results[0]?.name).toBe('0001_local_bootstrap.sql');
    await sql(local, "CREATE TABLE fixture_only (id INTEGER PRIMARY KEY, value TEXT NOT NULL); INSERT INTO fixture_only VALUES (1, 'cli-owned')");
    await run(local, setup('init'));
    expect((await sql(local, 'SELECT value FROM fixture_only WHERE id = 1'))[0]?.results).toEqual([{ value: 'cli-owned' }]);
    expect(await run(local, ['tests/e2e/d1-runtime.mjs', 'proxy-preserve'])).toContain('proxy read CLI row');
    await run(local, setup('init'));
    expect(await sql(local, 'SELECT * FROM d1_migrations')).toEqual(before);
    expect((await sql(local, 'SELECT value FROM fixture_only WHERE id = 1'))[0]?.results).toEqual([{ value: 'proxy-owned' }]);
  });

  test('ignores inherited Wrangler environment selectors for init, check and types', async ({ local }) => {
    const path = join(local.project, 'wrangler.jsonc');
    const original = JSON.parse(readFileSync(path, 'utf8'));
    writeFileSync(path, JSON.stringify({ ...original, env: {
      inherited: { d1_databases: [{ ...original.d1_databases[0], database_name: 'wrong-inherited-target' }] },
    } }));
    local.env.CLOUDFLARE_ENV = 'inherited';
    local.env.WRANGLER_ENV = 'inherited';
    for (const action of ['init', 'check', 'types']) await run(local, setup(action));
    delete local.env.CLOUDFLARE_ENV;
    delete local.env.WRANGLER_ENV;
    expect((await sql(local, 'SELECT name FROM d1_migrations'))[0]?.results).toEqual([{ name: '0001_local_bootstrap.sql' }]);
  });

  test('rejects missing, renamed, wrong-identity, remote, preview and additional bindings before storage access', async ({ local }) => {
    const path = join(local.project, 'wrangler.jsonc');
    const original = JSON.parse(readFileSync(path, 'utf8'));
    const binding = original.d1_databases[0];
    const invalid = [
      [], [{ ...binding, binding: 'RENAMED' }], [{ ...binding, database_name: 'wrong-local' }],
      [{ ...binding, database_id: '11111111-1111-1111-1111-111111111111' }],
      [{ ...binding, remote: true }], [{ ...binding, preview_database_id: binding.database_id }],
      [{ ...binding, migrations_dir: 'elsewhere' }], [binding, { ...binding, binding: 'EXTRA' }],
      [{ ...binding, migrations_table: 'other_ledger' }],
      [{ ...binding, migrations_pattern: 'migrations/0001_local_bootstrap.sql' }],
      [{ ...binding, migrations_pattern: 'migrations/*.txt' }],
    ];
    for (const d1_databases of invalid) {
      writeFileSync(path, JSON.stringify({ ...original, d1_databases }));
      for (const action of ['init', 'check']) {
        expect(await fail(local, setup(action))).toContain('Unsafe local D1 identity');
      }
      expect(existsSync(join(local.project, '.wrangler/state/v3/d1'))).toBe(false);
    }
    writeFileSync(path, JSON.stringify(original));
    for (const args of [['--remote'], ['--preview'], ['--env', 'production'], ['other-database'], ['--persist-to', '/tmp/elsewhere']]) {
      expect(await fail(local, setup('init', ...args))).toContain('no remote, preview, environment or target arguments');
      expect(await fail(local, setup('check', ...args))).toContain('no remote, preview, environment or target arguments');
    }
    expect(existsSync(join(local.project, '.wrangler/state/v3/d1'))).toBe(false);
  });

  test('fails initialization for missing or malformed SQL without swallowing the migration error', async ({ local }) => {
    const path = join(local.project, 'migrations/0001_local_bootstrap.sql');
    rmSync(path);
    expect(await fail(local, setup('init'))).toContain('ENOENT');
    writeFileSync(path, 'THIS IS NOT VALID SQL;\n');
    expect(await fail(local, setup('init'))).toContain('Local Wrangler init failed');
    expect(await fail(local, setup('check'))).toContain('Local D1 SQL/state verification failed');
    // Repair only the disposable un-applied SQL, not an applied migration.
    writeFileSync(path, 'SELECT 1;\n');
    await run(local, setup('init'));
  });

  test('applies a subsequent pending migration exactly once while preserving existing data and history', async ({ local }) => {
    const configPath = join(local.project, 'wrangler.jsonc');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    // Explicit defaults are supported as well as omitted default fields.
    config.d1_databases[0].migrations_table = 'd1_migrations';
    config.d1_databases[0].migrations_pattern = 'migrations/*.sql';
    writeFileSync(configPath, JSON.stringify(config));
    await run(local, setup('init'));
    await sql(local, "CREATE TABLE fixture_only (id INTEGER PRIMARY KEY, value TEXT); INSERT INTO fixture_only VALUES (1, 'preserve-me')");
    const before = await sql(local, 'SELECT * FROM d1_migrations ORDER BY id');
    const migration = '0002_fixture_effect.sql';
    writeFileSync(join(local.project, 'migrations', migration),
      "CREATE TABLE fixture_effect (id INTEGER PRIMARY KEY, value TEXT); INSERT INTO fixture_effect VALUES (1, 'applied-once');\n");
    await run(local, setup('init'));
    const after = await sql(local, 'SELECT * FROM d1_migrations ORDER BY id');
    expect(after[0]?.results.slice(0, -1)).toEqual(before[0]?.results);
    expect(after[0]?.results.at(-1)?.name).toBe(migration);
    expect(after[0]?.results.filter((row) => row.name === migration)).toHaveLength(1);
    const effects = [{ id: 1, value: 'applied-once' }];
    expect((await sql(local, 'SELECT * FROM fixture_effect'))[0]?.results).toEqual(effects);
    await run(local, setup('init'));
    await run(local, setup('check'));
    expect(await sql(local, 'SELECT * FROM d1_migrations ORDER BY id')).toEqual(after);
    expect((await sql(local, 'SELECT * FROM fixture_effect'))[0]?.results).toEqual(effects);
    expect((await sql(local, 'SELECT * FROM fixture_only'))[0]?.results).toEqual([{ id: 1, value: 'preserve-me' }]);
  });

  test('preserves initialized data and ledger when a subsequent migration fails, then reruns stably after unapplied SQL is repaired', async ({ local }) => {
    await run(local, setup('init'));
    await sql(local, "CREATE TABLE fixture_only (id INTEGER PRIMARY KEY, value TEXT); INSERT INTO fixture_only VALUES (1, 'preserve-me')");
    const before = await sql(local, 'SELECT * FROM d1_migrations ORDER BY id');
    const migration = '0002_fixture_failure.sql';
    const path = join(local.project, 'migrations', migration);
    writeFileSync(path, "UPDATE fixture_only SET value = 'must-roll-back'; CREATE TABLE fixture_failed_effect (id INTEGER); THIS IS NOT VALID SQL;\n");
    for (let attempt = 0; attempt < 2; attempt++) {
      expect(await fail(local, setup('init'))).toContain('Local Wrangler init failed');
      expect(await sql(local, 'SELECT * FROM d1_migrations ORDER BY id')).toEqual(before);
      expect((await sql(local, 'SELECT * FROM fixture_only'))[0]?.results).toEqual([{ id: 1, value: 'preserve-me' }]);
      expect((await sql(local, "SELECT name FROM sqlite_schema WHERE name = 'fixture_failed_effect'"))[0]?.results).toEqual([]);
    }
    // Only this disposable, never-applied SQL is repaired, not applied history.
    writeFileSync(path, 'CREATE TABLE fixture_failed_effect (id INTEGER PRIMARY KEY); INSERT INTO fixture_failed_effect VALUES (1);\n');
    await run(local, setup('init'));
    const after = await sql(local, 'SELECT * FROM d1_migrations ORDER BY id');
    expect(after[0]?.results.slice(0, -1)).toEqual(before[0]?.results);
    expect(after[0]?.results.at(-1)?.name).toBe(migration);
    expect(after[0]?.results.filter((row) => row.name === migration)).toHaveLength(1);
    await run(local, setup('init'));
    await run(local, setup('check'));
    expect(await sql(local, 'SELECT * FROM d1_migrations ORDER BY id')).toEqual(after);
    expect((await sql(local, 'SELECT * FROM fixture_failed_effect'))[0]?.results).toEqual([{ id: 1 }]);
    expect((await sql(local, 'SELECT * FROM fixture_only'))[0]?.results).toEqual([{ id: 1, value: 'preserve-me' }]);
  });

  test('fails on unusable storage and never deletes or resets it', async ({ local }) => {
    const directory = join(local.project, '.wrangler/state/v3');
    mkdirSync(directory, { recursive: true });
    const path = join(directory, 'd1');
    writeFileSync(path, 'SYNTHETIC_STORAGE_OBSTRUCTION');
    expect(await fail(local, setup('init'))).toContain('Local Wrangler init failed');
    expect(readFileSync(path, 'utf8')).toBe('SYNTHETIC_STORAGE_OBSTRUCTION');
    await fail(local, setup('check'));
    expect(readFileSync(path, 'utf8')).toBe('SYNTHETIC_STORAGE_OBSTRUCTION');
  });

  test('proxy construction failure exits nonzero without leaving owned runtime processes', async ({ local }) => {
    const directory = join(local.project, '.wrangler/state/v3');
    mkdirSync(directory, { recursive: true });
    // Miniflare also initializes its local cache while constructing the proxy.
    const path = join(directory, 'cache');
    writeFileSync(path, 'SYNTHETIC_RUNTIME_OBSTRUCTION');
    const command = local.startCommand(process.execPath, setup('check'));
    expect(await local.rejected(command)).toContain('Local D1 check failed');
    expect(command.code).toBe(1);
    expect(command.output).toMatch(/EEXIST|ENOTDIR/);
    // Check upstream exit cleanup independently, before fixture fallback cleanup.
    await expect.poll(() => ownedProcesses(command).length).toBe(0);
    expect(readFileSync(path, 'utf8')).toBe('SYNTHETIC_RUNTIME_OBSTRUCTION');
  });

  test('checks the exact ledger marker, not just SQL availability', async ({ local }) => {
    await run(local, setup('init'));
    await sql(local, "UPDATE d1_migrations SET name = 'wrong-bootstrap.sql'");
    expect((await sql(local, 'SELECT 1 AS ok'))[0]?.results).toEqual([{ ok: 1 }]);
    const altered = await fail(local, setup('check'));
    expect(altered).toContain('Expected exactly one 0001_local_bootstrap.sql migration marker');
    expect(altered).toContain('If migration history was altered, stop and review it rather than reinitializing');
    await sql(local, "UPDATE d1_migrations SET name = '0001_local_bootstrap.sql'");
    await run(local, setup('check'));
    await sql(local, 'DROP TABLE d1_migrations');
    expect(await fail(local, setup('check'))).toContain('Local D1 SQL/state verification failed');
  });

  test('executes the private helper inside an actual workerd handler with independent storage', async ({ local }) => {
    const output = await run(local, ['tests/e2e/d1-runtime.mjs', 'worker']);
    expect(output).toContain('PASS: private SQL helper in actual workerd scheduled handler; independent storage and negative controls.');
    // Harness success must not be mistaken for initialization of CLI persistence.
    expect(await fail(local, setup('check'))).toContain('Local D1 SQL/state verification failed');
  });

  test('interruption closes an active D1 runtime and cleans only the owned disposable fixture', async ({ local }) => {
    await run(local, setup('init'));
    const command = local.startCommand(process.execPath, ['tests/e2e/d1-runtime.mjs', 'interrupt']);
    await expect.poll(() => command.output, { timeout: 10_000 }).toContain('D1_RUNTIME_READY');
    const root = [...command.owned][0];
    expect(root).toBeDefined();
    const [pid, identity] = root!;
    expect(ownedProcesses(command).find(([candidate]) => candidate === pid)?.[1].birth).toBe(identity.birth);
    process.kill(pid, 'SIGINT');
    expect(await local.rejected(command)).toContain('D1_RUNTIME_READY');
    expect(command.code).toBe(130);
    expect(command.signal).toBeNull();
    await local.stop(command);
    expect(ownedProcesses(command)).toHaveLength(0);
    await local.dispose();
    expect(existsSync(local.directory)).toBe(false);
  });

  test('manual reset targets only disposable local D1 after all owned writers stop', async ({ local }) => {
    await run(local, setup('init'));
    await sql(local, "CREATE TABLE fixture_only (value TEXT); INSERT INTO fixture_only VALUES ('disposable')");
    const keep = join(local.project, '.wrangler/state/v3/keep.txt');
    writeFileSync(keep, 'OTHER_LOCAL_STATE');
    // DESTRUCTIVE: all one-shots above are closed and their owned scopes stopped.
    // Never run this reset against the real repository/developer state.
    const target = join(local.project, '.wrangler/state/v3/d1');
    expect(target.startsWith(`${local.directory}/project/`)).toBe(true);
    expect(existsSync(target)).toBe(true);
    rmSync(target, { recursive: true });
    expect(readFileSync(keep, 'utf8')).toBe('OTHER_LOCAL_STATE');
    expect(await fail(local, setup('check'))).toContain('Local D1 SQL/state verification failed');
    await run(local, setup('init'));
    await run(local, setup('check'));
    expect((await sql(local, "SELECT name FROM sqlite_schema WHERE name = 'fixture_only'"))[0]?.results).toEqual([]);
    expect(readFileSync(keep, 'utf8')).toBe('OTHER_LOCAL_STATE');
  });
});
