# Candidate Copilot PRD Addendum

The original product addendum notes have been incorporated into `prd.md`. Technical decisions from the subsequent architecture coaching are recorded in:

- [Architecture spine](../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md): LLM/retrieval contracts, 3,000-token history budget, source SHA provenance, data model, and cross-component invariants.
- [Runtime and delivery contracts](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md): processing leases and deadlines, atomic persistence, HTTP/idempotency/reload behavior, usage controls, retention/deletion mechanics, and CI/CD story obligations.

These linked contracts preserve the implementation detail without duplicating it in the PRD. Exact Cloudflare quota/rate-limit/reset/billing behavior, purge scheduling/margins, workflow YAML, and the operator runbook remain implementation acceptance work; this consolidation does not implement them. Decision history and superseded alternatives remain in the corresponding `.memlog.md` files.

## Approved UX reconciliation — 2026-09-30

The interaction decisions are incorporated into the PRD. [DESIGN.md](../../ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md) and [EXPERIENCE.md](../../ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md) remain the approved sketch for disposition, style and interaction detail; exact editorial content and implementation verification remain unfinished.

This update neither adds an API endpoint nor selects a schema or storage mechanism. It preserves concurrency, recovery, usage, cost, privacy and security constraints.

[Architecture update needed](architecture-update-needed.md) records the required technical adaptations and existing compatible clauses. The linked architecture/runtime documents above have **not** been changed and do not yet specify the new Resource scope or expanded session-only state:

- Trusted Resource identities and public-document mappings; strict selected-document union in retrieval and citation eligibility, without outside-scope fallback.
- Immutable question-plus-scope submission identity; scope persisted at admission and returned consistently in transcript/result/replay, including waiting and failed turns. Historical display metadata is separate from citations and follows Conversation retention/deletion/export rules.
- Separate immutable pending submission from editable next-turn draft/Active Selection; broaden the restricted session-only state contract and define reload/lifecycle reconciliation without a browser-owned transcript or durable revisit storage.
- Resolve mapping revisions, invalid/unavailable Resources and exact session view state before implementation acceptance. These are follow-up items, not approved payload/schema choices.
- BC confirmed the new-turn technical-retry policy: “Réessayer” is an icon on the failed question in the chat, not in the composer; it resubmits that question's original text and Submitted Scope under a new identity without altering the current draft/Active Selection. Architecture/runtime must express this policy while preserving admission/limits and original-scope unknown-outcome recovery. The short [user guide](../../../../guide-utilisateur.md) documents the distinction in French for the French-only V1.

## Original brief guardrails retained

Input reconciliation also recovers two original qualitative boundaries without expanding the V1 update: success is not a hiring-conversion target or attribution of hiring-process progression to Candidate Copilot; no post-MVP roadmap is committed. Future capabilities respond to observed use. Automated conversation monitoring/analysis remains a separate project, not an implicit expansion of this portfolio.
