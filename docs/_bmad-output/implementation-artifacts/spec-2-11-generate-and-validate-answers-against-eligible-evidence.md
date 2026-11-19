---
title: 'Story 2.11: generate and validate answers against eligible evidence'
type: 'feature'
created: '2026-11-19'
status: 'done'
route: 'dispatch'
baseline_commit: '39607c7c62fac2151cfc373f9499de0477e08ffd'
review_loop_iteration: 1
context:
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/epics.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The accepted classifier/context/result pipeline has no actual structured factual-generation continuation. Visitors need mechanically validated supported claims and explicit limitations with trusted passage-local citations, not fabricated source metadata.

**Approach:** Connect eligible retrieval to receiver-budgeted structured generation, fail-closed validation and existing atomic reconstruction/persistence. Verify the complete local pipeline with scripted providers and disposable D1/Chromium; production remains unconfigured.

## Boundaries & Constraints

**Always:** Preserve all five original Story 2.11 ACs below, architecture AD-5/6/7/8/15/18 and runtime §§1–4. Only current retrieved public chunks inside the immutable admitted allowlist can substantiate facts. History, old excerpts, catalog and classification interpret only, never evidence or authority to widen eligibility. Separate trusted instructions from ALL untrusted data. Re-select canonical complete history through the real 2.10 callback for the actual generation receiver; independently enforce component budgets, default configurable 3,000 history tokens, exact serialized total/framing plus output reservation and typed expected-input binding. Preserve current question verbatim and required clarification dependencies; no silent truncation. No-match avoids factual generation and preserves redirect/refusal boundaries without claiming corpus-wide absence. Normalize and compare full language declarations; never relabel or regenerate invalid drafts. Reconstruct original-language excerpts exclusively from retained trusted retrieval. Preserve auth-before-replay, once-only classifier, canonical atomic results, lease fences and scope dependency-versus-withdrawal distinction. Owner decision A is immutable: saved scope_unavailable is false/none, unchanged after restoration; same-ID replay never reprocesses. Stable-ID text/title/path changes are not withdrawal. Core alone owns technical context-reset provenance. Technical done is not BC human/product acceptance; sprint remains review.

**Never:** Implement 2.12 provider binding/free-quota/A05, 2.13 full shared deadlines/A08, UI, selected admission or public recovery/retry (2.18/2.19). Preserve their existing seams and approved values without claiming delivery. No semantic verifier, automatic repair, regeneration, query-reformulation loop, retry, failover or Web/private fallback. No push, remote Git, deployment, paid/live product calls, operator migration/activation/storage/server changes, secrets/private corpus reads, harness/skill/config/agent changes or unrelated edits. One writer; reviewers read-only on a fixed snapshot; children never invoke bmad-build. Genuine runtime failure stops with exact evidence and supervisor notification, never another CLI/mechanism. Do not start 2.12.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| answer/redirect with eligible matches | One scoped retrieval, at most one generator; current local source IDs, boundary-bearing handoff; no catalog/history evidence |
| Successful empty retrieval | Controlled partial/limitation, plus refusal boundary for redirect; zero generator calls; no universal absence claim |
| Nonempty evidence or required context cannot fit | Controlled core-owned limit/restatement, not false no-match; no truncation, guessed history or generator call |
| Different classifier/generator receivers | Re-select canonical complete exchanges; separate component and exact total/output checks bound actual call |
| Invalid draft/schema/citation/path/pattern/tag | Controlled invalid_result; no unchecked output, model metadata, repair or second call |
| Supported/partial/refused generated result | Ordered blocks/citations and original trusted provenance retained; semantic support not mechanically certified |
| Provider/dependency error versus withdrawal | Safe processing_unavailable versus scope_unavailable false/none; no raw diagnostics or retry-policy invention |
| Current language unsupported for local copy | Supported anchored previous then French; record actual copy language; excerpts unchanged |
| Publication changes during generation | Additions never widen; allowed text/path/title changes retain loaded provenance; withdrawal blocks factual finalization |
| Replay/isolation/stale owner/reset injection | Saved parity without calls, no foreign context/evidence, fenced writes; model cannot reset context |

</frozen-after-approval>

## Code Map

- `src/application/professional-intent-processor.ts` — `ProfessionalIntentContinuation.continue` already receives copied/frozen scope and real `selectConversationContext(fits)`. Reuse it, not classifier-pruned history. Current continuation draft strips `contextReset`; retain that defense.
- `src/application/conversation-context.ts`, `src/shared/model-context-budget.ts`, `src/ports/ModelTokenAccounting.ts` — canonical roots/whole-chain selection, receiver-bound frozen envelope and `validatePreparedModelCall(receiver, call, expected)`; generic integrity alone is insufficient.
- `src/application/classify-professional-intent.ts`, `src/ports/LLMProvider.ts`, `src/adapters/llm/{scripted,simulated,deterministic-accounting}.ts` — typed classify is budgeted; `generate(string)` is only bootstrap ping. Add separately typed answer generation with its actual receiver; preserve bootstrap compatibility.
- `src/application/retrieve-evidence.ts`, `src/ports/Retriever.ts`, `src/adapters/d1/{retriever,publication}.ts`, `src/shared/public-evidence.ts` — scoped safe FTS, coherent text/provenance and whole chunks; existing retrieval errors collapse dependency/withdrawal, requiring narrow typed distinction.
- `src/shared/conversation-result.ts`, `src/application/conversation-results.ts`, `src/adapters/d1/conversations.ts` — reuse `completeResult`, trusted source reconstruction, canonical failure/language fallback and existing atomic finalization; no new storage schema needed.
- `tests/bootstrap/{professional-intent,conversation-context,model-context-budget,conversation-results,retrieval}.test.ts`, `tests/e2e/conversations.spec.ts` and existing story fixture workers/runtimes — retain all assertions; new focused generation fixture must use real processor, selector, D1 retrieval, generation validation and D1 results.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/answer-generation.ts` — exact typed request/draft schema, configurable structural/output bounds, full normalized language comparison, dense arrays, allowed kinds/statuses, current-pool citations and forbidden-pattern validation; reject extra metadata and unsafe evidence surfaces.
- [x] `src/ports/LLMProvider.ts`, `src/adapters/llm/scripted.ts` (or focused generation adapter) — receiver-bound structured answer method with optional cancellation, exact prepared-envelope integrity and scripted output reservation enforcement; leave bootstrap/default production unchanged.
- [x] `src/application/generate-answer.ts` — trusted policy/data projection, independent typed expected-input derivation, whole eligible source selection and actual callback-driven generation history budgeting, no-match/redirect templates, one call and fail-closed draft validation; retain private copied source pool for reconstruction.
- [x] `src/application/professional-intent-processor.ts` — narrow trusted fallback-language and core-owned generation-limit outcome plumbing; preserve arbitrary continuation reset stripping, late-cancellation handling and validated classifier-language failure metadata.
- [x] `src/ports/Retriever.ts`, `src/application/retrieve-evidence.ts`, `src/adapters/d1/{retriever,publication}.ts` — distinguish coherent confirmed unavailable membership/publication from actual dependency failure without retry/second read or weakening legacy fail-closed behavior.
- [x] `tests/bootstrap/answer-generation.test.ts` and existing relevant tests — cover every matrix row and all original ACs: actual generation receivers, forged genuine envelopes/projections, exact component/whole/output boundaries, pending-chain/reset isolation, hostile data and citations, schema/language/pattern failures, trusted reconstruction and zero extra calls.
- [x] `tests/e2e/answer-generation-{worker.ts,runtime.mjs}`, `tests/e2e/conversations.spec.ts` — disposable actual D1/workerd/Chromium full pipeline, authenticated isolation, POST/GET/replay parity and call counts, dependency faults, invalid output, loaded-provenance reindex/rename, uncited withdrawal/restoration false/none and rollback/stale-owner fences. Reuse existing fault suites without replacing their assertions.
- [x] `docs/development/application.md`, this spec, `sprint-status.yaml` — current commands/evidence and limits, individual review triage, practical human handoff and technical review state; no scratch/log/generated artifacts committed.

**Acceptance Criteria (all original criteria preserved):**
- AC1: **Given** answer/redirect classification and eligible retrieval, **when** generation is prepared, **then** only current allowed chunks receive response-local source IDs and trusted instructions remain separate from user/history/catalog/source data, **and** no-match produces a controlled insufficiency result without factual generation, preserving any refusal boundary (FR-9, FR-11, AR18).
- AC2: **Given** a generation draft, **when** validation runs, **then** allowed statuses/block kinds, size bounds and required citations for paragraph/summary blocks are enforced, **and** citations outside the current source pool/allowlist, invalid public paths or configured forbidden patterns prevent the draft from reaching the user (AR18, AR20).
- AC3: **Given** responseLanguage and outputLanguage declarations, **when** they are normalized and compared, **then** malformed, missing or conflicting BCP-47 tags fail without relabeling or regeneration, **and** controlled templates record their actual supported current/last/French fallback language while excerpts remain original-language (FR-7, AR19).
- AC4: **Given** accepted factual blocks, **when** excerpts are reconstructed and finalized, **then** trusted original chunk text/ID/hash/document ID/path/title/section/location/revision and same-answer citation edges are persisted rather than model-authored source metadata, **and** the result distinguishes supported, partial, missing and refused information without claiming that valid references prove entailment (FR-10, FR-11).
- AC5: **Given** injection, unsupported-reference and invalid-draft fixtures, **when** tests run, **then** unsafe output cannot bypass validation and no automatic repair or semantic-verifier model is invoked, **and** actual meaning, completeness, language and factual support remain subject to real-model evaluation (AR20).

## Implementation Notes

Supervisor approved the complete larger cohesive spec technically and authorized continuation. Frozen intent is locked; no BC acceptance or final advancement is implied. Before application changes, coordinator runs full baseline verification on the exact unchanged source HEAD; only this new planning spec exists outside that clean source baseline. Redirect structural coverage is clarified below as requested, without changing intent.

Coordinator baseline command passed on exact unchanged source HEAD before application changes: `npm run typecheck && npm test && npm run build && npm run test:smoke`, log `/tmp/story-2-11-baseline-verification.log`, marker STORY_2_11_BASELINE_VERIFIED. Four typechecks, 45 workstation fixtures, 753 units/17 files, both builds, six simulations and all 43 Playwright pass. Tracked tree/index stayed clean; only this new planning spec was untracked. Existing fixture Git fetches are local-only copies, not remote operations.

Coordinator personally read the complete 1,392-line baseline diff `/tmp/story-2-11-coordinator-diff-scQQIc.patch` (127,052 bytes), including every source/test change and documentation. Checked all eight execution tasks, original AC1–5 and ten matrix rows against delivered assertions. Existing suites retain complete rollback/replay/lease and pending-chain regressions; new actual pipeline covers generation integration, not real-model semantics. Worker `9cf57a8f-dd95-42af-ba3e-924cd6460252` returned normally with native review-required and checked empty-index evidence; no runtime failure. Its unsupported spec status `review` is normalized to workflow `in-progress` before coordinator verification; sprint review is valid. Worker task marks denote implementation coverage; independent review/triage and final gates are still outstanding.

Personal full verification initially failed the unchanged stalled-health assertion at `tests/e2e/bootstrap.spec.ts:82`: expected Worker indisponible within 5000ms, observed Vérification du Worker. Log `/tmp/story-2-11-coordinator-verification.log` (SHA256 `e42109fd54c579501ad6d7e6fd213eada968c4b270d688934e7328e28aa8e26e`), saved error context `/tmp/story-2-11-health-failure-context.md` (SHA256 `185de489cdd48ff31a794d7100df781d7cc0b3849917cb5c12c107721c582612`). This is a RECURRENCE of the unexplained 2.10 event `/tmp/story-2-10-rederivation-final.log`, not a diagnosed cause or fixed defect. Read-only comparison confirms no changes to frontend health/App, bootstrap test, shared fixture, runner/Vite configuration or package/lock; the 4500ms application timer and 5000ms assertion alone do not explain failure. No operator listeners were present on 5173/8787 and none were stopped. Supervisor explicitly authorized ONE unchanged targeted rerun and, if passing, ONE unchanged complete rerun. Both passed: `/tmp/story-2-11-health-rerun.log` and `/tmp/story-2-11-coordinator-verified-rerun.log`, latter with STORY_2_11_COORDINATOR_VERIFIED: four typechecks, 45 fixtures, 838 units, builds, six simulations, all 44 Playwright and 395 focused cases. No assertions/timeouts/retries/config were changed. Passing reruns do not prove the recurrence's cause corrected. All AC/matrix tests executed; independent reviews remain required.

## Spec Change Log

### Review pass 1 — re-derivation required

B1/B2/B3/B4/B7 expose missing integration requirements: candidate validation versus selected-pool capacity, compatibility with canonical output bounds, an unambiguous generation retrieval contract, reason-specific no-match refusal, and dependency/corruption classification at preparation as well as retrieval. Re-derive only this story from the original baseline after preserving the useful full patch. Amend non-frozen Design Notes below; frozen intent and owner A remain unchanged. KEEP actual receiver/expected-projection binding, exact component/total/output budgeting, real canonical history reselection and trusted reset boundary, all current-pool source isolation/reconstruction, full language comparison, all accepted redirect refusal checks, no repair/retry, original atomic persistence/replay/fences and every passing assertion. Retain B5/B8/B9/B10/V1/V2 direct corrections/regressions in the re-derived implementation. Prior checkmarks/logs describe pass 1 until reverified.

## Review Triage Log

- Implementation self-check: the initial focused run exposed a legacy whole-chunk
  budget regression and an invalid exact-capacity test descriptor. Preserved the
  legacy empty result and introduced a generation-only typed limit seam; corrected
  the synthetic descriptor's maximumOutput. Existing assertions remain unchanged.
  Follow-up focused checks pass. These were ordinary implementation/test defects,
  not tool/runtime failures or reasons to substitute another execution mechanism.
- Independent read-only review layers and their individual dispositions are
  **pending parent orchestration** on the completed snapshot. No reviewer sign-off,
  final advancement, local commit or BC product acceptance is claimed by this writer.

### Independent pass 1

All three fresh equal-capability layers completed in one parent-relayed native runs.all (workflow `7b8c7225-57cd-4b70-bd47-21d957660a11`): blind `222d74d6-09d5-4124-94ca-f13882aa5a02`, edge `031e4deb-ac29-44ba-b046-fcfa96470be7`, verification `e6f56528-1d8f-47f7-b6e5-b973d123f93c`. Exact prompts in `/tmp/story-2-11-review-pass1-briefs.json`; parent chose neutral delegate because builtin reviewer format/tools conflict with rendered instructions, without changing any configuration. Reports `/tmp/story-2-11-review-pass1-{blind,edge,verification}.md`. Snapshot SHA256 `7c99ccdfd8e999531278afb84049fd610b82f43a893a4f99a9c64e0a1c753556`, 129339 bytes, blind N=10; edge returned [] after executing its layer. Parent verified identical diff/HEAD and no writes. Coordinator read all reports only after complete collection. Read-only Node probes `/tmp/story-2-11-pass1-probes.log` reproduce B1/B2/B5/B6/B7/B8; remaining routes traced through actual callers.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| B1 | medium / bad_spec | Valid two-chunk retrieval with configured sources=1 returns invalid_result before selection. Candidate safety must not confuse prompt-pool count with retrieval validity; separate validation from whole-chunk selected count. |
| B2 | medium / bad_spec | Configured blockText=16001 accepts a draft which completeResult rejects. Canonical hard bounds constrain generation configuration; prevent mechanically known incompatible output before a call, including source count/text and aggregate reconstruction. |
| B3 | medium / bad_spec | Legacy retrieve with D1 textBudget=1 legitimately returns [] while retrieveForGeneration returns limit. Optional fallback in the new consumer silently mislabels nonempty exhaustion; require explicit generation-aware retrieval contract without breaking legacy reader behavior. |
| B4 | medium / bad_spec | INTENT_REASONS permits bypass_boundary and commitment_boundary redirects; no-match ignores both and mentions value judgment/speaking for BC only. Provide controlled reason-specific refusal using existing approved boundaries, no new policy. |
| B5 | low / patch, retained | Probe changes only property order in an otherwise identical typed source and gets invalid_result. Canonical field/value comparison is a direct correction; exact serialized prepared-envelope binding remains separate. |
| B6 | low / reject | Probe confirms permissive answered/transition and refused/limitation combinations, but spine specifies required citations by declared kind and allows unsourced nonfactual blocks without requiring a factual block per answered or refusal per non-redirect result. Actual interpretation is model evaluation; adding status-policy branches is not a direct correction of an approved combination contract. Redirect already has an explicit separate structural rule. No claimed semantic consistency proof. |
| B7 | medium / bad_spec | Actual D1ResourceCatalog processing read with corrupt authority returns unavailable; ModelAwareIntentPreparation maps that to permanent scope_unavailable before new retrieval can distinguish it. New end-to-end generation scope must preserve dependency/corruption distinction at both stages, without changing confirmed withdrawal false/none. |
| B8 | medium / patch, retained | Exported generateAnswer schema errors (tag/decision/policy) return the core limit sentinel. Separate schema/policy validation from numeric context exhaustion; invalid declarations must be invalid_result, never reset provenance. Normal classifier guards prevent these three examples in ordinary routing but the typed consumer promises fail-closed validation independently. |
| B9 | medium / patch, retained | Current generation E2E only supplies/cites first source; existing synthetic persistence tests bypass selection. Add actual multi-document/chunk generation and reversed per-block citation order with exact original metadata and canonical parity. |
| B10 | medium / patch, retained | Existing success path is English only; other-language aliases are helper tests. Add French plus another language/regional tag through generation/persistence, current-language switch and unchanged source language. |
| V1 | medium / patch, retained | Pre-verified regression gap: replacing accumulating candidate with [source] passes current tests. Add simultaneously fitting chunks/order, accepted citations to both and trusted reconstruction. |
| V2 | medium / patch, retained | Pre-verified real-caller gap: no-match/current-limit language precedence not distinguished from previous language. Assert supported current versus different previous language, exact local copy, zero generation and correct reset marker through processor and persisted path. |

Only after individual verdicts: B9/V1 share multi-source selection/graph coverage; all other roots remain distinct. Bad-spec groups trigger re-derivation; direct corrections are KEEP requirements, not separately dispatched patches. No intent gap or new product/privacy/security policy is selected. The recurrent stalled-health failure remains recorded independently.

### Independent pass 2

All three fresh equal-capability read-only layers completed together in parent-relayed workflow `a2cc72b4-6620-4fea-86d0-b8b19ae5c2c3`: blind `a4eca852-662b-48a0-a22b-5dd0ce933ca5`, edge `1b1c4ea9-f439-4e0a-9fbf-6c5954593036`, verification `d335866a-5c16-4aee-ad90-4f8dd76c8750`. Exact briefs `/tmp/story-2-11-review-pass2-briefs.json`; reports `/tmp/story-2-11-review-pass2-{blind,edge,verification}.md`. Snapshot 177878 bytes, SHA256 `a44621a7194530c04fcbbdcb11ef90b5cf9e38efd2a9c80435f52d6c9a52c26e` unchanged throughout review and subsequent diagnostic probes. All reports were collected before reading/triage; edge returned []. No reviewer writes. Each finding below is distinct from pass-1 rows unless noted; retained regression gaps are evaluated on the actual re-derived code.

| ID | Verdict / route | Individual evidence |
| --- | --- | --- |
| P2-B1 | medium / patch | Pure Node probe confirms a structurally conforming non-scripted AnswerGenerator returns accepted output beyond its one-token reservation. Portable dispatch needs the same finite positive serialized-output count check already used by the scripted adapter; direct guard and exact-boundary tests, no new port/policy. |
| P2-B2 | medium / patch | Genuine copied/foreign prepared envelopes return the core limit sentinel despite ample capacity, reproduced by pure probe. Move prepared-integrity validation into its own invalid_result catch; numeric preparation/reconstruction exhaustion retains the existing limit. Correct the tests that incorrectly conflate these outcomes; no weaker check or new public surface. |
| P2-B3 | low / patch | Pure probe confirms outputBytes=500000 passes constructor but cannot leave room even for the empty canonical envelope/IDs. Directly reuse canonical reservation arithmetic at bounds validation to reject demonstrably impossible configuration; actual evidence-dependent fit remains a limit. This corrects an existing configuration check, not a new admission cap. |
| P2-B4 | low / patch | Pure exported-entry probe confirms PRIVATE_SENTINEL local ID/citation is accepted under default patterns. Actual continuation generates safe S-number IDs, so normal visitors cannot choose these; direct pattern checks on the already validated supplied IDs/citations close the exported boundary without a new source-ID policy. |
| P2-B5 | false / reject | Actual D1 rejects the exact malformed catalog_hash='corrupt' prerequisite through its existing CHECK, before finalization. Separately authorized valid-shaped wrong digest experiment returns answered, original provenance, complete persisted graph, released lease and identical replay after restoration—not the claimed permanent scope failure. Runtime §§1/2 require final atomic member/edge availability and retained loaded provenance, not a new full digest read. No weakening of those guarantees was demonstrated; do not add a finalizer/publication policy or claim generic corruption immunity. Parent independently inspected and accepted this technical disposition. |
| P2-B6 | medium / patch | Traced real fixture: preparation withdrawal is now coherent, retrieval covers missing authority/corruption, finalization covers coherent member withdrawal, but actual search-time coherent missing member is absent (only unit mock covers it). Add a disposable atomic coherent withdrawal before search, one processing search read, zero generation, false/none and restoration/replay. No application branch change. |
| P2-B7 | medium / patch | Existing generated partial/refused success cases contain paragraph citations; no-match avoids generation. Add real generated limitation-only partial, refusal-only and redirect refusal+limitation; assert empty reconstructed excerpts/edges and full canonical parity. No new semantic/status policy; pass-1 B6 rejection remains. |
| P2-B8 | low / patch | Actual positive language-switch fixtures contain an English limitation and French multi-source fixture a German summary. Directly localize those fixture blocks and assert every expected text. This corrects test examples, not a semantic language detector or stronger model-evaluation claim. |
| P2-B9 | medium / patch | Read exact tests: token component and canonical bounds are covered, but independent requestBytes/historyBytes exact fit versus overflow and two-ID citations cap are not. Add focused multibyte/escaped serialization boundaries and generator call-count assertions. Existing expectations retained. |
| P2-B10 | medium / patch | parity captures counts excluding preparationReads; all replay assertions can pass if a processing publication reread is introduced. Assert preparationReads separately around parity, including disabled processing and absent publication, without changing legitimate GET availability reads. |
| P2-V1 | medium / patch | Pre-verified gap accepted: helper tests exercise matching custom patterns, but continuation custom pattern never matches output. Add safe-evidence/custom-only forbidden generated marker through actual processor, invalid_result after exactly one generator call. |

No findings share a root requiring grouping; all retained changes are direct boundary corrections or missing tests with no new public surface or undemonstrated guarded state. No intent_gap/bad_spec or loopback is selected. Pass-1 corrections remain intact. Retained-worker continuation is authoritatively unavailable (recorded above); inline coordinator patches require parent authorization and full verification. Parent subsequently authorized these exact inline patches; completion and verification are recorded below.

Diagnostic execution record (all scratch-only, no snapshot edits): initial D1 stdin probe failed because Node --input-type=module was inherited by Miniflare's CommonJS eval worker (require is undefined); normal .mjs then exposed an unused Chromium CJS named import. Parent authorized each bounded invocation/import correction; deleting only that unused import reached D1, whose catalog_hash CHECK rejected the exact malformed prerequisite. Logs `/tmp/story-2-11-pass2-finalizer-probe{,-normal,-business}.log` preserve each result. Separate authorized `/tmp/story-2-11-pass2-finalizer-valid-shape.{mjs,log}` completed with the distinct wrong-digest observation and finally cleanup; no Chromium claim. The pure TS probe initially failed Node strip-only parameter properties; parent authorized one native --experimental-transform-types execution, yielding all four observations in `/tmp/story-2-11-pass2-pure-probes-transformed.log`. No alternative agent CLI/runtime/loader, third-party/config edit or operator action. The review snapshot remained byte-identical after all probes.

## Design Notes

### Required re-derivation corrections

Parent authorized the bounded restoration after reviewing every finding. Complete useful pass-1 patch `/tmp/story-2-11-review-pass1-recovery.patch` (SHA256 `bcea3943891d0d49998b23c96099cf268a71bae801035b5a5acca24b7d1ffb34`) was verified with reverse-apply check; index snapshot `/tmp/story-2-11-review-pass1-index.patch`, 17-path manifest `/tmp/story-2-11-review-pass1-manifest.json`. Coordinator unstaged only its explicit story paths and verified all working bytes unchanged, then restored only 14 story source/test paths plus application.md to the exact accepted baseline, removing only the six explicitly named new story files. Spec/sprint remain; index is empty, baseline source diff empty, HEAD unchanged. Reuse the saved patch's sound source/tests/docs selectively while implementing EVERY amended requirement below; do not apply its spec/sprint over this updated spec. No previous story was reverted, no reset/clean/operator change. This is fresh workflow-prescribed re-derivation, not a resumed/fallback patch worker. Preserve historical evidence and frozen intent. Do not stage/commit or edit coordinator status; return exact new-pass evidence and blockers. If any runtime failure or the recurrent stalled-health assertion occurs, preserve exact log/context and return partial for supervisor decision before any rerun; never retry-until-green. Full checks use 1200-second shell timeout.

- Candidate/source bounds: validate every retrieved candidate's safety/eligibility/provenance, even candidates not selected, but apply configurable sources only to the selected prompt pool. Choose whole ranked candidates subject to that count and exact budgets; a valid larger pool is not invalid_result. Retain unsafe-unselected rejection and no-fit restatement.
- Canonical compatibility: validate generation configuration against existing canonical hard limits (100 blocks/excerpts, 16000 block/metadata text, 100000 excerpt text and generated result size). Keep bounds centralized or explicitly shared, not silently clamped. Ensure accepted generator output plus reconstructed source metadata remains finalizable under aggregate canonical limits; no arbitrary admission/scope cap or question truncation.
- Retrieval: remove silent legacy fallback from actual generation. Introduce a required generation-aware port or explicit typed outcome preserving one coherent query, successful no-match versus nonempty overflow, dependency versus confirmed unavailable scope. Legacy retrieval remains unchanged for existing callers; fixture mocks explicitly implement the generation contract.
- Preparation/search publication distinction: actual D1 exceptions and corrupt/incoherent publication cannot prove withdrawal. Both classifier processing read and generation search must return safe dependency failure in those cases. Confirmed absent authority or coherent missing frozen member remains scope_unavailable false/none. Add actual D1 fault/corruption after admission before classifier, and during retrieval, plus restoration/replay and call counts; no second read/retry or admission-policy change.
- No-match redirects: controlled en/fr copy keyed by validated professional_value_judgment, commitment_boundary or bypass_boundary; explicitly refuse the applicable existing boundary and add limitation without promised examples. Parameterized zero-generation tests for all reasons. Do not invent an additional sensitive-text policy or claim semantic safety.
- Direct corrections: compare trusted source projection by canonical field values independently of insertion order; do not weaken exact prepared serialized binding. Validate typed schema/policy/full declarations before budget handling, returning invalid_result rather than reset for invalid requests. Numeric/structural overflow retains the approved restatement path; no model-supplied limit/reset signal.
- Coverage: actual selection with multiple fitting documents/chunks and a source-count cap; exact per-block reversed citations and every trusted metadata field through POST/GET/replay. Generated French and another valid language/regional-tag switch, original source text unchanged. Both no-match and generation-overflow callers with different supported current/previous languages assert exact copy/language, no generator and appropriate persisted reset. Keep all prior tests and full regression chains.

No unresolved intent gap found in approved artifacts or investigation. No irreversible operation/migration proposed: additive source/tests/docs and disposable fixture writes only. Estimated 15–22 files, one cohesive generation/validation goal with new typed generation contract. Complete ACs and integration obligations intentionally exceed the suggested spec size; seek cohesive-size approval, not omission/splitting of safety obligations.

Generation must implement the spine GenerateAnswerRequest/GenerateAnswerDraft meanings. Trusted instructions express professional redirect/refusal, no unsupported claims/private knowledge, current-pool-only evidence, source-language preservation and strict active output schema/bounds. Current question, history, source titles/text and validated classifier handoff remain untrusted data; no prompt field carries conversation/message/request IDs, credentials or raw diagnostics. Catalog need not be resent. Do not serialize hidden forbidden patterns into instructions. Preserve fictional/non-BC context in whole retrieved chunks and fixture assertions.

Validate all candidate chunks before prompting, including membership, public path, original provenance, duplicates, Unicode and configured forbidden patterns. Retain a private deep copy; provider-facing data never becomes reconstruction authority. Select whole ranked chunks under generation component/aggregate budgets, without silently truncating text or dropping required history. Invoke the actual callback for each candidate request using the generation receiver; required exchanges have priority over optional older exchanges, and empty history still calls fits. If no nonempty eligible evidence fits, take controlled limit/restatement, never successful no-match. Exact final request must independently reconstruct expected instructions/data/component strings at dispatch, reject descriptor/counter/framing/reservation/payload changes, and bind to the actual receiver. Synthetic scalar profiles demonstrate mechanics only, not real provider correctness.

Generation schema permits answered/partial/refused/failed and paragraph/summary/limitation/refusal/transition/error, not clarification or model-authored error policy. Paragraph/summary always cite current IDs; reject unknown/duplicate references and extra source/scope/reset/retry fields. A well-formed failed/error draft maps to existing application-owned processing_unavailable; malformed or forbidden drafts map to invalid_result. Never publish raw model failure explanations. EVERY accepted non-failed generated redirect draft must retain an explicit refusal block, including partial/limitation-only output without paragraph/summary. Add a negative regression for that unsourced partial case as well as sourced examples. This checks declared structure, not semantics; technical failure/limit paths remain core-owned controlled templates. No-match maps to partial with limitation; redirect additionally keeps a controlled refusal boundary. Nonempty retrieval can still produce partial/missing information; do not require factual assertions merely because a source exists.

Normalize full BCP-47 tags with the shared normalizer: canonical aliases may agree, but en-US and en-GB conflict. Generated valid language records its normalized declaration. Local no-match/limit/failure copy selects supported current language, supported preceding-root language, then French; expose only trusted fallback language at the continuation seam, not canonical rows/IDs. Exact copy remains development copy, not final UX/human acceptance. Generation limit must use a narrow core-owned typed outcome, mapped by the processor to its exact local restatement plus trusted reset marker; never remove the existing stripping of arbitrary continuation draft contextReset. Model output cannot select that internal outcome.

Keep legacy retrieval readers fail-closed while preserving actual D1 failure versus confirmed scope withdrawal in the generation path, from one coherent read. The existing finalizer remains responsible for atomic current-membership checks and all result children/lease release. Reindex with stable IDs is permitted; no reread may relabel retained chunks. All frozen members, including uncited zero-chunk documents, still govern factual finalization. Saved replay after restoration or missing publication returns the original canonical result without classification/retrieval/generation.

Investigation: fresh read-only delegate `4727713f-f34b-49b6-9159-e8eea2f8c455`, report `/tmp/story-2-11-investigation.investigate-2-11.json`; no tests run yet. Initial exact branch/HEAD/clean-tree checks passed. Renderer executed once successfully to snapshot `baab905f81a20dbf7831`; no fallback. One prelaunch workflow argument error (`runs.run expects (key, params); got an object as the first argument`) was corrected to documented `(key, params)` and blocking native investigation completed. No child/runtime failure or alternative mechanism. Native blocking workers cannot request a live decision; report genuine blockers/partial state for coordinator escalation. Keep index empty before every writer; worker never stages/commits or changes frozen intent. Review layers will be fresh asynchronous equal-capability read-only agents relayed by parent in ONE runs.all, collected fully before triage.

## Verification

Run focused new generation/context/result/retrieval units and real-D1/Chromium pipeline plus `npm run typecheck && npm test && npm run build && npm run test:smoke` with 1200-second outer shell timeout and full combined /tmp logs. Do not weaken assertions/skips/timeouts; preserve exact genuine failure evidence. Personally inspect full baseline diff and every task/AC/matrix row, execute all rendered review layers and individual triage/re-derivation/patch obligations, rerun targeted and full checks after changes. Record durable command/outcome/evidence hashes in normal docs, not raw logs.

Only after technical gates pass, conventional LOCAL commit including spec/tracking; sprint stays review. Then repeat COMPLETE committed-revision verification plus branch/full HEAD, clean index/tree, ancestry and `git diff --check 39607c7c62fac2151cfc373f9499de0477e08ffd HEAD`. Obtain explicit parent FINAL ADVANCEMENT after independent inspection; spec approval is not final acceptance and neither is BC acceptance. Stop after 2.11.


## Implementation Evidence

The following pass-1 evidence is historical; the re-derived verification below supersedes it for the current code.

Implementation is ready for independent technical review on branch
`work/epic-2-through-2-11`, uncommitted above baseline
`39607c7c62fac2151cfc373f9499de0477e08ffd`. No migrations, production wiring,
harness/configuration changes, staging or commits were made by the writer.
The pre-existing tracking edit was preserved and advanced only to review.

### AC and matrix inspection

- AC1: `EligibleEvidenceContinuation` performs one allowlisted retrieval and at
  most one actual receiver-bound generation; instructions/data are separate.
  Empty answer/redirect paths use local insufficiency/refusal without generation.
- AC2: exact schema, dense arrays, bounded output, enums, factual citations,
  current-pool membership, public paths and forbidden surfaces are enforced.
  Whole chunks and required canonical context must fit independently and in total.
- AC3: shared full BCP-47 normalization/comparison rejects malformed/conflicting
  declarations without relabeling or regeneration. Controlled copy selects
  supported current/anchored-previous/French language; excerpts are never translated.
- AC4: existing `completeResult`/D1 atomic finalization reconstruct/persist trusted
  original chunk identity/hash/document/path/title/section/location/revision and
  same-answer edges. Stable IDs permit reindex while uncited withdrawal still blocks
  factual output; saved nonretryable scope failure survives restoration unchanged.
- AC5: injection/schema/citation/reset/pattern fixtures fail closed, with zero
  repair/semantic-verifier/retry calls. All meaning/language/support claims remain
  explicitly outside mechanical certification.
- Matrix: actual differing receivers and expected-envelope forgeries are covered
  in units; real callback pending chains/reset isolation in units and D1; no-match,
  limits, invalid output, dependency versus withdrawal, fallback languages,
  publication reindex/addition/withdrawal, replay/isolation and atomic rollback/
  stale-owner fences in focused plus retained existing suites. The public Worker
  stays unconfigured and scope/recovery/deadline/provider seams remain deferred.

### Verification record

Initial full command: `timeout 1200s bash -c 'npm run typecheck && npm test && npm run build && npm run test:smoke'`.
Passed four typechecks, 45 workstation fixtures, 837 units/18 files, both builds,
six simulations and 44 Playwright tests, including the new actual D1/Chromium
pipeline. Combined log `/tmp/story-2-11-full-verification.log` initially hashed
`589da282d769aaac0d000c17016d6ebf47c30a6fef7ee8ceb88f3992ede30dd1`.
After adding the larger-generator context and redirect-empty regressions, focused
units pass **395/395 in six files**. Final verification below supersedes the initial
counts/hash. Logs are temporary evidence, not committed artifacts.

The writer inspected all new source/test files and the baseline diff; no staged
files. Independent reviews, review corrections if any, conventional parent-owned
local commit, COMPLETE committed-revision verification and explicit parent FINAL
ADVANCEMENT remain required. Technical review state is not BC acceptance.


### Final uncommitted implementation verification

After all source/test changes, repeated the COMPLETE command with a 1200-second
outer timeout, logging to `/tmp/story-2-11-final-verification.log`: **PASS** — four
typechecks, 45 shell fixtures, **838 units / 18 files**, both builds, six simulations,
and **44 Playwright tests** (3.9 minutes). No source/test edits followed that run.
Documentation-only evidence recording followed. `git diff --check` and empty-index
checks pass; HEAD/branch remain the baseline/branch identified above.

| Evidence | SHA-256 |
| --- | --- |
| Final complete log | `c26ce937b6280158f407deda36ea6bf1b6959ea8b26e34b563e3b2181494a2c5` |
| Focused 395-unit log | `9a232f3832cf6c71e1e4f6933aac536145dffe4c301749b28eb346e0f2a52f6a` |
| Initial standalone new D1/Chromium fixture log | `a5c4e319ac26d78de6bcebd9e2dd3d0626c6f916734800f4f3014678bf9ce223` |
| Source/test manifest | `a97319390783a86542ec9e9d092a03c5cffa3ef9308cd166eb87e565a2aba8ed` |

The source/test manifest is UTF-8 lines `sha256(file)  relative/path\n`, sorted by
path, over the 14 changed/new files under `src/` and `tests/` (tracked diff plus
untracked implementation files). It excludes docs/logs/generated artifacts and
binds the fully tested implementation independently of subsequent evidence prose.
The required parent review/commit/committed-revision gates above remain open.

### Re-derived coordinator verification and second review snapshot

Fresh re-derivation worker `49b44a09-ed2c-40ef-bc25-aa62475ed26e` returned partial-blocked honestly. Its full run passed 863 units but failed the retained professional-intent coherent-withdrawal expectation: the fixture deleted uncited without updating catalog authority, making corruption correctly return processing_unavailable. Failed log `/tmp/story-2-11-rederive-full.log` SHA256 `de37c43f0862cbf8b3afad1ae7582ac20b83d426c85db20bef6627e2a0774b46`; context `/tmp/story-2-11-rederive-failure-context.md` SHA256 `348608ab860983de3e1d948f60be188fb4d8d12dc0a3c90dca71d3c41cc23f80`. No blind rerun. Parent's retained-worker resume attempts failed exactly `Async run not found. Provide id or dir.` and `Async run not found for '49b44a09-ed2c-40ef-bc25-aa62475ed26e'.` No fallback child/CLI was launched. Parent then explicitly authorized the rendered inline patch fallback, limited to that fixture.

Before editing, coordinator preserved the complete reconstructible tracked/untracked patch `/tmp/story-2-11-rederive-partial-recovery.patch` SHA256 `a0155b3a18c0b79f4b1241eca02f4ee32546e687489c410d36e11dc8e0af4488`, reverse-apply check passed, with `/tmp/story-2-11-rederive-partial-manifest.json` SHA256 `c21ca7c4195281c05fecd013719726f5305e926702e8caa4ed92dc2351c809ff`; index was empty. The fixture now atomically withdraws the zero-chunk member and mappings and updates the normalized catalog digest, explicitly validates a coherent available publication afterward, and does not alter admitted identity/allowlist. Fixture setup/verification reads use the raw disposable DB; the processing read count remains exactly one. All old false/none, no-classifier/retrieval, restoration and identical-replay assertions remain unchanged. Separate preparation/search corruption scenarios still require processing_unavailable.

Coordinator targeted verification `/tmp/story-2-11-rederive-fixture-focused.log` SHA256 `6893168a8e42116228b8157d39e7a49dd2fab21fa9d7c1e6b2071d2afbb933d0`: four typechecks, 420 focused units and all three D1/Chromium generation/context/intent pipelines PASS. Complete unchanged chain `/tmp/story-2-11-rederived-coordinator-verification.log` SHA256 `426c8d96207001c3ffa89e154ba2a1211d1b8530f77a8c8af0881f808fb703d4`: four typechecks, 45 fixtures, 863 units/18 files, builds, six simulations, all 44 Playwright PASS; diff-check and empty index PASS. Every shell used 1200-second timeout. The previous unexplained health recurrence remains a residual, not diagnosed or fixed.

Coordinator then staged the explicit 19 story paths for the step-03 audit and personally read every line of the complete baseline diff `/tmp/story-2-11-rederived-coordinator-diff.patch` (1794 lines, 173483 bytes, SHA256 `0f509fdee77960797d5dc60d29f113302ecf16fee8c37e975e20f0b73878910e`). All tasks, five original ACs, matrix rows and retained correction requirements are covered by the new/retained assertions; semantics are not certified. No production binding, later-story delivery, configuration/operator change or assertion weakening. Step-04 snapshot includes these documentation-only evidence updates; all three fresh layers must finish before individual triage. At that snapshot, no local commit, FINAL ADVANCEMENT or BC acceptance had occurred.

### Completed pass-2 corrections and final handoff

Parent authorized the ten minimal inline patches after individual triage, with the retained writer still unavailable. Before writing, coordinator saved `/tmp/story-2-11-pass2-prepatch-recovery.patch` SHA256 `d8b5f83a7d96cc5c61df662e410b395d4760c661e5e2cbdcf1b7961c3baaa72f`, verified reverse applicability, recorded a full file-hash manifest, and unstaged only its explicit story paths while verifying unchanged contents. No other writer ran. P2-B1/B2/B3/B4 boundary corrections and P2-B6/B7/B8/B9/B10/V1 regressions are complete. The only changed prior expectations now correctly distinguish invalid prepared-integrity from numeric capacity limits; no acceptance assertion was relaxed. B5 caused no finalizer modification. No findings were deferred; no blockers remain in the scoped implementation. Historical health recurrence remains unexplained rather than silently dismissed.

Personally read the entire five-file patch delta `/tmp/story-2-11-pass2-patch-audit.diff` (326 lines, 30198 bytes, SHA256 `8941d1048d26ff355042b57ce1835e142d8fa0ffd19d6c50b90ab508a7141bff`) against the previously fully audited 19-file baseline diff. Checked all eleven review rows, five original ACs, all tasks and matrix rows after corrections. This includes portable output reservation independent of the scripted adapter, invalid-envelope failure without reset, constructor rejection of impossible canonical capacity, forbidden IDs/citations, custom output patterns through the processor, no-fact generated outcomes and empty edges, coherent search-time withdrawal, exact serialized/request/history/citation bounds, every language-switch block and zero preparation rereads on replay. Existing scope-A, canonical receiver/history, source reconstruction, reset, rollback and lease regressions remain intact.

Targeted `/tmp/story-2-11-pass2-patch-focused.log` SHA256 `4ee502a9cba40bb9ae70939a4d4a3fe706063735e5f709b73c1dcd26402aef71`: four typechecks, **431 units**, three D1/Chromium pipelines PASS. Full `/tmp/story-2-11-pass2-patch-full.log` SHA256 `45347433f7c48d1d3274b61060660b0fc4ae196f1909fb6eeacf4ed4b61e89b8`: four typechecks, **45 workstation fixtures, 874 units/18 files, both builds, six simulations, all 44 Playwright tests**, whitespace and empty-index checks PASS. Both used 1200-second outer timeouts. Health assertion passed unchanged. No application/test edits followed; only this final evidence/handoff documentation. Spec done means technical workflow completion, sprint remains review and BC acceptance remains pending.

**Verified by the agent:** host Node 24.22.0, deterministic scripted models, disposable local D1/workerd and actual Chromium. Two complete independent three-layer passes, one prescribed re-derivation and individually verified/authorized minimal patches. No real provider, production endpoint generation, paid call, semantic entailment or actual-model language verification.

**What a human should test:** from the configured development checkout run `npx vitest run tests/bootstrap/answer-generation.test.ts` and `npx playwright test conversations.spec.ts -g 'eligible answer generation'`; these create/clean disposable fixture state, not operator storage. Inspect `tests/e2e/answer-generation-runtime.mjs` canonical POST/GET/replay assertions: original question, trusted French source excerpts, generated en/fr/de-CH blocks and multi-source reversed citations; scoped no-match/redirect; unsourced generated limitations/refusals; invalid citation/language/pattern/reset outputs; coherent uncited withdrawal false/none unchanged after restoration; stable-ID reindex preserving original provenance; rollback, stale owner and foreign-session denial. Review controlled development copy and fiction/non-attribution, not a nonexistent product UI. No operator activation/startup is required for these tests.

**Remaining work:** BC human/product evaluation of meaning, completeness, support, natural language and copy; unexplained health-test recurrence remains evidence for future diagnosis. Synthetic token accounting is not provider accuracy, patterns are not comprehensive privacy detection, and final membership guards do not claim full corruption revalidation. Provider/A05, full shared deadlines/A08, UI, selected admission and public recovery/retry remain explicitly later-story scope, not delivered here.

**Next action:** coordinator creates the local conventional commit, runs the COMPLETE committed-revision gate into `/tmp/story-2-11-committed-verification.log`, and requests explicit parent FINAL ADVANCEMENT against that immutable commit. Its result belongs to the final acceptance report, not a self-referential amended commit. Human reviewers should report the fixture commands/results and any unacceptable copy/support/language behavior; technical acceptance never substitutes for BC acceptance. Stop after 2.11; do not begin 2.12 or push.
