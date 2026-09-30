# UX update — source extraction and PRD coverage map

Status: extraction only; not a PRD amendment or production-readiness approval. `prd.md` and upstream contracts are unchanged.

## 1. Sources and authority

Read completely:

- **E** = `../../ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md` (146 lines; updated 2026-09-30).
- **D** = `../../ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md` (109 lines; updated 2026-09-30).
- **M** = `../../ux-designs/ux-candidate-copilot-2026-09-17/.memlog.md` (87 lines; updated 2026-09-30).
- **P** = `prd.md` (460 lines; updated 2026-09-17).

References below identify source section and current, 1-based line numbers. M is canonical for UX decisions; product/runtime sources govern their own domains (E, Foundation, L22–24). Later confirmed decisions supersede earlier proposals. The task's explicit approvals agree with M L58, L69–80: immediate multi-resource 1:1 selection without draft mutation; strict selected-only evidence or the entire deployed public KB, never Web/private material; immutable per-question scope; editable next-turn text/resources while pending; same-tab continuity without durable revisit restoration; on-demand projects instead of a mandatory landing showcase.

**Approval is not validation:** E L16, L38, L68, L99; D L41; M L81–87 explicitly distinguish an approved sketch and limited mock checks from backend/persistence, physical keyboard/touch/screen-reader testing and complete journey/privacy coverage. “Approved behavior” below means a confirmed interaction decision, not an implemented or user-tested runtime guarantee. No architecture files, linked mocks or compatibility report were independently inspected for this extraction; upstream-gap claims are attributed to E/M.

## 2. Approved interaction decisions, PRD gaps and acceptance expectations

All rows are extracted decisions. Acceptance expectations express those decisions without inventing detailed measurements, final copy or new implementation contracts. Existing FR identifiers are mapping targets, not reassigned IDs.

### A1. Two-step entry and optional guidance

**Sources:** E, Information Architecture L30–36; Component Patterns L52, L54; Voice and Tone L42–44; Key Flows / Enter and explore L105–112. M L25–33, L55–56. D, Layout & Spacing L69–71.

**Approved:** light landing, then dedicated conversation. One entry card has 2–3 self-contained suggested questions plus a distinct free-entry option; no standalone start button, extra landing form, skills/proof band or mandatory context step. Activating a suggestion submits that question under ordinary admission rules; free entry opens conversation without sending. A short 2–3 sentence guide is above/outside the transcript, open on first arrival through either entry path, manually collapsible/reopenable under “Quelques repères,” and never automatically hidden after an answer. It encourages optional visitor-provided context, not inferred personalization or fit assessment.

**PRD map:** FR-1/FR-2 L76–91, FR-5 L116–123 and UJ-1 L46 partially cover purpose, examples and unconstrained anonymous entry. Entry activation and guide lifecycle are absent; FR-2's placement of guidelines/capability cues needs reconciliation with light landing/conversation guidance. Preserve FR-1's pre-question purpose explanation.

**Accept:** suggestion submits only its self-contained text once subject to admission; free entry admits no message. Both show the open guide. Collapse/reopen works without creating transcript messages; receiving an answer does not dismiss it. A visitor can ask without supplying context. No static narrow-role skills band or permanent conversation suggestion row is introduced. Exact questions and wording remain deferred.

### A2. Projects on demand, not a showcase

**Sources:** E, Information Architecture L32, L36; Component Patterns L59; Key Flows L109, L116. M L58, L63, L66, L70–72. D L69, L93, L96.

**Approved:** projects are accessible on demand within conversation, never mandatory landing highlights or a permanent showcase on either surface. Access is in the composer's lower-left toolbar opposite Send. The resource library initially contains projects, with names, short factual descriptions and selection controls. “+ Ressources” is provisional wording; no upload or defined future resource type is approved.

**PRD map:** directly supersedes FR-3 L93–100, UJ-1 L46, §7.1 L400 and §10 question 1 L453. FR-2 still requires light factual guidance; it must not be used to reinstate the rejected showcase. SM-2 L430 should reference on-demand project exploration rather than assume landing project visibility. Catalog/display selection work remains, but “choose 2–3 landing projects” is no longer a required launch task.

**Accept:** recruiter can open a factual project/resource library from the composer on desktop/mobile. Landing has no required project highlight list; conversation has no permanent project showcase. Library access never uploads, sends or adds project-name text to the draft.

### A3. Immediate multi-resource add/remove and persistence

**Sources:** E, Component Patterns L57–59; Evidence eligibility L64; Interaction Primitives L90; Key Flows / Select scope L114–118. M L66, L70–72, L79–80. D L94–96.

**Approved:** multiple resources; each add/remove changes exactly one resource and its corresponding active token, 1:1. Library stays open for further changes. No Apply/batch confirmation, arbitrary numeric selection cap, auto-send or typed-text mutation. Each token has an individual minus control; selection persists across explicit sends until removed. No literal project-prefix insertion remains.

**PRD map:** no resource-selection requirement exists. Add coverage adjacent to FR-3/FR-6/FR-9 and MVP scope; do not equate selecting resources with submitting a turn.

**Accept:** selecting A and B produces two individually removable tokens and two selected library entries without changing draft text; removing A removes only A. Library remains open after each action. Send does not clear B; B remains active for the next question. Repeating selection actions must preserve the one-resource/one-token relationship rather than create duplicate chips. No approved numeric cap is inferred from earlier tentative one-resource discussion.

### A4. Strict evidence eligibility and empty-selection semantics

**Sources:** E, Voice and Tone L44; Evidence eligibility L64; Key Flows L112, L118. M L69–71.

**Approved:** nonempty selection defines a strict common scope: mapped public documents of any selected resource may contribute; no outside resource/general public source may supplement. Empty selection, including first arrival and removal of the last token, permits the whole deployed Public Knowledge Base only, never Web/private evidence. Insufficient evidence is stated within the eligible scope, not “the information exists nowhere.”

**PRD map:** FR-9 L163–170 already excludes outside/private evidence but lacks resource-subset eligibility; FR-11 L183–190 already requires honest insufficiency but needs selected-scope qualification. FR-12 redirection and FR-6 follow-ups must not silently relax the current question's evidence scope. This is an additional restriction, not a contradiction of public-KB-only grounding.

**Accept:** with A/B selected, retrieval and factual answer support are limited to their mapped public documents, even if C would answer better. Report insufficiency without falling back to C. With no selection, public KB is eligible; no Web search/private material. Removing the final resource changes only future submissions. Changing resources never rewrites earlier answers/citations.

### A5. Immutable per-question scope and historical chips

**Sources:** E, Component Patterns L55, L58; Evidence eligibility L64; State Patterns L73–76; Interaction Primitives L93; Key Flows L117–118. M L73–76. D L95, L108.

**Approved:** snapshot selected resources at explicit submission. Every selected resource remains associated with that question/turn as an immutable historical token inside the answer container immediately before content, visible from waiting onward and retained in errors and completed results. Historical tokens have no removal controls, wrap on mobile, and are not citations. No selection produces no historical token, global label or empty scope band.

**PRD map:** FR-10 L179 protects historical excerpt text/provenance, not submitted resource scopes. FR-6/FR-8/FR-10/FR-18 need scope snapshot/history/replay coverage; glossary needs to distinguish resource selection, submitted scope and evidence citations. E L83 explicitly says API/persisted history/GET/replay extensions are not existing support.

**Accept:** submit with A/B; historical A/B appears during waiting and survives error/success and same-tab replay. Editing/removing active A/B later cannot change that history, answer or cited evidence. Historical chips are noneditable and every chip is visible via wrapping on mobile. A global-scope turn renders no scope band while still using public-only eligibility.

### A6. Editable next-turn draft/resources while pending

**Sources:** E, Component Patterns L56; State Patterns L73, L76; Interaction Primitives L93; Key Flows L118. M L45, L76.

**Approved:** while a prior question processes, text and resource selection remain editable for the next question only. Send remains disabled until authoritative state permits another message, including unknown-outcome recovery. Response arrival preserves the current next-turn draft and selection. No queue or automatic submission.

**PRD map:** FR-6 L131 already requires single processing/no queue/disabled Send; §5.2 L348 preserves draft. Missing: affirmative editing availability, resource editing, immutable pending scope and response-arrival preservation of both.

**Accept:** submit A with text Q1, then draft Q2 and select B while waiting. Q1 still uses A; historical A remains. Completing Q1 neither clears Q2 nor changes B, and does not send Q2. An unknown outcome cannot unblock competing Send merely because the browser timer expired.

### A7. Recovery and technical retry remain distinct

**Sources:** E, State Patterns L74–78; Upstream work L83; Interaction Primitives L93; Key Flows L112. M L76–77.

**Approved/inherited:** unknown outcome retains the original request identity, submitted question and immutable scope; manual recovery reuses that submission, never current next-turn text/selection. No automatic retry, guessed failure or blind new-turn admission. Only a received, recorded recoverable technical failure may offer retry as a NEW logical turn. Answered/partial/refused/clarification results have no technical retry action.

**PRD map:** FR-8 L153–155, FR-18 L263–265 and §5.1 L337 already distinguish recovery/new retry and accounting. Scope is absent from recovery/idempotency identity; extend coverage without changing this distinction. Scope handling for explicit new-turn technical retry is expressly unfinished (E L75), not an approved policy to silently copy either current or historical selection.

**Accept:** recovery after interruption uses original Q1/A even if composer now contains Q2/B; displays/adopts one authoritative submission without consuming another logical turn. Recorded-failure retry is explicit and consumes a new admitted turn. No retry button on a refusal/clarification/partial answer. New-turn retry scope behavior needs a documented contract and test before implementation acceptance.

### A8. Same-tab continuity, not durable revisit storage

**Sources:** E, State Patterns L77–80; Upstream work L83. M L77. Task explicitly confirms no durable revisit storage.

**Approved:** same-tab reload preserves the ongoing experience, particularly active selection, rather than resetting it. Unsent draft/current selection and view-state continuity require session-scoped extensions and reconciliation with authoritative server transcript/processing. Display each submission once; never duplicate-send. No durable cross-visit restoration; a new visit/session still starts a new UUID. Detailed view-state/lifecycle semantics remain pending.

**PRD map:** FR-18 L259–266 already distinguishes new visits from same-tab transcript/processing restoration. Its L263 “retain just that pending question and its submission identity” is too narrow for unsent draft/selection continuity. Reconcile session continuity with §5.3 L356–361 (no durable identity/tracking), not with accounts, local durable transcripts or revisit restoration.

**Accept:** same active-tab reload retains current draft/selection, restores server-recorded transcript/processing and original pending question/scope when needed, and causes no extra send or duplicate display. After reload, inherited read-only observation is bounded (about 3-second checks, at most 45 seconds, nonoverlapping); error/terminal/limit stops it and unverifiable state offers manual verification. New visit starts fresh rather than restoring old transcript/draft/resources. Expired/deleted/inaccessible conversation is neutral; do not silently create a replacement or forward pending content.

### A9. Composer visibility and active-token overflow

**Sources:** E, Component Patterns L56–58; Evidence eligibility L64; Interaction Primitives L92; Responsive & Platform L144. M L53–54, L79–80. D, Layout & Spacing L73; Components L93–95.

**Approved:** composer stays visible at bottom while browsing and grows vertically to a bounded cap. Active tokens are compact, above typed text inside composer, in ONE horizontally scrollable row; no wrapping or collapsed +N representation. All selected resources remain represented/reachable and individually removable, though some can be offscreen. Hide active-token area when empty. Historical tokens have separate mobile wrapping behavior.

**PRD map:** composer growth/visibility/token layout absent; add interaction/NFR acceptance, not fabricated size limits. E L92/L144 and D L73 defer cap, breakpoints, keyboard-open geometry and overflow cues; M L53's tentative 70/40 figures are not ratified.

**Accept:** long drafts stop expanding at an implemented bounded cap without taking over the whole experience; selected tokens stay in one row above draft. Overflow can be navigated and every token removed. Empty selection leaves no active empty band. Verify narrow/mobile keyboard-open usability separately; exact cap/geometry is not supplied by this extraction.

### A10. Passage-local citations and excerpt viewer

**Sources:** E, Information Architecture L33; Component Patterns L60–61; Interaction Primitives L89–91; Accessibility Floor L97; Key Flows L110. M L38, L40–43, L52. D L81, L97–98.

**Approved:** desktop has one clickable file-title token per source beside the supported passage, with essential information not hover-only. Mobile has one passage-level button containing overlapping circles (about one-third cover), at most three then +N; its accessible label reports actual distinct-source count and all sources remain inspectable. Viewer content is relevant to the activated passage, deduplicated by file, with filenames/cited section titles and inline row expansion of excerpts; a single source shows its excerpt directly. No generated summary/full source page. Another citation replaces viewer content, never stacks windows. Closing restores trigger focus and reading position.

**PRD map:** FR-10 L172–181 covers inspectable excerpts/history but not passage associations, distinct-file grouping, activation, progressive disclosure or viewer lifecycle. Existing full-source-card/document exclusion (L178; §6 L391; §7.2 L414) remains compatible: this is an excerpt-only viewer, not full-source browsing.

**Accept:** activating a citation displays only that passage's relevant files/sections/excerpts, not all conversation sources. Duplicate citations from one file make one file row; multiple relevant excerpts are retained. Single-source activation reveals excerpt without unnecessary row-selection step. Mobile >3 distinct sources shows +N but exposes all files; announced count equals distinct files. Another citation replaces the current content; closing restores focus/reading position. Historical excerpt text/provenance remain the recorded version, per existing FR-10.

### A11. Non-displacing panels and reading-position preservation

**Sources:** E, Component Patterns L61; Interaction Primitives L90–91; Responsive & Platform L144. M L44, L52, L63. D L73, L106.

**Approved:** source/resource panels occupy available right margin without covering, shifting, reflowing or changing chat reading width. When room is insufficient, use a bottom-sheet overlay, even on desktop; placement depends on available space, not device label. Opening/closing preserves reading position. Closing resource/source surfaces restores focus. Never pull a scrolled-up reader down when a new answer arrives; latest-following placement remains unspecified.

**PRD map:** absent from FR-10 and §5.2; add reading/focus/responsive acceptance. A bottom sheet is an explicitly permitted overlay, not a reason to shift the transcript.

**Accept:** wide-window panel opens without transcript movement/width change; narrow desktop/mobile uses sheet. Opening/closing and selecting a different passage do not produce ping-pong scroll. A reader examining an earlier turn stays there when an answer arrives. Do not invent automatic latest-turn scrolling behavior where sources leave it unspecified.

### A12. Identity, mobile parity and central conversation

**Sources:** E, Foundation L20; Information Architecture L31; Component Patterns L53; Accessibility Floor L97; Responsive & Platform L144. M L34, L48–50. D L71, L90, L107.

**Approved:** compact candidate identity (badge, name, function, location) at top, then guide, spacious central conversation; no permanent presentation sidebar. Identity remains on mobile via wrapping/stacking, scrolls with page, not sticky. Desktop/mobile both support long-answer reading, sources, guide, privacy/deletion and recovery.

**PRD map:** anonymous web/UI language are covered (FR-5; §5.4); explicit responsive parity, identity treatment and reading layout are absent. Source visual approval is not permission to copy v2's hidden mobile identity/sidebar.

**Accept:** complete functions remain usable on mobile and desktop; identity fields remain visible in responsive composition, not hidden, and identity does not stick over reading content. Long answers/excerpts remain readable with comfortable line length/margins; no permanent introductory sidebar is restored.

### A13. Working indicator and completed-result safety

**Sources:** E, Component Patterns L55; State Patterns L73–75. M L46. D L92.

**Approved:** generic assistant badge with three small waiting dots; no explanatory message needed for ordinary waiting, invented backend stages or streamed answer tokens. Completed result arrives whole. Safe untrusted-text rendering; answered/partial/refused/clarification are outcomes, not technical failures.

**PRD map:** FR-8 L148–155 already covers working visibility, no invented stages, atomic complete results and retry distinction; §5.3 L361 covers untrusted model output. Refine “working message” wording to allow the approved visible indicator. Three dots do not remove the need for understandable timeout/error/limit states or accessible working-state information.

**Accept:** normal waiting shows activity with historical scope; no invented progress assertions or partial answer stream. Complete result and evidence render only under existing recording/check rules. Technical failures remain professional without raw errors. Actual accessible announcements and reduced-motion handling require implementation verification; visual-dot approval is not that verification.

### A14. Permanent privacy dialog and deletion access

**Sources:** E, Information Architecture L34; Component Patterns L62; State Patterns L79–81; Privacy release requirement L85; Key Flows / Privacy and deletion L127–133. M L47. D L99.

**Approved:** discreet permanently visible conversation-header “Confidentialité” access on both sizes, not hidden in menu/guide or a second block above chat. Dedicated dialog explains retention/manual BC review and real processing, shows UUID and deletion-request control. Access remains during waiting and after turn cap. Handling is manual/non-immediate; closing preserves reading position and draft.

**PRD map:** FR-16–FR-20 L236–292 and UJ-4 L52 cover disclosure, UUID, idempotent manual deletion and access during processing/cap, but not persistent header/dialog placement or close preservation. FR-16 L241/UJ-1 L46 still require discoverable timely disclosure; a dialog scaffold alone is insufficient pre-use coverage.

**Accept:** header link available on desktop/mobile while processing/at cap; dialog exposes current UUID and explicit manual deletion request. Close does not clear draft or move reader. Repeat request keeps same request/date and truthful open/handled state. Before launch, actual copy covers BC storage/review, 90 days from creation, provider processing, temporary IP abuse counter and indefinite minimal deletion-audit exception. Full request pending/error/handled variants and exact pre-use placement remain follow-up work, not waived requirements.

### A15. Keyboard/accessibility floor

**Sources:** E, Interaction Primitives L89–92; Accessibility Floor L95–99; Responsive & Platform L144. D L57, L81. M L34, L40–44, L82, L85–87.

**Approved:** desktop/mobile parity, no hover-only essential information, comfortable mobile citation-group activation with actual-source-count label, focus/reading-position preservation and mobile identity. Implementation floor to verify: keyboard activation of entry/resource/citation/privacy controls and token overflow; meaningful expanded/selected/disabled labels; logical reading/focus order; dialog/sheet focus containment/restoration; readable contrast, visible focus, zoom/reflow and non-color state information.

**PRD map:** no explicit accessibility acceptance currently. Add cross-cutting verification expectations and FR-21 launch checks rather than claim an accessibility audit has passed.

**Accept:** real keyboard, touch and screen-reader checks cover selection/removal/overflow, guide disclosure, citation grouping/row expansion, dialog/sheet entry/exit, wait/error/recovery announcements and disabled Send. Verify target sizes, motion/reduced-motion, focus and zoom/reflow at implementation. No exact size, breakpoint, announcement wording or certification is approved in the source.

## 3. Remaining EXPERIENCE coverage — inherited states and unfinished interactions

Section 2 captures every component and interaction primitive that needs new or more-specific PRD coverage. The following complete the state/flow map without turning inherited constraints or unfinished proposals into new approvals.

| EXPERIENCE source | Existing PRD coverage | Remaining coverage/acceptance work |
|---|---|---|
| Foundation / Voice L20–24, L42–44; Boundaries flow L120–125 | Vision; FR-7 L136–144; FR-9–FR-15 L163–228; §5.4 L367–371; §6 L382–390 | Preserve French UI, question-language answers/original-language excerpts and calm boundaries. Explicit context can orient facts, never candidate-role fit; add scoped boundary/redirection tests when resources are selected. Exact refusal/clarification copy and complete adversarial journeys remain unfinished, not new capabilities. |
| First entry / empty conversation L72; Enter and explore L105–112 | UJ-1, FR-1/FR-2/FR-5 | A1 covers approved activation and guide. Empty/cold-load, entry/loading and rejected-admission presentation still need implementation acceptance; do not claim the mock supplies complete paths. |
| Waiting / Completed L73–74 | FR-6 L131; FR-8 L151–155; FR-10; §5.3 L361 | A5/A6/A13 add snapshots, next-turn edits and indicator. Preserve complete checked/recorded answer/evidence and untrusted-text rendering, including partial/refused/clarification; no technical retry on business outcomes. |
| Recorded technical failure / Unknown outcome L75–76 | FR-8 L153–155; §5.1 L337–340; §5.2 L346–350 | A7 adds original-scope recovery and flags new-turn retry scope policy as unresolved. Finish safe/actionable failure states without raw provider/crash output; never mistake timeout for failure. Keep limits/quota and no-auto-retry rules intact. |
| Same-tab refresh / Reload observation L77–78 | FR-18 L259–266; §5.2 L347 | A8 adds session draft/selection continuity and preserves server authority. Lifecycle/storage/view-state details and detailed observation presentation still need contracts, not durable revisit storage. |
| Limits / invalid input L79 | FR-6 L130–131; FR-19 L276; §5.1 L336–340; FR-21 L315 | Already covered: visible 1,000-character counter/server limit/no silent truncation; 20 admitted turns; 10 new conversations/IP/UTC day and resume explanation; reads/privacy/deletion available at turn cap. Detailed visuals/copy unfinished. Selection/next draft preservation must coexist with authoritative admission; no new numeric resource cap is approved. |
| Unavailable conversation L80 | FR-18 L265 | Neutral expired/deleted/inaccessible treatment, optional new conversation, no silent recreation or pending-content forwarding remain mandatory. Detailed presentation still unfinished; no new restoration exception. |
| Deletion request L81; Privacy requirement L85; Privacy flow L127–133 | FR-16–FR-20; FR-21 L313; SM-4 L435 | A14 adds permanent access/close behavior. Finish truthful pending/error/open/handled presentation and comprehension checks; repeat requests preserve date. Dialog mock is not approved disclosure content. |
| Interaction Primitives L89–93; Accessibility L95–99; Responsive L142–144 | Only broad reliability/safety in §5.2/§5.3 | A9–A12/A15 add overflow, non-displacing surfaces, focus/reading position, identity and parity. Exact caps/keyboard geometry/breakpoints/targets/announcements remain unratified; verify, do not copy illustrative measurements. |
| Upstream work L83 | FR-6/FR-9/FR-10/FR-18; FR-21 L311, L314 | Add resource IDs/catalog/public-document mapping, strict multi-resource evidence eligibility, submission/persisted/GET scope snapshot requirements and scope-aware idempotency/recovery to product coverage; detailed API/storage contracts belong upstream. E explicitly says existing POST carries only requestId/question. |
| Key Flows L101–133 | UJ-1–UJ-4 L44–52 | Update UJ-1 entry/on-demand projects and add select-scope/prepare-next-turn sequence; preserve UJ-2/UJ-3 boundaries and augment UJ-4 persistent dialog access. Complete failure paths/flow coverage remain later work; no named-protagonist narratives required by this sketch. |
| Inspiration L135–140; D Brand/Components L43–47, L83–109 | Simplicity/trust/counter-metrics | Preserve approved appearance/layout; do not import mock capabilities, upload, summaries, prefix insertion, static skill anchoring, forced context, permanent suggestions/sidebar/showcase or fit persuasion. Visual details need not become functional PRD requirements. |

**Evaluation additions to FR-21/FR-22:** verify entry auto-submit versus free-entry no-send; optional/open/manual guide; immediate 1:1 multi-selection/draft preservation; strict mapped-resource evidence and empty public-only scope (including real-model answer support); immutable historical scope from waiting through errors/reload; next-turn text/selection editing without pending mutation; scope-aware original-submission recovery; same-tab continuity/new-visit reset; passage-local distinct-file citations; non-displacing panels/reader anchoring; mobile parity and real accessibility interactions; permanent privacy/deletion access and complete disclosures. Existing deterministic-versus-real-model distinction remains (P L311–312); mock interaction checks cannot certify grounding or persistence. Do not relax launch blocking for critical grounding/privacy/refusal/recovery failures (P L319–326).

## 4. Actual contradictions versus additions/clarifications

1. **Definite approved product override: mandatory landing projects.** P UJ-1 L46, FR-3 L93–100, §7.1 L400 and §10 L453 require or assume 2–3 landing projects. E L36 / M L58 explicitly supersede them with on-demand conversation projects and no permanent showcase. Reconcile all occurrences, including SM-2's project-trigger wording (P L430), rather than merely adding a library requirement while retaining the old showcase obligation.
2. **Session-local storage restriction needs extension.** P FR-18 L263 says retain “just” pending question/identity; E L77/L83 and M L77 require current draft/selection continuity and identify view-state/storage extensions. Pending identity also lacks approved scope. This is an explicit enlargement of permitted current-session state, not permission for durable revisit history or a browser-owned transcript. Existing same-tab authoritative transcript/processing restoration (P L262) is compatible.
3. **Literal presentation tensions to reconcile, not renewed UX decisions.** P FR-2 L86 places guidelines/capability cues on landing; E L30/L54/M L32–33 place the usage guide in conversation and reject a skills/proof band. Starter questions may still provide light factual cues; sources do not ban every landing capability cue. Amend placement wording without inventing a new band or declaring an unsupported blanket capability-cue removal. P FR-8 L148 requests a working “message”; E L55/M L46 approve visible three-dot activity without normal-wait explanatory text. Permit a meaningful working indicator rather than require prose; safe error/recovery text and accessible status information still matter.
4. **Scope is an additive requirement, not a public-grounding conflict.** FR-9's whole deployed public KB is the outer trust boundary; selected-resource subsets narrow eligibility. FR-11's insufficiency rules remain valid, qualified to eligible scope. No approval authorizes Web/private evidence or supplementing outside selection.
5. **Excerpt UI is not a full-source browsing contradiction.** E L61 requires relevant excerpts with file/section disclosure, expressly not full pages or generated summaries. This does not repeal P FR-10 L178 / §6 L391 / §7.2 L414. The resource library is a project-selection surface, not a full public document browser.
6. **Earlier memlog proposals are superseded, not unresolved current choices.** Literal project-prefix insertion (M L59/L63) is replaced by tokens (L66/L70–72/L79); tentative single-resource selection (L65/L68) by approved multiple resources (L70); hint-versus-filter discussion (L67–68) by strict scope (L69–71); historical global label/placement proposals (L73–74) by approved placement/no empty global band (L74–75); hover-dependent file identification (L35) by visible desktop titles (L38/L41). Do not reopen any of these.
7. **No source supports readiness claims.** Sketch-approved status does not override unresolved privacy, accessibility, complete states/journeys or runtime reconciliation. These are remaining acceptance obligations, not contradictions in the approved behavior.

## 5. Editorial/layout sketch boundary — retain, do not reopen

**Settled appearance/layout:** warm paper/literary CV feel, v2 palette, Manrope/Newsreader/DM Mono, restrained rounded surfaces; current approved resource layout and styled conversation preview. Keep two-step entry, central readable conversation, identity/guide order, mobile identity, panel geometry, compact active/historical tokens. D L14–36, L43–65, L67–99; M L82–86. Do not reopen palette, fonts or general disposition, reinstate v2 sidebar/mobile hiding/extra landing content, or infer capabilities from the import/screenshot.

**Deliberately editorial/deferred:** exact positioning, questions, guide/resource labels, refusals/errors and other copy; exact sizes, caps, gaps, radii, breakpoints, font-size ramp, overflow cue, keyboard geometry, overlay/shadow measurements and font delivery/fallback behavior. D L41, L65, L73, L77, L81, L97–99; E L42, L92, L99, L144; M L85–86. “+ Ressources,” resource-band labels and preview claims are provisional. Copy deferral is not grounds to delay sketch acceptance or start fresh UX coaching.

**Validated evidence is limited:** M L81/L84 reports headless mock geometry/interaction/font checks and screenshot inspection; no backend, runtime persistence or real keyboard/touch/screen-reader validation. Citation/private-dialog detail was not fully shown/validated (D L97–99; E L38/L85). Preserve approved behavior as requirements while explicitly carrying these tests forward.

**Safety-required later completion, not optional polish:** truthful privacy/pre-use disclosures, accessible operation, full recovery/limit/unavailable/deletion presentations, strict resource mapping/retrieval, persisted snapshots/idempotency and same-tab reconciliation. E L68–85/L95–99/L103–133 and P FR-16/FR-19/FR-21/FR-22 govern completion. No reopen decision or implementation choice is requested by this extraction.
