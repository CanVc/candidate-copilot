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
extending it on activity. Message/answer/lease schema and physical purge are
later-story work, not speculative tables in this migration.

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
