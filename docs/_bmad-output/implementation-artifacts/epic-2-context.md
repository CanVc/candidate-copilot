# Epic 2 Context: Explore BC's Documented Work Through a Reliable Evidence-Backed Conversation

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->
<!-- Source baseline: 37b3b2e0a4645e0577441c9c6f69933e3c60a65e; current owner handoff also reflected below. -->

## Goal

Enable anonymous exploration of BC's documented professional work through a reliable global-public conversation: grounded answers, inspectable evidence, bounded follow-ups, safe clarification/refusal and recovery that preserves newer drafts. Technical development remains distinct from real-corpus acceptance and recruiter-release approval.

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

- **Authoring acceptance stands:** Story 2.0 is done with three BC-validated pilots and method acceptance on 2026-11-12. Required-fact blockage and compulsory personal/non-production gates are withdrawn, not passed; do not restart pilots. BC decides completeness, validation and publication; agents flag gaps without invention or veto. Preserve approval/version/revision bindings without silent migration.
- **Public-only evidence:** only `content/public/**/*.md` feeds deployed/indexed truth. Human+AI editorial review, explicit BC publication approval and deliberate copying precede promotion. Private preparation stays gitignored/excluded from hosted contexts; tooling stays outside the corpus. Remote authoring/session processing requires disclosure and consent, not assumed local-only processing or runtime retention guarantees.
- **Public-source validation:** require unique stable, nonrecycled `document_id`, `visibility: public`, factual `title`, `created_at`, `modified_at`, real nonempty `reviewed_by`/`reviewed_at`. Dates are quoted UTC `YYYY-MM-DDTHH:mm:ssZ`; preserve creation instants, update modification times on edits, never guess historical hours. Reject missing/malformed metadata, empty reviews and duplicate IDs. Renames retain identity; rewrites require renewed review/publication approval.
- Reject files/links escaping public Markdown boundaries. Test private sentinels and configured secret/contact markers without echoing sensitive values. Patterns cannot replace editorial review or prove complete privacy. Hosted inputs must match the committed public snapshot at a full Git SHA; reject dirty/untracked/mismatched provenance.
- **Synthetic development is authorized:** `tests/fixtures/synthetic-corpus/README.md` and `spec-create-synthetic-content-fixtures.md` define three fictional French A/B sheets, not BC achievements or pilots. Keep them outside `content/public`; preserve synthetic provenance through processing without broadening production inputs. Missing visibility/empty reviews must fail validation as-is. Disposable variants must not mutate fixtures or fabricate approval. Self-checks/scripted expectations are not retrieval/model results, real-corpus acceptance or publication approval.
- **Owner decisions remain:** actual public selection, approved question-to-document coverage with limitations/deferred gaps, missing metadata, and whether `reviewed_at` denotes first-pass or final review. Resolve before promotion; never backfill approvals. Synthetic authorization closes none of these. Story 2.1 needs corpus/coverage/local validation/procedure, not indexing, model calls or UI.
- Acknowledge insufficient evidence; redirect judgments to facts; refuse sensitive requests/BC commitments. Resist injection; no Web/private fallback, contact UI, accounts or tracking. Zero euros; no automatic processing retry/repair/failover/overage. Mocks/structure never replace actual-model/human/browser evidence.

## Technical Decisions

- Portable core behind adapters; backend owns policy, D1 canonical state. Browser/model text is untrusted. Hash Conversation-scoped tokens; exclude credentials from URLs/logs/prompts.
- Deterministic chunks/catalog use exact public snapshot and JCS/SHA-256 identity. Verify assets before atomic catalog/registry/FTS activation. Freeze nonempty global membership at admission; scope FTS before ranking. Withdrawals fail closed; retain excerpt text/identity/hash/revision.
- Classify before retrieval; clarification/refusal bypass generation. History/catalog are not evidence. Validate blocks/citations/language before atomic fenced finalization. Same-id manual recovery differs from new-id recorded-failure retry; preserve original scope/root context and newer drafts.
- Initial configurable limits: 1,000 characters, 20 admitted turns, 10 creations/IP/UTC day; 3,000 history tokens. Recovery/replay are not new turns. Backend/browser budgets are 30/45 seconds. Verify actual provider quota/billing behavior rather than inventing reset times.

## UX & Interaction Patterns

French UI; answers follow question/request, excerpts retain source language. Preserve warm-paper style, mobile identity, optional guide and bounded composer. Suggestions submit once; free entry sends nothing. Passage citations show saved excerpts, not full documents; panels preserve reading/focus. Separate pending/draft/view state, without transcript caching or durable cross-visit restoration. Prove same-tab/storage-denied behavior; distinguish read-only verification from question-local retry.

## Cross-Story Dependencies

Epic 1 → accepted 2.0 → 2.1 validation/coverage/authorized copying → 2.2 artifacts. Epic 3 owns project descriptors/maps/selection; editorial types are not Resource types. Epic 4 completes privacy/deletion/90-day lifecycle; Epic 5 gates recruiter sharing.

**Tracking update (2026-11-17):** BC confirmed Story 2.1 started previously and approved this technical continuation. Sprint tracking records `review` for the delivered technical validator; the real corpus, coverage and publication still await BC's acceptance. Synthetic validation is not whole-story completion.

Open owners: BC content/review/coverage/copy; implementation/BC retrieval/models; privacy/provider sensitive-input disclosure; architecture/security origin/lost-creation-response policy; BC/architecture recovery usage; UX browser/accessibility/contrast evidence. No policy or acceptance is inferred.
