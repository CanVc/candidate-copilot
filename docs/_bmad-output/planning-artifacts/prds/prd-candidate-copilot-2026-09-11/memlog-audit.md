# Memlog Audit — Candidate Copilot PRD Finalize

Audited source: `.memlog.md`  
Compared against: `prd.md` and `addendum.md`  
Scope: every `(decision)`, `(change)`, and `(override)` entry. `(event)` entries were not counted except where they contextualize later decisions.

## Summary

- Total audited decision/change/override entries: 25
- Captured in PRD/addendum: 22
- Missing or unclear: 0
- Set aside as process/provenance rather than product requirement: 3

## Captured entries

| # | Memlog entry | Audit result | PRD/addendum coverage |
|---|---|---|---|
| 1 | Authoritative product brief; old research brief non-authoritative | Captured for PRD authority; old research disposition is provenance | PRD §0 names the authoritative brief. |
| 2 | Serious public recruiter-facing stakes; keep MVP simple; avoid overengineering | Captured | PRD §1, §5.1, §8 counter-metrics, §9 professional credibility risk. |
| 3 | Product impression: finished, functional, secure, answers expected questions, not flashy | Captured | PRD §1, §4.1, §5.2, §8 SM-1/SM-C2, §9. |
| 4 | MVP capability blocks: guided landing, Q&A, grounding/citations, refusals/boundaries, session privacy; examples without constraining questions | Captured | PRD §4.1–§4.6, §7.1; especially FR-2, FR-6, FR-9–FR-20. |
| 5 | Value judgments: cannot judge; redirect to documented evidence | Captured | PRD UJ-2, FR-12, §6, §8 SM-3. |
| 6 | V1 citations may show excerpts/snippets; full source pages/cards deferred | Captured | PRD FR-10, §6, §7.2. |
| 7 | Privacy override: no user-triggered server deletion; use manual deletion request; retain diagnostic visibility; 90-day automatic deletion remains | Captured | PRD UJ-4, FR-16, FR-19, FR-20, §5.3, §7.2; addendum deletion note. |
| 8 | Deletion requests from app with conversation UUID; no public BC contact details; users understand max 90-day storage and deletion request option | Captured | PRD UJ-4, FR-16–FR-20, §5.3, §7.1; addendum deletion note. |
| 9 | Performance: several seconds/up to ~30s; meaningful progress/status; visible crashes unacceptable | Captured | PRD FR-8, FR-22, §5.2, §9. |
| 10 | Initial public app experience in French | Captured | PRD FR-7 consequences, §5.4, §7.1/§7.2. |
| 11 | Landing minimal; 2-3 projects; avoid targeted role/job positioning | Captured | PRD FR-3 and consequences, §7.1, §10 Q1. |
| 12 | Explicit out-of-scope; professional scope; refuse inappropriate personal/protected-characteristic topics | Captured | PRD UJ-3, FR-14, §6, §7.1. |
| 13 | Predefined minimal test set before public deployment covering normal, missing info, value judgments, sensitive topics, adversarial prompts, ambiguity, citations, refusal, privacy | Captured | PRD FR-21, FR-22, §8 SM-1/SM-3, §10 Q3. |
| 14 | UI French-only for V1; answers in language of question; source excerpts original language, expected French | Captured | PRD FR-7, §5.4, §7.1/§7.2. |
| 15 | Landing projects not selected; require 2-3 BC-selected documented projects before launch | Captured | PRD FR-3, §10 Q1. |
| 16 | Cost ambition: zero euros; avoid paid services and email dependency unless free/simple confirmed | Captured and superseded by tightened zero-euro requirement | PRD §1, §5.1, §7.2, §10 Q7. |
| 17 | No contact CTA/button/instruction to continue via recruiting channel | Captured | PRD FR-4, §5.3, §6, §7.2. |
| 18 | Cost tightened: V1 must cost zero euros | Captured | PRD §1, §5.1. |
| 19 | BC reviews retained conversations primarily for recruiter questions; also documentation gaps, misuse, bugs, answer-quality problems | Captured | PRD §2.1, FR-16, §5.3, §9 content currency risk. |
| 20 | Shared/unlisted link; no recruiter account | Captured | PRD UJ-1, FR-5, §5.1, §7.1; addendum access restriction note. |
| 21 | Returning visitors start new session/new UUID; no previous history restore | Captured | PRD FR-18. |
| 22 | Conversation UUID visible for deletion requests/complaints/support | Captured | PRD glossary, UJ-4, FR-17, FR-19; addendum deletion note. |

## Missing or unclear entries

None found among audited decision/change/override entries.

## Set-aside entries

These memlog entries are process/provenance decisions or state transitions, not product requirements that need PRD/addendum representation:

| # | Memlog entry | Reason set aside |
|---|---|---|
| 1 | User chose Coaching path for PRD creation | PRD workflow choice, not product scope/requirement. |
| 2 | Use Coaching path with Vision + Features entry point for PRD creation | PRD workflow choice, not product scope/requirement. |
| 3 | Draft PRD written from authoritative brief and coaching decisions | Document state/provenance, not a product requirement. |
