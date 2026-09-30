# Editorial prose review — targeted Update, 2026-09-30

This document exists to help BC and human UX, architecture, and implementation planners agree on Candidate Copilot's first public version, its approved interaction requirements, and its launch obligations.

**Verdict:** Clear technical prose; three small corrections clarify a prohibition and repair two expressions. **Reader:** Humans. **Style guide:** Microsoft Writing Style Guide. **Scope:** Prose only; review-only; no length target.

**Style, tone, and voice to preserve:** Formal, neutral requirements language; deliberate must/should/may distinctions; capitalized glossary terms; stable FR/UJ/SM identifiers; compact acceptance lists, technical shorthand, French UI labels, and explicit validation caveats. These choices support planning and traceability. Do not simplify them for preference or reopen approved requirements.

The preceding `review-structure-update-2026-09-30.md` recommends preservation throughout, with no CUT or MERGE dispositions. No passages therefore require exclusion or attachment to a surviving location. Front matter and structural markup were excluded from copy-editing.

## Findings

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| prose | FR-2, final acceptance bullet: “Visitor-provided context is optional and may orient documented answers, never inferred personalization or candidate-role fit assessment.” | “Visitor-provided context is optional and may orient documented answers, but must not enable inferred personalization or candidate-role fit assessment.” | Supplies the missing verb for the prohibition, rather than making personalization appear to be another object of “orient.” Preserves optional context and the existing personalization/fit boundary. Word impact: +3. |
| prose | FR-20, second acceptance bullet: “Automatic cleanup starts early enough to account for scheduling, an active treatment, and operational recovery.” | “Automatic cleanup starts early enough to account for scheduling, active processing, and operational recovery.” | Replaces the unexplained “treatment” with the established term “processing.” Preserves the cleanup timing and busy-Conversation constraint. Word impact: −1. |
| prose | FR-7, requirement sentence: “Candidate Copilot must answer in the language used by the Recruiter’s question, where practical.” | “Candidate Copilot must answer in the language of the Recruiter’s question, where practical.” | Repairs the expression without changing the language rule or its qualification. Word impact: −1. |

## Counts and scope summary

Exact document and per-heading counts obtained with:

`uv run /home/cvc/dev/candidate-copilot/.agents/skills/bmad-review/scripts/word_metrics.py /home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md`

- Document total: **7,305 words**.
- Relevant exact heading-body counts: FR-2 **154**, FR-20 **152**, FR-7 **79** words. If accepted, these become **157**, **151**, and **78** words respectively.
- Recommendations: **3**; further minor fixes withheld: **0**.
- Net word impact if accepted: **+1 word**, resulting in **7,306 words**; no reduction (increase approximately **0.014%**).
- No comprehension trade-offs, stable-ID changes, or approved-requirement changes proposed. No source edits performed.
