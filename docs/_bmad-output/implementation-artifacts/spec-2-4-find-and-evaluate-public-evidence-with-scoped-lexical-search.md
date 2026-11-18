---
title: 'Story 2.4: find and evaluate public evidence with scoped lexical search'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'dd1ed890484ca6e9b4a5ebb845715a31a3cfc2f2'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A coherent public publication exists, but no scoped evidence search or actual engine evaluation distinguishes retrieval gaps from model failures.

**Approach:** Add a portable Retriever backed by safe local D1 lexical search, then run versioned passage-level evaluations on the approved fictional development corpus. BC inspects the final report; no model judgment or release approval is inferred.

## Boundaries & Constraints

**Always:** Use the architecture RetrievalRequest/Result and existing RetrievedChunk contracts. Trusted nonempty frozen document membership constrains candidates before ranking/top-k/budget. Missing members or unusable publication fail closed. Read ranking and validated evidence from one coherent publication, preserving exact provenance and standalone fictional/non-BC context. Mechanically verify returned membership. Distinguish technical/scope unavailability from successful empty evidence.

**Never:** Change public corpus/approvals, dependencies, historical migrations or operator D1; add HTTP search/conversation/UI/model calls, private/Web fallback, automatic query rewriting/retry, embeddings, semantic provider or universal relevance threshold. Evaluation is development-only, not real-career/recruiter acceptance.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| Valid allowlist and prepared lexical terms | Safely constructed bound FTS; eligible ranked passages within deterministic limits |
| Empty, malformed or partly withdrawn allowlist | Controlled unavailable, never unrestricted/intersection search |
| Hostile quotes/operators/SQL-like text | Literal bounded lexical data, no executable query syntax |
| No lexical matches or lexical tokens | Successful empty evidence; insufficient retrieved evidence, not universal absence |
| Uninitialized/corrupt publication or D1 fault | Redacted unavailable; no partial evidence |
| Strong out-of-scope distractors | Eligible hits survive ranking/top-k/budget; no distractor escapes |
| Concurrent publication replacement | Complete old/new evidence, never mixed identity/text/hash/revision |

</frozen-after-approval>

## Code Map

- `src/shared/public-evidence.ts` — exact evidence/hash contracts.
- `src/adapters/d1/publication.ts`, `src/ports/ResourceCatalog.ts` — six-read transactional snapshot validation; extend without unguarded later MATCH.
- `migrations/0002_public_publication.sql` — FTS chunk_id/text needs public_chunks join for membership; no migration.
- `tests/e2e/publication-runtime.mjs`, `publication.spec.ts`, `local-fixture.ts` — isolated real-D1/workerd, pinned activation and race patterns.
- `tools/public-content/build.ts`, `activate.ts` — trusted committed-byte assembly; distinguish source SHA from application HEAD.
- Architecture `ARCHITECTURE-SPINE.md` lines 350–382 and `RUNTIME-CONTRACTS.md` §1/§9 — binding evidence/snapshot contracts.

## Tasks & Acceptance

**Execution:**
- [x] `src/ports/Retriever.ts`, `src/application/retrieve-evidence.ts` — define exact request/result port and controlled errors; validate trusted inputs and mechanically reject outside-allowlist adapter output.
- [x] `src/adapters/d1/retriever.ts`, `src/adapters/d1/publication.ts` — implement safely encoded lexical tokens, bound membership SQL, deterministic ranking/ties and configurable positive top-k/text budget. Search and publication validation must share one transactional batch. Preserve readSnapshot behavior.
- [x] `tests/bootstrap/retrieval.test.ts` — test matrix, query encoding/limits, core membership guard, deterministic budget, provenance and redacted errors.
- [x] `tests/e2e/retrieval-worker.ts`, `retrieval-runtime.mjs`, `retrieval.spec.ts` — real D1 matrix tests, dominant excluded distractors, corruption, independent-reader races and artifact-backed provenance.
- [x] `tests/fixtures/retrieval/cases.json`, `tools/retrieval/evaluate.ts`, `scripts/evaluate-retrieval.mjs`, `package.json` — disposable actual-D1 evaluation: French/English, corporate, paraphrase, named-project, resolved follow-up and missing-information cases with required passages/negative expectations.
- [x] `docs/evaluations/retrieval-2-4.md`, `tools/retrieval/README.md`, `docs/development/application.md` — actual versioned results, source/application identity, configuration, recall gaps/false positives, no-match wording, rerun command and BC handoff.

**Acceptance Criteria:**
- Given scoped candidates and stronger excluded distractors, when real D1 search ranks and applies limits, then only eligible evidence consumes top-k/budget and all returned provenance matches independent pinned artifacts.
- Given publication changes or failures, when search executes, then evidence belongs to one complete verified snapshot or returns controlled unavailable, without operator-state mutation.
- Given representative fixtures, when the documented evaluation command runs, then the report records actual passages and gaps independently of generation; BC can retain the lexical baseline or request an explicit architecture decision before expansion.

## Implementation Notes

- No human intent gap. Owner requests end-to-end completion and final inspection, without intermediate approvals. Dispatch: new port/adapter/core guard and evaluation tooling.
- No external effects/operator mutation; disposable storage only. Implementation-owned limits are documented defaults, not relevance promises.
- Parent staged and read the full 1,959-line baseline diff including every new file. Independent parent rerun passed four TypeScript configurations, 350 Vitest cases, 45 workstation fixtures, both builds, actual-D1 retrieval matrix and evaluation; diff whitespace checks passed. The matrix exercised ten interleaved independent-reader observations, eight dominant excluded distractors (at least six globally outranking), artifact-backed provenance, empty/malformed/withdrawn membership, hostile syntax, no tokens/matches, corrupt/uninitialized/fault states and read-only sentinels. No required case was skipped.
- Matrix audit: all seven rows are covered by the passing real-D1 matrix; unit tests additionally cover safe encoding/input/config limits, adapter-mutation membership rejection, exact whole-chunk budget/provenance and redacted errors. Evaluation ran all 12 cases: 6/10 required passages, zero forbidden hits. Measured gaps remain documented; no human baseline acceptance is inferred.
- Implementation worker attempted full smoke: simulation and 26/36 Playwright cases passed, but ten existing browser/publication cases failed on operator-occupied ports 5173/8787. Operator servers and storage remain untouched. This environmental verification gap is explicitly documented, not represented as a passing suite; focused tests are independent of those ports.
- The same implementation worker applied all retained review patches. Parent read the entire 634-line patch plus the new evaluation unit test; fixed two incomplete typed test fixtures exposed by the full typecheck rather than weakening checks. Final parent rerun passed four TypeScript configurations, 359 Vitest cases, 45 workstation fixtures, both builds, both actual-D1 retrieval E2E cases and two byte-identical evaluation runs (report SHA-256 d9f9df9cb759ef6f166f9c5fd93ec728c3f6d119902436fd15c36eb5d9991446). Parent also independently passed all 24 existing D1/fixture-control tests. Operator ports remain occupied by the original processes; the full browser/publication gap remains explicit.
- Final matrix audit retains all original seven-row tests and adds unequal-score eligible topK=1, opposing chunk-ID/ordinal ties, oversized-first whole-chunk skipping, sequential ranks, twenty coordinated independent-reader observations, invalid expectation rejection, exact known per-case 6/10 scoring, copied-byte/toolchain identity and report-preserving negative CLI exits. All ran without skips. Corpus, dependencies/lockfile, migrations and deployed Worker entrypoint remain unchanged. Independent review is complete with no retained unresolved finding or deferred work; B1/B7 remain explicitly rejected. BC still owns final report/baseline assessment and acceptance.
- Workflow completion: spec is done for implementation and agent review, with the full browser/publication regression rerun still environmentally blocked. Sprint Story 2.4 is review pending BC inspection/acceptance and that regression evidence; Epic 2 remains in-progress. Finalization creates a local conventional commit only, without push. The practical operator handoff is in ../../development/application.md; isolated retrieval tests do not mutate operator D1, while evaluation rewrites its versioned report.

### Owner acceptance and closure — 2026-11-18

- BC explicitly accepted Story 2.4 and authorized closure and a local commit. Acceptance was recorded at `2026-11-18T15:57:45Z` against implementation `01fe6fc05c9de87466f8d5161c00b60167599cd3`.
- BC supplied an operator smoke run: all six simulation tests and 27/37 Playwright tests passed, including both retrieval cases. The ten browser/publication failures all report occupied ports 5173/8787. No successful subsequent full smoke run was supplied; closure preserves this environmental verification limit and does not claim 37/37 success.
- The owner accepts the measured lexical baseline for this development story: 6/10 required passages across twelve fictional-corpus cases, with zero forbidden hits. Documented recall gaps remain; no semantic/vector expansion, actual-model quality, real-career acceptance or recruiter-release approval follows.
- The regenerated evaluation report already present at closure changes only its application base revision to the implementation commit above; source SHA, input fingerprint, toolchain and all passage outcomes are unchanged. Preserve and include that report update in the closure commit.
- Closure changes documentation/tracking only. The spec remains done, sprint Story 2.4 moves from review to done, and Epic 2 stays in-progress. Existing agent verification/review evidence remains recorded; no new code, corpus, dependency, migration, operator-state mutation, push or deployment is authorized by this closure.
- Closure checks passed: all 34 focused retrieval/evaluation unit tests, both actual-D1 retrieval E2E cases (including twenty coordinated independent-reader observations and twelve corpus cases), tracking/report identity assertions and diff whitespace validation. Full smoke was not rerun during closure.

## Spec Change Log

## Review Triage Log

### Pass 1

Three fresh review layers completed at inherited model capability. Blind-hunter was resumed to complete its ten-finding floor after initially reporting only four findings; no implementation changed during review. Verdicts below are parent decisions, recorded before grouping.

| ID | Verdict / route | Verified evidence |
| --- | --- | --- |
| B1 | low / reject | Verification commands are intended acceptance targets; actual notes explicitly disclose ten blocked cases. The requested fix edits only this build spec and is rejected under the spec-edit rule. No full-suite pass is inferred. |
| B2 | medium / patch | evaluateRetrieval matches expectations only against results; nonexistent required/forbidden passages become a false gap/vacuous negative. Validate expectation existence against the pinned artifacts before scoring, with typo regressions. |
| B3 | medium / patch | Standalone runner unconditionally prints PASS after writing the report, even for nonzero negativeHits or failed emptyExpectationMet. Preserve actual output but exit nonzero on mechanical negative failures; recall gaps remain successful evaluation results. |
| B4 | low / patch | Synthetic eligible documents contain one matching passage each; no independent within-document equal-score ordinal oracle exists. Add that focused real-D1 assertion. |
| B5 | medium / patch | cpSync reads root into project, while hashPath rereads root afterward. A concurrent normal edit can fingerprint bytes other than those executed. Hash the copied project bytes. |
| B6 | medium / patch | Script hardcodes Wrangler 4.151.2 despite symlinked installed packages. Record actual installed toolchain versions and dependency-lock identity so the report cannot falsely attribute a different local engine. |
| B7 | low / reject | Duplicate fixture IDs/expectations could inflate scores, but all twelve authored IDs and expectations are unique. This rare invalid-maintenance state would require new validation branches rather than a direct correction; reject under the rare-low rule. |
| B8 | low / patch | Real-D1 budget cases use equal-sized eligible text; oversized-first/smaller-later selection is only mocked. Add a focused actual-D1 unequal-size budget case. |
| B9 | medium / patch | Readers and replacements start without observation milestones. A legal delayed-reader schedule can see only final A and fail the both-revisions assertion. Add bounded per-revision observation coordination while retaining concurrent read/replacement checks. |
| B10 | low / patch | Artifact fields exclude rank; evaluator does not explicitly check consecutive positions, while README says ranks are artifact-checked. Check sequential ranks directly and correct that documentation claim. |
| E1 | low / patch | Parent reproduced new D1Retriever({}, Object.create({topK:1,textBudget:1})) storing limits {} after passing validation. Read explicit properties once, then validate/store that snapshot; add direct regression. |
| E2 | medium / patch (with B5) | Same copy-versus-original fingerprint race; source tracing confirms report identity can differ from evaluated copied bytes. |
| E3 | medium / patch (with B9) | Same unsynchronized both-revisions race assertion; no barrier establishes its scheduler assumption. |
| V1 | medium / patch | Pre-verified gap: identical eligible scores and self-derived approved-corpus ordering cannot detect bm25 DESC. Add independently expected unequal eligible winner with topK=1. |
| V2 | medium / patch | Pre-verified gap: found/missed/aggregate scores have no independent expectations; inverting found preserves current checks. Assert explicit per-case scoring and known 6/10 aggregate. |

B5/E2 and B9/E3 share respective defects; all other retained findings are separate. Every retained fix is a direct correction or focused test of a demonstrated state, without a new public runtime surface. No intent gap, spec loopback or deferred work is required.

## Design Notes

One transactional batch binds FTS to validated evidence. Binding alone cannot sanitize FTS: encode lexical tokens. Deterministic limits count eligible text without truncating chunks. Neither empty nor nonempty retrieval proves answer adequacy.

## Verification

- `npm run typecheck`, `npm test`, `npm run build`, `git diff --check` — pass.
- Focused actual-D1 retrieval — pass with isolated storage and preserved existing controls. Full smoke/publication remains incompletely verified: the operator run passed 27/37 Playwright cases and ten failed at startup on occupied ports; no full-suite pass is claimed.
- Documented retrieval evaluation command — reproducible report on the pinned fictional corpus; no skipped required cases or fabricated BC assessment.
