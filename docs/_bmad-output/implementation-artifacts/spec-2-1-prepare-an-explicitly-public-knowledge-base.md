---
title: 'Story 2.1: Prepare an Explicitly Public Knowledge Base'
type: 'feature'
created: '2026-11-13'
status: 'in-progress'
baseline_commit: 'a2d364fdcbfa9e26a6ec724220f7e48282189475'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/content/AGENTS.md'
  - '{project-root}/tools/content-authoring/workflow/review.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Three accepted private pilots establish neither public eligibility nor corpus coverage. Public-source validation is missing.

**Approach:** Prepare BC's V1 corpus with explicit review/copying, local validation, committed provenance and accepted coverage/limitations for Story 2.2.

## Boundaries & Constraints

**Always:** BC owns editorial completeness/validation/publication. Reuse pilots without compulsory reinterviews/probes. Authorize private processing separately; preserve historical bytes/versions/approvals and unknowns. Genuine quoted UTC dates require seconds/Z; unknown hours block promotion only. Edits renew final-byte reviews.

**Never:** Auto-promotion, invented approvals/dates/achievements or private report data. No maps (3.1), index (2.2), D1, retrieval, model/UI/deployment. Spec approval authorizes no private intake, copying, commit/push or launch.

**BC decision — B:** `reviewed_at` records BC's actual final publication-approval decision, not the initial editorial review. Insert its real timestamp privately, then obtain confirmation of the exact final bytes before copying; this confirmation does not relabel the decision date. Any further edit requires renewed reviews.

## I/O & Edge-Case Matrix

| State | Behavior |
|---|---|
| Missing/malformed/duplicate metadata | Reject with safe codes |
| Symlink/escaping local reference | Reject before opening target |
| Forbidden marker/private canary | Reject without echoing values/unsafe filenames |
| Dirty/untracked public inputs | Never certify as committed |
| Rewrite/rename | Renew edit reviews; preserve identity across rename |

</frozen-after-approval>

## Code Map

- `content/public/README.md`: placeholder, not evidence.
- `tests/bootstrap/safety.test.ts`: disposable Git/canary patterns; Vitest discovers this directory. Typecheck excludes `.mjs`.
- `package.json`: ESM; pin added parsers.
- `tools/content-authoring/scripts/checkpoint.py`: confinement/byte-binding patterns, not public validation; keep deferred revision-type hardening separate.

## Tasks & Acceptance

**Execution, in dependency order:**
- [x] `docs/content/publication.md`, `content/AGENTS.md`, `tools/content-authoring/workflow/review.md` — document review semantics/copy steps/identity continuity; move public README guidance here. Archive exact `tools/content-authoring/versions.json` as `versions/1.0.3.json`; bump agent/release, synchronize `README.md`, `agent.md`, workflow version labels/checkpoint skeletons and `scripts/tests/test_policy.py` under that directory. Preserve unchanged type versions/schema and pilots.
- [x] `scripts/public-content.mjs`, `package.json`, `package-lock.json` — read-only `content:check` and `content:verify -- --revision <full-sha>`. Strict frontmatter: reject duplicate keys; require unique stable document_id, visibility: public, nonempty title/reviewed_by and valid quoted UTC created_at/modified_at/reviewed_at. Reject placeholders, invalid calendar dates, unquoted timestamps, YAML aliases/merges/multiple documents; topics/aliases remain optional.
- [x] `scripts/public-content.mjs`, `tools/public-content/forbidden-markers.json` — collect only `content/public/**/*.md`; reject symlink ancestors/leaves, nonregular inputs and escaping local Markdown/reference/image/HTML targets, including encoded traversal. Never fetch external links. Scan configured forbidden secret/contact markers and private sentinels; emit safe codes/counts/opaque references, never source excerpts or unsafe subprocess output.
- [x] `scripts/public-content.mjs` — compare a full commit's public tree/blobs against complete working file set/bytes, including staged/unstaged/deleted/untracked inputs. Reject unsafe modes/mismatches. Snapshot-bind the coverage/identity records too. No checkout/private reads; ignored private files do not invalidate provenance.
- [x] `tests/bootstrap/public-content.test.ts` — synthetic Git fixtures cover the matrix, invalid dates, duplicate keys/IDs, renames, link forms/root symlinks, safe stdout/stderr and snapshot mismatches. Assert deterministic read-only success; no private fixtures.
- [ ] `content/public/**/*.md`, `docs/content/coverage.md`, `docs/content/document-identities.json` — BC selects documents/questions/gaps. Ledger entries bind stable ID to public path/status; retain retired IDs permanently, reject duplicate/missing bindings and retired-ID reuse, preserve IDs on rename. BC confirms semantic continuity, which automation cannot prove. Resolve missing dates reliably or keep private. Obtain factual, reader-comprehension and publication reviews on final bytes, then explicit copying approval. Copy approved bytes only; preserve private records. Remove public README. Record coverage with public IDs and genuine BC acceptance, not private mappings/synthetic achievements.

**Acceptance Criteria:**
- Given private preparations, when publication is authorized, then documented human/AI review and explicit final-byte copying approval precede transfer; pilot acceptance never promotes content.
- Given public candidates, when validation runs, then invalid metadata, duplicate identities, escaping inputs and forbidden markers fail safely; renames retain IDs and identities are never reassigned.
- Given a declared full SHA, when provenance is verified, then exact public files/bytes match its snapshot or certification fails.
- Given the actual corpus, when BC accepts coverage, then questions map to public documents with accepted gaps. Pilot approval alone closes neither coverage nor OPEN-1; acceptance needs files/coverage/local checks/procedure, not indexing/model/UI.

## Implementation Notes

### 2026-11-16 — tooling implemented; corpus authorization gate pending

- Added read-only validation/provenance commands, pinned YAML/Markdown/HTML parsers, generic marker configuration, synthetic Git tests and the publication procedure. Archived the exact 1.0.3 manifest; authoring release/agent is 1.0.4, with type resources and checkpoint schema unchanged. Removed the public README placeholder.
- Identity ledger starts empty; coverage explicitly remains pending without fabricated acceptance. No private inputs were read, no real documents copied, and no repository commit/push performed. Diff inspection used a temporary index, leaving the real index unchanged.
- Parent inspected the complete implementation diff. Verification with Node 24.22.0/npm 11.19.1: all 132 bootstrap tests, all 43 Python authoring tests, typecheck and whitespace checks passed. Matrix automation covers malformed/duplicate metadata, symlinks/escaping links, safe marker diagnostics, dirty/untracked/index-only provenance, and rename/retirement identity continuity. Real renewed review approvals remain human evidence, not a test claim.
- Actual `content:check` correctly fails with `EMPTY_CORPUS` and `COVERAGE_NOT_ACCEPTED`. No real committed corpus has been certified; successful provenance tests use disposable synthetic commits only.
- Paused in implementation before the full-story review step: BC must select documents/questions/gaps and authorize scoped private processing, then approve final-byte reviews/copying and coverage. Commit authorization and verification of the actual resulting full SHA remain separate. Story acceptance and OPEN-1 are not closed.

## Spec Change Log

## Review Triage Log

## Design Notes

Dispatch: no unresolved tooling intent; BC's corpus decisions are execution gates. Footprint: new validator/config/tests/docs plus versioned authoring resources and approved public files. Irreversible disclosure/copying and commits require separate approval; start with synthetic tooling. Never discover markers by scanning private sources; configure generic patterns/synthetic sentinels. Patterns do not prove privacy.

## Verification

- `npm exec -- vitest run tests/bootstrap`, `npm run typecheck`, `git diff --check` — pass.
- `python3 -m unittest discover -s tools/content-authoring/scripts/tests -p 'test_*.py'` — authoring regressions pass.
- `npm run content:check` — approved corpus passes; empty/placeholder corpus is insufficient.
- `npm run content:verify -- --revision <full-sha>` — after authorized commit, report actual SHA/file count, not planning baseline.
- BC approves coverage/final bytes/copying; tests cannot authenticate approval or fidelity.
