# Candidate Copilot PRD Addendum

The original product addendum notes have been incorporated into `prd.md`. Technical decisions from the subsequent architecture coaching are recorded in:

- [Architecture spine](../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md): LLM/retrieval contracts, 3,000-token history budget, source SHA provenance, data model, and cross-component invariants.
- [Runtime and delivery contracts](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md): processing leases and deadlines, atomic persistence, HTTP/idempotency/reload behavior, usage controls, retention/deletion mechanics, and CI/CD story obligations.

These linked contracts preserve the implementation detail without duplicating it in the PRD. Exact Cloudflare quota/rate-limit/reset/billing behavior, purge scheduling/margins, workflow YAML, and the operator runbook remain implementation acceptance work; this consolidation does not implement them. Decision history and superseded alternatives remain in the corresponding `.memlog.md` files.
