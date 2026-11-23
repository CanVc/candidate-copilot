---
title: Candidate Copilot — Open acceptance questions
status: open
created: 2026-10-19
updated: 2026-11-23
---

# Open acceptance questions

This register retains unresolved questions from the [2026-10-19 alignment audit](alignment-review-2026-10-19.md#adversarial-finding-dispositions), findings A05–A10. It is a follow-up index, **not a new product policy, runtime contract or readiness approval**. Launch acceptance remains open for all six items. BC selected the A07/A09 development policies on 2026-11-18 (implemented in Story 2.5) and the A05 V1 input-handling policy on 2026-11-23 (recorded below; implementation and verification pending). Other reviewer suggestions remain proposals. No numeric budget, recovery endpoint, durable credential mechanism, deletion SLA or palette change is selected here.

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

**Owner decision (BC, 2026-11-23, V1):** Warn visitors rather than automatically scanning, blocking or masking their input for secrets or sensitive personal data. The short “Quelques repères” usage guide should remind visitors before free-text entry not to paste passwords, API keys, confidential logs or sensitive personal data. The notice must describe the actual processing path: distinguish local simulation from a configured provider that receives the question and relevant conversation context. Do not imply that unsafe input is automatically made safe. This decision concerns visitor-entered text only; it does not relax the application's own prompt-minimization or professional-refusal rules.

**Existing boundary:** [PRD FR-16](../prds/prd-candidate-copilot-2026-09-11/prd.md#fr-16-disclose-conversation-retention-review-and-processing) states: “The app must not intentionally include private source material, secrets, unnecessary Visitor identifiers, or unrelated personal data in model prompts.” The [classifier/generator contracts](../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md#classifier-input-and-output) process user text but exclude session credentials and unnecessary application metadata. The brief already deferred visitor-sensitive-input handling. This is not evidence that comprehensive semantic redaction exists or that a leak occurred.

**Evidence still needed:** Story 2.12 inspects representative classifier and generator payloads using fictional test inputs: distinguish visitor text from app-added fields and verify that credentials, private sources and unnecessary identifiers are not attached. Story 2.15 places the reminder in the guide; Story 2.22 verifies the final French copy against the configured processing path. The policy decision is recorded, not evidence of implementation, permission for live calls or launch approval.

## A06 — Backup restore and deletion

**Open question:** Under the actual host/provider backup and disaster-recovery behavior, how will expiry and already-completed manual deletions remain effective after restoration?

**Existing boundary:** [Runtime §7](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#7-deletion-requests-and-retention) binds Conversation data/managed copies to the creation-based deadline and explicitly leaves host/provider logs/backups to launch assessment. Its code-deployment rollback ban is not a complete disaster-recovery contract.

**Evidence to close:** Documented backup retention/restore behavior and a recovery test or equivalent verified assessment showing that expired/deleted data cannot be served or retained contrary to policy. Do not treat this as approval for an indefinite content-bearing tombstone or a new audit-content exception.

## A07 — Conversation-creation request origin

**Open question:** Which browser origins and content types may create anonymous Conversations, and are any non-browser clients allowed? How is cross-site creation/quota consumption handled?

**Existing boundary:** [Runtime §4](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#4-public-http-and-session-contract) exposes unauthenticated creation; [§6](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#6-usage-limits-and-quota-boundary) fixes the configurable daily IP allowance. Neither selects an Origin/Fetch Metadata policy. CORS response visibility alone does not specify whether a POST can consume allowance.

**Owner decision (BC, 2026-11-18, A approval):** Accept same-origin browser JSON only; reject missing/null/foreign Origin and contradictory Fetch Metadata before mutation or allowance consumption. Headerless CLI clients are unsupported; forgeable request headers are not authentication.

**Development evidence:** Story 2.5 adds explicit trusted-origin configuration, origin/content/body/Fetch Metadata checks before D1 mutation, unit policy-ordering tests and actual-D1/workerd isolation/rejection fixtures. An ephemeral-port actual Vite proxy check verifies Origin preservation; forwarded headers confer no trust. The contradictory-mode workerd fixture injects/observes the handler's raw header because Node fetch overwrites that header in transport. See [local application verification](../../../development/application.md#anonymous-conversation-identity--story-25-controlled-local-development).

**Still open:** Actual allowance/counter integration is Story 2.6; hosted origin/HTTPS/security and recruiter-launch sign-off remain required. Controlled policy fixtures do not claim actual quota integration.

## A08 — Recovery executions and free capacity

**Open question:** Do measured usage and abuse tests justify execution/recovery controls separate from the logical-turn cap, and how would a controlled limit preserve legitimate recovery?

**Existing boundary:** [Runtime §1](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#1-turn-admission-identity-and-ownership) allows manually recovered attempts without charging another logical turn; [§6](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#6-usage-limits-and-quota-boundary) explicitly requires measurement before adopting additional numeric budgets. Attempt fencing does not guarantee exactly one provider computation.

**Evidence to close:** Include interrupted/manual recovery attempts in usage measurements and document the resulting policy decision. Preserve logical-turn accounting, no automatic retries/fallback/paid overage, and access to authenticated reads, saved replay and deletion. This register imposes no attempt cap, cooldown or new global budget.

## A09 — Lost conversation-creation response

**Open question:** What does entry show and do when creation may have committed but its response—and one-time token—was lost? How are any further creation allowance and suggested-question intent handled without silent resubmission?

**Existing boundary:** [Runtime §4](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#routes-and-payloads) returns the Conversation UUID and an opaque session token on creation; only the session token's hash is stored, while the UUID remains a normal persisted identifier. Message-level same-request recovery does not define creation-specific idempotency or recover an unknown token.

**Owner decision (BC, 2026-11-18, A approval):** Lost creation responses require an uncertainty notice and explicit fresh creation, potentially consuming another allowance. No unknown-token recovery, automatic creation or suggested-question carry/send is allowed. Exhausted allowance shows its authoritative resume time.

**Development evidence:** Story 2.5 provides a redacted `creation_uncertain` HTTP notice (including failures after a possible commit), one-time credentials and controlled actual-D1 lost-response/explicit-fresh/exhaustion/suggested-intent fixtures. It adds no recovery endpoint or durable credential copy.

**Still open:** The entry UI and actual IP allowance are Stories 2.15/2.6. The fixtures explicitly do not prove those integrations or close recruiter-launch entry/recovery acceptance.

## A10 — Conditional muted-on-paper text contrast

**Open question:** Which approved foreground/background pairs and rendered sizes will be used for small metadata, and do they satisfy the existing readable-contrast requirement?

**Existing boundary:** [DESIGN](../ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md#colors) supplies tokens, not finalized component pairings/sizes; [PRD §5.6](../prds/prd-candidate-copilot-2026-09-11/prd.md#56-responsive-interaction-and-accessibility) requires real accessibility checks. The audit independently calculated `#68716c` on `#f3f0e8` at approximately 4.425:1, relevant if normal/small text actually uses that pair. This is not a completed accessibility audit.

**Evidence to close:** Inspect rendered pairings/sizes and verify contrast for the actual treatment, using the approved palette where possible. The issue does not reopen the approved layout, fonts or palette.

## Other existing acceptance obligations

**OPEN-1 content handoff, amended 2026-11-18:** Story 2.0's BC-accepted method and three real pilots (2026-11-12) remain historical evidence unchanged. Under [amended Story 2.1](../epics.md#story-21-prepare-an-explicitly-public-knowledge-base), BC accepts three explicitly fictional public development copies and documentary gaps, with genuine final development-review metadata and unchanged safety/provenance validation. No advance question-to-document map, exhaustive completeness gate or new real interviews block development. Optional questions remain useful; later grounding, missing-information and scope evaluations remain required, with honest insufficient-evidence behavior, no invention and no scope widening. This closes 2.1 only for development, not OPEN-1's real-portfolio replacement, genuine factual/comprehension/publication review, project catalog choices in 3.1 or recruiter-launch approval. **Named execution checkpoint — pre-5.5 real-portfolio handoff (BC):** before Story 5.5 launch evaluation, BC replaces the fictional corpus with selected real-portfolio sources and completes final factual, standalone-comprehension and publication review with unchanged metadata/safety/committed-provenance checks. This remains open and adds no new real interviews or advance coverage/completeness gate to amended 2.1. Fiction is never attributed to BC. Local validation reports null revision; actual committed provenance awaits an authorized commit, not an old-HEAD claim. See the [inventory and verification handoff](../../implementation-artifacts/handoff-2-1-development-corpus.md). Audit A05–A10 retain launch-acceptance obligations (with the A07/A09 development decisions above); this does not authorize private runtime sources or remote processing of unselected material.

This register does not replace [PRD §10](../prds/prd-candidate-copilot-2026-09-11/prd.md#10-open-questions) or [Runtime §9](../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#9-required-verification-before-implementation-sign-off). Those retain BC's reviewed project content and French copy, supported-browser reload/new-visit discrimination and storage denial, actual provider processing/billing/quota checks, retrieval/real-model evaluation, D1/publication/migration tests, accessibility/mobile-keyboard proof, purge/review cadence and operator/deployment runbook. Defined contracts and approved UX sketches are not evidence that these obligations have been completed.
