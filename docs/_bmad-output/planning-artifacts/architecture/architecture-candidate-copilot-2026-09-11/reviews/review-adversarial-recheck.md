# Review — Adversarial Seam Recheck After Fixes

Scope: targeted recheck of `ARCHITECTURE-SPINE.md` after the prior adversarial seam review. Requested `/home/cvc/dev/candidate-copilot/plan.md` and `/home/cvc/dev/candidate-copilot/progress.md` were not present, so this review uses the current spine and prior seam-review artifacts in the architecture reviews directory.

## Review

- **Correct:** The persisted block-to-excerpt citation seam is resolved at the architecture-spine level. AD-5 now makes block-to-excerpt edges canonical persisted data, not UI decoration (`ARCHITECTURE-SPINE.md:65-69`), and the core data shape now includes `answer_block_sources` joining `answer_blocks` to `source_excerpts` (`ARCHITECTURE-SPINE.md:207-248`). This closes the prior gap where a live response could carry paragraph citations that D1 could not reconstruct later.

- **Correct:** The message/turn identity and concurrency seam is resolved at the architecture-spine level. AD-10 now requires every user message to create a turn identity pairing the stored user message, answer, answer blocks, and excerpts, and requires same-conversation concurrent posts to be rejected, serialized, or idempotently correlated so transcripts remain pairable (`ARCHITECTURE-SPINE.md:95-99`). That rule prevents the prior legal-but-unpairable transcript race.

- **Correct:** The deletion-request ownership/audit-retention seam is resolved at the architecture-spine level. AD-12 now requires `deletion_requests` to store metadata only, retain those records indefinitely, include `created_at`, `status`, `handled_at`, and `modified_at`, and place deletion-request status values/transitions under application/operator ownership with launch-gate coverage and a configured operator review cadence (`ARCHITECTURE-SPINE.md:107-111`). The conventions also define an application-owned status enum and restrict status transitions to operator/application paths (`ARCHITECTURE-SPINE.md:127-138`). This closes the prior audit-loss and uncontrolled-status-mutation seam.

- **Correct:** The canonical source chunk/index metadata seam is resolved at the architecture-spine level. AD-7 now requires indexer, retriever, launch gate, answer service, and operator exports to share one canonical source-document/source-chunk metadata contract covering source path, document identity, chunk identity, content hash, public frontmatter, and location (`ARCHITECTURE-SPINE.md:77-81`). The core data shape now includes source-document and source-chunk fields for `source_path`, `document_id`, `content_hash`, `location`, and metadata (`ARCHITECTURE-SPINE.md:265-279`), while AD-13 keeps the launch gate focused on public-only index/build inputs, D1 `sourcePath`s, responses, and exports (`ARCHITECTURE-SPINE.md:113-117`).

- **Note:** No remaining high/critical seam holes were found in the four requested areas. The detailed migration/API contracts still need to implement the spine rules exactly, but the previous architecture-level gaps are now closed by binding AD/convention language.

## Verdict

Pass for the targeted adversarial recheck. The prior high/critical seams are resolved in the architecture spine; no new high/critical seam hole was verified in scope.
