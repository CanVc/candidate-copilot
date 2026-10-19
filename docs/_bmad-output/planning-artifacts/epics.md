---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
extractionStatus: user-confirmed
epicDesignStatus: user-approved
storyGenerationStatus: completed
finalValidationStatus: document-checks-complete-readiness-conditional
workflowStatus: completed
userApprovalScope: epic-structure-and-story-titles
approvedStoryOutlineCount: 54
validationScope: document-only
requirementCoverage:
  functional: 22
  nonfunctional: 35
  architecture: 44
  ux: 25
openDecisionCheckpoints: 11
readinessNotes:
  - BC approved the complete epic and story outline; detailed acceptance criteria beyond the individually approved stories were not separately confirmed.
  - Owner decisions and evidence checkpoints remain prerequisites where explicitly identified.
  - No runtime, browser, real-model, deployment, purge or billing verification was performed in this planning workflow.
storyDesignCompletedEpics:
  - 1
  - 2
  - 3
  - 4
  - 5
currentEpic: null
generatedEpics:
  - 1
  - 2
  - 3
  - 4
  - 5
storyCount: 54
acceptanceScenarioCount: 249
approvedStories:
  - '1.1'
  - '1.2'
  - '1.3'
  - '1.4'
  - '1.5'
  - '2.1'
reviewMode: complete-document-review-requested-by-user
inputDocuments:
  - docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md
  - docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md
  - docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md
  - docs/_bmad-output/planning-artifacts/ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md
  - docs/_bmad-output/planning-artifacts/ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md
  - docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/addendum.md
  - docs/_bmad-output/planning-artifacts/reviews/open-acceptance-items.md
---

# candidate-copilot - Epic Breakdown

## Overview

This document contains the confirmed requirements inventory and approved five-epic, 54-story outline for candidate-copilot, decomposing the PRD, approved UX sketch and binding architecture/runtime contracts into implementable stories. BC individually approved Stories 1.1–1.5 and 2.1, requested completion of all remaining epics without intermediate approval, then approved the complete ordered epic/story title outline. Detailed acceptance criteria for the remaining stories were not separately confirmed. Planning completion and outline approval do not imply implementation, resolution of owner decisions or launch readiness.

The seven input documents were confirmed by BC. PRD FR-1 through FR-22 retain their original identifiers. NFR, AR and UX-DR identifiers below are extraction-local traceability labels, not new product policies. The final PRD governs product requirements; the architecture spine and runtime companion govern technical contracts. DESIGN and EXPERIENCE are sketch-approved drafts: preserve their disposition/style and settled behavior without treating placeholder copy, mock measurements or sketch approval as production, privacy or accessibility evidence. Historical reviews and superseded impact analyses are not active requirements. Referenced source sections retain their full authority; this inventory does not replace their schemas or edge-case contracts.

Scope is BC's personal, zero-euro V1 conversational portfolio for recruiters, not a multi-candidate product, autonomous representative, hiring recommendation, fit score, contact channel, admin dashboard, full-document browser, upload system or Web retrieval service. Do not introduce mandatory context/role selection, inferred recruiter personalization, analytics, outbound email, vector retrieval without evaluation evidence, or a committed post-MVP roadmap. Success means trustworthy professional exploration, not persuasion, conversation volume or hiring-conversion attribution.

## Requirements Inventory

### Functional Requirements

Source: PRD §4, including all Acceptance / Planning Notes and UJ-1–UJ-4.

FR-1: Explain on the landing page that Candidate Copilot is BC's interactive portfolio and answers from public documentation; make its purpose understandable before submission without presenting it as BC's autonomous representative.

FR-2: Offer two to three self-contained suggested questions and a distinct free-entry path. A suggested question enters Conversation and submits once under ordinary admission; free entry enters without sending. Both show an initially open, manually collapsible/reopenable short guide outside the transcript under “Quelques repères”; answers never automatically hide it. Context is optional, not mandatory Resource/category/role onboarding, inferred personalization or fit assessment. No extra landing form, static skills/proof band or permanent Conversation suggestion row.

FR-3: Provide an optional composer-accessible desktop/mobile Resource Library of public projects with factual names/descriptions and immediate multi-selection. Each toggle changes exactly one Resource/token, keeps the library open, preserves typed text and never sends/counts a turn; no duplicates, Apply step, arbitrary selection cap or uploads. Individually removable Active Resource Tokens occupy one horizontally scrollable row above text, never wrapping or collapsing into +N; hide an empty row. Selection persists after send until explicit removal; removing the last affects future questions only.

FR-4: Exclude contact CTAs/buttons, public BC contact details and instructions to continue through another channel; recruiters already have the recruiting channel that supplied the link.

FR-5: Allow anonymous, isolated Conversations through a shared unlisted web link without accounts, login, onboarding or account management; discourage ordinary public indexing.

FR-6: Support professional multi-turn exploration up to 20 configurable admitted messages with one active processing turn and no queue. Freeze each submitted question and documentary scope independently of the editable next-turn draft/selection; disable competing sends while processing/unknown without blocking reading, editing, Resources, privacy or Deletion Requests. Show immutable Historical Resource Tokens inside the answer container before content from waiting through replay/error/completion, wrapping on mobile; global scope has no token, label or empty band. Each follow-up/clarification reply has its own scope; history supplies interpretation, not outside-scope facts. Ask a short clarification before retrieval for unresolved material ambiguity; interpret replies with the original question/clarification, and ask again if required context is missing rather than guessing.

FR-7: Answer in the current question's language where practical, including French/English and language changes between turns; an explicit language request takes precedence. Keep excerpts in their original document language.

FR-8: Show an accessible generic assistant badge/three-dot waiting state, without invented stages. Return complete results only after validation and durable atomic answer/evidence recording, never unchecked streaming. Network/timeout/5xx uncertainty retains the original identity, question and scope for manual same-request recovery without another turn or duplicate display. Only a recorded recoverable technical failure has a question-local accessible “Réessayer” icon, never a composer action: new identity/turn, original failed text/scope and original root interpretation context (including retry-of-retry), ordinary admission/limits, unchanged old failure/newer draft/selection. Missing original context asks clarification; unavailable original scope never widens to global. No technical retry for answered/partial/refused/clarification/unknown results. No automatic processing retries; document the distinction from read-only “Vérifier à nouveau” in the short user guide.

FR-9: Answer only from deployed, human-readable, version-controlled public Markdown; indexes are derived artifacts, never a second truth. Never deploy private material and rely on prompts to hide it. Selected scope is the exact admission-time union of trusted mapped public document IDs; global scope freezes all active public document IDs, not an empty/wildcard allowlist. No Web/private/unselected supplements or later additions; removed members fail safely without narrowing/substitution/widening. Validate Resource identity/maps/catalog revision against trusted metadata; invalid/unavailable Resources never silently become global. Selection changes cannot rewrite pending/history/answers/excerpts.

FR-10: Provide paragraph-local inspectable Source Excerpts and distinguish supported/partial/missing information. Desktop uses clickable file-title tokens beside the passage; mobile uses one passage-level overlapping-circle control (at most three then +N), with actual distinct-file count and every file inspectable. Show only that passage's relevant excerpts, grouped by file without duplicate rows, retaining sections/excerpts, visible file/section titles, inline expansion and direct display for one source. No generated source summaries/full documents. Another citation replaces the viewer; close restores focus/reading position. Preserve original excerpt text and source-version provenance after live changes/removal; sensitive-history remediation is separate. Evaluate actual citation support/completeness; schemas/reference checks do not certify semantics.

FR-11: Explicitly state absent, weak or partial support instead of guessing; distinguish supported claims from unavailable information. No matches means insufficient retrieved evidence in this scope, not proven absence from the entire KB. Never broaden scope for missing evidence, including factual examples after refusal.

FR-12: Refuse value judgments about BC without yes/no evaluation and redirect to relevant documented professional examples/decisions/outcomes within the question's scope.

FR-13: Never negotiate, promise, accept, decline or infer BC's current intentions, commitments, availability, desired role, compensation or hiring decisions; redirect to documented professional facts when useful.

FR-14: Calmly refuse non-professional personal/sensitive questions, including religion, sexuality, health, politics, family, origin and protected characteristics, and invite questions about documented professional work instead.

FR-15: Resist requests to ignore rules, reveal hidden instructions, fabricate evidence, expose private data or leave the Public Knowledge Base; preserve grounding and professional boundaries under adversarial prompts.

FR-16: Disclose visibly before/during use (not solely behind an unopened dialog) Conversation storage, BC's manual review, the creation-based 90-day deadline and actual AI/provider processing. Permanent desktop/mobile header “Confidentialité” opens a dedicated dialog with UUID and deletion request; closing preserves draft/reading position. Explicitly disclose the indefinite minimal deletion audit and separate temporary pseudonymous IP creation counter. Complete truthful pending/error/open/handled disclosure states before launch; mock text is not acceptance. Never intentionally add private sources, secrets, unnecessary Visitor identifiers or unrelated personal data to model prompts.

FR-17: Associate each Conversation with a visible UUID for diagnostics and Deletion Requests, accessible from the interface without exposing BC contact details or Visitor identity.

FR-18: Start a fresh UUID/empty selection for each new visit/session without restoring history, draft or selection across visits. Supported same-active-tab reload restores authoritative server transcript/processing, immutable scopes/tokens and separate unsent draft/selection/view state once, without resending or overwriting newer edits. Keep only session-scoped permitted state, not a browser-canonical transcript. Bounded reload-only read observation stops on completion, interruption, errors or time limit; uncertainty offers “Vérifier à nouveau”. Neutral unavailable/access-loss handling may offer an explicit new Conversation, never silent recreation or pending resubmission. Prove copied/restored/new-tab discrimination and storage-denied behavior before acceptance.

FR-19: Allow authenticated in-app idempotent Deletion Requests for the current UUID, including during generation and at turn cap; preserve original request/date on repetition. Only `open`/`handled`; handled only after confirmed/already-complete deletion, failure remains open. Actual deletion waits for active processing without blocking other cleanup. Retain only disclosed minimal identity/status/timestamp audit indefinitely, retaining historical UUID when known and never content/scope/credentials. Expose requests through controlled operator access/export; BC defines a pre-launch review cadence. Confirmation states manual/non-immediate handling, without immediate automated deletion or outbound email.

FR-20: Automatically delete all raw/derived Conversation content/runtime data by `created_at + 90 × 24 hours` UTC, never extended by activity/recovery or newer rows. Include messages, answers, excerpts, scope/display snapshots, processing metadata and diagnostics. Use early scheduling/admission cutoffs so busy deferral and recovery cannot overrun the deadline. No partial content deletion/handled transition; failed or overdue cleanup is operator-visible/recoverable, and inaccessible data is not proof of deletion. Only the minimal FR-16/19 audit is exempt.

FR-21: Define and execute a predefined launch test set covering professional questions, missing evidence, judgments, sensitive topics, injection, ambiguity/clarification, language switches, vocabulary/paraphrases and long input. Deterministic tests cover contracts/citations/source integrity, isolation, leases/failure injection, immutable scope/catalog/publication, retry/root context/unknown recovery, reload/session/edit preservation, limits/quota/deadlines, retention/export/deletion, source review and all entry/Resources/citation/privacy/responsive/accessibility states. Independently evaluate actual configured classifier/generator outputs with human inspection for semantics, support/completeness, refusal/redirection, scope, clarification and actual language. Verify official current provider quota/billing facts during implementation. Mocks, sketch checks and schema validation do not replace model or real keyboard/touch/screen-reader evidence.

FR-22: Block recruiter launch on any unresolved critical grounding, refusal, privacy, source-safety, deletion, abuse, free-quota or visible-crash failure, including unsupported claims/private exposure, lost requests, raw errors or unrecoverable hangs. Scope widening/loss/mutation, duplicate recovery submission and durable cross-visit restoration also block launch. Deterministic success or sketch approval cannot waive real-model, privacy, accessibility or full-state acceptance.

### NonFunctional Requirements

Source: PRD §5. Individual labels separate testable constraints that are not numbered NFRs in the source; overlaps with FRs are intentional.

NFR1: Prefer the simplest sufficient V1 implementation; avoid overengineering and initial vector/semantic retrieval unless simpler retrieval fails evaluation (§5.1).
NFR2: Keep actual total usage/delivery zero euros, with no mandatory paid services or assumed free-plan billing protection; verify real plans/quotas before launch (§5.1/5.5).
NFR3: Use shared unlisted access rather than accounts or broad discoverability (§5.1).
NFR4: Enforce a configurable initial 1,000-character user-message maximum with a visible counter, shared client/server counting and no silent truncation (§5.1).
NFR5: Atomically enforce an initial configurable 20 admitted logical messages/Conversation; clarification replies and new-id failure retries count, while same-id recovery/replay, rejects, reads and Deletion Requests do not (§5.1).
NFR6: Enforce 10 new Conversations/IP/UTC calendar day through shared short-lived pseudonymous counters; show a known resume time, keep existing Conversations/privacy usable, allow threshold configuration and acknowledge corporate shared-IP trade-offs (§5.1).
NFR7: Never automatically retry processing, pay overage or fail over providers. Confirmed pre-admission quota exhaustion preserves draft/selection and counts no turn; admitted rejection becomes a controlled recorded failure when possible (§5.1).
NFR8: Test actual quota/rate-limit/reset/billing behavior, show recovery times only when known and fail professionally on exhausted free capacity (§5.1).
NFR9: Do not depend on outbound email absent a later explicitly accepted free/simple/reliable option (§5.1).
NFR10: Allow several-second answer latency but bound an initial configurable backend attempt to 30 seconds and browser wait to 45 seconds; browser expiry is unknown outcome, not backend failure (§5.2).
NFR11: Only after reload, observe active processing through non-overlapping read-only checks approximately every 3 seconds for at most 45 seconds; stop on errors/terminal state without generation/resubmission or indefinite spinner (§5.2).
NFR12: Keep meaningful working feedback and editable next-turn draft/selection while blocking competing sends; result/recovery/reload must preserve newer edits (§5.2).
NFR13: Expose no raw crashes, stack traces, provider/runtime errors or broken states; failures must be professional, safe and understandable (§5.2).
NFR14: Deploy/index only explicitly public source material (§5.3).
NFR15: Isolate Conversations and credentials from one another (§5.3).
NFR16: Use no nonessential analytics/tracking, durable account-like cross-visit identifier or app linkage of UUIDs to Recruiter identity (§5.3).
NFR17: Minimize retained app data to content/evidence/scope, recovery/correlation IDs/timestamps and minimal diagnostics, all under the creation-based retention deadline except the separately disclosed minimal audit (§5.3).
NFR18: Use temporary pseudonymous IP counters only for creation limits, expire them after their useful window, and avoid raw-IP conversation fields/logs or browser fingerprinting (§5.3).
NFR19: Securely transport Conversation-scoped credentials; never include them in URLs, logs or model prompts (§5.3).
NFR20: Render model output as untrusted text, never executable trusted HTML/script (§5.3).
NFR21: Assess unavoidable host/provider logs separately from app-retained data before launch (§5.3).
NFR22: Display no public BC contact details (§5.3).
NFR23: Control operator access to Conversations/Deletion Requests while retaining sufficient in-window diagnostic visibility for questions, malfunctions, misuse and unsafe prompts (§5.3).
NFR24: Keep V1 UI French-only, answer language responsive to the question/explicit request and excerpts in their original language (§5.4).
NFR25: Validate changes in isolated preview before BC manually promotes the evaluated revision; preserve source provenance and run post-deploy checks (§5.5).
NFR26: Include a usable operator runbook as delivery acceptance: deployment, migration compatibility, rollback, deletion/purge and provider incidents; document secret setup/names, never values (§5.5).
NFR27: Never discard newer Conversations/Deletion Requests during deployment/rollback; define partial-deployment recovery without claiming cross-service atomicity (§5.5).
NFR28: Preserve approved disposition/style and desktop/mobile parity for Conversation, guide, Resources, citations, privacy/deletion and recovery, with readable long answers/excerpts (§5.6).
NFR29: Keep compact candidate identity visible on mobile through wrapping/stacking; let it scroll, not stick over content or become a permanent sidebar (§5.6).
NFR30: Keep the composer visible at the bottom, with bounded editable draft growth; verify actual cap/overflow/keyboard-open geometry, not illustrative mock measurements (§5.6).
NFR31: Place source/resource panels in spare right margin without covering/shifting/reflowing/changing transcript width; insufficient space uses a bottom-sheet overlay even on narrow desktop (§5.6).
NFR32: Preserve reading position and restore trigger focus on surface close; never force a scrolled-up reader to the bottom when results arrive (§5.6).
NFR33: Verify keyboard/touch/screen-reader operation across entry/guide, Resource selection/removal/overflow, citations/rows, privacy/deletion and recovery; essential information is never hover-only or color-only (§5.6).
NFR34: Verify visible focus, logical focus/reading order, selected/expanded/disabled labels, dialog/sheet focus containment/restoration and actual distinct-source counts (§5.6).
NFR35: Verify readable contrast, zoom/reflow, usable touch targets, waiting/error/recovery announcements and reduced-motion behavior; choose exact sizes/wording through implementation acceptance, without claiming certification (§5.6).

### Additional Requirements

Sources: Architecture Spine (AD-1–AD-18, sequencing, structural seed, contracts, data shape, provenance and deferred table); Runtime Contracts §1–§9; PRD addendum. AR identifiers support later coverage, not new policy.

#### Local foundation and architecture

AR1: **Mandatory first epic — development workstation and reproducible local bootstrap.** Dedicate Epic 1 to Ubuntu 24.04 LTS (BC's reported workstation: 24.04.5), before functional epics. Cover Git, Node/npm and local dev/test installation/verification, architecture-aligned skeleton, documented reproducible commands and safe configuration. No macOS/Windows commitment. The architecture specifies this local bootstrap, not an adopted third-party starter template; preserve its scope when sizing the first story.
AR2: Reverify existence/compatibility of historical 2026-09-16 stack candidates before version selection/lockfile generation; inherited pins are not certified current. Target TypeScript, React/Vite, Hono Worker, D1/FTS5, Workers AI, native structured CSS/design tokens, Vitest, Playwright and Wrangler; defer Tailwind.
AR3: Use Python/uv for BMAD tooling only, not application runtime; create a gitignored `.venv` only if required, without routine manual activation. Exclude applicable secrets, local environments/state and `content/private` from Git/build inputs; configuration templates contain no secrets.
AR4: Fresh-clone acceptance on reference Ubuntu must install locked dependencies, initialize local D1, start minimal frontend/Worker with simulated LLM and pass initial tests/type checks/build/local smoke using documented troubleshooting. Baseline startup/deterministic tests require no hosted Cloudflare/production/live-LLM access; installing dependencies may need Internet. Real providers, functional Conversation/retrieval and hosted delivery belong later, not in Epic 1.
AR5: Preserve portable lightweight hexagonal serverless-monolith boundaries: application/domain policy behind ConversationStore, Retriever, LLMProvider, SafetyGate, ResourceCatalog and Clock/Retention ports. Hono routes, Cloudflare/D1/Workers AI and browser remain adapters. Shared TypeScript/API/domain types live outside frontend/adapter-only code; use the architecture structural seed.
AR6: D1 is canonical for admitted messages/identities/scopes/retry links, leases, answers/blocks/citation graph/excerpts, audits, minimal diagnostics and FTS. UUIDs identify Conversations/messages; logical browser request IDs differ from execution attempt owners; opaque access tokens differ from UUIDs. Maintain `created_at`, mutable `modified_at` and audit `handled_at` consistently. One unique answer per user message is the terminal marker, not a separately writable completion flag.

#### Public content, catalog and publication

AR7: Use only `content/public/**/*.md` as deployed/indexed truth. `content/private` is local-only/gitignored/untracked and excluded from preview/production contexts; public promotion requires human+AI review/edit and explicit copying. Require public frontmatter `document_id`, `visibility: public`, `created_at`, `reviewed_by`, `reviewed_at`; optional public title/topics/aliases aid retrieval.
AR8: Define project Resources through reviewed `content/public/resources/*.md` descriptors with immutable nonrecycled `resource_id`, factual name/description and explicit nonempty `document_ids`; descriptors also have stable document IDs and are selected evidence only if explicitly mapped. Reject duplicate identities and malformed/empty/dangling/nonpublic/unreviewed mappings; allow shared documents. Paths/titles are not identity; do not infer maps or add Resource types/uploads/count caps.
AR9: Generate an immutable public `/assets/resources-catalog.<catalogHash>.json` envelope `{catalogHash,payload}`, where payload is exactly `{version:1,catalogRevision,resources,documents}` with the runtime-defined Resource/document fields. Normalize IDs/sets by unsigned UTF-16 code-unit comparison, reject duplicate entities and serialize payload with RFC 8785 JCS as UTF-8 without BOM/whitespace/newline. Hash payload bytes only with lowercase SHA-256, excluding envelope hash/runtime timestamps/URLs; revision is the full indexed Git snapshot SHA. Share digest rules/golden vectors including the supplied fixture hash `aefae89a06c759fbf9b82ef17b8f57e532731af585f0df1f138cfda52c897223`, reorder/overlap/Unicode/escape/mapping/revision cases.
AR10: Each environment has one authoritative D1 `active_publication` row (`id=1`, catalog revision/hash, operational modified timestamp), writable only by publication tooling. Health, admission, ResourceCatalog and evidence reads share its coherent dataset; derive asset path from hash, never alternate deployment/browser/per-Resource authority. Upload/verify immutable asset before atomically activating singleton/Resources/maps/document registry/chunks/FTS; activation failure leaves the previous publication intact. Prove publication/admission/multi-query read races and rollback without mixed data; no active state fails new processing closed, not saved history/deletion.
AR11: New direct admission requires current catalog identity and validates every selected Resource with its complete public map atomically with limits/message/scope/lease. `catalog_stale` preserves edits, refreshes public catalog and waits for explicit send. Invalid member rejects the whole submission, never global fallback. Technical request bounds must allow the whole active catalog.
AR12: Construct immutable version-1 SubmittedScope at admission with explicit global/selected mode, original catalog SHA/hash, canonical historical Resource IDs/names/per-Resource maps and nonempty deduplicated eligible IDs. Selected equals exact union; global freezes the full admission-time registry and has `resources: []`. Freeze membership, not complete KB text; no historical live-catalog FK/cascade, empty-as-global convention or re-resolution from composer/current maps.
AR13: At evidence read and guarded factual finalization, verify original documents and, in selected mode, Resources/original edges remain public/available in a coherent publication. Ignore mapping additions; withdrawal/removal fails whole scope safely without intersection, replacement or widening. Stable-ID rename/text changes are allowed; carry loaded text/title/section/hash/revision together into saved excerpts. Replay/history do not consult live availability to rewrite history; sensitive-publication remediation separately covers Git/index/artifacts and historical copies.
AR14: Deterministically chunk public Markdown and use D1 SQLite FTS. Build safe lexical queries from resolved question/terms, never execute model-authored SQL/raw FTS. Apply stored allowlist before ranking/top-k/budget, then mechanically verify returned/cited documents. No match means no suitable evidence retrieved, not proof of universal absence. No automatic reformulation loop, universal relevance threshold, embedding/vector baseline or outside-scope fallback. Engine-first evidence evaluation includes French/English, corporate terms, paraphrases, follow-ups and missing-information cases before complexity is added.
AR15: Build preview/production index only from exact clean committed public snapshot; transport full SHA (`SOURCE_REVISION` parameter), stable document/chunk IDs, text/location/public metadata/content hashes with artifacts into D1. Reject dirty/untracked/mismatched inputs and mixed publication; no runtime Git dependency, latest-deployment relabeling or live-index FK on historical excerpts. Preserve original cited chunk ID/hash/text/revision even if reindex runs during generation or source is moved/removed. Git history availability and sensitive-history remediation are operator concerns.

#### Interpretation, generation and verification limits

AR16: Per admitted attempt, classify once through LLMProvider using current question, bounded same-conversation context and scope-filtered public topics/aliases/project catalog, not retrieved chunks/private material. Validate discriminated `answer`/`redirect`/`refuse`/`clarify`, application-owned reason code and BCP-47 `responseLanguage`; answer/redirect also provide permitted professional topic, standalone resolved question and search terms. Refuse/clarify bypass retrieval/second generation; value judgments with clear professional angle redirect, sensitive-personal questions refuse and unresolved material ambiguity clarifies. Classifier failure is technical, never a fifth business branch. Catalog/history are data for interpretation, not evidence or policy.
AR17: Bound history to configurable 3,000 tokens per receiving model call, preserving complete recent turns and pending original question/clarification before older turns; do not silently truncate current question or automatically summarize through another LLM. Check separately bounded question/policy/catalog/chunks/reserved-output against total model capacity/quota. Missing/nonfitting necessary context asks clarification. Prior assistant text does not supply new factual evidence.
AR18: Generate only for eligible retrieved chunks with response-local source IDs and trusted public metadata; empty retrieval uses controlled missing-evidence output, with boundary language for redirection. Share canonical status `answered|partial|refused|failed|clarification` and ordered block kinds `paragraph|summary|limitation|refusal|transition|clarification|error`. Factual paragraph/summary blocks require eligible citations; persist same-answer block/excerpt edges, not free-form Markdown or frontend-generated sources. Reconstruct excerpts from retrieved text, never model-authored paths/excerpts.
AR19: Classifier chooses language from current question/explicit request/context, not homemade core language detection; generator declares outputLanguage. Normalize/check well-formed BCP-47 tags/agreement and persist actual validated declaration. Invalid/missing/conflicting tags invalidate draft without relabeling/regeneration. Controlled templates use supported current language, else supported last recorded language, else French; excerpts remain original-language. Schema/tag checks cannot prove actual language.
AR20: Validate branch schema, bounded strings/arrays/output, allowed enums, eligible citations/public paths and configured forbidden/internal/secret/raw-error patterns before persistence. Render all model/public labels as untrusted text. No second semantic-verifier model, automatic repair or claim of semantic guarantee: truth, entailment, completeness, proper block labeling, refusal and actual language require real-model/human evaluation and remain launch requirements.
AR21: Use replaceable LLMProvider with default Workers AI adapter. Verify/select actual models, prompts, latency/quality and provider quota/rate-limit/reset/scope/Retry-After/billing against current official documentation during implementation. Do not treat every 429 as daily exhaustion or invent reset times. No SDK/core/browser automatic retry, failover or paid overage; confirmed pre-admission outage does not count, admitted failure counts if recorded, unconfirmed finalization remains same-id recovery.

#### Concurrency, HTTP and recovery

AR22: Authenticate before identity/result lookup. Direct identity is exact question text (no trim/rewrite), sorted unique case-sensitive selected ID set plus catalog identity; retry identity is its origin/variant. Reordering/duplicates normalize, but changed text/set/catalog/variant/origin under same requestId conflicts. Saved terminal replay precedes live catalog validation and returns unchanged outcome/scope without count/provider call, even at turn cap.
AR23: Atomically admit message/identity/scope/retry origin with unique `(conversation_id,request_id)`, limit checks and one D1 fenced lease; no queue. Same active request returns in-progress; different active request busy. Expired manual same-id recovery reuses original message/scope with fresh attempt owner, never takes another live lease. Interrupted messages do not block forever: after authoritative no-active confirmation an explicitly new question may be admitted normally without erasing/relabeling the interrupted one.
AR24: Finalize answer/ordered blocks/excerpts/edges/application-owned error metadata and lease release in one transaction guarded by matching unexpired attempt, Conversation retention/existence and factual-scope availability. No orphan/partial answer, separately writable completion flag or stale-owner write/release/recreation; failure leaves only admitted message/identity/scope as business content. Recorded failure metadata must replay identically. Attempt fencing does not guarantee exactly one remote provider computation.
AR25: Initial attempt budget is 30 seconds overall including classifier ceiling 5 seconds and approximately 2 seconds reserved for finalization; lease lasts 40 seconds, browser wait 45 seconds. Check remaining budget before operations and attempt cancellation/controlled failure; cancellation/abort does not prove remote work stopped. Configure/test as shared budgets, not additive allowances.
AR26: Expose only POST `/api/conversations`, GET `/api/conversations/:id`, POST `/api/conversations/:id/messages`, POST `/api/conversations/:id/deletion-request` and GET `/api/health`. Serve Resource catalog as immutable build asset, not another route. HTTPS Bearer opaque sessionToken authorizes only its Conversation; persist hash only, no raw tokens in URLs/logs/prompts/exports. Authenticated responses are `Cache-Control: no-store`; use neutral `401 conversation_unavailable` for invalid/inaccessible/expired/deleted access. No public listing/admin endpoint.
AR27: SubmitTurnRequest is exactly requestId plus either question/selection(resourceIds/catalogRevision/catalogHash) or retryOfRequestId; reject mixed/extra fields and browser scopes/paths/excerpts/allowlists as authority. POST/replay/GET reconstruct identical canonical results with IDs/status/language/scope/retry origin/ordered blocks/sourceIds/full excerpt provenance and persisted error `{code,message,retryable,retryMode}`. Recorded outcomes including failures use HTTP 200; GET explicitly distinguishes completed/in_progress/interrupted and current admissibility without exposing execution owners.
AR28: Preserve normalized safe errors: 400 invalid_request/invalid_scope/invalid_retry; 409 request_conflict/request_in_progress/conversation_busy/catalog_stale/scope_unavailable as applicable; 429 turn_limit_reached or creation rate_limited with next-UTC-day Retry-After. Unknown dependency/internal results use safe 503/500 result_unavailable and same_request recovery where an envelope is available. Fetch/proxy/invalid-body/5xx/browser timeout cannot prove no write; preserve original immutable envelope. Actual provider error/status mapping remains documentation-backed implementation work.
AR29: New-id technical retry resolves only a recorded same-Conversation `failed`/retryable origin, copies exact question/scope server-side and revalidates original availability before ordinary admission/counting. No retry for business/unknown/legacy-unavailable outcomes; preserve old failure and newer composer. Same-id recovery and new-id retry (including retry-of-retry) interpret against the first non-retry origin's pre-origin context, never later topics; enforce acyclic same-Conversation prior-failure links within turn bound. Missing context clarifies; recovery attaches at original position, new retry at new position.
AR30: Shared usage enforcement must be race-safe across Workers: consistent message counting, unique admitted-turn count, temporary IP creation counter from trusted Cloudflare address (not arbitrary input header), UTC rollover/expiry and no durable fingerprint. Reads/replay/deletion remain available when creation/turn/provider limits apply; total prompt budget is separate. Measure recovery/remote usage before adopting any further execution/global numeric limit.

#### Session state and UI reconciliation

AR31: Persist one versioned Conversation-bound sessionStorage capsule atomically on edits and before POST, never only on unload: credentials; immutable pending exact body/question/scope-or-pre-admission reference; separate editable nextTurn text/ordered unique IDs/names/catalog/edit revision/cursor/internal scroll; one bounded definitively unadmitted rejectedAttempt; reference-only view state (guide, reading anchor/offset, token offset, open surface/source rows/focus trigger). No transcript/result/excerpt cache, localStorage/IndexedDB restoration, service-worker Conversation cache or cross-visit identity.
AR32: Explicit send synchronously captures immutable pending state and clears only captured text, leaving selection. Known pre-admission limits preserve draft/selection without pending. Definitive server rejection clears matching pending and auto-restores captured text only if no newer text edits; otherwise keep one explicit-restoration rejectedAttempt without chat row/turn/admission block. Never roll back newer selection. Unknown outcome stays pending, never a guessed rejection; late callbacks/terminal receipts clear matching pending only, never newer edits/state. No automatic restoration send or queued send.
AR33: Reuse capsule only for verified same-tab reload or still-live same-session BFCache continuation. New ordinary entry/navigation, new/duplicated/reopened/restored tab, explicit new Conversation or invalid/stale/wrong-version/wrong-Conversation capsule clears all bound state; no opener credentials, use noopener for external/new-tab entry. SessionStorage/Navigation Timing alone are not proof for every lifecycle. Demonstrate supported-browser reload and copied/restored rejection; unresolved discrimination blocks acceptance. Blocked/failed storage means volatile-only UI, truthful continuity-unavailable notice and fresh explicit entry on reload, never durable fallback.
AR34: Reload disables sends until authenticated GET reconciles by requestId with one row/submission and independent next-draft/selection restoration. RejectedAttempt is separate unadmitted UI state; if GET unexpectedly finds its ID, canonical server state wins without losing newer edits. Refresh active catalog separately: rename updates active labels only; missing selected IDs remain visibly unavailable/removable and disable direct Send until explicit correction, never silent dropping/globalization. Restore guide/cursor/scroll/reading/focus/surface/row references after canonical layout; missing references choose nearest surviving/neutral location, not forced bottom or cached text.
AR35: Unknown outcome offers “Vérifier à nouveau” as read-only verification, then separate explicit exact same-request recovery after interruption/not-found confirmation; never substitute new draft/selection. Reload-only active observation is nonoverlapping GET every 3 seconds for at most 45 seconds, no lease renewal/LLM call/normal-POST polling. Stop on result/interruption/error/budget/access loss; unresolved state prevents blind competing sends. Not-found stale never-admitted envelope can be explicitly abandoned for fresh current-catalog send only after server absence/no-active confirmation and Visitor consent. Access loss clears inaccessible state; new Conversation is explicit and never inherits/sends pending content.

#### Privacy, operations, migration and launch

AR36: Deletion Request submission is authenticated/idempotent and independent of processing/turn cap; preserve identity/date and never reopen handled. Operator deletion checks generation lease atomically against new admission; busy returns/deferred purge continues other Conversations. Only confirmed/already-absent deletion sets handled; retain historical UUID where known without parent FK/cascade/automatic nulling. Audit holds only request ID/nullable historical UUID/status/lifecycle timestamps, indefinitely and explicitly disclosed.
AR37: Fix/test purge cadence, early margin, admission cutoff and failure visibility together so no processing/recovery/export can delay deletion past `created_at + 90 × 24 hours` UTC. Delete content/children/scopes/retry identities/control metadata/diagnostics consistently; overdue access refusal does not substitute for actual cleanup. Expired workers cannot revive deleted data. BC defines manual request-review cadence before sharing.
AR38: Provide controlled local operator CLI/scripts only for retained Conversation/request/diagnostic review, export, manual deletion and purge. Export consistent versioned canonical snapshot including interrupted/failed scopes, identities/retry/root links, citation graph and original excerpt IDs/hashes/provenance, never credentials/live-index reconstruction. Export audit separately as metadata only.
AR39: Export/deletion share a bounded per-Conversation operation guard (exporting/deleting owner/expiry), distinct from generation lease; deletion also fences new admission, without blocking request submission. Default export is transient controlled stream; persistent copies are disabled absent verified registered-before-write managed-target/staging lifecycle and deadline cleanup, including offline destinations. Fence stale exporters; no untracked destinations/log copies. Remove/verify external artifacts first, then guarded atomic D1 deletion/audit handled; external filesystem and D1 are not one transaction, failure remains open/idempotently recoverable. Operation/artifact metadata shares Conversation deadline and is not indefinite audit.
AR40: Separate local/preview/production resources/secrets; only local may contain private preparation/sentinels/mocks. Use GitHub Actions as sole CI/CD orchestrator and Wrangler deployment. Run deterministic/migration/index/source-safety/build checks on pushes/PRs; trusted revisions auto-preview, untrusted PRs get no deploy secrets, real-model evaluation explicitly triggered rather than every push. Serialize each environment's deployments and scope credentials.
AR41: BC manually promotes the evaluated exact application revision and matching index/catalog artifact, never merely latest commit. Use compatible migrations/Worker, upload/verify immutable catalog asset, atomically activate coherent D1 publication, deploy compatible frontend and post-deploy verify stale-catalog rejection. Test failed upload/activation/rollback; no pointer to unavailable asset. No D1/Worker/Pages global transaction; incompatible changes require maintenance/transition plan. Roll back compatible code/index artifacts without restoring the whole Conversation D1 or losing new data/requests; retain transition-required assets.
AR42: Migrations enforce singleton/public IDs/scope/identity/retry/unique result/citation constraints before new frontend. Backfill legacy scope only from proven original metadata; never infer whole eligible registry from citations or selected Resources from names. If unreconstructible, use exactly `{version:0,mode:'legacy_scope_unavailable'}` for read/export, no historical tokens/recovery/new-id retry; recorded replay remains. Legacy missing excerpt IDs/hashes stay null, never fabricated/current-index recomputation; group by saved path/revision. Preserve new snapshots during rollback; test old/new readers, interrupted/failed records, exports/deletion and forward repair for incompatible rollback.
AR43: Delivery/Operations acceptance includes usable tested runbook for fresh setup, secret names/configuration, preview, release/SHA/artifact identity, manual promotion, post-checks, partial failures/migration compatibility/code-index rollback, request review/deletion/purge/managed exports and provider incidents. Verify actual GitHub/Cloudflare quotas/billing/processing/logs/backup behavior before calling delivery zero-euro or privacy-complete.
AR44: Implement deterministic launch gates for public-source review/frontmatter/path/private sentinels/secret/contact markers; trusted catalog digest/publication/scope; pre-ranking and citation subset; concurrency/atomicity/failure injection/root retries/session; usage/quota/deadlines; migrations/export/deletion/retention and environment/provenance parity. Separately evaluate actual retrieved passages, then actual configured model semantics with human inspection and real responsive/keyboard/touch/screen-reader/privacy checks. No known critical failure may be waived by passing mocks/structure or sketch approval.

#### Unresolved decisions and evidence checkpoints — not newly selected policies

Source: PRD §10, architecture Deferred and open acceptance register. Preserve owners and closure evidence when allocating later stories; do not silently decide these during decomposition.

- OPEN-1 — BC/content: choose and review V1 public project content, names/descriptions/maps before publication; identity/publication policy is already defined, no landing showcase is required.
- OPEN-2 — BC/UX: finalize exact French entry/guide/Resource/trust/privacy/refusal/recovery/limit/deletion copy before launch, retaining approved disposition/style. Complete actual provider-path/audit/counter disclosure and comprehension evidence.
- OPEN-3 — Implementation/BC: evaluate FTS retrieval and actual model outputs; choose actual model/prompts and component budgets/reason codes through implementation tests, not invented planning constants. Use evaluation evidence before proposing semantic retrieval.
- OPEN-4 — Implementation/operations: implement exact SQL/indexes/transaction proof, CLI/runbook, purge cadence/margin/cutoff/review/failure handling, deployment commands/credentials and current free-plan verification. Architecture provides constraints, not completed tools/evidence; choose domain/slug when ownership/DNS is known.
- OPEN-5 — Frontend/UX: prove supported-browser lifecycle/storage denial, real geometry/focus/mobile keyboard/overflow, complete states and accessibility. No invented breakpoints, sizing tokens or durable session fallback.
- A05 — BC/privacy, architecture/provider adapter: explicitly distinguish application-added unnecessary metadata from Visitor-entered personal/sensitive text; decide appropriate detectable-secret handling/disclosure and inspect actual prompts/tests before provider/privacy acceptance. No comprehensive redaction or detection mechanism is approved.
- A06 — Operations/privacy/retention: assess actual host/provider backup retention/restore and prove expired/already-deleted data cannot be served/retained contrary to policy; assess before launch and verify restoration before relying on recovery. No indefinite content-bearing tombstone or expanded audit exception is approved.
- A07 — Architecture/security/HTTP adapter: define allowed browser origins/content types and any non-browser creation policy; test accepted/rejected cross-site creation and quota effects before anonymous-entry sign-off. CORS alone is not that policy; no header mechanism/new client capability is selected.
- A08 — BC/architecture/usage/provider: measure interrupted/manual recovery computations and document whether separate execution controls are needed before launch, preserving same-id logical-turn accounting, manual-only recovery and read/replay/deletion access. No numeric attempt cap/cooldown/global budget is selected.
- A09 — Architecture/entry UX/HTTP/session: define lost creation-response/one-time-token behavior with suggested-question intent and exhausted creation allowance tests before entry/recovery acceptance. Message idempotency does not recover a lost creation token; no new endpoint, durable credential store or automatic retry is selected.
- A10 — UX/frontend/accessibility: inspect actual small-text pairings/sizes and verify readable contrast using approved palette where possible; muted `#68716c` on paper `#f3f0e8` was calculated around 4.425:1 if used for normal/small text. This is conditional evidence to close before rendered UI sign-off, not a completed audit or permission to redesign the palette/layout/fonts.

### UX Design Requirements

Source: full DESIGN.md and EXPERIENCE.md, including visual frontmatter, component/state/flow/accessibility/responsive sections. Each UX-DR identifies actionable implementation/verification scope. Detailed sizes/copy remain acceptance work, not approved mock constants.

UX-DR1: Implement native structured CSS tokens for all approved v2 colors: paper #f3f0e8, ink #19211d, muted #68716c, line #d4d2c9, green #1d5b44, green-dark #174a38, mint #c9f2dc, warm-white #fbfaf6, white #ffffff, assistant-surface #edf3ee, card-border #cbc9bf, resource-border #9ec7b3, source-border #d3dfd6, composer-border #d6d3ca and focus-border #7fa792. Preserve semantic roles/subtle border distinctions; do not invent red error themes, status palettes or color modes. Convey errors with readable text/controls, not color alone.
UX-DR2: Implement Manrope/system-ui/sans-serif body/controls (reference weights 400/500/600/700), Newsreader/Georgia/serif editorial headings/questions/name/projects (400/500), and DM Mono metadata/historical scope (400/500). Verify font delivery/fallback/privacy implications; Google Fonts in the reference is not a mandatory delivery choice. No approved size ramp/hero scale/letter spacing or DM Mono fallback stack is implied.
UX-DR3: Preserve warm-paper literary/CV visual hierarchy, restrained chrome/tonal layers/fine borders/soft reference shadows, rounded cards/composer/pills, circular candidate badge, small assistant badge, asymmetric bubbles and subtle green focus treatment. Use approved preview as appearance reference, not imported sidebar/copy/hidden-mobile-profile/extra-content authority; do not adopt dramatic gradients/elevation or invent numerical radii/shadow/spacing scales.
UX-DR4: Build the Entry card as warm-white/fine-border editorial rows with two to three suggestions and visibly distinct free entry, within light authorship/public-grounding/trust/privacy positioning. No separate start button/form, skills/proof band, project showcase or mandatory context. Verify suggestion sends once and free entry sends nothing.
UX-DR5: Build Candidate identity with ink circular badge/warm-white lettering, editorial name, body function and metadata location; retain desktop/mobile visibility via wrapping/stacking and ordinary page scrolling, never hidden mobile identity, sticky obstruction or permanent sidebar.
UX-DR6: Build Usage guide as quiet warm-white bordered rounded block outside/above transcript, initially open for both entry routes, two to three short sentences encouraging optional context. Support manual collapse/reopen under “Quelques repères”; result arrival never hides it and no permanent suggestion row is added.
UX-DR7: Build Conversation turn with ink/white user bubble and assistant-surface/source-border answer, generic green/mint badge and three small accessible waiting dots. Render structured whole results without trusted HTML or invented progress stages, supporting long answers and distinct answered/partial/refused/clarification/failed/interrupted states.
UX-DR8: Build Composer as white rounded/composer-border surface with subtle focus ring, green/white Send and lower-left discreet Resource access opposite Send. Keep visible at bottom, bounded growth/internal scrolling and usable mobile keyboard-open geometry; draft/selection stay editable while Send is disabled for active/unknown processing, with no queue/auto-send or result-driven edit loss. Verify actual cap/overflow rather than copying illustrative dimensions.
UX-DR9: Build Active resource token as compact assistant-surface/green/resource-border pill with individual minus and mint hover, above typed text in one nonwrapping horizontal-scroll row. Every selected Resource remains reachable/removable, with no +N collapse/duplicate; hide empty row and preserve selection after send until explicit removal.
UX-DR10: Build Historical resource token as smaller warm-white/green/source-border metadata pill inside answer before waiting/content, from immutable admitted names/maps. No edit/removal or citation semantics; preserve through errors/reload/history, wrap on mobile and render no global token/label/empty band.
UX-DR11: Build Resource library as on-demand warm-white rounded card/sheet with fine border/soft depth, editorial project names, short factual body descriptions and green/mint immediate selection controls. One action changes exactly one Resource/token, keeps library open and preserves draft; support multiple selection without Apply/count cap/upload/future types/auto-send. Keep unavailable active selection visibly removable instead of silently dropping it.
UX-DR12: Build desktop Citation token as passage-local clickable file-title affordance with no essential hover-only information; distinguish it visually/functionally from Resource scope tokens.
UX-DR13: Build mobile Citation token as one comfortable passage-level button with circles overlapping approximately one third, at most three then +N, accessible actual distinct-file count and access to every relevant cited file. Group by stable historical document identity (legacy fallback by saved path/revision), not Resource count or number of excerpts.
UX-DR14: Build Source viewer showing only the activated passage's relevant saved excerpts, grouped into deduplicated file rows with filenames/section titles and inline expansion retaining all relevant excerpts; one source displays excerpt directly. No generated summary/full-source page. Another citation replaces current contents rather than stacking windows; retain original-language text/provenance and untrusted-label rendering.
UX-DR15: Implement shared responsive resource/source surface placement by available space: spare right-margin panel without chat coverage/shift/reflow/reading-width change; otherwise bottom-sheet overlay, including narrow desktop. Preserve scroll/reading anchors and restore trigger focus on close, without forced bottom scroll. Complete viewer/citation styling within approved quiet-card language; detailed mock treatment is not already ratified.
UX-DR16: Build Privacy dialog as warm-white rounded/card-border surface reached through permanent desktop/mobile header “Confidentialité”, outside menus/guide and not a permanent block above chat. Keep access during waiting/turn cap; show UUID, truthful storage/manual review/provider/90-day/audit/counter disclosures and manual Deletion Request control. Close preserves draft/reading position.
UX-DR17: Complete privacy/deletion pending/submitting/error/open/handled/repeated-request states and non-immediate confirmation without losing request/date; verify truthful disclosures/comprehension, not scaffold text. Handle visible UUID and request status without public contact information.
UX-DR18: Implement accessible question-local “Réessayer” only for recorded recoverable technical failures, never composer/business/unknown results. Distinguish read-only “Vérifier à nouveau” and explicit same-request recovery; preserve old question/scope/newer composer, show new retry once in its new position and keep normal limits. Align short French user guide with real interactions.
UX-DR19: Complete first-entry/empty/cold-load, normal waiting, completed/refusal/clarification/partial, technical failure, unknown/interrupted/observation, invalid/limit/quota, unavailable Conversation and stale/unavailable Resource presentations. Use safe actionable French copy, visible 1,000-character counter and accurate disabled/recovery/known-resume information, without raw errors, false failure or indefinite spinner. Final copy is editorial acceptance, not mock adoption.
UX-DR20: Preserve independently editable next-turn draft/selection and immutable historical scope through response arrival/manual recovery/same-tab reload. Restore guide, cursor/internal scroll, token horizontal offset, reading anchor, open surface/cited file/row expansion and focus references against canonical transcript; no duplicate entry send, cached source text, forced bottom or cross-visit restoration. Show honest storage-denied continuity notice and fresh explicit entry on reload.
UX-DR21: Provide keyboard equivalents for click/tap across entry, guide, Resource toggles/individual removal/horizontal overflow, citation groups/source expansion, privacy/deletion and recovery. Keep all selected items reachable; essential information must never depend on hover or color alone.
UX-DR22: Verify meaningful selected/expanded/disabled/action/count labels, logical reading/focus order, visible focus and dialog/sheet focus containment/restoration with real keyboard/touch/screen-reader checks. Define and test waiting/error/recovery announcements and usable targets; no accessibility certification is implied by sketch approval.
UX-DR23: Verify actual rendered contrast (including conditional A10 muted metadata pairing), zoom/reflow, long answer/excerpt readability and reduced-motion waiting treatment while preserving approved palette/style. No audit or exact target dimensions/announcements are already approved.
UX-DR24: Prove complete desktop/mobile functional parity for identity, entry/guide, scope selection, Conversation/citations, privacy/deletion and recovery with keyboard-open and narrow-desktop layouts. Choose/test numeric breakpoints, composer cap, internal scroll and overflow cues from implementation evidence rather than imported GPT/reference measurements.
UX-DR25: Finalize professional, calm, evidence-oriented French entry/guide/Resource/refusal/limit/recovery/privacy copy with BC/UX. Encourage optional context without mandatory onboarding, inferred personalization, evaluative persuasion or contact redirection; clarify insufficient evidence within eligible scope rather than universal absence. Preserve question-language answers and original-language excerpts.

### FR Coverage Map

FR-1: Epic 2 — Explain purpose, BC authorship and public grounding before submission.
FR-2: Epic 2 — Suggested-question entry, free entry and optional manual guide.
FR-3: Epic 3 — On-demand project library and immediate persistent multi-selection.
FR-4: Epic 2 — No public contact or recruiting-channel UI.
FR-5: Epic 2 — Anonymous isolated unlisted Conversation access; Epic 5 verifies hosted sharing controls.
FR-6: Epic 2 — Multi-turn interpretation, clarification, single processing and independent next-turn editing; Epic 3 adds selected-resource scope and historical tokens.
FR-7: Epic 2 — Per-question/explicit-request answer language and original-language excerpts.
FR-8: Epic 2 — Working state, unknown-outcome recovery and question-local new-turn technical retry; Epic 3 preserves original selected scope through all paths.
FR-9: Epic 2 — Public Markdown, trusted publication and immutable global document membership; Epic 3 adds exact selected-document eligibility.
FR-10: Epic 2 — Passage-local citations, trusted historical excerpts and responsive viewer; Epic 3 verifies selected-scope citation boundaries.
FR-11: Epic 2 — Explicit partial/missing evidence without guessing; Epic 3 prevents outside-selection supplementation.
FR-12: Epic 2 — Refuse value judgments and redirect to eligible factual examples.
FR-13: Epic 2 — Refuse commitments, intentions and decisions on BC's behalf.
FR-14: Epic 2 — Refuse inappropriate personal/sensitive topics.
FR-15: Epic 2 — Injection/bypass resistance and untrusted content handling; Epic 3 extends catalog/history/scope adversarial cases.
FR-16: Epic 4 — Complete permanent privacy access and truthful processing/retention/audit/counter disclosures; Epic 2 provides initial actual-path information and no false completed-privacy claims.
FR-17: Epic 2 — Visible Conversation UUID; Epic 4 integrates it into the complete privacy/deletion workflow.
FR-18: Epic 2 — Same-tab continuity, canonical reconciliation and fresh new visits; Epic 3 extends active/historical Resource continuity.
FR-19: Epic 4 — Idempotent manual Deletion Requests, controlled operator handling and minimal audit.
FR-20: Epic 4 — Automatic creation-based retention enforcement, guarded deletion and failure recovery.
FR-21: Epic 5 — Integrated predefined launch suite and real-model/human/browser/privacy evidence; each preceding epic owns its feature-specific tests and evaluation.
FR-22: Epic 5 — Block public recruiter sharing on unresolved critical failures; preceding epics do not imply launch approval.

#### Story-Level Functional Coverage

| Requirement | Delivering stories / integrated evidence |
| --- | --- |
| FR-1 | 2.15, 2.22 |
| FR-2 | 2.15, 2.20, 2.22 |
| FR-3 | 3.1, 3.4, 3.5, 3.7, 3.8 |
| FR-4 | 2.15, 2.22, 4.2 |
| FR-5 | 2.5, 2.6, 5.2, 5.9 |
| FR-6 | 2.7–2.10, 2.17–2.21, 3.2, 3.5, 3.6 |
| FR-7 | 2.9–2.12, 2.14, 5.5 |
| FR-8 | 2.8, 2.13, 2.17–2.21, 3.5, 3.6 |
| FR-9 | 2.1–2.4, 2.7, 2.11, 3.1–3.3 |
| FR-10 | 2.8, 2.11, 2.16, 3.3, 3.5 |
| FR-11 | 2.4, 2.11, 2.14, 3.3, 3.8 |
| FR-12 | 2.9, 2.11, 2.14, 3.8, 5.5 |
| FR-13 | 2.9, 2.11, 2.14, 5.5 |
| FR-14 | 2.9, 2.14, 5.5 |
| FR-15 | 2.9, 2.11, 2.12, 2.14, 2.16, 3.3, 3.8 |
| FR-16 | 2.12, 2.15, 2.22, 4.2, 4.8, 4.9, 5.9 |
| FR-17 | 2.5, 2.22, 4.2, 4.9 |
| FR-18 | 2.18, 2.20, 2.21, 3.7, 5.5 |
| FR-19 | 4.1–4.5, 4.7, 4.9, 5.7, 5.9 |
| FR-20 | 4.5–4.9, 5.7, 5.9 |
| FR-21 | 2.14, 3.8, 4.9, 5.1, 5.5, 5.9 |
| FR-22 | 2.14, 5.5, 5.8–5.10 |

#### Nonfunctional Coverage

| Requirement | Delivering stories / integrated evidence |
| --- | --- |
| NFR1 | 1.2, 2.4, 2.14 |
| NFR2 | 2.12, 5.2, 5.9, 5.10 |
| NFR3 | 2.5, 5.2, 5.9 |
| NFR4 | 2.7, 2.17, 5.5 |
| NFR5 | 2.7, 2.8, 2.19, 3.6 |
| NFR6 | 2.6, 5.5 |
| NFR7 | 2.12, 2.13, 2.18, 5.7, 5.9 |
| NFR8 | 2.12, 5.2, 5.7, 5.9 |
| NFR9 | 4.2, 5.10; no email dependency or automatic outreach |
| NFR10 | 2.13, 2.17, 2.18 |
| NFR11 | 2.21 |
| NFR12 | 2.17–2.21, 3.5, 3.7 |
| NFR13 | 2.12, 2.13, 2.17, 5.5 |
| NFR14 | 2.1–2.4, 5.1 |
| NFR15 | 2.5, 2.8, 5.9 |
| NFR16 | 2.20, 5.9, 5.10 |
| NFR17 | 2.8, 4.1, 4.4–4.6, 4.9 |
| NFR18 | 2.6, 4.2, 5.9 |
| NFR19 | 2.5, 2.12, 2.20, 4.3, 5.1 |
| NFR20 | 2.11, 2.16, 3.8 |
| NFR21 | 4.2, 4.8, 5.7, 5.9 |
| NFR22 | 2.1, 2.15, 2.22, 4.2 |
| NFR23 | 4.3, 4.4, 4.7 |
| NFR24 | 2.9–2.12, 2.15, 2.22, 3.8, 4.2 |
| NFR25 | 5.1, 5.4, 5.5, 5.8, 5.9 |
| NFR26 | 1.5, 4.7, 5.6, 5.7 |
| NFR27 | 5.3, 5.6, 5.8 |
| NFR28 | 2.15–2.22, 3.4–3.8, 4.2, 4.9, 5.5 |
| NFR29 | 2.15, 2.22 |
| NFR30 | 2.17, 2.22, 3.8 |
| NFR31 | 2.16, 3.4, 3.8 |
| NFR32 | 2.16, 2.21, 3.4, 3.5, 4.2 |
| NFR33 | 2.22, 3.8, 4.9, 5.5 |
| NFR34 | 2.16, 2.22, 3.8, 4.9 |
| NFR35 | 2.22, 3.8, 4.9, 5.5 |

#### Architecture and Runtime Coverage

| Requirement | Delivering stories / integrated evidence |
| --- | --- |
| AR1 | 1.1, 1.2, 1.5 |
| AR2 | 1.1, 1.2 |
| AR3 | 1.1, 1.2, 1.4 |
| AR4 | 1.1–1.5 |
| AR5 | 1.2, 1.3, 2.4, 2.9, 2.12 |
| AR6 | 2.5, 2.7, 2.8, 4.1, 4.4 |
| AR7 | 2.1, 2.2, 5.1 |
| AR8 | 2.1, 2.2, 3.1 |
| AR9 | 2.2, 3.1 |
| AR10 | 2.3, 2.7, 5.4, 5.6 |
| AR11 | 2.7, 3.1, 3.2, 3.7 |
| AR12 | 2.7, 3.2, 3.5 |
| AR13 | 2.3, 2.8, 3.3, 3.6 |
| AR14 | 2.4, 3.3 |
| AR15 | 2.1–2.4, 2.8, 2.11, 2.16, 5.1 |
| AR16 | 2.9, 3.3 |
| AR17 | 2.10, 2.19, 3.6 |
| AR18 | 2.8, 2.11 |
| AR19 | 2.9–2.12, 2.14 |
| AR20 | 2.9, 2.11, 2.14, 2.16 |
| AR21 | 2.12, 2.13, 5.2, 5.7, 5.9 |
| AR22 | 2.5, 2.7, 2.8, 3.2, 3.6 |
| AR23 | 2.7, 2.18 |
| AR24 | 2.8, 2.13, 3.3 |
| AR25 | 2.13, 2.17, 2.18 |
| AR26 | 1.3, 1.4, 2.3, 2.5, 2.8, 4.1 |
| AR27 | 2.5, 2.7, 2.8, 2.16, 3.2 |
| AR28 | 2.5–2.8, 2.12, 2.13, 2.17, 2.18, 3.7 |
| AR29 | 2.18, 2.19, 3.6 |
| AR30 | 2.6, 2.7, 2.10, 2.13 |
| AR31 | 2.17, 2.20, 2.21, 3.7 |
| AR32 | 2.17, 2.18, 3.5, 3.7 |
| AR33 | 2.20, 3.7, 5.5 |
| AR34 | 2.20, 2.21, 3.7 |
| AR35 | 2.18, 2.21 |
| AR36 | 4.1, 4.5, 4.6 |
| AR37 | 4.5–4.7, 5.7, 5.9 |
| AR38 | 4.3, 4.4 |
| AR39 | 4.4–4.7, 5.7 |
| AR40 | 5.1, 5.2, 5.4 |
| AR41 | 5.3, 5.4, 5.6, 5.8 |
| AR42 | 2.16, 4.4, 4.5, 5.3, 5.6 |
| AR43 | 4.7, 4.8, 5.2, 5.4, 5.7–5.9 |
| AR44 | 2.1, 2.14, 3.8, 4.9, 5.1, 5.5, 5.10 |

#### UX Design Coverage

| Requirement | Delivering stories / integrated evidence |
| --- | --- |
| UX-DR1 | 2.15, 2.22, 3.8 |
| UX-DR2 | 2.15, 2.22 |
| UX-DR3 | 2.15, 2.16, 3.4, 4.2 |
| UX-DR4 | 2.15 |
| UX-DR5 | 2.15, 2.22 |
| UX-DR6 | 2.15, 2.20, 2.21 |
| UX-DR7 | 2.16, 2.17, 3.5 |
| UX-DR8 | 2.17, 2.22, 3.8 |
| UX-DR9 | 3.4, 3.5, 3.7, 3.8 |
| UX-DR10 | 3.2, 3.5, 3.8 |
| UX-DR11 | 3.1, 3.4, 3.7, 3.8 |
| UX-DR12 | 2.16, 2.22 |
| UX-DR13 | 2.16, 2.22, 3.5 |
| UX-DR14 | 2.16, 2.21 |
| UX-DR15 | 2.16, 3.4, 3.8 |
| UX-DR16 | 4.2, 4.9 |
| UX-DR17 | 4.1, 4.2, 4.9 |
| UX-DR18 | 2.18, 2.19, 3.6 |
| UX-DR19 | 2.15, 2.17–2.22, 3.7, 4.2 |
| UX-DR20 | 2.17–2.21, 3.5, 3.7 |
| UX-DR21 | 2.15–2.22, 3.4, 3.8, 4.2, 4.9 |
| UX-DR22 | 2.16, 2.22, 3.8, 4.9 |
| UX-DR23 | 2.22, 3.8, 4.9, 5.5 |
| UX-DR24 | 2.17, 2.22, 3.8, 4.9, 5.5 |
| UX-DR25 | 2.15, 2.22, 3.1, 3.8, 4.2, 4.9 |

#### Open-Decision and Evidence Checkpoints

These assignments preserve unresolved policy ownership. A story requiring a decision is not implementation-ready on that point until its owner supplies the decision/evidence; completing this planning file does not close the register. Already defined contracts remain binding even when implementation feasibility is unproved.

| Item | Owner checkpoint stories | Final verification |
| --- | --- | --- |
| OPEN-1 | 2.1, 3.1 — BC-reviewed actual public corpus/projects/maps | 3.8, 5.5, 5.10 |
| OPEN-2 | 2.15, 2.22, 3.8, 4.2 — BC/UX final French copy | 4.9, 5.5 |
| OPEN-3 | 2.4, 2.12, 2.14 — retrieval/model evaluation and implementation configuration | 3.8, 5.5 |
| OPEN-4 | 1.5, 4.7, 5.2, 5.3, 5.7 — implementation/operations procedures and deployment choices | 5.9, 5.10 |
| OPEN-5 | 2.20–2.22, 3.7, 3.8, 4.9 — supported-browser lifecycle, geometry and accessibility proof | 5.5 |
| A05 | 2.12 — BC/privacy/architecture input-handling decision and actual prompt tests | 4.2, 4.9, 5.9 |
| A06 | 4.8 — operations/privacy/retention backup/restore decision and verified assessment | 5.7, 5.9 |
| A07 | 2.5 — architecture/security creation origin/content-type/non-browser policy | 5.5, 5.10 |
| A08 | 2.13 — BC/architecture measured recovery-execution usage decision | 5.7, 5.9 |
| A09 | 2.5 — architecture/entry UX lost-creation-response path and quota tests | 2.15, 5.5 |
| A10 | 2.22 — UX/frontend actual rendered metadata contrast | 3.8, 4.9, 5.5 |

## Epic List

### Epic 1: Establish a Reproducible Local Development Workstation

BC can start from a fresh clone on Ubuntu 24.04 LTS, install verified locked tooling, configure safe local defaults, initialize local D1, start a minimal frontend/Worker with a simulated LLM and run bootstrap checks without hosted resources or live model credentials.

**FRs covered:** No standalone product FR; mandatory architecture sequencing AR1–AR4.
**Implementation notes:** Follow the architecture-aligned skeleton and portable boundaries. Reverify historical dependency candidates, keep Python/uv limited to BMAD tooling and document safe configuration/troubleshooting. Deliver a working local bootstrap, not the future product pipeline, hosted environment or real-provider integration.
**Dependency:** None. Independently demonstrable fresh-clone acceptance.

### Epic 2: Explore BC's Documented Work Through a Reliable Evidence-Backed Conversation

A recruiter can enter through a suggestion or free entry, explore public professional documentation through questions/follow-ups, inspect passage-local evidence, receive clarification/refusal where appropriate, recover interruptions and continue a same-tab session without losing newer drafts or restoring prior visits. BC can exercise this end-to-end path in controlled use before public sharing.

**FRs covered:** FR-1, FR-2, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-17, FR-18; initial processing information contributes to FR-16 without claiming completion of Epic 4.
**Implementation notes:** Deliver frontend, core, adapters, persistence and feature tests together. Include public Markdown promotion/index/provenance, coherent active publication/catalog infrastructure needed for global admission, immutable nonempty global document scope, FTS evidence evaluation, replaceable real provider plus deterministic simulation, safety/language/clarification, atomic leased processing, limits, canonical citations/results, responsive viewer and accessible recovery/session states. Public catalog infrastructure is authoritative even before project selection UI is enabled. Preserve approved visual style and controlled unlisted access. Implement origin/creation-loss/provider-input/usage decisions with their owners and evidence rather than inventing policies. Feature tests, real-model checks and browser lifecycle proof belong here, not deferred wholesale to launch.
**Boundary:** Global-public questions are complete and useful without Resource selection. Newer publications cannot widen their admitted membership. No fake deletion affordance or claim that privacy/deletion/retention acceptance is complete; controlled development/evaluation only until subsequent obligations pass. Collect no real recruiter traffic before Epic 5 approval.
**Dependency:** Epic 1 only. No later epic is required to demonstrate the global Conversation experience.

### Epic 3: Focus Each Question on the Projects the Recruiter Chooses

A recruiter can optionally inspect factual project descriptions, immediately select/remove multiple projects without changing their draft, and obtain answers strictly limited to those projects' mapped public documents. Sent questions retain immutable historical Resource scope through waiting, completion, error, recovery, retry and reload.

**FRs covered:** FR-3; extends FR-6, FR-8, FR-9, FR-10, FR-11, FR-15 and FR-18.
**Implementation notes:** Add the Resource Library, 1:1 active tokens, immutable historical tokens, trusted descriptor/map validation and exact selected unions through the existing catalog/admission/retrieval/result paths. No arbitrary selection cap, Apply step, uploads, implicit sends or outside-selected supplementation. Verify stale/unavailable Resources, publication/map evolution, same-id conflicts, root-context retry, strict pre-ranking/citation boundaries and independent next-turn/session state. Extend actual model and accessibility tests for selected scopes. Empty selection retains Epic 2's frozen global mode.
**Dependency:** Epic 2 and its local foundation. Global exploration remains independently usable; Epic 3 does not require Epic 4 or Epic 5 to demonstrate controlled selected-scope use.

### Epic 4: Understand and Control the Lifecycle of Conversation Data

Visitors can understand actual processing/retention, inspect their UUID and submit an idempotent manual Deletion Request even while waiting or at turn cap. BC can securely review requests, export permitted transient snapshots, delete data and automatically purge all related content/runtime data by the creation-based deadline, with minimal disclosed audit and visible failures.

**FRs covered:** FR-16, FR-19, FR-20; completes the privacy/deletion presentation of FR-17 delivered in Epic 2.
**Implementation notes:** Deliver complete privacy/deletion UI states, truthful provider/log/counter/audit disclosures and comprehension evidence alongside local controlled operator scripts, consistent versioned export, bounded operation guards, generation-safe atomic deletion/handled transition and automatic purge policy/tests. Persistent export stays disabled unless managed-copy cleanup is implemented and proved; default transient output is sufficient. Define cadence/margin/cutoff/review/failure procedures with BC and assess backups/restoration before relying on recovery. Include scopes/excerpts/retry/diagnostic/operation metadata in retention and exclude them from the indefinite audit. Provide usable privacy/operator procedures here; Epic 5 integrates the full deployment runbook.
**Dependency:** Epic 2. Implement against stored versioned scope contracts, supporting selected snapshots when Epic 3 is present; no functional dependence on Epic 3 or future hosted rollout. Validate scheduling locally before Epic 5 enables/verifies the production schedule.

### Epic 5: Share an Evaluated, Operable, Zero-Euro Release with Recruiters

BC can validate an isolated preview, inspect deterministic and actual-model/browser/privacy evidence, manually promote the exact evaluated revision and content artifacts, and share the unlisted production release with verified free-plan behavior, tested operational procedures and no unresolved critical failures.

**FRs covered:** FR-21, FR-22; integrated verification of FR-1 through FR-20 and their NFR/architecture/UX obligations.
**Implementation notes:** Implement trusted GitHub Actions/Wrangler delivery with environment-separated resources/secrets, compatible migrations and asset-before-atomic-publication ordering, explicit model evaluations, post-deploy checks and safe code/index rollback preserving live Conversations/requests. Include a usable operator runbook, scoped secret setup, domain/slug/noindex checks, active scheduled production purge and current GitHub/Cloudflare billing/quota/processing verification. Resolve outstanding acceptance items with their owners or withhold launch; do not invent budgets/origin policies/redaction/creation recovery or accessibility results. Feature testing remains in the delivering epics; this epic owns the integrated suite, operational proof and release/no-release decision.
**Dependency:** Epics 2, 3 and 4, on Epic 1's foundation. No future epic is needed to operate the approved V1.

### Sequencing and Cross-Cutting Coverage

Approved flow: Epic 1 → Epic 2; Epics 3 and 4 extend Epic 2 independently; Epic 5 integrates and approves public sharing. This is capability sequencing, not a claim that all implementation work can run concurrently without coordination. Create schema/contracts only as needed by the current capability; do not front-load every future table or component into bootstrap.

The deliberately broad Epic 2 keeps the same Conversation/core/adapter path together instead of splitting database/API/UI or repeatedly rebuilding the turn engine. Epics 3 and 4 share contracts with it but deliver distinct scope-control and privacy/retention outcomes. Stories must fit a single development-agent context and may depend only on already delivered work, never future stories. Each epic includes its own applicable deterministic, integration, semantic and browser checks; launch evaluation supplements rather than replaces them.

- **Local foundation:** AR1–AR4 belong to Epic 1; AR5's architectural boundaries begin there and remain binding across later epics.
- **Core trust/security/cost/reliability:** NFR1–NFR24 and AR5–AR35 are implemented where relevant in Epic 2; Epic 3 extends selected-scope/catalog/session cases, Epic 4 adds full privacy controls, and Epic 5 verifies actual hosted cost/operational behavior. No automatic retry/failover/paid overage in any epic.
- **Responsive/accessibility:** NFR28–NFR35 and UX-DR1–UX-DR8, UX-DR12–UX-DR15, UX-DR18–UX-DR25 apply to Epic 2's delivered surfaces; Epic 3 owns UX-DR9–UX-DR11 and extends shared interactions; Epic 4 owns UX-DR16–UX-DR17 and its shared accessibility checks. Epic 5 verifies integrated supported-device evidence without deferring basic accessibility until launch.
- **Privacy/retention/operator lifecycle:** AR36–AR39 and relevant portions of AR42–AR44 belong to Epic 4; minimal safe data handling/identity originate in Epic 2 and new scope data from Epic 3 inherits the same versioned contracts/deadline. Epic 5 activates/verifies hosted operations.
- **Delivery/migration/launch:** NFR25–NFR27, AR40–AR43 and final integrated AR44/FR-21/FR-22 acceptance belong to Epic 5. Feature-local migration and verification work remains in the epic that creates or changes the data.
- **Open-item ownership:** OPEN-1/OPEN-3 begin with public corpus/model evaluation in Epic 2 and selected project completion in Epic 3; OPEN-2/OPEN-5 follow each UI surface. OPEN-4 spans bootstrap, data/privacy procedures and delivery. A05/A07/A08/A09 require owner decisions/evidence in Epic 2; A10 follows rendered UI/accessibility; A06 belongs to Epic 4's retention/backup assessment. Epic 5 checks all applicable closures before sharing. These assignments do not resolve the questions or select new policies.

## Epic 1: Establish a Reproducible Local Development Workstation

BC can prepare an Ubuntu 24.04 LTS workstation and, from a fresh clone, install locked dependencies, configure safe defaults, initialize local D1, start the minimal frontend/Worker with a simulated LLM and run bootstrap checks without hosted resources or live model credentials. This epic covers AR1–AR4 and establishes AR5's structural boundaries, not functional product features or production readiness.

### Story 1.1: Install and Verify the Workstation Toolchain

As a BC developing Candidate Copilot,
I want a documented and verifiable toolchain installation procedure for Ubuntu 24.04 LTS,
So that I can prepare my workstation without relying on implicit local configuration or hosted services.

**Acceptance Criteria:**

**Given** an Ubuntu 24.04 LTS workstation without the project toolchain preinstalled,
**When** I follow the documented installation procedure,
**Then** Git, Node.js and npm are installed,
**And** explicit commands verify their selected versions before project initialization (AR1).

**Given** historical toolchain version candidates in the architecture,
**When** implementation selects the workstation versions,
**Then** their availability and compatibility are reverified against official sources,
**And** the documentation records the selected versions, references and verification date rather than treating historical pins as current guarantees (AR2).

**Given** a missing tool, unsupported version or failed prerequisite check,
**When** I execute the documented verification commands,
**Then** the documentation provides actionable diagnosis and correction steps,
**And** identifies which checks must pass before proceeding to project initialization (AR1, AR4).

**Given** the separate BMAD tooling requirements,
**When** Python or uv is required to execute that tooling,
**Then** its installation and verification are documented separately from the TypeScript application runtime,
**And** routine application development does not require manual Python activation or Python application-runtime dependencies (AR3).

**Given** the workstation preparation procedure,
**When** I perform its installation and verification steps,
**Then** no Cloudflare account, hosted resource, production access, secret or live LLM credential is required,
**And** any Internet access and installation privileges required for acquiring tools are explicitly documented (AR4).

**Given** completion of this story,
**When** I verify its delivered scope,
**Then** the workstation preparation can be accepted without later stories,
**And** it neither initializes business tables nor implements the application, real-provider integration or hosted delivery (AR1, AR4).

### Story 1.2: Initialize a Reproducible and Safely Configured Application Skeleton

As a BC developing Candidate Copilot,
I want an architecture-aligned project skeleton with locked dependencies and safe local configuration,
So that I can begin application development on a reproducible foundation.

**Acceptance Criteria:**

**Given** the toolchain verified in Story 1.1,
**When** I initialize the project skeleton,
**Then** its structure distinguishes shared contracts, application services, ports, adapters, Worker, frontend and native structured styles,
**And** it does not preimplement business behavior or create future business schemas (AR1, AR5).

**Given** historical stack candidates in the architecture,
**When** dependencies needed for the bootstrap are selected,
**Then** their existence and compatibility are verified against official sources and the selected versions are documented,
**And** an npm dependency lockfile is committed without treating historical candidates as guaranteed current versions (AR2).

**Given** a fresh clone and the verified workstation toolchain,
**When** I execute the documented lockfile-based dependency installation command,
**Then** the dependencies install without modifying the lockfile,
**And** installation requires no hosted-service credentials (AR1, AR4).

**Given** the local configuration setup,
**When** I follow the preparation instructions,
**Then** configuration templates contain only nonsensitive example values,
**And** local secrets, sensitive environment files, generated runtime state and content/private are excluded from Git and application build inputs (AR3, AD-2, AD-14).

**Given** the installed application skeleton,
**When** I run the documented type-check, initial test and build commands,
**Then** they pass without hosted Cloudflare resources or real LLM calls,
**And** the tests verify only the foundation already present; frontend/Worker startup and reproducible local D1 initialization remain separate later capabilities rather than prerequisites for accepting this story (AR4).

### Story 1.3: Start the Frontend and Worker with a Simulated LLM

As a BC developing Candidate Copilot,
I want to start and verify the application components locally with a simulated LLM provider,
So that I can develop without a Cloudflare account or paid model calls.

**Acceptance Criteria:**

**Given** the application foundation installed in Story 1.2,
**When** I execute the documented startup commands,
**Then** the React/Vite frontend and Hono Worker start locally at clearly documented addresses and ports,
**And** no hosted resources or secrets are required (AR4).

**Given** both local components are running,
**When** I open the frontend,
**Then** a minimal bootstrap interface loads and can check Worker availability through /api/health,
**And** this availability check does not claim documentary-catalog readiness or product readiness (AR4, AR26).

**Given** the LLMProvider port and its simulated adapter,
**When** I run the dedicated local test,
**Then** a known input produces a deterministic response without a network call to a model provider,
**And** no public LLM diagnostic route is introduced (AR4, AR5, AR26).

**Given** the default local configuration,
**When** I start or test the foundation,
**Then** no real model provider is invoked and no LLM credentials are needed,
**And** the simulation does not preimplement the business Conversation pipeline (AR4).

**Given** the running local bootstrap,
**When** I execute its automated smoke test,
**Then** frontend loading, frontend-to-Worker communication and the simulated LLM path are verified,
**And** an unavailable Worker causes an explicit test failure rather than a false success (AR4).

**Given** this story's delivered scope,
**When** I perform its acceptance checks,
**Then** they can pass without an initialized D1 database,
**And** reproducible local D1 initialization remains a separate subsequent capability rather than a prerequisite (AR4).

### Story 1.4: Initialize and Verify Local D1 Reproducibly

As a BC developing Candidate Copilot,
I want to initialize a local D1 database and verify access from the Worker,
So that I can develop and test persistence without a hosted database.

**Acceptance Criteria:**

**Given** the local application foundation is available,
**When** I run the documented initialization command,
**Then** a local D1 database is usable without a Cloudflare account, secret or remote database connection,
**And** its storage location and Worker binding are documented (AR4).

**Given** the local database has already been initialized,
**When** I run the initialization command again,
**Then** it succeeds without deleting existing data,
**And** initialization errors are reported explicitly rather than silently ignored (AR4).

**Given** the Worker is configured with its local D1 binding,
**When** I run the dedicated integration test,
**Then** a minimal SQL query confirms actual access to local D1,
**And** a missing or incorrect binding causes the test to fail without adding a public diagnostic route (AR4, AR26).

**Given** the delivered local database bootstrap,
**When** I inspect its files and documented commands,
**Then** the mechanism for applying local migrations is documented without precreating business tables for Conversations, sources or Deletion Requests,
**And** generated D1 runtime state is excluded from Git (AR3, AR4).

**Given** a local database that needs to be reset for tests,
**When** I follow the documented reset procedure,
**Then** the destructive nature of the action is explicit,
**And** its effect is restricted to local development state, with no preview or production target (AR3, AR4, AD-14).

### Story 1.5: Verify the Fresh-Clone Workflow and Document Troubleshooting

As a BC developing Candidate Copilot,
I want a complete local startup procedure verified from a fresh clone,
So that I can reproduce the development environment without implicit knowledge or preexisting configuration.

**Acceptance Criteria:**

**Given** a clean Ubuntu 24.04 LTS environment,
**When** I follow only the repository documentation from a fresh clone,
**Then** I can install the toolchain and locked dependencies, prepare configuration, initialize local D1 and start the frontend and Worker with the simulated LLM,
**And** the documented steps require no undocumented workstation state (AR1–AR4).

**Given** that installation,
**When** I execute the documented validation commands,
**Then** type checks, automated tests, the build and the local smoke test pass,
**And** smoke coverage includes the frontend, Worker, simulated LLM and actual local D1 access (AR4).

**Given** the default local configuration,
**When** I execute the complete workflow,
**Then** no Cloudflare account, hosted resource, production access or LLM credential is required,
**And** downloads needed to install tools and dependencies are explicitly distinguished from application runtime calls (AR4).

**Given** a common failure such as an incompatible version, missing dependency, occupied port, incorrect configuration or incorrect D1 binding,
**When** I consult the troubleshooting documentation,
**Then** it provides applicable diagnostic commands and corrective steps,
**And** any destructive reset is explicitly identified before execution (AR4).

**Given** execution of the fresh-clone verification,
**When** its evidence is recorded,
**Then** the record identifies the tested revision, environment, commands and results,
**And** it validates only the bootstrap without claiming business-pipeline, real-model or public-launch readiness (AR4).

## Epic 2: Explore BC's Documented Work Through a Reliable Evidence-Backed Conversation

Recruiters can enter anonymously, ask professional questions and follow-ups against an immutable global-public scope, inspect passage-local evidence, receive appropriate clarification/refusal and recover interruptions without losing newer drafts. Delivery remains controlled development/evaluation until privacy, retention and release acceptance are complete. Covers FR-1, FR-2, FR-4–FR-15, FR-17, FR-18 and initial truthful FR-16 information; selected-project interaction belongs to Epic 3. Each story includes its own tests; later integration evidence does not substitute for them.

### Story 2.1: Prepare an Explicitly Public Knowledge Base

As a BC maintaining the portfolio,
I want to prepare and validate the documents allowed to feed Candidate Copilot,
So that I control which information recruiters can access.

**Acceptance Criteria:**

**Given** private preparation documents,
**When** I prepare content for publication,
**Then** a documented human and AI-assisted editorial review precedes copying approved Markdown into content/public,
**And** private directories are never automatically promoted (FR-9, AR7).

**Given** a public document,
**When** validation runs,
**Then** it requires a unique stable document_id, visibility: public, created_at, reviewed_by and reviewed_at with valid values,
**And** missing or malformed metadata and duplicate identities fail explicitly; identities remain stable across renames and are never recycled (AR7, AR8).

**Given** documentary build inputs,
**When** the validator collects files,
**Then** only Markdown under content/public is eligible,
**And** files or links escaping that boundary are rejected (FR-9, AR7).

**Given** fixtures containing private sentinels, configured forbidden secret or contact markers,
**When** safety checks run,
**Then** validation fails without copying sensitive values into reports,
**And** tests demonstrate exclusion while documentation states that pattern checks do not replace editorial review or prove complete privacy (AR44).

**Given** a corpus intended for hosted publication,
**When** its provenance is checked,
**Then** its files match the committed public snapshot at the declared full Git SHA,
**And** dirty or untracked inputs cannot be labeled as that commit's content (AR15).

**Given** actual professional content for the initial corpus,
**When** that corpus is prepared,
**Then** BC selects and approves the public information,
**And** synthetic test fixtures are never presented as BC's achievements; acceptance covers files, local validation and the procedure, without requiring indexing, model calls or a Conversation UI (OPEN-1).

### Story 2.2: Build Reproducible Public Catalog and Search Artifacts

As a BC maintaining public evidence,
I want deterministic catalog and chunk artifacts from the reviewed Git snapshot,
So that later publication can identify exactly which public content it contains.

**Acceptance Criteria:**

**Given** the corpus validated in Story 2.1 and its full Git SHA,
**When** the artifact builder runs twice on that snapshot,
**Then** document identities, deterministic chunks, public titles/sections/locations, original content hashes and sourceRevision agree,
**And** application-only changes cannot relabel an existing public-content artifact (AR9, AR15).

**Given** reviewed Resource descriptors when present,
**When** the builder reads resource_id, resource_name, resource_description and document_ids,
**Then** it rejects duplicate IDs, unreviewed descriptors and empty, dangling or nonpublic maps while allowing shared documents,
**And** descriptors are not automatically evidence for a selected Resource unless mapped; the global-only initial artifact may contain no Resources without inventing projects (AR8).

**Given** the normalized catalog payload defined in Runtime §1,
**When** its identity is calculated,
**Then** sorted unique ID sets use unsigned UTF-16 ordering and RFC 8785 JCS UTF-8 payload bytes alone determine lowercase SHA-256,
**And** the supplied golden payload yields aefae89a06c759fbf9b82ef17b8f57e532731af585f0df1f138cfda52c897223; Unicode, escapes, reorder, overlap, changed mapping and changed revision have tested expected results (AR9).

**Given** successful artifact creation,
**When** outputs are inspected,
**Then** the public envelope and content-addressed asset path follow the exact shared schema, and source SHA/hash/registry/chunks remain linked,
**And** timestamps, credentials, private inputs and deployment URLs cannot alter catalog digest bytes or enter public artifacts (AR9, AR15).

### Story 2.3: Activate a Coherent Local Public Publication

As a BC operating the local evidence engine,
I want to activate or replace a validated public publication atomically,
So that the system cannot mix a catalog identity with another dataset.

**Acceptance Criteria:**

**Given** Story 2.2 artifacts and local D1,
**When** publication tooling verifies asset availability and hash then activates them,
**Then** migrations create only the required singleton, Resource/map/document/chunk/FTS structures,
**And** active_publication id=1 and its complete dataset change in one atomic operation, not a pointer-only update (AR10).

**Given** an existing publication A,
**When** asset verification or activation of B fails under injected faults,
**Then** A remains coherent and active, or a first publication remains unavailable,
**And** no ready pointer advertises an absent or unverified asset (AR10).

**Given** health and catalog-port readers,
**When** they observe activation A to B across Worker instances,
**Then** revision/hash are one authoritative D1 pair and catalogAssetPath is derived from its hash,
**And** multi-query reads use tested snapshot/guard semantics rather than a cached pointer followed by unguarded reads (AR10).

**Given** missing or unusable active state,
**When** health is requested,
**Then** the response does not advertise a ready catalog or allow evidence processing,
**And** no diagnostics, private data or visitor state is exposed; only publication tooling can mutate the authority (AR10, AR26).

### Story 2.4: Find and Evaluate Public Evidence with Scoped Lexical Search

As a BC evaluating the evidence engine,
I want to search eligible public documents before judging generated answers,
So that retrieval weaknesses can be measured without being hidden by model behavior.

**Acceptance Criteria:**

**Given** an active publication and a trusted nonempty document allowlist,
**When** the Retriever receives a resolved question and search terms,
**Then** safe lexical FTS queries apply membership before ranking, top-k and chunk-budget selection,
**And** model-authored SQL/raw FTS syntax cannot execute; an empty allowlist fails unavailable rather than becoming unrestricted search (AR14).

**Given** retrieved chunks,
**When** the adapter returns them,
**Then** stable IDs, text, path, title, nullable section, location, hash and full source revision come from one coherent publication,
**And** every returned document belongs to the requested allowlist, with no Web or private retrieval (AR13–AR15).

**Given** representative French/English, corporate-vocabulary, paraphrase, named-project, follow-up and missing-information fixtures,
**When** the engine evaluation runs,
**Then** a versioned report records required passages, actual retrieval and recall gaps separately from generated-answer judgments,
**And** no-match is described as insufficient retrieved evidence, without an automatic rewrite loop or assumed universal relevance threshold (FR-11, OPEN-3).

**Given** inadequate retrieval results,
**When** BC assesses the report,
**Then** the simplest sufficient baseline is retained or an explicit architecture decision is requested before semantic/vector expansion,
**And** the story does not silently introduce embeddings, another provider or out-of-scope fallback (NFR1).

### Story 2.5: Start and Read an Isolated Anonymous Conversation

As a visitor,
I want an anonymous Conversation with a visible UUID and secure access,
So that I can explore without an account and without exposing another visitor's data.

**Acceptance Criteria:**

**Given** POST /api/conversations in controlled local use,
**When** a Conversation is created,
**Then** D1 stores its UUID/timestamps and only a hash of an unpredictable opaque session token,
**And** the UUID and token are returned once with no account or contact requirement (FR-5, FR-17, AR26).

**Given** valid credentials for one Conversation,
**When** its authenticated GET is requested,
**Then** it returns that Conversation's ordered server-owned transcript and explicit processing/admissibility state with no-store caching,
**And** other UUIDs, absent/invalid tokens and inaccessible records receive the same neutral conversation_unavailable response before replay lookup (AR26, AR27).

**Given** browser-origin/content-type and non-browser creation cases,
**When** the architecture/security owner resolves A07 for this route,
**Then** the chosen policy is documented and accepted/rejected cross-site requests and their quota effects are tested,
**And** CORS visibility alone is not claimed as creation protection; no new policy is inferred from this story (A07).

**Given** creation may commit but its one-time token response is lost,
**When** BC/architecture and entry UX resolve A09,
**Then** the explicit UX/HTTP recovery path is documented and tested including exhausted creation allowance and suggested-question intent,
**And** acceptance requires that decision without adding an endpoint, durable token copy or automatic retry by implication (A09).

**Given** request and diagnostic fixtures,
**When** access flows are inspected,
**Then** tokens never enter URLs, logs, prompts or public health,
**And** route tests prove cross-Conversation isolation and no public listing/admin endpoint; only Conversation structures needed here are added (NFR15, NFR19).

### Story 2.6: Enforce Fair and Private Conversation-Creation Limits

As a visitor,
I want a clear creation limit that does not disable existing Conversations,
So that shared free capacity is protected without losing access to my current thread.

**Acceptance Criteria:**

**Given** a trusted Cloudflare-derived client address,
**When** creation requests arrive concurrently across Worker instances,
**Then** a shared temporary pseudonymous counter atomically allows at most the configurable initial 10 creations per UTC day,
**And** arbitrary user-supplied IP headers cannot bypass the limit (NFR6, AR30).

**Given** the daily allowance is exhausted,
**When** another creation is requested,
**Then** a safe 429 rate_limited response gives Retry-After until the next UTC day,
**And** existing Conversation reads and other authenticated controls are not disabled by this creation cap (AR28).

**Given** UTC rollover, counter expiry and shared corporate-IP cases,
**When** deterministic clock/concurrency tests run,
**Then** allowance resets correctly, obsolete counters expire after their useful window and threshold configuration is respected,
**And** no raw IP, durable visitor fingerprint or IP-to-Conversation linkage is stored in Conversation rows (NFR18).

**Given** the chosen counter mechanism,
**When** its data handling is documented,
**Then** pseudonymization is not called anonymization and actual temporary processing/retention can feed privacy copy,
**And** configured logs avoid unnecessary raw-IP retention (FR-16, AR30).

### Story 2.7: Admit One Immutable Global Question at a Time

As a visitor,
I want each admitted question to retain its exact identity and public documentary scope,
So that duplicate requests and later publication changes cannot alter what I submitted.

**Acceptance Criteria:**

**Given** a valid authenticated direct submission in global mode,
**When** application admission runs,
**Then** exact question text, normalized request identity, version-1 global SubmittedScope with all active document IDs and a fresh attempt lease are written atomically with turn accounting,
**And** global scope has resources: [] but a nonempty allowlist; migrations add only the required message/snapshot/lease structures (FR-6, AR12, AR23).

**Given** shared character counting and configurable initial limits,
**When** input is checked,
**Then** 1,000 characters is allowed under a documented shared counting algorithm tested with accented/astral Unicode and line endings, overlength is rejected without trimming/truncation, and at most 20 unique logical messages are admitted,
**And** rejected inputs, reads and same-id recovery/replay do not consume another turn (NFR4, NFR5).

**Given** concurrent admissions or an existing request,
**When** the same or another identity is submitted,
**Then** atomic tests distinguish in-progress, busy and changed-identity conflict without a queue or duplicate message,
**And** exact text/catalog identity/body variant are immutable while reordered duplicate Resource IDs normalize as sets (AR22, AR23).

**Given** catalog publication racing with admission,
**When** the snapshot is resolved,
**Then** catalog identity, registry and lease/message write are coherently A or B, never mixed,
**And** stale catalog or absent publication rejects before admission without treating scope as unrestricted (AR10, AR11).

**Given** an expired interrupted message and no other active owner,
**When** the visitor explicitly recovers it or deliberately submits a distinct new question,
**Then** recovery preserves original message/scope/count while a new question counts normally and leaves the old message intact,
**And** the application-service tests demonstrate this capability without depending on a later model or UI story (AR23).

### Story 2.8: Commit Complete Results Atomically and Replay Them Faithfully

As a visitor,
I want an admitted question to have one complete durable result,
So that network uncertainty cannot create duplicate or partial answers.

**Acceptance Criteria:**

**Given** an admitted message and a mechanically valid deterministic test result,
**When** the owning attempt finalizes through POST /api/conversations/:id/messages,
**Then** matching unexpired attempt ownership, Conversation existence/retention eligibility and factual-scope availability guard the entire atomic answer, ordered block, excerpt, citation-edge, outcome-metadata and lease-release write set,
**And** the unique answer is the terminal marker; no streaming or independent completion flag is introduced (AR24).

**Given** faults at every write boundary,
**When** finalization fails,
**Then** no partial answer/children/completion change survives and the original admitted message/identity/scope remains,
**And** stale or expired attempts cannot insert children, release a successor or recreate deleted state (AR24).

**Given** canonical completed, clarification, refusal or controlled failed outcomes,
**When** POST, authenticated GET and same-id replay return them,
**Then** their complete schemas, scope, block order, citation edges, provenance, language and saved failure retry metadata agree,
**And** recorded outcomes use HTTP 200 without an additional model call or turn even at the turn cap (AR22, AR27).

**Given** a loaded source and a publication update during generation,
**When** a factual answer finalizes,
**Then** original scope members are rechecked atomically and withdrawn membership produces controlled scope_unavailable with no factual publication,
**And** text-only changes cannot relabel the already loaded excerpt revision/hash/text (AR13).

**Given** deterministic simulation for development,
**When** the completed request path is tested before real generation integration,
**Then** fixtures are explicitly synthetic and exercise the real persistence/route protocol,
**And** no fixture is presented as actual evidence about BC (AR4, AR20).

### Story 2.9: Resolve Professional Intent, Boundaries and Clarification

As a recruiter,
I want ambiguity and prohibited questions handled before evidence search,
So that the system does not guess my meaning or speak on BC's behalf.

**Acceptance Criteria:**

**Given** an admitted attempt and scoped public interpretation catalog,
**When** classification runs through LLMProvider,
**Then** it runs once on the current question and bounded server context without retrieved chunks,
**And** exact branch schema, owned reason codes and well-formed responseLanguage are validated (AR16).

**Given** answer or redirect classification,
**When** the branch is accepted,
**Then** the core receives a professional topic, resolved standalone question and safe search terms,
**And** a value judgment with a clear professional angle redirects to eligible facts without yes/no evaluation or hiring-fit conclusion (FR-12).

**Given** personal/sensitive topics, BC's intentions/commitments or bypass attempts,
**When** refuse/redirect behavior is selected under approved boundaries,
**Then** no private disclosure, negotiation, promise, hidden instruction or fabricated source is allowed,
**And** direct refusal makes no unsupported professional assertion (FR-13–FR-15).

**Given** materially unresolved ambiguity,
**When** clarification is selected,
**Then** a short language-appropriate clarification is persisted as status/kind clarification without retrieval or a second generation call,
**And** malformed classification becomes a controlled technical failure, not a fifth business decision (FR-6, AR16).

**Given** deterministic branch/injection fixtures,
**When** tests execute,
**Then** catalog/history text cannot change trusted policy or eligibility and every routing branch is exercised,
**And** documentation distinguishes mocked routing tests from actual-model semantic evidence (AR20).

### Story 2.10: Preserve Bounded Follow-Up and Clarification Context

As a recruiter,
I want follow-ups interpreted with the necessary earlier exchange,
So that I can refine a question without repeating everything or receiving guessed answers.

**Acceptance Criteria:**

**Given** canonical prior turns,
**When** context is assembled for the receiving model,
**Then** recent complete turns fit the configurable 3,000-token history cap and pending original question/clarification take priority over older turns,
**And** browser-supplied history and earlier excerpt attachments cannot become authoritative context or new factual evidence (AR17).

**Given** a clarification reply or topic/language change,
**When** intent is interpreted,
**Then** the current question and its explicit language request govern with necessary earlier clarification context,
**And** unresolved missing context asks again rather than guessing or reusing an unrelated later topic (FR-6, FR-7).

**Given** history, question, instructions, catalog, evidence and output reservation,
**When** a model call is prepared,
**Then** configured component bounds and receiving-model total capacity are checked separately,
**And** oversized input uses a controlled limit/clarification path without silent question truncation or automatic summary calls (AR17).

**Given** deterministic long-history and ambiguity fixtures,
**When** context tests run,
**Then** complete-turn ordering, budget accounting and missing-context behavior are asserted,
**And** history never widens the current stored document allowlist (FR-9).

### Story 2.11: Generate and Validate Answers Against Eligible Evidence

As a recruiter,
I want supported claims and explicit limitations with inspectable citations,
So that I can distinguish documented facts from missing information.

**Acceptance Criteria:**

**Given** answer/redirect classification and eligible retrieval,
**When** generation is prepared,
**Then** only current allowed chunks receive response-local source IDs and trusted instructions remain separate from user/history/catalog/source data,
**And** no-match produces a controlled insufficiency result without factual generation, preserving any refusal boundary (FR-9, FR-11, AR18).

**Given** a generation draft,
**When** validation runs,
**Then** allowed statuses/block kinds, size bounds and required citations for paragraph/summary blocks are enforced,
**And** citations outside the current source pool/allowlist, invalid public paths or configured forbidden patterns prevent the draft from reaching the user (AR18, AR20).

**Given** responseLanguage and outputLanguage declarations,
**When** they are normalized and compared,
**Then** malformed, missing or conflicting BCP-47 tags fail without relabeling or regeneration,
**And** controlled templates record their actual supported current/last/French fallback language while excerpts remain original-language (FR-7, AR19).

**Given** accepted factual blocks,
**When** excerpts are reconstructed and finalized,
**Then** trusted original chunk text/ID/hash/document ID/path/title/section/location/revision and same-answer citation edges are persisted rather than model-authored source metadata,
**And** the result distinguishes supported, partial, missing and refused information without claiming that valid references prove entailment (FR-10, FR-11).

**Given** injection, unsupported-reference and invalid-draft fixtures,
**When** tests run,
**Then** unsafe output cannot bypass validation and no automatic repair or semantic-verifier model is invoked,
**And** actual meaning, completeness, language and factual support remain subject to real-model evaluation (AR20).

### Story 2.12: Integrate a Replaceable Real Provider with Safe Free-Quota Behavior

As a BC evaluating real answers,
I want a Workers AI adapter behind the existing provider port,
So that real-model quality can be measured without coupling policy to provider SDKs or unexpected costs.

**Acceptance Criteria:**

**Given** current official Cloudflare documentation and candidate models,
**When** implementation selects configured classifier/generator models,
**Then** availability, context limits, rate/quota scopes, reset/Retry-After signals and actual plan billing are recorded with sources/date and tested at the adapter boundary,
**And** unknown codes remain safe errors rather than assumed daily exhaustion (AR21, OPEN-3).

**Given** deterministic development configuration versus explicit live evaluation,
**When** the provider is selected,
**Then** simulation remains the credential-free default and real calls require explicit configuration,
**And** replacing the adapter does not move grounding, safety, usage or retention policy out of core (AR5, AR21).

**Given** the app's prompt-minimization rule and Visitor-entered sensitive or secret-like text,
**When** BC/privacy and architecture resolve A05,
**Then** the distinction between app-added metadata and user text, chosen handling and truthful disclosure is documented and tested against actual prompt payloads,
**And** credentials/private sources/unnecessary identifiers stay excluded without claiming comprehensive semantic redaction (A05).

**Given** confirmed pre-admission unavailability or rejection during an admitted attempt,
**When** processing is requested,
**Then** the former rejects without count/draft loss and the latter records a controlled failed outcome when possible,
**And** only known resume times are shown; SDK/core/browser retries, repair, automatic failover and paid overage are disabled (NFR7, NFR8).

**Given** rate-limit, quota, timeout, malformed-response and unexpected-error fixtures,
**When** adapter tests run,
**Then** normalized application errors contain no raw provider details,
**And** free-plan billing protection must be verified rather than inferred solely from code intentions (AR21).

### Story 2.13: Bound Processing and Expose Honest Failure Outcomes

As a visitor,
I want processing to finish or offer safe manual recovery within bounded waits,
So that an interruption never leaves an indefinite spinner or false failure claim.

**Acceptance Criteria:**

**Given** an acquired attempt lease,
**When** classification, retrieval, generation and finalization run,
**Then** the initial 30-second total budget includes the classifier ceiling of 5 seconds and approximately 2 seconds reserved for finalization,
**And** the 40-second lease and 45-second browser wait are separately configured, not additive processing allowances (AR25).

**Given** timeouts and controlled provider/application failures,
**When** remaining budget permits,
**Then** outstanding work is cancelled where possible and an application-owned failure is atomically recorded with stable error code/retryability,
**And** failure to confirm persistence yields result_unavailable rather than partial output or an invented terminal state (AR24, AR28).

**Given** late remote completion or an expired/stale Worker,
**When** it attempts finalization or release,
**Then** the ownership guard prevents stale writes even if provider cancellation did not stop remote computation,
**And** tests cover interruption at admission, generation and finalization (AR24, AR25).

**Given** manual recovery usage measurements,
**When** BC/architecture resolves A08 using admitted, interrupted and recovered execution costs,
**Then** the resulting decision and evidence are recorded without assuming exactly one remote computation,
**And** no new execution cap/cooldown/global budget is adopted without approval or by changing logical-turn accounting/read/replay/privacy access (A08).

### Story 2.14: Evaluate Actual Global-Scope Answers Before UI Completion

As a BC validating the portfolio engine,
I want separate real-model evaluations of retrieval, interpretation and generated answers,
So that well-formed outputs do not conceal critical grounding or boundary failures.

**Acceptance Criteria:**

**Given** the reviewed corpus, configured actual models and versioned representative questions,
**When** an explicit evaluation is run,
**Then** evidence records corpus SHA/hash, application revision, models/configuration, actual outputs and human judgments separately from deterministic test results,
**And** evaluation does not run automatically on every test or trigger automatic processing retries (FR-21, AR44).

**Given** normal/missing-information, value-judgment, commitment, sensitive-personal and injection cases,
**When** human inspection assesses actual outputs,
**Then** support by cited excerpts, completeness, appropriate refusal/redirection, insufficiency and boundary compliance are checked,
**And** failures retain reproducible case references without publishing sensitive content in reports (FR-9–FR-15).

**Given** long/ambiguous questions, clarification resolution, corporate terms and French/English language changes,
**When** evaluations run,
**Then** meaningful clarification, correct interpretation and actual response language are inspected while excerpts retain source language,
**And** schema/tag success is not treated as proof of those properties (FR-6, FR-7).

**Given** critical findings or insufficient retrieval,
**When** results are assessed,
**Then** known critical failures remain blocking for later public sharing and retrieval gaps are distinguished from generator failures,
**And** sampled success is documented as evidence, not a universal guarantee (FR-22, OPEN-3).

### Story 2.15: Enter a French Portfolio Conversation with Optional Guidance

As a recruiter,
I want a clear minimal entry into BC's portfolio,
So that I can ask freely without accounts, mandatory context or a project showcase.

**Acceptance Criteria:**

**Given** the French landing,
**When** it renders,
**Then** authorship, purpose, public grounding and initial actual-path trust/privacy information are visible with a warm-white Entry card and two to three self-contained questions plus distinct free entry,
**And** there is no contact CTA/details/channel redirection, skills band, standalone start form, inferred personalization or fit positioning (FR-1, FR-2, FR-4, UX-DR4).

**Given** a suggested-question activation versus free entry,
**When** entry succeeds under the creation/admission contract,
**Then** the former submits the chosen question once and the latter admits no message,
**And** repeated events, failed/unknown creation and reload do not silently replay intent; A09's approved behavior is honored (FR-2).

**Given** either entry route,
**When** Conversation opens,
**Then** the compact badge/name/function/location stays visible on desktop/mobile and scrolls with the page,
**And** the short guide outside the transcript starts open and can be manually collapsed/reopened under Quelques repères without answer-driven hiding (UX-DR5, UX-DR6).

**Given** the visual foundation,
**When** components render,
**Then** native structured CSS implements all approved color tokens and Manrope/Newsreader/DM Mono roles with deliberate font-delivery/fallback behavior,
**And** palette/layout/sidebar/mobile-hiding/extra-copy deviations from imported mocks are not adopted; numerical sizing is verified rather than falsely ratified (UX-DR1–UX-DR3).

**Given** desktop/mobile keyboard and touch entry checks,
**When** the landing and guide are operated,
**Then** focus order, visible focus, disclosure state and functional parity are tested,
**And** BC/UX approves actual French copy rather than accepting placeholder mock claims (UX-DR21, UX-DR25).

### Story 2.16: Read Answers and Inspect Passage-Local Source Excerpts

As a recruiter,
I want to inspect exactly the excerpts supporting the passage I am reading,
So that I can assess evidence without leaving my reading position.

**Acceptance Criteria:**

**Given** canonical structured results,
**When** Conversation turns render,
**Then** ink/white user bubbles, assistant-surface answers and ordered blocks preserve long-text readability and distinct answered/partial/refused/clarification/failed states,
**And** model text and public labels are escaped/untrusted rather than executable HTML (UX-DR7, NFR20).

**Given** a supported passage with several cited excerpts,
**When** desktop or mobile citations render,
**Then** desktop shows clickable file-title tokens beside that passage and mobile one count-labeled button with approximately one-third-overlapping circles, at most three then +N,
**And** distinct files—not excerpts or Resources—determine the actual accessible count and all remain inspectable (UX-DR12, UX-DR13).

**Given** citation activation,
**When** the viewer opens,
**Then** only that passage's saved excerpts are grouped by stable document ID into deduplicated files with trusted file/section titles and inline expansion, with one source directly expanded,
**And** all relevant sections remain available without generated summaries/full documents or late live-index metadata (FR-10, UX-DR14).

**Given** sufficient spare right margin versus insufficient width,
**When** a viewer is opened or replaced by another citation,
**Then** it uses a nondisplacing margin panel or bottom-sheet overlay, including narrow desktop, and replaces rather than stacks content,
**And** closing restores trigger focus/reading position; answer arrival never pulls a scrolled-up reader to the bottom (UX-DR15).

**Given** reindex, rename, removed live source and legacy nullable provenance fixtures,
**When** saved results are read,
**Then** excerpts retain original-language text/revision/chunk identity/hash/title and legacy grouping uses saved path/revision without fabricated IDs,
**And** keyboard, touch, expanded-state labels, sheet focus containment and injection fixtures verify the complete interaction (AR15, AR42, UX-DR21–UX-DR24).

### Story 2.17: Compose the Next Question Without Altering the Sent One

As a recruiter,
I want to keep editing while a question is processing,
So that preparing a follow-up cannot change the admitted question or be overwritten by its answer.

**Acceptance Criteria:**

**Given** the bottom Composer,
**When** I type a long draft on desktop or with the mobile keyboard open,
**Then** it remains visible with bounded growth/internal scroll, a visible shared 1,000-character counter and no truncation,
**And** tested geometry/overflow preserves usable reading space rather than adopting illustrative mock dimensions (UX-DR8).

**Given** explicit Send and an admissible question,
**When** its immutable envelope is captured synchronously,
**Then** only captured text is cleared for the next draft and the pending question displays once with generic badge/three accessible dots,
**And** no invented backend stages, streaming, normal polling, queued sends or automatic retry occurs (FR-6, FR-8, AR32).

**Given** active processing or unknown outcome,
**When** I edit the next draft or inspect earlier answers,
**Then** editing/reading remain available while Send and competing retry/recovery are disabled,
**And** terminal arrival clears matching pending state only, preserving newer text, cursor and edit revision (AR31, AR32).

**Given** definitive pre-admission rejection after capture,
**When** no newer draft edit exists versus newer edits exist,
**Then** captured text is automatically restored only in the unchanged case; otherwise one rejectedAttempt preserves it for explicit restoration without a chat row or automatic send,
**And** known pre-admission limits preserve text without capture and uncertain transport failure is never misclassified as definitive rejection (AR32).

**Given** limits, validation, quota and controlled failures,
**When** UI states render,
**Then** safe French actionable text and accurate admissibility are shown without raw errors, color-only status or indefinite waiting,
**And** race tests cover late callbacks, rapid activation, result arrival and rejected-text discard/restoration without overwriting newer edits (UX-DR19).

### Story 2.18: Verify Unknown Outcomes and Recover the Original Submission Manually

As a recruiter,
I want to verify an uncertain result before deliberately recovering it,
So that a timeout cannot duplicate my question or submit my newer draft by mistake.

**Acceptance Criteria:**

**Given** POST timeout, lost committed response, proxy 5xx or invalid response reading,
**When** the browser cannot establish the outcome,
**Then** it retains exact original body/requestId/question/scope references and exposes read-only Vérifier à nouveau,
**And** no recorded technical failure or fresh request identity is invented (FR-8, AR28, AR35).

**Given** manual verification,
**When** GET returns terminal, active, interrupted, not-found or unavailable state,
**Then** UI uses authoritative state, displays one canonical row and offers explicit same-request recovery only when allowed,
**And** verification itself never POSTs, renews a lease or consumes a turn (AR35).

**Given** an interrupted admitted message,
**When** explicit recovery reuses its exact envelope,
**Then** original message/scope/count and original interpretation context are preserved and its result occupies the original transcript position,
**And** newer draft/rejected text remain untouched; an expired attempt cannot seize another live owner's lease (AR23).

**Given** a never-admitted not-found submission with stale catalog,
**When** GET confirms absence and no active processing,
**Then** abandoning it for a fresh current-catalog question requires explicit Visitor confirmation,
**And** no automatic identity/body substitution, resubmission or false terminal failure occurs (AR35).

**Given** access loss or failed verification,
**When** recovery cannot proceed,
**Then** neutral access-loss cleanup or honest unknown-state messaging stops competing sends appropriately,
**And** a new Conversation requires explicit action without carrying/sending the pending question (FR-18, UX-DR18).

### Story 2.19: Retry a Recorded Technical Failure in Its Original Context

As a recruiter,
I want a question-local retry of a recorded recoverable failure,
So that I can try that question again without disturbing my next draft.

**Acceptance Criteria:**

**Given** a canonical failed result with application-owned retryable=true,
**When** the accessible Réessayer icon on that question is explicitly activated,
**Then** the browser submits only a fresh requestId and retryOfRequestId and core copies exact original question/scope server-side,
**And** the original failed turn is unchanged, the new admitted turn appears once in its new position and the composer is never loaded, cleared or overwritten (FR-8, AR29).

**Given** retry, retry-of-retry or same-id recovery of an interrupted retry,
**When** core prepares interpretation,
**Then** same-Conversation prior-failure links lead to the first non-retry origin's pre-origin context within the turn bound,
**And** later topic changes cannot resolve its pronouns differently; missing required original context asks clarification (AR29).

**Given** invalid/cross-Conversation origins, business/unknown outcomes or unavailable original documents,
**When** retry admission is attempted,
**Then** it rejects before a new turn is counted without leaking another thread's existence or widening scope,
**And** retry links cannot cycle or refer to nonfailed/nonretryable origins (AR29).

**Given** active/unknown processing, length/turn/retention limits or confirmed quota unavailability,
**When** retry is considered,
**Then** ordinary admission restrictions apply while valid same-id saved replay still works at turn cap,
**And** a new-id retry counts only on admission and is never automatic (NFR5, NFR7).

**Given** the rendered UI and French user guide,
**When** keyboard/touch/screen-reader and documentation checks run,
**Then** the icon has an action-identifying accessible name, is absent from composer/nontechnical/unknown outcomes and the guide distinguishes it from Vérifier à nouveau and same-id recovery,
**And** intervening-topic/retry-chain fixtures prove unchanged newer drafts and original-context behavior (UX-DR18).

### Story 2.20: Preserve Same-Tab Continuity Without Cross-Visit Identity

As a visitor,
I want a reload of my active tab to continue the current Conversation but a new visit to start fresh,
So that continuity does not become durable browsing history or account-like tracking.

**Acceptance Criteria:**

**Given** current-tab credentials, immutable pending submission, separate next draft/rejectedAttempt and reference-only view state,
**When** edits occur or POST is about to run,
**Then** a versioned Conversation-bound capsule is persisted atomically to sessionStorage, not only on unload,
**And** no canonical transcript/result/excerpt cache, localStorage/IndexedDB restoration, service-worker Conversation cache or token in URLs/logs is introduced (FR-18, AR31).

**Given** supported browser lifecycle cases,
**When** same-tab reload/live BFCache continuation is distinguished from navigation, duplicated/reopened/restored/new tabs or invalid capsules,
**Then** demonstrated reload continuity is retained and new visits clear credentials/pending/draft/view and get a fresh UUID without opener reuse,
**And** noopener is used where applicable; sessionStorage/Navigation Timing alone is not asserted as proof and unresolved discrimination blocks story acceptance (AR33, OPEN-5).

**Given** blocked, failed or corrupt storage,
**When** initialization or persistence is attempted,
**Then** volatile-only UI remains usable with honest reload-continuity-unavailable notice and fresh explicit entry on reload,
**And** no durable fallback or silent loss of a supported ordinary reload is accepted as normal behavior (AR33).

**Given** reload with pending or rejected local state,
**When** authenticated GET resolves authority,
**Then** sends remain disabled until reconciliation, each request appears once, matching terminal pending is cleared and newer draft is preserved,
**And** a rejectedAttempt unexpectedly found server-side becomes canonical rather than an unadmitted row, without replaying any entry/send (AR34).

**Given** explicit new Conversation or access loss,
**When** state is reset,
**Then** all bound state is cleared and the next thread starts empty only after explicit entry,
**And** prior pending text or credentials never silently migrate into it (FR-18).

### Story 2.21: Restore Reading State and Observe Reloaded Work Without Resubmission

As a recruiter,
I want reload to restore my reading and editing position while observing any already-running question,
So that checking progress does not restart work or displace what I am reading.

**Acceptance Criteria:**

**Given** a valid same-tab capsule and canonical transcript,
**When** layout becomes ready after reload,
**Then** guide state, composer cursor/internal scroll, reading anchor/offset and existing source surface/expanded rows/focus references are restored without cached answer text,
**And** missing references fall back to nearest surviving turn or neutral surface rather than forced bottom (AR34, UX-DR20).

**Given** GET confirms an active attempt after reload,
**When** observation starts,
**Then** nonoverlapping side-effect-free GETs run approximately every 3 seconds for at most 45 seconds without full-chat redraw, lease renewal or model calls,
**And** terminal/interrupted/error/access-loss/budget conditions stop observation (NFR11, AR35).

**Given** an observation error or exhausted window,
**When** status cannot be verified,
**Then** UI honestly offers Vérifier à nouveau and retains original pending state instead of claiming generation failed or permitting a blind competing send,
**And** manual verification may start another bounded read window without hidden processing retry (AR35).

**Given** result arrival while the reader is scrolled up or editing,
**When** pending state resolves,
**Then** canonical content updates once without changing newer draft/edit revision/focus or pulling reading position down,
**And** tests cover reload during editing, pending POST, observation, source inspection and result arrival (UX-DR20).

### Story 2.22: Complete Global-Conversation Copy and Accessibility Evidence

As a recruiter using keyboard, touch or assistive technology,
I want the complete global Conversation path to remain understandable and operable,
So that its trust and recovery features are usable on desktop and mobile.

**Acceptance Criteria:**

**Given** all global Conversation surfaces delivered in this epic,
**When** actual keyboard, touch and screen-reader checks are performed,
**Then** entry/guide/composer/citations/source rows/recovery/limits work with logical order, visible focus, meaningful selected/expanded/disabled/action/count labels and appropriate waiting/error/recovery announcements,
**And** sheets/dialogs contain and restore focus without hover-only or color-only information (NFR33–NFR35, UX-DR21, UX-DR22).

**Given** rendered tokens, fonts and real text sizes,
**When** contrast, zoom/reflow, reduced-motion and long-answer/excerpt checks run,
**Then** actual treatments pass the documented owner-agreed readable-contrast/accessibility checks for the supported browser/device matrix, with usable targets and bounded keyboard-open Composer geometry,
**And** A10's conditional muted-on-paper pairing is resolved from rendered evidence while preserving approved palette/style rather than claiming sketch certification (UX-DR23, UX-DR24, A10).

**Given** BC/UX editorial review and the actual configured processing path,
**When** French entry, guide, refusal, missing-evidence, limit, failure and recovery copy is completed,
**Then** it remains calm/factual, optional-context oriented and truthful about current capabilities, with visible initial storage/provider information and UUID,
**And** it makes no contact/fit claims or false assertion that the later complete privacy/deletion workflow is already delivered (FR-1, FR-4, FR-16, FR-17, UX-DR25).

**Given** the feature tests, real-model report and browser lifecycle evidence from preceding stories,
**When** Epic 2 acceptance is assembled,
**Then** required evidence and unresolved owner decisions are explicitly recorded with no waived critical finding,
**And** this controlled global experience is not authorized for public recruiter traffic before Epics 4 and 5 complete their obligations (FR-22).

## Epic 3: Focus Each Question on the Projects the Recruiter Chooses

Recruiters can choose reviewed public projects on demand and keep separate editable next-question context and immutable historical documentary scope. This extends the complete global path without uploads, full-document browsing, arbitrary selection limits or scope widening. Covers FR-3 and selected-scope extensions to FR-6, FR-8–FR-11, FR-15 and FR-18, especially UX-DR9–UX-DR11. Stories depend on Epic 2 and earlier stories here, not later privacy/release work.

### Story 3.1: Make Reviewed Public Projects Available as Resources

As a BC maintaining public projects,
I want reviewed factual project descriptors with explicit document mappings,
So that recruiters can choose meaningful projects without guessing which documents belong to them.

**Acceptance Criteria:**

**Given** BC-approved V1 project content,
**When** reviewed Resource descriptors are authored,
**Then** stable nonrecycled IDs, names, short factual descriptions and explicit nonempty public document maps follow the existing schema,
**And** BC closes OPEN-1 for the chosen content rather than implementers fabricating achievements or inferring maps from names (AR8, OPEN-1).

**Given** shared documents, renamed files/projects and descriptor documents,
**When** the existing builder validates the corpus,
**Then** overlaps are valid, stable IDs survive rename and descriptors are evidence only if explicitly mapped,
**And** duplicate IDs, removed-ID reuse, empty/dangling/private maps and missing public review fail deterministically (AR8).

**Given** a changed project catalog,
**When** the existing local publisher activates it,
**Then** names/maps/registry/chunks/digest/active identity remain coherent and the content-addressed asset contains factual source text,
**And** technical request bounds accommodate all active Resources without an arbitrary count cap (AR9–AR11).

**Given** previous publication artifacts,
**When** new descriptors are introduced,
**Then** atomic activation and history-independent stable IDs remain intact,
**And** tests prove old immutable snapshots/excerpts are not migrated to new names or maps (AR13).

### Story 3.2: Admit Exact Immutable Selected-Project Scopes

As a recruiter,
I want each question restricted to precisely the projects I selected,
So that later edits or mapping changes cannot silently change its documentary eligibility.

**Acceptance Criteria:**

**Given** a current catalog identity and selected Resource IDs,
**When** direct admission runs,
**Then** exact request variant and every complete public map are validated atomically with turn count/message/lease,
**And** selected SubmittedScope stores canonical historical IDs/names/maps, original catalog provenance and the exact deduplicated nonempty document union (AR11, AR12).

**Given** overlaps and duplicate/reordered IDs,
**When** equivalent submissions are normalized,
**Then** set identity and historical token ordering use sorted unique case-sensitive IDs while active UI insertion order is irrelevant,
**And** changed text/set/catalog/body variant under the same requestId conflicts before any new work/count (AR22).

**Given** empty selection or an invalid/stale/nonpublic/unavailable member,
**When** admission is requested,
**Then** empty selection freezes the entire active public registry while any invalid nonempty selection rejects the whole question,
**And** no dropped member, empty allowlist, replacement or fallback-to-global interpretation is allowed (FR-9).

**Given** refusal, clarification, interrupted and failed paths,
**When** a question is admitted or completed,
**Then** its scope exists with the user message from initial admission and remains in canonical GET/POST/replay,
**And** later composer edits or finalization failure cannot erase, mutate or move scope into answer-only storage (FR-6, AR12).

### Story 3.3: Enforce Selected Eligibility Through Retrieval and Finalization

As a recruiter,
I want selected projects to remain the only eligible evidence even when other documents would help,
So that the scope I chose is a real boundary rather than a ranking hint.

**Acceptance Criteria:**

**Given** a selected union and stronger matches outside it,
**When** classification/catalog preparation and lexical retrieval run,
**Then** interpretation context is scope-filtered, eligibility constrains search before ranking/top-k/budget and core rejects returned/cited out-of-scope documents,
**And** history/catalog terms, Web/private material and unselected public files cannot supply new factual evidence (FR-9, AR14, AR16).

**Given** partial/no matches, refusal redirection or a follow-up/clarification reply after a selection change,
**When** a result is prepared,
**Then** the current question's own scope governs every factual example and missing support is explicit within that scope,
**And** no broader query, past scope or previous assistant claim substitutes for eligible evidence (FR-6, FR-11).

**Given** publication changes between admission, retrieval and finalization,
**When** membership is checked,
**Then** map additions never widen the frozen union, text/rename updates may retain stable members, and removal of any original Resource/edge/document fails whole scope safely,
**And** factual finalization rechecks availability in its ownership transaction rather than filtering to remaining members (AR13).

**Given** reindex races and saved completed results,
**When** evidence is persisted or history replayed,
**Then** original admitted catalog provenance remains distinct from actual cited text/hash/revision and historical labels never depend on live maps,
**And** saved replay remains available without the current catalog or scope availability (FR-10, AR15).

### Story 3.4: Select and Remove Projects Without Changing the Draft

As a recruiter,
I want an optional project library and individually removable active tokens,
So that I can prepare project-focused questions without mandatory onboarding or text mutation.

**Acceptance Criteria:**

**Given** the Conversation composer on desktop/mobile,
**When** I open the on-demand Resource control opposite Send,
**Then** the library presents factual project names/descriptions and selected-state controls in the approved warm-white card/sheet style,
**And** no landing showcase, upload, future Resource type or full-document browser is introduced (FR-3, UX-DR11).

**Given** an open library and typed draft,
**When** I add/remove one Resource,
**Then** exactly that ID and one corresponding active token change immediately with no duplicate, Apply step or numeric selection cap,
**And** the library stays open, typed text is untouched and no question/turn is sent or consumed (FR-3).

**Given** one or many selected Resources,
**When** active tokens render above text inside the Composer,
**Then** all have individual removal controls in one nonwrapping horizontally scrollable assistant-surface/green pill row with the approved border/hover treatment,
**And** every offscreen token is reachable/removable with no +N collapse; an empty row is hidden (UX-DR9).

**Given** send or removal of the last token,
**When** selection changes,
**Then** sending preserves selection until explicit removal and removing the last token changes future questions to global mode only,
**And** no project prefix is inserted into the draft and pending/history scopes remain untouched (FR-3, FR-6).

**Given** desktop margin, narrow desktop and mobile interaction,
**When** the library is operated by keyboard/touch,
**Then** shared nondisplacing panel/sheet, selection labels, focus restoration and reading-position rules hold,
**And** overflow and all-active-Resource selection tests demonstrate functional parity (UX-DR15, UX-DR21, UX-DR24).

### Story 3.5: Show Immutable Historical Scope Independently of Next-Turn Edits

As a recruiter,
I want sent questions to show their original selected projects while I prepare the next question,
So that I can tell editable context from the evidence eligibility of earlier work.

**Acceptance Criteria:**

**Given** explicit send with selected projects,
**When** the pending row first appears and canonical admission is received,
**Then** Historical Resource Tokens sit inside that answer container immediately before waiting/content, first from captured display references then authoritative snapshot,
**And** saved names/order persist through interrupted/error/completed/replayed states without edit/removal affordances (FR-6, UX-DR10).

**Given** a global question,
**When** waiting or completed content renders,
**Then** no Resource token, global label or empty scope band is shown,
**And** its nonempty frozen global allowlist remains enforced server-side (AR12).

**Given** pending or unknown processing,
**When** I edit text or add/remove active Resources,
**Then** only the next explicit question changes and active selection remains editable while Send is blocked,
**And** result arrival clears matching pending only, preserving newer draft/selection and never queueing/sending them (FR-6, AR32).

**Given** many historical selected projects on mobile,
**When** the turn renders,
**Then** historical tokens wrap so all remain visible while active tokens remain a single scroll row,
**And** accessible labels and visual treatment distinguish immutable scope from actual citations (UX-DR9, UX-DR10).

**Given** later rename, mapping change or source publication,
**When** historical turns are read,
**Then** tokens come only from saved scope and cannot be rewritten by current catalog labels,
**And** citation file counts/grouping still use excerpt document identity rather than Resource identity (FR-10).

### Story 3.6: Preserve Original Selected Scope During Recovery and Technical Retry

As a recruiter,
I want recovery and retry to use the failed question's original projects,
So that newer selection cannot redirect an earlier question or widen its evidence.

**Acceptance Criteria:**

**Given** a selected question with unknown outcome and a newer draft/selection,
**When** exact same-id recovery is explicitly requested,
**Then** it reuses original admitted scope/identity/count and original root context, never mutable composer/current maps,
**And** GET/replay/POST return identical historical scope and result shape without duplicate display (AR22, AR29).

**Given** a recorded recoverable selected-scope failure,
**When** its question-local new-id retry is activated,
**Then** core copies original text/names/maps/catalog provenance/document union and root context server-side under ordinary admission,
**And** mapping additions do not enter the copied scope and the original failure/newer composer remain unchanged (FR-8).

**Given** removed Resource, original edge or frozen document,
**When** a new retry is requested,
**Then** scope_unavailable rejects before admission/count without fallback or map intersection,
**And** already-admitted recovery fails safely while completed saved replay needs no live availability (AR13).

**Given** intervening topics, retry-of-retry and interrupted recovery of a retry,
**When** deterministic and actual-model cases are evaluated,
**Then** original root interpretation context remains authoritative and missing required context asks clarification,
**And** limits, active/unknown blocking and accessible action/user-guide distinctions remain unchanged (FR-8, AR29).

### Story 3.7: Reconcile Active Selection with Catalog Changes and Same-Tab Reload

As a recruiter,
I want selection continuity and explicit stale/unavailable-project handling,
So that a catalog update or reload never silently changes my question.

**Acceptance Criteria:**

**Given** stale catalog identity on a new direct submission,
**When** catalog_stale is received,
**Then** draft/current selection edits are preserved, announced same-origin asset identity/hash/schema are verified and the library is refreshed,
**And** a new send requires explicit action with current identity rather than automatic resubmission (AR11).

**Given** active selected IDs after catalog refresh,
**When** stable names change or an ID disappears,
**Then** active rename labels may update but unavailable IDs remain visibly unavailable and individually removable,
**And** direct Send is disabled until explicit removal/replacement; no silent dropping/substitution/globalization occurs (AR34).

**Given** the current-tab session capsule,
**When** selected IDs/order/public-name references/catalog identity or token scroll change,
**Then** separate next-turn fields and view references are persisted without replacing immutable pending scope,
**And** supported reload restores them independently with one canonical message, no send and no copied excerpt/transcript cache (FR-18, AR31).

**Given** rejected selected-scope capture and newer edits,
**When** server rejection, reload or late callback occurs,
**Then** captured text restores only if its draft edit revision is unchanged, otherwise explicit rejectedAttempt restoration is offered,
**And** current selection is never rolled back and rejected state cannot create a chat row or indefinitely block admission (AR32, AR34).

**Given** new visit, invalid capsule, storage denial or access loss,
**When** session initialization resets,
**Then** selection and its view state follow Epic 2's verified fresh/volatile behavior without durable fallback,
**And** pending/history scope is never rewritten from active labels or the newly fetched catalog (FR-18).

### Story 3.8: Verify Project-Focused Trust and Interaction End to End

As a BC preparing project-focused exploration,
I want deterministic, real-model and actual-device evidence for selected scopes,
So that apparent selection cannot conceal factual widening or inaccessible controls.

**Acceptance Criteria:**

**Given** overlapping Resources, no matches, invalid/unavailable IDs and publication races,
**When** the selected-scope suite runs,
**Then** exact unions, pre-ranking constraints, citation subset checks, immutable waiting/error/history snapshots and no narrowing/widening are verified,
**And** failures in activation/admission/finalization/recovery preserve coherent original scope (AR44).

**Given** actual configured models and representative selected questions,
**When** human inspection evaluates answers/follow-ups/clarification/redirection after scope changes,
**Then** support, completeness, insufficiency, original-context retries and resistance to history/catalog/source injection are assessed,
**And** outside-scope facts are critical failures even when public and correctly cited (FR-21, FR-22).

**Given** real keyboard/touch/screen-reader and mobile keyboard-open sessions,
**When** selection, token overflow/removal, waiting edits, library/sources and reload are exercised,
**Then** all Resources remain reachable, historical/mobile wrapping and active horizontal overflow differ correctly, labels/focus/reading position are preserved and no auto-send occurs,
**And** approved palette/fonts/layout and actual contrast/target/reduced-motion checks hold (UX-DR9–UX-DR11, UX-DR21–UX-DR24).

**Given** BC/UX review of project names/descriptions and selection/failure copy,
**When** Epic 3 evidence is assembled,
**Then** factual content and calm French explanatory labels are approved with reproducible revision/catalog/model/browser references,
**And** no evidence is mistaken for production readiness or a completed privacy/deletion workflow (OPEN-1, OPEN-2).

## Epic 4: Understand and Control the Lifecycle of Conversation Data

Visitors receive truthful processing/retention disclosures and can request deletion; BC can review requests, inspect controlled transient exports, delete and purge all Conversation-bound data with auditable minimal status and no deadline extension. Covers FR-16, FR-19, FR-20, the privacy presentation of FR-17, UX-DR16–UX-DR17 and relevant AR36–AR39. The capability works locally on Epic 2's versioned data and accepts selected snapshots when present, without requiring future production setup. Production scheduling is activated and verified in Epic 5.

### Story 4.1: Record Idempotent Deletion Requests Without Interrupting Access

As a visitor,
I want to request deletion of my current Conversation from the app,
So that BC can act on my request without needing my identity or contact details.

**Acceptance Criteria:**

**Given** a valid current-Conversation token,
**When** POST /api/conversations/:id/deletion-request is called,
**Then** one request with UUID, original created_at and status open is persisted and returned with honest manual/non-immediate confirmation,
**And** callers cannot submit another Conversation's UUID or create arbitrary orphan audit records (FR-19).

**Given** repeated or concurrent submission,
**When** the endpoint runs again,
**Then** it returns the same request identity/date/state without resetting timestamps or reopening a handled request,
**And** tests prove idempotency across Worker instances (AR36).

**Given** active generation, exhausted turn count or provider outage,
**When** authenticated submission is requested for an accessible Conversation,
**Then** the request is accepted independently of model processing and message allowance,
**And** it neither consumes a turn nor cancels generation or immediately deletes data (FR-19).

**Given** the audit schema migration,
**When** constraints are inspected and tested,
**Then** only request ID, nullable historical Conversation UUID, status and lifecycle timestamps are retained indefinitely,
**And** no parent-enforcing FK, cascade or automatic nulling can erase the historical UUID/audit; no content, scope, credentials or Visitor identity enters it (AR36).

**Given** persistence failure or unavailable access,
**When** submission cannot be confirmed,
**Then** safe errors do not falsely confirm a recorded request and repeat submission remains safe,
**And** ordinary neutral authorization behavior remains in force (AR26).

### Story 4.2: Explain Actual Data Handling and Offer Permanent Privacy Access

As a visitor,
I want clear privacy information and an always-available in-app deletion control,
So that I understand processing and can request removal without losing my place.

**Acceptance Criteria:**

**Given** landing and Conversation on desktop/mobile,
**When** privacy information is presented,
**Then** visible pre/during-use text discloses storage/BC manual review and actual provider processing, with complete details behind a permanent header Confidentialité control outside menus/guide,
**And** the disclosure is not replaced solely by an unopened dialog (FR-16, UX-DR16).

**Given** the warm-white/card-border privacy dialog,
**When** it opens,
**Then** it displays the current UUID, creation-based 90-day maximum, manual/non-immediate Deletion Request, actual processing path, temporary pseudonymous IP counter and indefinite minimal audit exception,
**And** wording distinguishes Conversation content/runtime data from audit/counter/host-provider logs without making unsupported privacy guarantees (FR-16, FR-17).

**Given** request submission and uncertain/error/repeated responses,
**When** dialog states change,
**Then** pending/error/open and any legitimately available handled presentation are truthful, idempotent and accessible,
**And** no unauthenticated historical-audit lookup or new endpoint is introduced; once access is lost, the neutral unavailable behavior applies rather than fabricated request-status polling (UX-DR17, AR26).

**Given** processing, unknown outcome or turn cap,
**When** the visitor opens privacy or submits a request,
**Then** controls remain usable and no composer/reading state is cleared,
**And** dialog close restores trigger focus and reading position with keyboard/touch/screen-reader coverage (FR-19, UX-DR16).

**Given** BC/UX review and actual runtime/provider configuration,
**When** final French disclosure text is approved,
**Then** it reflects A05's chosen input-handling boundary and the exact audit fields/deadline/counter rather than mock placeholders,
**And** no public BC contact details, email requirement or immediate-deletion promise is added (OPEN-2).

### Story 4.3: Review Conversations and Deletion Requests Through Controlled Local Tools

As a BC operating the portfolio,
I want controlled local inspection of retained Conversations and request status,
So that I can understand questions and identify manual deletion work without a public admin surface.

**Acceptance Criteria:**

**Given** scoped operator configuration,
**When** I run documented local CLI/scripts against an explicitly selected permitted environment,
**Then** I can list/review retained Conversations, open/handled requests and minimal in-window diagnostics,
**And** no admin dashboard, public listing or admin HTTP route is introduced (AR38).

**Given** a request referring to a deleted or unknown historical UUID,
**When** I review its audit metadata,
**Then** the nullable historical reference and lifecycle status remain interpretable without requiring a live parent,
**And** the operator view does not infer content or silently discard an open request (AR36).

**Given** command output and logging,
**When** inspections run,
**Then** credentials are never printed and content-bearing output is treated as controlled transient data,
**And** docs prohibit unsupported durable redirection/copies rather than treating operator output as exempt from retention (AR38, AR39).

**Given** missing credentials, wrong environment or dependency failure,
**When** a command cannot safely execute,
**Then** it fails explicitly without broadening permissions or selecting production by accident,
**And** automated local fixtures verify access separation and complete visibility of requests (NFR23).

### Story 4.4: Export Consistent Transient Snapshots Under a Bounded Guard

As a BC investigating retained interactions,
I want consistent versioned transient exports that cannot race deletion,
So that diagnostics do not create hidden long-lived Conversation copies.

**Acceptance Criteria:**

**Given** an accessible retained Conversation,
**When** controlled export acquires its bounded operation guard,
**Then** a consistent canonical snapshot includes admitted question/identity/scope/version/catalog provenance, retry links, outcomes, ordered blocks/citation edges and saved original excerpt IDs/hashes/text/revisions, including interrupted/failed turns,
**And** no live-catalog reconstruction, token or missing-provenance fabrication occurs; deletion audits export separately as minimal metadata (AR38).

**Given** operation owner/kind/expiry fields,
**When** export and deletion contend,
**Then** the ConversationStore guard serializes them for that Conversation while allowing other Conversations to proceed,
**And** stale exporters cannot publish after expiry/deletion; export causes no question admission, LLM call or logical turn (AR39).

**Given** the default export configuration,
**When** export runs,
**Then** output is a controlled transient stream with no automatic persistent content/staging files or content logs,
**And** persistent destinations are explicitly disabled and the runbook prohibits unsupported untracked copies, including offline destinations (AR39).

**Given** any proposal to enable persistent export,
**When** its prerequisites are evaluated,
**Then** it remains disabled unless registered-before-write target/staging ownership, private staging, fenced publication and verified coordinated deadline cleanup are implemented and demonstrated,
**And** this story does not authorize persistent output or require that optional expansion to deliver transient export (AR39).

**Given** generation, snapshot changes, process failure and expiry fixtures,
**When** guard/export tests run,
**Then** each export is internally consistent and bounded, failures release or expire safely and no stale owner publishes,
**And** exact legacy-unavailable scope/null provenance remains explicit in versioned output rather than guessed (AR39, AR42).

### Story 4.5: Delete a Conversation Atomically and Confirm Its Request Only on Success

As a BC handling a Deletion Request,
I want guarded complete deletion with an honest audit transition,
So that I never mark content removed while associated data or managed copies survive.

**Acceptance Criteria:**

**Given** an open request or explicit permitted operator deletion,
**When** deletion is attempted with an unexpired generation lease,
**Then** it returns conversation_busy without partial removal or handled status,
**And** request submission and cleanup of other Conversations remain available (FR-19, AR36).

**Given** no active generation and a live deleting operation guard,
**When** removal finalizes,
**Then** lease/admission fencing, all Conversation children and raw/derived scope/identity/retry/excerpt/diagnostic/control data removal and existing audit handled transition occur in one guarded D1 commit,
**And** new admission, stale generation and stale operation owners cannot recreate or partially mutate deleted data (AR36, AR39).

**Given** the default no-persistent-export policy and any registered managed artifacts from supported configurations,
**When** deletion prepares its final commit,
**Then** absence or verified cleanup of every managed target/staging copy is required,
**And** unsupported/missing confirmation, external cleanup failure or final D1 failure leaves audit open and reports recoverable failure, never cross-service atomicity (AR39).

**Given** an already-absent Conversation,
**When** controlled handling confirms absence and copy cleanup,
**Then** an existing request may become handled idempotently with historical UUID retained,
**And** no new content-bearing audit exception or live-parent dependency is created (AR36).

**Given** failure injection at each deletion boundary,
**When** the command is retried,
**Then** it either completes idempotently or leaves the request open with no partial database deletion/false success,
**And** fixtures include global/selected, interrupted/failed and legacy scope data (FR-20).

### Story 4.6: Purge Conversation Data Before the Creation-Based Deadline

As a visitor,
I want automatic deletion within 90 days of Conversation creation,
So that later activity cannot extend storage indefinitely.

**Acceptance Criteria:**

**Given** Conversation creation timestamps and a controlled clock,
**When** retention eligibility is calculated,
**Then** the deadline is created_at plus 90 times 24 hours in UTC, never calendar-day end, last message or modified_at,
**And** newer associated data inherits that deadline rather than receiving its own 90 days (FR-20).

**Given** scheduling duration, generation/operation leases and failure-recovery needs,
**When** implementation defines purge cadence, early margin and corresponding admission/recovery/export cutoffs,
**Then** values are documented and tested together with sufficient time to finish before the deadline,
**And** repeated new work or busy deferral cannot extend retention; these values are implementation decisions, not invented planning constants (AR37).

**Given** a purge pass containing busy, expired-lease and eligible Conversations,
**When** scheduled cleanup runs locally under simulated scheduling,
**Then** live-generation cases defer while others continue and expired owners cannot block deletion or later finalize,
**And** the same guarded deletion/audit rules as manual handling apply (AR36, AR37).

**Given** expired data after an injected cleanup failure,
**When** access or processing is attempted,
**Then** it is refused neutrally while cleanup remains outstanding and operator-visible,
**And** loss of access is never reported as proof of deletion (FR-20).

**Given** successful purge,
**When** storage is inspected,
**Then** no Conversation-bound content, scope, retry, diagnostic, operation/artifact metadata or permitted managed copy remains,
**And** only the disclosed minimal deletion audit survives indefinitely; tests verify deadline edges and mutable timestamp maintenance (AR37).

### Story 4.7: Operate and Recover the Deletion Workflow with Visible Failures

As a BC responsible for deletion,
I want a usable review and recovery procedure with visible failures,
So that open requests or overdue purge cannot disappear behind a successful-looking UI.

**Acceptance Criteria:**

**Given** BC's operating constraints,
**When** manual request review is configured,
**Then** BC explicitly defines a review cadence and the documented commands identify outstanding requests and age,
**And** no new visitor-facing deletion SLA or immediate-processing promise is invented (FR-19).

**Given** purge, guard, artifact cleanup or final commit failures,
**When** operator failure visibility is implemented,
**Then** an explicitly chosen tested signal makes failures/overdue work actionable without raw errors exposed to visitors,
**And** diagnostic content/operation metadata remains within the Conversation deadline rather than a new indefinite audit category (AR37).

**Given** interrupted deletion and expired operation ownership,
**When** the documented recovery is followed,
**Then** cleanup resumes idempotently with stale-owner fencing and confirms removal before handled status,
**And** export or generation cannot indefinitely starve purge (AR39).

**Given** the local operator runbook,
**When** another execution follows its documented examples,
**Then** review, transient export, busy deferral, manual deletion, purge and recovery checks work with environment selection and required secret names only,
**And** fixtures demonstrate failures do not hide requests or claim successful deletion (NFR26, OPEN-4).

### Story 4.8: Assess Logs and Backup Recovery Against Deletion Obligations

As a BC accountable for retained data,
I want actual hosting/provider logs and backup restoration assessed against expiry and deletion,
So that operational recovery does not silently revive data that should be gone.

**Acceptance Criteria:**

**Given** actual selected hosting/provider services and plans,
**When** their logging, backup retention and restoration behavior is assessed from current authoritative information,
**Then** findings distinguish app-managed data/copies from unavoidable host/provider systems and record sources/date and remaining uncertainties,
**And** privacy wording reflects facts rather than treating app deletion as proof all external systems immediately erase copies (NFR21, A06).

**Given** a proposed disaster-recovery path,
**When** operations/privacy resolves A06,
**Then** a test or equivalent verified assessment demonstrates expired/already-deleted data cannot be served or retained contrary to policy after restoration,
**And** restoration is not enabled or relied upon until that proof exists; local capability acceptance may use controlled restoration fixtures plus verified service assessment without requiring a future hosted deployment (A06).

**Given** the chosen approach needs metadata after deletion,
**When** its design is checked,
**Then** it cannot silently add indefinite content-bearing tombstones, scope or identifiers outside the approved minimal audit,
**And** any unresolved policy expansion requires owner approval and blocks the affected recovery path rather than being invented here (A06).

**Given** code/index rollback documentation,
**When** it is compared with disaster recovery,
**Then** the runbook distinguishes them and never restores whole Conversation D1 merely to undo code deployment,
**And** Epic 5 must verify the actual enabled production recovery configuration before launch (AR41).

### Story 4.9: Verify Privacy Comprehension and Complete Lifecycle Evidence

As a visitor,
I want truthful and usable privacy/deletion behavior across all Conversation states,
So that my request and storage expectations are not based on a mock or hidden exception.

**Acceptance Criteria:**

**Given** completed disclosures and actual processing configuration,
**When** BC/UX conducts a comprehension check,
**Then** a visitor can explain storage/BC review, actual provider handling, creation-based 90 days, manual non-immediate request processing and the separate minimal indefinite audit/temporary counter,
**And** misleading wording or an unopened-dialog-only disclosure prevents acceptance (FR-16).

**Given** desktop/mobile waiting, turn cap, request pending/error/open and inaccessible-after-deletion states,
**When** real keyboard/touch/screen-reader checks run,
**Then** permanent privacy access, visible UUID, request operation, focus containment/restoration, announcements and preserved draft/reading position work,
**And** rendered contrast/targets/reflow follow approved style without claiming a prior certification (UX-DR16, UX-DR17, UX-DR21–UX-DR24).

**Given** global, selected, interrupted, failed, retry-chain and legacy records,
**When** request/export/deletion/purge/failure-race suites run,
**Then** a schema/storage inventory confirms only permitted content/evidence/scope, recovery identifiers/timestamps and minimal diagnostics are retained, and these appear in controlled snapshots and are fully removed on deletion while the audit stays metadata-only and historical UUID-safe,
**And** managed export output is either disabled or proven coordinated with deadline cleanup (FR-19, FR-20).

**Given** review cadence, local scheduler/guards, runbook, A05/A06 assessments and failure visibility,
**When** Epic 4 evidence is assembled,
**Then** exact revisions/configurations/tests and unresolved launch prerequisites are recorded,
**And** actual production scheduling, billing and enabled recovery remain explicit Epic 5 checks rather than assumed operational facts (AR43).

## Epic 5: Share an Evaluated, Operable, Zero-Euro Release with Recruiters

BC can validate isolated preview, inspect integrated deterministic/actual-model/browser/privacy evidence, manually promote the exact evaluated revision and artifacts, verify production operations and share only after a documented go/no-go decision. Covers FR-21/FR-22, NFR25–NFR27 and AR40–AR44, integrating all feature evidence without postponing feature-local testing. No numeric budget, provider guarantee or outstanding policy is invented by these stories.

### Story 5.1: Run Deterministic Safety and Build Checks in CI

As a BC maintaining the release,
I want repeatable CI checks on changes without live-model costs or privileged PR execution,
So that unsafe sources, contract regressions and broken builds are caught before deployment.

**Acceptance Criteria:**

**Given** a push or pull request,
**When** GitHub Actions runs,
**Then** locked installation, type checks, deterministic tests, local D1 migration/index/publication tests, source-safety checks and application builds execute with reproducible results,
**And** failing required checks block the deploy/promotion path (AR40, AR44).

**Given** untrusted PR code,
**When** its checks run,
**Then** it receives no deployment/production secrets or privileged deployment path,
**And** workflows cannot execute untrusted code in a secret-bearing context by changing event triggers or artifact trust (AR40).

**Given** public-content artifacts,
**When** CI builds and packages them,
**Then** only allowlisted public files/assets with exact committed source SHA/hash are published as artifacts,
**And** private sentinels, secrets, runtime databases, conversation exports and the full checkout are excluded (AR7, AR15).

**Given** ordinary CI execution,
**When** tests complete,
**Then** simulation is used without automatic real-model evaluations, provider failover or processing retries,
**And** reports clearly separate deterministic evidence from explicitly triggered semantic evaluation (FR-21).

### Story 5.2: Configure Isolated Hosted Environments Within Verified Free Plans

As a BC operating the public portfolio,
I want separated preview/production resources with scoped configuration and verified costs,
So that hosted validation cannot expose production data or silently require paid services.

**Acceptance Criteria:**

**Given** actual GitHub and Cloudflare repository/account plans,
**When** setup is assessed from current official documentation and account configuration,
**Then** CI minutes/storage, hosting, D1, scheduled work, assets and actual model quota/billing behavior are documented with sources/date and zero-euro evidence,
**And** mandatory charges, paid overage or unverified cost assumptions block the affected setup rather than being called free (NFR2, AR43).

**Given** local, preview and production purposes,
**When** resources and secrets are configured,
**Then** preview uses separate disposable data/resources/secrets and production has separate scoped bindings and restricted promotion credentials,
**And** private local content or recruiter Conversation data cannot enter preview builds or test datasets (AR40).

**Given** deployment credentials and runtime configuration,
**When** setup documentation is followed,
**Then** required names/scopes/rotation and environment selection are documented without secret values,
**And** missing/wrong bindings fail safely rather than defaulting to production or broader permissions (NFR26).

**Given** the chosen custom domain and human-readable slug,
**When** ownership/DNS/access are configured,
**Then** HTTPS and unlisted noindex/robots behavior can be verified without treating the slug as authentication,
**And** domain/plan choices respect the actual zero-euro constraint; no paid purchase or new service is assumed approved (FR-5, OPEN-4).

### Story 5.3: Prove Migration and Legacy-Snapshot Compatibility

As a BC maintaining stored interactions,
I want migration and rollback compatibility demonstrated before new readers are deployed,
So that scope provenance and existing Conversations are not lost during upgrades.

**Acceptance Criteria:**

**Given** representative supported old/new schemas and versioned records,
**When** migrations run locally and in isolated validation,
**Then** singleton, unique request/answer, lease/operation, citation, historical audit and stable-ID constraints are preserved,
**And** active publication is populated only from a verified coherent artifact, not an arbitrary Resource row (AR42).

**Given** legacy question-only records,
**When** original admission registry/provenance can be proved versus cannot be reconstructed,
**Then** migration uses a proven version-1 global snapshot or exactly version:0/mode:legacy_scope_unavailable without invented IDs/catalog SHA,
**And** citations are never mistaken for the full old allowlist or used to infer selected Resources (AR42).

**Given** legacy-unavailable scope or nullable excerpt provenance,
**When** GET/replay/export/viewers read it,
**Then** saved results remain readable with explicit missing provenance and saved path/revision grouping, but generation recovery/new-id retry from unavailable scope is disabled,
**And** new admissions always require version 1 with no scope-less writes or fabricated live-index joins (AR42).

**Given** renamed public files and compatibility rollout,
**When** document IDs/migrations/new readers are introduced,
**Then** stable identities are assigned with version-controlled provenance before rename and compatibility Worker or controlled admission pause protects incompatible transitions,
**And** interrupted/failed/global/selected/retry/export/deletion fixtures remain valid (AR42).

**Given** rollback to a prior code/index revision,
**When** compatibility checks execute,
**Then** new snapshots are retained and unsupported submissions fail safely rather than stripping scope,
**And** incompatible rollback requires explicit maintenance/forward repair, never whole-Conversation-D1 restoration (AR41).

### Story 5.4: Deploy Trusted Preview with Asset-Before-Publication Ordering

As a BC validating changes,
I want automatic deployment of checked trusted revisions to isolated preview,
So that evaluation runs against a known coherent release rather than whichever commit is latest.

**Acceptance Criteria:**

**Given** a trusted revision with passing required CI,
**When** GitHub Actions deploys through Wrangler,
**Then** the per-environment serialized job identifies the exact application SHA and matching catalog/index artifacts and uses preview-only credentials/resources,
**And** untrusted PR jobs have no privileged path into it (AR40).

**Given** compatible changes,
**When** rollout executes,
**Then** compatible migrations and transition Worker precede upload/reachability/hash verification of the immutable catalog asset, followed by atomic D1 singleton/Resources/maps/registry/chunks/FTS activation and compatible frontend deployment,
**And** old frontend/transition readers tolerate the announced asset and stale-catalog rejection preserves edits (AR41).

**Given** failed upload, missing asset, digest mismatch or failed D1 activation,
**When** fault-injection checks run,
**Then** the old coherent publication remains active or a new unreferenced asset stays harmless,
**And** no pointer-only switch, mixed dataset or claimed cross-service transaction occurs (AR10, AR41).

**Given** preview deployment completion,
**When** hosted smoke/integration checks run with synthetic data,
**Then** health/catalog identity, anonymous isolation, actual configured routes, citations/scope, failure recovery and privacy/deletion functions are exercised,
**And** results retain release/artifact/environment identity without exposing tokens or production Conversations (AR43).

### Story 5.5: Assemble Integrated Launch Evaluation on the Actual Configured Release

As a BC deciding whether the portfolio is trustworthy,
I want a predefined integrated evaluation of the preview release,
So that public sharing depends on evidence rather than mock success or feature count.

**Acceptance Criteria:**

**Given** the versioned FR-21 test set and preview release identity,
**When** integrated checks execute,
**Then** deterministic coverage includes source safety, isolation, scopes/citations, concurrency/failure injection, root-context retries, session/lifecycle, limits/quota/deadlines, migrations and export/deletion/retention,
**And** feature reports remain linked rather than replaced by a single shallow smoke result (FR-21, AR44).

**Given** an explicitly triggered real-model evaluation,
**When** actual classifier/generator outputs are inspected by a human,
**Then** professional/missing/ambiguous/multilingual/value-judgment/commitment/sensitive/injection cases test factual support, completeness, refusal/redirection, clarification and actual language in global and selected modes,
**And** evidence includes model/configuration/corpus revisions and critical failures cannot be waived by valid schemas (FR-21, FR-22).

**Given** supported real browsers and assistive/input methods,
**When** desktop/mobile keyboard/touch/screen-reader checks run,
**Then** entry, guide, long reading, scope/token overflow, citations/sheets, keyboard-open Composer, unknown/retry/reload, privacy/deletion and unavailable/limit states are verified,
**And** lifecycle/storage-denied, focus/reading preservation, contrast/A10, reduced motion and source-count labels have recorded actual evidence (UX-DR21–UX-DR24).

**Given** actual provider/host configuration and privacy text,
**When** launch privacy checks execute,
**Then** disclosures, public-source review, prompt minimization, temporary counters, minimal audit, request cadence and creation-based cleanup match reality,
**And** A05–A10 and OPEN-1–OPEN-5 have explicit owner decisions or outstanding blockers rather than being silently closed (FR-16, FR-21).

**Given** a changed source/model/configuration or failed case,
**When** evaluation relevance is assessed,
**Then** impacted evidence is rerun or explicitly revalidated against the release under consideration,
**And** sampled model success remains evidence, not a guarantee for every future answer (AR44).

### Story 5.6: Rehearse Partial-Deployment Recovery and Safe Rollback

As a BC operating the release,
I want tested recovery from failures between deployment stages,
So that repairing code or indexes never erases newer Conversations or requests.

**Acceptance Criteria:**

**Given** isolated release A and candidate B,
**When** failures are injected after migration, Worker deployment, asset upload, D1 activation or frontend deployment,
**Then** the runbook identifies actual state and restores a compatible coherent code/index combination or uses documented maintenance/forward repair,
**And** no stage assumes atomicity across D1, Worker and Pages (AR41).

**Given** newer Conversations and Deletion Requests created during the drill,
**When** code/index rollback occurs,
**Then** those records and their immutable scopes/excerpts/audits survive unchanged,
**And** whole-Conversation-D1 restoration is never used to undo an application release (NFR27).

**Given** previous catalog/index artifacts,
**When** rollback activates them,
**Then** previous immutable asset reachability/hash is verified before atomic pointer/dataset activation and required transition assets remain retained,
**And** unavailable original scope members fail safely while saved history/replay is not rewritten (AR41).

**Given** incompatible schema/readers or a partially failed recovery,
**When** compatibility checks cannot pass,
**Then** unsupported submissions are stopped safely with an explicit repair path instead of dropping scope fields or broadening eligibility,
**And** synthetic old/new/interrupted/failed/export/deletion fixtures prove the documented procedure (AR42).

### Story 5.7: Complete and Rehearse the Operator Runbook

As a BC responsible for public operation,
I want a usable tested runbook for delivery, privacy and provider incidents,
So that the portfolio remains recoverable without an admin product or hidden operational knowledge.

**Acceptance Criteria:**

**Given** the deployed preview and preceding feature procedures,
**When** the consolidated runbook is followed,
**Then** setup/secret names, exact release/artifact identity, preview checks, manual promotion, post-checks, migration compatibility, partial failures and code/index rollback are executable,
**And** commands explicitly select environment with least-privilege credentials and never contain secret values (NFR26, AR43).

**Given** synthetic retained/deletion-request data,
**When** operator review, transient export, guarded deletion, purge/deferral/failure recovery and deadline checks are rehearsed,
**Then** requests stay visible, managed-copy policy stays enforced and cleanup succeeds without false handled transitions,
**And** configured review cadence, purge cadence/margin/cutoff and operator-visible failures are recorded (AR37–AR39).

**Given** documented provider rate/quota/timeout/billing incidents,
**When** the procedure is rehearsed using safe fixtures or verified account facts,
**Then** affected processing stops professionally without automatic retry/failover/paid overage while reads/privacy remain usable,
**And** only known reset times are communicated and current official references support the mapping (AR21).

**Given** actual host/provider logs, backups and any enabled restore/export path,
**When** operational privacy readiness is assessed,
**Then** A06's restoration proof/verified assessment and managed-copy cleanup requirements are satisfied or those optional recovery/persistent destinations remain disabled,
**And** no new indefinite content store or unsupported privacy guarantee appears (A06, AR39).

**Given** the rehearsal evidence,
**When** BC checks runbook completeness,
**Then** tested revision/configuration/commands/results and remaining blockers are retained,
**And** the architecture companion alone is not accepted as the usable runbook (AR43).

### Story 5.8: Manually Promote the Exact Evaluated Revision to Production

As a BC owning the release decision,
I want explicit promotion of the validated revision and its matching evidence artifacts,
So that production does not drift to an unevaluated latest commit.

**Acceptance Criteria:**

**Given** required preview checks/evaluation/runbook evidence for a specific revision,
**When** BC explicitly authorizes the production deployment job,
**Then** GitHub Actions promotes that exact application and corresponding catalog/index artifacts through scoped production credentials,
**And** jobs serialize per environment and cannot substitute a newer commit or preview dataset (NFR25, AR41).

**Given** production rollout,
**When** compatible deployment stages execute,
**Then** migration/transition Worker/verified immutable asset/atomic D1 publication/frontend ordering follows the rehearsed procedure,
**And** any incompatible change requires its explicit maintenance plan rather than assumed ordering safety (AR41).

**Given** a failed deployment stage,
**When** promotion stops,
**Then** no false success is reported and partial-state recovery follows the tested runbook without losing live Conversations/requests,
**And** prior transition artifacts remain available for supported readers (NFR27).

**Given** completed promotion,
**When** release metadata is recorded,
**Then** application SHA, public-content revision/hash, environment/configuration and linked evaluation evidence identify the deployed release,
**And** deployment alone does not authorize sharing with recruiters before post-deploy and go/no-go checks (FR-22).

### Story 5.9: Verify Production Privacy, Limits and Scheduled Cleanup

As a BC preparing public sharing,
I want actual production settings checked after deployment,
So that local/preview success cannot conceal a missing purge schedule or unsafe free-plan configuration.

**Acceptance Criteria:**

**Given** the promoted production revision and synthetic test Conversations,
**When** post-deploy probes run,
**Then** HTTPS/domain/slug/noindex, minimal health/catalog identity, access isolation, stale-catalog handling, scope/citation/recovery and privacy/deletion behavior match the evaluated release,
**And** probes do not expose credentials or collect real recruiter traffic before approval (AR43).

**Given** actual production bindings and scheduled purge,
**When** configuration and controlled cleanup verification run,
**Then** purge is enabled with the documented cadence/margin/cutoff, failure signal and review procedure, and synthetic deadline/busy/failure cases have corresponding proven behavior,
**And** no assumption that access expiry equals deletion substitutes for cleanup evidence (FR-20, AR37).

**Given** actual free-plan/provider/CI settings and usage observations,
**When** cost/quota and recovery policies are rechecked,
**Then** zero-euro/no-overage claims, known exhaustion behavior and A08's measured execution decision remain supported, and actual network/storage inspection confirms no nonessential analytics, tracking, durable visitor fingerprint or UUID-to-identity linkage,
**And** unknown billing, uncontrolled retry/fallback or raw-error paths block sharing (NFR2, NFR7, A08).

**Given** actual processing/log/backup/managed-export configuration,
**When** privacy/operator evidence is reconciled with it,
**Then** visitor copy, A05/A06 decisions, minimal audit exception and disabled-or-proven restoration/persistent destinations remain truthful,
**And** changed settings require explicit revalidation rather than carrying preview approval forward blindly (FR-16).

### Story 5.10: Record the Go/No-Go Decision and Share Only a Trustworthy Release

As a BC sharing the portfolio with recruiters,
I want an evidence-backed release decision with explicit blockers,
So that professional trust—not feature volume or persuasive claims—determines public use.

**Acceptance Criteria:**

**Given** the complete predefined evaluation and production checks,
**When** BC assesses readiness,
**Then** the evidence index links actual release/corpus/model/configuration, deterministic/model/browser/privacy/source/operations results and all applicable open-item dispositions,
**And** missing evidence or unresolved critical failure produces no-go without relabeling a defined contract or approved sketch as implementation proof (FR-21, FR-22).

**Given** unsupported claims, private-source exposure, prohibited sensitive answers, hidden/lost deletion requests, raw errors, unrecoverable hangs, unsafe free quota, scope widening/mutation, duplicate recovery or durable cross-visit restoration,
**When** any is known from testing or operation,
**Then** recruiter sharing is blocked or suspended pending correction and relevant reevaluation,
**And** passing deterministic checks alone cannot waive a critical semantic/privacy/accessibility failure (FR-22).

**Given** A05–A10 and OPEN-1–OPEN-5,
**When** the checklist is closed,
**Then** each has an owner-approved decision/evidence or an explicit applicable blocker; optional features may remain disabled only where their existing contracts permit,
**And** no new numeric budget, redaction, request-origin rule, creation recovery, deletion exception or palette redesign is selected by checklist completion alone (AR44).

**Given** all required checks pass and BC explicitly approves sharing,
**When** the unlisted recruiter link is released,
**Then** only the evaluated production release is shared and its limitations/operating procedures remain documented,
**And** later meaningful exploration may be assessed qualitatively without new analytics, identity linkage, hiring-conversion attribution or automatic outreach (PRD SM-1–SM-4).

**Given** a later application/content/model/provider-setting change,
**When** BC plans another release,
**Then** impacted tests/evaluations and manual promotion requirements are reapplied,
**And** a previous go decision is not treated as perpetual certification of future outputs or deployments (FR-22).
