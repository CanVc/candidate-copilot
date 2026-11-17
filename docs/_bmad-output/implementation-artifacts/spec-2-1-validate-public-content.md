---
title: 'Story 2.1: validate public-source safety and provenance'
type: 'feature'
created: '2026-11-17'
status: 'done'
route: 'dispatch'
review_loop_iteration: 2
baseline_commit: '37b3b2e0a4645e0577441c9c6f69933e3c60a65e'
context:
  - '{project-root}/docs/_bmad-output/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2.1 lacks an executable public-source gate. The approved fictional sheets permit technical tests, not real-career or publication acceptance.

**Approach:** Deliver a read-only Node CLI and reusable tooling module for metadata, source isolation, forbidden markers and optional full-commit provenance. Inputs are only the repository's `content/public/**/*.md`; tests use disposable synthetic repositories.

## Boundaries & Constraints

**Always:** Preserve editorial/publication authority, stable IDs and quoted UTC timestamps. Diagnostics use fixed codes, document ordinals and allowlisted field names, never source values, unsafe filenames, parser excerpts or symlink targets. Rules contain generic/synthetic patterns, not owner secrets. Checks cannot authenticate approval or certify privacy.

**Never:** Read private content, follow links into additional sources, modify/promote documents, fabricate approvals, index, call application models, alter D1, deploy or push. Preserve fixtures/private copies. Real-corpus acceptance and dependency remediation remain separate.

## I/O & Edge-Case Matrix

| Input/state | Result |
| --- | --- |
| Valid local public Markdown | JSON success/count; `sourceRevision: null`, no commit claim |
| Empty corpus/current placeholder README | Controlled nonzero; no README exemption |
| Invalid metadata/calendar dates, duplicate IDs/YAML keys, aliases/tags | Reject with safe codes/fields |
| Filesystem links/special entries/outside paths | Reject without reading targets; ordinary non-Markdown files are ineligible |
| Forbidden filename/frontmatter/body marker | Reject; matched value absent from stdout/stderr |
| Exact snapshot and explicit full commit | Success revision only after file-set/raw-byte equality |
| Invalid/abbreviated commit or dirty/untracked/removed public input | Reject; never label inputs as that revision |
| Unmodified synthetic drafts in temporary public tree | Reject missing visibility/reviews; positive variants remain fake and temporary |

</frozen-after-approval>

## Code Map

- `content/AGENTS.md`, `tools/content-authoring/types.md`, `tools/content-authoring/workflow/review.md` — metadata and genuine-review limits; unresolved review-event semantics remain deferred.
- `scripts/local-d1.mjs` — repository-root resolution/strict arguments, not database behavior.
- `tests/bootstrap/safety.test.ts`, `scripts/check-build-isolation.mjs` — disposable canaries, sanitized execution and isolation regressions.
- `tests/fixtures/synthetic-corpus/` — three French drafts and six checks; preserve originals.
- `vitest.config.ts`, `tsconfig.tooling.json`, `package.json` — tests, tooling and pins.

## Tasks & Acceptance

**Execution:**
- [x] `tools/public-content/validate.ts` — typed public-only collection, YAML/schema/safety checks and optional Git snapshot equality. Reject filesystem links; Markdown links never expand inputs.
- [x] `tools/public-content/policy.json` — generic rule IDs for private-path/synthetic-private markers, private-key headers, email and mailto/tel patterns; reject malformed rules without echoing them.
- [x] `scripts/validate-public-content.mjs`, `package.json`, `package-lock.json` — add `npm run content:check`; accept only `--help` or optional `--revision <full-commit>`. Resolve own repository, not arbitrary/private roots. Pin direct dev dependency `yaml@2.9.1`; no unrelated upgrades.
- [x] `tsconfig.tooling.json`, `tests/bootstrap/public-content.test.ts` — typecheck tooling and cover the matrix in temporary Git repositories, including private canaries, unsafe filenames/parser errors, ID-preserving renames and nonmutation. Positive review values are explicit synthetic data, never owner approval.
- [x] `tools/public-content/README.md` — commands, rule limits, current placeholder rejection, mock rehearsal and actual review/coverage prerequisites; no promotion mechanism or public-file changes.

**Acceptance Criteria:**
- Given public Markdown, when checked, then require unique nonblank string `document_id`, `visibility: public`, nonblank title/reviewer and quoted valid UTC creation/modification/review timestamps (`YYYY-MM-DDTHH:mm:ssZ`). Renames preserve IDs; duplicates fail. Shape checks do not prove historical nonrecycling or human approval.
- Given a declared commit, when provenance succeeds, then its complete public Markdown file set and raw bytes match the inputs; detect untracked/removed/modified files. Unrelated application changes are not source verification.
- Given any run, when it ends, then sources/private copies remain unchanged, injected forbidden values are absent from diagnostics and rejected input returns nonzero.

## Implementation Notes

- BC approved the displayed plan and continuation on 2026-11-17 (choice 1). Re-read the on-disk spec before approval; frozen intent is unchanged. Pre-existing worktree changes are this approved spec and its generated Epic 2 context, not unrelated work. Baseline remains `37b3b2e0a4645e0577441c9c6f69933e3c60a65e`.
- Parent synchronized Story 2.1 to `in-progress` and preserved the historical notes; this resolves the previous backlog discrepancy without asserting real-corpus acceptance. Implementation must preserve the parent's tracking/context changes; parent retains review, staging and commit responsibility.
- Implemented by a fresh-context worker, then parent staged and read the complete 850-line baseline diff including all new files. Only `yaml@2.9.1` was added to the lockfile; pre-existing pins are unchanged. The module exposes typed diagnostics and rejects symlinks, hard links and special entries without dereferencing targets. No fixtures or private sources were changed.
- Parent verification on WSL / Node 24.22.0 / npm 11.19.1: four TypeScript configurations passed; all 51 new public-content tests ran in verbose mode with no skips; `npm test` passed 45 Bash fixtures and 126 Vitest cases; six synthetic-corpus self-checks passed; isolated builds excluded all 33 canaries. Help works. `npm run content:check` returned the expected exit 1 with `FORBIDDEN_PRIVATE_PATH` / `FRONTMATTER_INVALID`, without echoing the README's private-path text.
- Matrix audit: valid local/revision success and nonmutation (first metadata test and CLI test); empty/placeholder rejection (empty-corpus test); all required fields/dates/IDs/YAML failures (metadata cases); filesystem boundary/special entries (isolation cases); redacted filename/body/decoded scalars/parser/policy errors (safe-diagnostic cases); exact snapshot success and modified/untracked/removed/renamed/raw-byte/invalid-commit rejection (provenance/CLI cases); original-draft rejection versus disposable synthetic positive variants (fixture test). Every covering case ran and passed in the parent's verbose output.

- Review loop 1 recovery snapshot: `/tmp/candidate-public-content-loop1.3u5bpu/implementation-before-loop.tar.gz` contains only the eight generated implementation files, not private data or parent planning/tracking. Code was restored to the captured baseline; the worker may reuse this owned snapshot as a starting point while re-deriving all fixes above. Parent documentation/tracking and frozen intent remain intact. Earlier verification describes the pre-review version, not acceptance of the corrected version.

- Re-derived round 1 implementation was staged and its complete 1,212-line diff read by the parent. Parent reran all verification: 76 public-content cases (every case verbose, none skipped), 151 total Vitest cases, 45 Bash fixtures, four TypeScript configurations, six fixture self-checks and 33-canary build isolation all passed. Current placeholder still rejects safely; source fixtures and real public tree have zero diff from baseline. Matrix coverage remains intact, with added deterministic directory/configuration races, descriptor cleanup, private-field rejection, bounded long-email misses, filename-only redaction, replacement objects and partial-clone nonmutation regressions.

- Review loop 2 recovery snapshot: `/tmp/candidate-public-content-loop2.xEQTdq/implementation-before-loop.tar.gz` contains the eight round-1 implementation files and all 76 tests. Code was restored to baseline again; reuse this latest owned snapshot rather than the older loop-1 snapshot, then re-derive the new consistency fixes. Parent planning/tracking remains untouched. Existing checkmarks/verification refer to the preserved pre-review implementation until revalidated.

- Re-derived round 2 implementation was staged and its complete 1,520-line diff read by the parent. Parent verification passed: all 109 gate cases, 184 total Vitest cases, 45 Bash fixtures, four TypeScript configurations, six fixture checks and 33-canary build isolation. Every matrix behavior remains covered by executed tests; added freshness cases cover initial/final reads, complete membership, post-Git mutations, unrelated changes, strict UTF-8, trailing spaces and inherited Git isolation. Current public placeholder fails as expected. Public tree and versioned source fixtures remain byte-unchanged from baseline.

- Final patch pass: synchronous implementation run could not be located for resumption, so parent applied the three proven encoding/canonical-ID fixes directly and added the missing PKCS#8-header regression. Final parent checks passed: 114 gate tests, 189 total Vitest cases, 45 Bash fixtures, all four TypeScript configurations, six fixture checks and 33-canary build isolation. Help works and the real public placeholder still returns expected exit 1 without source-value disclosure. Every matrix row is covered by executed passing cases; source fixtures/public files remain unchanged. Only yaml 2.9.1 was added to the lockfile.
- All runtime findings are resolved and recorded; eight distinct generated-agent-context omissions were appended to deferred-work.md per review policy, without duplicating carried findings. The rare large-document Git output-budget limitation is documented and remains fail-closed. No live model, deployment, public promotion or private-source read occurred. This spec completes only the approved technical slice; Story 2.1 moves to review with actual corpus/coverage/approval acceptance explicitly outstanding. Temporary owned recovery/diff artifacts are no longer needed after completion.

## Spec Change Log

- Review loop 1: static pathname checks allowed an ancestor-directory replacement to read a synthetic private target; unconstrained YAML keys also admitted fields reserved for private sidecars. Refined the non-frozen implementation design below to require descriptor-pinned traversal and explicit public-field validation. Frozen intent is unchanged. Re-derive code from baseline after preserving an owned recovery snapshot. KEEP: typed/redacted JSON diagnostics, strict CLI/root resolution, AST quote/calendar/duplicate/tag/alias checks, nonmutation, full raw-byte/file-set provenance, source fixture rejection and all 51 passing regression cases. Also address the verified lazy-fetch, email-performance, relative-private-path, OpenPGP and two test-coverage findings during re-derivation.

- Review loop 2: parent reproduced accepting a late untracked Markdown file and in-place forbidden byte replacement under the old revision. Refine the non-frozen consistency design to recheck file contents/metadata and complete Markdown membership before success; this is a cached-input freshness defect, not a change to the approved public-only intent. KEEP all round-1 protections and 76 tests. Also preserve the verified fixes for unrelated ancestor changes, trailing-space paths, invalid UTF-8, textual private-path boundaries and the two new coverage gaps. A gate is point-in-time validation, not a lock against changes after it returns; documentation must tell later builders to consume the validated committed snapshot rather than mutable worktree bytes.

## Review Triage Log

| ID | Verdict / route | Evidence |
| --- | --- | --- |
| B1 | high / bad_spec | Parent reproduced swapping `content/public` after lstat: a previously empty public tree accepted one private synthetic document. Leaf O_NOFOLLOW did not protect ancestor traversal. Descriptor-pinned design is required, not another pathname recheck. |
| B2 | high / patch, subsumed by loop 1 | Parent's disposable partial-clone check created four Git object files during validation. Disable lazy fetch explicitly and cover unavailable objects with nonmutation evidence. |
| B3 | medium / patch, subsumed by loop 1 | Parent measured email regex misses at 10k/20k/40k characters taking 68/236/1002 ms. Bound matching complexity and add a bounded adversarial regression. |
| B4 | high / bad_spec | Parent confirmed `interview_state` and `review_history` passed as extra metadata despite the existing public/private-sidecar contract. Validate allowed public keys without echoing rejected keys or values. |
| B5 | medium / patch, subsumed by loop 1 | Parent confirmed a literal `../private/secret.md` reference passed. Generic private-path detection must include common relative variants without opening targets. |
| B6 | high / patch, subsumed by loop 1 | Parent confirmed the standard OpenPGP private-key header passed. Include that header and retain redacted diagnostics. |
| B7 | medium / defer pending successful loop | Generated Epic 2 context omitted the original clarification/new-ID retry counting distinction. This is an agent-context correction, not current validator runtime behavior; record a follow-up after loop completion. |
| B8 | medium / defer pending successful loop | Generated Epic 2 context omitted the explicit reload-only/nonoverlapping ~3s/45s observation contract. This agent-context correction needs a follow-up, not a change to current validator behavior. |
| E1 | high / bad_spec, grouped with B1 | Edge reviewer independently reproduced the same directory-swap private-read outcome; parent verified it. Same ancestor-path traversal root cause as B1. |
| V1 | medium / patch, subsumed by loop 1 | Pre-verified filename test was masked by forbidden body content: removing filename scanning kept 51 tests green. Add a filename-only clean-body CLI rejection/redaction test. |
| V2 | medium / patch, subsumed by loop 1 | Pre-verified replacement-object isolation lacked a regression: removing GIT_NO_REPLACE_OBJECTS kept 51 tests green but allowed B's bytes to be labeled A under git replace. Add the A-to-B replacement test. |
| R2-B1 | high / bad_spec | Parent added forbidden `late.md` after enumeration; validator still returned success and the original revision. Directory membership was not revalidated. |
| R2-B2 | medium / patch, subsumed by loop 2 | Parent created an unrelated application directory during collection; ancestor nlink comparison caused SOURCE_BOUNDARY despite unchanged public inputs. Directory identity must not depend on unrelated link-count changes. |
| R2-B3 | low / patch, subsumed by loop 2 | Parent confirmed a repository ending with a space fails provenance because trimEnd removes valid path bytes. Strip only Git's line terminator. |
| R2-B4 | medium / patch, subsumed by loop 2 | Parent appended invalid UTF-8 byte 0xff and received success. Reject invalid source encoding instead of silently replacing it. |
| R2-B5 | medium / patch, subsumed by loop 2 | Parent confirmed `[source](private/secret.md)` passes current generic private-path detection. Include ordinary textual boundaries and retain redaction. |
| R2-B6 | low / rejected | The new safe Git subprocess budget can reject a 65 MiB document in revision mode while local mode accepts it. This is fail-closed, and such individual professional sheets are highly atypical; unlimited/streamed comparisons add complexity disproportionate to this use. Document the command-output resource limitation, not unlimited-size support. |
| R2-B7 | medium / defer pending successful loop | Generated agent context also omitted authentication before replay. Original baseline text carried the ordering; current token-hashing summary does not. |
| R2-B8 | medium / defer, carried B7 | Same context omission and unchanged claim as B7: clarification/new-ID retry counting distinction remains absent. No duplicate follow-up. |
| R2-B9 | medium / defer, carried B8 | Same context omission and unchanged claim as B8: reload-only/nonoverlapping ~3s/45s observation contract remains absent. No duplicate follow-up. |
| R2-B10 | medium / defer pending successful loop | Generated agent context retained the history-token cap but dropped separate total-prompt capacity checks, present in the original context. |
| R2-E1 | high / bad_spec | Parent reproduced replacing public bytes immediately after read; only inode/link identity was checked, so forbidden replacements were accepted under the old revision. |
| R2-E2 | high / bad_spec, grouped with R2-B1 | Independently reproduced the same late-file membership defect as R2-B1; parent confirmed the bad outcome. |
| R2-E3 | high / bad_spec, grouped with R2-E1/R2-B1 | Claim finding confirms the two cached-input freshness defects can return a revision despite modified bytes/additional Markdown; parent verified both conditions. |
| R2-V1 | medium / patch, subsumed by loop 2 | Pre-verified unreadable-file regression is untested: suppressing SOURCE_READ kept 76 tests green and accepted a readable subset. Add an unreadable ordinary file with a readable sibling and redacted CLI failure. |
| R2-V2 | medium / patch, subsumed by loop 2 | Pre-verified inherited-Git isolation has no regression: spreading process.env kept 76 tests green but broke valid provenance with conflicting GIT_DIR. Add that CLI environment case. |
| R3-B1 | high / patch | Parent reproduced a committed filename byte 0xff renamed to U+FFFD being accepted under the old SHA: lossy Git tree decoding collapsed distinct paths. Use fatal UTF-8 decoding and a regression. |
| R3-B2 | high / patch | Parent replaced one policy-pattern byte with 0xff in a disposable CLI; lossy configuration decoding produced success on a private-path document. Decode configuration strictly and fail POLICY_INVALID. |
| R3-B3 | medium / defer, carried R2-B7 | Carried unchanged authentication-before-replay omission in generated context; no duplicate follow-up. |
| R3-B4 | medium / defer, carried B7 | Carried unchanged clarification/retry/read accounting omission; no duplicate follow-up. |
| R3-B5 | medium / defer, carried B8 | Carried unchanged reload-observation bounds omission; no duplicate follow-up. |
| R3-B6 | medium / defer, carried R2-B10 | Carried unchanged total-prompt capacity omission; no duplicate follow-up. |
| R3-B7 | medium / defer | Generated context dropped the baseline's explicit no-truncation constraint for the 1,000-character question cap. Restore through an agent-context follow-up. |
| R3-B8 | medium / defer | Generated context dropped temporary/shared/pseudonymous counter requirements from the baseline, retaining only the numeric creation quota. Agent-context follow-up is required. |
| R3-B9 | medium / defer | Generated context dropped explicit no-streaming and no-independent-completion-flag requirements. Agent-context follow-up must preserve both original invariants. |
| R3-B10 | medium / defer | Generated context's Epic 4 summary dropped the creation-based anchor of the 90-day lifecycle. Restore through an agent-context follow-up. |
| R3-E1 | high / patch | Parent's SHA-256 fixture accepted a 40-character commit prefix and reported it as full provenance. Compare requested identifier to Git's resolved canonical full object ID. |
| R3-E2 | high / patch, grouped with R3-B1 | Same invalid-filename decoding collision reproduced independently and by parent. |
| R3-E3 | medium / defer, carried R2-B7 | Carried unchanged authentication-before-replay omission; no duplicate follow-up. |
| R3-E4 | medium / defer, carried B7 | Carried unchanged clarification/retry/read accounting omission; no duplicate follow-up. |
| R3-E5 | medium / defer, carried R2-B10 | Carried unchanged total-prompt capacity omission; no duplicate follow-up. |
| R3-E6 | medium / defer, carried B8 | Carried unchanged reload-observation bounds omission; no duplicate follow-up. |
| R3-E7 | medium / defer, carried R3-B10 | Same creation-based-retention omission already recorded above; no duplicate follow-up. |
| R3-E8 | high / patch, grouped with R3-E1 | Claim finding is the same canonical-identifier defect; parent verified the abbreviated success. |
| R3-E9 | high / patch, grouped with R3-B1 | Claim finding is the same lossy-path collision; parent verified mismatched filenames accepted. |
| R3-V1 | medium / patch | Pre-verified tests cover RSA/OpenPGP but omit the unprefixed PKCS#8 private-key header; an isolated narrowed-rule mutation kept all 109 cases green. Add unprefixed-header CLI rejection/redaction coverage. |

## Design Notes

Review-loop implementation requirements:
- On the reference Ubuntu/WSL Linux environment, pin directory descriptors from the filesystem root through the repository/public tree and use descriptor-relative traversal (e.g. `/proc/self/fd`) with no-follow opens for each component. Reject unsupported environments safely. Recheck opened inode/type and file-link identity (not unrelated ancestor-directory link counts) and close every handle; never rely on a leaf-only no-follow flag or a racy pathname precheck. Apply the safe-read primitive to configuration reads too. Add deterministic root/nested directory-swap tests proving synthetic private targets are not read.
- Accept only documented public metadata keys: the seven required fields, optional string-list `topics`/`aliases`, and the established Resource descriptor fields `resource_id`, `resource_name`, `resource_description`, `document_ids` (shape only, mapping semantics remain later). Reject private/unknown keys with safe existing diagnostics, never their literal names. Keep YAML structural/tag/alias errors ahead of schema checks.
- Detect changes during collection/validation: retain file size/mtime/ctime observations around reads, recheck exact source bytes and the complete eligible Markdown membership through pinned descriptors immediately before successful local/provenance return (after Git checks too). Reject observed mutations/new/deleted sources safely; ignore ordinary non-Markdown and unrelated application-directory changes. Do not claim a filesystem transaction or protection from changes after the gate returns.
- Decode source UTF-8 strictly; strip only Git's output newline, not valid repository-path whitespace. Match naked `private/` references at textual boundaries, without treating ordinary titles such as `Private cloud` as private paths. Cover unreadable-file plus readable-sibling CLI failure and conflicting inherited GIT_DIR success. Retain all existing test cases; use deterministic mutation fixtures.
- Set `GIT_NO_LAZY_FETCH=1` alongside replacement-object isolation. A missing partial-clone object must fail without downloading or modifying Git objects; verify with a local-only disposable promisor fixture.
- Bound native email-pattern matching; include ordinary nested relative private references and the OpenPGP private-key header in generic rules. Cover adversarial long misses/dangling-at inputs in a bounded subprocess, clean-body filename-only redaction, and replacement-object provenance rejection.

Use YAML AST duplicate-key/quoted-scalar checks, not a homemade parser. `yaml@2.9.1` supports Node >=14.6; use `parseDocument`, reject aliases/tags and suppress source-rich errors. Checked 2026-11-17: https://registry.npmjs.org/yaml/2.9.1 and https://eemeli.org/yaml/ .

`reviewed_at` first-pass versus final-review meaning needs BC's decision before real promotion; this gate validates declared syntax only. Real selection, coverage and approvals remain outstanding. Tracking records the technical delivery under review; real-corpus and whole-story acceptance are still outstanding. Do not close the whole story. Baseline was clean before this run refreshed `epic-2-context.md`.

## Verification

- `npm run typecheck` and `npm test` — new matrix/CLI cases and existing regressions pass.
- `PYTHONDONTWRITEBYTECODE=1 python3 tests/fixtures/synthetic-corpus/check.py` — unchanged fixture checks pass.
- `npm run content:check` — expected controlled placeholder rejection; positive CLI cases run only in temporary repositories.
- `node scripts/check-build-isolation.mjs` — disposable build-isolation checks pass; no deployment.
- `git diff --check` — no whitespace defects; inspect lockfile for only the intended dependency addition.
