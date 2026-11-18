import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function fingerprintInputs(project, inputs) {
  const hash = createHash('sha256');
  const hashPath = (relative) => {
    const disk = join(project, relative);
    if (statSync(disk).isDirectory()) {
      for (const entry of readdirSync(disk).sort()) hashPath(`${relative}/${entry}`);
    } else { hash.update(relative + '\0'); hash.update(readFileSync(disk)); hash.update('\0'); }
  };
  for (const path of [...inputs].sort()) hashPath(path);
  return hash.digest('hex');
}

export function readEvaluationToolchain(project) {
  const require = createRequire(join(project, 'package.json'));
  const wrangler = createRequire(require.resolve('wrangler/package.json'));
  const miniflare = createRequire(wrangler.resolve('miniflare'));
  return { node: process.version, wrangler: require('wrangler/package.json').version,
    workerd: miniflare('workerd/package.json').version,
    dependencyLockHash: createHash('sha256').update(readFileSync(join(project, 'package-lock.json'))).digest('hex'),
    engine: 'local D1/workerd FTS5' };
}

async function main() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  if (process.argv[2] === '--disposable' && process.argv.length === 5) {
    const { createTestHarness } = await import('wrangler');
    const { assemblePublicArtifacts } = await import('../tools/public-content/build.ts');
    const { evaluateRetrieval, renderEvaluation } = await import('../tools/retrieval/evaluate.ts');
    const fixtures = JSON.parse(readFileSync(join(root, 'tests/fixtures/retrieval/cases.json'), 'utf8'));
    const server = createTestHarness({ root: join(root, 'tests/e2e'), workers: [{ config: {
      name: 'retrieval-evaluation', main: join(root, 'tests/e2e/retrieval-worker.ts'), compatibility_date: '2026-06-11', send_metrics: false,
      d1_databases: [{ binding: 'DB', database_name: 'retrieval-disposable', database_id: '00000000-0000-0000-0000-000000000000', remote: false, migrations_dir: join(root, 'migrations') }],
    } }] });
    try {
      await server.listen();
      const worker = server.getWorker('retrieval-evaluation');
      await worker.applyD1Migrations('DB');
      const { DB } = await worker.getEnv();
      const report = await evaluateRetrieval(DB, fixtures, assemblePublicArtifacts(root, fixtures.sourceRevision), process.argv[3]);
      report.applicationFilesHash = process.argv[4];
      report.toolchain = readEvaluationToolchain(root);
      writeFileSync(join(root, 'report.md'), renderEvaluation(report));
      if (report.negativeHits || report.results.some((result) => !result.emptyExpectationMet)) process.exitCode = 1;
    } finally { await server.close(); }
  } else if (process.argv.length !== 2) {
    console.error('Usage: npm run evaluate:retrieval');
    process.exitCode = 1;
  } else {
    const directory = mkdtempSync(join(tmpdir(), 'candidate-copilot-retrieval-evaluation-'));
    const project = join(directory, 'project');
    const inputs = ['src', 'tools/public-content', 'tools/retrieval', 'migrations', 'tests/e2e/retrieval-worker.ts', 'tests/fixtures/retrieval/cases.json', 'scripts/evaluate-retrieval.mjs', 'package.json', 'package-lock.json'];
    try {
      mkdirSync(project);
      for (const path of inputs) {
        mkdirSync(dirname(join(project, path)), { recursive: true });
        cpSync(join(root, path), join(project, path), { recursive: true });
      }
      symlinkSync(join(root, 'node_modules'), join(project, 'node_modules'));
      const settings = join(directory, 'settings');
      const env = { PATH: process.env.PATH, HOME: join(settings, 'home'), LANG: 'C.UTF-8', CI: 'true', WRANGLER_SEND_METRICS: 'false',
        WRANGLER_CACHE_DIR: join(settings, 'cache'), WRANGLER_LOG_PATH: join(settings, 'logs'), TMPDIR: join(settings, 'tmp'),
        XDG_CONFIG_HOME: join(settings, 'config'), XDG_CACHE_HOME: join(settings, 'xdg-cache'), XDG_DATA_HOME: join(settings, 'data'), XDG_STATE_HOME: join(settings, 'state'),
        GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' };
      for (const path of [env.HOME, env.TMPDIR]) mkdirSync(path, { recursive: true });
      const git = (...args) => execFileSync('git', args, { cwd: project, env, stdio: 'pipe', encoding: 'utf8' }).trim();
      const fixtures = JSON.parse(readFileSync(join(project, 'tests/fixtures/retrieval/cases.json'), 'utf8'));
      git('init', '--quiet');
      git('-c', 'protocol.file.allow=always', 'fetch', '--no-tags', root, fixtures.sourceRevision);
      git('restore', '--source', fixtures.sourceRevision, '--worktree', 'content/public');
      const applicationRevision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
      const child = spawnSync(process.execPath, ['scripts/evaluate-retrieval.mjs', '--disposable', applicationRevision, fingerprintInputs(project, inputs)], {
        cwd: project, env, timeout: 90000, stdio: 'pipe', maxBuffer: 1000000,
      });
      if (child.error || child.signal) throw new Error('EVALUATION_FAILED');
      const output = join(root, 'docs/evaluations/retrieval-2-4.md');
      mkdirSync(dirname(output), { recursive: true });
      writeFileSync(output, readFileSync(join(project, 'report.md')));
      if (child.status !== 0) {
        console.error('EVALUATION_FAILED: report docs/evaluations/retrieval-2-4.md retained');
        process.exitCode = 1;
      } else console.log('PASS: actual disposable D1 evaluation; report docs/evaluations/retrieval-2-4.md');
    } catch {
      console.error('EVALUATION_FAILED');
      process.exitCode = 1;
    } finally { rmSync(directory, { recursive: true, force: true }); }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
