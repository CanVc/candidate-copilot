import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const fixture = 'tests/fixtures/global-evaluation/cases.json';
const script = 'tools/global-evaluation/preflight.mjs';
const paper = 'content/public/projet-prototype-prets.md';
type Turn = { number: number; requires: string; question: string; review: { language: string; probe: string; anchors: { documentId: string; sectionTitle: string }[] } };
type Input = { corpus: { sourceRevision: string; searchHash: string }; scope: { kind: string; selectedProjectIds: string[]; eligibleDocumentIds: string[] }; cases: { id: string; turns: Turn[] }[] };

// Exercise the only command surface. Each mutation gets an independent source-only copy:
// no provider, repository metadata, settings, artifacts, stdin file or configured test mode.
describe('offline global input preflight', () => {
  let dir: string, input: Input;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'g14-'));
    for (const path of [script, fixture, paper, 'content/public/mission-regie-collections.md', 'content/public/projet-reperage-reserves.md']) {
      expect(lstatSync(path).isFile()).toBe(true);
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      copyFileSync(path, join(dir, path));
    }
    input = JSON.parse(readFileSync(join(dir, fixture), 'utf8'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  function run(...args: string[]) {
    return spawnSync(process.execPath, [join(dir, script), ...args], { cwd: dir, env: {}, encoding: 'utf8' });
  }
  function expectFailure(message: string, ...args: string[]) {
    const r = run(...args);
    expect(r.status).toBe(1);
    expect(r.stdout).toBe('');
    expect(r.stderr).toBe(`Input check failed: ${message}.\n`);
  }
  function checkInvalid(message: string) {
    writeFileSync(join(dir, fixture), JSON.stringify(input));
    expectFailure(message);
  }
  it('reports checked input identity, never evaluation evidence', () => {
    const digest = createHash('sha256').update(readFileSync(join(dir, fixture))).digest('hex');
    const r = run();
    expect(r.status).toBe(0);
    expect(r.stderr).toBe('');
    expect(r.stdout.trim()).toBe(`Input check: global-2.14-v2 sha256=${digest}; 10 global cases, 12 ordered turns; scope, dependencies, lengths, review anchors and 3 pinned public sources checked. No inference or assessment.`);
  });
  it.each(['--run', '--provider', '--results', '--certify', 'other.json'])('rejects %s rather than enabling execution or reading other inputs', flag => {
    expectFailure('no arguments or execution modes supported', flag);
  });
  it('requires every category exactly once', () => {
    const c = input.cases.pop()!;
    checkInvalid('missing case coverage');
    c.id = input.cases[0]!.id;
    input.cases.push(c);
    checkInvalid('duplicate or unknown case');
  });
  it('rejects selected projects and narrowed eligibility even on a named project question', () => {
    input.scope.kind = 'selected'; checkInvalid('global scope');
    input.scope.kind = 'global'; input.scope.selectedProjectIds.push('one'); checkInvalid('global scope');
    input.scope.selectedProjectIds.pop(); input.scope.eligibleDocumentIds[1] = input.scope.eligibleDocumentIds[0]!; checkInvalid('global scope');
    input.scope.eligibleDocumentIds.pop(); checkInvalid('global scope');
  });
  it('requires actual ordered prior turns of the right kind', () => {
    const c = input.cases.find(c => c.id === 'clarification')!;
    c.turns[1]!.number = 1; checkInvalid('ordered turn dependency');
    c.turns[1]!.number = 2; c.turns[1]!.requires = 'fresh'; checkInvalid('ordered turn dependency');
    c.turns[1]!.requires = 'saved-clarification'; c.turns.reverse(); checkInvalid('ordered turn dependency');
    c.turns.pop(); checkInvalid('turn count');
  });
  it('rejects an overlong case outside the fixed turn profile', () => {
    input.cases[0]!.turns = Array(21).fill(input.cases[0]!.turns[0]); checkInvalid('turn count');
  });
  it('keeps the long input long and within untruncated code-point admission', () => {
    const t = input.cases.find(c => c.id === 'long-documented')!.turns[0]!;
    t.question = 'Why?'; checkInvalid('question length');
    t.question = '🙂'.repeat(1001); checkInvalid('question length');
    t.question = '🙂'.repeat(1000); checkInvalid('case revision digest'); // within structural limit, not the pinned question
  });
  it('detects changed pins, source bytes and an extra public input', () => {
    const pins = { ...input.corpus };
    input.corpus.sourceRevision = '0'.repeat(40); checkInvalid('version or corpus pin');
    input.corpus = { ...pins, searchHash: '0'.repeat(64) }; checkInvalid('version or corpus pin');
    input.corpus = pins;
    writeFileSync(join(dir, 'content/public/extra.md'), 'Fiction'); checkInvalid('public inventory');
    rmSync(join(dir, 'content/public/extra.md')); appendFileSync(join(dir, paper), '\n'); checkInvalid('public source digest');
  });
  it('rejects a stale passage even with the correct document', () => {
    const anchor = input.cases[0]!.turns[0]!.review.anchors[0]!;
    anchor.sectionTitle = 'État du projet et usages réels'; checkInvalid('public passage anchor');
    anchor.sectionTitle = 'Missing section'; checkInvalid('public passage anchor');
  });
  it('requires both project passages for the global comparison', () => {
    input.cases.find(c => c.id === 'project-comparison')!.turns[0]!.review.anchors.pop(); checkInvalid('public passage anchor');
  });
  it('requires the language-switch probe and expected language', () => {
    const review = input.cases.find(c => c.id === 'language-switch')!.turns[1]!.review;
    review.language = 'fr'; checkInvalid('review probe'); review.language = 'en'; review.probe = '  '; checkInvalid('review probe');
  });
  it.each(['   ', '\ud800', 'Why?\u0000'])('rejects unusable raw question %#', question => {
    input.cases[2]!.turns[0]!.question = question; checkInvalid('raw question');
  });
  it('never exposes parser context or missing file paths', () => {
    writeFileSync(join(dir, fixture), '{FICTIONAL_SENTINEL'); expectFailure('unreadable input');
    rmSync(join(dir, fixture)); expectFailure('unreadable input');
  });
  it('rejects invalid UTF-8 inside a quoted question', () => {
    const bytes = readFileSync(join(dir, fixture));
    bytes[bytes.indexOf('Je prépare')] = 0xff;
    writeFileSync(join(dir, fixture), bytes); expectFailure('unreadable input');
  });
  it.each([fixture, 'tests/fixtures'])('rejects linked path component %s even for identical content', path => {
    const original = join(dir, path), target = join(dir, 'same-content'); renameSync(original, target);
    symlinkSync(target, original); expectFailure('unexpected input type');
  });
  it.each([fixture, paper])('rejects oversized snapshot input %s', path => {
    writeFileSync(join(dir, path), Buffer.alloc(65537)); expectFailure('input size');
  });
  it('rejects ambiguous duplicate keys, prose and whitespace edits under the same version', () => {
    const path = join(dir, fixture), original = readFileSync(path, 'utf8');
    writeFileSync(path, original.replace('"question":', '"question": "Which?", "question":')); expectFailure('case revision digest');
    writeFileSync(path, original + '\n'); expectFailure('case revision digest');
    input.cases[2]!.turns[0]!.review.probe = 'Different rubric?'; checkInvalid('case revision digest');
    input.cases[2]!.turns[0]!.question = 'Different question?'; checkInvalid('case revision digest');
  });
  it.each(['root', 'case', 'turn', 'review'] as const)('rejects observations or scripted answers on the %s input', level => {
    const c = input.cases[0]!, turn = c.turns[0]!;
    Object.assign(({ root: input, case: c, turn, review: turn.review })[level], { actualAnswer: 'not an input' });
    checkInvalid('unexpected or missing input field');
  });
});
