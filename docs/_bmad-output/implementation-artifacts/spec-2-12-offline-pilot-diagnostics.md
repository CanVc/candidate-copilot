---
title: '2.12 follow-up: explain observed local pilot failures safely'
type: 'bugfix'
created: '2026-11-23'
status: 'done'
baseline_commit: '292a93bcb0f36892622eceb38c1d40aee1a499bf'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

The historical pilot receipt counts a local classifier dispatch, not a confirmed remote execution. Distinct failures collapse into the same processing result. Add a small, shareable, closed diagnostic of the locally observed failure and stage without changing that result or explaining the earlier sample retroactively. Inspect the actual outgoing messages and bounded response contract for both roles; change the contract only for a demonstrated incompatibility.

## Boundaries & Constraints

Keep the spent guard's key, location, exclusive creation, fsync and ordering, same pinned case, receiver, model, all limits, and simulation default. Preserve statuses, attempt counts and cleanup semantics. Do not use accounts, profiles, credentials, operator storage/processes/marker, active services or live auth/inference. No new data from remote systems, telemetry, additional receiver, retry, repair, reset, fallback, alternate pilot, deployment, story transition or 2.15 work. Preserve the exact receipt and its historical caveats; no command for a second attempt. Never serialize arbitrary exceptions, provider codes, free text, IDs, headers, payloads, usage or inferred billing/quota. Private validated display is not the receipt.

## I/O & Edge-Case Matrix

| Observation | Shareable interpretation |
|---|---|
| Locally enforced cutoff expires | Deadline at observed stage, not provider timeout. External interruption alone is not a cutoff. |
| Socket/stream failure without a usable response | Transport failure, never evidence of remote completion. |
| Non-200 response at the HTTP boundary | HTTP rejection, numeric status only for a safe observed status; do not inspect diagnostic bodies. |
| Bounded body/UTF-8/JSON/envelope check fails | Unreadable/unusable envelope, not socket failure or a provider-specific cause. |
| Completed result fails role decoding or validation | Invalid response at that role; no new generation/repair. |
| Unclassified local failure / no model call | Known local stage if available, otherwise unknown; never attribute a retrieval/preparation failure to the previous dispatch. |
| Successful controlled result or spent guard | Preserve minimal receipt, no fabricated failure. |

</frozen-after-approval>

## Code Map

- `src/adapters/llm/workers-ai.ts`: serializes system instructions and user JSON string with `stream:false`, direct `response_format.json_schema` and role-specific `max_tokens`; decoder accepts a bounded object or JSON string in `result.response`. `tools/workers-ai-pilot/http.mjs` sends exactly that string (not an OpenAI chat-completions wrapper), checks identity encoding, size and v4 success/errors, but collapses all errors on close.
- Installed Cloudflare model-specific `Ai_Cf_Meta_Llama_3_3_70B_Instruct_Fp8_Fast_Messages` allows messages, both JSON mode selectors and untyped `json_schema`; these types and repository official-source notes do not demonstrate a rejected schema keyword, need for an OpenAI wrapper, or a different deadline. Keep contract absent contrary evidence. No network research required.
- `tools/workers-ai-pilot/process.ts`: classifier window includes preparation, then continuation retrieves evidence before generator; `beforeCutoff` races work and also checks elapsed time synchronously. Aborted signal alone is ambiguous. Role decoder catches malformed data; core also validates generation/citations. `cli.mjs` owns the last-line receipt and interruptions. Do not derive stage from nonzero counters.

## Tasks & Acceptance

- [x] `tools/workers-ai-pilot/{http.mjs,process.ts,cli.mjs}` — classify observations at the responsible boundary before generic catches; use finite application constants and project only safe fields. Handle deadline/cancellation/late-close ordering and scope stage changes to genuine phases. Keep marker and dispatch logic intact.
- [x] `tests/bootstrap/workers-ai-pilot.test.ts`, `tests/fixtures/workers-ai-pilot/boundaries.mjs` — inspect real CLI POST framing (bytes, schema, role data, per-role and aggregate bounds) using the fixed public fixture. Exercise distinct injected failures, including ambiguous/internal failures, external abort versus deadline, generator errors and failures between roles. Assert exact allowed receipt shapes and no private canaries, counts, stop/no retry, spent denial and unchanged success paths.
- [x] `docs/development/workers-ai-pilot.md` — distinguish local contract evidence, diagnostic meanings and limitations from historical evidence. Do not imply future permission to run the tool.

Given the two pinned projections, when serialized at the real dispatch boundary, then their role schemas, framing and byte/token reservations match local admission and no new receiver exists. Given an injected failure, when the CLI exits, then its status and local counts stay intact and diagnostic fields identify only demonstrable facts. Given a reusable provider error message, body or malicious fields, when a receipt is rendered, then no uncontrolled value enters it. Given the existing spent pilot, when this change is tested, then only disposable fake boundaries run and no operator state is accessed.

## Implementation Notes

Technical checkpoint 1 approved; not BC story acceptance. First observed decisive diagnostic must not be overwritten by late callbacks. Writer: no staging or commits, harness/skill changes, remote requests, or unisolated test executions. Use tracked-source snapshots + changed source and copied dependencies only; no process scans outside private PID/proc, no live launcher. Return implementation and isolated test evidence; coordinator handles review/checkpoints and commit. Report any runtime/tool failure and stop rather than switching execution mechanism.

Initial implementation verification: snapshot manifest SHA-256 `3610e6a8fa32be14c007e0e499a3dde5d63133d37851d28e5aa3539c0f502bc8`, preflight + four typechecks + 51 CLI/contract tests and 459 regressions passed. Initial namespace setup masked its own snapshot before any project command; corrected private bind/mount layout with supervisor approval. Coordinator inspected the complete 530-line unified diff and matched every matrix row to executed cases, including elapsed/timeout/interrupt, HTTP, uncertain transport, unreadable envelopes, role validation, continuation failure, successful outcomes and spent denial.

## Spec Change Log

## Review Triage Log

Three fresh independent reviewers, one native fanout, on implementation diff SHA-256 `b715467dc3b05c785cc370867f6df491bbaad99bc7493ed2da9d1acbf13d7bd4`. Each disposition precedes grouping:

| ID | Verdict, evidence and disposition |
|---|---|
| B1 | medium — login/token `spawn` timeouts kill without distinguishing their own expiry. Patch local timer observation, same limits and close/cleanup ordering. |
| B2 | medium — a v4 success wrapper missing its own result is passed to the role decoder. Patch the observation at the envelope check; preserve invalid_result versus processing_unavailable. |
| B3 | medium — pre-existing grace exit can occur before `localPublication` returns its result if disposal hangs. Reject changing interrupted to answered: user explicitly requires unchanged statuses. Mark teardown as teardown, not model finalization; document limitation. |
| B4 | medium — direct refusals also call `classifiedLanguage`; patch stage on actual continuation entry. |
| B5 | medium — request-side destroy is not a response interruption. Patch synthetic partial-stream case. |
| B6 | low — rejected body could be consumed undetected by tests. Patch fixture read assertion. |
| B7 | medium — scalar sourceIds would pass wire assertion. Patch nested schema assertions. |
| E1 | medium — auth local timeout collapsed as observed in B1. Patch. |
| E2 | medium — core rechecks cutoff after continuation result; invalid citations can be detected before that check yet not recorded. Patch observation at continuation return. |
| E3 | medium — classifiedLanguage is not proof of a continuation; direct outputs enter fictitious stage. Patch. |
| E4 | medium — exact required keys do not constrain their type/enum in test. Patch both real wire schemas. |
| E5 | medium — fixture never calls response callback before generator transport error. Patch response-side failure tests. |
| V1 | medium — no fixture exercises incomplete response; request error is not equivalent. Patch. |
| V2 | low — absence of body text in output does not prove application did not read body. Patch. |
| V3 | medium — membership timer and command watchdog have distinct callbacks not covered by classifier cutoff or SIGTERM. Patch timer-boundary tests. |
| V4 | medium — no finalization-clock test, success hides stage. Patch elapsed check after reconstruction. |
| V5 | low — unsafe status fixture only covers string. Patch numeric range/integer boundaries; absent/invalid status does not demonstrate a refusal. |
| V6 | medium — generator schema could request scalar citations against array validator despite green tests. Patch nested assertions. |
| V7 | medium — auth closes on timeout but observer sees only generic failure; patch where kill originates. |

Shared causes grouped for correction: B1/E1/V7, B4/E3, B5/E5/V1, B6/V2, B7/E4/V6. No change to intent or public product surface. Coordinator also requested runtime projection of the fixed diagnostic vocabulary and ignoring events from already settled requests.

## Verification

Test on identified source-only snapshots with copied pinned dependencies, clean HOME and disposable storage, private PID/proc and network with loopback only. Run preflight, typecheck, focused pilot tests and relevant regressions; report actual commands, deltas, counts and limitations. Perform three independent native reviews in one grouped call, triage, correct and rerun on the final snapshot. Technical checkpoint before local commit; no push or product acceptance.

After review, the retained writer's 67 pilot tests passed. A final fixture-only correction removed two application-prototype wrappers; the CLI now runs the unchanged core while only the clock advances after the substituted HTTP close. A nested resume was refused by the runtime's session-directory provenance check; the writer had finished, so the supervisor authorized the coordinator to make that last correction rather than bypass the check.

Coordinator verification: Git tree `b2dbba9572b920fa9b494314da233c4803920335`, source manifest SHA-256 `e8545143c5e03f6c2f2fedb22e52fda31a23d6b3b4c6a3201b48f849d0b80090`, implementation diff SHA-256 `52423c5a493390e7c725b034c7a9f03e5e9f1961c804ecc6b5b5b486d8ae32d5`. Disposable passwd home, mounted private PID/proc, loopback only, pinned copied tools/dependencies, fake auth/HTTPS, local D1 only. `node tools/global-evaluation/preflight.mjs` and all four `npm run typecheck` projects passed. `npm test`: all 45 workstation checks; 1,032/1,035 Vitest cases passed, including all 67 pilot cases. **Not a green full suite.** Two unrelated checks require Git metadata absent from the exported source (corpus revision and tracked-files safety); one unreadable-file test could not spawn UID/GID 65534 in the single-ID root namespace (`spawnSync /mnt/tool/bin/node EINVAL`). Log SHA-256 `ee4a1871aa7d857fce858fac5e4f15f5e4d3aa49038d169fa3c53659d48fe4f8`. One supervisor-approved preparation of the same tree with a synthetic Git repository and non-root UID was blocked by `unshare: setgroups failed: Operation not permitted` before project commands. No tests ran in that preparation; no further attempts. No harness changes, account access, remote calls, builds or deployments. Historical receipt section and guard block checked byte-for-byte against baseline. Only this verification record and fix-spec status differ from the tested tree. Final technical checkpoint approved a local commit of these nine files with the three explicit suite reservations. This closes the fix only, not any epic story or BC product acceptance.
