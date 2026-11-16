# Public knowledge publication — Story 2.1

## Authority and boundaries

BC alone owns editorial completeness, document validation, publication and V1 coverage. Pilot/method acceptance is not public eligibility or coverage evidence and does not close OPEN-1. Reuse the three accepted pilots without compulsory reinterviews or probes. No tool, metadata field or test authenticates a human approval, semantic continuity or privacy.

`content/public/` is reserved for explicitly reviewed public Markdown evidence, not instructions, placeholders or a catalog. Authoring tooling stays outside it. `content/private/` is local-only, gitignored and outside application entrypoints; ignores are not a publication boundary. Never put private preparation into browser assets, imports or hosted build contexts. Story 3.1 owns Resource/maps. Story 2.2 owns indexing; this procedure does not index, retrieve, use D1, invoke a model, change UI, deploy or launch.

## Private preparation and final-byte review

1. Obtain separate, scoped authorization for the selected private inputs and processing route **before reading**, including checkpoints/session logs. Follow `tools/content-authoring/handling.md`. Spec approval authorizes no private intake, copying, commit/push or launch. Never scan private sources to discover forbidden markers.
2. BC selects the documents, reader questions and accepted gaps. Existing pilots can be reused, but preserve historical bytes, versions, review attestations and unknowns. Select the exact historical manifest (`tools/content-authoring/versions/1.0.3.json` or `1.0.2.json`) when applicable; never silently upgrade a pilot. Release/agent 1.0.4 changes the procedure only: type template/guide/criteria versions remain 1.0.3 and checkpoint schema remains 1.
3. Keep a stable UUID `document_id` through edits, moves and renames; preserve the actual creation instant. BC confirms that a renamed/rewritten document is still semantically the same document. A genuinely different document gets a new UUID; never reassign an old ID. Missing historical creation hours stay documented privately: they block promotion only, not continued authoring or editorial approval. Resolve dates from reliable evidence, never filesystem copy dates or invented midnight.
4. In private, follow `workflow/review.md`: factual review by BC; AI standalone reader-comprehension review with actual passages/gaps, corrections selected and confirmed by BC; separate BC publication-eligibility decision. Preserve uncertain facts and omissions without invented achievements, metrics or approvals. The first pass collects real decisions on the selected rendition, not inherited review fields.
5. **Decision B:** `reviewed_by` identifies the actual publication approver; `reviewed_at` is the real UTC timestamp of BC's final publication-approval decision, **not** the initial editorial review and **not** the later byte confirmation. Record that actual decision privately. Insert only the newly obtained metadata, including `visibility: public`, the real approver and quoted timestamp. Update `modified_at` to the actual metadata edit time. Archive first-pass attestations, create a new private revision with null approvals. A provisional `visibility: public` does not publish it.
6. Obtain all three renewed reviews/confirmations on the **exact final bytes, metadata included**, with private revision, digest, actual attestation times and exact versions. This byte confirmation does not relabel `reviewed_at` or refresh `modified_at`. The attestation times may therefore differ from the document decision timestamp. Any further edit (including metadata) invalidates these reviews: withdraw public visibility, empty both review fields, preserve identity/history and repeat the process. No automatic reapproval.
7. Obtain **separate explicit copying approval** for those exact bytes and public destinations. Preserve private documents, checkpoints and approval records; do not expose private mappings, filenames, hashes, reports or deliberations. Only then copy the approved bytes, without metadata normalization or editorial edits. Compare the copied bytes privately against the approved rendition; if different, stop and renew reviews before replacing it. Nothing auto-promotes.

All three documentary dates must be genuine quoted UTC `YYYY-MM-DDTHH:mm:ssZ` with seconds and valid calendar values. Public Markdown requires `document_id`, `visibility: public`, nonempty factual `title`, actual `reviewed_by`, `created_at`, `modified_at`, `reviewed_at`; `topics`/`aliases` are optional. Types, provenance, uncertainties, interview state and review history belong in private sidecars, not mandatory public fields. YAML duplicate keys, aliases, anchors, merges, tags and multiple documents are rejected.

## Public identity and coverage records

`docs/content/document-identities.json` is JSON with `schema_version: 1` and `documents`, an array of `{ "document_id": "<stable UUID>", "path": "content/public/<name>.md", "status": "active" }` entries. Every public Markdown file needs exactly one matching active entry. Paths are repository-relative and normalized. Renames update the path, **not the ID**; obtain renewed edit reviews and BC's semantic-continuity confirmation. On withdrawal change status to `retired`, retain its last public path and remove the public file. Keep retired IDs permanently; never delete/reactivate/reassign them. Historical ledger entries reachable from HEAD (and the requested verification commit) must remain represented. Git history and automation cannot establish whether a new narrative improperly reuses an identity; BC must review that. Rewriting Git history destroys this local continuity evidence and is not authorized by this procedure.

`docs/content/coverage.md` contains safe public questions, public IDs and accepted limitations only, never private mappings or synthetic career claims. Its YAML frontmatter contract is:

```yaml
---
status: accepted
accepted_by: "<actual BC approver>"
accepted_at: "<actual quoted UTC acceptance timestamp>"
questions:
  - question: "<BC-selected reader question>"
    document_ids: [] # Real active public UUIDs, if supported.
    gaps: [] # Explicit public-safe limitations accepted by BC.
---
```

The example is a format, **not acceptance**. Each question needs support and/or an accepted gap; every active document must be referenced. The body explains the accepted scope/limitations. BC decides the actual questions, documents, gaps and acceptance, not the validator. Empty/pending coverage and a placeholder/empty corpus fail. The initial pending record is deliberately not evidence of Story 2.1 completion.

## Read-only local checks and committed provenance

From the repository root:

```sh
npm run content:check
# After separate authorization to commit the approved files and records:
npm run content:verify -- --revision <full-commit-sha>
```

`content:check` collects only `content/public/**/*.md` as documentary evidence; it checks required metadata/identities, local references, forbidden markers and coverage acceptance. Local Markdown links/images/reference definitions (including unused definitions) and HTML URL attributes must stay inside the public subtree; symlink ancestors/leaves, nonregular inputs, encoded traversal and unsafe schemes fail before opening a referenced target. HTTP(S)/protocol-relative external links are never fetched. Embedded CSS URLs/srcdoc/base elements fail closed. Quoted filenames with spaces are allowed. Referenced targets must exist; directories must also be confined and nonsymlink. Non-Markdown public files are not knowledge sources, but are included in the complete provenance snapshot.

`content:verify` additionally requires a full lowercase commit object ID (not a tag, tree, abbreviation or planning baseline). It compares the entire public file set and bytes, modes and index with that commit, including non-Markdown files, plus **both coverage and identity records**. Staged, unstaged, deleted, untracked or ignored public inputs cannot be certified if absent/different in the snapshot. Ignored private files do not invalidate provenance and are never read. No checkout or write occurs. Successful JSON reports the actual SHA and Markdown file count; a check alone is not committed provenance. Concurrent hostile filesystem/Git mutations are outside this local read-only checker’s guarantees: run against a quiescent workspace and rerun after any edit.

Output is limited to safe codes, counts and opaque ordinal references, never excerpts, filenames, metadata values or Git diagnostics. `tools/public-content/forbidden-markers.json` configures generic secret/contact patterns and synthetic private sentinels, not discoveries from private sources. Pattern checks cannot prove privacy; BC's publication review remains required. Do not paste a failing source into logs to explain it.

After authorized copying, run local checks, obtain genuine BC coverage acceptance on the exact coverage bytes, then obtain separate commit approval. After an authorized commit, verify its actual full SHA and record the result without changing the certified inputs. Any later edit requires renewed human review as applicable and a new commit/verification. No commit, push or launch is authorized by these commands or by spec approval.
