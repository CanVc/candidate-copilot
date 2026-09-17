---
name: candidate-copilot-v1-runtime-contracts
type: architecture-companion
status: final
created: 2026-09-17
updated: 2026-09-17
binds:
  - ARCHITECTURE-SPINE.md AD-8, AD-10, AD-12, AD-14, AD-15, AD-16
---

# Runtime and Delivery Contracts — Candidate Copilot V1

This companion completes [ARCHITECTURE-SPINE.md](ARCHITECTURE-SPINE.md). These are approved application contracts and initial configuration values, not implemented code, measured performance, provider guarantees, or an operator runbook. Shared types, SQL, tests, and delivery stories must preserve them.

## 1. Turn admission, identity, and ownership

A logical submission has a browser-generated `requestId`, unique within its conversation. A processing execution has a distinct server-generated `processing_attempt_id`. Replaying a logical submission keeps its request id; recovering an expired execution creates a new attempt id.

Core authenticates the conversation before looking up a request or returning a saved result. The admitted question is immutable for that request id. Reusing the same id with different question content is a conflict, not an update.

| Existing state | Action |
| --- | --- |
| Same request id and content, result recorded | Return the recorded outcome without another message, turn count, or LLM call. |
| Same request id and content, unexpired processing lease | Return `409 request_in_progress`; do not start another execution. |
| Same request id and content, no result, expired/lost lease, conversation available | On manual retry, reuse the admitted message and acquire a fresh attempt lease. |
| Same request id, different content | Return `409 request_conflict`. |
| Another request owns an unexpired lease | Return `409 conversation_busy`; no queue and no new message. |
| Unknown request id, conversation available | Validate limits and atomically acquire a lease with admission of one user message. |

An expired earlier request does not authorize taking over another request's active lease. An interrupted message alone does not keep the conversation busy forever: once the server confirms there is no active lease, a deliberately new question may be admitted under a new id and normal limits. It neither recovers nor erases the older interrupted message. A retry of the unknown-outcome submission itself must still keep its original id; the UI must not silently turn recovery into a new question. Recovering an older message uses context preceding that original message, not later turns, and keeps the resulting answer attached to its original place in the transcript.

Replay of a recorded outcome and recovery of an already admitted message are not new logical turns and must not be rejected merely because the conversation has reached its turn cap. Access expiry, deletion, or known provider unavailability still prevent new processing; recovering a saved result needs no provider call.

D1 is authoritative across Worker instances. Checking availability and acquiring the lease are one atomic operation, not a read followed by an unconditional write. `processing_request_id`, `processing_attempt_id`, and `processing_until` identify the current owner and deadline; a redundant conversation `isProcessing`/business status is unnecessary. Only the matching unexpired attempt may finalize or release the lease. Browser button disabling is a UX aid, not concurrency protection.

## 2. Atomic finalization and failure recovery

The original user message is committed at admission. After a draft passes mechanical validation, finalization is one guarded D1 transaction:

1. Verify that the conversation still exists, is accessible under retention policy, and has the matching unexpired attempt lease.
2. Insert the canonical answer, its blocks, Source Excerpts, citation edges, and associated outcome metadata.
3. Make the request terminal and release its processing lease in the same transaction.

In the structural seed, the unique answer linked by `answers.message_id` is the durable completion marker; its absence means no terminal result has been committed. Do not maintain a second independently writable completion flag. Uniqueness of `(conversation_id, request_id)` for admitted user messages and of `answers.message_id` prevents duplicate logical messages and answers.

If finalization fails, none of the answer data or completion/release changes survive. Only the admitted original user message remains as business content; lease/control metadata may remain until expiry. A recoverable failure that is successfully finalized is instead a terminal `failed` answer, with application-owned error code/retryability and a professional message. Canonical failure metadata must be persisted so a replay returns the same outcome rather than reconstructing a different error from current provider state.

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

Browser storage is limited to current-tab/session `conversationId`, `sessionToken`, and temporary `pendingRequest = { requestId, question }` while a submission's outcome is unknown. D1 remains the canonical transcript; no durable `localStorage` restoration or account-like cross-visit identifier. Remove the pending request on terminal-result receipt, and clear stale session/pending state on access loss. Session storage is JavaScript-readable: escape/render model output as untrusted text, never trusted HTML, and cover script-injection paths in tests.

### Routes and payloads

| Route | Contract |
| --- | --- |
| `POST /api/conversations` | Apply creation rate limit; return `{ conversationId, sessionToken }`. No token is required before a conversation exists. |
| `POST /api/conversations/:id/messages` | Authenticated body `{ requestId, question }`; return one complete structured result after finalization, no streaming. |
| `GET /api/conversations/:id` | Authenticated ordered transcript including each admitted message's `messageId`, `requestId`, question, timestamp, recorded result when present, and processing state. Also expose whether a new message is currently admissible and the applicable reason when not. |
| `POST /api/conversations/:id/deletion-request` | Authenticated, idempotent request for this conversation; return request identity/state and honest manual-processing confirmation. It is not blocked by an active generation. |
| `GET /api/health` | Minimal non-sensitive health response; no transcript, credentials, or administrative diagnostics. |

A message result envelope carries `requestId`, `messageId`, `answerId`, `status`, `language`, `blocks`, and `sourceExcerpts`. Its answer/block/source meanings are those in the spine. `status` is `answered`, `partial`, `refused`, `clarification`, or `failed`. A failed result also has persisted application error metadata exposed as `error: { code, message, retryable, retryMode }`; a retryable recorded failure uses `retryMode: 'new_request'`, otherwise `'none'`. Refusals, partial answers, and clarifications are business results, not technical failures.

Each completed turn returned by GET must use the same canonical result schema as POST/replay, including block order, `sourceIds`, full Source Excerpts and their revisions, language, status, and persisted failure metadata. Reconstruct it from `answers`, `answer_blocks`, `answer_block_sources`, and `source_excerpts`; returning only answer text/status is not sufficient.

A GET distinguishes `completed` (recorded answer), `in_progress` (matching unexpired lease), and `interrupted` (admitted message without answer or active matching lease). Do not expose internal attempt-owner identifiers or require the browser to infer terminal status from a missing text field. Known provider or admission limits can temporarily prevent resuming an interrupted turn; the server remains authoritative.

### HTTP outcomes

| Situation | HTTP / application outcome |
| --- | --- |
| Recorded turn outcome, including controlled technical failure | `200` with the canonical result. Same-id replay returns that result without calling the LLM. |
| Same logical request actively processing | `409 request_in_progress`. |
| Another request owns the conversation | `409 conversation_busy`; a rejected new message stays in the browser draft. |
| Same request id with different question | `409 request_conflict`; no automatic substitution of a new id. |
| Malformed/overlength input | `400 invalid_request`, with a safe actionable message and no truncation. |
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

A proxy/runtime may fail without that JSON envelope. Fetch rejection, interrupted/invalid response reading, browser timeout, or a `5xx` cannot prove that admission/finalization did not commit. Keep the original request id and question. Core checks authenticated saved state on the manual retry; never infer “no write happened” from HTTP failure alone.

## 5. Browser retry and reload behavior

The button can always be labeled “Réessayer”; the identity rule depends on what is known:

- **Unknown outcome:** manual resend of the same request id and exact question. Recover saved/in-progress state or acquire a new attempt for an expired interrupted submission without duplicating the original message.
- **Received, recorded recoverable failure:** explicit manual submission of the same text with a new request id. This creates a new admitted message/turn, visible as a new attempt in the transcript. No retry button for normal answers, partial answers, business refusals, or clarifications.
- **Known future availability:** honor the application's documented delay before offering another generation; do not guess a reset time or auto-submit at expiry.

During a normal POST, show a generic working indicator and disable Send, without pretending to know backend stages; no polling is needed. Preserve the draft and keep transcript reading/deletion-request controls available.

After reload, GET authoritative state and reconcile by request id so the question appears once. If processing is active, show the stored transcript and pending question, keep Send disabled, and observe via non-overlapping GETs every 3 seconds for no more than 45 seconds. These GETs are side-effect-free: no message admission, lease renewal/recovery, or LLM call.

| Observation result | Browser action |
| --- | --- |
| Still active | Keep a discreet working indicator; no full chat redraw per GET. |
| Terminal result found | Show it, clear pending storage, stop observation; enable Send if other admission limits allow. |
| Interrupted/expired lease with no result | Stop observation and offer manual same-request retry, subject to current availability. |
| Request not found | Keep the unsent/unknown pending envelope and offer manual same-request submission; never manufacture a terminal failure. |
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

The raw/derived data deadline is `conversations.created_at + 90 × 24 hours`, calculated in UTC, never end-of-calendar-day or last activity. Messages, answers, blocks, excerpts, request/attempt metadata, and conversation diagnostics share this deadline; newer rows do not extend it.

Run purge early enough to accommodate its schedule, an active lease, and failure recovery. Admission must stop soon enough near the deadline that repeated new messages/manual recovery cannot starve deletion. The exact purge cadence, early margin, and corresponding admission cutoff must be fixed and tested together during implementation, before launch. They are not permission to retain data past 90 days. Refuse access at expiry if cleanup is late; inaccessible data is not the same as deleted data, so purge failures require operator-visible diagnostics/alerts and recovery.

### Request lifecycle

- The public deletion endpoint creates or returns one request for the current conversation. Repeated submission preserves its original identity/date and never reopens a handled request.
- States are only `open` and `handled`; `handled_at` is set after confirmed removal or confirmation that the data is already absent. Failures leave the request `open`.
- Submission remains available while a generation is active and after the conversation's message cap is reached. It does not itself interrupt a generation or immediately erase data.
- Actual operator deletion is rejected as `conversation_busy` while an unexpired lease exists. Purge defers that conversation and continues others. An expired lease does not block cleanup; its old attempt cannot finalize.
- Lease checking and deletion must be atomic against new admission. Do not check “not busy” and then delete unconditionally later. Remove the conversation and all its derived records and mark any existing deletion request handled together, with no partial deletion/audit-success state.

### Retained audit exception

Deletion-request audit metadata is retained indefinitely: request id, nullable historical conversation UUID, `created_at`, `status`, `handled_at`, and `modified_at`. No question/answer/excerpt text, session token, visitor identity, or conversation-content diagnostics belong in this audit. The PRD and privacy copy must distinguish this narrow exception from the 90-day limit on conversation content and other derived runtime data.

`deletion_requests.conversation_id` is nullable and is a historical reference, not a parent-enforcing foreign key. Preserve the UUID when known; do not cascade-delete the audit, require the conversation to remain, or automatically apply `ON DELETE SET NULL`. Nullability alone would not resolve a foreign-key constraint. Public callers cannot create arbitrary orphan audits or mutate historical handled records; operations still require the valid current conversation token.

## 8. Delivery contract and story handoff

GitHub Actions is the single CI/CD orchestrator; Wrangler publishes Workers, Pages assets, migrations, and indexing changes to environment-separated Cloudflare resources. This is the selected delivery direction, not an implemented workflow. Official integration references: [Workers with GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/), [Pages Direct Upload from CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), and [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).

1. On pushes/PRs, run deterministic checks, local D1 migrations/index tests, source-safety checks, and application builds. Do not execute real LLM evaluations on every push.
2. Build index artifacts from the exact public Git snapshot and carry their source SHA/hashes as specified in the spine. Publish only allowlisted assets/public index data, never the full checkout or private source directory.
3. Deploy trusted revisions automatically to preview with preview-only resources/secrets. Untrusted PR jobs must not receive deployment secrets or gain a production path.
4. Run integration/smoke checks and explicitly triggered real-model evaluations. BC manually promotes the validated revision and corresponding index artifact, not whichever commit happens to be latest later.
5. Serialize deployments per environment. For compatible changes: apply backward-compatible migrations, deploy a Worker compatible with the transition, publish a consistent index update, deploy the frontend, and run post-deploy checks. An incompatible change needs an explicit migration/maintenance plan, not an assumed safe ordering.
6. There is no atomic transaction across D1, Worker, and Pages. Roll back code/index with compatible previous artifacts; never restore the entire conversation D1 database just to undo an application deployment and thereby lose new conversations or deletion requests.

Use scoped deployment credentials and environment-separated secrets. Validate GitHub Actions and Cloudflare plan quotas/costs for this repository before calling the pipeline zero-euro. Detailed workflow YAML, deployment commands, migration compatibility checks, health probes, credentials setup, and rollback commands belong to Delivery/Operations stories.

**Runbook documentation is part of those stories' acceptance criteria**, not optional follow-up work: preview checks, manual production promotion, release/SHA identification, post-deploy validation, failed/partial deployment recovery, code/index rollback, purge/deletion operations, and provider quota incidents. Document secret names and setup, never secret values. This companion is not that runbook and does not create the epic/stories yet.

## 9. Required verification before implementation sign-off

- Concurrent admissions, duplicate/reordered requests, same-id changed content, expired attempt recovery, stale-worker writes/releases, replay after the turn cap, and explicit new questions after a confirmed interrupted turn without erasing/relabeling it.
- Transaction failure injection across all answer children and completion/release; exactly one canonical result or only the original admitted message, with no orphan answer data.
- POST timeout, lost response after successful commit, raw/proxy `5xx`, manual same-id vs new-id retry, complete POST/GET/replay result parity including citation edges, original-context recovery, reload reconciliation, bounded side-effect-free GET observation, and access loss.
- 1,000-character boundaries, 20-turn accounting, atomic daily creation cap including UTC rollover/shared-IP behavior, and cleanup of temporary pseudonymous counters.
- Retention deadline, admission cutoff, active-lease deletion deferral, stale-attempt fencing, null/historical audit references, idempotent deletion requests, atomic handled transition, and purge failure visibility.
- SHA/index publication consistency, original-language historical excerpts after reindex, preview/production isolation, and promotion/rollback without deleting live conversation state.
- Provider-specific rate/quota/timeout/billing cases grounded in current Cloudflare documentation, with safe unknown-error behavior and no automatic retry/fallback.

No runtime tests, real-model evaluations, pipeline jobs, or purge operations are implemented or executed by this documentation consolidation.
