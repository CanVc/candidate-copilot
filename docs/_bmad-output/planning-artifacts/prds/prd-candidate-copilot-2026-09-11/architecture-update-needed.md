# Architecture update needed — approved resource-selection UX

Status: impact analysis / follow-up required, not an architecture amendment or implementation specification.

Scope: reconcile the approved UX sketch with the existing architecture and runtime contracts. Only this note is written; architecture, runtime and UX sources are not modified. No runtime behavior, persistence, accessibility or model quality is verified here.

## Sources and reference notation

Line references refer to the reviewed source versions.

- **A** — [ARCHITECTURE-SPINE.md](../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md), updated 2026-09-17.
- **R** — [RUNTIME-CONTRACTS.md](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md), updated 2026-09-17.
- **AM** — [architecture .memlog.md](../../architecture/architecture-candidate-copilot-2026-09-11/.memlog.md), updated 2026-09-17.
- **U** — [EXPERIENCE.md](../../ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md), updated 2026-09-30, draft / sketch-approved.
- **UM** — [UX .memlog.md](../../ux-designs/ux-candidate-copilot-2026-09-17/.memlog.md), updated 2026-09-30; canonical UX decisions. Later decisions supersede literal-prefix, tentative single-resource and hint-only proposals (lines 60–77).

BC's subsequent confirmation during this PRD update resolves the new-turn retry policy: the retry icon belongs on the failed question in the chat, never in the composer, and uses the original failed question's text and scope without changing the newer draft/selection. This decision is captured in PRD FR-8/FR-21 and its memlog; the UX sources themselves remain unchanged.

Approved baseline: optional on-demand projects; immediate multi-resource 1:1 toggles without draft mutation, persistent until individual removal; selected resources strictly constrain evidence to their mapped public documents, otherwise the deployed Public Knowledge Base only, never Web/private sources; immutable per-submission selection and historical tokens; editable next-turn draft/selection during processing; same-tab reload continuity without durable cross-visit restoration. U, Information Architecture, Component Patterns, Evidence eligibility, State Patterns and Interaction Primitives (lines 26–93); UM lines 58, 66, 69–77.

## Top impacts

1. Extend submission, canonical message storage, GET/replay and recovery contracts to carry an immutable resource-scope snapshot, distinct from the current composer selection and actual citations.
2. Add trusted public resource identities and document mappings; enforce the selected-document union in Core/retrieval and citation validation, without global fallback.
3. Extend the explicitly restricted session-storage contract for separate pending submission and next-turn draft/selection state; define reload reconciliation and reset lifecycle.
4. Reclassify project discovery as optional conversation UI, and explicitly allow editing next-turn state while keeping the existing one-processing-attempt/no-queue rule.

## Exact mismatches and required adaptations

“Conflict” below means an explicit existing restriction or contract shape needs changing. “Gap” means missing support, not an existing architectural prohibition.

### 1. Browser storage whitelist — explicit conflict

**Existing:** A AD-3 (line 59) permits only session credentials and temporary `{ requestId, question }` in `sessionStorage`. R §4 (line 71) repeats that storage is **limited** to those fields. AM lines 52 and 67 record the same continuity model.

**Approved difference:** active selection must survive same-tab refresh, and ongoing next-draft/selection/view continuity requires extensions (U State Patterns, line 77; UM line 77). An unknown-outcome submission also needs its original scope, not merely its question (U lines 76, 83, 93; UM line 76).

**Follow-up:** amend A AD-3 and R §4/§5 to permit conversation-scoped, session-only UI state. Keep separate records for (a) immutable unknown-outcome request identity/question/scope, (b) editable next-turn draft and active resource IDs, and (c) agreed view state. Terminal completion clears only the matching pending submission, never the newer draft/selection. Define initialization, explicit new-conversation reset, access-loss clearing, stale storage and unavailable-resource handling. Exact view-state fields/restoration timing remain to be specified; the sketch is not a pixel-identical reload implementation contract. No `localStorage`, browser-owned canonical transcript, durable visitor ID or cross-visit restoration is authorized.

### 2. Message payload and idempotency identity — binding shape mismatch / semantic extension

**Existing:** R §4 message POST is exactly `{ requestId, question }` (line 78); A runtime flow passes only those input values plus credentials (lines 211–212). R §1 freezes the question and defines conflict/replay in terms of the same ID/content (lines 19–26); §4's conflict row specifically says different question (line 96). A AD-10 and `messages.request_id` semantics similarly refer to original immutable question; AM line 64 records that identity rule.

**Approved difference:** identical text with different selected resources is a different submission scope; recovery must retain the original selected set, even after composer edits (U lines 64, 76, 83, 93; UM lines 71, 76).

**Follow-up:** add explicit selected-resource identity to the shared submission contract; empty selection must unambiguously mean global public scope. Authenticate and validate resource IDs/mappings server-side; do not accept browser-provided evidence paths, excerpts or trusted policy. Freeze question plus normalized selection at admission. Specify set equality, deduplication and display order so harmless ID order changes do not accidentally change the evidence scope. Same ID with changed scope must conflict, not silently update/retrieve under the new selection; same-ID recovery/replay uses the stored original scope. Update A AD-10/AD-15, flow and field semantics, R §1/§4/§5 and shared error contracts accordingly. Field names and exact payload encoding remain implementation-contract work.

**Retry boundary:** unknown outcomes recover the same question/scope/request ID; recorded recoverable failures use an explicit new logical request (R §5, lines 120–126). BC has now confirmed that this new retry copies the failed question's original text/scope, is activated by an icon on that question in the chat (never in the composer), and preserves the newer draft/selection. Specify this policy in contracts, including a new submission identity, unchanged original failed turn, admission/turn-limit/single-processing enforcement and safe unavailable-resource handling without scope widening. U line 75 leaves the mechanics to contract additions; the product scope choice is no longer open.

### 3. Resource catalog and strict retrieval — missing binding policy/port support, not a public-source contradiction

**Existing:** A AD-2/AD-7 restrict evidence to public Markdown and ranked retrieved chunks. The public topic/alias/project catalog helps interpretation, is not evidence, and lacks selectable resource identities/mappings (Classifier input/output, lines 255–278; AM line 57). `RetrievalRequest` contains only `resolvedQuestion` and `searchTerms` (A lines 299–307). There is no selected-document filter. Generator and source validation accept the current retrieved public pool, not a request-specific selected-document subset (A lines 337–392).

**Approved difference:** nonempty selection allows only the **union** of mapped public documents for selected resources. Empty selection allows the whole deployed public KB. Missing selected evidence must not trigger outside-resource supplementation (U line 64; UM lines 69–71).

**Follow-up:**

- Define stable public resource IDs, public names/short descriptions and authoritative resource-to-public-document mapping. Initially expose projects only; no upload, inferred role personalization or invented future resource types. The existing classifier catalog is a compatible input source, not already a selectable resource catalog.
- Decide catalog delivery: a versioned public build artifact is compatible with the existing minimal API; a new public route would require an explicit A AD-10/R §4 amendment. Do not assume an endpoint is approved. A's deferred “Public KB manifest” (Deferred table) does not forbid a resource mapping artifact, nor require a general source-activation manifest.
- Add validated evidence scope to application/retriever contracts. Filter eligible documents before ranking/chunk-budget selection; ensure all returned and cited chunks are inside the submitted union. No unrestricted retry, no widening when selected resources yield no matches, and no fallback to Web/private content.
- Supply scope-aware interpretation instructions/metadata to turn preparation as needed while preserving classification-before-retrieval and its no-evidence-chunks rule. Public catalog/history must never become factual evidence or expand the permitted document set. Prior turns may orient follow-ups but new factual claims still require current eligible evidence.
- Define absent/stale/removed resource IDs, empty mappings and mapping-version semantics, including manual recovery after reindex. An invalid or unavailable selected resource must never be treated silently as empty/global selection. Decide how a recovered submission retains its original logical scope when mapping/catalog revisions change; do not conflate the selection snapshot with freezing all evidence text at submission. Existing excerpt Git provenance remains binding.

Update A AD-6/AD-7, classifier/retriever/generator contracts and validation coverage. D1 FTS, provider choice and hexagonal layering do not need replacement.

### 4. Historical scope storage and result reconstruction — schema/API gap

**Existing:** A Core data shape and Column semantics (lines 401–529) have messages, answers and citations, but no per-message selected-resource snapshot. R §4 GET restores each admitted message and complete answer data (lines 79–87), but neither transcript nor result schema contains historical selection. Excerpts record what was cited, not everything selected; their historical preservation is already required (A AD-7 and Source revision propagation; AM line 62).

**Approved difference:** every selected resource is visible from waiting through success/error, immutable after submission; no token/global band for empty selection, and historical tokens are not citations (U lines 54, 58, 64, 74–76; UM lines 74–76).

**Follow-up:** persist scope with the admitted user message in the existing atomic admission transaction, not only with a successful answer. This ensures interrupted turns/finalization failures still retain their scope. Preserve historical IDs and enough public display metadata to reconstruct tokens after catalog rename/removal; specify mapping provenance separately. Add snapshot data to GET's admitted/in-progress/interrupted turns and to canonical POST/replay/completed GET output, without deriving it from current composer state or cited excerpts. Maintain result parity and original transcript placement on older-message recovery (R §1/§4; AM line 73). Do not create a mutable conversation-wide scope that retroactively changes prior messages, or reuse `answer_block_sources` for scope tokens.

Extend retention, operator export and deletion contracts to include selection snapshots and associated conversation-derived metadata (A AD-4/AD-12; R §7). They share the conversation-created 90-day deadline; they are not part of the indefinite content-free deletion-request audit.

### 5. Editable pending composer — compatible policy requiring explicit state separation

**Existing:** R §5 (lines 128–130) disables **Send**, preserves the draft and keeps reading/deletion available. A AD-15 and R §1 allow one processing lease, no queue. They do not say to disable text or resource editing. AM's ownership/recovery decisions (lines 63–67, 73) are compatible.

**Approved clarification:** draft and resource selection stay editable for the NEXT explicit submission; response arrival preserves both (U line 56; UM lines 45, 76).

**Follow-up:** state explicitly in R §5 and frontend contract that Send/admission lock is not a composer-edit lock. Separate immutable in-flight/pending envelope from editable next-turn state and reconcile by request ID. Never clear or restore the old submitted question/selection over newer edits on response/reload, auto-submit the next draft, queue it, or start another attempt while authoritative processing/unknown state prevents admission. This needs UI/recovery tests, not a concurrency relaxation or new server-side draft store.

### 6. Optional on-demand projects — capability-map reconciliation, not a new runtime prohibition

**Existing:** A Capability → Architecture Map groups FR-1..FR-4 as “landing experience” using public selected-project metadata (line 563). No invariant independently requires a permanent project showcase. U line 36 and UM line 58 explicitly identify the mandatory landing highlights as an upstream PRD override, not an architectural safety rule.

**Follow-up:** update capability placement/tracing to optional conversation Resource library and public project catalog/mappings rather than mandatory landing highlights. Library selection is immediate, multi-select, one resource/token per toggle, leaves typed text untouched, stays open and persists until individual removal (U lines 57–59; UM lines 66, 70, 72). Do not carry forward superseded literal-prefix insertion, a one-resource limit, batch Apply, automatic send or a permanent suggestion row. No arbitrary numeric selection cap is approved; any necessary technical bounds must be explicitly reconciled rather than invented here.

A's deferred **full source document browser/cards** (line 591) remains compatible: this resource chooser is not a full-source browser, and the approved Source viewer still shows passage-specific excerpts only (U lines 32–33, 61). Project selection does not require lifting that deferral.

## Already compatible clauses — retain, do not report as new conflicts

| Approved requirement | Existing compatible clauses | Remaining work |
| --- | --- | --- |
| Empty selection means public KB only; never Web/private content | A AD-2/AD-7, public source-path convention, generator eligible evidence rule; AM public-source/retrieval decisions (lines 31–38, 43, 58) | Add explicit empty/nonempty selector semantics; do not introduce Web retrieval. |
| Historical evidence stays unchanged | A AD-5/AD-7, canonical citation edges and historical excerpt SHA/text; Source revision propagation; AM line 62 | Add historical selection **alongside**, not instead of, existing evidence records. |
| Server owns selection enforcement; browser is untrusted | A AD-1/AD-3/AD-4, AD-6 validation; AM lines 32–33 | Server-resolved IDs/mappings and subset checks; UI chips alone are not enforcement. |
| Strict selected scope can produce missing/partial evidence | A AD-7, Retrieval input/output empty-result behavior (lines 320–322), answer statuses | Keep limitation within selected scope; no-match is not proof of absence. |
| Editing while pending, no queue/auto-send | A AD-15; R §1 and §5 (lines 34, 128–140) | Make editable-next-state separation explicit; keep Send disabled and server lease fencing. |
| Immutable submission and manual recovery | A AD-10/AD-15; R §1–§5; AM lines 64, 67, 73 | Extend existing identity from question-only to question plus selection. |
| Same-tab transcript/processing recovery; no durable revisits | A AD-3/AD-10, FR-18 map (line 577); R §4/§5; AM lines 52, 67 | Expand session-only UI/pending storage, not lifetime, canonical ownership or cross-visit restoration. |
| Complete answers, read-only reload observation and access-loss handling | R §3–§5: 3-second GETs / 45-second window, no streaming/retries, neutral inaccessible response | Preserve budgets and side-effect-free GET; add scope data and UI reconciliation only. |
| Privacy and usage controls remain usable during processing/limits | A AD-12/AD-16; R §6/§7 | Include new snapshots in purge/delete/export and review any added processing disclosure; do not add new audit-content retention. |

## Required follow-up verification and handoff

Amend A and R together, then align shared types, migrations, index/catalog publication, ports/adapters, frontend session lifecycle and implementation stories. Record superseding decisions in AM without treating its older entries as additional active contracts. This note authorizes neither a new endpoint nor a final schema/mapping-version policy.

Required acceptance coverage, extending A Verification coverage and R §9:

- Multi-resource union, overlapping mappings, last-token removal/global scope, zero selected matches, invalid/stale IDs and injection attempts; no outside-selected public chunk, Web source or private material in eligible evidence/citations.
- Same question/different scope under one ID conflicts; normalized equivalent selections replay; manual unknown-outcome recovery uses original question/scope despite subsequent composer edits. Test recorded-failure new-request retry with the original text/scope, question-local icon, preserved future draft/selection and normal admission/limit enforcement.
- Snapshot present at admission, waiting, interrupted and every terminal outcome; persisted token labels survive catalog changes/removal; full POST/GET/replay snapshot parity while existing citation/provenance parity remains intact.
- Pending draft and multi-selection edits survive result arrival, reload and observation without resubmission, duplication, queueing or draft mutation by selection controls. Each toggle/removal affects exactly one resource/token.
- Clear only matching pending state on completion; agreed new-conversation/access-loss/stale-session lifecycle; no durable revisit restoration. Exact view-state continuity and resource-invalidity UX need explicit specification before acceptance.
- Selection snapshot retention/deletion/export, migration compatibility and historical mapping/provenance behavior after reindex; keep existing lease fencing, usage accounting, no-retry and privacy launch checks.

Deterministic tests must establish subset enforcement and recovery mechanics. Real-model evaluations must additionally assess scope adherence, selected-scope limitations, follow-ups after scope changes and resistance to history/catalog/prompt injection; existing mechanical validation still does not prove semantic grounding (A AD-6/AD-13, Runtime validation and its limits).
