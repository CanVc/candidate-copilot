# Reconciliation: updated UX decisions

## Input and comparison

- Input: `../../ux-designs/ux-candidate-copilot-2026-09-17/.memlog.md`, read in full (87 lines; updated 2026-09-30T16:45).
- Compared against the complete updated `prd.md` (updated 2026-09-30) and `addendum.md` in this directory.
- Scope: input reconciliation only. No PRD, addendum, UX, or architecture edits.

## Result

**0 true omissions or contradictions found.** The updated PRD/addendum preserve the latest approved UX decisions. Approved disposition/style remains delegated to the referenced UX sketch rather than unnecessarily duplicating its visual detail in the PRD.

## Coverage of governing approvals

| Governing UX decision | Updated coverage |
|---|---|
| Minimal two-step entry; 2–3 self-contained suggested questions and distinct free entry without sending; no additional landing form, mandatory context, skills/proof band, or permanent suggestion row | UJ-1; FR-1/FR-2; §7.1. Approved landing disposition remains referenced in §0 and §5.6. |
| Initially open, optional guide above/outside the transcript; manual collapse/reopen under “Quelques repères”; no automatic disappearance after an answer | FR-2; FR-21. |
| On-demand projects rather than mandatory landing highlights or a permanent showcase; composer access opposite Send; factual library and responsive panel/sheet | FR-3; §5.6; §7.1; §10 question 1. |
| Immediate multi-resource 1:1 selection/removal; library stays open; no Apply, numeric cap, prefix insertion, draft mutation, or automatic submission; selection persists until explicit removal | FR-3; FR-21. |
| Selected resources strictly restrict evidence to the union of mapped public documents; empty selection permits the whole deployed public base, never Web/private evidence; no outside-scope supplementation | Glossary; FR-6/FR-9/FR-11; FR-21/FR-22; addendum reconciliation. |
| Immutable per-turn selection; historical tokens immediately before answer content from waiting through error/completion/replay; noneditable and distinct from citations; mobile wrapping; no empty/global scope band | FR-6/FR-9/FR-18; FR-21; addendum reconciliation. |
| Editable next-turn draft and resources while pending; disabled Send; response arrival preserves edits; no queue/auto-send; unknown-outcome recovery uses the original question and scope | FR-6/FR-8/FR-18; §5.2; FR-21. |
| Same-tab continuity for transcript, processing, draft, selection and agreed view state; no duplicate submission; fresh new visits rather than durable revisit restoration | FR-18; FR-21/FR-22; §10 question 6; addendum reconciliation. |
| Compact active tokens above text inside the composer; one horizontal scroll row, individually reachable/removable, no wrapping or collapsed +N; empty row hidden | FR-3; FR-21; §5.6. |
| Passage-local citations: visible desktop file-title tokens; mobile grouped overlapping circles, maximum three then +N, actual distinct-file count; passage-specific excerpts grouped by file, inline expansion, direct single-source excerpt, no generated summaries/full documents | FR-10; FR-21; §5.6. |
| Non-displacing right-margin panels or bottom-sheet overlays when space is insufficient; replacement rather than stacked citation windows; preserved reading position and restored focus; no forced scroll on answer arrival | FR-10; FR-21; §5.6. |
| Central conversation without permanent presentation sidebar; compact candidate identity retained on mobile, scrolling rather than sticky; bottom-visible bounded composer; desktop/mobile parity | §5.6; FR-21. Approved identity composition and exact visual treatment remain in the referenced sketch. |
| Generic assistant badge and three activity dots for ordinary waiting; no required prose, invented backend stages, or unvalidated streaming | FR-8; FR-21. |
| Permanent header “Confidentialité” access on desktop/mobile, including during processing and at the turn limit; dedicated UUID/deletion dialog; manual non-immediate handling; closing preserves draft/reading position | UJ-4; FR-16/FR-17/FR-19; FR-21. |
| Warm-paper, minimal literary/CV appearance; adopted v2 fonts/colors applied to the jointly approved layout, not a return to v2 layout/copy | §0 and §5.6 retain the approved DESIGN/EXPERIENCE disposition/style; addendum explicitly retains the approved sketch. |
| Ratified sketch, not final production-ready UX or runtime/accessibility/privacy certification; editorial content deliberately deferred; complete states and real interaction checks still required | §0; FR-16/FR-21/FR-22; §5.6; §10; addendum. |

## Exclusions from gap reporting

- Earlier prefix insertion, tentative single-resource selection, hint-based scope, hover-dependent source identification, and proposed historical global labels are superseded alternatives, not current requirements or contradictions.
- Tentative composer percentages, illustrative mock dimensions/copy, screenshot styling, inferred file uploads/future resource types, and unapproved hiring-fit capabilities are not governing approvals.
- Detailed resource payload/storage contracts, mapping revisions, invalid-resource handling, session view-state/lifecycle reconciliation, and recorded-failure new-turn retry scope remain explicitly identified follow-up work. Their unresolved technical or product-policy details are not omissions of an approved UX decision. Same-submission recovery scope is already settled and covered.
- Existing architecture/runtime documents have not been updated. The addendum states this accurately and records the required adaptations; the reconciliation does not treat linked old contracts as completed support.
- Deferred copy and incomplete physical keyboard/touch/screen-reader, privacy, runtime and complete-state validation do not contradict sketch approval. The updated requirements keep those launch obligations visible without reopening approved appearance or disposition.
