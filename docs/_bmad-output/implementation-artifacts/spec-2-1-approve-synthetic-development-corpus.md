---
title: 'Story 2.1: approve the synthetic development corpus'
type: 'chore'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '256e757a3fff3c52fbff74cdbd224befde1b98ea'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** BC has selected and reviewed the three sheets in `content/private/synthetic-corpus/` for continuing development. Planning still requires real-career documents and a prior question-to-document coverage record. BC accepts documentary gaps: unsupported answers must not be invented.

**Approach:** Prepare explicitly fictional public development copies, record owner acceptance and remove the advance coverage-map prerequisite. Close Story 2.1 for this amended development scope after verification, without authorizing recruiter release or claiming real-career acceptance. Preserve downstream grounding and insufficient-evidence evaluations.

## Boundaries & Constraints

**Always:** Preserve IDs, known creation times, narrative, links and fiction/non-attribution warnings. Preserve private originals and fixture sheets byte-for-byte. For these copies, `reviewed_at` means final owner review of the prepared development revision, not an invented historical first review. Record actual UTC review/modification times; administrative preparation and development-only warning updates are part of the proposed approval. Keep real-portfolio replacement and launch obligations visible.

**Never:** Reconstruct deleted real files, attribute fiction to BC, rewrite Story 2.0 history, broaden inputs beyond public Markdown, weaken validation, impose exhaustive coverage, call application models, index, modify D1, deploy, commit or push.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| Selected synthetic sheets | Three valid public development copies; stable IDs and explicit fiction |
| Original fixture drafts | Still rejected as-is; empty approvals and unchanged bytes |
| Placeholder README | Guidance relocated outside eligible Markdown; invalid README regression retained |
| Unsupported question | Accepted limitation; later runtime acknowledges insufficient evidence without invention or scope widening |
| Uncommitted prepared corpus | Local success with null revision; old HEAD cannot certify new bytes |
| Recruiter publication | Not authorized by development acceptance |

</frozen-after-approval>

## Code Map

- `content/AGENTS.md` — identity, timestamps and explicit-copy rules.
- Owner-selected private sheets are currently identical to `tests/fixtures/synthetic-corpus/documents/`; only the three selected private files may be read.
- `tools/public-content/validate.ts` — reuse unchanged. `tests/bootstrap/public-content.test.ts` currently reads the public placeholder in one rejection test.
- Original fixture self-checks and optional question examples remain useful tests, not completeness gates. Historical specs remain unchanged.

## Tasks & Acceptance

**Execution:**
- [x] `content/public/{mission-regie-collections,projet-reperage-reserves,projet-prototype-prets}.md` — copy selected narratives; add public visibility, truthful BC development-review metadata and actual modification times. Replace obsolete no-approval statements with development-only authorization; retain fiction and non-attribution.
- [x] `content/README.md`, `content/public/README.md` — move placeholder guidance outside the eligible corpus; document development-only use. Do not add a README exemption.
- [x] `tests/bootstrap/public-content.test.ts` — make placeholder rejection self-contained; test exactly three valid development sheets, preserved IDs/narratives/provenance and the matrix above. Retain existing safety/provenance regressions.
- [x] `tools/public-content/README.md`, `tests/fixtures/synthetic-corpus/README.md` — distinguish approved development copies from unapproved fixture originals; remove obsolete placeholder/mandatory-coverage guidance. Keep optional question examples.
- [x] `docs/_bmad-output/planning-artifacts/epics.md`, `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md`, `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md`, `docs/_bmad-output/planning-artifacts/reviews/open-acceptance-items.md` — amend affected active clauses only: synthetic development acceptance, no advance question-map gate, honest insufficient-evidence behavior and separate real-portfolio/launch obligations.
- [x] `docs/_bmad-output/implementation-artifacts/{handoff-2-1-development-corpus.md,epic-2-context.md,sprint-status.yaml}` — record accepted inventory, approval meaning, verification and limitations; mark 2.1 done for amended development scope after verification. Preserve historical records and downstream obligations.

**Acceptance Criteria:**
- Given owner acceptance, when preparation completes, then Story 2.2 development can use the synthetic public corpus without new real interviews or representing fiction as BC achievements.
- Given accepted documentary gaps, when planning is updated, then no question-map/completeness prerequisite blocks 2.1; later grounding/missing-information evaluations remain required.
- Given unchanged validation, when provenance is checked, then no uncommitted repository content is labeled as the old HEAD or as an actual committed development snapshot.

## Implementation Notes

- BC approved this on-disk plan and continuation (choice 1), observed and recorded at `2026-11-18T08:45:47Z`. This records the current development-review decision, not a reconstructed historical approval. Frozen intent is unchanged. Baseline HEAD is unchanged; the only pre-existing worktree addition is this approved spec. Sprint Story 2.1 is already `review`, later than the initial sync target `in-progress`; preserve that until final verification.
- Parent staged the selected changes and read the complete 751-line baseline diff, including all new files. Independent parent reruns passed: 117 focused cases in verbose mode with no skips, six fixture checks, four TypeScript configurations, 45 workstation fixtures and 192 total Vitest cases. Local gate accepts exactly three inputs with null revision; actual baseline SHA rejects with expected `SNAPSHOT_MISMATCH` and exit 1. A pre-dispatch manifest confirms all six selected private/fixture originals are unchanged; validator/policy/source-fixture diff is empty. Staging is parent preparation only, not a commit or push.
- Matrix audit: prepared inventory/fiction/non-attribution and recruiter-authorization limits are checked by the exact-body/provenance case; original-draft rejection by the original-fixture case; placeholder relocation by exact public inventory plus standalone invalid-README case; accepted documentary gaps by source-limit assertions and local success, without claiming future runtime behavior; uncommitted and disposable-commit provenance by the exact-copy mismatch case. Every covering test ran and passed. Actual-model behavior and recruiter release remain explicitly outside this delivery.
- Parent finalization (2026-11-18): resumed the original implementation worker for the nine direct review patches, then read the complete 264-line patch against parent staging. B1–B9 are resolved: complete-body comparison, pinned prepared hashes/timestamp, deterministic snapshot checks, replacement-test guidance, descriptor-aware no-private-read evidence, worker/parent attribution, final tracking order, downstream fiction-provenance cases and BC's named pre-5.5 real-portfolio checkpoint. B10 is appended to deferred-work.md under mandatory agent-context deferral policy; no author-rule relaxation was made.
- Final parent reruns passed all 117 focused cases verbosely with no skips, six fixture checks, four TypeScript configurations, 45 workstation fixtures and 192 total Vitest cases. Local gate succeeds with exactly three inputs/null revision; actual baseline revision rejects safely. Parent confirmed suffix/timestamp regression detection, unchanged selected originals and public-byte hashes, and unchanged validator/policy/AGENTS/source-fixture files. The complete baseline diff was refreshed after patches; final changes only record these verified results. Frozen intent and public sheets remained unchanged through review.
- Owner-approved intent explicitly forbids commit/push, overriding the generic workflow's local-commit default. No commit was created. Spec and sprint Story 2.1 are done for the amended development scope only; actual committed provenance, real-portfolio replacement, downstream runtime/model evaluation and recruiter launch remain separate. Staging is parent review preparation, not publication.

## Spec Change Log

## Review Triage Log

All three independent layers completed on the inherited model capability. Edge Case Hunter returned no findings; Verification Gap Reviewer found no gaps. Blind Hunter findings were individually checked before routing:

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| B1 | medium / patch | Parent reproduced that appending a second `---` section leaves the current split-based body comparison unchanged. Compare the complete body after the opening frontmatter instead. No runtime change is needed. |
| B2 | medium / patch | Parent reproduced a changed modification instant passing all current range/body assertions despite different prepared bytes. Bind the prepared snapshot to its documented exact timestamp and public-byte hashes. |
| B3 | low / patch | `Date.now()` makes the static snapshot assertion depend on a wall clock; direct deletion in favor of exact accepted metadata removes that avoidable nondeterminism. |
| B4 | low / patch | Exact three-sheet assertions are intentional acceptance-snapshot checks, not a permanent ban on new content. The replacement procedure does not explain how to retire/update those dedicated assertions, which would confuse the next author; add that narrow guidance rather than weakening the current snapshot test. |
| B5 | medium / patch | The new corpus-limit case only rereads its canary after validation. That proves nonmutation, not unreadability. Add descriptor-aware read observation so this case directly asserts no private/outside Markdown read. Existing runtime remains public-only. |
| B6 | low / patch | The worker's clean-index observation was true at handoff, but the public handoff table omits the later parent-staging distinction. Qualify its actor/time; preserve historical worker execution notes instead of treating them as current parent state. |
| B7 | low / patch | Worker set sprint done after local checks while the parent build review is still open. Keep sprint review until parent review/patch verification finishes; final completion must record both gates. The spec correctly remains in-review meanwhile. |
| B8 | medium / patch | Existing 2.2 and 2.16 acceptance clauses carry title/text but do not explicitly test fiction/non-BC context for isolated middle chunks or passage display. Add direct acceptance clauses preserving this already approved invariant without new runtime/schema surface. |
| B9 | low / patch | OPEN-1 retains BC ownership and final 5.5 verification, but does not explicitly locate replacement execution after amended 2.1. Name BC's real-portfolio replacement/review checkpoint before 5.5; no new interview gate is introduced now. |
| B10 | medium / defer | `content/AGENTS.md` retains its blanket post-rewrite final-byte review rule while the owner-approved synthetic administrative exception lives only in content guidance/handoff. Discoverability is a real future-author context inconsistency. Per review policy, defer agent-instruction edits; retain the general real-content rule and record the narrowly authorized exception follow-up. |

## Verification

- `npm run content:check` — three inputs, success, null revision, no diagnostics.
- `npx --no-install vitest run tests/bootstrap/public-content.test.ts` — all existing and added cases pass.
- `PYTHONDONTWRITEBYTECODE=1 python3 tests/fixtures/synthetic-corpus/check.py` — six fixture checks pass; original sheets unchanged.
- `npm run typecheck`, `npm test`, `git diff --check` — pass.
- Validate exact public copies in a disposable committed repository, including mismatch rejection. Actual committed provenance awaits an explicitly authorized repository commit.
- Inspect complete diff: selected scope only; no private-original/fixture-sheet edits, validator relaxation, historical approval migration, model/deployment claims or real-career acceptance claim.

### Execution results — 2026-11-18

- Prepared exactly three public development copies; retained identities, creation instants, narratives, links and fiction/non-attribution. Final development-review decision is the recorded `2026-11-18T08:45:47Z` approval, including proposed metadata/warning preparation; actual edits occurred at `2026-11-18T08:46:57Z`, not a new historical/human review event.
- Guidance relocated outside eligible Markdown; invalid README rejection is self-contained. Validator/policy and original private/fixture sheets are unchanged.
- Local content check succeeds with three inputs, null revision and no diagnostics. All 117 focused tests, six fixture checks, four typecheck configurations, 45 workstation fixtures and 192 full-suite Vitest tests pass; diff whitespace check passes.
- Exact prepared copies pass committed provenance and mismatch regressions in disposable repositories. Actual baseline HEAD rejects these uncommitted bytes with `SNAPSHOT_MISMATCH` and null revision. No actual repository commit/staging/push, application model call, indexing, D1 modification or deployment was performed.
- Active planning and handoff now accept documentary gaps without an advance question-map/completeness gate, preserve later grounding/insufficient-evidence evaluations, and keep real-portfolio/recruiter obligations separate. Story 2.1 is done only for amended development scope. See `handoff-2-1-development-corpus.md` for inventory, byte hashes and verification details. Independent reviewer gate remains required.
