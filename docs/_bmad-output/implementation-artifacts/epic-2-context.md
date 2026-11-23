# Epic 2 Context: Explore BC's Documented Work Through a Reliable Evidence-Backed Conversation

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Let a recruiter anonymously explore BC’s documented work through questions and follow-ups across the global public corpus. Each factual passage should be inspectable, gaps should be explicit, and an interrupted exchange should be recoverable without losing the next draft. This is a controlled development and evaluation experience, not a recruiter launch.

## Stories

- Story 2.0: Define and Pilot the Content-Authoring Workflow
- Story 2.1: Prepare an Explicitly Public Knowledge Base
- Story 2.2: Build Reproducible Public Catalog and Search Artifacts
- Story 2.3: Activate a Coherent Local Public Publication
- Story 2.4: Find and Evaluate Public Evidence with Scoped Lexical Search
- Story 2.5: Start and Read an Isolated Anonymous Conversation
- Story 2.6: Enforce Fair and Private Conversation-Creation Limits
- Story 2.7: Admit One Immutable Global Question at a Time
- Story 2.8: Commit Complete Results Atomically and Replay Them Faithfully
- Story 2.9: Resolve Professional Intent, Boundaries and Clarification
- Story 2.10: Preserve Bounded Follow-Up and Clarification Context
- Story 2.11: Generate and Validate Answers Against Eligible Evidence
- Story 2.12: Integrate a Replaceable Real Provider with Safe Free-Quota Behavior
- Story 2.13: Bound Processing and Expose Honest Failure Outcomes
- Story 2.14: Evaluate Actual Global-Scope Answers Before UI Completion
- Story 2.15: Enter a French Portfolio Conversation with Optional Guidance
- Story 2.16: Read Answers and Inspect Passage-Local Source Excerpts
- Story 2.17: Compose the Next Question Without Altering the Sent One
- Story 2.18: Verify Unknown Outcomes and Recover the Original Submission Manually
- Story 2.19: Retry a Recorded Technical Failure in Its Original Context
- Story 2.20: Preserve Same-Tab Continuity Without Cross-Visit Identity
- Story 2.21: Restore Reading State and Observe Reloaded Work Without Resubmission
- Story 2.22: Complete Global-Conversation Copy and Accessibility Evidence

## Requirements & Constraints

- BC alone approves documentary facts, standalone comprehensibility and, separately, publication. Acceptance of the authoring method and three real private pilots did not publish them. The approved development corpus is three fictional sheets: preserve non-attribution to BC in every independently retrieved chunk and displayed excerpt. Real portfolio replacement and approval are still required for launch.
- Answer professional questions in the requested or current question language; keep excerpts in their original language. Clarify material ambiguity before search. Redirect value judgments to documented facts; do not assess hiring fit, expose personal information or make commitments for BC. Identify partial or missing support rather than widening the search.
- **A05 — BC’s V1 decision:** Before free-text entry, the initially open *Quelques repères* guide warns against entering passwords, API keys, confidential logs or sensitive personal data. Do not automatically scan, block or mask visitor text. Distinguish local simulation from a configured provider receiving the question and relevant conversation context. Professional refusal rules still apply. Inspect representative classifier and generator payloads with fictional inputs: the app must not attach credentials, private sources, unnecessary identifiers or unrelated personal data. Verify the French disclosure against the actual path; the decision is not proof of redaction, implementation or launch readiness.
- Configurable initial limits: 1,000 characters without truncation, 20 admitted logical messages per conversation, 10 creations per trusted client IP per UTC day. Use a temporary pseudonymous counter without linking IPs to conversations. Creation limits do not disable existing access.

## Technical Decisions

- Build deterministically from explicitly reviewed public Markdown with stable IDs, valid review metadata and known UTC timestamps. Bind hosted artifacts to the exact committed corpus revision. Verify the content-addressed catalog asset before atomically activating its identity and entire D1 dataset; readers must never mix publications.
- The Worker core owns policy behind storage, retrieval and model adapters. Accept same-origin browser JSON creation only; reject invalid origins or contradictory fetch metadata before mutation or quota use. A visible UUID is not authorization: store only the opaque token’s hash, authenticate reads before replay and return neutral access failures. Use no-store responses; keep credentials out of URLs, logs and prompts. Retention ends at creation plus 90 × 24 hours; denying expired access is not evidence of deletion.
- Atomically admit one exact question, request identity, global scope (no selected projects; all active public document IDs) and fenced attempt lease. Classify once using bounded server history (initially 3,000 tokens), prioritizing pending clarification. History informs meaning, not facts. Filter lexical FTS by the saved allowlist **before** ranking; no Web, private or unrestricted fallback. Generate only from eligible chunks. Validate language, block structure and citation membership; reconstruct excerpts from trusted chunks, not model metadata.
- Recheck ownership and source eligibility at finalization. Commit the whole result, ordered blocks, excerpt snapshots and citation links together or none; replay saved results without another turn or model call. Budget 30 seconds for processing, including a 5-second classifier allowance and approximately 2 seconds reserved for finalization, distinct from the 40-second lease and 45-second browser wait. No streaming, automatic retries, repair calls, failover or paid overage. Default to credential-free simulation; actual Workers AI evaluation is opt-in.

## UX & Interaction Patterns

- French landing: show authorship, purpose and actual storage/processing information. Offer two or three suggestions (submit the chosen one once) and free entry (send nothing). Keep identity visible on mobile; allow the guide outside the transcript to be collapsed and reopened. No contact CTA or inferred personalization. If creation is uncertain, explain that explicit fresh creation may consume another allowance; never carry the suggested question forward.
- Keep the bottom composer editable during processing, separate from the immutable submission. Disable competing sends; preserve newer edits, focus and reading position. For an unknown outcome, *Vérifier à nouveau* only reads server state; deliberate same-ID recovery preserves the original turn. Only a recorded retryable technical failure offers *Réessayer*: a newly admitted turn using the original question, scope and interpretation context.
- Show sources beside the passage they support. Group saved excerpts by distinct file, not citation count; use file tokens on desktop and a count button on mobile. Open a non-displacing margin panel or bottom sheet, then restore trigger focus. Verify keyboard, touch, screen-reader, contrast and reflow behavior on rendered surfaces.
- Keep credentials, pending submission, draft and view references in same-tab session storage, not a durable transcript cache. On reload reconcile with authenticated server state before sending; observe confirmed active work only with nonoverlapping read-only checks about every 3 seconds for at most 45 seconds. New visits start fresh.

## Cross-Story Dependencies

- Epic 1 supplies the local simulated stack. Authoring and deliberate public copying precede artifact build, activation and retrieval evaluation. Before UI completion, evaluate actual model outputs and human-judge interpretation, cited support, language and refusals separately from retrieval recall and deterministic tests. Valid citations alone do not prove support.
- Measure interrupted/recovered execution costs before deciding on further limits. Epic 3 adds selected-project scope; Epic 4 completes privacy and retention; Epic 5 verifies zero-cost operation and release readiness. Critical grounding, privacy or release findings block public sharing.
