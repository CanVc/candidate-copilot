import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { test, expect, type LocalFixture } from './local-fixture';

const root = fileURLToPath(new URL('../../', import.meta.url));
function prepare(local: LocalFixture) {
  for (const path of ['tools/public-content', 'tools/retrieval', 'tests/e2e/retrieval-runtime.mjs', 'tests/e2e/retrieval-worker.ts', 'tests/fixtures/retrieval/cases.json', 'scripts/evaluate-retrieval.mjs', 'package-lock.json']) {
    mkdirSync(dirname(join(local.project, path)), { recursive: true });
    cpSync(join(root, path), join(local.project, path), { recursive: true });
  }
  rmSync(join(local.project, 'content/public'), { recursive: true, force: true });
  mkdirSync(join(local.project, 'content/public/resources'), { recursive: true });
  const git = (...args: string[]) => execFileSync('git', args, { cwd: local.project, env: { ...local.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' }, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  const source = (id: string, text: string, extra = '') => `---\ndocument_id: ${id}\nvisibility: public\ntitle: Fiction\ncreated_at: "2024-01-01T00:00:00Z"\nmodified_at: "2024-01-01T00:00:00Z"\nreviewed_by: "SYNTHETIC TEST ONLY"\nreviewed_at: "2024-01-01T00:00:00Z"\n${extra}---\n${text}`;
  const body = (variant: string) => `# Fiction\n\n> Fiction unrelated to BC, development only.\n\n## Evidence\n\nAlpha ${variant}. ${'Descriptive literal evidence with no additional query vocabulary. '.repeat(12)}\n`;
  for (const id of ['d-a', 'd-c']) writeFileSync(join(local.project, `content/public/${id}.md`), source(id, body('original')));
  for (let i = 0; i < 8; i++) writeFileSync(join(local.project, `content/public/excluded-${i}.md`), source(`excluded-${i}`, `# Fiction\n\n> Fiction unrelated to BC, development only.\n\n## Distractor\n\n${'Alpha '.repeat(50)}\n`));
  const warning = '# Fiction\n\n> Fiction unrelated to BC, development only.\n\n';
  writeFileSync(join(local.project, 'content/public/ordinal.md'), source('d-ordinal-1', warning + '## Ordinal\n\nTieprobe identical passage.\n\n## Ordinal\n\nTieprobe identical passage.\n\n'));
  writeFileSync(join(local.project, 'content/public/rank-weak.md'), source('d-rank-a-weak', warning + '## Ranking\n\nScoreprobe ' + 'Neutral padding vocabulary. '.repeat(30) + '\n'));
  writeFileSync(join(local.project, 'content/public/rank-strong.md'), source('d-rank-z-strong', warning + '## Ranking\n\n' + 'Scoreprobe '.repeat(50) + '\n'));
  writeFileSync(join(local.project, 'content/public/budget-large.md'), source('d-budget-a-large', warning + '## Budget\n\n' + 'Budgetprobe '.repeat(100) + '\n'));
  for (const suffix of ['b', 'c']) writeFileSync(join(local.project, `content/public/budget-${suffix}.md`), source(`d-budget-${suffix}-small`, warning + '## Budget\n\nBudgetprobe small complete passage.\n'));
  writeFileSync(join(local.project, 'content/public/empty.md'), source('d-empty', ''));
  writeFileSync(join(local.project, 'content/public/resources/r.md'), source('d-resource', '# Fixture\n', 'resource_id: fixture\nresource_name: Fixture\nresource_description: Development only\ndocument_ids: [d-a, d-c]\n'));
  const commit = () => {
    git('add', 'content/public');
    git('-c', 'user.name=Synthetic Test', '-c', 'user.email=test@example.invalid', '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '-m', 'Synthetic retrieval fixture');
    return git('rev-parse', 'HEAD');
  };
  const a = commit();
  for (const id of ['d-a', 'd-c']) writeFileSync(join(local.project, `content/public/${id}.md`), source(id, body('replacement')));
  const b = commit();
  git('-c', 'protocol.file.allow=always', 'fetch', '--no-tags', root, '4323afe312f43b6b87a014abee062e03e12f6022');
  return { a, b };
}

test('real D1 scoped lexical matrix, corruption, independent-reader races and approved-corpus evaluation', async ({ local }) => {
  const { a, b } = prepare(local);
  const command = local.startCommand(process.execPath, ['tests/e2e/retrieval-runtime.mjs', a, b]);
  const output = await local.completed(command);
  console.log(output.trim());
  expect(output).toContain('PASS: real D1 retrieval matrix');
  expect(output).toContain('independent-reader race observations');
  expect(output).toContain('12 approved fictional evaluation cases');
});

test('standalone evaluation preserves reports and fails only mechanical negative expectations, not recall gaps', async ({ local }) => {
  prepare(local);
  const path = join(local.project, 'tests/fixtures/retrieval/cases.json');
  const fixtures = JSON.parse(readFileSync(path, 'utf8')) as import('../../tools/retrieval/evaluate.ts').RetrievalCases;
  const readReport = () => JSON.parse(readFileSync(join(local.project, 'docs/evaluations/retrieval-2-4.md'), 'utf8').split('```json\n')[1]!.split('\n```')[0]!);
  const run = () => local.startCommand(process.execPath, ['scripts/evaluate-retrieval.mjs']);
  expect(await local.completed(run())).toContain('PASS: actual disposable D1 evaluation');
  expect(readReport().foundPassages).toBe(6);
  expect(readReport().requiredPassages).toBe(10); // ordinary recall gaps must not fail
  const original = structuredClone(fixtures);
  fixtures.cases[0]!.negativePassages = [...fixtures.cases[0]!.requiredPassages];
  writeFileSync(path, JSON.stringify(fixtures));
  const assertFailure = async () => {
    const command = run();
    try {
      const output = await local.rejected(command);
      expect(command.code).toBe(1);
      expect(output).toContain('EVALUATION_FAILED');
      expect(output).not.toContain('PASS:');
    } finally { await local.stop(command); }
  };
  await assertFailure();
  expect(readReport().negativeHits).toBe(1);
  original.cases[0]!.expectEmpty = true;
  writeFileSync(path, JSON.stringify(original));
  await assertFailure();
  expect(readReport().negativeHits).toBe(0);
  expect(readReport().results[0].emptyExpectationMet).toBe(false);
});
