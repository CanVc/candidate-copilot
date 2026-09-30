# PRD Quality Review — Candidate Copilot, approved UX reconciliation (2026-09-30)

## Overall verdict
**Pass for the targeted PRD reconciliation, not authorization to implement or launch.** The updated PRD faithfully translates the approved entry, Resource scope, historical-token and next-turn continuity decisions into product requirements, including BC's confirmed question-local technical retry. The remaining risk is downstream contract divergence: the architecture/runtime sources intentionally remain unchanged, and their amendments and lifecycle/mapping decisions must be completed at the documented before-implementation gate.

Review scope: full `prd.md` and `addendum.md`, using the full PRD validation rubric; checked against `EXPERIENCE.md`, `DESIGN.md`, the UX `.memlog.md`, `architecture-update-needed.md` and `docs/guide-utilisateur.md`. This is reconciliation review, not renewed discovery, visual/editorial approval, source-contract amendment or runtime/accessibility/privacy validation.

**Actionable update findings: 0 — critical 0 / high 0 / medium 0 / low 0.** No inherited unrelated issue is presented as an update defect.

## Decision-readiness — strong
The material product decisions are explicit rather than neutralized: projects move from mandatory landing highlights to optional Conversation discovery (FR-2/FR-3); multiple selected Resources strictly constrain evidence, sacrificing potentially useful unselected evidence (FR-9/FR-11); editable next-turn state does not relax single-processing admission (FR-6). These are settled decisions, not questions to reopen.

FR-8 resolves technical retry precisely: an icon on the failed question in chat, never in the composer, submits the original text and Submitted Scope with a new identity, preserves the newer draft/selection and leaves the failed turn unchanged. Unknown outcomes instead retain the original submission identity/scope. The addendum and architecture impact note correctly carry this later BC confirmation without pretending the older UX or technical sources were amended.

## Substance over theater — strong
The update adds operationally meaningful distinctions, not template furniture. Active Selection, Submitted Scope, Historical Resource Tokens and citations each drive different behavior (Glossary; FR-3/FR-6/FR-9/FR-10). Waiting, retry, reload and deletion requirements have specific consequences for this anonymous, zero-euro product rather than generic reliability claims (FR-8/FR-18/FR-20; §5.1–§5.3).

The approved style remains referenced rather than duplicated into a new visual specification (§0; §5.6). Mock approval is expressly not treated as evidence of runtime, accessibility or privacy correctness.

## Strategic coherence — strong
The revised discovery and evidence interactions continue the §1 thesis: factual recruiter exploration with inspectable support, not persuasion or candidate-role fit. Removing mandatory project highlights reduces premature role anchoring while on-demand selection and passage-local citations support deeper exploration (FR-2/FR-3/FR-10).

SM-2 now recognizes exploration prompted by the optional guide or on-demand project. SM-1/SM-3 retain launch and answer-trust checks; SM-C1–SM-C3 reject volume, persuasion and feature breadth. The update neither introduces a platform roadmap nor changes the zero-euro V1 scope.

## Done-ness clarity — adequate
The changed FRs provide testable consequences: immediate 1:1 Resource toggles without text mutation, persistent selection, immutable scope from admission through waiting/error/replay, no outside-scope supplementation, preserved next-turn edits and fresh new-visit state (FR-3/FR-6/FR-9/FR-11/FR-18). FR-21 explicitly exercises these invariants, including retry's original question/scope, new-turn accounting, placement, accessible name and user guide. FR-22 makes scope widening, snapshot loss and duplicate recovery launch blockers.

This is sufficient product-level acceptance for the reconciliation, but deliberately not a completed implementation contract. Resource mapping revisions, exact session lifecycle/view state and detailed geometry remain gated follow-up (§10.1/§10.5; FR-18; §5.6; addendum). Real-model evaluation and physical accessibility/privacy checks are still required, not claimed performed. Those deliberate deferrals do not constitute missing approved UX decisions.

## Scope honesty — strong
§0 and the addendum clearly disclose that the architecture/runtime documents are unchanged and do not yet describe Resource scope or expanded session state. §10 assigns BC ownership of public content, architecture ownership of mapping/version handling, architecture/runtime ownership of lifecycle reconciliation, and BC/UX ownership of copy. The technical before-implementation gate and editorial before-launch gate are distinct.

There are five Open Questions and no unresolved inline assumption tags. Their presence fits a scoped reconciliation rather than an unconditional green light to build. Non-Goals and §7.2 preserve no Web/private evidence, uploads, unapproved Resource types, full-document browser, durable revisit restoration or extra admin/platform scope. No API endpoint, schema or storage mechanism is silently selected.

## Downstream usability — adequate
The expanded Glossary supports clean extraction: Active Selection is next-turn state; Submitted Scope is immutable per question; historical tokens are neither editable selection nor evidence citations. UJ-1 provides inline context for entry, selection, pending edits and refresh; UJ-4 preserves privacy/deletion availability during waiting and limits. FR-21 supplies cross-feature acceptance coverage without changing stable FR IDs.

The addendum links a detailed architecture handoff and explicitly warns downstream readers not to treat old contracts as newly compatible support. `architecture-update-needed.md` identifies payload/idempotency, trusted mappings, snapshot persistence, session-state separation and retention impacts, including retry. Downstream technical readiness remains conditional on that follow-up; this review does not validate the linked architecture/runtime source details or prescribe their implementation.

## Shape fit — strong
This remains an appropriately bounded, recruiter-facing personal-product PRD with meaningful UX and privacy stakes. Four contextual role-led journeys are useful, while stable feature-grouped FRs support architecture and story extraction. The brownfield change identifies superseded landing/session restrictions and preserves compatible concurrency, recovery, cost and privacy constraints rather than rewriting the entire product or committing a roadmap (§0; addendum; architecture impact note).

## Mechanical notes
- FR-1–FR-22, UJ-1–UJ-4, SM-1–SM-4 and SM-C1–SM-C3 are unique and contiguous; stated FR/UJ/SM references resolve.
- All explicit Markdown links in `prd.md` and `addendum.md` resolve to existing local files, including the short user guide.
- No inline `[ASSUMPTION]` tags are present; §11 correctly reports none unresolved.
- Recruiter and Visitor are both defined; privacy/deletion use Visitor intentionally. Each UJ has an identified role protagonist with context; invented persona names are unnecessary here.
- The French user guide accurately distinguishes unknown-outcome verification from question-local, original-scope, new-turn technical retry and preserves draft/selection. It describes intended V1 behavior, not implemented behavior.
- The original `review-rubric.md` is a historical review, not this update's verdict. Earlier concerns must be checked against the current text: usage/reliability bounds, launch failure classes and Visitor terminology have since been specified; session-contract completion remains explicitly assigned and deferred. Unrelated baseline discovery/evaluation work is not reopened by this gate.
