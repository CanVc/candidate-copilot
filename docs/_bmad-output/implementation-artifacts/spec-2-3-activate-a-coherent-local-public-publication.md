---
title: 'Story 2.3: activate a coherent local public publication'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'd358673f32c6ab6464db1b1efd477b678cd2c3b6'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2.2 produces reproducible artifacts, but local D1 has no coherent active publication or authoritative catalog reader.

**Approach:** Verify the immutable local catalog asset before atomically replacing the complete D1 publication. Expose coherent ready/unavailable health and a portable catalog port.

## Boundaries & Constraints

**Always:** Preserve Runtime §1 authority and catalog schemas; fixed singleton id=1, revision/hash pair, operational modified_at, derived asset path. Explicit pinned public-source revision; preserve standalone fictional/non-BC warnings. Local-only tooling, asset-before-activation, all-or-nothing replacement and snapshot-safe reads across Worker instances.

**Never:** Change corpus/approvals, dependencies, historical migrations or historical visitor data; add publication history, arbitrary Resource authority, request-handler writes, retrieval/ranking, conversations, model calls, remote D1, deployment or recruiter approval.

## I/O & Edge-Case Matrix

| State | Result |
| --- | --- |
| Valid pinned artifacts and reachable verified local asset | Entire singleton/Resources/maps/documents/chunks/FTS become active atomically |
| Repeated activation or A→B→A rollback | Coherent complete intended publication; unrelated D1 data survives |
| Missing/mismatched asset or invalid inputs | Redacted failure before D1 mutation |
| SQL fault during first/replacement activation | No first publication, or complete A remains unchanged |
| Concurrent activation and multi-query reads | One old/new snapshot, never mixed identity/data |
| Missing, malformed or unusable authority/dataset | Minimal unavailable health; no ready identity/evidence |
| Request-handler mutation attempts/private paths | No publication mutation/public-data leakage |

</frozen-after-approval>

## Code Map

- `src/shared/public-catalog.ts`, `public-evidence.ts` — reuse exact JCS, identity, paths and evidence contracts.
- `tools/public-content/build.ts`, `publish.ts` — trusted validated committed-byte assembly and immutable bundle publication; do not import arbitrary unchecked search bundles.
- `scripts/local-d1.mjs`, `src/worker/local-d1.ts`, `wrangler.jsonc` — preserve fixed local identity, environment isolation and `.wrangler/state/v3` CLI/proxy persistence.
- `src/worker/index.ts`, `src/shared/health.ts`, `frontend/src/health.ts` — currently availability-only health; update contract and callers/tests for publication readiness.
- `vite.config.ts` — same-origin local frontend; only exact content-addressed catalog assets may be served from generated bundles, never source trees.
- `tests/e2e/local-fixture.ts`, `d1.spec.ts`, `d1-runtime.mjs` — owned disposable real-D1/workerd harness; update bootstrap-only assertions without weakening controls.
- `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md` §1/§8/§9 — binding activation/read-consistency requirements.

## Tasks & Acceptance

**Execution:**
- [x] `migrations/0002_public_publication.sql` — add only singleton, Resource/map/document/chunk/FTS structures, integrity constraints and supporting indexes; leave authority absent initially.
- [x] `src/ports/ResourceCatalog.ts`, `src/adapters/d1/publication.ts` — implement read-only catalog/evidence snapshot access using one transactional D1 batch or equivalent tested guard, never pointer cache then unguarded reads. Validate authority/dataset coherence and fail closed.
- [x] `tools/public-content/activate.ts`, `scripts/activate-public-content.mjs`, `package.json` — strict revision-required local activation: assemble/publish trusted bundle, verify exact reachable asset/hash, then replace the entire dataset and authority using one D1 transaction. Reuse/factor local-target safety rather than bypassing it. Support deliberate rollback by explicit revision, no automatic retry.
- [x] `tools/public-content/local-assets.ts`, `vite.config.ts` — serve only exact immutable catalog paths with verified bytes and immutable caching, retaining old assets; deny traversal/symlinks/private trees. Activation checks fixed loopback same-origin asset availability, never caller-controlled URLs.
- [x] `src/shared/health.ts`, `src/worker/index.ts`, frontend/tests — ready health includes only status and coherent revision/hash/derived path; unavailable is minimal HTTP 503 without identity/diagnostics. No-store active health. Bootstrap startup/tests must tolerate honest uninitialized health without enabling processing.
- [x] `tests/bootstrap/public-activation.test.ts`, `tests/e2e/publication.spec.ts`, existing health/D1/bootstrap fixtures — test every matrix row using actual local D1 for transactional faults/FTS and independent Worker/read races; preserve privacy/environment/startup regressions. Exercise actual CLI and HTTP assets.
- [x] `tools/public-content/README.md`, `docs/development/application.md` — document initialization, local server prerequisites, pinned activation, health, rollback/failure behavior and development-only boundaries.

**Acceptance Criteria:**
- Given A, when B fails before or during activation, then identity, all registry/maps/chunks and searchable FTS remain A; given no A, the same faults leave health unavailable.
- Given successful replacement, when independent readers observe concurrent activation, then catalog and evidence provenance belong to one matching snapshot and asset path derives solely from its hash.
- Given invalid authority or absent dataset, when health is requested, then no ready catalog, diagnostics or visitor state are advertised and evidence access fails closed.
- Given activation/rollback, when unrelated data and immutable prior assets are checked, then both remain unchanged and only tooling has mutated publication authority.

## Implementation Notes

- No human intent gap remains. The owner explicitly requests end-to-end completion with final inspection; no intermediate approval is requested. Local migrations/activation mutate development state only, are authorized by the story, and must preserve unrelated data. Footprint spans schema/tooling/port/health plus focused tests; dispatch is required.

- Parent staged and read the complete 1,258-line baseline diff, including every new file. No corpus, dependency, remote resource, model or existing local database was changed by verification. All actual activations ran in owned disposable repositories/storage.
- Parent reruns passed all four TypeScript configurations, 318 Vitest tests, 45 workstation checks, frontend build, Worker dry-run, 12 real-D1 tests, three publication integration tests and all 34 smoke/browser/integration tests. No skipped tests. Approved synthetic source activation retained `4323afe312f43b6b87a014abee062e03e12f6022`, not application HEAD; catalog/search hashes remain `053eec31f9374f443caada2221b093a912c18f0581e132bc2bae5252335034e6` / `88297f906c707949024c5a66507fd4111cdcdef8003d084847e43ce17df9c28a`.
- Matrix audit: valid activation/repeated rollback/assets and pre-SQL failures are exercised by `actual pinned CLI verifies HTTP assets...`; first/replacement SQL faults, FTS preservation, unrelated data, corrupt/unavailable state, read-only routes and independent Worker races by `real D1 transactional faults...` (eight interleaved observations in each parent run). Asset boundary cases additionally passed all 26 new Vitest cases; real HTTP private denial and uninitialized health passed Chromium smoke. Independent review is pending.

- The original implementation worker was resumed for review patches. Parent read the complete 601-line patch against the staged implementation. All retained findings are fixed with direct contract corrections or focused tests: accepted optional lists and zero-chunk documents now round-trip; hash typing, bounded/cancelled HTTP reads and cleanup redaction are checked; port outputs have independent artifact oracles, Worker fixed vectors, isolated corruptions, real activated Chromium success and hard-link HTTP denial.
- Final parent verification passed all four TypeScript configurations, all 325 Vitest cases, 45 workstation checks, frontend build and Worker dry-run, three publication integration cases and all 35 smoke/browser/integration cases (including all 12 D1 cases). The 33 focused activation unit cases also passed verbosely without skips. Build isolation excluded all 33 disposable canaries; two protected PTY builds and eight synthetic interaction/failure controls passed. Exact pinned public-source validation still passes for three documents; corpus/lockfile/bootstrap migration are unchanged.
- Final matrix audit retains every original covering test and adds the accepted metadata/zero-evidence states, wrong-status/oversized/mismatching/short/stalled streams without D1 access, postcommit disposal failure without leaked text, ten reordered fixed-vector Worker cases, targeted revision/ordinal/content-hash/FTS corruption and actual activated browser readiness. All covering cases ran successfully. Review is complete with no retained blocker; B6 remains explicitly rejected, not represented as fixed. Linux/procfs and development-server-only assets remain limitations. No local operator D1 was migrated or activated; all activation evidence uses disposable storage, leaving the operator in control of their final run.

- Workflow completion: spec is `done` for implementation and independent agent review; sprint Story 2.3 is `review` pending explicit owner inspection/acceptance. No deferred work was created. Finalization records a local conventional commit only, with no push. The operator handoff is documented in `../../development/application.md`; local D1 initialization/activation there are state-changing operations, unlike health probes.

## Spec Change Log

## Review Triage Log

### Pass 1

All three fresh review layers completed at inherited model capability. Two initial concurrent-call launches were rejected by the harness; those two layers were successfully relaunched together through its supported parallel workflow. The first detached reviewer was retained and completed. No code changed during review.

| ID | Verdict / route | Verified evidence |
| --- | --- | --- |
| B1 | medium / patch (with E1) | Disposable committed `topics: [""]` passes assembly with one chunk but the adapter returns null. The existing validator permits string entries without a nonblank requirement. Directly preserve that accepted metadata contract in the reader. |
| B2 | medium / patch | Disposable committed metadata-only Markdown assembles successfully with zero chunks; `chunk_count > 0`, nonempty-members and global nonempty-chunks checks then prevent its round trip. Directly accept zero chunks for valid documents; zero evidence is not an absent document registry. |
| B3 | medium / patch (with E2) | Direct call confirms a singleton array containing a valid hash passes `isHealthResponse` via RegExp/string coercion. Add the missing string-type check. |
| B4 | medium / patch | CLI prints success before an awaited `proxy.dispose()` in a finally outside catch; a disposal rejection bypasses redaction and produces contradictory output. Keep disposal in the redacted boundary and emit the terminal result only afterward. Document postcommit cleanup uncertainty without automatic retry. |
| B5 | medium / patch | `response.arrayBuffer()` consumes the entire loopback response before checking status/expected bytes. Timeout bounds elapsed time, not memory. A synthetic non-success/oversized streaming response can exceed the known catalog size; directly bound consumption and cancel on rejection. |
| B6 | low / reject | Repeated mapping/chunk/FTS scans are genuinely quadratic, but the approved local corpus has three documents/23 chunks and measured integration reads pass. No everyday harm is demonstrated at this local-development scale; new lookup maps/optimization add complexity beyond a direct correction, so reject under the rare-low rule, not as out of scope. |
| B7 | medium / patch | Runtime §1 explicitly calls for Worker golden/Unicode/overlap vectors; the checked fixed vectors currently run only in tooling Vitest tests. Add fixed-hash cases through the real D1/workerd catalog reader, reusing the already specified vectors. |
| B8 | medium / patch | Real browser smoke now checks only uninitialized/stopped Worker states; ready browser success uses a mocked payload, while actual activation is HTTP-only. Add an activated real-Worker Chromium success case without introducing a browser requirement into publication tests. |
| B9 | medium / patch (partly with V2) | Corruption table deletes rows or supplies `{}` and never isolates structurally valid wrong sourceRevision/ordinal/contentHash/FTS text. Those detailed integrity checks can regress undetected; add isolated corruptions and both read/health assertions. |
| B10 | low / patch | Asset helper rejects `nlink !== 1`, but checked boundary tests cover only symlinks. Add a direct hard-link fixture and HTTP denial regression; no production guard/API change is needed. |
| E1 | medium / patch (with B1) | Same accepted optional-list mismatch; parent reproduction confirms valid committed source becomes unreadable after assembly. |
| E2 | medium / patch (with B3) | Same coercion defect; parent direct reproduction accepts array-valued catalogHash. |
| V1 | medium / patch | Pre-verified gap: both snapshot expectations come from the reader itself. Returning empty chunks after validation leaves the checked races and direct SQL FTS checks green. Compare actual port output to independently assembled pinned artifacts. |
| V2 | medium / patch (with B9) | Pre-verified gap: sourceRevision is excluded from contentHash; removing its equality check leaves existing malformed-JSON/deletion cases green. Add a valid-shaped single-field revision mutation. |

B1/E1 and B3/E2 each share one direct contract-check defect. B9/V2 share the absent provenance-field regression, with B9 retaining its additional ordinal/hash/FTS cases. All other surviving entries are separate. Each retained change is a direct correction or focused test of demonstrated state, with no new public surface; no human intent/spec loopback or deferral is required.

## Design Notes

Use a D1 transactional batch to replace the complete active dataset and singleton; no pointer-only commit or separately mutable path. Batch snapshot reads bind authority and data in the same database transaction; no indefinite pointer cache. HTTP asset verification is local-only at the fixed frontend origin before the D1 transaction; immutable files are retained on activation failure. There is no cross-filesystem/D1 transaction or hosted-delivery guarantee.

## Verification

- `npm run typecheck`, `npm test`, `npm run build`, `git diff --check` — all pass.
- `npm run test:d1` and focused publication real-D1 tests — pass without remote resources or browser requirement for D1 tests.
- Actual pinned build/activation and ready/unavailable HTTP probes; injected A/B failures, rollback and interleaved reads in disposable storage. Preserve corpus bytes and record exact source/application revisions independently.
