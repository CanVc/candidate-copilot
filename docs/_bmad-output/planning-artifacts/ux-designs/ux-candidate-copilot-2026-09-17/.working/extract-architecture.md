# UX-Relevant Architecture Extraction

Sources:
- `[ARCH]` `/home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md`
- `[RUNTIME]` `/home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md`

## UI framework/system
- Browser UI is React/Vite, TypeScript full-stack; frontend lives in `src/web`. Source: `[ARCH]`
- Styling uses native structured CSS with design tokens; Tailwind is deferred. Source: `[ARCH]`
- V1 UI copy is French-only; answers follow the recruiter question language where practical; Source Excerpts remain in original source language. Source: `[ARCH]`
- Browser is an untrusted presentation adapter: it presents UI, submits input, and renders model output as untrusted text, never trusted HTML. Source: `[ARCH]`, `[RUNTIME]`

## App surfaces/routes
- Public API routes: `POST /api/conversations`, `GET /api/conversations/:id`, `POST /api/conversations/:id/messages`, `POST /api/conversations/:id/deletion-request`, `GET /api/health`. Source: `[ARCH]`, `[RUNTIME]`
- `POST /api/conversations` returns `{ conversationId, sessionToken }`; V1 requires a visible Conversation UUID. Source: `[RUNTIME]`, `[ARCH]`
- Message POST returns one complete structured result after finalization; no streaming. Source: `[ARCH]`, `[RUNTIME]`
- GET conversation returns ordered transcript, recorded results, processing state, whether a new message is admissible, and reason when not. Source: `[RUNTIME]`
- Deletion request surface is in-app, authenticated, idempotent, and not blocked by active generation or turn cap. Source: `[RUNTIME]`
- No public listing/search of conversations, no public admin dashboard, and no admin HTTP endpoint; operator access is local CLI/scripts only. Source: `[ARCH]`
- Public access is through an unlisted custom-domain route with easy slug plus `noindex`/robots controls; slug is not security. Source: `[ARCH]`

## Data/runtime constraints
- D1 is canonical for conversations, transcript, processing state, answers, citations, deletion audits, diagnostics, retention timestamps, and public FTS index. Source: `[ARCH]`
- Browser storage is limited to current-tab/session `conversationId`, `sessionToken`, and temporary `pendingRequest = { requestId, question }` while outcome is unknown. Source: `[ARCH]`, `[RUNTIME]`
- No durable `localStorage` restoration, no account-like cross-visit identifier, and no browser-owned canonical transcript. Source: `[ARCH]`, `[RUNTIME]`
- One processing request per conversation: active same request returns `409 request_in_progress`; another active request returns `409 conversation_busy`; no queue. Source: `[ARCH]`, `[RUNTIME]`
- `requestId` is browser-generated logical submission id; same id/content replays/recoveries reuse the original message; same id/different content is `409 request_conflict`. Source: `[RUNTIME]`
- Limits: 1,000 chars per current user message, 20 admitted logical user messages per conversation, 10 new conversations per IP per UTC day, 3,000-token history cap per LLM request. Source: `[ARCH]`, `[RUNTIME]`
- Public content/evidence can only come from `content/public/**/*.md`; runtime source paths/citations must start with `content/public/`. Source: `[ARCH]`

## Auth/security/privacy constraints affecting UX
- Conversations are anonymous and token-scoped, not account-authenticated; all conversation access uses HTTPS `Authorization: Bearer <sessionToken>`. Source: `[ARCH]`, `[RUNTIME]`
- Tokens must not enter URLs, logs, analytics, model prompts, or operator exports; only token hash is stored server-side. Source: `[RUNTIME]`
- Neutral access failure: `401 conversation_unavailable` for missing/invalid credentials and inaccessible/expired/deleted conversations; UI copy: “Cette conversation n’est plus accessible. Vous pouvez en démarrer une nouvelle.” Source: `[RUNTIME]`
- Raw/derived conversation data deadline is `conversations.created_at + 90 × 24 hours` UTC, not extended by activity. Source: `[ARCH]`, `[RUNTIME]`
- Deletion-request audit metadata is retained indefinitely, but without question/answer/excerpt text, session token, visitor identity, or content diagnostics; privacy copy must distinguish this exception. Source: `[RUNTIME]`
- Creation rate limiting uses a short-lived pseudonymous per-IP counter; disclose minimal abuse control and avoid durable fingerprint/raw IP in conversation rows. Source: `[ARCH]`, `[RUNTIME]`
- Public errors must not expose stack traces, raw provider errors, SQL errors, hidden prompts, secrets, or raw model/provider output. Source: `[ARCH]`, `[RUNTIME]`

## AI/LLM behaviors and states
- Backend owns scope validation, retrieval, prompt assembly, LLM calls, response shaping, persistence, throttling, deadlines, quota handling, and validation. Source: `[ARCH]`
- Each admitted question goes through classifier decision: `answer`, `redirect`, `refuse`, or `clarify`; classifier also returns `reasonCode` and `responseLanguage`. Source: `[ARCH]`
- `clarify` returns a short clarification without retrieval/generation and persists `answers.status = 'clarification'` with a `kind = 'clarification'` block. Source: `[ARCH]`
- `refuse` returns professional refusal without retrieval; `redirect` searches only permitted professional angle and states boundary. Source: `[ARCH]`
- Retrieval is D1 FTS over deterministic public Markdown chunks; no retrieved chunks means controlled missing-evidence response, not proof of absence. Source: `[ARCH]`
- Answer result statuses exposed to UI/API: `answered`, `partial`, `refused`, `clarification`, `failed`. Source: `[ARCH]`, `[RUNTIME]`
- Answers are structured blocks, not free-form Markdown; factual `paragraph` and `summary` blocks require current response-local citation ids. Source: `[ARCH]`
- `sourceExcerpts` include response-local id, public source path, source revision, excerpt text, and location; excerpts are reconstructed from retrieved public chunks, not model-authored. Source: `[ARCH]`, `[RUNTIME]`
- No automatic LLM/browser retries, no repair/regeneration call, no provider failover, and no paid overage. Source: `[ARCH]`, `[RUNTIME]`

## Local/offline behavior
- No offline-first or durable local transcript behavior is specified; D1 remains canonical and the browser only keeps session-scoped state. Source: `[ARCH]`, `[RUNTIME]`
- On reload, UI must GET authoritative state, reconcile by `requestId`, and show the question once. Source: `[RUNTIME]`
- If processing is active after reload, observe via non-overlapping GETs every 3 seconds for at most 45 seconds; these reads must not admit messages, renew leases, recover work, or call LLMs. Source: `[RUNTIME]`
- If observation cannot verify result, UI says “Impossible de vérifier le résultat” and offers “Vérifier à nouveau”; it must not pretend generation ended or allow blind competing submission while state is unknown. Source: `[RUNTIME]`

## Error handling
- Public API errors use normalized professional shapes; recorded turn outcomes, including controlled technical failure, return `200` with canonical result. Source: `[ARCH]`, `[RUNTIME]`
- Unconfirmed outcome errors use `result_unavailable` with `retryable: true` and `retryMode: 'same_request'` when a body can be sent. Source: `[RUNTIME]`
- Failed recorded result exposes persisted application error metadata: `{ code, message, retryable, retryMode }`; retryable recorded failure uses `retryMode: 'new_request'`. Source: `[RUNTIME]`
- Malformed/overlength input returns `400 invalid_request` with safe actionable message and no truncation. Source: `[RUNTIME]`
- Turn cap returns `429 turn_limit_reached`; creation cap returns `429 rate_limited` with `Retry-After` until next UTC day; reads and deletion requests remain available. Source: `[RUNTIME]`
- Fetch rejection, invalid response, browser timeout, or `5xx` cannot prove no write committed; UI must keep original request id/question for manual recovery. Source: `[RUNTIME]`
- Normal answers, partial answers, business refusals, and clarifications are not technical failures and do not get retry buttons. Source: `[RUNTIME]`

## Performance constraints
- Initial budgets: 30s backend attempt, classifier max 5s within it, about 2s reserved for finalization, 40s processing lease, 45s browser POST wait. Source: `[ARCH]`, `[RUNTIME]`
- During normal POST, show generic working indicator and disable Send; no polling is needed. Source: `[RUNTIME]`
- Reload observation: every 3s, max 45s, non-overlapping GETs; keep discreet indicator and avoid full chat redraw per GET. Source: `[RUNTIME]`
- Backend returns complete JSON after validation and atomic finalization; no streaming and no unchecked/uncommitted draft returned as completed turn. Source: `[ARCH]`, `[RUNTIME]`
- Before each operation, Core checks remaining overall budget; timeouts attempt controlled failure persistence if possible. Source: `[RUNTIME]`

## Implementation contracts constraining components/interactions
- Shared API/domain contract types live outside frontend-only and adapter-only code; Hono routes are thin HTTP adapters. Source: `[ARCH]`
- UI must reconstruct/display completed turns from canonical result schema with block order, `sourceIds`, full Source Excerpts/revisions, language, status, and failure metadata; GET and POST/replay schemas must match. Source: `[RUNTIME]`
- UI must distinguish GET states `completed`, `in_progress`, and `interrupted`; it must not infer terminal status from missing text or expose internal attempt-owner ids. Source: `[RUNTIME]`
- Send-button disabling is only UX aid, not concurrency protection; server/D1 lease is authoritative. Source: `[RUNTIME]`
- Preserve draft and keep transcript reading/deletion-request controls available during normal POST. Source: `[RUNTIME]`
- Unknown-outcome manual retry resends same `requestId` and exact question; recorded recoverable failure retry creates a new `requestId` and a new visible turn. Source: `[RUNTIME]`
- Explicit retry of normal answers, partial answers, refusals, or clarifications is not part of the contract. Source: `[RUNTIME]`
- Source citations are canonical persisted edges between answer blocks and Source Excerpts; frontend must not invent citations or treat whole-answer citation lists as sufficient. Source: `[ARCH]`
