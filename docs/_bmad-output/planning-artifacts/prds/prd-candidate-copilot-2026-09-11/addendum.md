# Candidate Copilot PRD Addendum

The original product addendum notes have been incorporated into `prd.md`. Technical decisions from the subsequent architecture coaching are recorded in:

- [Architecture spine](../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md): LLM/retrieval contracts, 3,000-token history budget, source SHA provenance, data model, and cross-component invariants.
- [Runtime and delivery contracts](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md): processing leases and deadlines, atomic persistence, HTTP/idempotency/reload behavior, usage controls, retention/deletion mechanics, and CI/CD story obligations.

These linked contracts preserve the implementation detail without duplicating it in the PRD. Exact Cloudflare quota/rate-limit/reset/billing behavior, purge scheduling/margins, workflow YAML, and the operator runbook remain implementation acceptance work; this consolidation does not implement them. Decision history and superseded alternatives remain in the corresponding `.memlog.md` files.

## Approved UX reconciliation — current disposition, 2026-10-19

The 2026-09-30 interaction decisions are incorporated into the PRD and current architecture/runtime contracts. [DESIGN.md](../../ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md) and [EXPERIENCE.md](../../ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md) remain the approved sketch for disposition, style and interaction detail; exact editorial content and implementation verification remain unfinished.

The [architecture impact analysis](architecture-update-needed.md) preserves the earlier handoff against the old question-only/session-whitelist baseline. Its contract adaptations are incorporated, not current missing architecture. Use these current owners:

| Reconciled concern | Current contract |
| --- | --- |
| Trusted Resource identities/maps, canonical public catalog and coherent active publication | Architecture AD-17/18; [Runtime §1](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#catalog-membership-and-revision-handling) and [§8](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#8-delivery-contract-and-story-handoff). Browser JSON is presentation; D1 is runtime authority. |
| Immutable admission scope, normalized identity, persisted history and result/replay parity | Architecture AD-4/10/15/18; [Runtime §1/§2](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#1-turn-admission-identity-and-ownership) and [shared shapes in §4](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#shared-submission-and-snapshot-shapes). |
| Pending submission versus editable next draft/selection and reference-only view state | Architecture AD-3/10; [Runtime §5](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#5-browser-retry-next-turn-state-and-reload-behavior). Includes stale/unavailable Resource behavior and session lifecycle policy. |
| Original-scope technical retry versus unknown-outcome recovery | [Runtime §4/§5](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#shared-submission-and-snapshot-shapes): question-local “Réessayer” creates a new logical turn from the failed question; recovery retains the original request. Neither overwrites the newer draft/selection. The French [user guide](../../../../guide-utilisateur.md) explains the distinction. |
| Scope/evidence retention, exports, deletion and release verification | Architecture AD-12/13/14; [Runtime §7–§9](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#7-deletion-requests-and-retention). Historical scope and actual cited-source provenance remain distinct. |

Contract reconciliation is complete; implementation, migrations/atomic publication, supported-browser lifecycle proof, model/retrieval evaluation, privacy/accessibility checks, provider billing/quota verification and the runbook are not. PRD §10 and the [open acceptance register](../../reviews/open-acceptance-items.md) retain the remaining work without selecting unresolved policies. This documentation synchronization adds no API, schema, storage mechanism or launch guarantee; concurrency, recovery, usage, cost, privacy and security constraints are unchanged.

## Original brief guardrails retained

Input reconciliation also recovers two original qualitative boundaries without expanding the V1 update: success is not a hiring-conversion target or attribution of hiring-process progression to Candidate Copilot; no post-MVP roadmap is committed. Future capabilities respond to observed use. Automated conversation monitoring/analysis remains a separate project, not an implicit expansion of this portfolio.
