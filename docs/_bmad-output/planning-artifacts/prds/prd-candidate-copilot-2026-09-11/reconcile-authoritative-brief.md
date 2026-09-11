---
title: Reconciliation: Authoritative Brief vs PRD/Addendum
status: complete
created: 2026-09-11
inputs:
  authoritative_brief: ../../briefs/brief-candidate-copilot-2026-09-10/brief.md
  prd: ./prd.md
  addendum: ./addendum.md
  memlog: ./.memlog.md
---

# Reconciliation: Authoritative Brief vs PRD/Addendum

## 1. Scope and method

This reconciliation compares the authoritative product brief for Candidate Copilot against the current PRD, PRD addendum, and logged user decisions/overrides in `.memlog.md`.

The brief is treated as the product-authoritative source unless `.memlog.md` records a later decision or override. The PRD and addendum are assessed for coverage, divergence, and implementation-impacting gaps.

## 2. Executive finding

The PRD is broadly consistent with the authoritative brief and captures the core product intent: a public, anonymous, recruiter-facing, evidence-grounded conversational portfolio for BC, with strict boundaries, inspectable evidence, privacy disclosure, session isolation, and no multi-candidate/platform expansion.

Most differences are intentional refinements from logged coaching decisions. One brief requirement is explicitly overridden: user-triggered server-side deletion becomes an in-app deletion request manually handled by BC, while automatic deletion within 90 days remains mandatory.

The main remaining gaps are not conceptual contradictions; they are missing or under-specified PRD requirements that should be considered before PRD finalization.

## 3. Reconciliation summary

| Brief theme | PRD/addendum coverage | Reconciliation status |
| --- | --- | --- |
| Product as BC's public interactive proof-of-work portfolio | Covered in PRD Vision and Target User. | Aligned. |
| Recruiters use it mid/end recruitment process, not for initial interest or replacing interviews | Covered in Target User, Non-Goals, Success Metrics. | Aligned. |
| Product hypothesis; recruiter demand not validated | Covered in Vision and success metrics/counter-metrics. | Aligned. |
| Public anonymous web experience, no account | Covered by FR-5 and scope. Further refined to shared/unlisted link. | Aligned with logged refinement. |
| Landing explains authorship, purpose, answer scope, credibility, data handling | Mostly covered by FR-1, FR-2, FR-3, FR-16, scope. | Mostly aligned; see Gap G1. |
| Landing is more than empty chat: highlights/projects/prompts | Projects and prompts covered; candidate highlights/capabilities not explicit. | Partial; see Gap G1. |
| Natural-language, multi-turn conversation about documented professional work | Covered by FR-6 and scope. | Aligned. |
| Structured grounded answers with citations/inspectable evidence | Covered by FR-9, FR-10, FR-11 and feature descriptions. | Mostly aligned; see Gap G4. |
| Abstain rather than guess when support is absent/insufficient | Covered by FR-11 and launch tests. | Aligned. |
| Do not represent BC, make commitments, infer intentions, or make value judgments | Covered by FR-12 and FR-13. | Aligned. |
| Exclude motivation, desired role, offer fit, availability, acceptance decisions | Covered by FR-13 and Non-Goals. | Aligned. |
| Public-by-construction: only explicitly public material deployed | Covered by FR-9, Security, Non-Goals. | Aligned. |
| Public Markdown source of truth; indexes derived from it | Not explicitly required. | Gap G2. |
| Session isolation, retention disclosure, manual review disclosure | Covered by FR-5, FR-16, Security. | Aligned. |
| User-triggered server-side deletion and 90-day deletion | Server-side immediate/user-triggered deletion is replaced by manual deletion request; 90-day deletion retained. | Accepted override O1. |
| Controlled operational access or secure manual export, no admin UI | Covered by scope, Non-Users, Non-Goals, Open Questions. | Aligned, implementation remains open. |
| Avoid dashboards, automated analysis, multi-candidate platform, onboarding | Covered by Non-Goals and scope. | Aligned. |
| Simplicity before retrieval sophistication; avoid vector retrieval unless evaluation shows need | Covered by NFRs, scope, open questions. | Aligned. |
| Success criteria: deployed, functional, reliable, polished; meaningful recruiter exploration by at least one recruiter | Covered by Success Metrics. | Aligned. |
| Avoid volume/conversion/progression attribution | Covered by Counter-Metrics and success rationale. | Aligned. |
| Risks: answer integrity, confidentiality, professional/operational credibility, content currency | Covered by Risks and Mitigations. | Aligned. |
| Abuse prevention, rate/cost limits, response targets, availability expectations | Partially covered by NFRs, addendum ideas, and open questions. | Partial; see Gap G3. |

## 4. Material gaps to consider before PRD finalization

### G1. Landing-page candidate highlights and capability cues are under-specified

The brief requires the pre-chat experience to make clear which experiences, projects, and capabilities may be worth exploring, and says candidate highlights, selected projects, and suggested questions provide light guidance. The PRD requires example questions/guidelines and 2-3 selected projects, but does not explicitly require candidate highlights or capability/experience cues beyond projects.

**Impact:** The final PRD could permit a landing page that satisfies project/prompts requirements while omitting the broader highlights/capabilities the brief expects before interaction.

**Suggested PRD action:** Add candidate highlights or documented capability/experience cues to FR-2/FR-3 or the landing-page scope, while preserving the logged decision not to target a specific role/job type.

### G2. Public Markdown source-of-truth requirement is missing

The brief states that public Markdown remains the human-readable, version-controlled source of truth and that search indexes are derived from it. The PRD covers public-only source material but does not explicitly require Markdown as the canonical source or derived indexes.

**Impact:** Architecture could satisfy public-only grounding while drifting toward an opaque knowledge base or manually edited index, weakening auditability and maintainability expected by the brief.

**Suggested PRD action:** Add a source-management requirement or NFR that the Public Knowledge Base is maintained as human-readable, version-controlled public Markdown, with runtime/search artifacts derived from it.

### G3. Operational availability, abuse, and rate/cost controls remain too open for launch readiness

The brief lists reliable availability, abuse prevention, rate and cost limits, response-time targets, and availability expectations as details the PRD/architecture must define. The PRD includes rough latency expectations, professional failure behavior, zero-euro cost, and an open question about abuse/rate limits, while the addendum lists possible controls such as noindex, access code, and rate limiting.

**Impact:** Final PRD launch-readiness may depend on unstated operational acceptance criteria, especially for a recruiter-facing public tool where downtime, abuse, or runaway usage could damage credibility.

**Suggested PRD action:** Either define minimal V1 acceptance criteria for availability/abuse/cost protection, or explicitly assign them to architecture as launch-blocking requirements tied to FR-21/FR-22.

### G4. Answer structure, completeness, and evidence threshold expectations are only implicit

The brief emphasizes structured answers, completeness, evidence thresholds, explicit grounding, abstention, and evaluation cases for citation coverage, completeness, and adversarial prompts. The PRD requires source excerpts and missing-evidence handling, but does not define a minimal answer shape or explicitly require completeness/evidence-threshold checks in the launch test set.

**Impact:** The product could cite sources and refuse unsafe questions while still producing thin, selectively incomplete, or inconsistently structured answers.

**Suggested PRD action:** Add a lightweight answer-quality requirement: answers should separate supported claims from missing/partial evidence, include sufficient excerpts for the claim, and be evaluated for completeness on representative questions.

## 5. Conflicts, overrides, and logged refinements

### O1. Deletion mechanism override: accepted and reflected

- **Brief requirement:** MVP includes server-side deletion triggered by the user, plus automatic deletion of raw and derived conversation data within 90 days.
- **Logged override:** `.memlog.md` records that deletion changed from user-triggered server-side deletion to user-submitted deletion request handled manually by BC, to preserve diagnostic visibility into malfunction triggers. The 90-day automatic deletion requirement remains.
- **PRD/addendum state:** FR-19 requires in-app deletion request submission; UJ-4 explains manual handling; FR-20 keeps automatic deletion within 90 days; addendum confirms the PRD should state the user-facing requirement while architecture decides processing.
- **Reconciliation:** This is an intentional override, not an unresolved conflict.

### O2. Public anonymous access refined to shared/unlisted access

- **Brief requirement:** public anonymous recruiter-facing site without account.
- **Logged refinement:** use a shared/unlisted link, no recruiter account, no broad discoverability; IP geofiltering is not primary security.
- **PRD/addendum state:** FR-5 and NFRs use shared, unlisted link and avoid broad public indexing.
- **Reconciliation:** Additive refinement compatible with the brief's public/no-account intent.

### O3. V1 language behavior refined

- **Brief requirement:** natural-language conversation; no language specified.
- **Logged refinement:** V1 UI is French-only; answers follow the user's question language where practical; excerpts remain in original source language, expected French in V1.
- **PRD state:** UJ-1, FR-7, NFR Language, and scope capture this.
- **Reconciliation:** Additive product decision, not a conflict.

### O4. Contact/recruiting-channel UI excluded

- **Brief state:** boundary of public profile and contact information is deferred/open.
- **Logged refinement:** no contact CTA, contact button, public BC contact details, or instruction to continue via recruiting channel in V1.
- **PRD state:** FR-4 and Non-Goals capture this.
- **Reconciliation:** Accepted scope decision.

### O5. Zero-euro cost requirement added

- **Brief state:** simplicity and operational credibility; no explicit zero-euro requirement.
- **Logged refinement:** V1 must cost zero euros and avoid mandatory paid services.
- **PRD state:** Vision, NFR Simplicity and Cost, and scope capture this.
- **Reconciliation:** Additive implementation constraint.

### O6. Returning visitor/session behavior clarified

- **Brief requirement:** isolated visitor conversations and no account.
- **Logged refinement:** returning visitors start a new session with a new Conversation UUID; no previous history restoration.
- **PRD state:** FR-18 captures this.
- **Reconciliation:** Additive privacy/simplicity clarification.

## 6. Notable PRD additions beyond the brief

These additions are supported by logged decisions and do not conflict with the brief:

- French-only V1 UI.
- Visible Conversation UUID for diagnostics, deletion requests, and complaints.
- In-app deletion request submission without exposing BC contact details.
- No contact CTA or recruitment follow-up UI.
- Full source-card/document browsing deferred from V1.
- Working/progress status during answer generation, with rough expectation that deeper answers may take up to about 30 seconds.
- Explicit sensitive/personal-topic refusals including protected-characteristic examples.
- Prompt-injection/rule-bypass refusal requirement.
- Pre-launch test set covering normal, missing-information, value-judgment, sensitive, adversarial, ambiguous, citation, refusal, privacy, and deletion behavior.

## 7. Final assessment

The PRD and addendum are ready to proceed if the accepted deletion override remains intentional. For PRD finalization, the main recommended edits are to add explicit landing-page candidate highlights/capability cues, preserve the public Markdown source-of-truth principle, tighten minimal operational launch criteria, and make answer completeness/evidence-threshold expectations explicit enough to evaluate.
