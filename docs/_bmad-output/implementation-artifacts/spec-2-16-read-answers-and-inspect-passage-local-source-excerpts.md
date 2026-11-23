---
title: '2.16 Read answers and inspect passage-local source excerpts'
type: 'feature'
created: '2026-11-23'
status: 'in-progress'
baseline_commit: '0c068a191375e98d8c08c0e9f2ab71d1e45eddbf'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Let a visitor inspect the exact saved support for a passage without leaving their place in a locally simulated conversation. The current entry checks a canonical receipt but discards its content. Render that receipt, not an inferred answer. This is independent local UI development, not UI completion.

## Boundaries & Constraints

Keep current admission and validation, simulation default, scope, entry and diagnostics. No operator state, services, accounts, private content, live provider, migration, external side effect, new permissions, release or launch. No new retry, reload, next-turn composer or session storage. Preserve the original language of excerpts. UI wording is provisional. Neither fictional evidence nor test success constitutes actual model evaluation, factual support or BC approval. Keep 2.14 open.

## I/O & Edge-Case Matrix

| Input | Display contract |
|---|---|
| Confirmed correlated canonical receipt | The exact submitted question and ordered saved blocks, including saved failures. No compilation of HTML. |
| Unknown, malformed, stale or unavailable | Existing honest state, no invented turn or citations. |
| One passage citing many sections/files | Count distinct files only. Keep every cited excerpt and exclude other passages. |
| Saved source after live change/removal | Use saved text, title, section and provenance only; no source fetch. |
| Legacy projection with missing identity | Group by saved path AND revision. Do not fabricate identity or relax canonical writes. |
| Spare margin / too little spare margin | Single non-displacing viewer / modal sheet. Close restores focus without forced scroll. |

</frozen-after-approval>

## Code Map

- `frontend/src/{PortfolioEntry.tsx,entry-transport.ts}`: `submitInitial` already authenticates and validates request ID, catalog hash/revision and canonical result. Retain receipt; no new API. Do not use a demo answer on default processor unavailability.
- `src/shared/conversation-result.ts`, `src/adapters/d1/conversations.ts`, `migrations/0006_conversation_results.sql`: canonical saved graph; block source IDs are response-local. Modern snapshots require non-null provenance. Architecture allows a read-only legacy projection: exercise display independently; no D1 legacy compatibility claim, migration or weakened validation.
- `frontend/src/styles/{base,tokens}.css`, EXPERIENCE/DESIGN, PRD FR-10, runtime AR15/42: retain centered reading column, existing color roles and source language, measure spare margin rather than assuming all desktops have room. Group on identity not title or resource. Synthetic warning belongs to the saved chunk, not source title inference.
- `tests/e2e/{portfolio-entry.spec.ts,portfolio-entry-worker.ts,local-fixture.ts}`: existing disposable simulated workerd/D1 integration. Keep assertions for unknown, failed, confirmed and guarded submissions distinct from fixture-only rendering.

## Tasks & Acceptance

- [x] `frontend/src/{entry-transport.ts,PortfolioEntry.tsx}` — retain validated result with sent question in component memory only and render the received turn. Keep existing non-result states and no automatic sends.
- [x] `frontend/src/{AnswerTurn.tsx,passage-sources.ts}`, `frontend/src/styles/base.css` — project per-block groups and safe text; implement accessible file triggers, margin panel and modal sheet, measured layout, expansion, replacement, focus and reading preservation.
- [x] `tests/bootstrap/{entry-transport,passage-sources}.test.ts`, `tests/e2e/portfolio-entry.spec.ts` or focused sibling — verify matrix against fixed public data, historical snapshots, legacy projection and actual browser interaction. Separate rendered fixtures from the database-backed path.

1. Given each canonical status, when rendered, then readable ink/white question, assistant surface, ordered blocks and distinct states appear; HTML-like text and labels remain inert.
2. Given repeated sections and more than three files, when rendered, then desktop tokens name files; one mobile count button shows up to three overlapping circles plus overflow, with the actual accessible count.
3. Given a passage trigger, when opened, then only its saved files and sections can expand inline, a sole file directly, without live metadata, summary or full-document navigation.
4. Given a standalone middle synthetic passage, when inspected, then its saved fictional/non-BC provenance is explicit independently of the guide or opening document warning.
5. Given spare or inadequate right margin, when opening, replacing, closing or receiving a result, then the reading column does not move, focus returns to the trigger and answer arrival does not pull the reader down.
6. Given historical and nullable projection fixtures, when inspecting with keyboard and touch, then saved text/title/revision/chunk/hash survive live changes, legacy grouping never fabricates identities, expansion is announced and modal focus stays contained. Record separately what cannot be exercised on the current D1 schema.

## Implementation Notes

Checkpoint 1 approved. Before any integration, verify exact baseline `0c068a191375e98d8c08c0e9f2ab71d1e45eddbf` separately on a tracked-only export: DB refusal outside fixture, typecheck/build, transport and all corrected portfolio-entry Chromium tests. Preserve counts/failures; correct dependent regression if needed, never call baseline green unless proven. For every runner use `unshare --user --map-root-user --mount --propagation private --net --pid --fork --mount-proc` with `/bin/sh` PID 1 and a single Python child checking `os.getpid()==int(os.readlink('/proc/self'))`, `os.getppid()==1`, same inode `/proc/self/ns/pid` and `/proc/1/ns/pid`, procfs; only lo UP via netlink, never host sysfs/process listing. Disposable passwd home, masked operator home and runtime, only named copied pinned tools/browser and deps, local loopback, sanitized environment. Do not touch operator auth, content, marker, services, storage, harness/skills; no network or retry of live pilot. Use separate snapshots for changes; return exact disposable runner recipe/path and evidence for final recheck. Writer handles implementation and tests, not staging/commit or approval. Coordinator records baseline in 2.15 spec and updates human handoff. On tool/runtime incident notify coordinator and stop, no alternate CLI.

## Spec Change Log

## Review Triage Log

The complete 639-line baseline diff was read; the 546-line implementation-only snapshot `68e0c30775c61fa0462686ec7663ceabf14336649988c1aa835f82d8c33f6e46` kept claims separate from two blind reviewers. Three fresh, read-only native reviews ran together and returned synchronously (mission `9770da99-ff45-46a1-b61b-2b104765346f`). Individual verdicts before grouping:

| Finding | Verdict and evidence / disposition |
|---|---|
| B1 | Medium: receipt replaces the focused read-only textarea; preserve a focus handoff only when the departing form owns focus. |
| B2 | Medium: distinct saved identities can share titles; disambiguate colliding labels with saved provenance. |
| B3 | Medium: resize closes/reopens the native dialog and loses the active row; preserve its focus and scroll container. |
| B4 | Medium: opening the last of many files can leave its expanded excerpt below the visible list; scroll inside viewer only. |
| B5 | Medium: launcher expansion reflects the opening token, not independent row expansion. Keep popup semantics on launchers, disclosure state on rows. |
| B6 | Medium: long excerpts scroll the dismissal control away. Scroll the list separately. |
| B7 | Low: selection maps each block's excerpt index again (up to 100 × 100); memoize the per-result projection and share the index. |
| B8 | Medium: normalized block text assertions miss lost whitespace. Exercise multiline exact text and pre-wrap. |
| E1 | Medium: repeating the same token after collapsing its row does not reopen it; reset viewer selection on every activation. |
| E2 | Medium: focused question field disappears on receipt; observed from conditional rendering, not covered by fixture receive button. |
| E3 | Medium: changing the hash suppresses pagehide cleanup even though a conversation lifecycle exists. Guard by lifecycle and test renewal in the same component. |
| E4 | Medium: Escape outside an open nonmodal viewer bypasses the dialog handler; close and return focus there too. |
| V1 | Medium: reload and lost-creation cases never renew in the same document after a visible turn; exercise pagehide + explicit fresh creation. |
| V2 | Medium: malformed 200 fixture lacks scope, so would still return unknown without graph validation. Add matching-identity dangling citation. |
| V3 | Medium: three fixed widths do not exercise live modality changes or hidden-opener fallback; resize in both directions. |
| V4 | Medium: existing cross-block replacement would not detect failure to switch/reopen files within one block. Exercise sibling and repeated activation. |
| V5 | Medium: checking location on the wire does not prove the rendered label/value. Compare the displayed saved metadata individually. |

All route to local patches; no change to product intent, access rights or persistence. Shared causes: B1/E2, B3/V3, B5/E1/V4 and E3/V1. Other findings retain independent checks. Coordinator is the only subsequent writer; original writer not restarted.

## Verification

Run typecheck, frontend build, focused Vitest regressions and Chromium tests on a tracked-source disposable snapshot only, with private PID/proc, loopback-only network and disposable passwd HOME. Verify preflight without listing host processes. Test real Worker/D1 persistence on public fictional content; never attach operator data or report synthetic outcomes as model quality. Log any missing proof per AC; review via one independent grouped native fanout, correct, then verify final source. No sprint review while criteria remain unproven; no acceptance by the agent.

**Run history.** The exact 2.15 baseline passed DB refusal, typecheck/build, 31 transport tests and all 12 portfolio-entry Chromium tests. A separate first implementation candidate failed tooling typecheck on a test URL import (183 unit and 17 Chromium cases passed). The writer's corrected candidate passed typecheck/build, 184/184 focused unit and 17/17 Chromium cases before review. None of these runs evaluated a model.

**Final code identity.** Git tree `a22e6591c8b9f3e102b3765181fb41db7bb9d90c` = baseline plus exactly 12 changed frontend and test inputs. Their manifest SHA-256 is `18ee9a28424c689ec1340f8fa93ff8e4f1ddfc4528f62e622992a7666051812b`; unified diff SHA-256 `10360d8c943c24c32748707105e687fd2898b9cfd754d91c4e9bad6914660246`. Matched the manifest against both snapshot and checkout. Only story records, sprint tracking and four public-fictional entry screenshots differ from that tree at commit.

**Post-review verification.** Disposable tracked-source export, copied pinned dependencies/browser, checked private PID/procfs, disposable passwd HOME, masked home/runtime/sysfs and lo-only network. DB helper refused nonfixture before opening D1. Four typechecks and frontend build passed. Entry transport, passage projection, canonical results and admission: **185/185** Vitest. Portfolio entry and passage viewer: **18/18** Chromium. Additional diagnostic shell: **7/7**, excluding the Git-history activation scenario (not run). Log SHA-256 `be20e3403ec4b2b0e63059c6731d8ffdcdfa12a52e95e60a019e3f94ba8dc182`; additional checks log `87649ec178b5df830d03d569d3d98e9a56d721d97e93b0da51c9de2f75fbc9d0`. Not a green full suite.

**Additional historical integration: failed, not end-to-end evidence.** `conversations.spec.ts -g 'real D1 complete results'`: its 0005→0006 assertion passed; execution reached `conversation-results-runtime.mjs:469` after sequential D1 assertions on reindex, rename, withdrawal and saved original provenance. The dedicated historical Chromium POST/GET/replay phase did **not** run: its explicitly requested `chromium-1248/chrome-linux64/chrome` was absent (the UI suite used installed Chromium headless shell). No install, substitute, retry or operator work requested. Isolated Wrangler also reported a failed DNS lookup for its optional Request.cf placeholder; no external connection or inference.

| Epic criterion | Proven here | Limits |
|---|---|---|
| AC1 — readable, distinct, inert turns | Real workerd/D1 answered, clarification and failed receipts compared to authenticated saved results; partial and refused rendered from fixed projections. Ordered multiline text, literal markup-like labels, preserved spaces and computed ink/white/assistant colors checked. Missing, mismatched or malformed receipts do not produce an answer. | Labels describe status, not assessment of the answer. No actual provider or general security/accessibility certification. |
| AC2 — passage controls | Five citation edges → four distinct file buttons on desktop, one accessible four-file button on mobile with three circles and +1. CSS overlap is 0.55rem for a 1.8rem circle. Same-title files remain distinct by saved identity. | Sizes/labels are provisional, not human design approval. |
| AC3 — saved passage only | Opening/replacing selects the requested file, keeps both cited sections, excludes another passage, directly exposes the sole source. Keyboard and touch row expansion tested, no live fetch in component fixture. | No full docs, summaries or catalog lookup; only response-local citation membership, not entailment. |
| AC4 — standalone fictional context | Actual middle chunk from pinned public `projet-prototype-prets.md`: removed live publication, then compared viewer text exactly to saved excerpt including its repeated fictional/non-BC warning. Asserted saved `;context:` location and other labeled provenance. | This verifies the three-sheet development path, not arbitrary sources or facts about BC. |
| AC5 — viewer placement, focus and position | 1600px margin, 1100px/390px modal; stable trigger/column geometry, bounded tab cycle, same-passage replacement and repeated activation. Resizing an open viewer preserves row focus, closing returns to the visible passage trigger. Receipt does not pull the scrolled fixture down; pending composer focus handed to answer heading if necessary. | Emulated viewports and touch, not all devices, maximum-length inputs, mobile keyboards or assistive technologies. |
| AC6 — historical provenance and interaction | D1 saved receipt survived publication removal and subsequent authenticated GET. Reindex/rename assertions reached before the additional integration's browser-launch failure above. Nullable projection groups by path **and** revision; unavailable values remain null/explicitly unavailable. Browser checked English excerpts, row expansion, keyboard containment, inert markup and close/replace. | Legacy **display fixture only**; current D1 requires non-null provenance. No historical full-browser replay pass in this run. No screen-reader sign-off. |

**Handoff.** Read-only: inspect the [entry and guide captures](handoff-2-12-to-2-14-evidence.md#séance-finale-avec-bc) and criterion table. For a future isolated technical walkthrough, `node_modules/.bin/playwright test portfolio-entry.spec.ts passage-viewer.spec.ts` on a prepared disposable snapshot starts only fixture services: choose a suggested question, compare the displayed middle passage and saved source; at narrow width expand the count and close to its trigger. Unconfigured default Worker must say unavailable, not present a fixture answer. No live call, server startup on the operator checkout or BC technical action required. Keep story and sprint in-progress: local contracts delivered, historical runner limitation recorded; actual evaluation before UI completion, human copy/accessibility review and publication approval remain open and distinct. No authorization for public sharing or another story is implied.
