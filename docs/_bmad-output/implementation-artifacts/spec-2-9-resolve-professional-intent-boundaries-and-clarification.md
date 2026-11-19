---
title: 'Story 2.9: resolve professional intent, boundaries and clarification'
type: 'feature'
created: '2026-11-19'
status: 'done'
route: 'dispatch'
baseline_commit: 'e028dabc2b9ee043bb484bae8ed8e14dffbb2005'
review_loop_iteration: 1
context:
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/epics.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/implementation-artifacts/spec-2-8-commit-complete-results-atomically-and-replay-them-faithfully.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admitted turns currently use preset synthetic results, not validated professional-intent routing before evidence search.

**Approach:** Add a portable, once-per-attempt LLMProvider classifier with application-owned policy/schema validation; route answer/redirect into a typed continuation and atomically persist direct refusal/clarification using existing results. Exercise real HTTP/D1 with deterministic providers, not live models.

## Boundaries & Constraints

**Always:** Preserve all five original ACs in `../planning-artifacts/epics.md:1027–1062`, spine classifier contract/AD-7 and runtime §§1–4. Classify current immutable question with bounded server-owned same-Conversation context and scope-filtered public interpretation metadata, never retrieved chunks/old excerpt attachments. Separate trusted instructions from untrusted question/history/catalog; neither catalog presence nor absence proves facts or prohibits topics. Eligibility comes only from admitted scope. Current explicit language request governs; validate/normalize required BCP-47 declaration without homemade detection. Exact four-branch schema, application-owned reason codes, bounded dense strings/arrays and forbidden-marker validation precede routing. Never repair/reclassify automatically. Direct refusal/clarification contains no citations, unsupported professional assertion or second generation call. Redirect a clear professional value judgment to facts without yes/no, hiring-fit evaluation or recommendation. Refuse sensitive-personal topics; never disclose private information/hidden instructions, fabricate sources, negotiate, promise or infer BC's intentions/commitments. Preserve decision/reason in downstream handoff. Persist direct classifier text with actual declared language, status/kind clarification or refused/refusal; retain existing controlled failure, replay, ownership and scope semantics. Saved scope_unavailable remains false/none even after restoration (owner decision A). Mechanical tests cannot establish semantic safety or actual model language. Technical completion is not BC acceptance; sprint remains review.

**Never:** Implement live providers, factual generation, full follow-up budgeting/recovery, selected admission, UI, automatic retries, purge or release. A05 sensitive-input transmission/disclosure and A08 usage policy remain unresolved later gates; invent no exceptions, blanket bans, consent or privacy guarantees. No push/remote Git/deployment/paid or live model calls, operator migrations/storage/server changes, secrets/private corpus reads, harness/skill/config changes or unrelated edits. Disposable local fixtures only. One writer; fresh inherited-capability read-only reviewers; children must not invoke bmad-build. Genuine runtime failure stops with exact evidence, no alternate execution mechanism. Preserve operator files/processes.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| answer / professional value-judgment redirect | Valid topic, standalone question, safe lexical terms; unchanged trusted allowlist and boundary-bearing continuation |
| sensitive-personal / commitment / bypass | Approved refuse or permitted professional redirect; no invented policy exception or unsupported assertion |
| material ambiguity | Short declared-language clarification; no retrieval/generation; canonical saved exchange |
| malformed branch/reason/tag/bounds/forbidden marker | Controlled invalid_result; no repair, raw errors or fifth decision |
| provider dependency fails | Controlled processing_unavailable when persisted; unknown persistence remains result_unavailable |
| injected catalog/history/question | Remains untrusted data; no IDs/credentials/chunks in prompt, policy/eligibility unchanged |
| absent/oversized necessary context or catalog | Bounded deterministic preparation, no silent question truncation or guessed substitution |
| replay/cap/lost receipt/disabled processor | Saved identical canonical result, no new call/turn/live dependency |
| cross-Conversation/withdrawal/stale lease | Isolated context, no widened scope or bypass of existing finalization fences |

</frozen-after-approval>

## Code Map

- `src/ports/LLMProvider.ts`, `src/adapters/llm/simulated.ts` — string generate/bootstrap port; evolve deliberately with existing bootstrap tests intact.
- `src/application/conversation-results.ts`, `src/ports/ConversationProcessor.ts` — authenticated replay-before-processing and one admitted process call; add minimal server context seam, never full state in model payload.
- `src/shared/conversation-result.ts` — reuse completeResult/controlledFailure/resultLanguage; current canonical validation alone is not classifier validation.
- `src/ports/ResourceCatalog.ts`, `src/adapters/d1/publication.ts`, `src/shared/public-catalog.ts` — coherent publication and exactObject/validUnicode; project only eligible public titles/topics/aliases, not chunks/review metadata.
- `src/application/retrieve-evidence.ts`, `src/adapters/d1/retriever.ts` — trusted allowlist and encoded lexical terms; no classifier-supplied eligibility.
- `tests/e2e/conversation-results-{worker.ts,runtime.mjs}`, `tests/e2e/conversations.spec.ts`, `tests/e2e/local-fixture.ts` — disposable D1/workerd/Chromium, call counters and canonical transport assertions.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/professional-intent.ts` — implement exact spine ClassifyTurnRequest/Result contract, branch/reason matrix, shared normalized language and configurable structural bounds/forbidden-marker checks.
- [x] `src/application/classify-professional-intent.ts`, `src/ports/LLMProvider.ts` — trusted policy versus data serialization, once-only provider invocation, validation and typed direct/continuation decisions; keep bootstrap compatible.
- [x] `src/application/conversation-results.ts`, `src/ports/ConversationProcessor.ts`, new `src/application/professional-intent-processor.ts` — bounded server-only context/catalog projection after admission; direct-result mapping and safe errors; answer/redirect continuation with trusted immutable scope. Preserve replay and finalization.
- [x] `src/adapters/llm/` and disposable test Worker — scripted deterministic provider/composition exercising actual classifier rather than preset statuses; production remains honestly unconfigured until complete downstream processing exists.
- [x] `tests/bootstrap/professional-intent.test.ts`, existing bootstrap tests — every matrix row/branch, payload isolation and call counts; exact bounds/extra mixed fields/reasons/tags/Unicode/sparse arrays/lexical injection/forbidden patterns and language fallback; no weakened assertions.
- [x] `tests/e2e/professional-intent-{worker.ts,runtime.mjs}`, `tests/e2e/conversations.spec.ts` — real D1/HTTP/Chromium direct text/language/status/no sources, malformed failure, POST/GET/replay parity, auth/isolation, cap/lost receipt, stale fencing and call counts; retain all result regressions.
- [x] `docs/development/application.md`, this spec, `sprint-status.yaml` — reproducible evidence/limitations and human handoff; no root reports or temporary artifacts committed.

**Acceptance Criteria (original traceability):**
- AC1 (AR16): Given an admitted attempt and scoped catalog, when classification runs through LLMProvider, then it runs once with current question and bounded server context without retrieved chunks; exact branch schema, owned reason and well-formed responseLanguage are validated.
- AC2 (FR-12): Given answer/redirect, when accepted, then core receives professionalTopic/resolvedQuestion/safe searchTerms; clear professional value judgments redirect to eligible facts without yes/no or hiring-fit conclusions.
- AC3 (FR-13–15): Given sensitive/personal topics, BC intentions/commitments or bypass requests, when routed under approved boundaries, then no disclosure/negotiation/promise/hidden instruction/fabricated source is permitted and direct refusal asserts no unsupported professional facts.
- AC4 (FR-6/AR16): Given unresolved material ambiguity, when clarify is selected, then a short language-appropriate clarification is persisted as status/kind clarification without retrieval/second generation; malformed classification becomes controlled technical failure, never another business decision.
- AC5 (AR20): Given deterministic branch/injection fixtures, when tested, then every branch and catalog/history policy/eligibility separation is covered; documentation explicitly separates mocked routing from actual-model semantic evidence.

## Implementation Notes

Implementation worker must not stage or commit; preserve coordinator-owned spec/sprint changes. Run the full npm verification chain with an outer bash timeout of 1200 seconds; save full logs under /tmp and record exact commands/results here. Return promptly after implementation verification. Nested runtime children do not invoke bmad-build. Ordinary local test/path/argument failures are correctable; genuine tool/runtime failures require exact error/state, supervisor notification and stop.

Supervisor approved the complete larger cohesive spec technically and authorized continuation; frozen intent is locked. This is not BC acceptance. Real receiving-model history/component/total-capacity accounting remains demonstrable Story 2.10 work, not a claimed result of byte-bounded fixtures.

Initial branch/HEAD/clean-tree checks passed at the full baseline above. Renderer ran exactly once successfully into snapshot `baab905f81a20dbf7831`. Initial investigation `fa93a0f9-1369-40fb-a671-a70c9a9ac403` stopped on `ENOENT: no such file or directory, access '/home/cabail/dev/candidate-copilot/AGENTS.md'`; the coordinator had requested a nonexistent optional file. Native result reported `Status file not found for async run 'fa93a0f9-1369-40fb-a671-a70c9a9ac403'.` Supervisor verified clean state and explicitly authorized one same-mechanism read-only replacement, `4fa4cb41-e5d9-43c7-a5e3-026b53f5b3d9`, which completed investigation. No implementation or alternate execution mechanism was used; no root AGENTS.md exists or was created. Investigation artifacts are `/tmp/story-2-9-investigation*.json` plus native run transcripts.

Worker `500b2219-f5c8-44c8-985a-4b9255803c9a` returned partial after asking the deadline-scope question. Exact channel response: `Supervisor unavailable: the parent is blocked in an async:false workflow and cannot answer this request. Report the blocker and any partial results, then stop. Relaunch the workflow with async:true to allow supervisor replies.` Native return completed normally but reported not-resumable (`Status file not found for async run '500b2219-f5c8-44c8-985a-4b9255803c9a'.`). Parent inspected unchanged HEAD/empty index and saved recovery patches `/tmp/story-2-9-interrupted-{tracked,untracked}.patch`, resolved scope as below and authorized one awaited native retained resume, whose eligibility is not assumed. Partial typecheck/153 units/D1 evidence is not full completion. No alternate mechanism or second writer.

The authorized retained resume failed before launching a child: `Workflow failed: Error: Run 'complete-2-9-handoff' failed: Async run not found for '500b2219-f5c8-44c8-985a-4b9255803c9a'.` Mission `9669adf0-0bfc-42a7-a45e-09d985c2e0df` failed. Parent then explicitly authorized ONE native same-role fallback recovery worker under the retained-children guide, not a resumed session or reimplementation. Prelaunch branch/HEAD remain the baseline, index empty, expected partial files preserved and diff --check passes; original worker already returned, failed resume launched no child and process inspection found no matching old run. Preserve recovery patches and partial report `/tmp/story-2-9-implementation.implement-2-9.json`. No alternate runtime/CLI/configuration, resets or overlapping writer.

## Spec Change Log

### Review pass 1 — re-derivation required

The preparation instructions did not reconcile allowed persisted user/catalog data with stricter classifier input checks, distinguish actual D1 dependency faults from confirmed unavailable publication, or explain the aggregate simulation bound. B3/B4/B5/B9 (and duplicate fallback/edge claims) are bad_spec: amend non-frozen design below, preserve frozen intent and owner false/none for confirmed scope failure. Avoid poisoning all future turns, permanently misrecording transient dependency failure and turning optional metadata into a processing veto. KEEP all exact four-branch/citation-free direct-result, language/schema validation, policy/data separation, frozen eligibility, once-only processing/replay, lease/finalization behavior, cancellation seam and real D1/Chromium assertions. Preserve useful implementation/tests/evidence in `/tmp/story-2-9-review-pass1-recovery.patch`; re-derive only this story's code from original baseline, incorporating every retained direct correction/test gap. Current checkmarks and 628/42 logs describe the superseded pass and must be reverified.

## Review Triage Log

Coordinator personally read the entire 1,310-line baseline diff `/tmp/story-2-9-baseline-diff-gFP5qs.patch` (all 17 files), checked each execution task, original AC1–5 and all nine matrix rows against executed assertions. Independently reran the full required chain in `/tmp/story-2-9-coordinator-verification.log`: four typechecks, 45 workstation fixtures, 628 units, both builds, six simulations and 42 Playwright cases pass without skips; diff and cached whitespace checks pass. Workflow-directed staging is coordinator-owned, not a worker commit. All rendered review layers remain required below.

Coordinator re-derivation audit: personally read all 1,420 lines of `/tmp/story-2-9-rederive-code-diff.patch`, plus appended spec evidence and tracking. Rechecked every task/original AC/matrix row and retained review regression. Independently reran full chain in `/tmp/story-2-9-rederived-coordinator-verification.log`: four typechecks, 45 fixtures, 641 units, both builds, six simulations and all 42 Playwright pass without skips. Generic worker empty-index acceptance rejected only the known preserved coordinator-staged spec/sprint; no worker staged or committed. This is not a runtime failure or a skipped verification.

### Independent pass 1 triage

Fresh same-model layers launched together in ONE runs.all before collection: blind `61c054cc-5056-4958-a453-418a43260d16`, edge `b187a154-355b-4a23-ad51-1a312ea92945`, verification `e51fbe11-48ec-47cf-b224-d7b2b3d06456`. Blind lacked file-size execution and returned only nine findings after unavailable-supervisor response, so was NOT counted complete. Parent measured 110702 bytes and authorized one retained completion. It failed before child launch: `Async run not found for '61c054cc-5056-4958-a453-418a43260d16'`, mission `5e5b0749-59d8-42c5-add9-d8970e639996`. Preauthorized fresh same-role read-only replacement `ec1c2b50-451e-40ed-b6e2-2281b4620133` completed N=min(floor(sqrt(110.702)+1),10)=10 on the same immutable diff, without other reports. All findings below retained individually before grouping; reviewer rankings ignored. Reports `/tmp/story-2-9-review-pass1.{blind-2-9,edge-2-9,verification-2-9}.json` and `/tmp/story-2-9-blind-fallback.blind-2-9-authorized-fallback.json`.

Coordinator probes `/tmp/story-2-9-review-probes.log` reproduce enum coercion, zero-token terms, poisoned history, invalid optional aliases, returned failure language loss, D1 thrown-read-to-null mapping and aggregate overflow. An initial direct Node probe needed `--experimental-transform-types` for parameter properties (ordinary script invocation correction, not harness failure); corrected same-Node probes ran successfully. Source tracing confirms admission permits the historical control character and publication permits empty optional metadata.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| B1 | medium / patch, superseded by re-derivation | Node accepts array decision and routes it to clarification; exact string discriminator check is direct correction. |
| B2 | low / patch, superseded | Node accepts array scope mode in exported validator; no current HTTP caller supplies it, but exact-string validation is a direct correction, not new selected admission. |
| B3 | medium / bad_spec | Current admitted control character yields failed result, then history validation fails all subsequent clean turns. Preparation must treat unrepresentable necessary history conservatively, not poison future questions or change admission policy. |
| B4 | medium / bad_spec | Actual D1ResourceCatalog with throwing batch returns null, preparation converts to permanent scope_unavailable. Need internal typed dependency distinction preserving legacy fail-closed readers, and actual D1 route proof of transient preparation failure. |
| B5 | medium / bad_spec | Existing publication accepts empty aliases/topics; projection then fails whole request. Optional interpretation metadata cannot become an acceptance veto; validate/omit unusable optional parts while retaining usable metadata and entire allowlist. |
| B6 | low / patch, superseded | Node accepts combining-mark-only term; actual encoder returns null. Require each term to produce an encoded token. |
| B7 | medium / patch, superseded | Structured continuation failure returns no current en language while thrown failure retains it. Copy validated current language on absent declaration. |
| B8 | medium / patch, superseded | Provider receives no configured limits/lexical grammar, while validator rejects these. Supply trusted active output constraints without user data or new model call. |
| B9 | medium / bad_spec | Node base request fits configured aggregate 200 bytes but optional title pushes it to invalid_result. Preparation must account for aggregate bytes before adding optional metadata/history, preserving necessary exchange/question or conservative clarification. Not real-model token accounting. |
| F1 | medium / patch, superseded | Independently same reproduced array-decision acceptance as B1. |
| F2 | low / patch, superseded | Independently same exported scope-mode coercion as B2. |
| F3 | medium / bad_spec | Independently same reproducible poisoned historical control text as B3. |
| F4 | medium / bad_spec | Independently same allowed empty aliases defeating projection as B5. |
| F5 | medium / bad_spec | Independently same actual adapter dependency-to-null conversion as B4. |
| F6 | low / patch, superseded | Independently same no-lexical-token input as B6. |
| F7 | medium / patch, superseded | Independently same structured failure language omission as B7. |
| F8 | medium / patch, superseded | Independently same missing active provider bounds as B8. |
| F9 | medium / patch, superseded | Tests compare instructions to the same exported constant only; deleting policy requirements remains green. Add independent focused assertions of approved boundaries, not semantic claims. |
| F10 | low / patch, superseded | Existing tests cover per-term and term-count, not total 64 lexical tokens. Add exact 64/65 boundary with no continuation after invalid output. |
| E1 | medium / patch, superseded | Same demonstrated non-string discriminator acceptance as B1/F1. |
| E2 | medium / bad_spec | Same allowed optional metadata rejection as B5/F4. |
| E3 | low / patch, superseded | Same unusable combining-mark-only terms as B6/F6. |
| V1 | medium / patch, superseded | Pre-verified gap: missing-context tests use French and assert status only. Add exact en/fr controlled clarification text/language and no-call assertions. |

Grouping occurs only after the individual verdicts: B1/F1/E1, B2/F2, B3/F3, B4/F5, B5/F4/E2, B6/F6/E3, B7/F7, B8/F8 share roots; B9/F9/F10/V1 remain distinct. Bad-spec roots trigger re-derivation; no silent deferral/rejection, and no new product decision. All smaller corrections are retained requirements for that pass.

### Independent pass 2 triage

All three fresh same-model reviewers launched in ONE awaited runs.all and completed: blind `9494011b-e81d-4a4f-ae4d-95524d95bd2e` (154671-byte diff, N=10), edge `f942b188-04ee-4097-b76d-680489e10a96`, verification `03e5a4fb-7cc2-4ecc-99e4-72e969631ca8`. Reports `/tmp/story-2-9-review-pass2.{blind-2-9-pass2,edge-2-9-pass2,verification-2-9-pass2}.json`; reviewed baseline unchanged. No incomplete layer counted. Coordinator probes `/tmp/story-2-9-pass2-probes.log` verify configured token length mismatch, precise C1 behavior and late continuation cancellation. No rankings adopted.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| R2-B1 | medium / patch | Source trace: processor has validated en classification, but invalid continuation draft reaches service catch using only lastLanguage. Forward already-validated current language as internal processor metadata through canonical validation; do not trust malformed draft language or relabel it. |
| R2-B2 | medium / patch | Probe accepts 65-character token with term override 65; actual encoder throws retrieval_unavailable. Enforce existing downstream hard token bound independently of override, expose it in trusted instructions and test cross-validator boundary. |
| R2-B3 | low / reject | Oversized title omits whole optional entry including aliases as designed; no semantics/recall failure demonstrated. Rare overlong-title alias salvage requires new projection fallback behavior, not a direct correction. Frozen eligibility and valid remaining metadata remain intact. |
| R2-B4 | low / patch | Probe cancels during continuation; late draft still returns. Add symmetric post-await cancellation check using already-validated language; no new timer or remote-stop claim. |
| R2-B5 | low / patch | Probe confirms C1 U+0085 passes while instruction says all controls. Narrow instruction wording to exact implemented C0/DEL exclusions, preserving existing accepted Unicode rather than inventing another input ban. |
| R2-B6 | low / patch | Prompt names searchTerms but omits array/string field types. State existing exact scalar/array types in trusted schema and assert independently. |
| R2-B7 | maybe-false / reject | Custom forbidden rules can change acceptance, but no actual unsafe output or semantic regression demonstrated; no live provider exists. Would need actual-model failure attributable to absent safe explanatory rules. At most low unverified utility; serializing sentinels/patterns risks revealing internal values and adds policy surface. Keep validators private. |
| R2-B8 | medium / patch | Runtime captured snapshot predates secret insertion, so final assertion cannot detect later cross-Conversation leak. Send a subsequent clean turn in a separate Conversation and inspect its newly captured context. |
| R2-B9 | medium / patch | Fixture's outside resource/document is absent from catalog registry, violating normalizeCatalog. Add registry member while keeping admitted scope frozen to doc; assert fixture catalog validity. |
| R2-B10 | low / patch | Sprint annotation describes superseded 628 run; update current totals/review state at coordinator closure, not worker staging. |
| R2-E1 | medium / patch | Independently same reproduced 65-character token mismatch as R2-B2. |
| R2-V1 | medium / patch | Pre-verified missing mixed-membership resource regression; add coherent eligible+ineligible resource and prove name/description excluded while eligible document metadata and full allowlist remain. |

Group R2-B2/E1 only; other retained roots stay separate. All retained changes are direct corrections/internal metadata forwarding/tests, adding no external surface or policy; no new loopback/deferred work. Rejected low/hypothetical improvements are not blockers. Full checks rerun after corrections.

Retained patch resume `patch-2-9-pass2` failed before child launch: `Async run not found for '9315446d-dbf1-48d6-b0df-cd1f9dcbdb33'`, mission `1f199b9b-6c9e-4a53-a6bc-31715751bd4b`. Parent explicitly authorized the rendered step-04 fallback: coordinator applies patches inline in the same session/tools, no replacement worker. Pre-patch tree preserved in `/tmp/story-2-9-pre-patches.patch`. Coordinator applied only retained corrections and read every line of `/tmp/story-2-9-pass2-corrections.patch` (233 lines). Validated language is separate internal metadata, not copied from the invalid draft; actual D1 proves en invalid_result after fr history plus faithful replay. Hard lexical 64/65 boundaries, late cancellation, precise C0/DEL/schema instructions, coherent mixed membership and a genuinely subsequent isolated prompt are asserted. No new policy, weakened assertion, deadline engine or external surface.

Focused command `npm run typecheck && npx vitest run tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts && npx playwright test conversations.spec.ts -g 'real D1 professional intent' && git diff --check` passed in `/tmp/story-2-9-pass2-patches-targeted.log`: four typechecks, 178 focused units, actual D1/HTTP/Chromium case. Coordinator then reran `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && git diff --cached --check`, exit 0 and `STORY_2_9_FINAL_COORDINATOR_PASSED` in `/tmp/story-2-9-final-coordinator-verification.log`: 45 fixtures, 647 units across 15 files, both builds, six simulations, all 42 Playwright without skips. All original ACs, nine matrix rows and retained fixes rechecked. No retained blocker or newly deferred work remains. Subsequent changes are documentation/tracking only; final committed-revision verification is a separate gate.

## Design Notes

### Required integration corrections from review pass 1

The coordinator has restored only this story's source/tests/development doc to baseline, preserving spec/sprint and the useful complete patch at `/tmp/story-2-9-review-pass1-recovery.patch`. Reuse its valid implementation/tests selectively, then apply every correction below. Coordinator-owned spec/sprint are already staged for workflow diff inspection; do NOT stage/unstage them or require an empty index as a worker gate. No worker commit. Existing execution checkmarks and prior verification are historical until this pass rechecks them. Keep full logs under /tmp and return after full checks (bash timeout 1200 seconds); use no alternate mechanism if runtime fails.

- `professional-intent-processor.ts` and tests: distinguish unrepresentable complete history from invalid classifier output. If immediate necessary exchange cannot be represented, return controlled missing-context clarification without classifier/retrieval. Stop before unusable older exchange once a usable recent exchange exists; preserve complete chronological pairs and let a subsequent clean clarification reply recover rather than perpetually reimport poison. No new admission character policy, sanitization or question truncation. Cover two/three actual HTTP submissions.
- `ResourceCatalog.ts`, `adapters/d1/publication.ts`, preparation and tests: preserve old health/admission/search fail-closed behavior while adding the smallest internal processing read outcome that distinguishes storage dependency exception from successfully observed unavailable/incoherent publication. Classifier preparation maps actual dependency failure to processing_unavailable, never false nonretryable withdrawal; confirmed missing membership/publication retains scope_unavailable false/none. No automatic second read/retry. Prove an actual D1-backed HTTP processing request with one failing preparation read after successful admission and successful finalization, persisted retry metadata/replay; prove real missing publication/member still false/none after restoration. Do not alter owner decision A or public failure policy.
- Metadata projection: validate optional topics/aliases/descriptions as interpretation input before inclusion; omit invalid optional strings/entries, preserve valid title/aliases where possible and frozen entire allowlist. Actual D1-valid empty optional metadata must not veto a valid professional question. No publisher/frontmatter tightening or corpus edit.
- Preparation aggregate byte bound: reserve immutable current question plus required scope/policy envelope and necessary most-recent complete exchange first. Admit only whole optional metadata/older exchanges that fit both component and aggregate simulation limits; if indispensable base/context cannot fit, return conservative controlled clarification/limit, never invalid model-output diagnosis or question truncation. This is byte-bounded fixture preparation only, not 2.10 model-token/capacity acceptance.
- Direct corrections: require real string decision/scope enum; require each search term to yield encoder-compatible tokens; preserve current validated responseLanguage on structured continuation failures without language; include active configured output limits and accepted lexical grammar in trusted provider instructions. Preserve explicit declarations and existing fallback behavior.
- Tests: independent assertions protect sensitive/commitment/bypass, value-judgment redirect, catalog/history trust and current-language instructions; exact lexical-token 64/65 boundary; exact en/fr missing-context template text/language; malformed discriminator before persistence; every new regression through the appropriate unit and real-D1 routes. No schema success presented as model semantics.


Reason-code spellings, prompts and technical bounds are implementation-owned (spine final open decisions), not new product policies. Preserve the approved request/union meanings. Use a typed continuation seam for answer/redirect and scripted test continuation, not unfinished factual generation presented as operational. No migration is anticipated: existing unique answers, blocks and failure metadata already support these branches.

This story supplies bounded server context, not Story 2.10's full receiving-model tokenizer/history prioritization engine. Introduce a preparation port with explicit bounds; the local deterministic composition may conservatively select complete preceding exchanges within an explicit simulation byte-size bound (not an octets=tokens equivalence or proof of the real-model 3,000-token ceiling), anchored before the current message, excluding source attachments and later turns. Include the preceding pending question/clarification where available; if necessary context cannot fit, do not silently pretend it exists. Document this conservative simulation boundary, and preserve a seam for 2.10 rather than advertising full follow-up acceptance. Catalog projection is deterministic, metadata-only and bounded; eligibility remains the entire frozen allowlist even when interpretation metadata is limited.

Supervisor clarified the deadline dependency against original Story 2.13: the approved 30-second total attempt, included 5-second classifier ceiling and finalization reserve are implemented/verified by 2.13. Story 2.9 preserves an orchestration/cancellation seam, not a complete deadline engine or operational timing claim. Values remain mandatory for the operational version; no additive 5+30 budget, retry, new usage policy or proven remote cancellation is inferred. Existing lease/finalization/replay fencing remains active and tested. Current composition stays deterministic and production unconfigured.

No irreversible operation is proposed: additive source/tests/docs only, disposable runtime writes, no schema/operator activation. Estimated footprint is 12–18 files, including classifier types, processor integration and test fixtures, one cohesive goal. Exact copy/model semantics remain human/evaluation gates, not new invented acceptance.

## Verification

Run `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`, focused new Vitest and real-D1/Chromium classifier tests, and `git diff --check`. Personally inspect full baseline diff, all tasks/ACs/matrix rows. Execute every rendered fresh independent review layer, triage each finding and rerun targeted/full checks after fixes. Record exact commands, output paths, reviewed baseline, retained findings and limitations here. Only after passing, make a conventional local commit including normal tracking; verify branch/full HEAD/ancestry/clean tree and index and baseline diff. Obtain explicit parent final technical advancement; never advance queue or claim BC acceptance.


### Authorized fallback implementation evidence — 2026-11-19

This is the single authorized same-role native fallback recovery, not a retained
resume or new implementation. The partial source/tests and coordinator-owned
spec/sprint edits were preserved. The complete approved spec, all four direct
frontmatter context files and `/tmp/story-2-9-implementation.implement-2-9.json`
were read before editing. Baseline/HEAD remains
`e028dabc2b9ee043bb484bae8ed8e14dffbb2005` on `work/epic-2-through-2-11`.
The original report and both `/tmp/story-2-9-interrupted-{tracked,untracked}.patch`
files are unchanged (SHA-256 checked before and after verification).

The existing implementation supplies exact request/four-branch types, owned
reason matrix, shared normalized language checks, dense structural/byte bounds,
lexical safety and configured forbidden-output checks; once-only classification
with trusted policy separate from serialized untrusted data; server-only anchored
context and eligible metadata projection; direct canonical results and typed
answer/redirect continuation; explicit scripted provider and actual D1/HTTP/
Chromium coverage. The default production composition remains unconfigured.

Recovery changes completed the approved orchestration-owned optional AbortSignal
seam across processor, classifier/provider and continuation, without introducing
any deadline engine or operational timing claim. Tests prove no provider call
for already-cancelled work, no continuation for a late classifier completion,
and no cancellation metadata in model data. Story 2.13 still owns the mandatory
30-second total/5-second included classifier/finalization-reserve orchestration.
Existing lease/finalization fences remain active; no remote-stop guarantee.

One observed defect was corrected: controlled fallback/finalization language was
still taken from the earlier pre-admission snapshot rather than the refreshed,
anchored server context. It now uses the same preceding-only context as the
classifier. Added tests exercise a changed post-admission snapshot, exclusion of
later turns and explicit missing-anchor handling. Additional tests cover every
invalid branch/reason pairing and exact history/catalog/metadata/alias/question
component bounds. No original assertion was weakened. Application documentation
now records reproducible checks, simulation bounds, later seams and human gates.

#### Complete current verification

All commands below ran with `functions.bash` timeout **1200 seconds**; the full
chain exited 0. No runtime/tool failure or failed test occurred in this fallback
run. The previous partial worker's corrected fixture SQL error and incomplete
verification remain historical evidence above, not current full-suite proof.

| Command | Result / full log |
| --- | --- |
| `npm run typecheck && npx vitest run tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts` | Four typechecks and 157 then-current focused cases pass; `/tmp/story-2-9-fallback-focused.log`. Later two additional bound/reason tests are covered by the full run below. |
| `npm run typecheck` | All four configurations pass in `/tmp/story-2-9-fallback-full-verification.log`. |
| `npm test` | All 45 workstation fixtures and **628 Vitest cases across 15 files** pass in the full log. |
| `npm run build` | Frontend and Worker dry-run builds pass; no deployment. |
| `npm run test:smoke` | Six simulations and **all 42 Playwright cases** pass, no skips; includes original result regressions and new classifier runtime. |
| `npx vitest run tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts` | **159 focused cases** pass after all source/test changes. |
| `npx playwright test conversations.spec.ts -g 'real D1 professional intent'` | One actual shared-D1/independent-Worker/HTTP/Chromium case passes again after the full smoke suite. |
| `git diff --check && test -z "$(git diff --cached --name-only)"` | Whitespace and empty index pass; no staging or commit. |

Exact full-chain command, with pipefail and complete combined stdout/stderr:

```bash
set -o pipefail; { npm run typecheck && npm test && npm run build && npm run test:smoke && npx vitest run tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts && npx playwright test conversations.spec.ts -g 'real D1 professional intent' && git diff --check && test -z "$(git diff --cached --name-only)" && echo STORY_2_9_FALLBACK_FULL_CHAIN_PASSED; } 2>&1 | tee /tmp/story-2-9-fallback-full-verification.log
```

The explicit `STORY_2_9_FALLBACK_FULL_CHAIN_PASSED` marker is present. Final edits
after this chain are documentation/tracking/evidence only. All implementation/test
baseline changes were inspected in the 949-line
`/tmp/story-2-9-fallback-code-diff.patch`; documentation changes were inspected
separately. No schema change, operator migration, config/harness change, private
corpus read, operator server/storage change, remote Git, paid/live provider call,
stage, commit or review launch was performed.
Existing publication/retrieval fixtures use local-only Git copies as before.

#### Task / original AC / matrix traceability

All seven execution tasks are delivered for coordinator inspection, not accepted
by independent reviewers or BC. Spec status remains in-progress under coordinator
ownership; sprint is review pending independent reviews and BC inspection.

- AC1: exact branch/reason/schema/language, once-only provider, scoped metadata,
  post-admission same-Conversation context and omission of chunks/IDs/credentials
  are covered by professional-intent units and real runtime prompt inspection.
- AC2: answer/redirect retain topic, standalone question, safe terms, decision,
  reason and entire admitted allowlist. Units check literal FTS encoding; the
  disposable continuation performs actual scoped D1 FTS and includes the scripted
  value-judgment boundary. No actual-model semantic capability is claimed.
- AC3: trusted policy expresses sensitive/commitment/bypass boundaries without
  unsupported direct assertions, negotiation, promises or invented exceptions.
  Owned reason/branch pairs, forbidden patterns and injection-data isolation are
  tested mechanically; real-model/human semantic acceptance remains required.
- AC4: exact direct clarification/refusal text, normalized declared language,
  status/kind and empty sources persist through real POST/GET/replay. Call counters
  prove no retrieval/second generation for direct results; malformed output and
  provider errors take safe technical paths, not an added business branch.
- AC5: all branches plus hostile question/history/catalog fixtures preserve the
  constant policy and scope. Documentation explicitly separates deterministic
  routing/persistence from actual semantic, language or BC acceptance.

Matrix coverage: answer/redirect and prohibited-topic branches (units/runtime);
material ambiguity/direct clarification (units/runtime); malformed schema, reason,
tag, bounds, Unicode, sparse arrays, lexical syntax and markers (units plus
runtime mixed-branch failure); dependency/unknown-persistence failure (both);
injected question/history/catalog and excluded attachments (both); absent or
nonfitting context/catalog without question truncation (units and interrupted
predecessor runtime); cap/lost receipt/disabled processor replay without another
call/turn (runtime); cross-Conversation isolation, withdrawal false/none after
restoration and stale finalization fences (runtime plus retained result suite).

Residual limits: byte-bounded local simulation does not implement the receiving
model's 3,000-token/component/total-capacity budget (2.10), full root retry/recovery,
real provider or factual generation. No operational deadline guarantee (2.13).
A05/A08 remain unresolved later gates. Whole-publication reads and inherited
ingress/graph/preflight scale costs are unmeasured. Deterministic success is not
actual-model safety/language, privacy, accessibility, release or BC acceptance.
Coordinator inspection and fresh independent reviews are the next gate; this
worker neither launches them nor advances the story chain.

### Re-derived implementation evidence — 2026-11-19

Current pass supersedes the earlier 628-unit evidence. The complete spec and all
four frontmatter context files were read before implementation. HEAD remains
`e028dabc2b9ee043bb484bae8ed8e14dffbb2005`; the authorized recovery patch supplied
retained classifier/routing/persistence tests, then all amended requirements were
implemented. Frozen intent and coordinator-owned staged spec/sprint were preserved;
no staging, unstaging or commit occurred. Sprint remains review, not BC accepted.

- B1/F1/E1 and B2/F2: real-string decision/scope validation rejects enum coercion.
  Actual HTTP array-discriminator output persists only controlled invalid_result,
  with no continuation/retrieval and identical GET/replay.
- B3/F3: unrepresentable current/necessary historical text takes controlled
  clarification without truncation or a new admission policy. Older unusable
  exchanges stop selection after a usable recent pair. Actual en/fr HTTP sequences
  admit control text, ask again on the first clean question, then recover on the
  next clean reply without reimporting poisoned history.
- B4/F5: D1's processing read distinguishes failed storage batches from confirmed
  unavailable/incoherent publication, while old health/admission/search readers
  still fail closed. A disposable HTTP fixture injects one actual failing D1
  preparation batch after successful admission; finalization succeeds, preserving
  processing_unavailable true/new_request on GET/replay. Real missing publication
  and missing membership remain scope_unavailable false/none after restoration.
  Read counters prove one preparation read and no automatic retry.
- B5/F4/E2: projection omits invalid optional metadata strings/entries, retaining
  usable titles/aliases without changing the allowlist. Actual D1-valid empty
  topics/aliases do not veto classification or scoped evidence continuation.
- B6/F6/E3 and F10: each term must yield a lexical token; exact 64/65 token tests
  and combining-mark-only terms reject invalid output without continuation. Real
  HTTP tests persist/replay the safe failure for zero-token/65-token drafts.
- B7/F7: structured continuation failures lacking language inherit the current
  validated declaration, matching thrown failures; explicit declarations and
  existing supported-language fallback are unchanged. HTTP verifies saved en text.
- B8/F8 and F9: trusted instructions expose active configured output limits and
  accepted lexical grammar. Independent assertions protect sensitive, commitment,
  bypass, value-judgment, catalog/history trust and current-language instructions,
  not merely equality to an exported constant. This is not model-semantic proof.
- B9 and V1: preparation reserves the immutable question/scope/language envelope
  and necessary complete recent exchange before optional older exchanges/catalog.
  Exact aggregate/component bounds are exercised by units and HTTP, with no
  question truncation or optional-metadata invalid_result. Exact en/fr missing-
  context text/language and zero provider/continuation calls are asserted.

All seven execution tasks, original AC1–5 and all nine matrix rows were inspected
against the retained and added tests. The final implementation/test/development
baseline diff is `/tmp/story-2-9-rederive-code-diff.patch` (1,420 lines). Scope stays
at portable deterministic classification/direct persistence with a typed factual
continuation seam; production remains unconfigured. No selected admission, live
provider, factual generator, UI, retry engine, schema/operator migration, private
corpus read, configuration/harness edit, deployment or remote Git was introduced.

#### Current verification

Full chain below ran through `functions.bash` with outer timeout **1200 seconds**
and exited 0, with marker `STORY_2_9_REDERIVE_FULL_CHAIN_PASSED` in
`/tmp/story-2-9-rederive-full-verification.log`:

```bash
set -o pipefail; { npm run typecheck && npm test && npm run build && npm run test:smoke && npx vitest run tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts && npx playwright test conversations.spec.ts -g 'real D1 professional intent' && git diff --check && git diff --cached --check && git diff --cached --binary > /tmp/story-2-9-rederive-index-after.patch && cmp /tmp/story-2-9-rederive-coordinator-index.patch /tmp/story-2-9-rederive-index-after.patch && echo STORY_2_9_REDERIVE_FULL_CHAIN_PASSED; } 2>&1 | tee /tmp/story-2-9-rederive-full-verification.log
```

Results: all four typechecks; 45 workstation fixtures; **641 Vitest cases across
15 files**; frontend and Worker dry-run builds; six simulations; **42 Playwright
cases**, no skips; then 172 focused unit cases and the real D1/Chromium classifier
case again. Whitespace checks pass. Byte-for-byte index comparison proves only
pre-existing coordinator staging remains; the index is intentionally not empty.
The coordinator's sprint comment still contains historical 628-unit evidence;
this entry is the current verification, without editing their staged annotation.

Earlier targeted checks are `/tmp/story-2-9-rederive-focused.log` (four typechecks,
172 focused cases) and `/tmp/story-2-9-rederive-d1-final.log` (real D1/Chromium pass).
Ordinary correctable local failures: an initial typecheck exposed that existing
SubmittedScope admits global mode only (`Property 'name' does not exist on type
'never'`, likewise resourceId/documentIds); speculative selected-member traversal
was removed rather than widening admission. The first D1 run expected the wrong
existing controlled copy (`temporarily` instead of `currently`); corrected the
assertion to exact existing copy, not production behavior. Its complete failure
log remains `/tmp/story-2-9-rederive-d1.log`. No genuine runtime/tool failure or
alternate mechanism occurred. Post-chain edits are evidence documentation only.

Limits remain explicit: these are byte-bounded simulation fixtures, not receiving-
model 3,000-token/component/total-capacity accounting (2.10), or operational
30-second/5-second deadline orchestration (2.13). A05/A08, real model semantics and
actual language, privacy/accessibility/release and BC acceptance remain later
owner gates. Whole-publication and inherited ingress/graph/preflight scale costs
remain unmeasured. Fresh independent reviews and coordinator technical acceptance
remain required; no next story was started.

### Final technical handoff — 2026-11-19

**Verified by the agent:** two complete fresh three-layer reviews (initial incomplete blind replaced only after authorized rejected resume), one specification-driven re-derivation and every retained correction completed. Full final checks pass as recorded above on host Node, disposable local D1/workerd and actual Chromium with scripted LLMProvider. No live model or hosted behavior was tested. All five original ACs are technically exercised; semantic/product acceptance remains separate. Final baseline diff is `/tmp/story-2-9-final-diff.patch`; post-commit full verification will be recorded at `/tmp/story-2-9-postcommit-verification.log`, not assumed from pre-commit success.

**What to test:** with installed locked dependencies/Chromium, run `npx vitest run tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts` and `npx playwright test conversations.spec.ts -g 'real D1 professional intent'`. These use disposable synthetic runtime data, not operator D1; do not apply migrations to operator storage. Observe each classifier branch, current language and exact direct text/no sources, typed professional redirect with actual scoped FTS fixture, malformed output and dependency failure, canonical POST/GET/replay with no extra call/turn, capped/lost-receipt replay, isolated prompts, optional/mixed-resource metadata filtering, bounded missing-context recovery, scope withdrawal false/none after restoration and stale finalization. Repeat the full npm chain for regressions. No chat UI/responsive/accessibility acceptance is claimed: Chromium tests the delivered HTTP protocol. Production processor remains deliberately unconfigured.

**Remaining work:** no retained 2.9 technical blocker or new deferred item. Prior ingress/publication/graph/preflight scaling risks remain unmeasured. Real receiving-model budgets (2.10), generation (2.11), live provider/A05 (2.12), deadlines/A08 (2.13), actual-model evaluation, UI, purge, privacy and release are later work, not delivered capabilities. BC human/product acceptance remains pending; sprint stays review.

**Next action:** supervisor independently inspects the local commit and committed-revision verification then grants or denies technical advancement; only the outer supervisor starts another story. BC may run the documented developer journey and report observed discrepancies before separate product acceptance. No push/deployment/live call is authorized. `done` denotes completed technical workflow, never BC acceptance or automatic advancement.
