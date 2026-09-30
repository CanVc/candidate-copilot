---
title: "Update reconciliation: Original product brief"
status: complete
created: 2026-09-30
input: ../../briefs/brief-candidate-copilot-2026-09-10/brief.md
compared_with:
  - ./prd.md
  - ./addendum.md
decision_authority: ./.memlog.md
---

# Original brief → updated PRD/addendum

## Result

The original vision, documentary trust model, professional boundaries and privacy intent remain intact. Two qualitative guardrails are no longer explicit. These are narrow omissions, not contradictions or launch-blocking implementation findings. No PRD edits were made.

## Gaps

### G1 — Success interpretation omits conversion and hiring-progression exclusions

- **Brief:** “Success Criteria” explicitly avoids volume **or conversion** targets and rejects attribution of hiring-process progression to Candidate Copilot.
- **Updated coverage:** PRD §8 preserves meaningful exploration, professional readiness and the rejection of volume/persuasion optimization. It does not carry forward the conversion-target or hiring-progression attribution exclusions; the addendum does not supply them.
- **Loss:** Downstream evaluation could add hiring-conversion or progression claims that the original qualitative success model deliberately ruled out. Preserve those exclusions alongside SM-C1. The existing exploratory-conversation criteria already distinguish meaningful use from generic interaction; they need not be reopened.

### G2 — Post-MVP evolution boundary is absent

- **Brief:** “Outlook” commits to no post-MVP feature roadmap, selects further capabilities only in response to observed use, and treats automated conversation monitoring/analysis as a separate project rather than implicit expansion.
- **Updated coverage:** PRD §6/§7.2 excludes automated conversation analysis from V1 and §8 discourages feature breadth. Neither the PRD nor addendum retains the observed-use condition or the separate-project boundary for future automation.
- **Loss:** V1 exclusions alone do not preserve the original boundary on future product expansion, particularly automation involving retained conversations. Preserve this outlook without creating a roadmap or reopening approved V1 scope.

## Preserved intent

- **Vision and qualitative readiness:** PRD §1/§2/§6/§8 retains BC's personal proof-of-work portfolio, unvalidated recruiter demand, mid/late recruitment context, conversational exploration, professional polish and recruiter judgment rather than candidate assessment.
- **Trust and evidence:** FR-9–FR-11, FR-21/FR-22 and §5 preserve public Markdown as canonical evidence, derived indexes, inspectable citations, completeness, abstention, semantic evaluation limits and critical-failure launch gates.
- **Boundaries:** FR-12–FR-15 and §6 preserve non-representation, refusal of judgments/intentions/commitments, professional-only subject matter, no private evidence and no recruiter-specific inference.
- **Privacy:** FR-16–FR-20 and §5.3 preserve disclosure, isolation, controlled operator review/export and bounded raw/derived retention. The approved minimal deletion-audit exception is explicit, not an accidental privacy loss.
- **Simplicity and risks:** §5, §7 and §9 preserve evaluation-led retrieval sophistication, operational credibility and content maintenance.

## Approved changes — not unresolved conflicts

The PRD `.memlog.md` authorizes the following departures/refinements; none is reported as a gap:

- In-app deletion requests handled manually by BC replace immediate user-triggered server-side deletion; automatic creation-based 90-day deletion remains.
- Zero-euro operation is a binding later constraint, not a loss of the brief's reliability goal.
- Optional on-demand projects replace mandatory landing projects/highlights. Suggested questions and optional guidance retain factual capability cues; no landing showcase is required.
- Same-tab temporary state expands to the unsent draft, Active Selection, immutable pending scope and agreed view continuity. New visits still start fresh; no durable cross-visit identity or transcript is authorized.
- Strict per-question Resource scope, passage-local excerpts, French UI, shared/unlisted access, usage limits and the disclosed minimal deletion audit are approved refinements.

The addendum's pending architecture adaptations and PRD §10 follow-ups are acknowledged downstream work, not accidental loss of original product intent.
