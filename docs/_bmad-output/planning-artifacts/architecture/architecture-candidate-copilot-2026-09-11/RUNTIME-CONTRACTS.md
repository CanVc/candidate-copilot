---
name: candidate-copilot-v1-runtime-contracts
type: architecture-companion
status: final
created: 2026-09-17
updated: 2026-09-30
binds:
  - ARCHITECTURE-SPINE.md AD-3..AD-8, AD-10, AD-12..AD-18
---

# Runtime and Delivery Contracts — Candidate Copilot V1

This companion completes [ARCHITECTURE-SPINE.md](ARCHITECTURE-SPINE.md). These are approved application contracts and initial configuration values, not implemented code, measured performance, provider guarantees, or an operator runbook. Shared types, SQL, tests, and delivery stories must preserve them.

## 1. Turn admission, identity, and ownership

A logical submission has a browser-generated `requestId`, unique within its conversation. A processing execution has a distinct server-generated `processing_attempt_id`. Replaying a logical submission keeps its request id; recovering an expired execution creates a new attempt id.

Core authenticates the conversation before looking up a request or returning a saved result. The admitted question **and Submitted Scope** are immutable for that request id. Normalize direct submission identity as exact question text (no silent trim/rewrite), case-sensitive unique Resource IDs sorted lexically, and catalog revision/hash. Duplicate IDs and reordered equivalent sets are harmless; changing text, the set, or catalog identity under the same id is `409 request_conflict`. A retry submission instead identifies its `retryOfRequestId`; changing that origin or body variant under the same id conflicts. Authenticate and check saved identity/result **before** validating the live catalog: mapping evolution must not invalidate saved replay. Never use the editable draft/Active Selection for recovery.

| Existing state | Action |
| --- | --- |
| Same request id and immutable identity, result recorded | Return the saved outcome/scope without another message, turn count, live-catalog dependency or LLM call. |
| Same request id and immutable identity, unexpired processing lease | Return `409 request_in_progress`; do not start another execution. |
| Same request id and immutable identity, no result, expired/lost lease, conversation available | On manual recovery, reuse the admitted message/scope and acquire a fresh attempt lease; no remapping or new turn. |
| Same request id, different immutable identity | Return `409 request_conflict`. |
| Another request owns an unexpired lease | Return `409 conversation_busy`; no queue and no new message. |
| Unknown request id, conversation available | Validate limits, active catalog/mappings or canonical retry origin, and atomically acquire a lease with admission of one user message, immutable identity and scope snapshot. |

An expired earlier request does not authorize taking over another request's active lease. An interrupted message alone does not keep the conversation busy forever: once the server confirms there is no active lease, a deliberately new question may be admitted under a new id and normal limits. It neither recovers nor erases the older interrupted message. A retry of the unknown-outcome submission itself must still keep its original id; the UI must not silently turn recovery into a new question. Recovering a message uses context preceding its immutable context anchor, not later turns, and attaches the answer to that message's original transcript place. For a direct submission the anchor is itself; for a technical retry follow saved same-conversation `retry_of_request_id` links to the first non-retry origin. Both new-id retry preparation and same-id recovery of a retry use that root context, including retry-of-retry. Links only point to already recorded failed turns, cannot cycle or cross conversations, and stay within the 20-turn bound. Missing required context asks clarification under the usual budget, never substitutes later topics.

Replay of a recorded outcome and recovery of an already admitted message are not new logical turns and must not be rejected merely because the conversation has reached its turn cap. Access expiry, deletion, or known provider unavailability still prevent new processing; recovering a saved result needs no provider call.

### Catalog, membership and revision handling

- Author Resource definitions as reviewed `content/public/resources/*.md` with `resource_id`, `resource_name`, short factual `resource_description`, explicit nonempty `document_ids`, and normal public-review frontmatter. Every indexed public Markdown file, including descriptors, has a unique immutable `document_id`; a descriptor is not automatically selected evidence unless explicitly mapped. Global eligibility includes all indexed public documents. Paths/titles are locators/labels, never identities; IDs are never reused. No uploads or inferred mappings from name matching.
- The deterministic indexer rejects duplicates, unknown/nonpublic document IDs, malformed/empty maps and unreviewed descriptors. Shared documents may belong to several Resources. Persist active catalog identity and public mappings with the D1 document/chunk registry. `catalogRevision` is the full Git SHA of the public snapshot; `catalogHash` is lowercase-hex SHA-256 of the exact canonical bytes below, not merely labels; identical hashes must never address different revisions. Mapping edits therefore change provenance even if a name is unchanged.
- Publish an immutable `/assets/resources-catalog.<catalogHash>.json` with schema version, identity and public Resource names/descriptions/document-ID maps; `/api/health` announces the active identity and asset path without diagnostics or visitor state. Path/hash are build-owned, same-origin allowlisted values. Cache immutable assets, not the active pointer indefinitely. Worker trusts D1, never browser mappings. Stale assets cause `409 catalog_stale` before new direct admission; load the announced catalog, revalidate selection and wait for a new explicit send, never auto-resubmit.
- New direct admission resolves the selected set **once**, atomically with active-catalog check, message/snapshot write, turn-count check and lease. Each selected Resource must be valid/available with its complete nonempty public mapping; reject the entire submission if any is invalid. No arbitrary Resource-count cap; technical request bounds must accommodate the entire active catalog, not impose an unapproved UX limit.
- Selected mode freezes the exact deduplicated union of mapped document IDs. Empty selection freezes all active deployed public document IDs in global mode. No Web/private/outside-selected supplement, fallback after no matches, or empty-allowlist-as-global convention. Future selection, resource maps or deployed registry cannot rewrite that union.
- Before each processing/recovery attempt reads evidence, check the stored allowlist against one coherent current publication. All frozen documents must still be public/available; for selected mode original Resources and original mapping edges must still exist. Additions to a map are ignored. Removed members/edges/Resources produce controlled `scope_unavailable`, never intersection-only answers, substitutes or global search. Stable-ID path/title renames and text updates are allowed; historical Resource labels remain admitted labels. A global snapshot does not acquire newly published documents.
- **Membership is frozen, not all evidence text.** Do not retain a full KB copy per question. Recovery may read updated text of the same eligible stable documents. Retrieve text/ID/path/title/section/hash/revision consistently from one publication, carry trusted values through generation and persist actual cited text/revision. Snapshot catalog provenance answers “what was eligible at admission”; excerpt provenance answers “which text supported this result”. Before factual finalization, recheck that original members/edges remain public/available; withdrawal prevents factual publication and takes a controlled failure path. A later text-only reindex does not relabel loaded excerpts.
- Completed replay/history never consults current availability to rewrite/delete historical labels or excerpts. Exceptional remediation of accidentally sensitive material covers public Git/index/artifacts **and historical copies** through controlled operator work; it is not ordinary catalog deletion.

### Canonical public catalog bytes

The asset envelope is `{ catalogHash, payload }`. `payload` has **exactly** `{ version: 1, catalogRevision, resources, documents }`; each Resource is `{ resourceId, name, description, documentIds }`, each registry document `{ documentId, sourcePath }`. All values come from the committed public snapshot; names/descriptions are source text, not generated summaries. Normalize Resource/document arrays by their stable ID and deduplicate/sort each `documentIds` set using unsigned UTF-16 code-unit comparison, never locale collation. Reject duplicate entity IDs rather than merging them. Serialize normalized `payload` with [RFC 8785 JCS](https://www.rfc-editor.org/rfc/rfc8785) (checked 2026-09-30): recursive property ordering, Unicode strings unchanged, UTF-8, no BOM/whitespace/trailing newline. Hash **only those bytes**; exclude outer `catalogHash`, deployment/runtime timestamps, URLs and `indexed_at`. This also fixes the artifact schema consumed by the library and active pointer.

Minimal synthetic golden payload (zero SHA is fixture data, not valid production provenance), already canonical:

```json
{"catalogRevision":"0000000000000000000000000000000000000000","documents":[{"documentId":"d-a","sourcePath":"content/public/a.md"}],"resources":[{"description":"Test","documentIds":["d-a"],"name":"A","resourceId":"p-a"}],"version":1}
```

Its no-newline UTF-8 SHA-256 is `aefae89a06c759fbf9b82ef17b8f57e532731af585f0df1f138cfda52c897223` (calculated locally). Indexer/Worker/shared-contract tests must use this and golden vectors for reordered overlapping sets, Unicode/escape handling and changed mapping/revision. JCS does not sort arrays itself; the application normalization above is required. No new canonicalization library is selected here.

D1 is authoritative across Worker instances. Checking availability and acquiring the lease are one atomic operation, not a read followed by an unconditional write. `processing_request_id`, `processing_attempt_id`, and `processing_until` identify the current owner and deadline; a redundant conversation `isProcessing`/business status is unnecessary. Only the matching unexpired attempt may finalize or release the lease. Browser button disabling is a UX aid, not concurrency protection.

## 2. Atomic finalization and failure recovery

The original user message, normalized submission identity, immutable Submitted Scope and optional retry origin are committed together at admission. No scope-less admitted turn or answer-owned scope. Initial and recovered attempts share the snapshot; refusal/clarification/error paths retain it too. After a draft passes mechanical validation, finalization is one guarded D1 transaction:

1. Verify conversation existence, retention eligibility and matching unexpired attempt lease. For factual outcomes, also guard original document/Resource/edge availability against active publication in this same transaction; no separate check-then-unconditional-write. If withdrawn, replace factual output with controlled `scope_unavailable` failure under the same ownership guard, retaining scope and publishing no factual blocks/excerpts.
2. Insert the canonical answer, its blocks, Source Excerpts, citation edges, and associated outcome metadata.
3. Make the request terminal and release its processing lease in the same transaction.

In the structural seed, the unique answer linked by `answers.message_id` is the durable completion marker; its absence means no terminal result has been committed. Do not maintain a second independently writable completion flag. Uniqueness of `(conversation_id, request_id)` for admitted user messages and of `answers.message_id` prevents duplicate logical messages and answers.

If finalization fails, none of the answer data or completion/release changes survive. Only the admitted original user message with its identity, scope and retry origin remains as business content; lease/control metadata may remain until expiry. A recoverable failure that is successfully finalized is instead a terminal `failed` answer, with application-owned error code/retryability and a professional message. Canonical failure metadata must be persisted so a replay returns the same outcome rather than reconstructing a different error from current provider state.

The ownership guard must govern the entire write set. An expired/stale attempt cannot insert children, overwrite an answer, release a successor's lease, or recreate a deleted conversation. At most one answer becomes canonical; this does not guarantee exactly one provider computation if an old remote call continues after a manual recovery.

## 3. Initial deadlines and no automatic retries

| Setting | Initial value | Meaning |
| --- | --- | --- |
| Backend attempt budget | 30 seconds | Shared wall-clock budget from lease acquisition through classification, retrieval, generation, validation, and finalization. |
| Classifier ceiling | 5 seconds | Within the 30-second budget, not additional time. |
| Finalization allowance | About 2 seconds | Reserved within the backend budget; generation must stop early enough to attempt controlled persistence. |
| Processing lease | 40 seconds | Initial duration from acquisition; prevents permanent blocking after an interrupted Worker. |
| Browser POST wait | 45 seconds | Transport wait limit; expiration does not establish backend failure. |
| Reload-state observation | Every 3 seconds, at most 45 seconds | Read-only GET observation after reload while an existing attempt is active. |

These are configurable initial values to verify in engine tests. They are not individual allowances that may be summed into a longer turn. Before each operation, check the remaining overall budget. On timeout, attempt to cancel outstanding work and finalize a controlled failure if possible; a browser abort or provider cancellation request does not prove that remote computation stopped. Lease expiry and the guarded finalization remain necessary.

**No automatic retries** in the browser, Core, or provider adapter/SDK. A malformed LLM draft does not trigger an automatic repair/regeneration call. Do not automatically switch provider or incur paid overage. Scheduled purge passes and the bounded read-only observation below are not generation retries.

## 4. Public HTTP and session contract

All public traffic uses HTTPS. Conversation creation returns the UUID and an opaque, unpredictable session token; only its hash is stored server-side. Requests for a conversation send `Authorization: Bearer <sessionToken>`. Tokens never enter URLs, logs, analytics, model prompts, or operator exports. Authorization precedes request replay lookup.

Use one neutral access failure (`401 conversation_unavailable`) for missing/invalid credentials and inaccessible, expired, or deleted conversations, without revealing whether a supplied UUID exists. The UI says: “Cette conversation n’est plus accessible. Vous pouvez en démarrer une nouvelle.” It stops observation and never silently recreates/resubmits into the old or a new conversation.

Browser storage is limited to the versioned current-tab/session capsule in §5: credentials, separate editable next-turn state, reference-only view state and immutable pending submission while outcome is unknown. D1 remains canonical; no persisted transcript/result/excerpt cache, durable `localStorage`/IndexedDB restoration, service-worker conversation cache or cross-visit identifier. Authenticated responses use `Cache-Control: no-store`. Remove **only matching** pending state on terminal receipt; callbacks cannot clear newer pending identity/draft/selection. Clear conversation-bound state on explicit new conversation/access loss. Session storage is JavaScript-readable: render model/public labels as untrusted text, never trusted HTML; test injection paths.

### Routes and payloads

| Route | Contract |
| --- | --- |
| `POST /api/conversations` | Apply creation rate limit; return `{ conversationId, sessionToken }`. No token is required before a conversation exists. |
| `POST /api/conversations/:id/messages` | Authenticated `SubmitTurnRequest` below; return complete structured result with `submittedScope` after finalization, no streaming. |
| `GET /api/conversations/:id` | Authenticated ordered transcript including each admitted message's `messageId`, `requestId`, question, timestamp, immutable `submittedScope`, optional `retryOfRequestId`, recorded result when present, and processing state. Also expose whether a new message is currently admissible and the applicable reason when not. |
| `POST /api/conversations/:id/deletion-request` | Authenticated, idempotent request for this conversation; return request identity/state and honest manual-processing confirmation. It is not blocked by an active generation. |
| `GET /api/health` | Minimal health plus active `catalogRevision`, `catalogHash`, `catalogAssetPath`; no transcript, credentials or administrative diagnostics. |

### Shared submission and snapshot shapes

```ts
type SubmitTurnRequest = { requestId: string } & (
  | {
      question: string
      selection: {
        resourceIds: string[] // [] explicitly means global public mode
        catalogRevision: string // full Git SHA of active publication
        catalogHash: string
      }
    }
  | { retryOfRequestId: string } // Core copies question/scope; no composer fields
)

type SubmittedScope = {
  version: 1
  mode: 'global_public' | 'selected_resources'
  catalogRevision: string
  catalogHash: string
  resources: Array<{
    resourceId: string
    name: string // trusted historical label at original admission
    documentIds: string[] // trusted complete original mapping
  }>
  eligibleDocumentIds: string[] // immutable union / global registry
}

type LegacyScopeUnavailable = {
  version: 0
  mode: 'legacy_scope_unavailable'
}
type StoredScope = SubmittedScope | LegacyScopeUnavailable // read/export only
```

Validate the exact discriminated request variant and reject mixed/extra question/selection/retry fields. Core constructs snapshots, never accepts browser-supplied `SubmittedScope`, paths/excerpts or document allowlists as authority. Resource IDs, mapped sets and union use lexical sorted/unique order. `resources` is empty only in global mode; selected mode requires at least one Resource with nonempty map/union. Empty global registry is `scope_unavailable`, not a wildcard. Immutable `messages.submitted_scope` stores this JSON, without live-catalog FK/cascades. `messages.submission_identity` retains canonical direct/retry input for exact conflict checks; `(conversation_id, request_id)` stays unique.

For a **new-id retry**, Core resolves `retryOfRequestId` only within the authenticated conversation and verifies a recorded `failed` result with application-owned `retryable: true`. Copy its exact question/Submitted Scope, including names/original mapping provenance, store retry origin and apply §1 availability plus normal concurrency/length/turn/quota/retention admission. New mapping additions never enter copied scope. Interpret the copied question using the original root context anchor in §1, under the usual history/clarification budget, not later topics that could change pronoun meaning; display its new result at the new retry message position. Unavailable origin/scope is rejected before admission without count increment; failed turn, draft and Active Selection stay intact. Already-admitted retry replay/recovery uses saved identity/snapshot, not a new origin lookup/current selection. No retry for answered/partial/refused/clarification/unknown turns; invalid origins cannot leak another conversation's existence.

GET and result envelopes expose `submittedScope: StoredScope`; newly admitted messages always use version 1. A message result envelope carries `requestId`, `messageId`, `answerId`, `status`, `language`, `submittedScope`, optional `retryOfRequestId`, `blocks`, and `sourceExcerpts`. Its answer/block/source meanings are those in the spine. `status` is `answered`, `partial`, `refused`, `clarification`, or `failed`. A failed result also has persisted application error metadata exposed as `error: { code, message, retryable, retryMode }`; a retryable recorded failure uses `retryMode: 'new_request'`, otherwise `'none'`. Refusals, partial answers, and clarifications are business results, not technical failures.

Each completed turn returned by GET must use the same canonical result schema as POST/replay, including block order, `sourceIds`, full Source Excerpts and their revisions, language, status, and persisted failure metadata. Reconstruct it from admitted message/snapshot plus `answers`, `answer_blocks`, `answer_block_sources` and `source_excerpts`, never current catalog or selection. Source Excerpts also retain trusted `documentId`, original `sourceChunkId`/`contentHash`, `sourceTitle` (filename fallback) and `sectionTitle` alongside text/path/location/revision. Persist original retrieved chunk identity/hash as `source_excerpts.source_chunk_id`/`content_hash` without a live-index FK. The hash describes the original chunk plus relevant public metadata, not a recomputed hash of a shortened excerpt or current file; these historical values share excerpt retention and result/export parity. Group this passage's cited excerpts by stable document ID for distinct-file count, not Resource ID/current catalog; retain all sections/excerpts without duplicate file rows. Titles are public source metadata loaded with chunk text/revision, never generated summaries or late live-catalog reads. `sectionTitle` is null for unheaded passages. Provenance-unavailable legacy excerpts may have null `documentId`/`sourceChunkId`/`contentHash` (never invented or recomputed as original provenance), filename fallback from the saved path and nullable section from saved location only; group those by saved `(sourcePath, sourceRevision)`, never fabricate IDs/titles from the live index. New excerpts require eligible stable IDs. Returning only answer text/status is insufficient.

A GET distinguishes `completed` (recorded answer), `in_progress` (matching unexpired lease), and `interrupted` (admitted message without answer or active matching lease). Do not expose internal attempt-owner identifiers or require the browser to infer terminal status from a missing text field. Known provider or admission limits can temporarily prevent resuming an interrupted turn; the server remains authoritative.

### HTTP outcomes

| Situation | HTTP / application outcome |
| --- | --- |
| Recorded turn outcome, including controlled technical failure | `200` with the canonical result. Same-id replay returns that result without calling the LLM. |
| Same logical request actively processing | `409 request_in_progress`. |
| Another request owns the conversation | `409 conversation_busy`; a rejected new message stays in the browser draft. |
| Same request id with different immutable identity | `409 request_conflict`; no automatic substitution of a new id. |
| Malformed/overlength input | `400 invalid_request`, with a safe actionable message and no truncation. |
| Invalid/unknown selected ID or malformed selection | `400 invalid_scope`, no message/turn. |
| Stale catalog identity for new direct submission | `409 catalog_stale` with current public identity; preserve edits and refresh catalog without sending. |
| Original Resource/document/mapping unavailable before new retry admission | `409 scope_unavailable`, no new message/turn; never global fallback. |
| Invalid retry origin in this conversation | `400 invalid_retry`, no new message/turn. |
| Availability lost during admitted attempt/recovery | Finalize controlled `failed` / `scope_unavailable` if possible with original scope; otherwise `result_unavailable` and same-request recovery. |
| Conversation turn cap reached | `429 turn_limit_reached`; reads and deletion requests remain available. |
| Conversation creation rate exceeded | `429 rate_limited`, with `Retry-After` until the next UTC day. |
| Provider unavailability already confirmed before admission | Temporary application error; do not admit/count the new message. Exact status/code/delay mapping is a provider-documentation implementation task, not an assumed universal `429`. |
| Temporary dependency outage with no confirmed result to return | `503 result_unavailable`, manual same-request recovery. |
| Unexpected internal error with no confirmed result to return | `500 result_unavailable`, manual same-request recovery. |

When a response body can be sent, an unconfirmed-outcome error uses this envelope:

```json
{
  "requestId": "original-request-id",
  "error": {
    "code": "result_unavailable",
    "message": "Impossible de récupérer le résultat pour le moment.",
    "retryable": true,
    "retryMode": "same_request"
  }
}
```

A proxy/runtime may fail without that JSON envelope. Fetch rejection, interrupted/invalid response reading, browser timeout, or a `5xx` cannot prove that admission/finalization did not commit. Keep original request id, exact submission body, question and pending scope/display references. Core checks authenticated saved state on the manual retry; never infer “no write happened” from HTTP failure alone.

## 5. Browser retry, next-turn state and reload behavior

### Two distinct manual actions

- **Unknown outcome:** “Vérifier à nouveau” only reads authority. If an interrupted/not-found submission is confirmed, offer separate explicit same-request recovery with exact original body/question/scope, never newer draft/selection. No question-local technical retry icon for unknown outcome; verification never POSTs or consumes a turn.
- **Recorded recoverable technical failure:** accessible “Réessayer” icon **on that failed question in chat, never in composer**. Submit `{ requestId: freshId, retryOfRequestId: failedRequestId }`; Core copies original text/scope. Keep failed turn unchanged; show new admitted question once in its new position; count only on admission. No action for normal/partial/refused/clarification/unknown outcomes. Block while active/unknown processing or turn/retention/quota/original-scope availability prevents admission. Never load/read/clear/overwrite the current composer for retry.
- **Known future availability:** honor documented delay, never guess a reset, queue or auto-submit on availability return. The French user guide explains these actions; acceptance verifies agreement with runtime.

### Conversation-bound session capsule

One schema-versioned capsule per active conversation/tab, persisted atomically on state edits and before POST (not only in unload handlers):

| State | Permitted fields / owner |
| --- | --- |
| Credentials | `conversationId`, `sessionToken`; session-only, never durable Visitor identity. |
| `pendingSubmission` | Immutable exact body/requestId, original question and scope/display copy or pre-admission selection/catalog reference. Retry may copy failed-turn scope locally for waiting display only; server validates/copies authority. No answer/transcript cache. |
| `rejectedAttempt` | At most one definitively unadmitted captured body/text/selection and safe rejection code, owned by this conversation/session with its captured draft edit revision. Not a historical turn or unknown pending request, never auto-sent. Explicit discard/restoration/replacement clears it. |
| `nextTurn` | Editable unsent text, ordered unique active Resource IDs, last-known public names/catalog identity for unavailable-token display, local edit revision, composer cursor/internal-scroll position. Never auto-sent. |
| `view` | Guide expanded state, transcript reading anchor by message/block ID plus viewport offset, active-token horizontal offset, one open resource/source/privacy surface, cited block/file/expanded-row IDs and focus-trigger ID. References only, no copied excerpts/answer text. |

Explicit composer send captures text/selection in fresh pending state **synchronously**; clear only captured text then to start the next draft, leaving selection in place. Known pre-admission limits/unavailability do not clear text/selection or create pending state. For definitive server rejection after capture, automatically restore captured text if next-draft edit revision is unchanged; do not require manual restore into an untouched empty composer. If newer edits exist, preserve them and retain rejected text in `rejectedAttempt` for explicit restoration; it cannot block admission once authoritative processing permits. A definitive pre-admission rejection clears only matching `pendingSubmission` and records `rejectedAttempt`, while an unknown outcome never does. If captured text is automatically restored into an unchanged draft, no separate rejected copy is needed. Never roll back current selection changes. Unknown outcomes keep immutable pending state, not a guessed rejection. Late callbacks cannot overwrite later edits. Each resource toggle adds/removes exactly one ID/token, leaves typed text untouched/library open, and neither submits nor counts. Selection persists after send until individual removal; active insertion order does not change set identity.

Normal POST disables Send and competing retry/recovery, not draft/resource editing. Show generic badge/three-dot working state with accessible status and historical tokens from pending capture, then canonical scope from server. No normal polling/invented stages. Reading/privacy/Deletion Request controls stay available. Completion/recovery clears only matching pending state, never newer text/selection/edit revision, queues or auto-sends it. Historical tokens sit inside that question's answer container immediately before waiting/content, use saved names, have no removal, wrap on mobile and appear from waiting through interrupted/failed/completed states; global produces no token/label/band.

### Initialization and reconciliation

- Free entry opens with guide initially open, empty draft/selection and no message; suggested question creates one pending identity under ordinary admission, global selection on fresh entry. Reload never re-fires entry sends.
- Reuse valid current-tab capsule only on identified same-tab reload or still-live same-session BFCache continuation. New ordinary navigation/entry, explicit new conversation, closed/reopened/duplicated/restored-tab session, stale/malformed/wrong-version/wrong-conversation capsule starts fresh: clear credentials/pending/draft/selection/view. No opener credential reuse; external/new-tab entry uses `noopener`. Stored credentials alone do not prove active session. Navigation Timing distinguishes `navigate`/`reload`/`back_forward`, not every copied/restored-tab case; `sessionStorage` alone cannot guarantee this lifecycle ([MDN storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), [navigation types](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type), checked 2026-09-30). Implement and verify reload classification plus copied/restored-tab rejection in supported browsers before session acceptance; unresolved ambiguity is a blocker, not permission to restore prior-visit state or reset a supported ordinary reload.
- Handle blocked/failed storage defensively: no durable fallback, volatile UI only with honest reload-continuity-unavailable notice and fresh explicit entry on reload. This constrained-environment behavior needs launch evidence.
- Reload restores next draft/selection independently, disables sends until authenticated GET resolves authority, reconciles by `requestId`. Matching local pending becomes that single canonical message with saved scope; terminal receipt clears only matching pending. Restore `rejectedAttempt` separately as unadmitted UI state without a chat row or POST; if GET unexpectedly has its request ID, discard its rejection interpretation and use authoritative saved scope/state, preserving next draft. Clearing or restoring a rejected attempt never overwrites newer edits. New-session/access-loss/capsule-invalid reset clears it too. Provisional waiting row is presentation, never browser-canonical history.
- Refresh active public catalog without altering pending/history. Stable-ID renames update active labels only; unavailable active ID stays visibly unavailable/removable. Never silently drop it, substitute, or go global. Disable direct Send until explicit removal/replacement and current catalog; recovery/retry validate original scope separately.
- Restore guide/cursor/internal-scroll/token scroll and reading anchor after canonical UI/layout is ready. Reopen source viewer only if referenced block/excerpts exist, restore file expansion/focus by stable refs, never cached text. Missing anchor/trigger falls back to nearest surviving turn/neutral surface, not bottom. Panels/sheets do not reflow transcript; response never pulls a scrolled-up reader down. Exact geometry remains approved-UX implementation work, not pixel-identical mock restoration.
- Access loss clears inaccessible UI/session state and stops observation. New conversation requires explicit action and starts empty; pending text/scope never silently carries/sends into it.

After reload, GET authoritative state and reconcile by request id so the question appears once. If processing is active, show the stored transcript and pending question, keep Send disabled, and observe via non-overlapping GETs every 3 seconds for no more than 45 seconds. These GETs are side-effect-free: no message admission, lease renewal/recovery, or LLM call.

| Observation result | Browser action |
| --- | --- |
| Still active | Keep a discreet working indicator; no full chat redraw per GET. |
| Terminal result found | Show it, clear pending storage, stop observation; enable Send if other admission limits allow. |
| Interrupted/expired lease with no result | Stop observation and offer manual same-request retry, subject to current availability. |
| Request not found | Keep original envelope and offer explicit same-request submission if its catalog remains active. If stale and GET confirms request absent/no active processing, explicitly abandon that never-admitted envelope and allow a fresh-id, current-catalog send with visitor confirmation; never rewrite/resend automatically or manufacture terminal failure. |
| Network error or observation budget exhausted | Stop automatic GETs, say “Impossible de vérifier le résultat”, and offer “Vérifier à nouveau”. Do not pretend the generation ended or allow a blind competing submission while state is unknown. |
| Access unavailable | Stop observation, show the neutral message, clear inaccessible session state, offer a new conversation without auto-resubmission. |

Manual “Vérifier à nouveau” reads current state; if still active it may start another bounded observation window. It is never a hidden retry of a failed GET or generation.

## 6. Usage limits and quota boundary

| Limit | Initial policy |
| --- | --- |
| Current user message | 1,000 characters, shared browser/backend counting and validation, visible counter, no silent truncation. |
| Conversation | 20 admitted logical user messages, counted atomically at admission. Clarification replies and new-id retries count; same-id replays/recoveries, rejected submissions, GETs, and deletion requests do not. |
| New conversations | 10 per IP per UTC calendar day. A shared short-lived pseudonymous counter expires after its useful window; no raw IP in conversation rows or durable cross-visit fingerprint. |
| Conversation history in each LLM request | 3,000 tokens; the separate overall model input/output budget still applies. |

The per-IP creation counter must be enforced across Worker instances, using a trusted Cloudflare-derived client address rather than an arbitrary user-supplied header. Its exact storage/cleanup mechanism belongs to implementation. A daily pseudonymous key is still personal-data processing, not guaranteed anonymization; disclose this minimal abuse control and retain no unnecessary raw IP logs. A corporate NAT may share an IP, so the threshold stays configurable. This creation cap does not disable existing conversations, transcript reads, or deletion requests.

Quota policy is approved **in principle only**:

- No automatic paid overage or provider fallback. Verify the deployed plan's actual billing behavior before launch; code intentions alone do not establish a hard zero-cost limit.
- Confirmed unavailability suspends new affected provider calls, not reads or deletion requests. Known pre-admission exhaustion leaves the draft unadmitted and does not consume a logical turn.
- A provider refusal during an admitted turn becomes a controlled failed result if finalization succeeds; that turn remains counted. Failure to persist instead leaves an unknown outcome recoverable with the same id.
- A provider `429` may mean temporary rate limiting rather than daily exhaustion. Error codes, scope (request/model/account), reset times, `Retry-After`, cooldown behavior, quota visibility, and free-plan billing must be checked against **current official Cloudflare documentation** and adapter tests during implementation. Do not hardcode an assumed next-midnight recovery or copy provider errors to visitors.

Measure actual classifier/generator usage before adopting an additional global numeric budget. This work must not silently select a model, paid plan, rate-limit product, or new tracking mechanism.

## 7. Deletion requests and retention

The raw/derived data deadline is `conversations.created_at + 90 × 24 hours`, calculated in UTC, never end-of-calendar-day or last activity. Messages, answers, blocks, excerpts, Submitted Scope JSON/historical names/mapped IDs/catalog provenance, identities/retry links, request/attempt metadata and diagnostics share this deadline; newer rows do not extend it.

Run purge early enough to accommodate its schedule, an active lease, and failure recovery. Admission must stop soon enough near the deadline that repeated new messages/manual recovery cannot starve deletion. The exact purge cadence, early margin, and corresponding admission cutoff must be fixed and tested together during implementation, before launch. They are not permission to retain data past 90 days. Refuse access at expiry if cleanup is late; inaccessible data is not the same as deleted data, so purge failures require operator-visible diagnostics/alerts and recovery.

### Request lifecycle

- The public deletion endpoint creates or returns one request for the current conversation. Repeated submission preserves its original identity/date and never reopens a handled request.
- States are only `open` and `handled`; `handled_at` is set after confirmed removal or confirmation that the data is already absent. Failures leave the request `open`.
- Submission remains available while a generation is active and after the conversation's message cap is reached. It does not itself interrupt a generation or immediately erase data.
- Actual operator deletion is rejected as `conversation_busy` while an unexpired lease exists. Purge defers that conversation and continues others. An expired lease does not block cleanup; its old attempt cannot finalize.
- Lease checking and deletion must be atomic against new admission. Do not check “not busy” and then delete unconditionally later. Export operations also share the deletion guard below. After managed-artifact cleanup is confirmed, remove conversation/all derived records (including interrupted/failed scopes/identities/retry and operation/artifact metadata) and mark any existing deletion request handled in one guarded D1 commit, never partial database deletion/audit-success.

### Retained audit exception

Deletion-request audit metadata is retained indefinitely: request id, nullable historical conversation UUID, `created_at`, `status`, `handled_at`, and `modified_at`. No question/answer/excerpt text, Resource/scope/display/mapping data, retry history, session token, visitor identity or content diagnostics belong in this audit. Privacy copy distinguishes this narrow audit exception from the 90-day content/runtime-data limit.

### Controlled export and historical data

Operator exports include admitted question/identity/scope/version/catalog provenance, historical names/maps, retry origins/context-anchor links, outcomes and canonical citation edges/excerpt provenance (saved original chunk IDs/hashes, not live-index joins), including interrupted/failed turns. Read one consistent canonical snapshot, never re-resolve live catalog or export credentials. Include schema versions; export deletion audits separately as metadata only.

Export creation and deletion/purge share a **bounded per-conversation operation guard** in `ConversationStore`, separate from the generation lease. It has owner/kind (`exporting` or `deleting`)/expiry; only its live owner may stage/publish/register an export or finalize deletion. Export and deletion cannot overlap for that conversation; deletion acquisition also checks the generation lease and atomically blocks new admission. Deletion Request submission still remains available. No public operation route, question queue, automatic generation or new turn count. Exact guard SQL belongs to tested migrations, not a browser lock.

Default export is a transient controlled stream; persistent output is disabled unless the managed-copy lifecycle is implemented and demonstrated. If enabled, register every target/staging copy **before** writing content, retain only conversation-bound artifact location/state/owner/deadline metadata under FR-20, stage privately and publish only under the still-valid guard. Stale exporters cannot publish after expiry/deletion. Operator cleanup and scheduled purge use this same registry; arbitrary untracked destinations are not supported. The runbook must prove deletion of managed copies/staging by the conversation-created deadline, including an offline operator destination, or forbid that persistent destination. Operator output/log handling must not create untracked durable copies.

Deletion first acquires the operation guard, fences exporters/admission, removes and verifies all managed copies/staging, then performs final D1 conversation/children removal plus audit `handled` atomically under that guard. External filesystem and D1 are **not** one transaction: if cleanup, registry confirmation or final commit fails, leave audit open and recover idempotently; never report successful deletion while a managed copy survives. Operation leases expire, stale owners cannot publish/finalize, and guard scheduling/cutoffs must leave enough margin to finish cleanup before 90 days. An export cannot indefinitely defer purge or authorize deadline extension. Operation/artifact metadata is deleted with conversation data, never added to the indefinite audit. Host/provider logs/backups remain separate launch assessments; public catalog artifacts are public source data, not conversation stores.

`deletion_requests.conversation_id` is nullable and is a historical reference, not a parent-enforcing foreign key. Preserve the UUID when known; do not cascade-delete the audit, require the conversation to remain, or automatically apply `ON DELETE SET NULL`. Nullability alone would not resolve a foreign-key constraint. Public callers cannot create arbitrary orphan audits or mutate historical handled records; operations still require the valid current conversation token.

## 8. Delivery contract and story handoff

GitHub Actions is the single CI/CD orchestrator; Wrangler publishes Workers, Pages assets, migrations, and indexing changes to environment-separated Cloudflare resources. This is the selected delivery direction, not an implemented workflow. Official integration references: [Workers with GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/), [Pages Direct Upload from CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), and [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).

1. On pushes/PRs, run deterministic checks, local D1 migrations/index tests, source-safety checks, and application builds. Do not execute real LLM evaluations on every push.
2. Build index artifacts from the exact public Git snapshot and carry their source SHA/hashes as specified in the spine. Build catalog/document-ID registry/mappings from that same snapshot and verify SHA/hash parity with chunks. Publish only allowlisted assets/public index data, never the full checkout or private source directory.
3. Deploy trusted revisions automatically to preview with preview-only resources/secrets. Untrusted PR jobs must not receive deployment secrets or gain a production path.
4. Run integration/smoke checks and explicitly triggered real-model evaluations. BC manually promotes the validated revision and corresponding index artifact, not whichever commit happens to be latest later.
5. Serialize deployments per environment. For compatible changes: apply backward-compatible migrations, deploy a Worker compatible with the transition, upload and verify the matching immutable catalog asset first, then atomically activate D1 catalog pointer/mappings/registry/chunks/FTS, deploy frontend and verify stale-catalog rejection, and run post-deploy checks. An incompatible change needs an explicit migration/maintenance plan, not an assumed safe ordering.
   Asset upload precedes pointer activation even though frontend deployment follows it: the transition-compatible Worker and old frontend must tolerate the new announced artifact. If upload/reachability/hash verification fails, keep the old active publication; if D1 activation fails, leave the new asset unreferenced. Never expose a pointer to a missing/unverified asset. Rollback likewise verifies the previous asset before activating its previous catalog/index; preserve referenced assets for supported transition readers.
6. There is no atomic transaction across D1, Worker, and Pages. Roll back code/index with compatible previous artifacts; never restore the entire conversation D1 database just to undo an application deployment and thereby lose new conversations or deletion requests.

### Snapshot migration compatibility

Add versioned message scope/identity/retry fields and stable public document/resource IDs through tested migrations before enabling new frontend. Admission never writes a scope-less message; use compatibility Worker or controlled admission pause for incompatible transitions. Backfill legacy messages only from proven metadata: old question-only contract means global public scope, **not** evidence that cited files were the entire eligible registry. If original registry/provenance is reconstructible, migrate version-1 global snapshot. Otherwise store exactly `LegacyScopeUnavailable = { version: 0, mode: 'legacy_scope_unavailable' }` as the shared read/export representation (no invented IDs/catalog SHA), no historical tokens, and disable generation recovery/new-id retry from it; replay recorded results remains available. Never infer selected Resources from citations/names or turn unknown legacy scope into unbounded current global. Readers/exports explicitly recognize legacy case; new admissions accept only version 1.

No live Resource/document cascade into historical scopes/excerpts. Assign stable document IDs before renames, with version-controlled migration provenance. Test old/new readers, interrupted/failed rows, exports/deletion, stale catalog assets and code/index rollback. Rollback preserves new snapshots and rejects unsupported submissions rather than stripping scope; incompatible rollback needs maintenance/forward repair, not whole-D1 restoration.

Use scoped deployment credentials and environment-separated secrets. Validate GitHub Actions and Cloudflare plan quotas/costs for this repository before calling the pipeline zero-euro. Detailed workflow YAML, deployment commands, migration compatibility checks, health probes, credentials setup, and rollback commands belong to Delivery/Operations stories.

**Runbook documentation is part of those stories' acceptance criteria**, not optional follow-up work: preview checks, manual production promotion, release/SHA identification, post-deploy validation, failed/partial deployment recovery, code/index rollback, purge/deletion operations, and provider quota incidents. Document secret names and setup, never secret values. This companion is not that runbook and does not create the epic/stories yet.

## 9. Required verification before implementation sign-off

- Catalog generation: duplicate/nonpublic/dangling/empty mappings, shared documents/overlaps, all active Resources selectable without arbitrary cap, stable IDs across renames, coherent catalog/hash/registry/chunk publication. Edits are immediate 1:1, leave typed text untouched and never admit turns.
- Exact selected union/global admission registry; allowlist before ranking/top-k/budget, reject public-but-unselected returned/cited chunks, no Web/private/catalog/history evidence or outside-scope fallback on zero/weak matches/redirection. Follow-ups/clarifications use own scope; real-model evaluation assesses meaning separately.
- Concurrent admissions, duplicate/reordered Resource sets, same-id changed text/set/catalog identity/body variant/retry origin, expired attempt recovery, stale-worker writes/releases, replay after the turn cap, and explicit new questions after a confirmed interrupted turn without erasing/relabeling it.
- Transaction failure injection across all answer children and completion/release; exactly one canonical result or only original admitted message/identity/snapshot, with no orphan answer data.
- POST timeout, lost committed response, raw/proxy `5xx`, original-question/scope same-id recovery despite newer edits, full POST/GET/replay parity including waiting/interrupted/failed scope/citation edges, original-root-context/position recovery including interrupted retry/retry-of-retry, bounded read-only observation and access loss.
- Question-local retry icon/accessibility/user-guide agreement; absent in composer/nontechnical/unknown turns; server copies failed text/scope under fresh ID, unchanged original/newer draft/selection, no competition while active/unknown and normal admission/count/quota/retention. Unavailable original Resource/map rejects new admission without count.
- Mapping changes between admission/recovery/retry/retrieval/finalization: additions never widen, removed edges/docs/resources fail closed, renames/text changes retain IDs and separate catalog/excerpt provenance, history never rewrites. Stale-catalog rejection preserves edits and never sends.
- Reload during editing/selection/pending POST/observation/result arrival, matching-only pending cleanup, one row/request and no entry/send replay. Restore guide/anchor/focus/surface/source-row/composer/token-scroll refs without transcript cache/forced bottom. Invalid active tokens remain removable and block Send. Fresh navigation/session/new conversation/copied/restored tabs clear; test storage denial/corrupt capsules/BFCache and browser ambiguity without durable fallback.
- 1,000-character boundaries, 20-turn accounting, atomic daily creation cap including UTC rollover/shared-IP behavior, and cleanup of temporary pseudonymous counters.
- Migration/backfill/exact legacy-unavailable readers/retry prohibition, historical chunk ID/hash/title/section loading and retention with text/revision after reindex/removal, legacy nullable-provenance/grouping fallback, canonical digest/golden vectors and asset-before-pointer activation/rollback failure injection.
- Versioned exports including interrupted/failed scope; export/deletion/admission races, consistent snapshot/staging/registration, expired exporter fencing, managed-copy failure leaving audit open, bounded operation guards and deadline/cleanup proof before persistent export. Atomic scope/identity/citation deletion with no scope/operation/artifact data in indefinite audit; rejected-attempt reload/clearing preserves newer edits and never creates a chat row/send.
- Retention deadline, admission cutoff, active-lease deletion deferral, stale-attempt fencing, null/historical audit references, idempotent deletion requests, atomic handled transition, and purge failure visibility.
- SHA/index publication consistency, original-language historical excerpts after reindex, preview/production isolation, and promotion/rollback without deleting live conversation state.
- Provider-specific rate/quota/timeout/billing cases grounded in current Cloudflare documentation, with safe unknown-error behavior and no automatic retry/fallback.

No runtime tests, browser/accessibility audits, real-model evaluations, pipeline jobs, migrations, exports or purge operations are implemented or executed by this documentation update.
