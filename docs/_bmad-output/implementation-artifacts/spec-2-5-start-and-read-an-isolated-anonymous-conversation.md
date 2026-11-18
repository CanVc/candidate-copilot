---
title: 'Story 2.5: start and read an isolated anonymous conversation'
type: 'feature'
created: '2026-11-18'
status: 'done'
baseline_commit: 'd39c16146c5592c96c7ad41c7105d36a2c7ff188'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Worker exposes health only; visitors cannot create or securely read an isolated anonymous Conversation.

**Approach:** Add portable creation/read policy, D1 persistence and the approved POST/GET routes with one-time opaque credentials and neutral access failures. Controlled local development only.

## Boundaries & Constraints

**Always:** Follow Runtime Contracts §4. Persist UUID, UTC timestamps and only an unpredictable token's hash. Authenticate before transcript/result lookup. Bind access to one Conversation; expire at creation plus exactly 90 × 24 hours. Use no-store for creation/read/errors. GET is read-only and independent of publication availability.

**Owner decisions (2026-11-18):** A07 — accept same-origin browser JSON only; reject missing/null/foreign Origin and contradictory Fetch Metadata before mutation. Headerless CLI clients are unsupported; forgeable headers are not authentication. A09 — a lost creation response requires an uncertainty notice and explicit fresh creation, potentially consuming another allowance; no unknown-token recovery or automatic creation/suggested-question carry/send. Exhausted allowance shows its authoritative resume time. Actual counter/UI integration remains 2.6/2.15; use controlled fixtures here without claiming those integrations.

**Never:** Put tokens in URLs, logs, health, prompts or exports; add accounts, listing/admin routes, durable browser credentials, automatic retries or implicit lost-token recovery. Implement neither 2.6 IP counters nor 2.7/2.8 admission/results. Alter no corpus, dependencies, old migrations, operator storage or running servers; no deployment/push.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| Accepted creation | Persist before returning exactly conversationId/sessionToken once |
| Correct Bearer credential | Return UUID and authoritative transcript/processing/admissibility; no token/hash/attempt owner |
| Missing/malformed/wrong/crossed credential or missing/deleted/expired record | Identical neutral 401 conversation_unavailable, no transcript leak |
| Immediately before/at 90-day deadline | Access before; neutral failure at/after |
| Rejected origin/content type | Reject before mutation/allowance consumption |
| Committed creation, lost response | Approved A09 path, never automatic creation/suggested-question submission |
| Dependency/internal failure | Redacted safe error; never assert that creation could not have committed |

</frozen-after-approval>

## Code Map

- `src/worker/index.ts`, `env.d.ts`, `wrangler.jsonc` — Hono health and existing DB binding; preserve health/local target.
- `src/application/retrieve-evidence.ts`, `src/ports/Retriever.ts` — portable boundary conventions.
- `src/adapters/d1/publication.ts` — bound-query patterns; publication is not authentication.
- `tests/bootstrap/health.test.ts` — worker.request/no-store patterns.
- `tests/e2e/local-fixture.ts`, `d1-runtime.mjs`, `retrieval-runtime.mjs` — isolated actual-D1/workerd lifecycle.
- `tests/e2e/d1.spec.ts` — exact table inventory/two-migration assertions need additive updates.
- `docs/_bmad-output/planning-artifacts/reviews/open-acceptance-items.md` — A07/A09 explicitly unresolved.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/conversation.ts`, `src/ports/ConversationStore.ts`, `src/ports/Clock.ts` — define creation/read/errors and injected time. Without an admitted-message writer, transcript is empty, processing explicitly idle and admission unavailable until 2.7, never falsely ready.
- [x] `migrations/0003_conversations.sql`, `src/adapters/d1/conversations.ts` — minimal identity/hash/timestamps and bound persistence/authenticated reads; no speculative message/answer schema.
- [x] `src/application/conversations.ts`, `src/worker/index.ts` — secure generation/hash, authentication/retention, approved policies and redacted HTTP composition.
- [x] `tests/bootstrap/conversations.test.ts` — matrix coverage, hash-only persistence, policy-before-mutation ordering, caching, forbidden routes/effects and redaction.
- [x] `tests/e2e/conversations-worker.ts`, `conversations-runtime.mjs`, `conversations.spec.ts`, `d1.spec.ts` — actual persistence, independent-reader isolation, expiry, read-only behavior, migration reruns/preservation and lost-response fixtures.
- [x] `docs/development/application.md`, `migrations/README.md`, acceptance register — chosen policies, verification and honest later-story/owner-acceptance limits.

**Acceptance Criteria:**
- Given two Conversations, when independent readers use correct/crossed credentials, then only correct pairs read their own state and inaccessible cases share one neutral failure.
- Given persisted creation without publication, when GET repeats, then unchanged authoritative empty transcript/idle/unavailable-admission state is returned without mutation or provider calls.
- Given owner policy choices, when origin/lost-response/exhausted-allowance/suggested-intent fixtures execute, then behavior matches them without automatic creation/submission or claimed counter/UI integration.

## Implementation Notes

- Clean main baseline; latest continuity is completed Story 2.4. Story key: 2-5-start-and-read-an-isolated-anonymous-conversation.
- Dispatch: new contracts/port/core/adapter/migration/routes and tests. No existing Conversation implementation.
- A07/A09 are resolved by BC's explicit A/A approval after explanation. No open intent gap; user requests uninterrupted completion until final inspection.
- Verify the local frontend proxy and use explicit trusted origin configuration, not arbitrary client forwarding headers. Record implementation-owned details without claiming a hosted security sign-off.
- Irreversibles: none outside disposable tests; no operator migration or external effects.
- Parent staged and read the complete 939-line baseline diff, including all new files. Independent rerun passed all four TypeScript configurations, 45 workstation fixtures, 380 Vitest tests, both builds, six simulation cases and all 38 Playwright cases (no skips), including real-D1 conversation, publication/retrieval and fixture-isolation controls. Whitespace check passed.
- Matrix audit: creation/persistence and credential-bound reads are covered by unit and real-D1 tests; neutral missing/malformed/crossed/deleted/expired access and exact 90-day boundary passed; policy rejection precedes mutations in unit and real-D1 snapshot checks; committed-but-lost creation and explicit fresh creation passed controlled fixtures; after-commit exception/redaction/log/no-retry assertions passed units and dependency-fault workerd checks. Controlled suggested-intent/exhaustion fixtures are not UI/counter integration evidence.
- Local origin is an explicit Wrangler variable preserved through Vite; the test-only Fetch Metadata injector compensates for Node transport rewriting, with observed-handler-header assertion. Production ignores fixture headers. Admission remains honestly unavailable; physical purge and hosted sign-off remain later work.
- All retained review corrections were applied by the same implementation worker. Parent read the complete 609-line follow-up diff and fixed a browser-test DOM typing issue by using a real HTML form/button, without changing TypeScript configuration. Final independent verification passed four typechecks, 397 Vitest tests, 45 workstation fixtures, both builds, six simulation tests and all 39 Playwright cases without skips, including checked-in-config Chromium creation/read and foreign-origin rejection.
- Matrix audit after patches retains every original passing row and adds declared/streaming 1,024-byte limits, deferred/unsuccessful writes, identical Bearer challenges, valid HTTP variants, absent/same-origin Fetch Metadata, HEAD no-access and executable controlled A09 transitions. No unresolved review finding or deferred work. Automated/agent completion does not imply BC acceptance.
- Workflow complete for implementation and agent review; spec done, sprint review pending BC inspection. Local conventional commit only, no push/deployment/operator migration. Practical verification handoff: ../../development/application.md#owner-verification-of-story-25.

## Spec Change Log

## Review Triage Log

### Pass 1

All three fresh layers completed before triage, at inherited model capability. Blind review delivered ten code/test findings (67.045 kB gives floor min(floor(sqrt(67.045) + 1), 10) = 9); its unavailable size tool does not invalidate the ten findings. Reviews inspected code/tests; full execution evidence is the independent parent run above. Every finding is recorded separately before grouping.

| ID | Verdict / route | Verified evidence |
| --- | --- | --- |
| B1 | medium / patch | Parent reproduced a 2 MiB whitespace-padded empty object returning 201 and writing a row. Bound the body before JSON buffering; test declared and streaming oversized inputs without persistence. |
| B2 | medium / patch | A09 fixture constructs entry/suggestedIntent directly and waits while no transition code can run. Replace with an executable controlled entry transition using creation/submission spies; retain explicit non-UI/non-counter limitation. |
| B3 | medium / patch | Fixture invents creation_allowance_exhausted and omits Retry-After despite Runtime §4 rate_limited contract. Use the canonical status/code/header and derive displayed resume time from fixture authority. |
| B4 | medium / patch | Ephemeral proxy test supplies a forged port-5173 Origin; it proves preservation but not browser acceptance. Add a real-browser request through the configured frontend/Worker, retaining existing isolated transport controls. |
| B5 | low / patch | Parent reproduced 401 with no challenge. RFC 9110 §15.5.2 requires WWW-Authenticate; add one identical Bearer challenge on every neutral 401 without existence hints. |
| B6 | low / patch | Parent reproduced a valid credential rejected with two Bearer separator spaces; generic HTTP credentials permit 1*SP. Direct regex correction plus a focused acceptance test. |
| B7 | low / patch | Parent reproduced quoted UTF-8 charset rejected with 415; RFC 9110 §5.6.6 makes quoted/token parameter values equivalent. Direct media-type correction and acceptance/rejection tests, not broader origins/content types. |
| B8 | low / patch | Creation tests resolve writes immediately; no assertion proves the response remains pending during persistence. Add a controlled unresolved write and rejection/resolve assertions. |
| B9 | low / patch | Adapter explicitly checks result.success but mocks only return true; add unsuccessful-result HTTP redaction/credential-absence coverage. |
| B10 | low / patch | HEAD override has no test. Assert 404/empty/no-store/no DB for valid and invalid credentials to prevent an implicit unauthenticated read alias. |
| E1 | medium / patch | Same demonstrated unbounded req.json buffering as B1; source confirms allocation precedes empty-object validation. |
| V1 | medium / patch | Pre-verified: absent Fetch Metadata and accepted same-origin mode have no positive regression. Add successful persisted-creation cases. |
| V2 | medium / patch | Pre-verified: all conversation fixtures replace the Wrangler origin binding; a bad checked-in value would pass. Add actual checked-in configuration plus real-browser creation/read coverage. |

B1/E1 share one buffering defect. Other findings remain distinct even where one test addresses multiple outcomes (B4/V2). All retained corrections are focused patches of demonstrated behavior or specific verification gaps, without a new feature, owner-policy choice or spec loopback. No deferred finding. All thirteen findings are fixed and verified in the final parent suite; no additional review pass or loopback was needed.

## Verification

- `npm run typecheck`, `npm test`, `npm run build`, `git diff --check` — pass.
- `npx playwright test conversations.spec.ts d1.spec.ts fixture-controls.spec.ts` — actual D1/workerd and isolation controls pass without skips.
- `npm run test:smoke` — attempt without disturbing occupied operator ports; report environmental gaps explicitly.
