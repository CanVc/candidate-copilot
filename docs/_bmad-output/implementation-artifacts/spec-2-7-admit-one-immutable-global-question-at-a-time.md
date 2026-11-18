---
title: 'Story 2.7: admit one immutable global question at a time'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
baseline_commit: '9177f84c859e5687795f86f2c9e8eb634ecb1022'
review_loop_iteration: 0
context:
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/epics.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/implementation-artifacts/spec-2-6-enforce-fair-and-private-conversation-creation-limits.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Conversation identity exists, but no authoritative admission protects a question against duplicate sends, competing attempts or publication changes.

**Approach:** Implement global direct admission and explicit same-ID recovery in the portable application service and real D1, preserving exact identity, documentary membership and one fenced lease. This is Story 2.7 only, in the accepted controlled-development boundary.

## Boundaries & Constraints

**Always:** Preserve all original ACs in `../planning-artifacts/epics.md:961–992`, Runtime Contracts §§1/3/4/6/7 and architecture AD-15–18. Authenticate before saved-request lookup; recheck existence/retention at mutation. Persist exact untrimmed text, canonical identity, version-1 scope, context anchor, turn accounting and fresh server attempt ownership atomically. Global scope has `resources: []` and all active document IDs, including zero-chunk documents, in a nonempty frozen allowlist. Saved identity wins over live-catalog validation. Initial configurable limits: 1,000 Unicode code points, 20 admitted messages, 40-second lease. CR and LF each count once, astral characters once, combining characters separately; no normalization/truncation. Shared counter is reusable by the later browser. Same-ID recovery is explicit, never automatic, preserves original anchor/scope/count and cannot steal another active lease. Scope availability is checked before evidence processing; missing members never narrow or broaden scope. Reads remain no-store and authoritative, without exposing attempt IDs. Existing creation limits/privacy controls remain unchanged.

**Never:** Add result/answer tables or independent completion flags, public POST admission acknowledgments masquerading as canonical results, model/provider calls, selected-resource admission, new-ID technical retry, UI or queue. Normalized Resource sets/body variants still participate in identity validation/conflict tests; unsupported new variants reject without admission. Do not invent sensitive-input/provider policy (A05), extra execution quotas (A08), or claim retention deletion from access expiry. Physical purge/cutoff integration, results and UI remain their assigned later stories. No private content/secrets inspection, operator migrations/storage/server changes, remote Git/push/deploy, paid services, harness/skill/configuration changes or unrelated edits. Disposable D1/browser fixtures only. One writer; fresh read-only reviewers at inherited model capability. Children must not invoke bmad-build recursively. Runtime/tool failures stop with exact state; no alternate agent execution. Technical completion/approval is not BC human/product acceptance.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| Valid global direct request | One exact message/scope/count and fresh internal attempt lease |
| Same ID, same body, live lease | `request_in_progress`; no write/count |
| Same ID, changed text/catalog/resource set/body variant | `request_conflict`; no write/count |
| Different ID while lease active | `conversation_busy`; no queue/message |
| Expired owner, explicit same-ID recovery | Original scope/anchor/message/count, new fenced attempt |
| Expired old request, distinct new question | New normal counted admission; old message unchanged |
| Recovery while newer owner active or cap reached | Busy protects owner; cap alone does not block recovery |
| Stale/absent/empty/corrupt publication | No new admission; never unrestricted scope |
| Publication A/B race or withdrawn member | Coherent guarded membership; recovery never remaps |
| Invalid/overlength/unauthorized/expired input or rollback | Safe failure; no partial writes/count or identity leak |

</frozen-after-approval>

## Code Map

- `src/application/conversations.ts`, `src/ports/ConversationStore.ts`, `src/adapters/d1/conversations.ts` — creation/authentication; current read hardcodes empty/idle, extend without touching creation policy.
- `src/shared/conversation.ts`, `src/shared/public-catalog.ts` — reusable strict shapes, sorted unique case-sensitive IDs and safe errors.
- `src/ports/ResourceCatalog.ts`, `src/adapters/d1/publication.ts` — coherent validated publication read; a separate read alone cannot guard subsequent admission.
- `migrations/0001*`–`0004*` — preserve existing schema; add only message/snapshot/lease structures in 0005.
- `tests/bootstrap/conversations.test.ts`, `tests/e2e/conversations-{worker.ts,runtime.mjs,spec.ts}`, `tests/e2e/local-fixture.ts` — existing auth, two-Worker/shared-D1 and Chromium fixtures; extend disposable composition, not operator state.
- `tests/e2e/d1.spec.ts` — additive migration inventory/rollback assertions.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/conversation.ts` (or dedicated shared admission module) — strict request variants, normalized identity/scope types, common character counting and safe outcomes.
- [x] `src/application/conversation-admission.ts`, `src/ports/ConversationStore.ts` — authenticate, validate/admit/recover through one atomic port; explicit configuration and preserved context anchor.
- [x] `migrations/0005_conversation_admission.sql`, `src/adapters/d1/conversations.ts` — unique conversation/request messages, immutable snapshots and fenced leases; guarded publication admission/recovery, atomic count/rollback.
- [x] `src/application/conversations.ts`, `src/shared/conversation.ts`, `src/worker/index.ts` as needed — truthful authenticated transcript/in-progress/interrupted/admission state without exposing a premature POST protocol.
- [x] `tests/bootstrap/conversation-admission.test.ts` — all matrix rows, Unicode/line-ending boundaries, configuration, authentication order and rejection/no-count.
- [x] `tests/e2e/conversations-*`, `tests/e2e/d1.spec.ts` and focused admission runtime files as needed — real D1 independent-instance races, rollback, A/B publication guards, deleted/expired fencing, recovery/cap/old-message preservation; browser authenticated-read regression.
- [x] `docs/development/application.md`, `migrations/README.md`, this spec, `sprint-status.yaml` — reproducible evidence and limitations, sprint review pending BC.

**Acceptance Criteria (complete original traceability):**
- AC1: Given authenticated direct global input, when admitted, then exact text, normalized identity, version-1 global scope with empty resources/nonempty all-active-document allowlist, fresh lease and turn accounting commit atomically; migration adds only required message/snapshot/lease structures (FR-6, AR12/23).
- AC2: Given configurable initial limits and shared counting, when checking accented/astral Unicode and line endings, then exactly 1,000 is allowed, longer rejects unchanged, at most 20 unique messages admit, and rejection/read/same-ID recovery or future replay never consumes another turn (NFR4/5).
- AC3: Given concurrent or existing requests, when identity is submitted, then tests distinguish in-progress/busy/changed-identity conflict without queue/duplicates; text/catalog/body variant are immutable and reordered duplicate Resource IDs normalize as sets (AR22/23).
- AC4: Given publication racing admission, when scope resolves, then catalog identity, registry and message/lease write are coherently A or B; stale/absent publication rejects before admission, never unrestricted scope (AR10/11).
- AC5: Given interrupted expired work and no active owner, when explicitly recovering or deliberately sending a distinct question, then recovery preserves original scope/message/count while the new question counts normally and leaves old work intact; application-service tests prove this without later model/UI functionality (AR23).

## Implementation Notes

- Implemented on `9177f84c859e5687795f86f2c9e8eb634ecb1022`. All frontmatter context files were loaded fully before changes. No operator migration/storage/server changes, private content/secret inspection, dependency/config/harness change, deployment, push or live model call. Pre-existing spec/sprint changes were preserved.
- Shared admission module defines exact variants, canonical identity, global scope, safe internal errors and the reusable Unicode-code-point counter. Portable `admitConversationQuestion` authenticates first, distinguishes submit from explicit recovery, preserves self context anchors and accepts explicit initial-limit overrides.
- 0005 adds immutable messages and one deferred-FK fenced lease, without results/completion flags or live-publication FKs. D1 rechecks access, identity, owner/count and full validated publication state in the mutation batch. The unique-message count, message/snapshot, lease and modified timestamp commit/roll back together. Interrupted duplicate races are reclassified inside the transaction rather than falsely reporting an active owner or recovering automatically.
- GET reconstructs actual ordered messages/scopes and active/interrupted/admissibility state, no attempt IDs/identity/hash. Publication failure does not hide saved history. Production message POST remains absent; test-only transports expose acquisition only inside disposable composition.
- Creation limits/privacy controls are unchanged. Physical purge/cutoffs, answers/finalization, selected admission, provider policy/usage and UI are not implemented or claimed. Full-publication guard cost on large corpora remains unmeasured.
- Implementation is ready for coordinator-owned independent review. No worker staging/commit, human acceptance or supervisor advancement is claimed; sprint is review pending those gates.

- Coordinator read the entire 1,368-line baseline diff `/tmp/story-2-7-diff-3gJ4wZ.patch`, independently checked every task/AC and all ten matrix rows against executed tests, and reran `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && git diff --cached --check`: four typechecks, 45 workstation fixtures, 460 Vitest cases, both builds, six simulations and all 40 Playwright tests passed without skips. Full output `/tmp/story-2-7-coordinator-verification.log`. Staging is coordinator-owned for diff review, not a worker commit. Publication/membership and real Chromium proofs remain local/development only.

## Spec Change Log

## Review Triage Log

### Independent pass 1

All three fresh inherited-model reviewers launched together in one synchronous native `runs.all` call before collection/triage. Blind `d21c23c3-e2cb-4923-9cba-7ca0a7fb2d2c` computed 109.497 kB, N=10 and returned ten findings; edge `36ece86e-0d2f-4b2f-9920-d08bfc84550c` returned one; verification `6ae03006-82d6-435d-a28b-d76587fdbb34` returned three pre-verified gaps. No layer skipped or alternative runtime used. Reviewed diff `/tmp/story-2-7-diff-3gJ4wZ.patch`.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| B1 | low / patch | Coordinator Node probe confirms blank changed text is rejected by normalization before saved equality. Move only blank eligibility to the existing new-message checks, retaining malformed shape/Unicode rejection and adding saved-ID regression; direct relocation, no new surface. |
| B2 | medium / patch | Coordinator service interleaving probe confirms another same-ID owner can commit during catalog lookup and the later missing-publication error bypasses saved state. Reuse authoritative saved-state precedence once before returning publication rejection; no processing retry or public surface. |
| B3 | low / reject | Guard omits operational modified_at validity while pre-read checks it; manually corrupting only that field in the narrow validation/write window can admit otherwise coherent public membership. No incorrect evidence/identity follows. Unlikely everyday corruption requiring another guard/branch fails the low-unlikely complexity rule. |
| B4 | low / reject | Separate decision and mutation SQL clock evaluations can cross the exact retention deadline; mutation still refuses all writes and yields safe result_unavailable rather than neutral unavailable. A sub-transaction crossing after exactly 90 days is unlikely; fixing classification adds query/branch complexity with no retention bypass, so reject under low-unlikely rule. |
| B5 | false / reject | Only production ResourceCatalog is D1ResourceCatalog; its whole readBatch body catches failures and returns null. GET already returns saved history with null publication, tested on actual D1. A deliberately contract-breaking throwing mock does not demonstrate this outcome in any current caller. |
| B6 | low / patch | Coordinator delayed-catalog probe returns in_progress after clock reaches expiry. Move lease-status clock sampling after awaited reads and add focused regression; direct correction without new guard/state or public surface. |
| B7 | false / reject | No production admission endpoint/composition uses a nondefault config; public GET uses the same defaults. Internal read service already accepts matching explicit limits. The reported mismatch supplies different configuration to separate caller compositions, not a current divergent runtime path. Later POST composition must pass one effective config. |
| B8 | maybe-false / defer | Whole-publication payload duplication is real, but no actual D1 limit/latency failure was demonstrated at accepted corpus size. Potential medium-unverified load risk needs representative populated-corpus byte/latency/limit measurements before altering the coherent guard. |
| B9 | medium / patch | Every current admission D1 publication has zero chunks; populated chunk JSON/FTS positive path and text-only recovery are untested. Add real nonempty publication and corruption regressions, preserving zero-chunk inclusion. |
| B10 | low / patch | Rollback snapshots omit Conversation modified_at while claiming it. Extend existing snapshots/assertions to include that row and verify successful timestamp advancement; direct test correction. |
| E1 | low / reject | Same verified operational timestamp-only corruption as B3; no content/membership mismatch, rare injected corruption plus new guard complexity. |
| V1 | medium / patch | Pre-verified empty-chunk positive-path gap, same root cause as B9. |
| V2 | medium / patch | Pre-verified missing changed-body race after service validation; existing conflicts only exercise pre-read rejection. Add gated same-ID/different-text winner and unchanged lease/message assertions. |
| V3 | medium / patch | Pre-verified missing mixed interrupted/active transcript assertion; add authoritative GET statuses/request owner immediately after second admission. |

Grouping after individual verdicts: B9/V1 share the populated-publication test gap; all other retained patches have distinct roots. B8 alone is deferred unverified. No retained finding needs new policy, public surface or spec re-derivation; smallest fixes are direct relocations, authoritative rechecks of demonstrated states or focused test corrections.

All seven correction groups were applied by the original implementer, resumed as `2093acb1-4fe9-4c67-b73c-d22dc3a8c740`, and independently inspected in `/tmp/story-2-7-review-fixes.patch`. B1 moves blank eligibility without weakening shape/Unicode validation. B2 reuses saved-state precedence once for absent/empty/stale/withdrawn publication rejection without retrying processing. B6 samples lease time after awaits. B9/V1 now run populated chunk/FTS admission, text-update recovery and corruption races while retaining a zero-chunk member. B10 includes the full Conversation row, AFTER-update rollback and successful timestamp advancement. V2 proves changed-body conflicts at the atomic boundary with live and expired competing owners; V3 proves mixed interrupted/active transcript statuses. Focused worker output: 110 unit cases and the real-D1/Chromium case pass (`/tmp/story-2-7-review-focused-unit.log`, `/tmp/story-2-7-review-admission-d1.log`). Its generic acceptance rejected the pre-existing coordinator-staged files; these were preserved, not erased or falsely reported as an empty index. No retained correction remains unresolved.


Implementation validation corrections (not independent review findings):
- Typecheck exposed untyped D1 batch results and a mock-command callback; explicit result/command types corrected them without weakening checks.
- First real-D1 fixture run failed after ~3 seconds: `The Workers runtime canceled this request because it detected that your Worker's code had hung and would never generate a response`, followed by JSON parsing of that non-JSON error. Work paused and supervisor authorized same-runtime diagnosis/correction. Removing the test-only unresolved cross-request Promise and splitting **after application validation at the real atomic port** removed the failure; ordinary service calls remain uninstrumented, and actual D1 post-validation races/rollback remain asserted. Corrected log `/tmp/story-2-7-admission-d1.log` passes. The original error is retained here and in the tool transcript; that first temporary log was overwritten by the corrective run.
- Browser extension initially looked for Chromium in disposable XDG cache; `/tmp/story-2-7-admission-d1-browser.log` records the missing-executable failure. Work paused; supervisor approved resolving the existing installed executable in the parent before applying the child sandbox environment (no install/download/config/harness changes). That successfully launched Chromium; `/tmp/story-2-7-admission-d1-browser-corrected.log` then exposed `page.goto: url: expected string, got object`. Supervisor approved URL `.href` serialization and clarified ordinary local fixture/typecheck/API corrections may continue in the same runtime without repeated approval. Final D1+Chromium run passes at `/tmp/story-2-7-admission-d1-browser-final.log`.

## Design Notes

Use a validated publication plus equivalent atomic guarded snapshot, or resolve inside the admission transaction; do not assume pre-read coherence survives a write race. Recheck current identity and exact registry/mapping state at the write boundary; fail closed rather than silently retrying a changed publication. D1 batch owns all lease/message/count mutations and rollback. Deriving count from unique messages avoids redundant mutable accounting if practical. Persist no historical FK to live publication. No completed result exists yet; admitted messages remain interrupted after lease expiry until later result integration. Existing pending A05/A08/hosted/privacy gates do not authorize policy additions or impede this local no-model service slice.

## Verification

Run `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`, focused admission real-D1 tests, `git diff --check`. Record exact output/evidence paths and independently inspect full baseline diff against all five ACs and matrix rows. Execute every rendered fresh review layer, triage each finding, correct and rerun verification before conventional local commit. Prove real-D1 concurrency/rollback/publication coherence and actual browser read behavior, not just mocks. Preserve operator state/servers. Record limitations honestly; no model/hosted/BC acceptance inference. After commit require clean checkout/no staged files and explicit supervisor advancement acceptance with full baseline/commit hashes. Do not start another story.

### Implementation-worker verification

Required commands pass against the working tree based on the full baseline SHA above:

| Command | Evidence / result |
| --- | --- |
| `npm run typecheck` | `/tmp/story-2-7-typecheck.log`: all four TypeScript configurations pass |
| `npm test` | `/tmp/story-2-7-tests.log`: 45 workstation fixtures; 460 Vitest tests across 13 files |
| `npm run build` | `/tmp/story-2-7-build.log`: frontend and Worker dry-run pass; no deployment |
| `npm run test:smoke` | `/tmp/story-2-7-smoke.log`: six simulations and all 40 Playwright cases, no skips |
| `npx playwright test conversations.spec.ts -g 'real D1 global admission'` | `/tmp/story-2-7-admission-d1-browser-final.log`: shared-D1 independent Workers plus actual Chromium authoritative reads |
| `git diff --check`; `git diff --cached --name-only` | whitespace passes; index empty; implementation intentionally uncommitted for coordinator review |

AC1: exact persisted text/identity/global version-1 allowlist including zero-chunk documents, immutable self anchor, fresh owner, unique turn count and additive schema are asserted in portable tests and real D1. Fault injection at lease/message/Conversation mutation and recovery update proves rollback; DELETE cascades only Conversation-owned rows.

AC2: shared Unicode counting covers accented/astral/decomposed text and separate CR/LF, exactly 1,000 and overlength; configuration changes and real 20-message cap/last-slot race pass. Reads/rejections/interruption/explicit recovery preserve count and immutable old messages; recovery at cap succeeds.

AC3: two independent instances race same IDs and distinct IDs, exactly one admission; tests separate in-progress/busy/conflict for text/catalog/Resource set/body variant. Canonical duplicate/reordered Resource sets are tested without enabling selected admission. Authentication precedes saved lookup and live publication cannot override saved identity decisions.

AC4: validated snapshot/write guards cover catalog identity, complete Resources/mappings/document registry (not just chunks), chunk/FTS state. Controlled A→B between service validation and mutation rejects without partial state or automatic retry; explicit B admission uses B's full registry. Same-pointer metadata/map/label/FTS corruption, absent/empty publication and withdrawn frozen members fail closed. Historical scope is unchanged after publication changes/removal.

AC5: ordinary duplicate submission does not recover expired work, including a delayed duplicate race; explicit recovery uses the original message/scope/anchor/count and a new fenced owner. Distinct new work counts at a new position, leaves the old row unchanged and cannot be stolen by old recovery. Recovery/new-owner, deletion and exact retention-boundary mutation races are tested in real D1. Chromium GET proves active/interrupted states, no-store, unchanged snapshots and no attempt disclosure.

These implementation-worker checks prove only the controlled no-model service slice. They preceded the independent reviews and corrections above; the final coordinator checks below supersede their test totals. No technical completion is BC human/product acceptance; no next story has started.

### Orchestration interruption and authorized recovery

The native resumed correction run detached despite `async:false`. On supervisor-directed waiting yield, the output-schema runtime rejected the turn with: `You ended without calling structured_output. Call it now with your result. Do not repeat the work.` The coordinator returned an honest blocked report without commit or final acceptance and notified the supervisor. The supervisor later verified the original correction process completed with exit 0 and its lease released, then explicitly authorized one same-runtime recovery of this coordinator and its own dirty tree at post-fix verification. No renderer/reviews/stories were restarted, no alternate CLI used, and no competing writer was launched. Recovery rechecked the required branch and unchanged baseline, preserved index/unstaged changes, read the completed report and independently inspected all patches before proceeding.

### Final coordinator verification and developer handoff — 2026-11-19

After every retained correction, `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && git diff --cached --check` passed: four TypeScript configurations, 45 workstation fixtures, 469 Vitest cases across 13 files, frontend/Worker dry-run builds, six simulations and all 40 Playwright tests without skips. Exact output: `/tmp/story-2-7-final-verification.log`. Final baseline diff: `/tmp/story-2-7-final-diff.patch`. Tests used disposable local D1, independent workerd instances and actual Chromium; local Git source copies in fixtures are not remote operations. Operator storage/servers, private content, secrets and hosted resources remain untouched.

Every original AC and matrix row remains satisfied in the approved service-only development scope; populated publication, explicit recovery, exact text/count/scope, concurrent ownership/conflicts, atomic rollback, retention/deletion fencing and authoritative read evidence are concrete. B8 remains medium-unverified load assessment in `deferred-work.md`; rejected rare-low findings remain visible above. Results/model/UI/selected-resource admission and physical purge are future-story boundaries, not delivered here. Hosted/privacy/BC acceptance is not inferred.

Practical developer journey: run `npx vitest run tests/bootstrap/conversation-admission.test.ts`, then `npx playwright test conversations.spec.ts -g 'real D1 global admission'` from the locked development checkout with its existing installed Chromium. These create only disposable fixtures and exercise the internal service plus public authenticated GET, not a nonexistent message POST/UI. Observe one winner for same/distinct-ID races, conflict without mutation, 1,000-code-point and 20-turn limits, immutable original membership under publication change, original-ID recovery without another turn, and mixed interrupted/active states. Repeat the full chain above for regressions; no operator migration or server stop is authorized. Human usability/accessibility testing belongs to later UI stories. See `../../development/application.md#owner-verification-of-story-27`.

Spec done denotes reviewed implementation completion only; sprint remains review awaiting BC inspection. Local conventional commit and clean-checkout checks follow this entry; final advancement is owned by the supervisor using the actual full commit hash, not inferred from spec approval. The outer supervisor alone owns any next story.
