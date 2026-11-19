# Local D1 migrations

Run `npm run db:init` from the repository root. This applies pending SQL through
Wrangler's own local migration mechanism, then checks SQL access and the exact
`0001_local_bootstrap.sql` marker in Wrangler's `d1_migrations` ledger. Rerunning
preserves existing data and applies only pending migrations; it never resets.

`0001_local_bootstrap.sql` is deliberately schema-free (`SELECT 1`).
`0002_public_publication.sql` adds public publication/index tables.
`0003_conversations.sql` adds only conversation UUID, unique SHA-256 token hash
and UTC creation/modification timestamps; raw tokens are never persisted.
Conversation reads enforce the creation-based 90 × 24-hour deadline, without
extending it on activity. Message/lease schema is added separately by 0005;
0006 adds canonical results; physical purge remains later-story work.

`0004_conversation_creation_limits.sql` adds the isolated daily-key singleton
and pseudonymous creation counters (no address or Conversation linkage). The
migration seeds only a nonvisitor day watermark; request code never recreates a
missing singleton. Keys are 256 random bits generated at conditional daily
initialization/rollover. Counters and keys expire at the next UTC midnight; the
minute Cron handler physically deletes counters and erases keys atomically,
retaining the operational watermark. Scheduler/outage delays can leave expired
physical rows; expiry is not proof of erasure or backup deletion. See the Story
2.6 processing/topology limitations in application.md. Do not repair corrupted
operator state by silently reseeding keys/counters. This story applies migrations
only to disposable fixtures, never operator storage.

`0005_conversation_admission.sql` adds only immutable `messages` (unique
Conversation/request and ordered position, exact text/canonical identity, JSON
global scope and self context anchor) and `conversation_processing_leases`
(one current internal request/attempt/deadline per Conversation). A deferred
same-Conversation message FK permits lease acquisition followed by message
insertion in one D1 batch; a failed write rolls both back. An UPDATE trigger
protects message snapshots. There is no live-publication FK, result table,
completion flag or redundant count. Parent deletion cascades these content/control
rows, but this is not a purge implementation or operator-deletion workflow.
The 90-day creation deadline is not extended by new messages/recovery.

Apply 0005 before running the new reader/service. It is additive and migration
reruns preserve existing identity/counter/publication rows and admitted messages.
Never roll back by deleting snapshots or restoring an older whole database.
An older identity-only reader cannot display admitted messages: use a compatible
reader or pause that old application and forward-repair; retaining schema/data is
not a claim of old-reader transcript compatibility. Story 2.7 tests only apply
migrations to disposable fixtures. See the focused verification commands in
[application.md](../docs/development/application.md#owner-verification-of-story-27).

`0006_conversation_results.sql` adds the unique terminal `answers` row per
message, ordered `answer_blocks` and `source_excerpts`, and ordered
`answer_block_sources` with same-answer composite foreign keys and an
answer-leading citation lookup index (verified using the actual D1 query plan). The answer stores
actual declared language and complete failure JSON (code, message, retryable,
retryMode); `scope_unavailable` is constrained to false/none. Historical excerpts
have no live-index FK. All result rows cascade only with Conversation-owned data.
The store commits answer/children/metadata/modified timestamp/same-owner lease
release in one ownership/retention-guarded batch, with factual membership checked
against the coherent current publication rather than old evidence text equality.

Apply 0006 before using the result-aware reader/POST service. It is additive;
existing admitted messages/scopes/anchors and publication/counters are unchanged.
A pre-0006 reader cannot recognize completed results: do not roll it back into
serving traffic or let it reacquire terminal messages. Use compatible code or
pause/forward-repair, never erase results or restore the whole Conversation DB.
Implementation verification applies migrations only to disposable D1 and proves
rerun preservation, every-write rollback and historical evidence after publication
changes. No operator migration, purge or deployment was performed. See
[Story 2.8 verification](../docs/development/application.md#owner-verification-of-story-28).

Wrangler creates/manages its ledger and SQLite metadata; there is no custom
migration engine. Conversation and existing unrelated data/ledger preservation
on reruns are verified against disposable actual D1 in `conversations.spec.ts`
and `d1.spec.ts`. No operator migration was applied for Story 2.5.
Do not edit, rename or reorder an applied migration.
Add reviewed, ordered, uniquely numbered SQL files for subsequent changes.

The guarded commands accept no target/environment overrides. They use only the
repository's `DB` / `candidate-copilot-local` binding and local state under
`.wrangler/state/v3/d1`. No account, credentials or hosted database is required.
See [application.md](../docs/development/application.md) for checks, diagnosis,
and the explicitly destructive, manual local-only reset procedure.
