---
title: '2.15 Enter a French portfolio conversation with optional guidance'
type: 'feature'
created: '2026-11-23'
status: 'in-progress'
baseline_commit: 'be0378f5ab87c10cc2334044a00425cecdfb0595'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Add the local development entry experience, not a recruiter launch. Let a visitor choose a standalone question or open a conversation without sending. Ground the French invitation in the explicitly fictional public corpus; copy is for review. Implement identity layout without deriving personal details from contributor metadata, mockups or the workstation.

## Boundaries & Constraints

Keep the technical shell reachable and its health checks honest. Use only same-origin local APIs and an explicitly labelled simulated path; no provider activation, private content, analytics, durable browser identity, real-model or deletion claims. Do not implement later stories (answer inspection, next-turn editing, recovery or reload reconciliation). No changed backend permissions, admission limits, migration, external effects or paid path. Use temporary local credentials only in the simulation, never in a URL or output. No visitor-input inspection. Development proof is not BC/UX approval. Neither the 2.14 evaluation nor the release gate is discharged.

## I/O & Edge-Case Matrix

| Input | Expected behavior |
|---|---|
| Suggestion, including rapid duplicate activation | One creation, then one authenticated global message if admitted; report only what the server confirms. |
| Free entry | Create once, enter with open guide and editable empty question; entry itself never sends. |
| Creation uncertain, malformed or lost response | No message; discard suggestion; only an explicit new empty creation may spend another allowance. |
| Confirmed creation limit | Expose server-provided UTC resume time; no timer-triggered action. |
| Unavailable publication/processor, lost message result, reload | Truthful distinct states; never replay, fire another creation, switch scope or simulate a successful result. |

</frozen-after-approval>

## Code Map

- `frontend/src/App.tsx`, `health.ts`, `main.tsx`, `frontend/index.html`: existing StrictMode health shell; preserve its diagnostic and tests. Vite serves only explicitly permitted sources; do not relax the allowlist. `src/shared/health.ts` validates catalog identity. `frontend/src/message-transport.ts` separates browser wait from processing.
- `src/worker/index.ts`, `src/application/{conversations,conversation-results}.ts`, `src/shared/{conversation,conversation-admission}.ts`: exact empty JSON creation, 201 UUID + one-time bearer, 429 Retry-After or uncertain creation. Admission uses a fresh request ID, exact question and empty resource IDs + live catalog hash/revision. Default Worker intentionally lacks a processor: do not present it as model-backed. Exercise the successful path with explicitly composed synthetic processing in disposable workerd/D1, not an alternate API or silent fallback.
- `DESIGN.md`, `EXPERIENCE.md`, FR-1/2/4, UX-DR1–6/21/25, A05/A09 and the 2.12–14 handoff distinguish approved layout and policies from provisional wording, identity and dimensions. No bundled fonts; use named local font stacks and deliberate fallbacks, no remote fetch.

## Tasks & Acceptance

- [x] `frontend/src/{App,PortfolioEntry}.tsx`, `frontend/index.html`: implement the landing and dedicated conversation entry, keep diagnostic accessible, give entry/guide controls native semantics and focus. Include initial retention/access and actual processing path.
- [x] `frontend/src/entry-transport.ts`: validate creation credentials, bind one action synchronously and authenticate without leaking credentials. Handle deadline, stale/unavailable scope, failure, quota and uncertainty without automatic recovery. Wire only initial submission; never manufacture a transcript.
- [x] `frontend/src/styles/{base,tokens}.css`: implement approved palette and font roles, wrapping nonsticky identity, warm-white entry/guide surfaces, readable contrast and visible focus; no inherited mock extras.
- [x] `tests/e2e/portfolio-entry.spec.ts` and focused transport/fixture tests: exercise the matrix, both entry routes, persistence counts and canonical read in a disposable Worker. Preserve existing shell regressions. Use tracked public fixture data, private PID/proc/network (loopback only), throwaway passwd HOME and installed tool binaries only; no operator state.

1. Given the landing, when rendered, then French authorship, purpose, public basis, actual trust information, two or three independent questions and distinct free entry are visible without forbidden CTAs or positioning.
2. Given either route, when activated repeatedly, interrupted or reloaded, then creation and message counts reflect only deliberate actions, per A09 and the matrix.
3. Given either successful creation, when conversation opens, then the compact identity structure stays visible on both sizes and scrolls with content. An initially open manually reversible guide outside the transcript precedes free text and includes the A05 warning. Missing approved personal values remain explicit limitations.
4. Given the rendered UI, when measuring its tokens, font roles, geometry and reflow at desktop and mobile widths, then the approved foundation holds without external font dependencies, hidden identity, sidebar or a new sizing standard.
5. Given keyboard and touch entry, when operating the card and guide, then focus order/visibility, state and parity are checked in a real browser. BC/UX approval of the actual French copy is separately outstanding; story remains in-progress.

## Implementation Notes

Checkpoint 1 technically approved. Single implementation writer; change only frontend, story tests and necessary diagnostic expectations. No staging/commit, edits to skills/harness, operator authentication, private files, process scans or services; no live/remote calls, launches outside isolated snapshots, retries of the pilot, remote activation or deployment. Use installed dependencies and browser binaries only, no profiles or operator storage; create a private passwd home and mount private PID/proc/network with loopback only before running project tests. Report exact runtime/tool obstacles to coordinator before changing mechanism. Coordinator handles evidence records, independent review, final verification and local commit.

## Spec Change Log

## Review Triage Log

Single native synchronous fanout on tree `5bbf7c912ed1ea1e4b6e5b073412294b6d4ac352`, unified diff SHA-256 `e68ccb3022d943ae9e2b04ccccdfb9177c77186ee535e4dd5f47136e9bc20c6f`. No review-state promotion: human criteria still open. Individual dispositions before grouping:

| ID | Verdict, evidence and action |
|---|---|
| B1 | medium — Worker rejects origin/type/body before writing, but the UI uses uncertainty for every failure. Patch confirmed rejection only. |
| B2 | medium — quota uses the same fragment as interrupted creation; reload drops the resume time. Patch non-identifying same-entry history state. |
| B3 | medium — limited screen locks its only entry gate even after midnight. Provide an explicit path back, no timer POST. |
| B4 | low — wording says access is limited (not deletion), but physical retention can be clearer. Explicitly distinguish the unverified purge. |
| B5 | medium — known correlated pre-admission errors collapse to unknown. Patch exact status/code mappings. |
| B6 | medium — terminal local unavailability permits input which this page cannot submit. Keep draft if already typed but stop inviting/editing on terminal outcome. |
| B7 | medium — negative-path assertions inside fetch can be swallowed by transport catch. Assert recorded requests outside fetch. |
| B8 | medium — only two of four modality × entry combinations. Exercise all four. |
| B9 | medium — idempotent backend makes persistence counts insufficient for proving a single POST. Count browser requests as well. |
| B10 | medium — recursive copy admits unrelated files in the fixture tool directory. Copy only named sources. |
| E1 | medium — contract explicitly rejects a malformed/forbidden creation without persisting; visible state does not distinguish it. Patch. |
| E2 | medium — the typed Worker does not emit contradictory readiness, but browser validation of malformed ready-plus-reason data currently releases the question. Reject as unverified. |
| E3 | medium — correlated quota/busy/invalid scope are denials not unknown outcomes. Patch. |
| E4 | medium — replaceState may throw before the first POST; synchronous guard remains locked. Handle no-send state. |
| E5 | medium — UTC resume has no explicit navigation option when it arrives. Patch. |
| E6 | medium — fetch catches assertion exceptions and can satisfy a negative test. Patch. |
| E7 | high — fixture script uses cwd-local D1 without verifying disposable fixture provenance. Refuse non-fixture root before opening proxy. |
| E8 | medium — test canonical read inherits redirect-following; do not forward even disposable bearer credentials. Disable redirects. |
| E9 | medium — reload during lost creation says only interrupted, not that creation may have committed. Preserve uncertainty notice with no selected text. |
| E10 | medium — independent input-method coverage missing for touch suggestion and keyboard free entry. Patch. |
| V1 | medium — duplicate POST could be replayed idempotently without changing row counts. Assert transport counts across reload. |
| V2 | medium — 45s timer test would pass with 4.5s cutoff. Confirm a valid late receipt inside normal wait. |
| V3 | medium — no negative coverage for an otherwise ready nonempty view. Verify no automatic suggestion POST. |
| V4 | medium — no individually mismatched receipt request/revision/hash controls. Add complete wrong-correlation fixtures. |
| V5 | medium — Worker code point tests do not exercise UI counter/send gate at 1000/1001. Add browser checks. |
| V6 | medium — UTC suffix and dateTime do not prove visible day/hour in non-UTC zone. Test visitor-visible UTC value. |
| V7 | medium — off-origin blocking can hide an attempted font fetch. Count and assert zero external attempts. |

Shared root causes: B1/E1, B2/E9, B3/E5, B5/E3, B7/E6, B8/E10, B9/V1. All retained as local corrections to existing behavior or its evidence, no product decision.

## Verification

**Initial implementation only.** Worker mission `fa552207-d8ec-49ae-bdd9-9a4c9a084cc0` reported successful typecheck, frontend build, 269 focused tests, eight Chromium entry tests using disposable local workerd/D1 and seven shell regressions. The historical shell activation test requiring Git history was not run. The coordinator read the 926-line implementation diff. The runtime could not resume that completed synchronous writer (`Async run not found`); the supervisor authorized the coordinator as the sole subsequent writer. No independent reviewer wrote to the repository.

**Post-review snapshot.** Corrected source tree `422060e76dc0a15f04d142f8da18a2982ac18213`; SHA-256 of the baseline-to-tree frontend/tests diff `78e7a37a5228eeed2df2d3faa57466ae295693087311713234c726fc2c3b47f0`. Only documentation was updated after this snapshot. The coordinator prepared a tracked-source export, pinned copied dependencies/browser, disposable passwd HOME, private PID, mounts and loopback-only network. First safety preflight exited 1 before any project command. A separate check confirmed PID, passwd and loopback, **not** private proc visibility. In a fresh namespace a final child-side proc mount and identity check still exited 1 after `pid PASS`. No operator process listing, no bypass, no further attempt. **No typecheck, build, fixture-denial check, Vitest or browser test ran on the corrected tree.** The changes addressing review findings are implemented, not verified fixes. No final screenshots produced.

| Epic criterion | Evidence actually available | Remaining requirement / disposition |
|---|---|---|
| AC1 — French landing | Initial browser runs reached the card on both widths; source review shows two standalone fictional-corpus questions, free entry, warm-white card, no contact/fit/personalization. Revised trust copy names BC as author, distinguishes simulated processing, hypothetical provider scope, access expiry vs erasure. | Revised wording is not rerendered or approved. No actual provider capability or deletion claimed. |
| AC2 — one intentional action, A09 | Initial D1/Chromium runs: suggestion by keyboard, free entry by touch, committed creation with missing receipt, explicit empty re-creation, reload during creation and after lost message, stale catalog, confirmed quota, real default processor unavailability. Counts and authenticated read supported stored turns. | Row counts alone do not prove number of browser requests. Direct POST counters, corrected known/unknown outcomes, post-limit navigation, reload and denied history checks await execution. |
| AC3 — identity/guide | Initial renders: static identity header visible at 1280/320 widths; guide initially open, summary operated by keyboard/touch, warning before free text. Missing facts rendered as missing; no invented name/function/place. | Final rendered disclosure, published identity values and human inspection outstanding. No automatic answer hiding implemented. |
| AC4 — design foundation | Source matches 15 approved color tokens; initial actual browser checked paper/card colors, three computed font-family roles, geometry/order and no horizontal overflow at the two tested widths. Uses local font fallbacks. | No claim that named fonts were installed, numeric sizing ratified or all viewports verified. Zero attempted external requests test added, not run on final tree. |
| AC5 — functional parity and copy | Initial real Chromium: desktop keyboard suggestion and mobile-viewport touch free entry, disclosure focus/state and stored results with synthetic clarification. | Touch suggestion and keyboard free entry cases added but not executed, no physical-device or screen-reader sign-off. Actual French copy and identity require BC/UX at the final session. |

**Handoff:** Before technical sign-off, an independently established safe runner must verify the corrected snapshot: `npm run typecheck`, `npm run build:frontend`, focused transport/admission regressions, and Playwright `portfolio-entry.spec.ts` plus shell regressions. Verify the DB helper refuses a nonfixture snapshot *before* opening storage. No tests against the operator checkout/server. Browser recheck must count creation/message requests as well as persisted rows, render the server's UTC reset time, exercise keyboard and touch on both routes, and preserve only fictional screenshots for the consolidated copy review. `/?diagnostic` is the shell; `/` is local entry; successful processing is fixture-only. No sprint review, product approval, UI-completion or sharing claim; 2.14 remains open.

**Subsequent technical recheck during 2.16 (supersedes the outstanding test request, not its history).** Before integration, baseline `0c068a191375e98d8c08c0e9f2ab71d1e45eddbf` was tested separately on a disposable export. Private PID/procfs, lo-only network, passwd HOME and refusal to open D1 outside the fixture passed. Typechecks, frontend build, 31/31 transport tests and 12/12 Chromium tests passed (`baseline.log` SHA-256 `be4f21c1851e2e361b3b74d79fcb3d99bb0ed07b6770026593bc73e3f798af97`). No failing check in that baseline run. The prior proc-preflight failure was a different run. AC1/3/4: French entry, disclosure and header rendered at tested widths. AC2: exact HTTP and persisted counts, known/unknown outcomes, history denial, limit and UTC return path passed. AC5: keyboard/touch × free/suggested entry all passed, no attempted external browser requests in those cases. These are behavior checks only. On the post-review 2.16 tree the 12 entry cases passed again as part of the 18 UI tests, and seven diagnostic shell checks passed; the Git-history activation shell case was not run. [Final-session captures and pending human evidence](handoff-2-12-to-2-14-evidence.md#séance-finale-avec-bc). Entry prose and identity, assistive-technology assessment and product acceptance remain open.
