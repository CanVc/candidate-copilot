# Input reconciliation — DESIGN.md

## Scope

Compared the complete approved `../../ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md` (updated 2026-09-30) with the complete updated `prd.md` and `addendum.md` in this workspace. This is input reconciliation only; no PRD or upstream source edits were made. Behavioral requirements belonging to other inputs are not independently re-audited here.

## Finding

**0 material gaps.** No genuine lost behavioral/qualitative idea, conflicting new decision, visual/editorial reopening, or false implementation-readiness claim was found relative to DESIGN.md.

## Coverage and boundaries

| Approved design idea | Updated PRD/addendum treatment | Result |
| --- | --- | --- |
| Warm-paper, intimate literary/CV character; minimal chrome; invitation to inspect documented work rather than persuasive AI styling | PRD §0 and §5.6 retain DESIGN.md as the approved disposition/style authority, explicitly without reopening it. Vision and counter-metrics preserve non-flashy, non-persuasive professional intent. Addendum retains the approved sketch. | Preserved by reference and compatible product intent. |
| Light landing → dedicated central conversation; 2–3 questions and distinct free entry; no mandatory project showcase, skills band or permanent presentation sidebar | FR-2/FR-3, §7.1 and §5.6 preserve the entry paths, optional guide outside the transcript, on-demand projects and central conversation. The approved layout remains binding through §0. | Preserved. |
| Compact identity stays on mobile and scrolls; generous readable conversation; visible bottom composer with bounded growth | §5.6 preserves mobile wrapping/stacking, non-sticky identity, readable long answers/excerpts and bounded visible composer. | Preserved without inventing measurements. |
| Panels do not cover/shift/reflow chat; insufficient margin uses a bottom-sheet overlay even on desktop; preserve reading position | FR-10 and §5.6 preserve placement, viewer replacement, focus restoration and no forced scroll on response arrival. | Preserved. |
| Editable active resource tokens versus immutable historical scope versus actual evidence citations | FR-3/FR-6/FR-9/FR-10 distinguish these roles; active tokens form one horizontal row above draft text, historical tokens wrap on mobile, and citations remain passage-local with the approved mobile grouping. | Preserved. |
| Generic assistant badge and three waiting dots; quiet privacy dialog, not ratified disclosure copy | FR-8 retains the waiting treatment. FR-16 explicitly treats the privacy sketch as unfinished disclosure/state work. | Preserved; no placeholder-content ratification. |
| Retain v2 appearance, not the import's copy/sidebar/mobile identity hiding/extra landing content; copy may evolve | §0, FR-2, §5.6 and §10 question 2 retain the approved style/layout while allowing exact editorial completion. | No visual reopening; editorial evolution is expressly authorized by the source. |
| Sketch approval is not production readiness; exact dimensions, citation/viewer treatment, remote font delivery/fallbacks and implementation details remain unfinished | §0, FR-21/FR-22 and §5.6 require runtime, privacy and real accessibility verification. Addendum explicitly states that architecture/runtime have not been updated and that schema/session/retry decisions remain follow-up work. | No readiness overclaim. Source-specific unfinished visual/font details remain in DESIGN.md, not silently certified by the PRD. |

## Non-gaps

Palette, font families, radii, shadows and illustrative sizes need not be duplicated in the PRD: the approved design remains the source of authority. Exact dimensions are intentionally deferred, not missing product decisions. Additional product/runtime safeguards in the PRD are not, by themselves, conflicting design decisions; none contradict this input. No reconciliation amendment is requested.
