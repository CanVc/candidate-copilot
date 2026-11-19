---
title: 'Story 2.8: commit complete results atomically and replay them faithfully'
type: 'feature'
created: '2026-11-19'
status: 'done'
route: 'dispatch'
baseline_commit: '9953276e9973b80f566c5ad39f92c3006a44083a'
review_loop_iteration: 1
context:
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/epics.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/implementation-artifacts/spec-2-7-admit-one-immutable-global-question-at-a-time.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admitted questions have immutable scope and fenced ownership but no durable result. Lost responses must not cause duplicated or partially published answers.

**Approach:** Add atomic complete-result finalization, canonical reconstruction and authenticated POST/GET/replay using explicitly synthetic deterministic development processing. Deliver only Story 2.8, not real generation.

## Boundaries & Constraints

**Always:** Preserve original ACs in `../planning-artifacts/epics.md:994–1026`, runtime §§1–4/7 and architecture AD-4/5/15/18. Authenticate before saved lookup. Unique answer is the terminal marker; guard the entire write set with current Conversation existence/creation-based retention and matching unexpired request/attempt lease. All children, outcome metadata and lease release commit together. Preserve immutable message/scope/identity/context anchor. Factual finalization atomically rechecks every frozen member against coherent active publication; withdrawal produces controlled `failed/scope_unavailable`, no factual blocks/excerpts. Membership, not old text equality, is frozen: additions cannot widen scope; loaded provenance survives text/path/title updates. Historical excerpts have no live-publication FK. Replay precedes live catalog, provider, busy and turn-limit checks, returns persisted canonical metadata and consumes no turn/call. Use complete non-streamed JSON, HTTP 200 even for recorded failures, no-store and neutral authentication failures. Preserve original-source language and actual saved answer language. Synthetic fixtures explicitly disclaim BC attribution. Technical completion is not BC acceptance.

**Owner decision — recorded scope failure:** BC explicitly selected option A in this session: a recorded `failed/scope_unavailable` result is non-retryable, with persisted `retryable: false` and `retryMode: 'none'`. A missing original document has no guaranteed return; do not offer a technical retry of this failed result, even if availability is restored later. Saved replay returns the same failure and metadata, never restarts processing. This decision concerns unavailable original membership, not every documentation change: permitted text/path/title updates retain the existing contract. A separately submitted new question is not a retry of the failed result.

**Never:** Add real classification/generation/provider integration, selected admission, new-ID retry execution, UI, queue, automatic recovery/retry, physical purge or release claims. Do not invent A05/A08/privacy/security/product policy. No push/remote Git/deployment/paid or live model calls, operator migrations/storage/server changes, secrets/private corpus inspection, harness/skill/config changes or unrelated edits. Disposable isolated D1/browser fixtures only. One writer; fresh inherited-capability read-only reviewers. Children must not recursively invoke bmad-build. Runtime/tool failures stop with exact evidence; no alternate execution mechanism. Preserve operator files and unrelated changes.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| Valid owning attempt | One complete canonical result; release same owner atomically |
| Fault at any write boundary | No answer/child/metadata/release survives; admitted input intact |
| Duplicate/stale/expired owner or successor lease | No duplicate, child insertion or successor release |
| Deleted/expired Conversation | No state recreation or retained-content exposure |
| Five saved statuses / lost response / cap reached | Identical POST, GET and replay IDs/scope/blocks/edges/provenance/language/error; no processing |
| Same-ID changed identity / other live owner | Conflict / busy preserved; saved terminal replay still wins |
| Frozen member withdrawn during generation | Recorded scope failure with retryable false / retryMode none; no factual publication or retry, including after restoration |
| Text-only reindex, rename or added document | Original loaded excerpt unchanged; no eligibility widening |
| Missing live publication after completion | Saved authenticated result remains available |
| Malformed result/citation/body or dependency failure | No unchecked draft; normalized safe error, unknown outcome not false failure |

</frozen-after-approval>

## Code Map

- `src/application/conversation-admission.ts`, `src/shared/conversation-admission.ts` — saved identity and current ownership checks; terminal precedence currently absent.
- `src/ports/ConversationStore.ts`, `src/adapters/d1/conversations.ts` — real D1 batches, admission guards and snapshot reads; lease lives in `conversation_processing_leases`, not Conversation columns.
- `src/application/conversations.ts`, `src/shared/conversation.ts`, `src/worker/index.ts` — authenticated transcript and thin HTTP adapter; POST messages currently absent.
- `src/shared/public-evidence.ts`, `src/adapters/d1/{publication,retriever}.ts` — trusted coherent loaded provenance; do not use whole old-publication equality to reject permitted text updates.
- `migrations/0005_conversation_admission.sql` — preserve immutable admitted rows; add result schema next.
- `tests/e2e/conversation-admission-{worker.ts,runtime.mjs}`, `tests/e2e/conversations.spec.ts`, `tests/e2e/local-fixture.ts` — reusable independent-Worker/shared-D1/browser fixtures and race controls.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/conversation-result.ts`, shared conversation/admission types — canonical five-status envelope, blocks/citation graph, trusted historical excerpts, persisted failure metadata and mechanical validity; completed transcript state.
- [x] `migrations/0006_conversation_results.sql`, `src/adapters/d1/conversations.ts`, `src/ports/ConversationStore.ts` — additive unique answers, ordered blocks/excerpts/same-answer edges, metadata and guarded all-or-nothing finalization; canonical consistent reads.
- [x] `src/application/conversation-results.ts`, admission/conversation services — finalization orchestration, terminal precedence including atomic races, saved replay without processing, same schema across transports.
- [x] `src/worker/index.ts`, scoped deterministic adapter/port as needed — authenticated real POST protocol and synthetic development composition; no client-authored output/evidence or admission acknowledgment posing as result; POST and GET share one effective admission/lease/limit configuration (2.7 B7 continuity).
- [x] `tests/bootstrap/conversation-results.test.ts`, admission/conversation tests — every matrix row, schemas, auth order, safe failures, no extra turn/call, persisted retry metadata including scope_unavailable false/none after restored membership.
- [x] `tests/e2e/conversation-results-{worker.ts,runtime.mjs}`, `tests/e2e/conversations.spec.ts`, `tests/e2e/d1.spec.ts` — real D1 every-write rollback, races/fences, canonical parity all statuses, loaded-provenance publication races, lost response, cap and actual Chromium authenticated POST/GET/replay.
- [x] `docs/development/application.md`, `migrations/README.md`, this spec, `sprint-status.yaml` — reproducible commands/evidence, development limits; sprint review pending BC.

**Acceptance Criteria (complete original traceability):**
- AC1: Given admitted input and mechanically valid deterministic result, when its owner finalizes through POST, then matching unexpired ownership, existence/retention and factual membership guard atomic answer/ordered blocks/excerpts/edges/metadata/release, with unique answer terminality and no stream/second completion flag (AR24).
- AC2: Given faults at every write boundary, when finalization fails, then no partial result survives and original input remains; stale/expired workers cannot write children, release successors or resurrect deleted state (AR24).
- AC3: Given answered/partial/clarification/refused/controlled-failed results, when POST/GET/same-ID replay return them, then complete schemas, saved IDs/scope/order/edges/provenance/language/retry metadata agree, HTTP 200 without another call/turn even at cap (AR22/27).
- AC4: Given loaded evidence and publication changes during generation, when factual finalization runs, then all original members are checked atomically, withdrawal becomes scope_unavailable without factual publication and persists retryable=false/retryMode=none, unchanged on POST/GET/replay even after membership restoration without reprocessing; text-only changes cannot relabel loaded revision/hash/text (AR13 and owner decision A).
- AC5: Given deterministic development simulation, when the complete request path is exercised, then explicitly synthetic fixtures use real persistence/routes and never claim actual BC evidence (AR4/20).

## Implementation Notes

- Planning stopped before approval/implementation. Supervisor confirmed a product blocker: epics, Runtime Contracts §§1/4, ARCHITECTURE-SPINE, PRD FR-8 and EXPERIENCE require controlled scope_unavailable, persisted retry metadata and strict original-scope revalidation, but do not select retryable for this code. Application ownership does not delegate this visitor-observable policy decision to an agent. BC subsequently resolved this blocker by explicitly selecting false/none, recorded in the intent contract above. This decision does not itself assert implementation completion. The owner requested session compaction before further story execution; the spec remains draft pending the resumed planning checkpoint.
- Supervisor accepted retaining the full cohesive spec above the suggested 1,600-token size; this is not spec approval or human/product acceptance. No implementation, migration execution, review or completion commit was started. Existing 2.6/2.7 sprint review states remain unchanged.
- Initial repository verification: branch `work/epic-2-through-2-11`, clean HEAD `9953276e9973b80f566c5ad39f92c3006a44083a`. The bmad-build renderer ran exactly once successfully; investigation used one fresh read-only child. Only this new draft is intended to remain for recovery.

- Authorized retained continuation reverified unchanged branch/baseline and only this draft untracked with an empty index. Owner decision A is incorporated into the matrix, unit-test obligations and AC4. No remaining intent gap is known; no renderer rerun or repeated investigation. Full original AC scope remains intact. Prior Story 2.7 technical completion is continuity only, not BC acceptance.

- Supervisor approved the complete spec technically after independent AC/runtime review, including the larger cohesive size. Intent is frozen. POST/GET effective configuration parity is explicitly retained from 2.7 B7; full-schema comparison and all-child/release rollback remain mandatory. This approval is neither BC acceptance nor final advancement.

## Spec Change Log

### Review pass 1 — re-derivation

B6/B7 exposed incomplete integration instructions for the new public route: GET must report processing-unconfigured admission honestly, and catalog_stale must include the authoritative current identity. Amended the non-frozen implementation requirements below, without changing owner intent/policy. Avoid a default runtime that claims it can accept work it always rejects, or a stale-catalog response missing the existing runtime contract. KEEP atomic D1 batch/unique answer/citation constraints, every-write rollback/fences, immutable membership versus loaded text, saved replay precedence, false/none after restoration, complete historical copy, synthetic-only composition, real D1/Chromium coverage and all safety boundaries. Preserve useful implementation in `/tmp/story-2-8-review-pass1-recovery.patch`; re-derive only this story's code, incorporating the verified direct defects/test gaps below. No previous story is reverted.

## Review Triage Log

Coordinator iteration-1 audit: read all 889 lines of `/tmp/story-2-8-rederivation-delta.patch` against the previously fully read baseline diff, covering every changed implementation/test line. Reverified all tasks, original ACs and ten matrix rows; all pass on the rederived tree. Independently reran full checks in `/tmp/story-2-8-rederived-coordinator-verification.log`: four typechecks, 45 fixtures, 529 units, builds, six simulations and 41 Playwright pass. The worker's generic empty-index acceptance rejected the preserved coordinator-staged spec/sprint files; those are known workflow-owned staging, not a runtime failure or hidden worker commit.

### Independent pass 1

All three fresh same-model reviewers launched together through one awaited native runs.all before any collection/triage: blind `9ca37091-07e0-4280-b8e6-0e29c51bb5de` (N=10), edge `50a6a205-a5c6-461d-81b2-9c33a2402f10`, verification `8377cf67-1511-4a3c-87c2-bd5059b65264`. Full reports are runtime output artifacts under those IDs. Reviewed baseline diff `/tmp/story-2-8-diff-zEfqIj.patch`; no review layer skipped. Reviewer rankings are disregarded.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| B1 | medium / patch, superseded by re-derivation | Coordinator probe accepts customized consistent scope failure metadata/text; SQL always substitutes today's failure block solely by code, leaving mismatched saved error. Only actual conversion should substitute blocks. |
| B2 | medium / patch, superseded | Coordinator Node probe shows a sparse one-element sourceIds array passes completeResult, serializes to null and no excerpt. INSERT has no matching citation, so post-commit read rejects; dense element validation is a direct correction. |
| B3 | medium / patch, superseded | Coordinator probe normalizes a 500001-character requestId, then controlled fallback fails the new whole-result size check. Apply generated-output budget to generated fields, not immutable admitted metadata; no new identity policy needed. |
| B4 | maybe-false / defer after re-derivation | req.json is unbounded, but no actual memory/availability failure on the configured runtime was demonstrated. Medium-unverified ingress risk needs resource measurements and a bound accommodating approved input/catalog semantics; arbitrary new body policy is not inferred. |
| B5 | medium / patch, superseded | Coordinator service probe with live same/other leases and no processor returns result_unavailable instead of in_progress/busy. Move the existing lease decision before processor readiness, after saved terminal. |
| B6 | medium / bad_spec | Coordinator service probe confirms GET admission true with live catalog while same composition POST always rejects unconfigured processing. New route integration instructions omitted readiness propagation; add truthful processing-unavailable view without blocking saved reads. |
| B7 | medium / bad_spec | Source trace confirms AdmissionRejected retains only code and HTTP returns generic envelope; runtime §4 requires current public identity for catalog_stale. Existing instruction failed to specify full rejection serialization including atomic races. |
| B8 | low / patch, superseded | Current failure port allows string declarations; output.language ?? lastLanguage discards supported English history for unsupported de, mapping straight to fr. Implement the already-approved fallback order as a direct template-selection correction. |
| B9 | medium / patch, superseded | resultReads joins edges by answer_id/source_excerpt_id, while only block-leading keys exist. It must scan/build an automatic index across unrelated conversations. A direct supporting index avoids cross-conversation read amplification. |
| B10 | maybe-false / reject | No reachable unexpected internal defect was supplied: current catch sites handle storage/dependency exceptions, classified as safe 503. A current unexpected nondependency throw must be demonstrated before adding another internal/public classification branch. Potential low diagnostic distinction alone does not justify speculative complexity. |
| E1 | medium / patch, superseded | Independently same demonstrated large immutable requestId versus whole-result budget as B3. |
| E2 | medium / patch, superseded | Independently same demonstrated controlled scope failure block substitution as B1. |
| V1 | medium / patch, superseded | Pre-verified gap: D1 success tests compare reconstructed POST against GET/replay, not exact original block text; corruption could agree across every transport. Add distinct expected strings at persistence boundary. |
| V2 | medium / patch, superseded | Pre-verified gap: cited refusal is valid in unit tests, but atomic withdrawal only exercises answered status. Add real D1 factual-refusal withdrawal and saved parity. |

Grouping follows individual verdicts: B1/E2 and B3/E1 share roots. Others are distinct. B6/B7 trigger bad_spec loopback; lower patches are incorporated as re-derivation requirements, not dispatched as isolated fixes. B4 stays visible for later unverified deferral; B10 rejected. Frozen owner scope/false-none policy is unchanged.

Coordinator pre-review: personally read the full 1,706-line baseline diff `/tmp/story-2-8-diff-zEfqIj.patch`, including all added unit/runtime/Chromium assertions. Every task, all five original ACs and all ten matrix rows map to executed tests. Reran `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && git diff --cached --check`; `/tmp/story-2-8-coordinator-verification.log` passes four typechecks, 45 workstation fixtures, 519 unit cases, both builds, six simulations and all 41 Playwright tests, no skips. Index is coordinator-staged for workflow diff inspection, not worker-owned staging. No BC acceptance is inferred.

Native orchestration note: the direct worker launch detached for intercom; `bg_wait` was absent from this coordinator's tools. Parent authorized bounded status recovery and read-only inspection, then a steer returned exactly `Foreground run '8d7cec15-a281-44f4-b450-a83ad6bde73d' is not a live workflow-owned child.` Parent confirmed terminal timeout and authorized one awaited native `runs.run` resume. Recovery run `3fc2208e-03c5-40a6-b369-98cb95bf3db9` completed normally and yielded the actual handoff. No alternate execution mechanism or overlapping writer; later delegations use awaited native workflows.

### Independent pass 2

All three fresh same-model reviews launched together in one awaited runs.all: blind `0857af9b-ec85-4f7b-b78a-a7175faea7ef`, edge `f131fa42-8730-4924-947e-81b0c6f4ee07`, verification `b5265ac1-c7ba-4ddf-8434-285f44a1113a`. Edge initially reported incomplete deletion/claims checks after supervisor verification was unavailable in the blocking workflow. No triage occurred until parent authorized an awaited retained continuation `8f43fdb6-09d6-43ef-a3b0-6e882b5e37d9`, which completed those checks with no additional violation. Parent supplied a bounded Node validator/in-memory SQLite NUL reproduction, explicitly not D1/HTTP proof. This incident is retained, not counted as a passed first attempt.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| R2-B1 | low / patch | Finalization creates withdrawal failure with result.language only, discarding the already-read prior supported language. A valid de factual result after en history takes fr instead of approved en fallback. Pass existing fallback through the internal command and cover real withdrawal. |
| R2-B2 | medium / patch | Parent probe proves validator accepts leading NUL while SQLite length is zero; source trace shows CHECK abort and unknown result instead of pre-persistence invalid_result. Reject NUL in result text before finalization; add actual D1 regression. |
| R2-B3 | false / reject | No current caller reorders scope: completeResult and controlledFailure use the admitted message's same scope value, JSON read preserves its order, and the pipeline supplies that result directly. Reviewer supplied a manually reconstructed port command, not a reachable product failure. Do not weaken exact immutable guard for an unshown caller. |
| R2-B4 | false / reject | Only production catalog is D1ResourceCatalog; readBatch encloses all async reads/validation in try/catch and returns null, which already rechecks saved terminal. A deliberately throwing mock does not establish the claim for an existing caller. Same root rejected in 2.7 B5. |
| R2-B5 | maybe-false / defer | Repeated JS edge filtering is real; no user-visible latency/CPU failure demonstrated within current 20-turn/output bounds. Medium-unverified graph-scale risk needs representative measurements before refactoring reconstruction. |
| R2-B6 | maybe-false / defer | Multiple authenticated reads are visible, but no deadline/limit failure is measured and they preserve auth-before-parse and race guards. Medium-unverified redundant-read cost needs D1 query/latency evidence before merging boundaries. |
| R2-B7 | medium / patch | Both persistence fixtures use null section titles; real headed metadata could be dropped unnoticed. Add original non-null heading and changed live heading assertions. |
| R2-B8 | medium / patch | Current migration tests apply all versions before creating messages; populated 0005 upgrade preservation is not exercised. Add genuine old-schema message/lease fixture then 0006 and finalization without rewriting old rows. |
| R2-B9 | low / patch | New POST uses one generic rejection sentence, providing no correction direction for invalid input/stale catalog. Replace existing copy with safe code-specific development guidance and regression; no new error surface or final UX acceptance implied. |
| R2-B10 | low / patch | Sprint annotation still names superseded 518-unit run; update/label final evidence at closure rather than implying current totals. |
| R2-E1 | medium / patch | Same leading-NUL validator/SQLite mismatch as R2-B2, reproduced by parent and completed source tracing by retained edge reviewer. |
| R2-V1 | medium / patch | Pre-verified gap: all multi-source arrays are sorted S1/S2. Add two factual blocks with opposite citation orders and compare exact original order across persistence/transports. |
| R2-V2 | medium / patch | Pre-verified non-null section-title gap, same root as R2-B7. |

Groups: R2-B2/E1 share NUL validation; R2-B7/V2 share heading coverage. Remaining roots separate. Only direct corrections, internal fallback forwarding and tests survive; none requires intent/spec re-derivation or new policy. Prior B4 ingress deferral is recorded once with the two newly unverified performance claims. All retained fixes go to the same re-derived implementation worker through awaited native resume.

All retained pass-2 corrections were applied by the same implementation worker, awaited native resume `80983d7b-3fc9-455d-a5cc-d0eb3a0285e8`. Coordinator read every line of `/tmp/story-2-8-review-corrections.patch` (384 lines): previous-language forwarding is internal only; NUL is rejected before invalid_result finalization; exact non-null heading and opposite per-block citation order survive changed publication; fixture applies 0006 only after actual 0005 message/lease rows and proves both expired fence and live finalization; existing error codes now have safe development guidance. No assertion weakened or production test hook added. Focused logs `/tmp/story-2-8-review-corrections-unit.log` (64 cases) and `/tmp/story-2-8-review-corrections-d1.log` pass. Worker generic acceptance again correctly reports coordinator-owned staged files, not an empty index; no worker staged or committed.

After all retained fixes coordinator independently reran `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && git diff --cached --check` in `/tmp/story-2-8-final-coordinator-verification.log`: four typechecks, 45 workstation fixtures, 533 unit cases across 14 files, frontend/Worker dry-run builds, six simulations and all 41 Playwright tests pass without skips. Every original AC/task/matrix row and retained review correction is now verified; remaining findings are rejected or explicitly medium-unverified deferrals, not silently accepted defects. No real-model, hosted or BC acceptance follows.

## Design Notes

### Required integration corrections from review pass 1

Re-derivation starts from the original baseline code. Task checkmarks/evidence above describe the superseded pass and must be reverified before current completion. The saved recovery patch contains that pass's useful code and tests; reuse only what satisfies the amended design, preserving all KEEP obligations. Coordinator-owned staged spec/sprint changes must be preserved, not treated as worker staging. Do not stage or commit; return the implementation handoff promptly after required verification, using adequate command timeout (1200 seconds for full chain).

- `src/worker/index.ts`, `src/application/conversations.ts`, shared Conversation view: supply effective processing readiness alongside shared limits. Completed history/replay remains available. Idle GET with a usable catalog but no configured processor must report unavailable with a safe processing reason, not true; no provider policy or live call is introduced.
- Admission error type/service/D1 atomic decision/HTTP: catalog_stale carries authoritative current catalogRevision/catalogHash from the same deciding snapshot/batch. Do not return the stale input identity or invent readiness if active publication disappears. Test both direct stale input and an A-to-B atomic race at HTTP boundary.
- Preserve already-controlled scope failure blocks verbatim; only actual factual withdrawal conversion substitutes the safe failure blocks. Test customized safe metadata/text through real D1.
- Reject sparse processor arrays mechanically before persistence (including citation holes), never publish an unreadable canonical result. Test a sparse citation array and dense valid arrays.
- The generated-output budget must not reject immutable admitted identity/scope metadata. Apply output bounds to answer-generated portions rather than all mandatory historical fields; do not impose new arbitrary Resource/catalog bounds. Test a large accepted request ID with a terminal controlled result. Bounded ingress hardening remains unverified risk, not an invented product limit.
- Check already-read live lease precedence before rejecting absent processing; saved terminal still wins. Test both active same-ID and different-owner with processing disabled.
- Select supported normalized current failure language, then supported previous language, then French. Test unsupported current language with English prior result without a model call.
- Add an answer-leading citation edge index and verify a representative query plan; preserve existing uniqueness/composite FK constraints.
- Extend real-D1 assertions to compare distinct exact input block texts (including whitespace/Unicode) with finalization/GET/replay, and a cited refused result whose original member is withdrawn before finalization.

Use additive schema with unique message answer and same-answer citation constraints. Canonical reconstruction reads saved rows, not mutable index. Distinguish new processing composition from saved replay so disabled/unavailable generation never blocks history. Atomic membership checks must cover uncited frozen members as well. Persistence validates deterministic input shape, not semantic factuality; later stories own real generation and semantic evaluation. Unconfigured runtime may reject new processing safely while the synthetic fixture composes the same route/service/store.

## Verification

Run `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`, focused real-D1/result/Chromium tests and `git diff --check`. Independently inspect complete baseline diff and each task/AC/matrix row, execute all rendered fresh review layers, triage every finding, fix and rerun relevant/full checks. Record exact commands/output paths, baseline, retained findings and limitations here. Preserve operator servers/storage. Validate conventional local commit, clean checkout/no staged files and explicit supervisor advancement acceptance. Never start the next story.


### Implementation-worker evidence — 2026-11-19

Implemented against unchanged baseline `9953276e9973b80f566c5ad39f92c3006a44083a` on `work/epic-2-through-2-11`. All four frontmatter context files were loaded fully before implementation. Pre-existing spec/sprint changes were retained; frozen intent is unchanged. No operator migrations/storage/server changes, private-corpus/secret inspection, hosted/model calls, remote Git, configuration/harness changes, staging or commit. Existing source-fixture Git copies are local only.

- Shared `conversation-result.ts` owns the five-status canonical result, stable answer/block/excerpt IDs, ordered citation references, trusted historical provenance, declared language normalization, bounded exact mechanical schemas and application-owned failure metadata. `scope_unavailable` is false/none in both application and SQL constraints. Completed GET turns contain the identical result schema; no second completion flag.
- Additive 0006 creates unique message answers and ordered blocks/excerpts/same-answer edges. `D1ConversationStore.finalize` checks current existence, creation-based retention and matching unexpired owner at the atomic write boundary. Current-public membership checks include uncited/zero-chunk frozen members and use current active revision, not equality with previously loaded text/path/title. The same batch selects controlled withdrawal failure, writes all children/metadata, updates modified_at and releases only the same owner. Snapshot reconstruction uses only admitted/saved rows.
- Admission service and its atomic D1 decision give saved terminal results precedence over catalog, busy and cap checks, including completion races. `submitConversationQuestion` separates replay from new processing. Invalid drafts/dependency exceptions become safe controlled results if recorded; unconfirmed persistence stays `result_unavailable`/same_request, never a false failure or unchecked draft.
- Real authenticated POST is complete JSON/no-store/HTTP 200 for all recorded statuses. One effective Worker limits object feeds POST and GET. Processor construction is lazy and never needed for replay. Default unconfigured processing rejects new work before admission; the explicit synthetic adapter and disposable Worker compose the same public route/service/store. No client-authored output/evidence, selected admission, new-ID retry execution, UI or automatic recovery.
- Unit tests add 50 result cases (the last full-suite run below preceded the final additional regression). Disposable D1 tests cover all six factual write-boundary AFTER faults plus four failure-metadata write faults, complete rollback including Conversation timestamp and lease, unique/cross-answer constraints, independent-instance duplicate/terminal races, old/successor ownership, deletion, retention with a still-live lease, and canonical full-schema parity for five statuses. Publication tests cover uncited withdrawal, false/none after restoration, absent/incoherent active revision, text/path/title updates, added documents and historical cited documents removed entirely. Actual Chromium performs authenticated POST/GET/replay for each status. Lost receipts, configured cap, malformed body/output, disabled processing and safe unknown outcomes are exercised.

#### Validation commands and output

| Command | Evidence |
| --- | --- |
| `npm run typecheck` | Four TypeScript configurations pass; final full log below |
| `npm test` | 45 workstation fixtures and 518 Vitest cases across 14 files pass |
| `npm run build` | Frontend and Worker dry-run builds pass, no deployment |
| `npm run test:smoke` | Six simulations and all 41 Playwright cases pass without skips |
| `npx vitest run tests/bootstrap/conversation-results.test.ts` | `/tmp/story-2-8-results-unit-final.log`: 50 cases pass |
| `npx playwright test conversations.spec.ts -g 'real D1 complete results'` | `/tmp/story-2-8-results-d1-final.log`: real shared D1/independent Workers plus Chromium pass |
| `git diff --check`; `test -z "$(git diff --cached --name-only)"` | Whitespace passes; no staged files |

Full chain `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && test -z "$(git diff --cached --name-only)"` passed with an explicit completion marker in `/tmp/story-2-8-final-verification.log`. Focused later assertions additionally check current retention with a live lease, removal of cited live documents, exact block/source ordering, invalid JSON and SQL failure-metadata constraints; `/tmp/story-2-8-results-d1-final.log` passes after those additions. The bounded post-interruption delta validation is recorded below; the full-suite log is not claimed to cover later edits.

#### Execution interruption and authorized same-runtime continuation

The first combined build/smoke `functions.bash` invocation returned exactly **`Command timed out after 120 seconds`**. `/tmp/story-2-8-build.log` shows both builds completed; `/tmp/story-2-8-smoke.log` shows six simulations and only 17/41 Playwright cases before interruption. That run is **not** a passed smoke suite. Work stopped and the supervisor explicitly authorized inspection and continuation in the **same worker/runtime**, using a sufficient 1200-second outer timeout, preserving operator servers and requiring certain ownership before cleanup. Inspection found no remaining matching Playwright/disposable-runtime processes; no process cleanup was performed. The full chain subsequently passed twice in the same runtime, including the distinct final log above. No alternate execution mechanism, weakened assertion or fixture timeout was used.

Ordinary implementation corrections before passing checks: exact-optional result-error typing and store-mock `finalize` signatures; existing tests expecting absent message POST were updated to expect neutral unauthenticated 401; migration inventory now includes 0006. Self-review tightened failure-JSON CHECK semantics against SQLite NULL acceptance, with actual D1 negative cases. None changes approved policy or scope.

#### AC and matrix traceability / remaining gates

AC1–AC2: real POST plus owning finalization, six write boundaries and failure-metadata rollback, unique answer/cross-answer FK, successor/expiry/deletion/retention fences and immutable admitted inputs are covered in `conversation-results-runtime.mjs`. AC3: every saved status is compared as a complete object across POST/GET/replay, with ordered IDs/edges/provenance/language/error metadata, cap and lost-response/no-additional-call/turn assertions, including Chromium. AC4: original uncited membership withdrawal records false/none, survives restored availability without processing, and permitted reindex/rename/addition preserves loaded provenance/eligibility. AC5: synthetic-only opt-in processor exercises the real route/persistence with explicit fiction/non-BC output and no real classifier/generator/provider.

All ten matrix rows have focused unit and/or actual D1 assertions. Mechanically valid output is not semantic evidence, actual language proof, privacy certification or BC acceptance. The full-publication admission/read load risk inherited from 2.7 remains unmeasured on large corpora; this story does not introduce a new quota/policy. Atomic current-membership checks rely on the existing publication adapter's atomic activation contract. Purge/early cutoffs, provider/A05/A08 decisions, real generation, selected admission, UI and new-ID retry execution remain explicitly outside scope.

Implementation task checkboxes denote delivered worker scope only. Sprint is **review** pending coordinator-owned fresh independent review, triage, conventional local commit/clean-checkout verification and explicit advancement; no independent-review or BC acceptance claim is made here. No next story started.


#### Terminal subagent interruption and bounded handoff recovery

The original worker run `8d7cec15-a281-44f4-b450-a83ad6bde73d` ended with the orchestration error **`Subagent timed out after 1800000ms.`**, before returning its normal handoff. The supervisor explicitly authorized same-runtime recovery to preserve all work, reconstruct this report, verify any delta after `/tmp/story-2-8-final-verification.log`, and record the incident. No competing writer, alternate execution mechanism, new implementation pass, review, staging or commit was used during recovery. Frozen intent remains unchanged.

The saved full-chain log ended successfully at 09:43 with four typechecks, 45 workstation fixtures, 518 Vitest cases, frontend/Worker dry-run builds, six simulations and 41 Playwright cases. Subsequent pre-interruption changes were:

- `migrations/0006_conversation_results.sql`: failure metadata CHECK now rejects SQLite NULL/absent-field acceptance and requires a nonempty message. Focused actual-D1 negative assertions passed afterward.
- `tests/e2e/conversation-results-runtime.mjs`: added retention-with-live-lease, removal of cited live documents, malformed JSON, failure-metadata constraint and historical saved-failure-copy/retry-metadata assertions. The 09:46 focused D1/Chromium log passed.
- `src/shared/conversation-result.ts`: saved failure text/retry metadata is validated structurally rather than compared with today's template, so changing application copy does not invalidate historical replay; unknown failure codes reject. The 09:46 typecheck/unit/D1 logs passed this change. The final 09:47 edit removed an unwarranted blanket prohibition on factual examples in a refused result; ordinary eligible-citation and factual-finalization guards still apply.
- `tests/bootstrap/conversation-results.test.ts`: historical failure copy/retry metadata regression plus citation validation for factual examples after refusal. The last edit replaced one negative case with that positive/negative citation regression, retaining 50 focused cases.
- Spec/development/migration/sprint documentation was updated to describe the implementation and pending independent-review/BC gates; no configuration or operator state changed.

Recovery ran only checks justified by that delta:

```bash
npm run typecheck
npx vitest run tests/bootstrap/conversation-results.test.ts
npx playwright test conversations.spec.ts -g 'real D1 complete results'
git diff --check
test -z "$(git diff --cached --name-only)"
```

All passed, with an explicit completion marker in **`/tmp/story-2-8-recovery-delta-verification.log`**: four TypeScript configurations, 50 focused unit cases, the real shared-D1/independent-Worker/Chromium result case, whitespace and empty index. The entire 518-test/build/41-case chain was **not rerun after those final edits**; its earlier passing log remains valid historical evidence, supplemented—not silently replaced—by this targeted delta proof. No code changes were made during recovery; only this implementation evidence was updated. Coordinator-owned independent reviews, any resulting corrections, final full-chain acceptance/commit/clean checkout and BC inspection remain outstanding. The worker is resumable for specifically assigned corrections.


### Re-derived implementation-worker evidence — 2026-11-19

This entry supersedes the earlier worker implementation evidence for the current
review iteration. HEAD remains `9953276e9973b80f566c5ad39f92c3006a44083a` on
`work/epic-2-through-2-11`. The complete spec and all four frontmatter context
files were loaded before edits. The authorized recovery patch supplied the
cohesive Story 2.8 implementation/tests; every amended requirement was then
implemented and verified against the actual baseline. Frozen intent was not
changed. Coordinator-owned spec/sprint staging was preserved; the worker did
not stage, unstage or commit anything. Sprint remains review pending independent
review and BC inspection.

All seven execution checkboxes above have now been reverified in this pass:
canonical five-status types/validation, additive atomic D1 result persistence,
portable orchestration/replay, authenticated POST/GET composition, unit tests,
actual D1/Chromium tests and development/migration documentation. Original AC1–5
and all ten matrix rows remain covered by the retained full rollback/fencing,
publication/provenance, replay/identity/limit, safe-error and synthetic-only tests.
No real generation, selected admission, new-ID retry execution, UI, purge,
provider/privacy policy, operator migration/storage/server change, secret/private
corpus inspection, remote Git, deployment or harness/configuration change occurred.

#### Amended requirement evidence

- B1/E2: finalization substitutes safe blocks only for an actual factual-to-failed
  conversion. An already-controlled scope failure keeps its customized exact
  whitespace/Unicode block text and persisted false/none metadata through actual
  D1 finalization, GET and POST replay.
- B2: dense draft/citation traversal rejects sparse processor arrays before
  persistence; canonical validation also rejects citation holes. Dense arrays
  remain valid.
- B3/E1: the output budget excludes immutable admitted identity/scope fields.
  A 500,001-character accepted request ID completes with a controlled terminal
  failure and identical real-D1 POST/GET/replay, without a new identity policy.
- B5: saved terminal still wins; already-read live same-ID/different-owner leases
  produce in-progress/busy even when processing is disabled. Unit and HTTP tests
  verify no admission/processing and unchanged ownership.
- B6: one Worker composition supplies effective limits and processing readiness.
  Idle authenticated GET with usable publication but no processor reports
  unavailable/processing_unavailable while saved history/replay remains readable.
  Earlier admission Chromium expectations now reflect this honest unconfigured
  result-processing state; internal explicit admission/recovery remains intact.
- B7: stale errors carry the authoritative current catalogRevision/catalogHash
  through service, atomic D1 decision and HTTP serialization (top-level fields).
  HTTP tests cover direct stale input, coherent A→B between validation and the
  deciding batch, and disappearing authority returning scope_unavailable with
  no fabricated current catalog identity. The race adapter exists only in the
  disposable fixture and prepends a coherent publication mutation to that actual
  D1 batch; it adds no production hook or unresolved cross-request Promise.
- B8: failure language selects supported normalized current, supported previous,
  then French. Unsupported/invalid current language with English history and
  supported current French/English cases use one deterministic processor call.
- B9: migration adds answer_block_sources_by_answer(answer_id,
  source_excerpt_id). A representative actual-D1 reconstruction EXPLAIN QUERY
  PLAN uses it, with neither a citation-table scan nor automatic index.
- V1: a two-block result with distinct exact whitespace/Unicode input strings is
  checked at finalization against those original strings, then compared in full
  across GET/replay, not merely transport-to-transport agreement.
- V2: a cited refused result whose uncited original member is withdrawn converts
  to scope_unavailable without factual blocks/excerpts; restoration leaves saved
  failure false/none unchanged and invokes no processing on replay.

#### Commands and current verification

| Command | Current evidence |
| --- | --- |
| `npm run typecheck` | `/tmp/story-2-8-rederived-typecheck.log`: four configurations pass |
| `npx vitest run tests/bootstrap/conversation-results.test.ts tests/bootstrap/conversation-admission.test.ts tests/bootstrap/conversations.test.ts` | `/tmp/story-2-8-rederived-unit.log`: 140 tests pass |
| `npx playwright test conversations.spec.ts -g 'real D1 complete results'` | `/tmp/story-2-8-rederived-d1.log`: shared D1/independent Workers and Chromium pass |
| `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && git diff --cached --check` | `/tmp/story-2-8-rederived-full-verification.log`: explicit STORY_2_8_REDERIVED_FULL_CHAIN_PASSED marker; four typechecks, 45 workstation fixtures, 529 unit cases, frontend and Worker dry-run builds, six simulations, all 41 Playwright cases with no skips |
| `git diff --cached --name-only` | Only pre-existing coordinator-staged spec and sprint-status files; not an empty index and not worker-owned staging |

No failed test, timeout or runtime/tool failure occurred in this re-derived worker
pass. Final post-chain edits are documentation-only. Current source changes and
new files were inspected against the baseline; coordinator-owned independent
review/triage, final acceptance/commit/clean checkout and explicit advancement
remain pending. No next story started. Mechanical validity/simulation does not
prove actual model semantics, language, privacy, accessibility or BC acceptance.

Residual risks are unchanged: B4 ingress resource limits and the inherited
whole-publication load/cost risk need measurements rather than arbitrary new
input/catalog policy. Factual finalization relies on the existing atomic
publication activation contract. The default runtime intentionally has no
processor; only explicit disposable synthetic composition processes new turns.

### Final coordinator handoff — 2026-11-19

Implementation completion is technical only. The two complete fresh three-layer review passes, retained edge completion, one non-frozen-spec re-derivation and every retained correction are recorded above. No retained blocker remains. Final code evidence is `/tmp/story-2-8-final-diff.patch`; full post-fix verification is `/tmp/story-2-8-final-coordinator-verification.log`. All five original ACs, ten matrix rows and migration/route/provenance/rollback obligations pass. Controlled local D1, independent workerd and Chromium are real runtime evidence; synthetic processing does not establish model semantics, actual multilingual correctness, privacy/provider guarantees or human acceptance.

Developer verification journey: from the locked checkout with existing Chromium, run `npx vitest run tests/bootstrap/conversation-results.test.ts` and `npx playwright test conversations.spec.ts -g 'real D1 complete results'`. These create disposable local fixtures only, including the genuine populated 0005→0006 upgrade; do not apply migrations to operator storage. Observe full POST result, authenticated GET and same-ID replay agreeing for every status without another call/turn, unchanged original input and ordered citation/excerpt graph, withdrawal false/none after restoration, permitted text/heading/path updates retaining loaded provenance, missing publication replay, cap/readiness/conflict guidance, and rollback/fencing of all write boundaries. Browser assertions cover the HTTP protocol only; there is no delivered chat UI or usability/accessibility acceptance to invent. Repeat the full npm chain above for regressions.

Remaining work: B4 ingress and R2-B5/B6 graph/preflight costs are medium-unverified measurements in deferred-work.md; inherited full-publication scale risk remains. Real generation/provider, selected scopes, public recovery/new-ID retry execution, UI, purge and hosted evaluation belong to later stories, not unfinished 2.8 deliverables. BC human review remains pending; sprint stays review. No private corpus, secrets, operator data/server, remote Git, deployment or paid/live-model operation was touched.

Next action: supervisor inspects actual local commit and post-commit full verification, then explicitly decides technical chain advancement. BC may independently run the developer journey and report discrepancies; technical approval never substitutes for human/product acceptance. Only the outer supervisor starts another story. Local conventional commit and clean-index/checkout checks follow this record; the final gate uses the real full hash, not a speculative identifier.
