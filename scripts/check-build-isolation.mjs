import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), 'candidate-copilot-isolation-'));

// Never read, modify or remove real private files. All canaries live in our own copy.
try {
  for (const path of ['package.json', 'frontend/index.html', 'frontend/src', 'src', 'vite.config.ts', 'wrangler.jsonc', 'tsconfig.json', 'tsconfig.frontend.json', 'tsconfig.worker.json', 'tsconfig.tooling.json']) {
    mkdirSync(dirname(join(temporary, path)), { recursive: true });
    cpSync(join(root, path), join(temporary, path), {
      recursive: true,
      // Copy only application source, not local env files or preparation docs.
      filter: (source) => {
        const stat = lstatSync(source);
        return stat.isDirectory() || (stat.isFile() && /\.(?:jsonc?|tsx?|css|html)$/.test(source));
      },
    });
  }
  symlinkSync(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');

  const markers = [];
  const fixtures = [
    'content/private/preparation.md',
    'content/public/unpublished.md',
    'docs/preparation.md',
    '_bmad/preparation.md',
    '.agents/preparation.md',
    '.env', '.env.local', '.env.production', '.dev.vars', '.dev.vars.production',
    'frontend/.env', 'frontend/.env.local', 'frontend/.env.production',
    'frontend/public/preparation.txt', 'public/preparation.txt',
    '.wrangler/state/generated.txt', '.venv/local.txt',
    'coverage/generated.txt', 'dist/stale.txt', 'dist/worker/stale.txt',
  ];
  for (const path of fixtures) {
    const marker = `ISOLATION_CANARY_${randomUUID().replaceAll('-', '')}`;
    markers.push(marker);
    const destination = join(temporary, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, path.includes('.env') ? `VITE_ISOLATION_CANARY=${marker}\n` : marker);
  }

  // Force Vite to materialize its exposed env object, so the check catches a
  // regression even though the real static shell does not read configuration.
  writeFileSync(join(temporary, 'frontend/src/main.tsx'), '\nconsole.log(import.meta.env, process.env.ISOLATION_SERVER_SECRET);\n', { flag: 'a' });
  const shellMarker = `ISOLATION_CANARY_${randomUUID().replaceAll('-', '')}`;
  const serverMarker = `ISOLATION_CANARY_${randomUUID().replaceAll('-', '')}`;
  markers.push(shellMarker, serverMarker);
  mkdirSync(join(temporary, '.home'));
  // Do not pass through real credentials, npm user configuration or HOME.
  const env = {
    PATH: process.env.PATH,
    HOME: join(temporary, '.home'),
    LANG: 'C.UTF-8',
    VITE_ISOLATION_FROM_SHELL: shellMarker,
    ISOLATION_SERVER_SECRET: serverMarker,
    WRANGLER_SEND_METRICS: 'false',
    XDG_CONFIG_HOME: join(temporary, '.config'),
    CI: 'true',
  };
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execFileSync(npm, ['run', 'build'], { cwd: temporary, env, stdio: 'pipe', timeout: 100_000 });

  // Asset inlining can base64-encode private bytes. Cover all byte alignments
  // because a marker may occur after an arbitrary prefix in an encoded file.
  const representations = markers.flatMap((marker) => [
    Buffer.from(marker),
    ...[0, 1, 2].map((offset) => Buffer.from(
      Buffer.from(marker.slice(offset)).toString('base64').replace(/=+$/, '').slice(0, -3),
    )),
  ]);

  function inspect(directory) {
    let count = 0;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) count += inspect(path);
      else {
        assert(entry.isFile(), `Unexpected artifact type: ${path}`);
        const bytes = readFileSync(path);
        for (const representation of representations) {
          assert(!bytes.includes(representation), `Canary leaked into ${path}`);
        }
        count++;
      }
    }
    return count;
  }
  for (const target of ['frontend', 'worker']) {
    const output = join(temporary, 'dist', target);
    assert(existsSync(output), `Missing ${target} output`);
    assert(inspect(output) > 0, `Empty ${target} output`);
  }
  assert(existsSync(join(temporary, 'dist/frontend/index.html')));
  assert(existsSync(join(temporary, 'dist/worker/index.js')));
  console.log(`PASS: frontend and Worker artifacts exclude ${markers.length} disposable canaries (independent of Git ignores).`);
} catch (error) {
  if (error.stdout) process.stderr.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  throw error;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
