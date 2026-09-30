# Structure review — addendum update, 2026-09-30

This document exists to help human product, design, and implementation readers locate authoritative decisions, distinguish approved UX from pending architecture work, and retain the original brief's boundaries.

**Model:** Strategic/Context (Pyramid). **Style guide:** Microsoft Writing Style Guide. **Verdict:** Sound structure; one small move would front-load the update's boundaries. Content and approved UX remain unchanged; no technical or product decisions are proposed.

## Exact counts

Measured with `uv run /home/cvc/dev/candidate-copilot/.agents/skills/bmad-review/scripts/word_metrics.py /home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/addendum.md`.

| Section | Body words |
| --- | ---: |
| Candidate Copilot PRD Addendum | 103 |
| Approved UX reconciliation — 2026-09-30 | 252 |
| Original brief guardrails retained | 52 |

**Document total: 423 words**, including headings and Markdown tokens under the script's counting rules. Section body counts exclude headings.

## Findings

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| structure | §Approved UX reconciliation — closing paragraph: “This update neither adds an API endpoint nor selects a schema or storage mechanism. It preserves concurrency, recovery, usage, cost, privacy and security constraints.” | **MOVE** the paragraph unchanged to immediately before the paragraph beginning “[Architecture update needed](architecture-update-needed.md) records the required technical adaptations and existing compatible clauses.” | Places the update's scope and preserved constraints before the detailed adaptation list. Keep the architecture-status paragraph and its following list together. Section remains 252 body words; impact: 0 words. |
| structure | Opening consolidation/status material and contract links under §Candidate Copilot PRD Addendum. | **PRESERVE** unchanged. | The 103-word body establishes document authority and directs readers to implementation contracts; it is useful orientation, not redundant specification. Impact: 0 words. |
| structure | §Original brief guardrails retained. | **PRESERVE** unchanged. | The 52-word body groups distinct original boundaries without reopening approved UX or expanding the update. Impact: 0 words. |

**Summary:** 1 actionable recommendation and 2 preservation findings. Estimated reduction if accepted: **0 words (0% of 423)**; projected total: **423 words**. No length target was supplied. No comprehension trade-offs: nothing is cut, condensed, or substantively changed; the move brings boundaries forward while retaining the status-to-detail sequence.
