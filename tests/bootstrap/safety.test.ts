import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import viteConfig from '../../vite.config';

const root = fileURLToPath(new URL('../../', import.meta.url));
const ignoredPaths = [
  'node_modules/example.js', 'dist/frontend/index.html', 'dist/worker/index.js',
  'coverage/result.json', '.wrangler/state/db.sqlite', 'frontend/.wrangler/state.json',
  '.venv/bin/python', 'venv/bin/python', '.env', '.env.local', '.env.production',
  'frontend/.env.local', '.dev.vars', '.dev.vars.local',
  'content/private/preparation.md', 'content/private/nested/.env.example',
];

describe('publication boundaries', () => {
  it('disables frontend env/asset loading and Worker env-file discovery', () => {
    expect(viteConfig).toMatchObject({ publicDir: false, envDir: false, envPrefix: [] });
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(manifest.scripts['build:worker']).toContain('--env-file /dev/null');
    // Inspect the command itself: inherited CI must not mask missing protection.
    expect(manifest.scripts['build:worker']).toContain('&& CI=true WRANGLER_SEND_METRICS=false wrangler deploy --dry-run');
    expect(manifest.scripts['build:frontend']).not.toContain('CI=true');
  });

  it('ignores local/private paths but permits only intentional example templates', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'candidate-copilot-git-'));
    try {
      copyFileSync(join(root, '.gitignore'), join(temporary, '.gitignore'));
      execFileSync('git', ['init', '--quiet', temporary]);
      const ignored = execFileSync('git', ['check-ignore', '--no-index', '--stdin'], {
        cwd: temporary,
        input: `${ignoredPaths.join('\n')}\n.env.example\n.dev.vars.example\nfrontend/src/App.tsx\n`,
        encoding: 'utf8',
      }).trim().split('\n');
      expect(ignored).toEqual(ignoredPaths);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });

  it('has no tracked local secrets or private content', () => {
    const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
    const forbidden = tracked.filter((path) => {
      const segments = path.split('/');
      const name = segments.at(-1)!;
      return ['content/private/', 'dist/', 'coverage/'].some((prefix) => path.startsWith(prefix)) || segments.some((segment) => ['node_modules', '.wrangler', '.venv', 'venv'].includes(segment)) ||
        (/^(\.env|\.dev\.vars)/.test(name) && !['.env.example', '.dev.vars.example'].includes(name));
    });
    expect(forbidden).toEqual([]);
  });

  it('builds in a real terminal and cleans up bounded synthetic failures', () => {
    const output = execFileSync(process.execPath, ['scripts/check-build-interactivity.mjs'], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, CI: 'true' },
      // Two real build deadlines plus bounded synthetic failures and cleanup.
      timeout: 200_000,
    });
    expect(output).toContain('without skills prompt (fresh settings)');
    expect(output).toContain('without skills prompt (aged accepted metadata preserved)');
    for (const control of ['skills-install', 'skills-update', 'wrapped-install', 'generic-confirmation', 'deadline', 'output-limit', 'interruption', 'orphan']) {
      expect(output).toContain(`PASS: synthetic PTY ${control} rejected and cleaned (not Wrangler).`);
    }
  }, 210_000);

  it('keeps canaries out of both builds independently of Git ignores', () => {
    const output = execFileSync(process.execPath, ['scripts/check-build-isolation.mjs'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 120_000,
    });
    expect(output).toContain('PASS: frontend and Worker artifacts exclude');
  });
});
