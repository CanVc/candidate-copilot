---
title: Candidate Copilot — Open acceptance questions
status: open
created: 2026-10-19
updated: 2026-10-19
---

# Open acceptance questions

This register retains unresolved questions from the [2026-10-19 alignment audit](alignment-review-2026-10-19.md#adversarial-finding-dispositions), findings A05–A10. It is a follow-up index, **not a new product policy, runtime contract or readiness approval**. All six items are open: no solution, numeric budget, new endpoint, storage mechanism, deletion SLA or palette change is selected here. Reviewer suggestions remain proposals until the relevant owner resolves them against the approved PRD and architecture.

The audit report and [original findings JSON](alignment-review-2026-10-19.json) are immutable snapshots; this register may track subsequent decisions/evidence. IDs identify provenance, not importance. Conditional findings do not establish a demonstrated runtime defect or exploit.

## Ownership and acceptance context

| Item | Question | Responsible discipline | Acceptance context | Closure checkpoint |
| --- | --- | --- | --- | --- |
| A05 | Visitor-entered sensitive content versus app-added prompt metadata | BC/privacy, architecture and provider-adapter implementation | Actual processing/disclosure and data minimization, PRD FR-16/§5.3 | Provider integration/privacy acceptance; truthful disclosures before recruiter launch |
| A06 | Backup restoration after expiry or completed deletion | Operations/privacy and retention implementation | Deletion/retention and operational recovery, PRD FR-19/20/§5.5 | Backup assessment before recruiter launch; restoration proof before recovery is enabled or relied on |
| A07 | Browser-origin policy for anonymous conversation creation | Architecture/security and HTTP-adapter implementation | Admission/abuse-control acceptance, PRD FR-5/21/§5.1/§5.3 | Anonymous-creation security sign-off before recruiter launch |
| A08 | Execution/recovery usage distinct from logical turns | BC/architecture and usage/provider implementation | Measured free-quota/abuse behavior, PRD FR-21/§5.1 | Measured usage-control sign-off before recruiter launch; no numeric limit selected here |
| A09 | Creation committed but credentials lost in transport | Architecture, entry UX and HTTP/session implementation | Entry failure/recovery behavior, PRD FR-5/8/18/21 | Entry/recovery acceptance before recruiter launch |
| A10 | Conditional muted-text contrast | UX and frontend/accessibility implementation | Rendered text/accessibility checks, PRD §5.6 | Rendered frontend/accessibility sign-off before recruiter launch |

## A05 — Visitor-entered sensitive content

**Open question:** How does the prompt-minimization rule distinguish unnecessary metadata added by the application from personal or sensitive information inside the Visitor's submitted question? What detectable-secret handling and disclosure are appropriate before provider processing?

**Existing boundary:** [PRD FR-16](../prds/prd-candidate-copilot-2026-09-11/prd.md#fr-16-disclose-conversation-retention-review-and-processing) states: “The app must not intentionally include private source material, secrets, unnecessary Visitor identifiers, or unrelated personal data in model prompts.” The [classifier/generator contracts](../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md#classifier-input-and-output) process user text but exclude session credentials and unnecessary application metadata. The brief already deferred visitor-sensitive-input handling. This is not evidence that comprehensive semantic redaction exists or that a leak occurred.

**Evidence to close:** An explicit policy boundary, actual prompt/disclosure inspection and representative tests of the chosen handling, without claiming complete sensitive-data detection. No redaction mechanism is approved by this register.

## A06 — Backup restore and deletion

**Open question:** Under the actual host/provider backup and disaster-recovery behavior, how will expiry and already-completed manual deletions remain effective after restoration?

**Existing boundary:** [Runtime §7](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#7-deletion-requests-and-retention) binds Conversation data/managed copies to the creation-based deadline and explicitly leaves host/provider logs/backups to launch assessment. Its code-deployment rollback ban is not a complete disaster-recovery contract.

**Evidence to close:** Documented backup retention/restore behavior and a recovery test or equivalent verified assessment showing that expired/deleted data cannot be served or retained contrary to policy. Do not treat this as approval for an indefinite content-bearing tombstone or a new audit-content exception.

## A07 — Conversation-creation request origin

**Open question:** Which browser origins and content types may create anonymous Conversations, and are any non-browser clients allowed? How is cross-site creation/quota consumption handled?

**Existing boundary:** [Runtime §4](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#4-public-http-and-session-contract) exposes unauthenticated creation; [§6](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#6-usage-limits-and-quota-boundary) fixes the configurable daily IP allowance. Neither selects an Origin/Fetch Metadata policy. CORS response visibility alone does not specify whether a POST can consume allowance.

**Evidence to close:** An explicit browser/non-browser request policy and tests of accepted/rejected cross-origin creation attempts and their quota effects. No specific header mechanism or new client capability is chosen here.

## A08 — Recovery executions and free capacity

**Open question:** Do measured usage and abuse tests justify execution/recovery controls separate from the logical-turn cap, and how would a controlled limit preserve legitimate recovery?

**Existing boundary:** [Runtime §1](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#1-turn-admission-identity-and-ownership) allows manually recovered attempts without charging another logical turn; [§6](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#6-usage-limits-and-quota-boundary) explicitly requires measurement before adopting additional numeric budgets. Attempt fencing does not guarantee exactly one provider computation.

**Evidence to close:** Include interrupted/manual recovery attempts in usage measurements and document the resulting policy decision. Preserve logical-turn accounting, no automatic retries/fallback/paid overage, and access to authenticated reads, saved replay and deletion. This register imposes no attempt cap, cooldown or new global budget.

## A09 — Lost conversation-creation response

**Open question:** What does entry show and do when creation may have committed but its response—and one-time token—was lost? How are any further creation allowance and suggested-question intent handled without silent resubmission?

**Existing boundary:** [Runtime §4](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#routes-and-payloads) returns the Conversation UUID and an opaque session token on creation; only the session token's hash is stored, while the UUID remains a normal persisted identifier. Message-level same-request recovery does not define creation-specific idempotency or recover an unknown token.

**Evidence to close:** A defined UX/HTTP path with lost-response and exhausted-allowance cases. An explicit fresh-creation path or secure bounded creation recovery are proposals, not selected behavior; do not add an endpoint, persistent credential copy or automatic retry by implication.

## A10 — Conditional muted-on-paper text contrast

**Open question:** Which approved foreground/background pairs and rendered sizes will be used for small metadata, and do they satisfy the existing readable-contrast requirement?

**Existing boundary:** [DESIGN](../ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md#colors) supplies tokens, not finalized component pairings/sizes; [PRD §5.6](../prds/prd-candidate-copilot-2026-09-11/prd.md#56-responsive-interaction-and-accessibility) requires real accessibility checks. The audit independently calculated `#68716c` on `#f3f0e8` at approximately 4.425:1, relevant if normal/small text actually uses that pair. This is not a completed accessibility audit.

**Evidence to close:** Inspect rendered pairings/sizes and verify contrast for the actual treatment, using the approved palette where possible. The issue does not reopen the approved layout, fonts or palette.

## Other existing acceptance obligations

This register does not replace [PRD §10](../prds/prd-candidate-copilot-2026-09-11/prd.md#10-open-questions) or [Runtime §9](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#9-required-verification-before-implementation-sign-off). Those retain BC's reviewed project content and French copy, supported-browser reload/new-visit discrimination and storage denial, actual provider processing/billing/quota checks, retrieval/real-model evaluation, D1/publication/migration tests, accessibility/mobile-keyboard proof, purge/review cadence and operator/deployment runbook. Defined contracts and approved UX sketches are not evidence that these obligations have been completed.
