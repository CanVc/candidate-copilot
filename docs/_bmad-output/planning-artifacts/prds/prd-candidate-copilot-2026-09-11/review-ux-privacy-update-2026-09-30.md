# UX / privacy / recovery consistency gate — 2026-09-30

## Verdict

**PASS for PRD finalization.** Findings: **critical 0 / high 0 / medium 0 / low 0**. No correction required within this review's scope.

This is a documentation consistency gate, not implementation acceptance, an accessibility audit, or proof of runtime/model behavior. The approved disposition, visual style and intentionally deferred editorial copy are not reopened.

## Sources reviewed

Read in full:

- This directory's `prd.md`, `addendum.md`, and `architecture-update-needed.md`.
- UX directory `../../ux-designs/ux-candidate-copilot-2026-09-17/`: all `DESIGN.md`, `EXPERIENCE.md` and `.memlog.md` files found there (one of each).
- `../../../../guide-utilisateur.md`.
- Linked `../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md` and `RUNTIME-CONTRACTS.md`, to verify that the impact note distinguishes actual existing contracts from required extensions.

Authority applied: BC's latest decision resolves the formerly unfinished UX retry mechanics. The failed question's original text and Submitted Scope are retried through an icon **on that question in the chat**, never the composer, under a **new submission identity/logical turn**, preserving the newer draft and Active Selection. The older UX sketch's deferral is not treated as a still-open product choice.

## Evidence-backed coverage

| Check | Evidence and conclusion |
| --- | --- |
| Strict documentary scope | `prd.md` FR-9/FR-11; UX `EXPERIENCE.md:64`; UX memlog's final hard-scope/multi-selection decisions; guide lines 9–14. Nonempty selection permits the union of mapped public documents only; empty selection permits the deployed public KB only. No outside-selected supplementation, Web/private evidence or invalid-resource fallback to global scope is permitted. Impact note §3 explicitly requires trusted mappings, filtering before ranking, citation subset validation and mapping-revision handling. |
| Admission snapshots and historical scope | PRD FR-6/FR-9 and FR-21; impact note §2/§4, especially line 72. Question plus normalized selection is immutable; scope is persisted in the admission transaction, not dependent on a successful answer. Waiting, interrupted, failed, completed and replayed turns retain scope/display metadata. Empty scope has no historical band; tokens are not citations. Snapshot retention/export/deletion is covered separately from excerpt provenance. |
| Editing pending / unknown outcomes | PRD FR-6/FR-8/FR-18 and §5.2; UX Composer and State Patterns; impact note §1/§5; guide lines 16–18. Draft and selection remain editable for a later explicit send, while Send/admission remains locked during active or unknown processing. Arrival/recovery clears only matching pending state, never overwrites newer edits, queues or auto-sends. |
| Same-tab-only continuity | PRD FR-18, especially line 286; impact note §1 and required handoff; guide lines 28–30. Server transcript authority, single display per submission and no resubmission survive refresh. New visits start fresh without old history/draft/selection or durable identity. Stale/access-loss/new-conversation/view-state reconciliation is explicitly architecture/runtime work before implementation, not claimed existing support. |
| Privacy and deletion | PRD FR-16–FR-20, §5.3 and UJ-4; UX Privacy dialog, State Patterns and privacy release requirement at line 85; guide lines 32–34. Permanent desktop/mobile privacy access remains available during processing and at limits. Storage, BC review, actual provider processing, visible UUID, manual/non-immediate deletion and the temporary IP counter are mandatory disclosures. Requests are idempotent, retain their original date, and move from `open` to `handled` only on confirmed/already-completed deletion. |
| Creation-based retention / audit exception | PRD FR-16/FR-19/FR-20; impact note §4 at line 74; existing architecture AD-12 and runtime §7. All raw/derived Conversation data, including scope snapshots, shares creation + 90 × 24 hours UTC; messages/recovery do not extend it. Busy deferral cannot exceed that deadline; failed cleanup must be visible/recoverable and deletion/audit completion atomic. Indefinite audit is limited to request identity, historical UUID, status and lifecycle timestamps, with no content, scope tokens, credentials or Visitor identity. |
| Limits and bounded recovery | PRD FR-21, §5.1/§5.2; UX State Patterns; runtime §§1/3/5/6. Coverage includes 1,000 characters without truncation, 20 admitted logical turns, 10 creations/IP/UTC day, 30-second backend and 45-second browser budgets, bounded read-only reload observation, no automatic processing retry/fallback/paid overage, and preserved privacy controls. Same-submission recovery/reads do not consume another turn; a newly admitted technical retry does. Unknown transport outcomes are not falsely recorded as failures. |
| Question-local retry and guide | PRD FR-8/FR-21; addendum's BC confirmation; impact note lines 17/48 and handoff; guide lines 20–26. The original failed question/scope is submitted under a new identity; the original failed turn remains unchanged. Newer draft/selection is preserved. Retry obeys admission, turn cap and single-processing/unknown-state restrictions; unavailable resources cannot widen scope. No such action appears on business results or unknown outcomes, or in the composer. The French guide explains location, scope, turn accounting, preservation and the distinction from read-only “Vérifier à nouveau”. |
| Accessibility and complete-state acceptance | PRD FR-8/FR-21 and §5.6; UX Accessibility Floor and Responsive & Platform; DESIGN's sketch disclaimer. Retry has an identifying accessible name and explicit verification coverage. Keyboard/touch/screen-reader recovery checks, announcements, focus restoration, non-color states, token overflow, privacy access, mobile keyboard usability and reading-position preservation remain binding acceptance work. Mock/sketch approval is not presented as validation. |

## Follow-up gates retained, not new findings

- **Architecture/runtime owns the contract reconciliation:** PRD §10 items 1/5 and FR-18, addendum, and impact note §§1–6 plus required handoff. Amend architecture and runtime together before implementing the new scope/session behavior; resolve trusted mapping/version/unavailable-resource semantics, identity, admission snapshots, POST/GET/replay parity, session lifecycle and BC's retry policy, then align types, migrations, ports/adapters, frontend and stories. The existing question-only payload and restricted storage whitelist are accurately identified as not yet supporting the update. They are not silently treated as approved new contracts.
- **BC owns public Resource content; BC/UX owns editorial/privacy completion before public launch:** PRD §10, FR-16/FR-19 and FR-21. Truthful actual processing/log disclosures, complete deletion/error/limit states, BC's manual request-review cadence and real interaction/privacy checks remain required. Deferred copy is not a privacy exemption.
- **Implementation and Delivery/Operations acceptance owns runtime proof:** deterministic scope/recovery/deletion tests, actual-model evaluations, provider billing/quota facts, purge margins/cutoff and operator runbook remain required by PRD FR-21/FR-22, §5.5 and existing runtime §§7–9. Such proof is not required to finalize this PRD.

The current documents preserve these boundaries and owners without amending architecture/runtime or reopening the approved UX sketch.
