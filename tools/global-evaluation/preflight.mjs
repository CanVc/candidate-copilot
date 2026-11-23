// Standalone, input-only: no application imports, command execution or configurable paths.
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { isDeepStrictEqual as equal } from 'node:util';

const root = new URL('../../', import.meta.url);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
class InvalidInput extends Error {}
function check(condition, label) { if (!condition) throw new InvalidInput(label); }
function fields(object, names) {
  check(object !== null && typeof object === 'object' && !Array.isArray(object) &&
    equal(Object.keys(object).sort(), names.split(' ').sort()), 'unexpected or missing input field');
}
function fixedPath(path) {
  const parts = path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const stat = lstatSync(new URL(parts.slice(0, i).join('/'), root));
    check(stat.isDirectory() || (i === parts.length && stat.isFile()), 'unexpected input type');
    if (stat.isFile()) check(stat.size <= 64 * 1024, 'input size'); // immutable development snapshot, not a live filesystem
  }
  return new URL(path, root);
}
const mission = '0eaf8b1d-791d-4c60-9234-168a6a03acbd';
const prototype = '87ddaeda-8ee4-4056-9931-5ebf7b677875';
const reserve = 'a53a192f-51d5-4537-8200-427a09ee1ea3';
// Raw-byte inventory from the development-only 2.1 handoff. Artifact identities
// below are the 2.4 pins, not hashes of artifacts materialized by this check.
const documents = [
  [mission, 'mission-regie-collections.md', '62dc67fcd7f288d58a6851dba1e07d447b00e0f7381d375b92ff07e7219522ea'],
  [prototype, 'projet-prototype-prets.md', '945a1f3d2d853205085fec7f6246bd1a415b3c09e9b3b65913e4fcba35f01e2a'],
  [reserve, 'projet-reperage-reserves.md', '18dd57a7dc4eeeb8c1c86d22122125068f859dfb04d117b7ffac3c2d3ae10121'],
];
const corpus = {
  sourceRevision: '4323afe312f43b6b87a014abee062e03e12f6022',
  catalogHash: '053eec31f9374f443caada2221b093a912c18f0581e132bc2bae5252335034e6',
  searchHash: '88297f906c707949024c5a66507fd4111cdcdef8003d084847e43ce17df9c28a',
};
const outcomes = [reserve, 'Résultats démontrés et limites'];
const collaboration = [mission, 'Autonomie et collaboration'];
const state = 'État du projet et usages réels';
// Ordered input relationships, reviewer language probes and passage identities (not results).
const coverage = new Map(Object.entries({
  'long-documented': [['fresh', 'fr', outcomes]],
  clarification: [['fresh', 'fr'], ['saved-clarification', 'fr', [prototype, state]]],
  corporate: [['fresh', 'en', collaboration]],
  'language-switch': [['fresh', 'fr', [reserve, state]], ['saved-answer', 'en', [reserve, state]]],
  'project-comparison': [['fresh', 'fr', [reserve, state], [prototype, state]]],
  'missing-information': [['fresh', 'fr', outcomes]],
  'value-judgment': [['fresh', 'fr', collaboration]],
  commitment: [['fresh', 'fr']], 'sensitive-personal': [['fresh', 'fr']], injection: [['fresh', 'fr']],
}));

function preflight() {
  check(process.argv.length === 2, 'no arguments or execution modes supported');
  const bytes = readFileSync(fixedPath('tests/fixtures/global-evaluation/cases.json'));
  const input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  fields(input, 'version corpus scope cases');
  check(input.version === 'global-2.14-v2' && equal(input.corpus, corpus), 'version or corpus pin');
  check(equal(input.scope, { kind: 'global', selectedProjectIds: [], eligibleDocumentIds: documents.map(d => d[0]) }), 'global scope');
  const names = readdirSync(fixedPath('content/public')).sort();
  check(equal(names, documents.map(d => d[1]).sort()), 'public inventory');
  const sections = new Map();
  for (const [id, file, hash] of documents) {
    const source = readFileSync(fixedPath(`content/public/${file}`));
    check(sha256(source) === hash, 'public source digest');
    const lines = source.toString('utf8').split('\n');
    check(lines.includes(`document_id: "${id}"`), 'public document identity');
    sections.set(id, lines.filter(line => line.startsWith('## ')).map(line => line.slice(3)));
  }
  const remaining = new Map(coverage);
  let turns = 0;
  check(Array.isArray(input.cases), 'case list');
  for (const c of input.cases) {
    fields(c, 'id turns');
    const profile = remaining.get(c.id);
    check(profile && remaining.delete(c.id), 'duplicate or unknown case');
    check(Array.isArray(c.turns) && c.turns.length <= 20 && c.turns.length === profile.length, 'turn count');
    for (const [index, t] of c.turns.entries()) {
      const [requires, language, ...expectedPassages] = profile[index];
      fields(t, 'number requires question review');
      check(t.number === index + 1 && t.requires === requires, 'ordered turn dependency');
      check(typeof t.question === 'string' && t.question.trim() && t.question.isWellFormed() &&
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(t.question), 'raw question');
      const length = Array.from(t.question).length; // admission counts Unicode code points, not bytes
      check(length <= 1000 && (c.id !== 'long-documented' || length >= 500), 'question length');
      fields(t.review, 'language probe anchors');
      check(t.review.language === language && typeof t.review.probe === 'string' && t.review.probe.trim(), 'review probe');
      const anchors = expectedPassages.map(([documentId, sectionTitle]) => ({ documentId, sectionTitle }));
      check(equal(t.review.anchors, anchors) && anchors.every(a => sections.get(a.documentId)?.includes(a.sectionTitle)), 'public passage anchor');
      turns++;
    }
  }
  check(!remaining.size, 'missing case coverage');
  // Check after structural diagnostics; even a duplicate JSON key or whitespace edit changes the bytes.
  const digest = sha256(bytes);
  check(digest === '3075022367346d57870a1f663170e29a6ad444f6c1f1d392c092f45a52e3c654', 'case revision digest');
  console.log(`Input check: ${input.version} sha256=${digest}; ${coverage.size} global cases, ${turns} ordered turns; scope, dependencies, lengths, review anchors and 3 pinned public sources checked. No inference or assessment.`);
}
try { preflight(); } catch (error) {
  // Never echo untrusted input, including JSON parser context or filesystem diagnostics.
  console.error(`Input check failed: ${error instanceof InvalidInput ? error.message : 'unreadable input'}.`);
  process.exitCode = 1;
}
