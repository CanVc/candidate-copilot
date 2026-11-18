import type { ArtifactBundle } from '../public-content/build.ts';
import type { PublicSearchArtifacts } from '../../src/shared/public-evidence.ts';
import type { PublicCatalog } from '../../src/shared/public-catalog.ts';
import { D1Retriever, defaultLexicalLimits, type LexicalLimits } from '../../src/adapters/d1/retriever.ts';
import { retrieveEvidence } from '../../src/application/retrieve-evidence.ts';
import type { RetrievalRequest } from '../../src/ports/Retriever.ts';

export interface PassageExpectation { documentId: string; sectionTitle: string | null }
export interface RetrievalCase extends RetrievalRequest {
  id: string;
  category: string;
  requiredPassages: PassageExpectation[];
  negativePassages: PassageExpectation[];
  expectEmpty: boolean;
  limitation: string;
}
export interface RetrievalCases { version: 1; sourceRevision: string; cases: RetrievalCase[] }

// Development fixtures only: caller supplies a newly-created disposable D1.
// Not an operator activation API; production publication retains HTTP verification.
export async function installEvaluationPublication(db: D1Database, bundle: ArtifactBundle): Promise<PublicSearchArtifacts> {
  const search = JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]!) as PublicSearchArtifacts;
  const { payload } = JSON.parse(bundle.files[`assets/resources-catalog.${bundle.catalogHash}.json`]!) as PublicCatalog;
  const statements: D1PreparedStatement[] = [];
  const add = (sql: string, ...values: (string | number)[]) => { statements.push(db.prepare(sql).bind(...values)); };
  for (const table of ['public_chunks_fts', 'public_chunks', 'public_resource_documents', 'public_resources', 'public_documents', 'active_publication']) add(`DELETE FROM ${table}`);
  for (const d of search.documents) add('INSERT INTO public_documents VALUES (?, ?, ?, ?)', d.documentId, d.sourcePath, JSON.stringify(d), search.chunks.filter((c) => c.documentId === d.documentId).length);
  for (const r of payload.resources) {
    add('INSERT INTO public_resources VALUES (?, ?, ?)', r.resourceId, r.name, r.description);
    for (const id of r.documentIds) add('INSERT INTO public_resource_documents VALUES (?, ?)', r.resourceId, id);
  }
  for (const c of search.chunks) {
    add('INSERT INTO public_chunks VALUES (?, ?, ?, ?)', c.chunkId, c.documentId, c.ordinal, JSON.stringify(c));
    add('INSERT INTO public_chunks_fts (chunk_id, text) VALUES (?, ?)', c.chunkId, c.text);
  }
  add('INSERT INTO active_publication VALUES (1, ?, ?, ?)', search.catalogRevision, bundle.catalogHash, '2026-11-18T00:00:00Z');
  if ((await db.batch(statements)).some((r) => !r.success)) throw new Error('EVALUATION_FAILED');
  return search;
}

export async function evaluateRetrieval(db: D1Database, fixtures: RetrievalCases, bundle: ArtifactBundle, applicationRevision: string, limits: LexicalLimits = defaultLexicalLimits) {
  const artifacts = await installEvaluationPublication(db, bundle);
  if (artifacts.catalogRevision !== fixtures.sourceRevision || fixtures.version !== 1 || !fixtures.cases.length) throw new Error('EVALUATION_FAILED');
  for (const fixture of fixtures.cases) {
    for (const expectation of [...fixture.requiredPassages, ...fixture.negativePassages]) {
      if (!artifacts.chunks.some((c) => c.documentId === expectation.documentId && c.sectionTitle === expectation.sectionTitle)) throw new Error('EVALUATION_FAILED');
    }
  }
  const results = [];
  for (const fixture of fixtures.cases) {
    const { resolvedQuestion, searchTerms, eligibleDocumentIds } = fixture;
    const { chunks } = await retrieveEvidence(new D1Retriever(db, limits), { resolvedQuestion, searchTerms, eligibleDocumentIds });
    for (const [index, chunk] of chunks.entries()) {
      if (chunk.rank !== index + 1) throw new Error('EVALUATION_FAILED');
      const artifact = artifacts.chunks.find((c) => c.chunkId === chunk.chunkId);
      if (!artifact || !eligibleDocumentIds.includes(chunk.documentId)) throw new Error('EVALUATION_FAILED');
      for (const key of ['chunkId', 'documentId', 'sourcePath', 'sourceRevision', 'contentHash', 'sourceTitle', 'sectionTitle', 'text', 'location'] as const) {
        if (chunk[key] !== artifact[key]) throw new Error('EVALUATION_FAILED');
      }
    }
    const matches = (expected: PassageExpectation) => chunks.some((c) => c.documentId === expected.documentId && c.sectionTitle === expected.sectionTitle);
    const found = fixture.requiredPassages.filter(matches);
    const missed = fixture.requiredPassages.filter((p) => !matches(p));
    const negativeHits = fixture.negativePassages.filter(matches);
    const nonRequiredHits = chunks.filter((c) => !fixture.requiredPassages.some((p) => p.documentId === c.documentId && p.sectionTitle === c.sectionTitle)).map((c) => c.chunkId);
    results.push({ ...fixture, chunks, found, missed, negativeHits, nonRequiredHits, emptyExpectationMet: !fixture.expectEmpty || chunks.length === 0 });
  }
  return { version: 1, sourceRevision: fixtures.sourceRevision, applicationRevision, applicationState: 'working-tree implementation (not a committed release)',
    catalogHash: bundle.catalogHash, searchHash: bundle.searchHash, limits,
    requiredPassages: results.reduce((n, r) => n + r.requiredPassages.length, 0),
    foundPassages: results.reduce((n, r) => n + r.found.length, 0),
    negativeHits: results.reduce((n, r) => n + r.negativeHits.length, 0), results };
}

export function renderEvaluation(report: Awaited<ReturnType<typeof evaluateRetrieval>>): string {
  const preface = `# Retrieval 2.4 — actual local D1 lexical baseline\n\nDevelopment-only fictional corpus, unrelated to BC. No model/generation calls, recruiter acceptance, BC judgment or release approval.\n\nRerun: \`npm run evaluate:retrieval\`. See [configuration and interpretation](../../tools/retrieval/README.md).\n\nSource: \`${report.sourceRevision}\`\n\nApplication base HEAD: \`${report.applicationRevision}\`; ${report.applicationState}. Source identity is not application HEAD.\n\nCatalog SHA-256: \`${report.catalogHash}\`\n\nSearch artifact SHA-256: \`${report.searchHash}\`\n\nLimits: topK=${report.limits.topK}, textBudget=${report.limits.textBudget} UTF-16 code units, whole chunks. All ${report.results.length} cases executed against disposable real D1. Required passage recall: ${report.foundPassages}/${report.requiredPassages}. Forbidden passage hits: ${report.negativeHits}.\n\nSuccessful empty evidence means **insufficient retrieved evidence**, not universal absence. Nonempty evidence does not establish answer adequacy. Non-required hits are lexical false-positive candidates, not model judgments; repeated fictional context and shared museum vocabulary can match otherwise irrelevant passages.\n\n## BC handoff\n\nBC should inspect the actual passages/gaps below and retain the lexical baseline or request an explicit architecture decision before expansion. English/corporate paraphrases are deliberately not translated or rewritten. No semantic provider, fallback, retry, threshold or automatic release decision is inferred. Missing salary, financial ROI and current-use facts must not be fabricated from related evidence.\n\n## Case summary\n\n| Case | Category | Required found | Negative hits | Returned |\n| --- | --- | --- | --- | --- |\n${report.results.map((r) => `| ${r.id} | ${r.category} | ${r.found.length}/${r.requiredPassages.length} | ${r.negativeHits.length} | ${r.chunks.length} |`).join('\n')}\n\n## Versioned passage-level results\n\nThe complete deterministic result includes prepared terms, frozen scope, required/missed passages, negative expectations, non-required hit IDs, exact text, locations, hashes, revision and ranks. All expected passages must exist in pinned artifacts before scoring. Provenance fields are checked against those artifacts; ranks are separately checked as sequential one-based positions. A gap is a retrieval finding, not a model failure.\n\n`;
  return preface + '```json\n' + JSON.stringify(report, null, 2) + '\n```\n';
}
