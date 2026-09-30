# UX Discovery Checkpoint — Candidate Copilot

Accepted as an approved UX sketch on 2026-09-30 at the user's request. Confirmed layout, interactions and selected v2 appearance have been distilled into lightweight draft spines. Detailed coaching is stopped; content will evolve later. No production-ready finalization or reviewer gate occurred. Read `.memlog.md` as the canonical decision record; this checkpoint summarizes the latest state, not every historical proposal.

## Workspace and artifacts

`docs/_bmad-output/planning-artifacts/ux-designs/ux-candidate-copilot-2026-09-17/`

- `DESIGN.md` and `EXPERIENCE.md`: populated lightweight spines, `status: draft`, `approval: sketch-approved`, updated 2026-09-30. Approved layout/style/interaction base, not final copy or production-ready UX.
- `.working/sketch-coverage-2026-09-30.md`: mechanical token/link/component/shape checks and deliberately deferred coverage; not a full review or certification.
- `.memlog.md`: canonical discovery log, appended through `memlog.py` only.
- `.working/extract-brief.md`, `.working/extract-prd.md`, `.working/extract-architecture.md`: confirmed source extracts.
- `imports/candidate-copilot-maquette/` and `imports/candidate-copilot-maquette-v2/`: preserved mockup inputs, inspiration rather than contracts.
- `.working/wireframe-conversation-2026-09-18.html`: local-browser static preview, four readable views (desktop/mobile, projects closed/open).
- `.working/flow-conversation-2026-09-18.excalidraw`: editable wireframe; `.working/flow-conversation-2026-09-18.svg`: full atlas.
- Wireframes use placeholders and neutral low-fidelity styling, not finalized copy or visual tokens. Their dashed project-access control and library were approved on 2026-09-21; the original artifact annotations still describe the pre-approval proposal.
- `.working/wireframe-resources-2026-09-30.html`: interactive local preview of the confirmed multi-resource direction, with desktop/narrow-desktop/320px/390px mobile and illustrative closed/open, overflow and waiting scenarios. Opened via `xdg-open`; user approves its disposition/layout on 2026-09-30, not neutral styling, copy, exact dimensions or final tokens. Companion `.working/flow-resources-2026-09-30.excalidraw` and `.svg`; 188 unique elements with two-character indices, SVG XML checked.
- `.working/resources-validation-2026-09-30/`: headless Chromium checks and screenshots for add/remove, drafts/snapshots, reading/focus preservation, overlay geometry and overflow. No backend or real mobile-keyboard/touch/screen-reader testing. Copy, dimensions and overflow cues remain illustrative.
- `.working/visual-style-v2-reference.md`: extracted source CSS palette, fonts and treatments; separates chosen v2 appearance from unapproved layout/copy and new-component mappings.
- `.working/mockup-resources-v2-style-2026-09-30.html`: v2 appearance applied to the approved conversation/resource layout, with interactive desktop/mobile scenarios and provisional content. Opened via `xdg-open`; user approves this styling application on 2026-09-30, including the reference-derived token/library appearance, not final copy or precise dimensions. Original wireframes/imports preserved.
- `.working/style-validation-2026-09-30/`: screenshots and headless interaction/geometry/font checks at desktop/900/390/320px; inherited Manrope, Newsreader and DM Mono actually rendered. No physical keyboard/touch/screen-reader or backend/recovery/persistence checks; remote font delivery remains environment-dependent.
- No finalization, reviewer gate, or final review has occurred. No product implementation was performed.

## Working approach

- Conversation in French; documents in English.
- Coaching path stopped at the user's request after sketch acceptance. Do not restart content discovery or detailed journeys/states coaching unprompted. Content/copy will evolve incrementally later.
- Public recruiter-facing responsive web experience, French UI. Mobile and desktop have equal functional and reading-quality priority.
- Trust/privacy are important source constraints; an explicit user stakes classification remains unconfirmed.
- Do not present assistant suggestions as approved decisions. Do not repeat questions already resolved below.

## Visual direction

- Warm paper ambience, intimate literary/CV feeling, clear sections, minimal and polished; invites conversation rather than feeling like a cold technical SaaS product.
- Avoid generic AI-site tropes, especially purple gradients.
- User chooses the imported v2 colors, fonts and overall style while retaining the jointly approved layout and reworking content later. Reference palette: paper `#f3f0e8`, ink `#19211d`, green `#1d5b44`, mint `#c9f2dc`, warm white `#fbfaf6`; Manrope prose/controls, Newsreader literary headings, DM Mono metadata. Full exact extraction in `.working/visual-style-v2-reference.md`. Do not copy v2's sidebar/layout or unapproved content. Resource-component visual treatment was approved in the styled preview. Exact dimensions and large-hero treatment remain deferred; spines are approved sketches, not finalized.
- Two main surfaces: an uncluttered landing, then a dedicated central conversation with a smooth transition.

## Landing: current decisions

- Light guided entry: positioning plus 2–3 self-contained suggested questions, no skills/proof band.
- Acknowledge a strongly developer-oriented profile without reducing it to Oracle/SQL labels or a particular target role.
- Remove the standalone start button. The questions card becomes the single conversation-entry area, including a visually distinct free-entry option.
- Free entry opens the conversation without sending a message, with the guide visible. Visitors can write context and question together; no extra landing form and no mandatory context step.
- Exact questions and labels remain deferred. Earlier assistant examples about transferability or comparing a job description are not approved capabilities/copy.
- V2's text-left/card-right layout is the working reference; the latest discussion refined the card and removed the standalone button, not precise dimensions.

## Conversation composition

1. Compact candidate identity at the top: badge, name, function, location.
2. Collapsible usage guide, “Quelques repères”.
3. Spacious central conversation, without the v2 presentation sidebar.

- Identity remains on mobile using wrapping/stacking, rather than disappearing. It scrolls with the page, not sticky.
- Keep comfortable text line lengths and margins on wide screens; central does not mean edge-to-edge text.
- Replace “À vous de mener l’entretien”; replacement wording is intentionally deferred.

### Guide

- A short 2–3 sentence guide encourages visitors to explain their context, then explore the documented profile.
- On the conversation page, above and outside the transcript, not on the landing or inside an assistant message.
- Open on first arrival, including entry via a landing question; manually collapsible; no automatic disappearance after the first reply.
- Guidance is optional. The LLM must never assess candidate-role fit or recommend hiring; the user calls that a complete product failure. Explicit visitor context may guide factual exploration, not inferred personalization or suitability judgments.

## Citations: approved behavior

- Citations relate to the supported passage, not a generic list for the entire conversation.
- Desktop: one clickable token per source with the file title visible. Opens the relevant file, section, and excerpt(s) in the source panel.
- Another desktop token replaces panel contents, never stacks windows. Closing restores focus to the trigger and preserves reading position.
- Mobile: round tokens grouped into one button, no visible file labels. Each subsequent circle covers about one third of the previous; show at most three circles then `+N` for additional distinct sources.
- The group has a comfortable touch target and an accessible label announcing the actual source count.
- Mobile activation opens a bottom sheet with sources deduplicated by file for that passage. One row per file, with filename and cited section titles; expanding reveals the relevant excerpt(s) in place. A single source may show its excerpt directly.
- No separate source page, no dependence on hover, no additional generated source summaries.
- Responsive panel placement: if enough right-margin space exists, the panel slides into that margin without covering text, moving the chat, or changing its reading width. Otherwise use the bottom-sheet overlay, even on desktop.
- Choose by available space, not device type. Preserve reading position on open/close; no reflow-driven ping-pong.

## Reading, waiting, and composing

- Never force a visitor back down when they have scrolled up. A new answer must not disrupt the text they are reading. Initial viewport treatment when already following the latest turn is not fully specified.
- Waiting: assistant badge plus three small animated dots, no explanatory text needed for normal processing. This is generic activity, not backend-stage reporting or streaming; answers arrive complete under the runtime contract.
- Composer remains editable during processing, but sending is disabled until the previous result is received and authoritative state permits a new message. Preserve drafts, no queue or automatic submission. Unknown outcomes still follow the runtime recovery contract.
- Composer stays visible at the bottom while browsing, growing vertically with content up to a cap.
- User cites their GPT interface as the desired composer reference. Do not claim measured GPT dimensions. Tentative “70” mobile / 40% desktop figures are not final; validate with the mobile keyboard open and available viewport space.
- Internal scrolling after the cap was proposed; precise sizing, keyboard behavior, and interaction details remain for validation.

## Privacy access

- Permanently visible, discreet “Confidentialité” link in the conversation header, on desktop and mobile; not hidden in a menu or the guide, not a second block above the chat.
- Opens a dedicated dialog containing retention/manual BC review information, data-processing details, conversation identifier, and “Demander la suppression de cette conversation”.
- Deletion handling must be described as manual and non-immediate.
- Access remains available during processing and after the turn limit; closing preserves reading position and draft.
- Exact disclosures and pre-use disclosure placement remain to be finalized against PRD/runtime requirements, including retention exceptions and provider processing.

## Projects: explicit PRD override and historical baseline

- User approved superseding the PRD's mandatory 2–3 project highlights on the landing. Projects are accessible on demand from the conversation, not a permanent showcase on either surface.
- Rationale: avoid clutter, irrelevant signals, and premature role framing while allowing visitors to choose their exploration angle. Do not automatically select projects supposedly suited to a role.
- This override is in `.memlog.md`; the PRD file itself has NOT been edited. Carry the reconciliation into handoff.
- Approved wireframe presentation: a discreet project-library access opens a short list using the same responsive side-panel/bottom-sheet mechanism as sources. Project name plus a short factual description and a selection control, not technology badges or large illustrated cards. Exact copy and dimensions remain deferred.
- Historical selection behavior inserted a literal project prefix; it has been superseded by resource tokens without modifying typed text. Do not revisit prefix insertion.
- The former closing-on-selection proposal has been superseded by an immediately updated library that stays open. Preserve existing drafts.
- Approved project-library access: lower-left toolbar of the composer, opposite Send, on desktop and mobile.
- IMPORTANT: only the landing's 2–3 suggested questions are firmly established. Earlier conversation hints were discussed, but no permanent suggestion row, its contents, or its location has been approved. Do not add one by assumption or refer to it as an existing placement anchor.

## Resource-context evolution after wireframe approval

The project layout above is the approved wireframe baseline. The following decisions supersede literal project-prefix insertion and the tentative single-resource limit:

- Resource library direction: projects initially, no file upload; other resource types are not defined. `+ Ressources` remains the proposed access label, not finalized copy.
- Multiple resources may be selected. Each click adds or removes exactly one resource with its corresponding token (1:1), immediately, without an Apply step. The library stays open for continued selection. No numeric selection cap has been approved.
- Selected resources form a strict common evidence scope: only their mapped public documents may support the answer. Never silently supplement with other projects or general sources. If evidence is missing inside that scope, say so. With no selected resource, the whole deployed Public Knowledge Base is eligible, never the Web or private material.
- Active tokens sit inside the composer above the typed-text area and leave the draft untouched. User wants compact tokens rather than the supplied reference's large file card. They occupy one horizontally scrollable row, not wrapped lines or collapsed +N overflow. User cites GPT mobile as an interaction reference, not a verified specification. The token area stays visible; individual tokens may be offscreen until scrolled. Individual removal and persistence across sends until explicit removal remain approved.
- Imported placement reference: `imports/composer-reference/resource-token-placement-2026-09-30.png`. It is a user-supplied chatbot attachment screenshot, not approval of file upload or dark styling. Exact token dimensions and overflow affordances remain open.
- Historical tokens show the immutable selected-resource snapshot for each submitted question, inside the answer container immediately before answer text. Show them from waiting onward and retain them in error states. No removal controls; wrap on mobile rather than hiding. They indicate the authorized scope, not the documents actually cited. With no selection, show no global label or empty scope band. Exact labels remain deferred.
- Composer resources, like draft text, may change while a previous turn is processing. Those changes affect the next submission only; the in-flight turn and any recovery keep the original resource snapshot. Response arrival preserves the next-turn draft and active selection. Send still follows authoritative admission state; no queue or automatic submission.
- User expects same-tab refresh to preserve the ongoing experience, including active selection. Existing contracts restore canonical transcript/processing state, but preserving unsent draft, current selection and view state requires explicit additions. Detailed view-state/lifecycle rules remain to be specified. No durable cross-visit restoration is approved; reload must reflect current server state, not freeze it.
- Architecture check: `.working/resource-context-architecture-check.md` records the earlier compatibility analysis; its hard-filter versus hint question is now resolved in favor of strict scope, and its one-resource examples are superseded by multiple selection. Stable IDs, resource-to-evidence mappings, per-message snapshots, API/recovery identity, strict retrieval filtering and session-state additions still need explicit contract reconciliation. Architecture and PRD remain unchanged.
- Removing explicit context changes future submissions, never historical questions, answers or evidence.

## Sketch acceptance and future work

The user explicitly accepts this UX as a rough draft, keeps the wireframe as-is and defers evolving content/copy to later work. `DESIGN.md` and `EXPERIENCE.md` now capture the approved base with draft/sketch-approved status. No further UX question is pending for this session; do not restart content, detailed journey/state/privacy discovery or settled layout/style choices unprompted.

Implementation follow-ups remain: reconcile resource IDs/catalog/evidence mapping, strict multiple-resource retrieval, submitted scope snapshots/API/recovery identity and reload/session storage with architecture/runtime; carry the approved landing-project override into PRD reconciliation. No upstream files were changed.

Details intentionally deferred include exact content, initial project catalog, hero sizing, complete journeys/states, source/privacy visual coverage, accessibility and keyboard-open/composer measurements. Required privacy disclosures, safe recovery and source boundaries still apply before release; sketch acceptance does not waive them. These gaps do not block accepting the sketch. No assumptions should be silently promoted into final contracts.
