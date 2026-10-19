---
title: "Candidate Copilot Product Brief — Addendum"
status: final
created: 2026-09-10
updated: 2026-10-19
---

# Candidate Copilot — Downstream Requirements Addendum

This addendum carries product guardrails into the [PRD](../../prds/prd-candidate-copilot-2026-09-11/prd.md), architecture, privacy review and evaluation strategy. It is synchronized with later approved decisions on manual Deletion Requests, the minimal audit exception and factual refusal redirection; it does not reopen those decisions.

## Data Lifecycle and Conversation Monitoring

### Current MVP lifecycle

- The public site does not require recruiter accounts.
- Every conversation must be isolated from other visitors.
- Raw and derived Conversation data is deleted automatically no later than Conversation creation plus 90 × 24 hours in UTC; later activity does not extend the deadline.
- A Visitor may submit an in-app Deletion Request for the current Conversation. BC handles it manually and non-immediately; submission is not confirmation of deletion or a guarantee of an earlier completion date. Completed deletion removes server-side content and managed copies, not only local display state.
- No conversation-derived content dataset or anonymized content record survives the corresponding deletion. The sole app audit exception is minimal Deletion Request metadata retained indefinitely: request id, historical Conversation UUID when known, status and lifecycle timestamps. No question/answer/excerpt text, scope/display data, credentials or Visitor identity belongs in that audit.
- Before a Visitor submits a message, the application must disclose retention from creation, BC's manual-review purpose, manual deletion handling and the separate audit exception.
- Conversation data is not used to identify recruiters or contact them afterward.

### Access and allowed use

- During the MVP, only BC may inspect retained Conversations: primarily to understand recruiter questions and also to identify documentation gaps, misuse, bugs or answer-quality problems and improve the product/public knowledge base. This does not authorize identifying or contacting Visitors.
- Review happens through either controlled operational access to storage or a secure manual export; no private administration interface is included.

### Deferred monitoring project

Automated conversation monitoring and analysis belong to a separate future project. Candidate Copilot's MVP does not include an automated analysis integration.

A future integration may process retained conversations during the defined retention window to:

- improve the candidate knowledge base;
- identify topics that interest recruiters;
- detect unanswered or poorly answered questions.

### Open requirements

The [runtime contracts §4–§7](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md#4-public-http-and-session-contract) now define token-scoped access, session state, deletion/audit ownership and managed-copy cleanup. Implementation must demonstrate these contracts and assess actual provider/log/backup behavior. Visitor-entered sensitive content, backup restoration and related unresolved acceptance questions remain in the [open acceptance register](../../reviews/open-acceptance-items.md); this synchronization does not choose their solutions.

## Answering and Abstention Policy

- Candidate Copilot answers based on the documented public knowledge base; it does not act as the candidate's representative.
- It must not invent facts, infer undocumented intentions, express commitments, or decide on the candidate's behalf.
- It must abstain when the documentary basis is absent or insufficient.
- It must abstain from answering questions about context-dependent personal intentions such as current motivation, interest in a particular role, availability, or potential acceptance.
- It must refuse questions framed as value judgments, including whether the candidate is "good," "bad," "strong," or "weak" in an area; it must not provide or imply an evaluative verdict.
- Neutral factual questions may be answered through grounded synthesis with citations, but the recruiter remains responsible for interpreting that evidence.
- For a value judgment with an identifiable professional angle, explain the boundary and redirect to documented examples within that question's Submitted Scope, with citations when evidence is available. Do not endorse the rejected evaluative premise or supplement from outside the scope. Missing evidence remains explicit; material ambiguity asks for clarification. This follows [PRD FR-12](../../prds/prd-candidate-copilot-2026-09-11/prd.md#fr-12-refuse-value-judgments-and-redirect-to-evidence).
- Partial/missing-evidence behavior and routing are defined in PRD FR-6/FR-11/FR-12 and architecture contracts. Exact French wording and representative retrieval/model evaluation remain acceptance work; no universal numeric confidence threshold is approved.
