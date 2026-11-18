# Read-only public-source gate

```bash
npm run content:check
npm run content:check -- --revision <full-commit>
npm run content:check -- --help
```

The CLI resolves its own repository, independent of the current directory. No source/root override exists. The reusable `validatePublicContent(repositoryRoot, options)` tooling adapter permits disposable repository tests; it always collects only that repository's `content/public/**/*.md`. It never follows Markdown links or reads private sources, promotes documents, indexes, calls application models, modifies D1 or deploys. Ordinary non-Markdown files are ineligible. Filesystem symlinks, hard-linked files and special entries are rejected, including at public-directory boundaries. On Linux (the reference Ubuntu/WSL environment), traversal pins directory descriptors from `/` through each ancestor and uses no-follow descriptor-relative opens, including for policy reads. Inode/type checks and file-link checks reject raced replacements without depending on unrelated directory link counts; every handle is closed. Source UTF-8 is decoded strictly; invalid encoding fails closed. Unsupported platforms or unavailable procfs fail closed.

Output is JSON with `ok`, Markdown `count`, `sourceRevision` and `diagnostics`. A rejected input exits nonzero. Diagnostics expose fixed codes, document ordinals (sorted traversal; rejected filesystem entries also reserve ordinals) and allowlisted metadata fields, never filenames, source values, parser excerpts or symlink targets. Collection/policy/revision errors use a null ordinal. No README exemption exists: an unapproved placeholder fails with `FRONTMATTER_INVALID` (and a private-path marker diagnostic when present). Guidance lives in `content/README.md`, outside eligible Markdown. An empty corpus also fails.

Required metadata: unique nonblank string `document_id`, `visibility: public`, nonblank string `title` and `reviewed_by`, and quoted calendar-valid UTC seconds for `created_at`, `modified_at`, `reviewed_at` (`YYYY-MM-DDTHH:mm:ssZ`). YAML duplicate keys, aliases and explicit tags are rejected before schema checks. No other metadata keys are accepted except optional string lists `topics`/`aliases` and Resource descriptor fields: strings `resource_id`, `resource_name`, `resource_description` and string list `document_ids`. Descriptor validation is shape-only, not Resource mapping validation; private sidecar fields and unknown keys fail without disclosing their names. IDs survive renames; the tool does not generate IDs or prove historical nonrecycling. Date syntax cannot authenticate an actual event. Shape checks do not establish factual titles, real reviewers or human approval. For the approved synthetic development copies, `reviewed_at` records BC’s final review of the prepared development revision, including metadata/warning updates, observed at `2026-11-18T08:45:47Z`; it is not an invented historical first review. Real replacements require their own actual approvals.

Without `--revision`, even a successful run reports `sourceRevision: null`: no commit claim. With a full commit object ID (40 hex characters, or 64 for SHA-256 repositories), success additionally requires exactly the same complete public Markdown file set and raw bytes as that commit. Dirty, staged, untracked, removed or renamed Markdown cannot be labeled as the old snapshot. Unrelated application changes and ordinary non-Markdown files are not source verification and do not block a matching snapshot. A revision is never reported on any failure. Before any success, the gate rechecks file size/modification/change observations, exact bytes and complete Markdown membership through pinned descriptors, after Git checks when requested. Observed mutations or new/deleted sources fail closed. This is point-in-time validation, not a filesystem transaction or a lock against changes after return: later builders must consume the validated committed snapshot, not mutable worktree bytes. Git subprocesses have a 10-second deadline and a 64 MiB output budget per command; unusually large sources/snapshots can fail closed in revision mode. Git replacement objects and lazy fetching are disabled; missing partial-clone objects fail without downloading or modifying the object store.

## Generic policy, not privacy certification

`policy.json` has exactly five fixed rule IDs: `private_path`, `synthetic_private`, `private_key`, `email`, `contact_uri`. Patterns detect generic private paths (including relative/nested references such as `../private/` and `[source](private/secret.md)`), synthetic-private canaries, private-key headers (including OpenPGP), email addresses and mailto/tel schemes in eligible filenames, raw frontmatter/body and decoded YAML strings. Native email matching uses fixed bounds (64 local-part characters, a bounded domain and 2–63 letter suffix) to avoid unbounded backtracking on long misses; it is not exhaustive address validation. Rules are not owner secrets. Malformed policies fail closed without echoing configuration. Keep policy changes generic and review them as code; regex rules are not a comprehensive secret scanner, contact detector or proof of privacy. Encodings, obfuscations and editorial sensitivity still require human review. The tool does not authenticate publication authorization.

## Development acceptance and real prerequisites

```bash
npx --no-install vitest run tests/bootstrap/public-content.test.ts
PYTHONDONTWRITEBYTECODE=1 python3 tests/fixtures/synthetic-corpus/check.py
```

BC approved three explicitly fictional public development copies on 2026-11-18: `mission-regie-collections.md`, `projet-reperage-reserves.md` and `projet-prototype-prets.md`. See `content/README.md` and `docs/_bmad-output/implementation-artifacts/handoff-2-1-development-corpus.md`. Only these prepared copies carry genuine BC development-review metadata and public visibility. Their narratives remain fiction unrelated to BC, not career evidence or recruiter-publication approval. Keep this provenance through downstream processing.

The original fixture drafts still lack visibility and have empty reviews: they must fail unchanged. Tests retain temporary variants with clearly synthetic review values, not owner approvals. Tests also validate the exact prepared copies in disposable committed repositories, including mismatch rejection; those temporary commits do not certify the actual worktree as committed. The local fixture self-check is not retrieval/model evaluation or real-career acceptance.

Story 2.1 closes only for this amended development scope after verification. BC accepts documentary gaps; an advance question-to-document coverage map and exhaustive completeness are not prerequisites. Optional examples remain useful for later grounding, scope and insufficient-evidence evaluations, which are still required. Never invent unsupported answers or widen scope to compensate.

Before recruiter use, replace fiction with explicitly selected real-portfolio documents, genuine factual/comprehension/publication approvals bound to final bytes, actual metadata and unchanged safety/provenance checks. Bind hosted source inputs to the full committed snapshot; no commit, indexing, model invocation or deployment is authorized by development acceptance. Dependency remediation, real-model evaluation, privacy and recruiter-release approval remain separate.

## Reproducible catalog and search artifacts (Story 2.2)

```bash
SOURCE_REVISION=4323afe312f43b6b87a014abee062e03e12f6022
npm run content:build -- --revision "$SOURCE_REVISION"
npm run content:build -- --help
npx --no-install vitest run tests/bootstrap/public-content.test.ts tests/bootstrap/public-artifacts.test.ts
```

Build requires an explicit full commit SHA; it never defaults to application HEAD.
Paths resolve relative to the CLI's repository, not the caller's working directory.
The complete existing validation/freshness gate runs before artifact creation.
`readCommittedPublicContent` returns committed blobs only on complete success;
the builder consumes those bytes without reopening mutable source paths. Failures
expose neither blobs nor source revision. Unrelated application commits do not
change the explicitly pinned provenance.

Outputs are ignored local files under `dist/public-content/<catalogHash>/`:

- `assets/resources-catalog.<catalogHash>.json`: envelope `{catalogHash,payload}`.
  Payload is exactly `{version:1,catalogRevision,resources,documents}`. Resources
  contain `resourceId,name,description,documentIds`; documents contain
  `documentId,sourcePath`. Entities sort by stable ID; repeated map members are
  deduplicated and sorted by unsigned UTF-16 units. Duplicate entities fail.
- `search-artifacts.<searchHash>.json`: canonical `{version:1,chunkingVersion:1,
  catalogRevision,catalogHash,documents,chunks}`. Registry records carry
  `documentId,sourcePath,sourceRevision,sourceTitle,metadata`; chunks link to the
  same records and carry trusted text/location/title/section/revision/metadata.

Only complete reviewed Resource descriptors under `content/public/resources/`
(`resource_id`, `resource_name`, `resource_description`, `document_ids`) are accepted.
Descriptor fields elsewhere, or missing descriptor fields in that directory, fail.
Maps must be nonempty and
refer to eligible public document IDs. Shared documents and repeated map members
are allowed. A descriptor does not implicitly map itself. No descriptors means
an empty Resource array, not invented projects. Real Resource authoring remains
Story 3.1 work; metadata shape is not proof of actual approval.

Portable contracts/preimages live in `src/shared/public-catalog.ts` and
`public-evidence.ts`. RFC 8785 JCS recursively orders object keys using unsigned
UTF-16, preserves Unicode without normalization, rejects lone surrogates/non-JSON
values, and emits no BOM, formatting or trailing newline. Lowercase SHA-256 of
UTF-8 **payload bytes only** determines catalog identity. Search hash covers all
canonical search bytes. Chunk IDs hash `{version:1,documentId,ordinal}` (zero-based
ordinal); content hashes cover exactly `{version:1,documentId,sourcePath,
sourceTitle,sectionTitle,location,text,metadata}`. Runtime timestamps, credentials,
private inputs and deployment URLs are never added. Public source timestamps
remain in search metadata, outside catalog payload.

Markdown chunking excludes frontmatter but retains exact LF/CRLF/Unicode and
absolute one-based inclusive lines. Whole source lines, top-level fenced blocks
and complete conservative quote/list containers are indivisible, including lazy
continuations and descendant fences. Only top-level ATX headings change the
nearest section; unheaded passages use null. Nonoverlapping passage ranges pack
toward 2,000 UTF-16 units of passage only; oversized blocks remain whole.
Repeated context is uncapped and does not reduce the passage packing target.
Complete opening blockquotes are repeated verbatim in later chunks so
fiction/non-BC/development-only warnings survive standalone consumption.
`passage` and `context` retain separate original ranges. `text` is concatenated
context then passage, and `location` is `lines:<start>-<end>` followed by zero or
more `;context:<start>-<end>` segments. Concatenating passages alone reconstructs
the original body. This conservative grammar is not a full Markdown renderer.

Reruns verify exact existing contents and return the same hashes/bytes; conflicts
are rejected without repair or overwrite. `publishBundle` consumes internally
assembled bundles, not arbitrary imported search payloads. Publication uses
Linux/procfs pinned ancestors, staging and generated entries with no-follow opens. Before rename it
verifies full contents and ownership; after rename it opens the destination
without following links, matches original staging device/inode, then verifies
contents and ancestors again. An uncertain destination is a failure, not success,
and is never deleted. Failed staging (including replaced or initially unpinnable
residue) is retained for manual inspection: failure handling only closes
descriptors, with no automatic file or directory deletion or repair. Filesystem
validation is point-in-time, not a transaction against arbitrary subsequent mutation. The existing 64 MiB Git-command output limit and
10-second Git deadlines apply; large indivisible blocks can exceed chunk target.

Build JSON success reports source revision, both hashes and a repository-relative
output path; failures are redacted fixed diagnostics with null revision and
nonzero exit. No dependencies, corpus/review changes, model calls, D1/FTS
activation, hosted assets, application behavior or deployment are involved.
These artifacts do not authorize recruiter publication. Stories 2.3/2.4 own
activation/retrieval; existing development-only and real-portfolio prerequisites
above remain unchanged.

## Coherent local activation (Story 2.3)

Development only: these artifacts still contain standalone fictional/non-BC
warnings. Activation is not recruiter approval, hosted delivery or model/retrieval
readiness. No remote database, environment selector, source override, caller URL,
automatic retry or deployment is supported.

1. Apply local migrations with `npm run db:init` (idempotent; unrelated data is
   preserved). Migration 0002 creates an **empty** publication registry and FTS;
   initialization alone does not announce a ready catalog.
2. In separate terminals start `npm run dev:worker` and `npm run dev:frontend`.
   Both fixed loopback ports 8787/5173 must be free. Keep the frontend running
   during activation: it serves exact generated catalog assets at the required
   same-origin URL, never the source or search-artifact trees.
3. Pin the public-source commit explicitly, independently of application HEAD:

   ```bash
   SOURCE_REVISION=4323afe312f43b6b87a014abee062e03e12f6022
   npm run content:build -- --revision "$SOURCE_REVISION" # optional prebuild
   npm run content:activate -- --revision "$SOURCE_REVISION"
   curl -i http://127.0.0.1:5173/api/health
   ```

Activation reassembles from validated committed bytes (not unchecked bundles),
publishes the immutable bundle, then fetches the **exact** catalog bytes at
`http://127.0.0.1:5173/assets/resources-catalog.<hash>.json` without redirects.
Only after successful verification does one transactional D1 batch replace all
Resources/maps/documents/chunks/FTS and the fixed `active_publication.id=1`
revision/hash pair. The asset path is derived, never separately stored. The
singleton's `modified_at` is operational time, not source provenance or hash input.
Local CLI/proxy and Worker persistence remains `.wrangler/state/v3/d1`.

Ready health is HTTP 200 with exactly `status: "ok"`, `catalogRevision`,
`catalogHash`, and derived `catalogAssetPath`. Missing/corrupt/unusable authority
or dataset yields HTTP 503 with only `{"status":"unavailable"}`. Active health
is `no-store`; verified immutable catalog assets use one-year immutable caching.
The frontend intentionally reports unavailable before initialization/activation.
Request handlers are readers only. `ResourceCatalog.readSnapshot()` returns one
validated transactional authority/catalog/evidence snapshot or null; callers must
not interpret null as global evidence permission or reuse cached pointers.

Failures are redacted and nonzero. Invalid inputs, missing/mismatched assets and
SQL faults do not partially activate: either the old complete publication remains
or there is still none. Assets already published are retained, including after
failure. No filesystem/D1 transaction or continuing server-availability guarantee
is claimed: keep the frontend running for announced assets. Successful repeated
activation is supported without touching unrelated tables or historical data.
Terminal success is printed only after local runtime cleanup completes. A cleanup
failure is redacted and nonzero, but may occur **after D1 committed**: inspect
`/api/health` to determine the active identity. Never assume rollback or retry
automatically after a cleanup failure.

For deliberate rollback, restore the public worktree bytes to the intended
previous full source revision, keep the local servers running, and run the same
activation command with that **explicit previous revision**. The existing source
gate requires the complete public Markdown worktree to match that commit. Review
and preserve unrelated/dirty source edits first; the activation command never
checks out sources or resets a database for you. Old assets stay available; there
is no publication-history table and no automatic rollback/retry.

Verification: `npm run typecheck`, `npm test`, `npm run build`,
`npm run test:d1`, `npm run test:publication`, `npm run test:smoke`, and
`git diff --check`. D1/publication suites use owned disposable local state and
actual workerd/FTS, CLI and HTTP assets without requiring Chromium. The smoke
suite additionally requires the documented browser installation. No verifier
resets existing developer state.
