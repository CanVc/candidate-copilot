---
title: 'Story 2.2: reproducible public catalog and search artifacts'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 1
baseline_commit: '4323afe312f43b6b87a014abee062e03e12f6022'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The approved development corpus lacks reproducible catalog/chunk artifacts.

**Approach:** Generate linked artifacts from an explicitly pinned, validated Git snapshot, preserving identity and standalone fiction/non-BC context.

## Boundaries & Constraints

**Always:** Gate committed `content/public/**/*.md`; require explicit full source SHA, never application HEAD. Preserve corpus/reviews, Runtime §1 catalog/JCS and evidence text/location fields. No new dependencies.

**Never:** Read private material/linked targets, invent projects/approvals, add fictional flags, activate D1/FTS, change application behavior, call models, deploy or imply recruiter approval. Stories 2.3/2.4/3.1 own activation/retrieval/Resource authoring.

## I/O & Edge-Case Matrix

| State | Result |
| --- | --- |
| Repeated pinned snapshot | Identical bytes/hashes; idempotent output |
| Unsafe/dirty/untracked/mismatched public input | Redacted failure; no successful bundle |
| Application-only changes | Original pinned source revision retained |
| No descriptors | Empty Resources; no invented projects |
| Partial descriptor, duplicate entity, empty/dangling/nonpublic map | Reject; shared documents/repeated map members allowed |
| Independent synthetic middle chunk | Original fiction/non-BC/development-only warning remains explicit |
| Output conflict/write failure | Existing valid bundle preserved |

</frozen-after-approval>

## Code Map

- `tools/public-content/validate.ts` — pinned reads, YAML/policy, sanitized Git; no byte-return API yet. Preserve CLI/regressions.
- `scripts/validate-public-content.mjs`, `tests/bootstrap/public-content.test.ts` — CLI/diagnostic/Git fixtures.
- `content/public/*.md` — three synthetic sheets; opening blockquotes carry provenance. No corpus/author-rule edits.
- `src/shared/` — implement Runtime §1/`RetrievedChunk` contracts; tooling/tests already typechecked.

## Tasks & Acceptance

**Execution:**
- [x] `tools/public-content/validate.ts` — expose committed blobs after complete validation; no mutable-path rereads or sources/revision on failure.
- [x] `src/shared/public-catalog.ts`, `src/shared/public-evidence.ts` — define portable contracts, normalization/JCS, asset path and hash preimages; reject invalid schema/Unicode and duplicate entities.
- [x] `tools/public-content/markdown-blocks.ts`, `tools/public-content/chunk.ts` — partition source outside frontmatter into conservative indivisible Markdown blocks: whole lines/top-level fences, and complete blockquote/list containers including lazy continuations and nested fences. Only top-level ATX headings start sections. Pack nonoverlapping blocks targeting 2,000 UTF-16 units; oversized blocks stay intact. Carry trusted title, nearest section/null, absolute lines, metadata/SHA. Repeat complete opening blockquotes verbatim with separate passage/context ranges. Never use spread/apply to append an unbounded line array.
- [x] `tools/public-content/build.ts`, `tools/public-content/publish.ts` — validate complete reviewed descriptors/public maps under Runtime §1's `content/public/resources/` boundary (reject descriptor fields elsewhere or incomplete descriptors there) and assemble linked outputs. Isolate descriptor-pinned publication/cleanup; apply the ownership commit-point rules below. Reject links/conflicts; publish only verified complete bundles.
- [x] `scripts/build-public-content.mjs`, `package.json`, `tools/public-content/README.md` — add strict revision-required `content:build`/help, repository-relative paths, redacted JSON/nonzero failures; document contracts/reruns/limits.
- [x] `tests/bootstrap/public-artifacts.test.ts`, `tests/bootstrap/public-content.test.ts` — cover the matrix and all retained regressions in disposable repositories. Add injected staging replacement at rename/cleanup, lazy opening warnings, long quote/list-nested fences and a 150,000-line fence. Independently specify a fixed content-hash vector plus field-mutation sensitivity; assert exact persisted search registry records and chunk-to-registry linkage. Keep snapshot races/no-private-read, source reconstruction, golden and CLI/output tests.

**Acceptance Criteria:**
- Given a pinned snapshot, when built twice, then catalog/registry/chunks/hashes match byte-for-byte with that SHA throughout.
- Given reordered/overlapping sets, Unicode/escapes or changed maps/revision, when hashed, then fixed expected vectors pass, including `aefae89a06c759fbf9b82ef17b8f57e532731af585f0df1f138cfda52c897223`.
- Given each synthetic sheet, when middle chunks are consumed alone, then original warnings prevent BC attribution without another source or schema/scope expansion.
- Given descriptors, when mapped, then reviews/nonempty public maps are required; descriptor evidence is included only if explicitly mapped.
- Given outputs, when inspected, then only canonical payload bytes determine catalog identity; operational timestamps, credentials, private inputs and deployment URLs are absent.

## Implementation Notes

- Owner approved the on-disk spec and continuation (choice 1). Frozen intent is unchanged. The implementation worker completed without changing the public corpus, author instructions, dependencies, Worker/frontend or migrations. Parent staged and read the complete 1,242-line baseline diff, including new files; staging is not a commit or publication.
- Parent verification passed: 189 focused tests in verbose mode without skips, all 264 Vitest tests, 45 workstation checks, four TypeScript configurations, frontend build and Worker dry-run. Pinned content validation succeeds for three documents. Two actual artifact builds are byte-identical. Independent Python checks confirmed catalog/search digests, all 23 chunk IDs/content hashes/source revisions and standalone warnings.
- Catalog hash: `053eec31f9374f443caada2221b093a912c18f0581e132bc2bae5252335034e6`; search hash: `ba95f42d2b291dd5f440578b3a8bac4d275635aba8381bc4fb436da4f74c5e81`. Outputs are ignored local files, not activated/served assets. Linux/procfs remains required. Independent build review is still pending.
- Matrix audit: repeated snapshot/application-only rows are covered by `builds identical linked bytes twice...`; unsafe/dirty/untracked/mismatch by `rejects ... source inputs before output` plus existing boundary tests; no descriptors by the repeated-build empty-Resources assertion; invalid/shared maps by the descriptor table and deduplication case; standalone fiction by the three-sheet middle-chunk case; output failures by the nine injected output cases. Every covering case ran and passed in the parent's 189-test verbose run. Additional handoff-race/private-read, Unicode/JCS, reconstruction and strict CLI cases also passed.

- Re-derivation acceptance check: parent restored Runtime §1's already-binding descriptor-directory constraint, which the re-derived worker had omitted. Valid mapping fixtures now use `content/public/resources/`; direct outside-directory/missing-field cases prevent false-positive map coverage. No actual Resource was authored or source edited. Parent will rerun and re-read the complete refreshed diff before review.

- Re-derived implementation passed parent verification: 196 focused tests verbosely with no skips, 271 total Vitest tests, 45 workstation checks, typecheck and both application builds. Matrix coverage remains complete through the repeat-build/pinned-revision case, source rejection table, empty-Resources assertion, descriptor/entity tables and shared-map case, three-sheet middle-warning case, and publication failure/swap cases; all ran and passed. Newly added independent content-hash vectors/field mutations, exact persisted registry/linkage, lazy quote/container fences and 150,000-line block cases also passed.
- Independent Python verified all 23 chunk IDs/hashes, exact document/chunk registry linkage, complete source reconstruction and warnings in every substantive chunk; two builds remain byte-identical. An initially overbroad auxiliary assertion also required warnings on three whitespace-only leading spans; it was narrowed to substantive text, not a changed production expectation. Catalog hash is unchanged; current search hash is `88297f906c707949024c5a66507fd4111cdcdef8003d084847e43ce17df9c28a`. Old unaccepted prototype outputs were removed only after verifying their complete parent manifest. Second independent review remains pending.

- Final patch verification: the original re-derived worker was resumed, not replaced; parent read the complete 450-line patch against staged implementation. All retained pass-2 findings are fixed. Failure handling now only closes descriptors and retains staging, a stricter safety choice than attempted ownership-check cleanup. The Markdown fixes delete unnecessary descendant parsing, correct direct token rules and keep passage packing independent of repeated warning size. No new public surface or corpus change was added.
- Final parent reruns passed 217 focused cases verbosely without skips (98 artifact plus 119 validator), all 292 Vitest tests, 45 workstation checks, six fixture checks, typecheck, frontend build and Worker dry-run. The full matrix and every retained review regression ran successfully. Independent Python rechecked catalog/search/chunk hashes, registry linkage, exact portable locations, full reconstruction and substantive-chunk warnings; repeated complete output manifests match. Final catalog/search hashes remain `053eec31f9374f443caada2221b093a912c18f0581e132bc2bae5252335034e6` / `88297f906c707949024c5a66507fd4111cdcdef8003d084847e43ce17df9c28a`.
- Two complete three-layer independent review passes, one non-frozen technical re-derivation and final direct patches/parent verification are complete. Rare-low rejections and their evidence remain individually logged; no deferred work was created. Limitations remain Linux/procfs, a conservative non-rendering Markdown grammar, intentionally retained failed staging and trusted internal bundle input. No model, D1/FTS activation, hosted publication, dependency update or recruiter approval occurred.

- Workflow completion: spec is `done` for implementation and independent agent review; sprint Story 2.2 is `review` for the pending human/operator handoff, not recruiter acceptance. Finalization creates only a local implementation commit, with no push. The source snapshot remains the explicit baseline above, not the new application commit. Future activation/search evaluation are Stories 2.3/2.4, not unfinished 2.2 requirements.

### Owner acceptance and closure — 2026-11-18

- BC explicitly accepted Story 2.2 and authorized closure after running the CLI commands and discussing chunk purposes, the three readable samples, all 23 generated chunks and the future question/answer/source-verification journey. Acceptance was recorded at `2026-11-18T11:47:31Z`. This records acceptance of the current artifact-building scope, not a claim that BC exhaustively inspected every chunk or that actual-model behavior has already passed.
- Parent checked the unchanged implementation at `b0cd6b0ab9084811f775e377e503f42152c9d6da`, the full existing triage record and the clean worktree. No retained blocking finding remains for 2.2. Closure reruns passed pinned source validation, exact existing-bundle verification with unchanged catalog/search hashes and all 217 focused tests. The prior 292-test full-suite/typecheck/build evidence remains applicable; this closure changes tracking/documentation only.
- Set sprint Story 2.2 from `review` to `done`; keep Epic 2 `in-progress`. The spec was already `done` for implementation/agent review and now also has explicit owner acceptance. Recorded limitations and rejected rare-low findings remain visible in the triage log; none is silently represented as fixed.
- Preserve downstream obligations: Story 2.3 activation, 2.4 scoped retrieval evaluation, 2.14 actual-model/human evaluation and 2.16 cited-excerpt UI. A complete operator view of all model-input chunks/full documents is not implicitly authorized or promised. Fiction remains unrelated to BC and development-only; no real-portfolio/recruiter approval, model call, D1 activation, deployment or push is implied. Temporary reading aids under ignored `dist/` are not new public source documents.

## Spec Change Log

### Re-derivation 1 — ownership and Markdown blocks

- Trigger: verified B1/E1, B2, B3 and B4. The first technical plan did not define destination ownership after pathname rename, nonrecursive pinned cleanup, complete lazy blockquote context or container-nested fenced blocks. Replace those underspecified seams with the explicit design below; keep frozen intent unchanged.
- Avoid: success for a substituted staging symlink/unverified bundle; deletion of nonempty replacement directories; loss of non-BC warning continuations; splitting container-nested fences. Also require iterative large-block append (E2) and independent content-hash/search-registry regressions (V1/V2) while re-deriving, rather than applying moot patches to reverted code.
- KEEP: complete committed-byte gate and freshness regressions; exact catalog schema/order/JCS/digest vectors; stable chunk/document provenance and source reconstruction; zero inferred Resources/implicit descriptor mapping; portable runtime text/location with explicit original warnings; strict redacted CLI, idempotence and no D1/deployment/application/corpus changes. Parent retained the original full diff and reproduction evidence before reverting only implementation files.

## Review Triage Log

### Pass 1

All three reviewers completed using the inherited model capability. Parent reproduced B1–B4 and E1–E3 in disposable repositories/direct tooling calls; verification-gap evidence is accepted under its review protocol. Reviewer priority labels were disregarded.

| ID | Verdict / route | Verified evidence |
| --- | --- | --- |
| B1 | high / bad_spec (with E1) | Replacing the staging pathname immediately before rename produced `ok: true` with a published symlink to unverified content. Ancestor checks do not establish destination identity. Ownership/commit-point instructions need strengthening. |
| B2 | high / bad_spec | Replacing staging between its ownership check and recursive pathname removal deleted a nonempty replacement directory containing an unowned sentinel. Cleanup must not recursively traverse a mutable staging pathname. |
| B3 | medium / bad_spec | An opening Markdown blockquote with a lazy continuation repeated only its first line in the middle chunk; the non-BC/development-only continuation disappeared. The grammar contract needs explicit complete-container handling. |
| B4 | medium / bad_spec | A valid blockquote-nested fence with 40 long lines split into chunks containing separate opening/closing markers. Container fences need atomic treatment, not top-level-only matching. |
| E1 | high / bad_spec (with B1) | Independent staging-path replacement claim reproduces the same successful symlink publication as B1; same ownership defect, retained as its own finding. |
| E2 | medium / patch, moot during re-derivation | A valid 150,000-line fenced block throws `RangeError` at spread-based append despite fitting input limits. Iterate lines instead of using argument-count-limited spread. |
| E3 | low / reject | Injected `EMFILE` after staging creation leaves an empty staging directory. Real but unusual; reliable cleanup adds failure-path/ownership complexity, so reject under the rare-low rule. No uncertain directory should be deleted to hide this residue. |
| V1 | medium / patch, moot during re-derivation | Pre-verified gap: checked content-hash assertions reuse the production preimage helper; omitting text would leave them green. Parent Python verification passes today but does not supply a checked regression vector. |
| V2 | medium / patch, moot during re-derivation | Pre-verified gap: persisted search documents lack direct expected-record assertions; changing them to an empty array would evade the checked suite. Add independent registry/linkage expectations. |

B1/E1 form one group; B2, B3 and B4 have separate causes. Nontrivial ownership/Markdown fixes require a non-frozen technical-plan correction; no human intent gap exists. Patch entries are moot while code is re-derived. KEEP: exact frozen intent, corpus bytes, committed-blob handoff and original gate regressions; canonical catalog/golden vectors; no inferred Resources/descriptor self-mapping; portable existing evidence fields; deterministic source reconstruction, strict CLI, and all verified output/fiction limits.

### Pass 2

All three fresh reviewers completed at the inherited capability. Parent reproduced B1–B9 and E1–E5 against the current code; gap findings are accepted from their filed test/symbol evidence. No finding is carried unchanged from pass 1: either the code or the claimed defect changed.

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| R2-B1 | high / patch | Swapping a checked file immediately at cleanup unlink deleted the unowned replacement. The smallest safe correction is deletion of failure-path unlink/rmdir cleanup: retain uncertain staging and close descriptors, rather than attempting non-atomic ownership deletion. |
| R2-B2 | low / reject | A raced empty destination directory can be replaced by rename; reproduced with successful publication. No nonempty/valid bundle or data is overwritten. This unusual empty-directory race needs a new no-clobber primitive/coordination mechanism, so reject under the rare-low rule. |
| R2-B3 | low / reject | Direct standalone `publishBundle` accepts a deliberately rehashed search payload with null records. The sole production caller assembles records from validated blobs; no CLI/import path supplies arbitrary bundles. General imported-search validation would add substantial unused schema/linkage logic; reject this unusual unsupported-helper-input case, not as out-of-scope work. |
| R2-B4 | medium / patch (with R2-E1) | Literal container-looking text inside quoted code is stripped into a false fence close; reproduced a swallowed `# Next`. Remove unnecessary descendant-fence parsing: complete containers are already indivisible, and their normal prefix/blank-line termination must govern. |
| R2-B5 | medium / patch (with R2-E2) | An active descendant fence bypasses container termination and swallows an unquoted `# Outside`. Same minimal parser deletion restores normal container termination; this is a distinct defect from recursive prefix stripping. |
| R2-B6 | medium / patch (with R2-E4) | `-` followed by indented `# Nested` is not recognized as an empty list item and incorrectly creates a source section. Directly accept end-of-line after a list marker. |
| R2-B7 | low / patch (with R2-E5) | `# ###` produces title `###`, not null. Directly correct closing-only hash stripping. |
| R2-B8 | medium / patch | A 3,624-character body with a 3,000-character opening warning creates 104 chunks/309,930 text characters. Removing context overhead from the passage packing comparison restores a useful 2,000-unit passage target without losing context or adding state. |
| R2-B9 | low / patch | Direct normalization returns a one-hole Resource array unchanged. Current JCS/build paths reject or never produce it, but changing conversion to `Array.from` is a direct correction that also validates holes. |
| R2-B10 | medium / patch (with R2-V1) | Persisted content-hash assignment has no independent checked assertion, despite helper vectors; parent Python checks current output but are not a checked regression. |
| R2-E1 | medium / patch (with R2-B4) | The quote/list-looking literal code case has the same recursive prefix-stripping defect as B4; independently retained as a finding. |
| R2-E2 | medium / patch (with R2-B5) | The unclosed descendant fence has the same bypassed container termination as B5. |
| R2-E3 | medium / patch | A closing marker followed by NBSP incorrectly ends a top-level fence, promoting its internal `# code`. Replace broad whitespace matching with only spaces/tabs after removing the line ending. |
| R2-E4 | medium / patch (with R2-B6) | The empty-list fixture promotes an indented list heading; same missing end-of-line marker alternative. |
| R2-E5 | low / patch (with R2-B7) | Closing-only ATX heading yields `###`; same direct title-trimming correction. |
| R2-V1 | medium / patch (with R2-B10) | Pre-verified regression gap: a wrong per-chunk content-hash assignment can pass preimage helper vectors and whole-artifact self-comparisons. Assert independent preimages from actual persisted chunk fields. |
| R2-V2 | medium / patch | Pre-verified regression gap: generated string locations are never checked against source ranges. Add exact LF/CRLF and repeated-context location assertions. |
| R2-V3 | medium / patch | Pre-verified regression gap: swapped authored Resource names/descriptions evade map-only assertions. Assert complete converted Resource records with distinct factual values. |

B4/E1, B5/E2, B6/E4, B7/E5 and B10/V1 each share one cause; all other surviving entries remain separate. Every retained fix is a direct deletion/correction or focused regression assertion, adds no public surface and addresses demonstrated state. No intent/spec loopback or deferral is needed. Previous safety fixes, full frozen intent and all KEEP instructions remain required.

## Design Notes

Envelope `{catalogHash,payload}`; payload exactly `{version:1,catalogRevision,resources,documents}`. Resource fields: `resourceId,name,description,documentIds`; registry: `documentId,sourcePath`. Sort entities by ID; deduplicate/sort map sets using unsigned UTF-16, never locale comparison. Hash RFC 8785 JCS UTF-8 payload only, without BOM/newline, with lowercase SHA-256. Preserve Unicode; reject lone surrogates.

Output: `dist/public-content/<catalogHash>/assets/resources-catalog.<catalogHash>.json` and `search-artifacts.<searchHash>.json`. Canonical search bytes contain version/chunkingVersion 1, catalog identity, documents/chunks; SHA-256 determines `searchHash`. Chunk IDs hash JCS `{version:1,documentId,ordinal}`; content hashes cover `{version:1,documentId,sourcePath,sourceTitle,sectionTitle,location,text,metadata}`. Public source timestamps stay in metadata, not catalog payload.

Publication ownership: pin staging and its created entries; verify complete contents, then recheck before rename. After rename, open the destination without following links, compare its device/inode to the pinned original staging directory, and verify the full bundle/ancestors before success. If identity is uncertain, fail without deleting the destination. Cleanup must never recursively remove a mutable staging pathname: operate through the pinned owned directory on known generated entries, refuse unexpected/replaced directories, and use only nonrecursive directory removal. A nonempty replacement with an unowned sentinel must survive a swap immediately before cleanup. Retain uncertain/initially unpinnable residue for manual inspection rather than risking unowned data; no automatic repair.

Markdown grammar: preserve complete quote/list containers conservatively, including lazy continuation text and fenced descendants; oversized containers may exceed the target. Their internal ATX-looking lines are not top-level section boundaries. Opening repeated context must include the original complete blockquote, not merely `>`-prefixed lines. Retain LF/CRLF/Unicode and exact absolute ranges; preserve nested/repeated top-level headings and unheaded sections.

No intent gaps/irreversibles; cross-file contracts require dispatch. Baseline below passes provenance and 117 tests. Approval authorizes artifacts only.

## Verification

Set `SOURCE_REVISION=4323afe312f43b6b87a014abee062e03e12f6022`.

- `npm run content:check -- --revision "$SOURCE_REVISION"`
- `npx --no-install vitest run tests/bootstrap/public-content.test.ts tests/bootstrap/public-artifacts.test.ts`
- `npm run content:build -- --revision "$SOURCE_REVISION"` twice; compare all bytes and independently recompute digests.
- `npm run typecheck`, `npm test`, `npm run build`, `git diff --check` — pass; inspect complete diff and unchanged public sources.
