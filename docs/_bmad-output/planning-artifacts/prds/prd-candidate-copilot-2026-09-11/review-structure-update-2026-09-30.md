# Editorial structure review — targeted Update, 2026-09-30

This document exists to help BC and human UX, architecture, and implementation planners agree on Candidate Copilot's first public version, its approved interaction requirements, and its launch obligations.

**Model:** Strategic/Context (Pyramid). **Style guide:** Microsoft Writing Style Guide. **Scope:** Structure only; targeted Update; no length target. Content, stable FR/UJ IDs, and approved UX behavior are sacrosanct.

**Verdict:** Structurally sound for this update. No actionable structural corrections; zero before/after replacements proposed. Broad reordering or compression would create more review churn than comprehension benefit.

## Findings

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| structure | Front matter (`status: draft`); §0 Document Purpose (114 words); §1 Vision (122 words) | PRESERVE unchanged | The opening establishes draft status, the product, planning purpose, approved UX precedence, validation limits, and outstanding architecture follow-up before implementation detail. Vision supplies the product hypothesis and zero-euro constraint. This satisfies the pyramid's headline/context function without inventing a new executive summary. Word impact: 0. |
| structure | §2.4 Key User Journeys (383 words), followed by §3 Glossary (382 words) | PRESERVE unchanged | The journeys give human readers a concrete overview before the detailed feature reference. The adjacent glossary then defines the scope/token/session vocabulary used throughout the requirements. Moving the glossary ahead of the journeys or cutting journey detail is not warranted for this targeted update. Preserve UJ-1 through UJ-4. Word impact: 0. |
| structure | §4 Features, including FR-21 (532 words) and FR-22 (151 words); §5 Cross-Cutting Non-Functional Requirements | PRESERVE unchanged | Feature grouping separates entry, conversation, evidence, boundaries, privacy, and launch evaluation. Cross-cutting constraints have their own section. FR-21's long coverage list serves acceptance traceability rather than repeating requirements without purpose; FR-22 follows it with the launch-blocking rule. Removing tests or moving acceptance obligations to another document risks losing approved behavior and validation boundaries. Preserve FR-1 through FR-22. Word impact: 0. |
| structure | §6 Non-Goals (173 words); §7.1 In Scope (207 words); §7.2 Out of Scope for MVP (66 words) | PRESERVE unchanged | These overlap with detailed requirements but serve distinct scanning needs: product boundaries and a compact release checklist. For human planners, this is useful reinforcement, not true redundancy. An early wholesale scope-section move or merge is unnecessary in a targeted Update. Word impact: 0. |
| structure | §8 Success Metrics; §9 Risks and Mitigations (137 words); §10 Open Questions (181 words); §11 Assumptions Index (14 words) | PRESERVE unchanged | The closing groups outcome measures, risks, and unresolved implementation/editorial decisions separately. Open questions identify ownership and timing without reopening approved disposition/style. The short assumptions index distinguishes unresolved assumptions from remaining launch decisions. No appendix, FAQ, or unrelated implementation walkthrough needs removal. Word impact: 0. |

## Counts and reduction summary

Exact counts obtained with:

`uv run /home/cvc/dev/candidate-copilot/.agents/skills/bmad-review/scripts/word_metrics.py /home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md`

- Document total: **7,305 words**.
- Section counts cited above are the script's exact heading-body counts, not estimates. The document total also counts headings and front matter, so heading-body counts do not sum to the document total.
- §8 heading-body counts: Primary **80**, Secondary **69**, Counter-Metrics **78** words.
- Actionable recommendations: **0**; preservation findings: **5**; further minor structural fixes withheld: **0**.
- Estimated reduction if accepted: **0 words (0%)**; resulting total: **7,305 words**.
- Length target: **none supplied**.
- Comprehension trade-offs: **none**. Retain journey scaffolding, feature descriptions, scope reinforcement, acceptance examples, and whitespace. No prose pass, PRD edits, ID changes, or UX changes were performed.
