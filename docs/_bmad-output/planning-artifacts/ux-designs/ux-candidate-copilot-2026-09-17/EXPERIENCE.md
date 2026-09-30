---
name: Candidate Copilot
status: draft
approval: sketch-approved
sources:
  - ../../briefs/brief-candidate-copilot-2026-09-10/brief.md
  - ../../prds/prd-candidate-copilot-2026-09-11/prd.md
  - ../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md
  - ../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md
  - .memlog.md
updated: 2026-09-30
---

# Candidate Copilot — Experience Sketch

> **APPROVED SKETCH / rough draft.** Preserve the approved wireframe, resource interactions and v2 style. Copy evolves intentionally; complete journeys, detailed states and implementation contracts remain unfinished. Sketch acceptance is not production readiness or accessibility certification.

## Foundation

Public anonymous responsive French web experience, desktop and mobile equally important. React/Vite with native structured CSS and design tokens is inherited from architecture; no component library is imposed. [DESIGN.md](DESIGN.md) supplies visual identity: `{colors.paper}`, `{colors.ink}`, `{typography.body.fontFamily}` and the editorial/metadata roles.

Purpose and boundaries remain in the [brief](../../briefs/brief-candidate-copilot-2026-09-10/brief.md) and [PRD](../../prds/prd-candidate-copilot-2026-09-11/prd.md): factual exploration of BC's documented professional work, not an autonomous representative, hiring recommendation or candidate-role fit assessment. Explicit visitor context may orient factual questions; no inferred recruiter personalization, outside evidence or private material.

Authority: [.memlog.md](.memlog.md) is canonical for UX decisions; confirmed product/runtime sources govern their domains. This sketch supersedes the PRD's required landing project showcase explicitly below; these spines win over mocks on settled UX, subject to pending upstream reconciliation. Runtime constraints below are inherited, not user-tested UX.

## Information Architecture

| Surface | Access and composition |
|---|---|
| Landing | Light positioning plus one Entry card: 2–3 self-contained questions and distinct free entry. No skills/proof band, standalone start button or project showcase. |
| Conversation | Candidate identity at top, Usage guide above/outside transcript, central conversation and bottom Composer. Permanent header privacy access on both screen sizes. |
| Resource library | On demand through provisional “+ Ressources” in the composer's lower-left toolbar, opposite Send. Projects initially; no upload or defined future resource types. |
| Source viewer | Activated by a passage's Citation token, showing only its relevant Source Excerpts. |
| Privacy dialog | Permanent “Confidentialité” header link; handling disclosures, Conversation UUID and manual deletion-request control. |

**Approved PRD override:** projects are available on demand in conversation, not as mandatory 2–3 landing highlights or a permanent showcase elsewhere. The PRD itself is unchanged. No permanent conversation suggestion row is approved.

References: [approved resource layout](.working/wireframe-resources-2026-09-30.html) and [approved styled preview](.working/mockup-resources-v2-style-2026-09-30.html). They illustrate layout, selection, snapshots and waiting, not backend behavior, final content or complete citation/privacy coverage.

## Voice and Tone

French UI, professional, calm and evidence-oriented. Exact positioning, questions, guide, resource labels, refusals and error copy are deliberately deferred. Existing mock text and “+ Ressources” are provisional, not approved claims or final wording. Answers follow the question language where practical; excerpts retain their source language (inherited requirements).

The guide encourages optional visitor context followed by profile questions; never requires context to proceed. Missing/partial evidence is explicit within the eligible scope, not proof that information exists nowhere. Refusals preserve professional boundaries without salesmanship. Privacy/deletion disclosures must be accurate before release: copy deferral does not make source-required disclosures optional polish.

## Component Patterns

Visual counterparts are in [DESIGN.md](DESIGN.md#components); shared names distinguish scope selection from passage evidence.

| Component | Behavioral rule |
|---|---|
| Entry card | Suggested questions are self-contained and enter conversation with that question submitted under runtime admission rules. Free entry opens conversation without sending; guide visible, no extra landing form or mandatory context step. Exact questions deferred. |
| Candidate identity | Badge, name, function and location remain at top on desktop/mobile. Wrap/stack rather than hide; scroll with content, not sticky. |
| Usage guide | Short 2–3 sentence collapsible block, open on first arrival including suggested-question entry. Manually closed under “Quelques repères”; no automatic hiding after an answer. |
| Conversation turn | Submitted question plus answer container; immutable Historical resource token set precedes content from waiting through error/success. Generic assistant badge plus three dots during normal waiting; completed answer arrives whole, no streaming or invented backend stages. |
| Composer | Visible at bottom; grows to a bounded cap. Draft and resources stay editable during processing for the NEXT message; Send disabled until authoritative state permits. Response preserves current draft/selection; no queue or auto-submit. |
| Active resource token | Compact `{colors.assistant-surface}` / `{colors.green}` token above typed text inside Composer, with individual minus. All selected resources represented in ONE horizontal scrolling row; offscreen tokens remain reachable. Selection persists across sends until individual removal. |
| Historical resource token | Immutable submitted scope inside answer immediately before content; no removal controls. Wrap on mobile. With no selected resources, no global label, token or empty band. Not a citation. |
| Resource library | Names, short factual descriptions and immediate selection controls. Each add/remove changes exactly one resource and one active token (1:1); library stays open. Multiple selection, no arbitrary numeric cap, Apply step, upload, auto-send or typed-text mutation. |
| Citation token | Desktop: one clickable file-title token per source beside supported passage. Mobile: one button of overlapping circles, about one-third cover, at most three then +N; accessible actual distinct-source count. Essential information never hover-only. |
| Source viewer | Available right-margin panel without chat coverage, shift or reading-width change; bottom sheet if room insufficient, even on desktop. Deduplicate by file for that passage; filenames and cited section titles, row expansion reveals relevant excerpts in place; single source shows excerpt directly. No generated summary or full source page. Another citation replaces content, never stacks windows; closing restores trigger focus and reading position. |
| Privacy dialog | Permanent access while waiting and after turn limit. Explains retention/BC manual review and data processing, displays Conversation UUID and deletion-request control. Handling is manual, non-immediate; close preserves reading position and draft. `{colors.warm-white}` surface, not a separate block above chat. |

**Evidence eligibility:** a nonempty selected set strictly limits eligible evidence to mapped public documents of those resources; any selected resource may contribute, none outside may supplement. Empty selection means the whole deployed Public Knowledge Base only, never the Web or private content. Removing the last token returns future submissions to that global public scope. Changes never alter past turns, their snapshots, answers or citations. Hide the active-token area when empty; no empty selection band.

## State Patterns

The following runtime behaviors are inherited from [architecture](../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md) and [runtime contracts](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md), not validated through the mock.

| State | Constraint and sketch treatment |
|---|---|
| First entry / empty conversation | Guide open; free entry sends nothing. Detailed empty/cold-load presentation deferred. |
| Waiting | Three-dot generic activity; historical scope already visible. Read/privacy controls available; next-turn draft/selection editable, sending unavailable. |
| Completed | Structured `answered`, `partial`, `refused` or `clarification` result rendered as untrusted text, not trusted HTML. Source Excerpts belong to supported passages and retain provenance. These are not technical failures and have no retry button. |
| Recorded technical failure | Safe actionable presentation; historical scope retained. Recoverable recorded failure may offer manual retry as a NEW logical turn; resource snapshot handling requires contract additions. No raw provider errors or crash output. |
| Unknown outcome / interruption | Preserve original request identity/question and required scope snapshot. Manual recovery must reuse that submission, not current next-turn draft/selection. Do not infer failure from timeout, queue, auto-retry or blindly admit another turn. |
| Same-tab refresh | Expected to preserve ongoing experience, including active resource selection; reconcile transcript/processing with authoritative server state, display each submission once, never duplicate send. Draft/selection/view-state storage extensions and lifecycle details pending; no durable cross-visit restoration guarantee. |
| Reload observation | Inherited bounded read-only observation (non-overlapping GETs every 3 seconds, at most 45 seconds); no renewed processing or automatic send. If unverifiable, offer manual verification rather than pretending completion. Detailed presentation deferred. |
| Limits / invalid input | Inherited 1,000-character message maximum with visible counter, no silent truncation; 20 admitted turns per conversation; 10 new conversations/IP/UTC day with resume explanation. Server admission authoritative. Reads/privacy/deletion remain accessible at turn cap. Detailed limit visuals/copy deferred. |
| Unavailable conversation | Neutral inaccessible/expired/deleted treatment; may offer a new conversation, never silently recreate or send pending content there. |
| Deletion request | Inherited idempotent `open` / `handled` states; repeat submission preserves request/date. Confirmation states manual, non-immediate handling. Full pending/error/handled presentation deferred. |

**Upstream work, not existing support:** stable resource IDs/catalog/evidence mapping; multi-resource strict retrieval; API submission, persisted history and GET/replay scope snapshots; recovery/idempotency identity including scope; session storage and server reconciliation for current draft/selection/view state. The [compatibility check](.working/resource-context-architecture-check.md) explains the gaps; its former one-resource examples and hint-vs-filter question are superseded by approved strict multiple selection. Current contracts submit only requestId/question and do not already implement this UX.

**Privacy release requirement:** exact disclosures and pre-use presentation are unresolved but must satisfy PRD FR-16/FR-19 and actual runtime processing before launch: BC storage/review, deletion within 90 days from creation, provider processing, temporary IP abuse control and the indefinite minimal deletion-audit exception. The dialog mock is only a scaffold; privacy completion is safety-required launch work, not optional polish.

## Interaction Primitives

- Click/tap activates questions, resource controls, passage citations and privacy; ordinary keyboard activation must provide equivalents. No hover-dependent essential information.
- Closing source/resource surfaces restores focus without forcing scroll. Resource selection stays open for further immediate changes; no batch confirmation.
- Never pull a visitor who scrolled up back to the latest turn when an answer arrives. Opening/closing panels must not reflow chat or disrupt reading position. Placement when already following the latest turn remains unspecified.
- Active-token horizontal scrolling is distinct from historical mobile wrapping. Exact overflow cue, composer cap, internal scroll and virtual-keyboard behavior remain deferred; no measured GPT dimensions are adopted.
- Snapshot selected resources at submission. In-flight work and recovery retain that original immutable scope; current composer edits prepare only a future explicit send.

## Accessibility Floor

Approved requirements: complete mobile/desktop experience, comfortable mobile citation-group activation, actual-source-count accessible label, no hover-only source access, focus/reading-position preservation and visible mobile identity.

Implementation floor to verify, not a certification: keyboard-operable controls and token overflow; meaningful labels and expanded/selected/disabled states; logical reading/focus order; dialog/sheet focus containment and restoration; readable contrast, visible focus, zoom/reflow and non-color state information. Reduced-motion waiting treatment exists in the preview; final announcements, target sizes and motion/focus behavior require real keyboard, touch and screen-reader checks. No accessibility audit has been performed for these documents.

## Key Flows

Brief sequences capture the approved sketch; named-protagonist journeys, climax narratives, complete failure paths and full flow coverage are intentionally deferred. [PRD UJ-1–UJ-4](../../prds/prd-candidate-copilot-2026-09-11/prd.md) remain the journey source, except the explicit landing-project override.

### Enter and explore — UJ-1

1. Open the unlisted link; understand the light positioning and choose a self-contained question or free entry in Entry card.
2. Arrive in conversation with identity and open guide. Suggested question is submitted; free entry sends nothing and allows context/question together.
3. Optionally open Resource library and immediately select resources; ask freely within documented professional scope.
4. Receive a complete supported/partial answer; activate a passage citation, inspect file/section/excerpts, then close without losing reading position.

Failures: unknown outcome uses manual original-submission recovery; missing evidence stays explicit within selected scope. Detailed entry/loading/failure presentation remains unfinished.

### Select scope and prepare next turn — UJ-1 extension

1. Open provisional “+ Ressources”; add/remove one resource per action while library stays open and draft remains untouched.
2. Submit explicitly with the current selection; immutable historical tokens appear before the waiting/result content.
3. While waiting, edit next draft/selection; reply leaves both unchanged. Remove individual active tokens for future turns only; empty selection restores global deployed public eligibility.

### Boundaries — UJ-2 / UJ-3 (inherited behavior)

1. Ask for a value judgment, hiring-fit assessment or inappropriate personal/sensitive information.
2. Receive a calm boundary/refusal with neutral professional redirection where permitted; no fit conclusion or hiring recommendation.

Exact copy, clarification examples, prompt-injection and complete refusal/failure journeys remain deferred to source-required evaluation.

### Privacy and deletion — UJ-4

1. Open permanent header privacy access, including while waiting or at turn cap.
2. Read handling information and Conversation UUID; explicitly submit the in-app deletion request.
3. Receive honest manual/non-immediate confirmation; repeated requests preserve the same request. Close without losing reading position/draft.

Disclosures, pending/error/handled variants and launch comprehension checks remain required follow-ups.

## Inspiration & Anti-patterns

- [Imported v2](imports/candidate-copilot-maquette-v2/index.html) / [README](imports/candidate-copilot-maquette-v2/README.md): adopted warm-paper palette, Manrope/Newsreader/DM Mono and restrained rounded treatment, not copy or capabilities.
- [Composer screenshot](imports/composer-reference/resource-token-placement-2026-09-30.png): placement above text only; no upload, large attachment-card sizing or dark palette.
- User-described GPT interaction reference: visible bounded-growing composer and horizontally scrolling mobile active-token row, not independently verified measurements.
- Reject purple-gradient AI styling, permanent showcase/sidebar/suggestion clutter, narrow static skill anchoring, forced context onboarding, evaluative persuasion and disruptive scrolling.

## Responsive & Platform

Desktop/mobile parity includes long answers, excerpts, guide, privacy/deletion and recovery. Identity wraps/stacks instead of disappearing. Source/resource panels choose right margin versus bottom-sheet overlay by available space, not device label; no chat displacement. Active tokens stay in one scrollable row; historical tokens wrap on mobile. Composer remains visible with bounded growth; numeric breakpoints, precise cap and keyboard-open viewport sizing are pending, not inherited from illustrative mocks.

Mechanical scope/deferred coverage: [.working/sketch-coverage-2026-09-30.md](.working/sketch-coverage-2026-09-30.md).
