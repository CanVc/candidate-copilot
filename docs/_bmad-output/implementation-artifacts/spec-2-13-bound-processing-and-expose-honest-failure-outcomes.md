---
title: 'Story 2.13: bound processing and expose honest failure outcomes'
type: 'feature'
created: '2026-11-23'
status: 'in-progress'
baseline_commit: '7c73311eb9f7a39ca1094d906faffe39e3447096'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/_bmad-output/implementation-artifacts/epic-2-context.md'
  - 'docs/_bmad-output/planning-artifacts/reviews/open-acceptance-items.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** An acquired attempt can wait forever for storage or a model. Lease expiry prevents stale writes but is not a processing deadline. Losing a receipt does not mean processing failed.

**Approach:** Bound each local attempt from acquisition through confirmation. Stop derivative work at cutoff, cancel what can be cancelled, and report a terminal result only from confirmed persistence. Exercise timing and interrupted ownership without a real provider.

## Boundaries & Constraints

**Always:** Preserve authentication before replay, immutable request/context/scope, one logical turn per same ID, atomic guarded writes and access to authenticated reads, saved replay and privacy/deletion. Preserve existing retryability and A05. Simulation by default; dormant adapter only. Cancellation is not proof that remote work stopped.

**Never:** No automatic restart, retry, repair, failover, overage, A08 cap/cooldown/global budget, recovery endpoint, chat UI, model evaluation or BC decision. No operator services/storage, secrets, real calls or remote operations. No promotion of 2.12 or 2.13 to review/done on missing evidence.

## I/O & Edge-Case Matrix

| State | Local outcome |
| --- | --- |
| Acquired but acquisition receipt delayed | Time already elapsed is not granted again; no unowned work on lost receipt |
| Hung context, classification, retrieval or generation | Stop waiting even if signal ignored; no later stage or late success commit |
| Work deadline, time left to finalize | One controlled failure under same owner; release only as part of confirmed atomic result |
| Finalizer delayed/rejected or total exhausted | Unknown `result_unavailable`, no second write; subsequent authenticated replay returns only saved state |
| Expired owner / successor | Late settlement cannot write or clear successor; manual same-ID attempts not new logical turns |
| Browser wait elapsed | Transport uncertainty, not server failure or automatic resubmission |

</frozen-after-approval>

## Code Map

- `src/application/conversation-results.ts:submitConversationQuestion` authenticates and resolves saved/busy states before admission, then reads context, processes and awaits `store.finalize` without a shared deadline.
- `src/shared/conversation-admission.ts`, `src/adapters/d1/conversations.ts`: configured lease duration and acquisition expiry, D1 clock at acquisition; reuse atomic unexpired attempt guard, child graph and canonical readback. Do not retime admission based on receipt arrival.
- `src/application/{professional-intent-processor,classify-professional-intent,generate-answer}.ts`, `src/ports/ConversationProcessor.ts`: signal reaches provider calls but no enforceable classification ceiling or shared operation boundary. Keep receiver-specific budgeting and core-owned validation.
- `frontend/src` currently has bootstrap health only; configure the separate transport interval for future message POST without adding a composer or changing health. `tests/e2e/conversation-{admission,results}-runtime.mjs` already exercise lost receipts, interrupted admission and stale D1 owners.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/attempt-timing.ts`, `src/application/conversation-results.ts`, `src/worker/index.ts`: define validated configurable attempt, classifier, reserve and browser intervals distinct from lease; wire absolute acquisition-based cutoffs, injectable clock/timer, stage checks and bounded finalization including readback. Validate config before mutation. No timer/listener leak or unhandled late rejection.
- [x] `src/ports/ConversationProcessor.ts`, `src/application/{professional-intent-processor,classify-professional-intent,generate-answer}.ts`: enforce remaining wall time before/after operations, including preparation, actual dispatch, retrieval and validation. Abort classifier independently within remaining work, propagate outer cutoff, ignore late completions. Do not widen provider payloads or replace the persisted failure contract.
- [x] `tests/bootstrap/{conversation-results,professional-intent,answer-generation}.test.ts` and deadline-focused units: use deterministic time, stalled/ignoring receivers and exact cutoffs; assert calls, cancellation, controlled save vs uncertainty, accounting and matrix including delayed receipts. Reuse actual D1 admission/finalization regressions; extend `tests/e2e/conversation-results-runtime.mjs` where needed to bind orchestration to durable outcomes.
- [x] `docs/development/application.md`: explain timing, local vs remote evidence and the missing measurements/decision, with reproducible offline walkthrough. Track only this story in sprint/spec; no production telemetry or measurement invented.

**Acceptance Criteria:**
- Given a newly acquired attempt, when stages run, then the configurable initial 30 seconds includes the 5-second classifier ceiling and ~2-second finalization reserve. Neither the 40-second lease nor the 45-second browser transport wait adds processing time.
- Given timeout or controlled failure, when budget remains, then cancel where possible and attempt one atomic application-owned failure with stable code/retryability; without confirmation return `result_unavailable`, never a partial draft or invented terminal state.
- Given a stale worker or late provider, when finalization or release is attempted, then matching unexpired ownership is required; tests exercise interruption at admission, generation and finalization.
- Given actual usage measurements for admitted/interrupted/manual recovered executions, when BC/architecture decides A08, then record evidence and decision without assuming exactly one remote computation or changing access/counters without approval. This AC cannot be completed offline.

## Implementation Notes

Technical spec approved by supervisor. Include a finalizer whose D1 write succeeds but receipt misses the deadline: original POST unknown, authenticated read and replay canonical, one write only. No BC or live approval. Use source-only private isolated snapshots; never run tests directly on the operator host. Report any runtime incident with git/work state to coordinator before any retry, including tests. Sole writer; do not stage/commit, edit tracking, harness/skills, start another agent or access operator files. Coordinator handles full suite and review on fixed snapshots. For focused local checks use only approved tracked source sets, isolated as in inspected `/tmp/story-2-12-isolated-verify.sh` (its git archive needs the actual changed tree; do not run on stale HEAD or copy operator files). Use a private short mktemp outside the repo. No network except isolated loopback.

## Spec Change Log

## Review Triage Log

Fresh independent read-only reviews on delivery patch SHA256 `470ee376ba666491be3d2f34c77171e2031a44a170f6c341f61bfafd88e732e8`, separate from claims. Blind `0a1c82d9-f670-418d-893c-3644a8f3ed53`; edge `32d96c21-00da-4ced-869c-c6e267254154`; verification `05bb4c1e-8894-4525-9f89-50365195cc06`. Initial parallel wrapper rejected two unlaunched calls; after supervisor verified identical index/patch, one native runs.all delivered both without repeating blind. All reports collected before triage. Original implementation tree `4025367831980a0a12708ca78b512587c4719cf5` passed four typechecks, 45 workstation checks, 923 units, both builds, six simulations and 44 Playwright cases in isolation; log SHA256 `1a125ac9ff210cadcf4e76ca86af42afa580be419740f9b112cccae43bdcc65e`. No review-status promotion: AC4 remains unmet by explicit supervisor direction.

| Finding | Verdict, route and evidence |
| --- | --- |
| B1 | medium / patch. Receipt watchdog is discarded; SQL time ahead of local Date makes work/total deadlines too late. Retain the existing dispatch cutoff as a conservative upper bound, also for shorter leases. |
| B2 | medium / patch docs. A fake clock advancing within synchronous accounting cannot establish that a hosted Worker Date advances in that interval. State the observed-clock/event-loop limitation; do not infer live dispatch guarantees. |
| B3 | high / patch. D1 returns ConversationUnavailable when the authenticated parent disappears; finalizer blanket catch changes neutral access denial into 503. Preserve a timely authoritative denial, never retry/write again. |
| B4 | medium / patch. An accepted lease shorter than the reserve yields no work interval and can consume a turn. Cross-validate effective work before mutation on processing paths only. |
| B5 | medium / patch. Validated direct draft language is bypassed before the timeout callback; keep it for controlled failure. |
| B6 | medium / patch. The batch result is decoded inside readAdmissionState before the caller can check the clock. Pass the existing internal check to the owned read before decoding. |
| B7 | medium / patch. After publication, each optional metadata fit can start fresh receiver accounting without a clock check. Use the existing classification check between candidates, outside swallowed capacity errors. |
| B8 | medium / patch. Token-count deadline throws inside the invalid-draft catch; separate that check so the exported generator returns a technical timeout. |
| B9 | medium / patch. Late-receipt test compares two reads but never independently asserts the expected graph; add explicit block, excerpt and edge expectations. |
| B10 | medium / patch. Existing stale-owner test invokes finalize after replacement; additionally gate an already submitted batch until successor acquisition and verify no write/release. |
| E1 | medium / patch. No local upper bound survives the acquisition wait, so a future DB timestamp extends the derived interval. |
| E2 | medium / patch docs. The default Worker Date plus host timer only checks observable elapsed time. Manual deterministic timing cannot prove sub-event clock advancement. |
| E3 | medium / patch. Delayed post-acquisition D1 snapshot can reconstruct stale history after deadline; check before reconstruction. |
| E4 | medium / patch. Direct classifier output does not notify the current-language callback before returning. |
| E5 | low / patch. The generation retrieval port permits signal-only controls; D1 unwraps only check. Honor already-aborted signals as well at D1 dispatch. |
| E6 | medium / patch. Admission wrapper checks before entering store.admit; D1 builds the SQL and bindings after that check before issuing its mutation. Reuse the existing receipt check at actual batch dispatch. |
| E7 | medium / patch. Effective lease <= reserve passes both independent validators; no usable work time remains. |
| E8 | low / patch. The manual timer retains fired callbacks in the map until promise cleanup. Delete before delivery to model one shot. |
| V1 | medium / patch tests. Existing fixture moves time after batch; removing pre-batch guard would not fail it. Exercise expiry in preparation with zero batch/answer. |
| V2 | medium / patch tests. Hanging tests replace the scheduler. Require the default host timer and a nondefault configured deadline to wake a stalled POST. |
| V3 | medium / patch tests. Seven-ms lease is tested in admission only. Exercise processing on both sides of shorter lease minus reserve. |
| V4 | medium / patch tests. Outer timer fires in existing nested test; use one millisecond remaining and undelivered timers to assert no classifier dispatch. |
| V5 | medium / patch. Counting fixture drops controls when forwarding generation search; pass both arguments and assert no D1 batch/generation on preparation cutoff. |
| V6 | medium / patch tests. Scripted receiver elapsed test does not hit Workers AI's binding check; use an expired check with live signal on both offline roles. |
| V7 | medium / patch. Timed-out canonical handling of a validated direct outcome falls back to prior language because capture is only on continuation branches. |

Common roots after individual verdicts: B1/E1, B2/E2, B4/E7, B5/E4/V7, B6/E3. Other findings address distinct boundaries or missing tests. All are direct corrections within existing configuration/control contracts, fixture assertions or documentation. No public API, product policy, new budget or real-provider guarantee is selected.

## Design Notes

No unresolved local intent choice or irreversible operation. A08 is an external acceptance dependency, not a local design choice. Backend deadlines bound observation and initiation, not preemption of synchronous JavaScript or already issued remote transactions. Keep the public Worker unconfigured; the browser transport contract is configuration, not a delivered UI.

## Verification

**Corrected checkpoint.** The retained writer completed the patches, 397 focused unit cases and both affected D1/Chromium journeys. Coordinator read the complete correction delta against the reviewed tree: SHA256 `fcab3d867607856519f003d66a4731c3fb81c2a9ea5c7b51b336aaab4fdce199`. Timing is conservative across the two clock domains. Timely authoritative access loss remains the neutral 401; late/indeterminate confirmation returns 503 without retrying. The storage fixture distinguishes zero dispatch, queued stale-owner rejection and successful atomic commit followed by a late receipt; authenticated GET and saved replay return the expected ordered graph without re-execution. All 25 triage entries addressed; no reviewer attestation to changes made after their reports.

**Independent full run after patches:** source tree `ace14486f086eee7d9737db7968ff7a259ab35c4`; `npm run typecheck && npm test && npm run build && npm run test:smoke` in `/tmp/sH5QsfHHe` with isolated PID/proc/network (loopback only), disposable HOME/storage, installed tools and synthetic/public inputs. Four typechecks, 45 workstation checks, **938 units**, both builds, six simulations, **44 Playwright tests** passed. Combined log SHA256 `5c15d1e32106d5d1e5a6d341f910d54ad4da10540a4bb1b0a8076ecff053a872`. Only this handoff/checklist changed afterward. For a technical walkthrough use the isolated commands in [application development](../../development/application.md#bounded-local-message-attempts-story-213-in-progress); inspect the 401/503 distinction, immutable turn count and stale lease assertions. The browser has a transport interval, not a chat UI.

**Unmet AC4:** no actual provider execution/cost measurements for admitted, interrupted or manually recovered work and no BC/architecture A08 decision. The tests establish local deadline, ownership, call initiation and persisted state, not remote settlement or cost. No new cap/cooldown, recovery service, live evaluation, product acceptance, UI or launch authorization. The 2.12 offline checkpoint and its target-account gate remain unchanged. Spec and sprint 2.13 stay `in-progress`; the local commit is a partial checkpoint only. Supervisor diff inspection and explicit technical transition are separate from BC acceptance.
