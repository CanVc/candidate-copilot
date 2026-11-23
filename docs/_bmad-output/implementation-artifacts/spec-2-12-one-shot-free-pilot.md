---
title: '2.12 follow-up: one operator-run fictional question on Workers Free'
type: 'feature'
created: '2026-11-23'
status: 'in-progress'
baseline_commit: '67006cb6148590ef4727a7a457d728a7589d4504'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Deliver one command for BC, not an activated service. In BC's terminal only, authenticate via browser, process one fixed fresh 2.14 fictional question with the real project classifier, scoped lexical retrieval, conditional generator and validation, using direct Cloudflare REST instead of deploying code. Return a small shareable receipt, never raw provider content.

## Boundaries & Constraints

Use the operator's Free-plan observation at 67006cb, not a new dashboard audit. Bind that observation to an independently supplied expected account ID from BC (entered privately locally, not in Git, command arguments or chat); require exact authenticated membership. Do not interpret OAuth, quota, a sole membership or absence of subscriptions as proof of Free. Stop if BC cannot identify the observed account or knows the observation no longer holds. The assurance is conditional on the dated plan observation remaining true; this command cannot lock a subscription. Hardcode the direct host, version, model, path, methods and headers, no gateway parameter, redirect, paid model, billing mutation or upgrade. Never invoke remote dev or upload a Worker. Authentication/identity checks are preparatory, not model calls. Use isolated temporary auth state. No changes to operator profiles or local application data.

Exactly one fixed case, no ad hoc prompt, gold passages or review fields. Validate the pinned public source and artifact identities before inference. Preserve role-specific projections, output decoding/citations, processing deadlines, separate per-role and total serialized byte and output bounds, including upstream response bytes before parsing. Do not claim a scalar count measures live tokens. Permanently consume this pilot locally before dispatch, atomically, across concurrent invocations/restarts; never remove or reset its spent marker. No automatic replay/retry/repair/fallback or endpoint. On uncertain transport stop, report attempts, not confirmed remote completions. Agents run offline tests only with no operator data/services or credentials. No 2.15, story acceptance, push, evaluation campaign or changes to the default simulated runtime.

## I/O & Edge-Case Matrix

| State | Result |
|---|---|
| Auth/account/pin mismatch, invalid options, spent marker | No inference, controlled stop |
| Valid clarification/refusal, invalid classify, no evidence | At most classification, never generate |
| Valid documentary intent with eligible whole passages | One classify and one generate; real reconstruction/validation |
| Redirect, timeout, quota, malformed/oversize/invalid result or interrupted execution | No alternate receiver, repair, retry or new invocation; safe status/unknown |

</frozen-after-approval>

## Code Map

- `tools/global-evaluation/preflight.mjs`, `tests/fixtures/global-evaluation/cases.json`: pinned case, hashes, reviewed three-file inventory. `tools/public-content/build.ts`, `tools/retrieval/evaluate.ts`: deterministic artifact assembly and disposable local publication for `D1Retriever`.
- `src/application/professional-intent-processor.ts`, `generate-answer.ts`, `src/shared/attempt-timing.ts`: use existing real selection, deadlines and validation, not two handcrafted chat prompts. `src/adapters/llm/workers-ai.ts` has receiver-bound serializer, bounded decoder and two roles; share without pretending live transport is a local fixture.
- `node_modules/wrangler/wrangler-dist/cli.js` (4.151.2): login supports explicit `account:read`, `user:read`, `ai:write`; `auth token --json` distinguishes OAuth from other credentials. Auth output must be captured privately. No AI dev binding or Worker deployment needed. Official Workers AI REST run, JSON mode, model and pricing documentation govern API address/limits; `whoami` is not a billing attestation.

## Tasks & Acceptance

- [x] `tools/workers-ai-pilot/` — fixed operator entry, private auth/expected-ID binding and irreversible local one-shot guard. Use pinned tooling, sanitized environment, bounded time; fail before dispatch on ambiguity.
- [x] `tools/workers-ai-pilot/`, `src/adapters/llm/workers-ai.ts` — isolated composition, genuine pinned retrieval/publication, bounded direct transport and defensive role-aware dispatch. No CLI overrides of destination, inputs or state path, no configurable production endpoint.
- [x] `tests/bootstrap/workers-ai-pilot.test.ts` and focused fixtures — execute actual CLI offline with fake auth/transport at test boundaries, exact 0/1/2 call counts, actual role payload and eligible passages, concurrent/second launch, failure and uncertainty. No socket to a provider.
- [x] `docs/development/workers-ai-pilot.md` — exact tested command and browser sequence, local state/limits/credential handling, official sources, what to return and why not to rerun. Distinguish future operator evidence from offline verification; no rewriting historical specs/statuses.

Given a clean checkout with pinned dependencies, when BC invokes the documented command, then only matching the observed account allows the single bounded direct attempt. Given any tested branch, when it ends, then the sanitized receipt states only known local facts, with zero duplicate dispatches even on uncertainty. Given ordinary startup, when simulation is used, then the pilot remains unreachable.

## Implementation Notes

Checkpoint 1 approved by the technical supervisor, not story acceptance. Verify browser handoff offline in the isolated environment (no actual login); ensure BC can inspect a useful validated local result distinct from the minimal shareable receipt. No agent reads operator secrets, profiles/config, private data or DB, calls authenticated APIs, or runs a real pilot/login. Use ONLY tracked source paths + installed pinned dependencies, temporary settings/storage, private PID/proc and network namespaces with loopback for execution checks. Do not copy the whole working directory, run process scans outside isolation, invoke BMAD again, edit skills/harness, commit or stage as implementation writer. Keep the index empty during writing. Stop and report any runtime/tool failure; no alternative agent mechanism. No status promotion. Prior public docs/observation already establish the conditional Free path (no additional operator dashboard steps).

Writer verified four typechecks and 736 tests in 12 suites offline after adding initially omitted tracked frontend and 2.1 handoff inputs to the disposable fixture. Coordinator inspected all 731 diff lines and matched executed CLI matrix coverage to each row. No live inference or account verification by agents. The processor consumes a fixed admitted-message projection, not a browser submission or persisted conversation.

## Spec Change Log

## Review Triage Log

One native grouped `runs.all`, fresh blind/edge/verification, all returned before triage. Reviewed implementation patch SHA-256 `00a8a297fc26c65af51e2f291751ac23fbffc2b85f646a68f6cf9579095ab9a2`. No story-state promotion. Individual dispositions before grouping:

| ID | Verdict and disposition |
|---|---|
| B1 | medium / patch: wrapper resolves Node and dirname in inherited PATH. Trust of installed Node is unavoidable; explicitly require trusted PATH/toolchain and eliminate external dirname lookup. |
| B2 | false as a requirement for another billing check: membership is never called a plan check; prior observation + independent ID + unchanged plan is the expressly approved conditional assurance, not a dynamic guarantee. |
| B3 | medium / patch: signal exits before asynchronous child/workerd cleanup. Propagate cancel and await normal teardown under a bounded hard-stop fallback; test login interruption. |
| B4 | low / patch: display uses non-JSON code-point escapes; use JSON-compatible surrogate escapes and round-trip fixture. |
| B5 | medium / patch: serializer reads mutable options after validation; snapshot limits at construction. |
| B6 | medium / patch: auth double duplicates parser assumptions. Pin compatibility against actual installed OAuth code/framing without launching login or reading profiles. |
| B7 | medium / patch: race need not exercise both past initial check; synchronize at membership, assert two contenders and exactly one classification. |
| B8 | medium / patch: no independent proof of aggregate serialized-input check; exercise exact fit and next-byte overrun with two individually fitting candidates. |
| B9 | low / reject mandatory account revocation: pilot uses normal Wrangler OAuth, deleting local state is not revocation. Manipulating an operator's existing account-wide grant is not authorized and could affect others; no extra dashboard step. |
| E1 | medium / patch: same launcher trust prerequisite/dirname issue as B1. |
| E2 | medium / patch: Wrangler uses config discovery; pass a minimal private explicit config for each command. |
| E3 | low / patch: Wrangler banner can check for updates in a cold cache; set pinned hide-banner flag. |
| E4 | medium / patch: early raw-input rejection can return a suffix to the shell. Discard invalid/overlong lines while echo remains off until Enter; bound memory. |
| E5 | low / patch: recheck inventory after pinning immutable bytes. A new entry cannot enter the payload even today. |
| E6 | false for the existing assembly: catalog/search labels computed from canonical payload/preimage in the same synchronous pure builder, used immediately with the three pinned inputs; there is no external mutable artifact store or producer. Add a regression binding computed bytes to the identities during the patch, not a new artifact format. |
| E7 | medium / patch: cleanup exceptions could print raw filesystem diagnostics after success. Handle locally and fail with safe cleanup status. |
| E8 | low / patch: dispose exception masks a completed validated result; keep private result distinct from cleanup failure in receipt. |
| E9 | medium / patch: assertion on global ordering of GET versus a concurrent POST is not an invariant. Verify synchronized contention / per-invocation order. |
| E10 | medium / patch: maxTokens not validated by receiverIdentity; snapshot finite positive integers for pilot dimensions. |
| V1 | medium / patch: existence is not sync ordering. Inject each fsync failure before POST; assert zero dispatch and spent on later launch. |
| V2 | medium / patch: fake accepts missing/wrong bearer. Enforce expected credential independently for GET and POST. |
| V3 | medium / patch: duplicate matches never supplied. Test duplicate-denied and multiple-distinct exact selection without a default. |
| V4 | medium / patch: valid dashboard origin does not exercise scopes/callback checks. Reject same-origin tampering before printing. |
| V5 | medium / patch: ASCII overflow cannot distinguish byte from scalar counting. Test multibyte exact and just over decoded limit. |
| V6 | medium / patch: pipe cannot show echo enabled; use disposable pseudo-terminal, test hidden input and restoration, including invalid input. |
| V7 | medium / patch: deletion at command exit would pass post-exit assertion. At membership GET require private auth cwd gone. |
| V8 | medium / patch: provider-declared failure with HTTP 200 never covered. Test unsuccessful flag and errors alongside a usable result; no generation. |
| V9 | medium / patch: concurrent global GET-before-spent assertion, as E9. |

Grouping after verdicts: B1/E1, B5/E10, B7/E9/V9. All retained corrections concern demonstrated implementation contracts/test boundaries, no new user policy, service, endpoint or modes. No requests for account access or real trials.

## Verification

Test in a disposable tracked-source snapshot/private HOME, isolated PID/proc and network namespaces with loopback only. Check typecheck, focused offline CLI and processor tests and affected regression suites, complete diff, three fresh independent layers together, patches and reruns. No live test or authentication, no durable transcript or BC acceptance.

All retained patches applied by the resumed original writer; 68 focused tests passed. Coordinator read the complete correction delta (SHA-256 `6a4f0d83f28e8da6f7434cfa6dba3bba30efa856fa0bbb347512b0585a1ffb28`). Offline source/fixture checks for pinned Wrangler confirm login URL formatting and token JSON; no real `login`, token inspection, browser grant or provider run. The documented shell entry was exercised with boundary doubles, real disposable D1/FTS and core validation. Zero attempts on mismatch or fsync failure; one on direct outcome, no evidence, invalid classifier, HTTP redirect/quota, interruption or uncertain result; exactly two on eligible answer, even across contending launches. No further attempt on reopening a consumed guard.

Coordinator final snapshot `a7a88b9f82cc63abbd1eb957e3dcf2d69015ce87`: `node tools/global-evaluation/preflight.mjs && npm run typecheck && npm test` in clean HOME, private PID/proc + loopback-only network, copied pinned dependencies. Preflight passed, four typechecks, 45 workstation fixture checks and 1,010 Vitest cases / 21 suites passed. Combined log SHA-256 `3fe7e3119cf2da050b5b56f4078b109b852d512a5e559bb98c1f5b1f4eba255f`. An earlier precommit snapshot omitted the last adapter unit edit (1,009 passing tests); the 1,010-result run includes it. An earlier helper preparation failed with `python: command not found` before any tests; supervisor approved `/usr/bin/python3` to prepare the temporary helper. No build/deployment or browser E2E is claimed. Only this evidence prose differs from the tested snapshot. No remaining review blocker; no story-state transition. BC's future single terminal run, not this verification, is the first opportunity for real direct-path evidence.
