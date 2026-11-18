# Epic 2 Context: Explore BC's Documented Work Through a Reliable Evidence-Backed Conversation

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Enable anonymous global-public questions/follow-ups with grounded answers, inspectable evidence, clarification/refusal and recovery preserving newer drafts. Deliver controlled evaluation, not recruiter sharing before real-portfolio, privacy, retention and release acceptance.

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

- Evidence is explicitly reviewed, BC-approved `content/public/**/*.md` only, with immutable IDs and genuine publication metadata. Exclude private preparation from Git/hosted inputs and tooling from evidence; remote nonpublic authoring requires BC consent.
- BC owns completeness/publication. Do not restart accepted pilots or reinstate withdrawn gates. Fiction is never BC career evidence: retain non-attribution in standalone chunks, prompts and excerpts. Accepted gaps require neither advance coverage maps nor invented support.
- Clarify ambiguity; acknowledge insufficient evidence without claiming universal absence. Redirect judgments to facts; refuse sensitive questions/BC commitments and resist injection. No Web/private fallback, hiring assessment, contacts, accounts or analytics.
- Zero euros; no automatic processing retries, repair, failover or overage. Configurable limits: 1,000 characters, 20 admitted turns, 10 creations/IP/UTC day with shared temporary pseudonymous counters, 3,000 history tokens/call. Verify provider quotas/billing; never guess resets.

## Technical Decisions

- Portable core owns policy; D1 is canonical, Workers AI replaceable. Hash Conversation-scoped tokens; authenticate before lookup, use no-store, exclude credentials from URLs/logs/prompts. Content/runtime retention ends at creation plus 90 × 24 hours; access expiry is not deletion.
- Pin committed public provenance separately from application HEAD. Deterministic JCS/SHA-256 catalog/chunks require asset verification before atomic publication; singleton/catalog/registry/FTS reads must remain coherent.
- Freeze all active document IDs at global admission, never an empty wildcard. Scope FTS before ranking/budgets; additions cannot widen, withdrawals fail the whole scope. Save actual excerpt text/identity/hash/revision separately from admission provenance.
- Classify once/attempt; refusal/clarification bypass retrieval/generation. History/catalog interpret, never substantiate. Validate structured blocks/citations/language before atomic persistence, never stream unchecked output. Schema checks cannot prove semantics.
- Atomically admit exact identity/question/scope with one fenced lease, no queue; finalize answer/evidence/citation edges and release together. Recovery/replay costs no new turn; new-id retries require recorded retryable failures. Both retain original scope/root context, never newer drafts/topics.
- Initial budgets: 30-second attempt including 5-second classifier/~2-second finalization reserve; 40-second lease, 45-second browser wait. Timeout is uncertainty.
- Approved creation: same-origin browser JSON only; reject missing/null/foreign Origin and contradictory Fetch Metadata before mutation/allowance consumption. Headers are not authentication; headerless CLI is unsupported. Lost credentials require uncertainty disclosure and explicit fresh creation, potentially another allowance; no automatic creation/suggested-question carry/send. Exhaustion uses authoritative resume time.

## UX & Interaction Patterns

French UI; answers follow question/request, excerpts retain source language. Preserve warm-paper style/fonts, visible mobile identity, bounded bottom composer, UUID and truthful disclosures. Suggestions send once; free entry sends nothing; optional guide starts open.

Passage citations inspect saved excerpts, never full documents; panels/sheets preserve chat width/focus/reading position. No global scope tokens/labels/bands or fake deletion capability.

Keep pending/draft/view separate; preserve edits and block competing sends while active/unknown. Read-only “Vérifier à nouveau” differs from failed-question “Réessayer”. Prove same-tab reload/new-visit/storage-denial behavior without transcript caching/durable fallback. Reload-only observation: nonoverlapping GETs every ~3 seconds, maximum 45 seconds.

## Cross-Story Dependencies

Epic 1 precedes this epic. Stories 2.0–2.5 have owner-accepted development scope, superseding older pending/uncommitted notes. Lexical recall gaps remain; acceptance authorizes neither semantic expansion nor claims of model quality. Deterministic, real-model/human and browser/accessibility evidence remain separate.

Epic 3 adds project descriptors/maps/selection; editorial types are not Resources. Epic 4 completes privacy/deletion/purge; Epic 5 gates sharing. BC replaces fiction and completes factual/comprehension/publication review before 5.5.

Open gaps: sensitive-input/provider disclosure, recovery usage, French copy, browser/accessibility and hosted cost/security/retention proof. Creation-origin/lost-response policies are decided; actual counter/entry integration and launch sign-off remain open. Mocks/sketches do not establish readiness.
