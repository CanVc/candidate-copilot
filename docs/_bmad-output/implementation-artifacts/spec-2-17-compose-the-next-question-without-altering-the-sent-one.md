---
title: '2.17 Compose the next question without altering the sent one'
type: 'feature'
created: '2026-11-23'
status: 'done'
baseline_commit: '7b2f792b115e06fddd8688777d9300e2f8a8453c'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Keep an editable bottom composer separate from the immutable submitted question. A recruiter can prepare another question or read earlier passages while a single explicit send is unresolved. Local conversation UI and testable contracts only.

## Boundaries & Constraints

Keep the simulation default, exact question and global scope, French provisional labels and the existing bounded transport. Do not simulate an answer when the processor is unavailable. No persistence, new provider, recovery, retries, polling, streaming, launch or other story. Do not access operator data, services or auth. The 2.14 actual-evaluation prerequisite for UI completion remains open; neither fixture results nor viewport emulation approve model quality, copy or physical-device experience.

## I/O & Edge-Case Matrix

| State/event | Required behavior |
|---|---|
| Valid explicit send | Claim exactly one request synchronously with identity, text, global selection and edit revision; fresh draft, one provisional row. |
| Known input/admission limit | No capture or POST, no truncation, accurate reason. |
| Matching terminal | Replace provisional row with saved turn; preserve later draft, caret, reading and earlier turns. |
| Lost/malformed outcome | Keep pending and edits separately; no further send, recovery action or automatic traffic. |
| Definitive rejection | Remove provisional row. Restore only when revision unchanged, else retain one unadmitted attempt for explicit discard or safe restore. Never overwrite newer text. |
| Late or mismatched callback | Cannot mutate a different submission or conversation. |

</frozen-after-approval>

## Code Map

- `frontend/src/PortfolioEntry.tsx` currently consumes the only send gate, locks the field and replaces the form with one `AnswerTurn`. Preserve landing, guide, creation uncertainty, pagehide cleanup and truthful unavailable states. Keep earlier saved turns (including source viewing) mounted; the entry's former disappearing-field focus handoff is no longer appropriate.
- `frontend/src/entry-transport.ts`: `submitInitial` generates its own ID, validates canonical result, request identity, catalog and bounded response but conflates several pre-admission errors. Capture request before dispatch; classify only contractually definitive responses. Preserve `initialScope` validation of an empty idle authorized conversation. Use server admission contracts, not timers or last response text as proof of restored capacity.
- `src/shared/{conversation,conversation-admission,conversation-result}.ts` and runtime contracts AR31/32: shared Unicode count, one immutable attempt, conversation limits, independently versioned draft and rejectedAttempt. No migration or new server permission. EXPERIENCE/DESIGN and PRD FR-6/8: cap growth using available viewport, not example dimensions; keep counter, actions and reading space usable.
- `tests/e2e/portfolio-entry.spec.ts` and local fixture already exercise real authenticated D1/Worker with public fictional sheets. Use controlled delayed receipts for races and deterministic errors, distinguish them from actual D1 state. Existing 2.16 source-viewer and entry behavior must remain available.

## Tasks & Acceptance

- [x] `frontend/src/{PortfolioEntry.tsx,entry-transport.ts}` and composer state module: synchronous submission state and separate draft; preserve immutable identity through all outcomes, gate new work and clear on lifecycle exit.
- [x] `frontend/src/styles/base.css`, entry form and viewport configuration: bounded visible bottom composer, accessible waiting row, safe French validation, rejection and terminal states. Preserve source viewing across multiple turns.
- [x] `tests/bootstrap/` state/transport tests and `tests/e2e/portfolio-entry.spec.ts` or sibling: exercise all transitions, multiaction races, real multi-turn fixtures, responsive geometry, previous entry/source regressions.

1. Given long desktop/mobile drafts, when text exceeds the shared maximum or visible height, then the full text remains, count is visible, textarea scrolls within a bounded composer and reading space remains. Measure resized keyboard-like viewports separately from actual IME proof.
2. Given rapid explicit activations, when admissible, then a single immutable envelope is captured before async work, only its text clears, and one pending row has a generic badge and accessible three-dot waiting indicator without stages, retries or queued sends.
3. Given active/unknown or terminal arrival, when editing or reading earlier answers, then competing sends remain unavailable until permitted and only the matching pending row can complete, without changing draft revision, focus or cursor.
4. Given definitive rejection, when revision matches or differs, then only the former auto-restores; the latter preserves both drafts separately without a chat row. Known limits never capture, transport uncertainty never restores.
5. Given validation, cap, unavailable, controlled failure and late callbacks, when UI renders or restoration/discard is requested, then French guidance and controls reflect known authority without raw errors or indefinite waiting animation; races do not erase newer edits.

## Implementation Notes

Checkpoint 1 approved. Include edit-then-clear (revision, not string equality), count rapid POST activations, delayed receipt while editing and while inspecting an earlier source. Only the writer edits implementation/tests; no commits, staging, harness/skill changes, operator probes or real calls. For each runner adapt the inspected `/tmp/entry216.SMwgbatk/{candidate-snapshot.sh,launch.sh,check.py}` recipe to this baseline with a fresh private directory, named tracked inputs and only required public fictional content, new passwd HOME, copied pinned binaries/deps; never reuse storage or launch the old checkout. Guard private PID/procfs in one process, masked home/runtime/sysfs, same namespace as PID 1, lo only and up before any test. Record the snapshot/runner/log paths for recheck. Report native/tool incidents and stop, no alternative CLI. Coordinator owns review, records and final commit.

Writer returned. Initial reduced-viewport run found a clipped action at 320×355; adjusted layout, then typecheck/build, 196 unit cases and 21 Chromium cases passed in a fresh namespace. Coordinator read the complete 941-line baseline diff and matched matrix rows to executed tests: once-only rapid activation, Unicode/authority guards, two-turn source/caret preservation, lost receipt, edit-then-clear, unrelated attempt and expired authority. No physical mobile keyboard or human judgment was exercised.

Historical checkpoint only: the 298 checks (244 Vitest + 54 Chromium) applied to diff `be89066d8d2dee96da8b222fa7debd1de3ddb6ff7d4209388a9052fb37f9e8a2`, not to the edition below. See [Verification](#verification) for the final technical decision and [handoff](handoff-2-12-to-2-14-evidence.md#reprise-technique-après-217) for the commit boundary.

## Spec Change Log

## Review Triage Log

One synchronous native fanout, mission `273239e2-a533-4df3-9c03-ed146d03cc56`, on the 849-line code/test diff `7f87f04f71a5f63406a29e09d44f9f3caa524ea25a302dd218566f0f7fdffbea`. Individual verdicts before grouping:

| Finding | Verdict, evidence and disposition |
|---|---|
| B1 | False: `validateConversationResult` already requires global_public, empty resources and a nonempty canonical eligible-ID set before returning saved. |
| B2 | Medium: the read gate checks three IDs, not saved content/scope. Fail closed on contradicting history. |
| B3 | Medium: UUID creation moved outside guarded transport. Keep draft and explain no-send on failure. |
| B4 | Medium: newly mounted populated live regions are not reliable update announcements. Keep one node mounted. |
| B5 | Low: the pane can be scrolled but a reader at the composer has no quick path to the latest answer. Allow deliberate navigation without scrolling on arrival. |
| B6 | Medium: without CSS field-sizing the fallback is a fixed single row. Provide a usable fallback. |
| B7 | Medium: native required validation may intercept the second requestSubmit. Dispatch two submit events and count real POSTs. |
| B8 | Medium: one dialog is not proof it belongs to the second turn. Check ownership. |
| E1 | Medium: unchanged answer ID can hide changed canonical content or submitted scope in the read. Compare the projections. |
| E2 | Medium: an inconsistent busy projection bypasses history checks. Do not claim active processing without a matching in-progress row. |
| E3 | Medium: stale direct-submission rejection with unchanged catalog identity contradicts the admission contract. Keep outcome unknown. |
| E4 | Medium: missing/throwing randomUUID can leave Send enabled with no explanation. Guard before claiming. |
| E5 | Medium: remounting live status on receipt risks missing a transition. Stable status node, no focus theft. |
| E6 | Low: a known unavailable read-only field still invites typing. Suppress input guidance when read-only. |
| E7 | Medium: scrollable form cap can clip wrapped validation/action at short heights. Test compact rejected state as well as normal action inside the actual form scrollport. No universal geometry claim. |
| V1 | Medium: no single-field mismatched answer ID test. Add isolated mutation. |
| V2 | Medium: malformed receipt test also lacks message. Vary retryable/retryMode independently. |
| V3 | Medium: stale notice test does not force a second submit. Assert disabling, preserved text and one POST. |
| V4 | Medium: same fixture excerpt makes dialog count alone insufficient. Confirm second trigger association. |
| V5 | Medium: one-row overflow would satisfy the existing test even without growth. Measure one versus three lines. |
| V6 | Medium: hidden announcement alone can pass the waiting test. Assert visible badge and dots. |

Grouped local corrections: B2/E1/V1, B3/E4, B4/E5/V6, B6/V5, B8/V4. Others remain distinct. No change to intent or recovery surface. Coordinator also identified two related authority defects: a configured higher server cap cannot override the hardcoded client 20; confirmed access loss must clear inaccessible transcript/source/credentials rather than continue to display them. Do not infer rejection from access loss.

## Verification

**Local technical work complete — OK with notes.** Four independent review layers; no local AC blocker on the final edition. Spec `done` is technical completion; sprint `review` reserves acceptance for BC. No approval of UI completion, publication or launch.

**What was tested.** Branch `work/epic-2-stories-2-12-through-2-22`, baseline `7b2f792b115e06fddd8688777d9300e2f8a8453c`. SHA-256 of the complete binary full-index HEAD → worktree diff **before this documentation update** (14 paths, 201429 bytes): `c5a8658b524023ebc1c814ad6f816e710d5fdc56e968384e32a6a8faa5c2cb66`. This is not a commit ID. The spec and sprint file were outside the execution image. The 12 changed source/test files can be checked independently of later documentation: between baseline and the local 2.17 commit, `git --no-pager diff --no-ext-diff --no-textconv --binary --full-index "$base" "$commit" -- frontend src tests | sha256sum` must give `667c5d209836666cce5166f53575629c5b7d9895e9eef56581ba6ccc94b17cff`.

**Execution record, not instructions to run on the host.** Independent transfer of 133 named inputs (manifest SHA-256 `404d9bb6772e1a7962f73eff470493de12ab63d30d405d5ad65d6e5c3c988699`); worktree, snapshot, ingestion and execution copies matched, including after use. Guard in each command's own launcher: six private namespaces, PID/procfs checked against PID 1, read-only root, private passwd HOME and disposable storage, no capabilities, `no_new_privs`, only loopback up. Copied pinned binaries/browser and 83 packages; three public fictional sheets, local workerd/D1, simulated processing. No operator storage, installation, provider, quota or external network. An **earlier** runner stopped at the `/usr/lib` mount (exit 32) before project commands; the journal does not establish the kernel cause. Neither that preflight nor earlier candidate counts contribute to the final result.

| Guarded commands on the final edition | Result |
|---|---|
| `node --version`, `npm --version`, `workerd --version`, Node/Playwright Chromium launch + version + page evaluation | 24.22.0, 11.19.1, 2026-10-19, 156.0.8078.4 respectively |
| `node scripts/local-d1.mjs init`; `npm run typecheck`; `npm run build:frontend`; `npm run build:worker` | Disposable local D1 initialized; four TS projects; frontend build and Worker dry-run only |
| `node node_modules/vitest/vitest.mjs run` on `tests/bootstrap/{entry-transport,composer-state,passage-sources,conversation-results,conversation-admission}.test.ts` | 62 + 48 + 3 + 121 + 42 = **276** |
| `node node_modules/@playwright/test/cli.js test <file> --workers=1 --forbid-only --global-timeout=1200000`, separately for `tests/e2e/portfolio-entry.spec.ts` and `tests/e2e/passage-viewer.spec.ts` | Entire files: **89 entry + 3 viewer** |

**11 exits zero; 368 passing tests**, not a full repository run. Independent seal SHA-256 `a9b1b1fc77915df5ccddee637d3483799ff8cc480c09c842d58de2684b4a0a2a`. Documentation closeout did not rerun these commands.

### Final AC evidence

The direct-receipt checks compare saved catalog hash to revision and eligible IDs, revision/chunk to content hash, and revision/document to file identity. A coherent suffix may contradict a refusal but cannot install history. The admission read, not a hardcoded 20-turn ceiling, decides whether another question can be sent.

| Frozen AC | Technical conclusion and limit |
|---|---|
| 1 | Unicode count without truncation; growth, internal scroll and wrapped controls inside the form's scrollport, including 320×355. Measured layouts, not a physical keyboard. |
| 2 | Synchronous identity/text/scope/revision claim; rapid submits produce one POST, one provisional row, visible badge/dots and stable status node. UUID failure sends nothing and explains why. |
| 3 | Only the matching terminal can replace pending. Later draft/caret or earlier passage, focus and scroll survive arrival; lost or inconsistent receipt stays unknown, with no competing send. The Escape interaction below is not a receipt. |
| 4 | Unchanged revision restores on definitive rejection; edit-then-clear does not. Separate unadmitted text, deliberate safe restore/discard; known limits block before capture. A disputed refusal is not send authority. |
| 5 | Bounded authority read checks saved history, identities, scope, timestamps and busy/limit state rather than inferring availability from failure. Confirmed access loss clears inaccessible UI/credentials. Late callbacks are owner-guarded; identity failure on a later send and focus when a refusal card disappears have distinct handling. French guidance tested as behavior, not approved copy. |

### Second submission: receipt, projection and storage

The last correction repaired the witnesses, not the application: the earlier artificial section was replaced by a real earlier or later section chosen by the fixture Worker. The Chromium oracle in `portfolio-entry.spec.ts` compares catalog, document, revision, chunk, path, titles, location, hash and copied text against the pinned builder and the physical source, including line endings. First section 29–36, then 37–42 or 21–28; both copy opening line 13. In each negative only the **second copy** changes `SYNTHÉTIQUE` to `FICTIF`. HTTP counts below start **after the first saved turn and its admission read**; D1 counts are final persisted totals.

| Witness | UI decision | POST / GET | D1 messages / answers |
|---|---|---:|---:|
| Intact POST (both section orders) | Unmodified real second Worker receipt replaces pending, including exact question with edge spaces. Later draft and first source survive; GET establishes cap. | 1 / 1 | 2 / 2 |
| Contradictory POST | Second terminal valid alone, inconsistent with saved copy: first turn only, exact attempt still pending/unknown beside later draft; no authority GET. | 1 / 0 | 2 / 2 |
| Intact projected GET suffix | Genuine `400 invalid_request` (21 code points, limit 20); real prefix plus projected suffix matches the refused identity, question and global selection. Refusal disputed; pending/unknown, no import or send permission. | 1 / 1 | 1 / 1 |
| Contradictory projected GET suffix | Same real 400; incompatible copy cannot dispute refusal. Length guidance and unadmitted attempt remain beside later draft, no pending row or new send. | 1 / 1 | 1 / 1 |

**Neither GET after the 400 ever recorded a second answer.** A forced submit after settlement captured no new UUID or traffic. Reuse, twins and partial overlaps are synthetic compatibility cases, not other partitions emitted by the builder. Reject contradictory copies of shared physical lines, not overlap itself or missing repeated context. A document SHA identifies bytes, not a chunker version; catalog identity does not pin the search publication.

**EOF — helper evidence only** (`entry-transport.test.ts`). The unchanged builder consumes an in-memory prototype with blank line 28 removed; observed passage 28–35 then lower passage 21–27, both with context 13. Two copies of the lower receipt differ only by the final LF after nonblank text; still eight copied lines, same attempt, scope and IDs. An apparent EOF below a known higher line is inconsistent. `settle` saves the intact result and preserves the draft; the other stays unknown with exact attempt and draft. `readAdmission` returns `refusalContradicted: true` on the intact suffix, merely `unverified` on the other; neither imports it. No Chromium/D1 EOF witness and no EOF test after a real 400.

### Final review notes retained

- **P1 before publication:** with a nonmodal source panel open, Escape from the editable draft can bubble to the viewer and return focus to the earlier citation. No text loss shown. Preserve editor/IME ownership of Escape without losing intentional dismissal and trigger-focus return from the viewer or non-editor controls. Receipt-focus tests do not exercise this key event.
- Contract fixture: a constructed positive result labels one line as two; use a faithful producer-to-settlement witness. The pinned publisher was not observed emitting it. Historical compatibility **not demonstrated**: the stricter decoder rejects duplicate chunk IDs; storage uniqueness is by response label. No supported former writer shown producing that row, no evidence of data loss or proof that all old rows replay.
- Narrow test gaps: assert exact edge spaces in the projected GET DOM (POST does check exact text); isolate chunk-ID/hash conflict rather than changing several fields; hold a suggestion's *initial* scope read across renewal; check rollback of a disputed shorter refusal to a prior non-null bound. These are limitations of the witnesses, not observed cross-conversation sends or incorrect rollback. The unsorted eligible-ID positive checks helper set comparison, not wire order.
- On **direct submission** an active lease blocks admission; the single in-progress row must be last for a busy projection. This is not a general rule that the disputed row is last. Revisit lease position when **manual same-ID recovery** is exposed in 2.18; no recovery, retry, polling or continuity delivered here. No new story opened.
