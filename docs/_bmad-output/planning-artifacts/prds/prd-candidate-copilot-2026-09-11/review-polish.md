# PRD Polish Review — Candidate Copilot

**Scope reviewed:** `prd.md` and `addendum.md` only.  
**Lenses:** structure, prose.  
**Reader type:** humans; downstream planning readers also considered.  
**Word metrics:** 3,947 words staged across both files; `addendum.md` accounts for 89 words.

This document exists to help BC and downstream planning workflows turn the product brief into implementation-ready, ID-stable requirements for Candidate Copilot.

**Structure model:** Strategic/Context (Pyramid). The PRD mostly follows the model: purpose and vision first, then users, glossary, feature requirements, cross-cutting constraints, scope, metrics, risks, and open questions. The main polish risks are not scope gaps; they are second-source drift, overloaded labels, and term continuity.

## Findings

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| structure | `addendum.md` §Deferred or implementation-adjacent notes — full section (89 words) | **MERGE / RETIRE.** If all addendum points have been incorporated, delete the addendum or replace it with a one-line status note such as: “Addendum notes have been incorporated into `prd.md`; retained only for traceability.” If any point remains live, move it into `prd.md` §10 Open Questions or the relevant FR/NFR section. | The addendum now largely repeats `prd.md` FR-17/FR-19 and FR-5/§5.1. Keeping it as a separate live note creates downstream drift risk around “conversation identifier” vs “Conversation UUID” and access restrictions. Saves ~80–89 words if retired. |
| structure | `prd.md` FR sections — repeated **Consequences:** blocks, especially FR-16, FR-19, and FR-21 | **QUESTION / RENAME.** Either define in §0 that “Consequences” includes acceptance constraints and planning notes, or rename the label across FRs to **Acceptance / Planning Notes:**. | The label “Consequences” is clear for rationale but undersells testable requirements placed in those lists. Architecture, UX, and story writers may miss items that are effectively acceptance criteria. No meaningful word reduction; improves downstream readability. |
| structure | `prd.md` §7.1 In Scope — “Structured answers with Source Excerpts, supported-claim clarity, and explicit partial/missing-evidence handling.” followed by “Explicit missing-evidence handling.” | **MERGE.** Keep only the first bullet. | True duplicate in the MVP scope checklist. Saves ~3 words, but more importantly prevents readers from treating missing-evidence handling as two separate scope items. |
| structure | `prd.md` §§4–7 — §7 repeats several items already defined in Features, NFRs, and Non-Goals | **PRESERVE with restraint.** Keep §7 as a downstream scope checklist, but avoid adding detail there; use it only as a concise confirmation of in/out scope. | The section looks duplicative, but it serves downstream scanning and prevents scope reinterpretation. No cut recommended beyond the duplicate bullet above. |

## Prose / continuity findings

Style and tone to preserve: concise, requirement-first, evidence-oriented, intentionally non-promotional. The document’s formal voice is appropriate for a PRD; fixes below are limited to clarity and continuity.

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| prose | `prd.md` line 28: “public knowledge base”; line 46: “supporting excerpts”; line 52: “conversation UUID” and “deletion requests”; lines 247, 250, 401: lowercase “visitor”; line 400: “value/sensitive/out-of-scope questions” | Use glossary terms consistently: **Public Knowledge Base**, **Source Excerpts**, **Conversation UUID**, **Deletion Requests**, **Visitor**, and **Out-of-Scope Questions** where referring to defined concepts. | Improves glossary continuity and prevents downstream artifacts from inventing alternate terms. |
| prose | `prd.md` line 26: “during the middle or end of a recruitment process” | “during a mid- or late-stage recruitment process” | Tighter phrasing; same meaning. |
| prose | `prd.md` line 18: “recruiters can ask expected questions” | “recruiters can ask expected recruiting questions” | Removes a small ambiguity: “expected” is about recruiting use cases, not a fixed hidden question list. |
| prose | `prd.md` lines 46, 95, 365, 419: “2-3” | “two or three” in prose, or “2 to 3” where a compact UI-style range is needed | Normalizes number range style; use one form throughout. |
| prose | `prd.md` line 135: “in the language used by the Recruiter question when practical” | “in the language used by the Recruiter’s question, where practical” | Fixes possessive phrasing and aligns with later “where practical” usage. |
| prose | `prd.md` line 228: “processed by the actual AI/provider path chosen during implementation” | “processed through the AI/provider processing path chosen during implementation” | Clarifies that the concern is processing path, not an undefined “actual path.” |
| prose | `prd.md` lines 228 and 269: “deleted within 90 days maximum” | “deleted within 90 days” or “retained for a maximum of 90 days” | Removes awkward redundancy while preserving the privacy promise. |
| prose | `prd.md` line 314: “simple zero-euro guardrails against obvious abuse or runaway usage” | “simple zero-euro guardrails for obvious abuse and runaway usage” | Smoother construction; keeps the constraint intact. |
| prose | `prd.md` line 401: “can be deletion-requested from the app” | “can be submitted for deletion from the app” or “can have deletion requested from the app” | Avoids an awkward compound verb in a success metric. |

## Reduction / readability summary

- **Total recommendations:** 13 rows: 4 structure, 9 prose.
- **Estimated reduction if accepted:** ~83–92 words, mostly from retiring or collapsing the addendum; less than 3% of the staged 3,947-word review set.
- **Main readability gain:** fewer second-source notes, cleaner glossary continuity, and clearer downstream interpretation of FR sub-bullets.
- **Comprehension trade-off:** retiring the addendum removes trace context unless replaced with a one-line status note; keep that note if traceability matters.

## Verdict

Polish pass: **near-ready with minor cleanup recommended**. The PRD is structurally usable for downstream planning; the main fix is to retire or integrate the addendum so `prd.md` remains the single source of truth, then normalize defined terms and a few awkward phrases.
