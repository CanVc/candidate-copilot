# Local D1 migrations

Run `npm run db:init` from the repository root. This applies pending SQL through
Wrangler's own local migration mechanism, then checks SQL access and the exact
`0001_local_bootstrap.sql` marker in Wrangler's `d1_migrations` ledger. Rerunning
preserves existing data and applies only pending migrations; it never resets.

`0001_local_bootstrap.sql` is deliberately schema-free (`SELECT 1`). Wrangler
creates/manages its ledger and SQLite metadata; there are no business tables or
custom migration engine. Do not edit, rename or reorder an applied migration.
Add reviewed, ordered, uniquely numbered SQL files for subsequent changes.

The guarded commands accept no target/environment overrides. They use only the
repository's `DB` / `candidate-copilot-local` binding and local state under
`.wrangler/state/v3/d1`. No account, credentials or hosted database is required.
See [application.md](../docs/development/application.md) for checks, diagnosis,
and the explicitly destructive, manual local-only reset procedure.
