---
title: 'Story 2.6: enforce fair and private conversation-creation limits'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
baseline_commit: '8eb77d13766f8a8793b2d6cae6efcb3b755428b1'
review_loop_iteration: 0
context:
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/epics.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md'
  - '/home/cabail/dev/candidate-copilot/docs/_bmad-output/implementation-artifacts/spec-2-5-start-and-read-an-isolated-anonymous-conversation.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Creation is unlimited, allowing shared free capacity to be exhausted. Visitors need fair creation limits without losing existing Conversation access.

**Approach:** Enforce a shared, atomic, temporary daily pseudonymous creation allowance at the existing creation boundary; document actual processing and cleanup honestly. This is Story 2.6 only, within accepted controlled-development scope.

## Boundaries & Constraints

**Always:** Preserve original Story 2.6 acceptance in `../planning-artifacts/epics.md:933–959`, Runtime Contracts §§4/6/9 and AD-16. Initial configurable threshold is 10 creations per trusted Cloudflare-derived IP per UTC day. Return safe `429 rate_limited` with authoritative `Retry-After` to the next UTC day. A07 origin/content/body rejection precedes allowance consumption. A09 lost creation remains uncertain and requires explicit fresh creation, possibly another allowance; never retry automatically. Preserve token hashing, authentication, no-store and read independence. Counter storage/cleanup is implementation-owned, but privacy/security policy gaps require owner authority. Daily pseudonyms remain personal-data processing, not anonymization.

**Technical checkpoint decisions:** Daily shared random key lifecycle and scheduled physical cleanup are authorized implementation details under Runtime §6/architecture's open-decision register, not a new BC policy. No indefinite root secret or cross-day linkage. Cleanup must run without traffic; scheduler failure is not permission to extend retention, and actual failure limitations must be stated. Local isolated fixtures may prove the trusted-address adapter contract, but cannot prove hosted ingress. Implement the intended Cloudflare path, fail safely without trusted configuration/provenance, and require topology verification before hosted activation. This is delegated technical approval only; human/privacy/production acceptance is not implied.

**Never:** Store raw IP, durable visitor fingerprints or IP-to-Conversation linkage in Conversation rows. Trust arbitrary forwarding headers. Add user tracking, paid products, UI/admission/results from later stories, private-corpus access, secret inspection, operator migrations/storage changes, deployment, push/remote Git operations, live model calls, server termination or harness/skill changes. Use disposable local D1/browser fixtures. One repository writer; fresh independent reviewers read-only at inherited model capability. No recursive bmad-build invocation in children. Runtime/tool failure stops work with exact evidence; no alternate agent CLI. Technical sign-off is not BC human/product acceptance.

## I/O & Edge-Case Matrix

| State | Expected result |
| --- | --- |
| Concurrent creations sharing address/day across Workers | At most configured threshold committed; credential returned only after persistence |
| Exhausted allowance | 429 rate_limited, next-UTC-day Retry-After, no Conversation mutation |
| Existing authenticated read after exhaustion | Unchanged readable state; no counter mutation |
| UTC rollover/shared corporate IP | New daily allowance; shared current-day cap; expired counters physically cleaned |
| Invalid origin/body or spoofed forwarding address | No bypass and no allowance consumption for rejected requests |
| Commit failure/lost response | Atomic rollback where confirmed; otherwise preserve uncertainty without retry |
| Counter processing/diagnostics | No raw-IP storage/logging or cross-day identifier; truthful retention limitations |

</frozen-after-approval>

## Code Map

- `src/worker/index.ts` — existing validated POST, blanket uncertain 503, authenticated GET; preserve rejection ordering.
- `src/application/conversations.ts`, `src/ports/ConversationStore.ts`, `src/adapters/d1/conversations.ts` — portable creation and currently unconditional INSERT; introduce atomic allowance plus creation, not separate commits.
- `src/ports/Clock.ts`, `src/shared/conversation.ts` — injected time and safe contracts.
- `src/adapters/d1/publication.ts` — reusable bound-query D1 batch pattern, never a creation dependency.
- `wrangler.jsonc`, `src/worker/env.d.ts`, `.dev.vars.example` — local target/config boundary; do not inspect operator secrets.
- `tests/bootstrap/conversations.test.ts`, `tests/e2e/conversations-{worker.ts,runtime.mjs,spec.ts}` — existing origin, independent-Worker/shared-D1, uncertainty and browser fixtures.
- `tests/e2e/d1.spec.ts`, `tests/e2e/local-fixture.ts` — additive migration/table expectations and disposable lifecycle.
- Previous done spec `spec-2-5-start-and-read-an-isolated-anonymous-conversation.md` — accepted identity/read continuity, not implemented counter proof.

## Tasks & Acceptance

**Execution:**
- [x] `src/ports/ConversationStore.ts`, `src/application/conversations.ts`, `src/shared/conversation.ts` — model allowance outcome and UTC/config policy without weakening reads.
- [x] `migrations/0004_conversation_creation_limits.sql`, `src/adapters/d1/conversations.ts` — isolated temporary counter schema, atomic capped increment/conditional creation, rollback and cleanup; no Conversation linkage.
- [x] `src/worker/index.ts`, `wrangler.jsonc`, `src/worker/env.d.ts` — trusted-address composition, safe 429/Retry-After, secret-safe configuration and cleanup entry point within approved boundary.
- [x] `tests/bootstrap/conversation-creation-limits.test.ts` — deterministic matrix, configuration, normalization, privacy, rejection ordering and redaction.
- [x] `tests/e2e/conversations-runtime.mjs`, `tests/e2e/conversations.spec.ts`, `tests/e2e/d1.spec.ts` — real-D1 concurrency across instances, persistence/rollback, physical expiry, midnight/config/shared-IP cases and browser regression.
- [x] `docs/development/application.md`, `migrations/README.md`, this spec and `sprint-status.yaml` — actual data handling, limitations, evidence and review tracking without BC acceptance claims.

**Acceptance Criteria (original traceability):**
- AC1: Given a trusted Cloudflare-derived address, when creations race across Workers, then a shared temporary pseudonymous counter atomically permits at most configurable initial 10 per UTC day and arbitrary IP headers cannot bypass it (NFR6/AR30).
- AC2: Given exhaustion, when creating again, then safe 429 rate_limited supplies Retry-After until next UTC day while existing reads/authenticated controls remain available (AR28).
- AC3: Given UTC rollover, expiry and shared corporate IP, when clock/concurrency/config tests run, then allowance resets, obsolete counters expire after their useful window and threshold is respected without raw IP, durable fingerprint or IP-to-Conversation linkage in Conversation rows (NFR18).
- AC4: Given the chosen mechanism, when documenting handling, then pseudonymization is not called anonymization, actual temporary processing/retention informs privacy copy and configured logs avoid unnecessary raw-IP retention (FR-16/AR30).

## Implementation Notes

- Implemented on baseline `8eb77d13766f8a8793b2d6cae6efcb3b755428b1`, with no operator migration/storage changes, deployment, push, dependency, corpus or harness edits. Existing supervisor changes to `epic-2-context.md` are untouched.
- Shared types/port now expose the daily key and atomic allowance outcome. Core derives domain-separated HMAC pseudonyms, validates the configurable positive threshold and preserves credential hashing/read behavior. The Worker validates A07 before address/key processing and returns safe no-store `429 rate_limited` with next-midnight HTTP-date Retry-After. A09 remains explicit fresh creation, never an automatic retry.
- Migration 0004 isolates counters from Conversations and seeds only the operational singleton. D1 conditional rollover chooses a shared random daily key; same-day missing/malformed state and missing singleton fail closed. The capped UPSERT immediately gates INSERT through SQLite `changes()` in one batch. SQL key/window checks guard admission against rollover/queue delay; an INSERT failure rolls back the counter. Production uses SQLite time, while disposable tests inject Clock.
- Minute Cron cleanup atomically deletes expired counters and erases expired daily keys, retaining the nonvisitor watermark. Failure is redacted and observable as a failed scheduled event; the no-traffic fixture proves failure rollback and next-pass recovery. Actual outages can delay physical deletion; no grace, backup-erasure or guaranteed-deletion claim is made.
- Checked-in local mode uses one synthetic fixed identity, ignoring all IP headers. Opt-in Cloudflare-direct mode requires runtime metadata plus a strict canonical address and rejects known Worker/Pseudo-IPv4 indications. Unit HTTP composition proves those adapter gates only; hosted ingress/topology remains unverified and disabled. Configuration, infrastructure logs/backups, hosted scheduling/failure visibility and BC/privacy acceptance are release prerequisites.
- Implementation work is ready for supervisor-owned independent review, not final advancement or BC acceptance. No local commit or staging performed by the implementation worker; sprint remains in-progress pending review.

- Coordinator independently read the entire 1,290-line staged baseline diff, checked each task/AC and all seven matrix rows against executed tests, and reran all required commands successfully: four typechecks, 45 workstation fixtures, 427 Vitest tests, both builds, six simulation tests and all 39 Playwright cases without skips. Evidence: `/tmp/story-2-6-coordinator-verification.log`; reviewed diff: `/tmp/story-2-6-diff-2Fq8hF.patch`. Local adapter tests establish the documented boundary, not hosted ingress. No public authenticated controls beyond existing reads were introduced.

## Spec Change Log

## Review Triage Log

### Independent pass 1

All three fresh inherited-model layers completed before triage. Blind Hunter: 105.339 kB, N=min(floor(sqrt(105.339)+1),10)=10; ten findings delivered. Concurrent separate native calls rejected two launches (`Rejected: a subagent call is already in progress. Issue exactly ONE subagent call per turn.`). Supervisor authorized same-runtime grouped recovery: the two unstarted layers completed together in one native runs.all workflow; no layer skipped and no alternate CLI. Runs: blind `7a0e9630-c1ab-4dc9-af40-c77dc2135560`, edge `1c855ad8-68b6-4e4c-9035-fd65e4deecb1`, verification `332b00db-318a-4f76-87b5-5a5b5847e061`. Every finding is classified independently below before grouping.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| B1 | low / patch | Node SQLite reproduction accepts two NULL pseudonym PKs: CHECK(NULL) is not false. Direct NOT NULL correction strengthens the declared identity invariant; add migration regression. |
| B2 | medium / patch | UPSERT with existing same-pseudonym mismatched expiry changes zero rows; final guard checks only key, falsely classifying legal-schema corrupt counter as exhausted. Confirm matching counter expiry/count before 429 and test safe unavailable. |
| B3 | low / patch | Node SQLite reports one changed row on repeated NULL-to-NULL idle cleanup. Direct IS NOT NULL predicate avoids needless minute writes. |
| B4 | maybe-false / defer | No timeout/backlog failure was demonstrated. Indexed DELETE is bounded by actual expired rows, but a sufficiently large backlog could repeatedly fail and roll back key erasure. Treat potential medium operational harm as unverified; need disposable load measurements against current D1 transaction limits before designing bounded cleanup. Existing outage caveat remains explicit. |
| B5 | false / reject | Five bounded SQL statements do not establish the alleged capacity denial; no sustained-load measurement or failing read was supplied. Existing read routes never invoke creation admission; this is speculative general flood optimization, not demonstrated cap disabling reads. |
| B6 | medium / patch | Confirmed test gap: successful cleanup currently sees only expired state; it cannot catch deletion of live counters or keys. Add mixed-live/expired scheduled fixture and continued cap assertion. |
| B7 | medium / patch | Current fixed-clock requests fail stale lookup before reaching insertion guard. Add real-D1 pause/interleaving after successful key lookup and assert no stale writes, preserving batch atomicity. |
| B8 | medium / patch | Actual A09 post-loss fresh creation succeeds and exhaustion occurs in a separate entry; last-slot loss plus explicit fresh 429 is uncovered. Add the combined controlled transition without claiming UI integration. |
| B9 | low / patch | Browser uses wall clock across fill/restart; legitimate midnight can invalidate unconditional 429. Make test compare actual day bounds, preserve checked-in config coverage, and assert exact authoritative reset date. |
| B10 | false / reject | Regenerated cache deliberately distills rather than duplicates planning per compile instructions. It retains public-only/review/provenance constraints, does not amend authoritative validation contracts, and this handoff explicitly loads full epics/architecture. No removed validation implementation or changed acceptance requirement follows from the shorter cache. |
| E1 | low / patch | Same demonstrated real-clock browser midnight flake as B9. |
| E2 | low / reject | Date maximum plus next-day expiry yields Invalid Date (reproduced), but only at year 275760/injected impossible operational time. Fix adds a new guard for a state not met in everyday use; low-unlikely complexity rule rejects it. |
| V1 | medium / patch | Pre-verified live-state cleanup regression gap; same root cause as B6. |
| V2 | medium / patch | Pre-verified in-flight lookup-to-insertion rollover gap; same root cause as B7. |

Groups: B6/V1, B7/V2 and B9/E1 share their respective test gaps; remaining retained findings stay separate. All retained implementation changes are direct corrections or focused regression tests with no new public surface or intent change. B4 alone is deferred as explicitly unverified; no demonstrated acceptance blocker.

All retained patches were applied by the resumed original worker (`044b3932-dcbd-41e1-825f-deca54b58406`) and independently inspected in the complete 319-line follow-up diff `/tmp/story-2-6-review-fixes.patch`. B1/B2/B3 actual SQL regressions pass; B6/V1 mixed cleanup preserves exhausted active state; B7/V2 pause after key acquisition proves expiry/cleanup/rollover fencing and an SQL-trigger clock transition proves atomic midnight admission. B8 proves last-slot response loss followed only by explicit fresh 429. B9/E1 tracks observed UTC days and validates complete reset timestamps without forgiving same-day restart resets. No retained patch is unresolved; no spec re-derivation or loopback was required. Worker follow-up acceptance reported pre-existing coordinator-staged files, correctly preserved; this was not a code/test failure. The coordinator owns final commit and clean-index verification.
- During implementation, validation caught and corrected a Node strip-only TypeScript parameter-property import, strict test typing, and migration/configuration fixture expectations. The first full smoke run had 37 passes/two failures because an edited generated-file marker made Wrangler report `A non-Wrangler env.d.ts already exists`; restoring actual `npm run db:types` generation and updating the additive binding allowlists resolved it. No verifier/harness weakening or alternate runtime was used. Final required commands below pass.

## Design Notes

- Use a 256-bit CSPRNG daily shared D1 key and domain-separated HMAC-SHA-256 over canonical address plus UTC date. A migration-seeded singleton records the current day/key; conditional initialization/rollover selects exactly one winner. Never regenerate a missing/malformed same-day key or recreate a missing singleton: fail closed. Preserve a nonvisitor day watermark after key cleanup to distinguish expired state from same-day corruption. No root secret, address log or Conversation linkage. Normalize equivalent IPv4/IPv6 forms; reject malformed/multiple/zone addresses.
- Capped counter UPSERT followed immediately by conditional Conversation INSERT in one D1 batch; prove SQLite changes() gating/rollback on real D1. Guard the entire write against the daily key/window so rollover cannot revive expired state. Return credentials only after confirmed insertion. Corrupt/missing key state is an unavailable error, never fresh allowance.
- Expiry is exactly the next UTC midnight, not an added retention grace. A scheduled handler every minute physically deletes expired counters and erases expired key material atomically, retaining only the operational day watermark. Opportunistic cleanup may supplement but cannot replace scheduling. Test no-traffic scheduling and failure/recovery; document that outages can delay physical cleanup, not claim guaranteed deletion/backups coverage. Never invoke cleanup on operator state.
- Explicit address adapter modes: checked-in local development uses one fixed synthetic loopback identity (ignores all client IP headers); arbitrary identities are injectable only through test composition, never a request header. Hosted Cloudflare-direct mode is opt-in and requires trusted runtime metadata, a single valid CF-Connecting-IP and no Worker-subrequest/Pseudo-IPv4 indications. Ignore X-Forwarded-For/X-Real-IP. Unknown/misconfigured modes and untrusted provenance fail closed. Do not silently fall back from hosted mode to local identity.
- Hosted activation requires verified direct Cloudflare ingress with no upstream/same-zone/cross-zone Worker subrequests and no Pseudo IPv4 overwrite. Runtime checks do not prove that topology. Official source checked by supervisor on 2026-11-18: https://developers.cloudflare.com/fundamentals/reference/http-headers/ (CF-Connecting-IP/subrequests); same-zone Workers can influence x-real-ip, cross-zone substitutes a shared Worker address. Header name alone is not trust. Document required operator verification without enabling hosted deployment.

## Verification

### Implementation-worker evidence — 2026-11-18

- `npm run typecheck`: all four TypeScript configurations pass; log `/tmp/story-2-6-typecheck.log`.
- `npm test`: 45 workstation fixtures and 427 Vitest tests pass (12 files), including 30 creation-limit cases and all 38 previous Conversation cases; log `/tmp/story-2-6-tests.log`.
- `npm run build`: frontend and Worker dry-run pass, no deployment; log `/tmp/story-2-6-build.log`.
- `npm run test:smoke`: six simulation tests and all 39 Playwright cases pass without skips; log `/tmp/story-2-6-smoke.log`. This includes actual D1, two independent Workers, 32 concurrent creations yielding exactly 10 commits, configured shared IPv6 caps, midnight/key rotation, trigger-injected INSERT rollback, no-traffic scheduled cleanup/failure recovery, stale/corrupt/missing state, and Chromium cap persistence across actual Worker restart. Two additional test-only unit assertions (hosted HTTP adapter composition and scheduled/config wiring) were added afterward; typecheck and the complete `npm test` were rerun successfully. No production code changed after the full smoke/build pass.
- `git diff --check`: passes. `git diff --cached --name-only`: empty. Changes remain uncommitted for supervisor review.
- AC1: actual shared-D1 concurrency/cap proof plus synthetic Cloudflare adapter gates; no claim of hosted topology proof. AC2: authoritative 429 resume date, unchanged read snapshots and A09 actual exhaustion. AC3: clock/config/shared-IP, random daily-key lifecycle, rollback, scheduled physical erasure and privacy schema/log assertions. AC4: processing is explicitly pseudonymous personal data, with physical-cleanup/log/backup limits documented in `docs/development/application.md` and `migrations/README.md`.
- Independent review layers, any review fixes/reverification, conventional commit and final supervisor advancement remain pending. Sprint/BC human acceptance is not inferred.

### Final coordinator verification and handoff — 2026-11-18

After every retained review correction, the coordinator reran `npm run typecheck && npm test && npm run build && npm run test:smoke && git diff --check && git diff --cached --check`: all four typechecks, 45 workstation fixtures, 427 Vitest tests, frontend/Worker dry-run builds, six simulations and all 39 Playwright tests passed, no skips. Exact full output: `/tmp/story-2-6-final-verification.log`. Reviewed complete final code diff: `/tmp/story-2-6-final-diff.patch`. These local/disposable tests cover all original ACs within the approved development boundary; actual hosted trust/scheduler/log/backups and human acceptance remain unclaimed. The smoke suite's Git source copies are local disposable fixture operations, not remote network operations.

Practical developer handoff: see `../../development/application.md#owner-verification-of-story-26`. Reproduce the two Conversation Playwright tests for actual D1 plus browser/restart behavior; run the full required chain for regression proof. No operator migration or existing-server stop is needed or authorized. B4 remains a medium-unverified load assessment in `deferred-work.md`, not a proven failure. Spec done denotes implementation/review completion only; sprint review awaits BC verification. Local commit and supervisor advancement gate follow; no next story is started here.

### Required final supervisor verification

- `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke`, `git diff --check` must pass, retaining actual output/limitations.
- Exercise local D1 concurrency, midnight, configured cap, rollback, scheduled no-traffic expired-row/key deletion, corrupt/missing-state fail-closed behavior, restart stability, spoofed header rejection and unchanged authenticated reads; deterministic mocks alone are insufficient. Verify default local fixed identity separately from Cloudflare adapter metadata/config/header gates, and preserve real browser creation/read tests. Hosted ingress validation and infrastructure logs/backups remain explicitly unproved release prerequisites.
- Inspect complete baseline diff and all original ACs; run all rendered independent review layers, triage/fix and reverify before local conventional commit. Preserve evidence on blockage; no completed-story commit with unmet criteria.
- Final supervisor advancement approval requires baseline/commit hashes, evidence paths and clean checkout. Sprint review remains pending human acceptance.
