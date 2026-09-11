---
title: "Candidate Copilot Product Brief — Addendum"
status: final
created: 2026-09-10
updated: 2026-09-11
---

# Candidate Copilot — Downstream Requirements Addendum

This addendum carries detailed requirements into the PRD, architecture, privacy review, and evaluation strategy.

## Data Lifecycle and Conversation Monitoring

### Current MVP lifecycle

- The public site does not require recruiter accounts.
- Every conversation must be isolated from other visitors.
- Raw conversation history is retained for no more than 90 days and then deleted automatically.
- A visitor can delete the current conversation earlier; deletion must remove server-side data, not only local display state.
- No conversation-derived dataset or anonymized record is retained after the corresponding raw conversation is deleted.
- Before a visitor submits a message, the application must disclose the retention period and the candidate's manual-review purpose.
- Conversation data is not used to identify recruiters or contact them afterward.

### Access and allowed use

- During the MVP, only the candidate may inspect retained conversations, and only to improve the product and public knowledge base.
- Review happens through either controlled operational access to storage or a secure manual export; no private administration interface is included.

### Deferred monitoring project

Automated conversation monitoring and analysis belong to a separate future project. Candidate Copilot's MVP does not include an automated analysis integration.

A future integration may process retained conversations during the defined retention window to:

- improve the candidate knowledge base;
- identify topics that interest recruiters;
- detect unanswered or poorly answered questions.

### Open requirements

Requirements remain to be defined for access controls, auditability, deletion propagation, backups, provider access, and personal or sensitive information entered by visitors.

## Answering and Abstention Policy

- Candidate Copilot answers based on the documented public knowledge base; it does not act as the candidate's representative.
- It must not invent facts, infer undocumented intentions, express commitments, or decide on the candidate's behalf.
- It must abstain when the documentary basis is absent or insufficient.
- It must abstain from answering questions about context-dependent personal intentions such as current motivation, interest in a particular role, availability, or potential acceptance.
- It must refuse questions framed as value judgments, including whether the candidate is "good," "bad," "strong," or "weak" in an area; it must not provide or imply an evaluative verdict.
- Neutral factual questions may be answered through grounded synthesis with citations, but the recruiter remains responsible for interpreting that evidence.
- Refusals of value judgments should include a neutral redirection: explain the boundary and suggest that the recruiter ask about documented experience or decisions, without automatically supplying evidence or responding to the rejected premise.
- The exact refusal language, confidence threshold, and approach to partially answerable questions remain to be defined.
