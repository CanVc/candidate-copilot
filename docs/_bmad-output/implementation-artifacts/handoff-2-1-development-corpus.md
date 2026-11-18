# Story 2.1 — accepted synthetic development corpus

## Decision and scope

BC selected and reviewed the three fictional sheets and approved the on-disk preparation plan and continuation (choice 1), observed at `2026-11-18T08:45:47Z`, as recorded in `spec-2-1-approve-synthetic-development-corpus.md`. This is the current final owner **development-review** decision for the proposed prepared revision, including public metadata and development-only warning updates; it is not an invented historical first review, a migrated pilot approval, or a claim of another human review at the later preparation instant. Preparation edits were performed at `2026-11-18T08:46:57Z`.

Story 2.1 is **done for the owner-approved amended development scope** after independent review, parent patch inspection and the final parent verification recorded below. The original worker checks remain separately attributed implementation evidence. Story 2.2 development can use these three public Markdown copies without real interviews or a prior question-to-document map. This does not authorize recruiter release, deployment, indexing, application model calls, D1 changes, or a repository commit/push, and does not establish real-career acceptance. Story 2.0's history remains unchanged.

## Accepted inventory

All paths below are relative to `content/public/`. Every sheet retains `created_at: 2026-11-17T14:31:20Z`, its stable ID, original title, narrative and local links. The only body changes replace obsolete no-approval wording with explicit development-only authorization while preserving fiction and non-attribution. Each first-person narrator is fictional and unrelated to BC; no narrative date, metric, contribution or result is a BC achievement.

| Sheet | Stable document ID | Prepared raw-byte SHA-256 |
| --- | --- | --- |
| `mission-regie-collections.md` | `0eaf8b1d-791d-4c60-9234-168a6a03acbd` | `62dc67fcd7f288d58a6851dba1e07d447b00e0f7381d375b92ff07e7219522ea` |
| `projet-reperage-reserves.md` | `a53a192f-51d5-4537-8200-427a09ee1ea3` | `18dd57a7dc4eeeb8c1c86d22122125068f859dfb04d117b7ffac3c2d3ae10121` |
| `projet-prototype-prets.md` | `87ddaeda-8ee4-4056-9931-5ebf7b677875` | `945a1f3d2d853205085fec7f6246bd1a415b3c09e9b3b65913e4fcba35f01e2a` |

Prepared-copy metadata:

- `visibility: public` means eligibility within the existing public-Markdown development boundary, not recruiter-publication permission.
- `reviewed_by: "BC — revue finale pour le développement synthétique uniquement"` and `reviewed_at: "2026-11-18T08:45:47Z"` record the decision above, not approval of fictional events as facts.
- `modified_at: "2026-11-18T08:46:57Z"` is the actual administrative/warning edit time, not a fabricated review event.

The selected private originals and three versioned fixture sheets remain byte-for-byte identical to their pre-task contents. Fixture hashes are pinned by regression tests, and manual comparison confirmed the selected private originals still match those fixtures and baseline Git blobs. They retain empty approvals and absent visibility and remain invalid public inputs as-is. Only the selected three private sheets were read; no deleted real file was reconstructed.

The former public README was removed; guidance now lives in `content/README.md`, outside eligible Markdown. The self-contained invalid-README regression remains; no exemption, validator/policy change or source-boundary expansion was made.

## Verification

Worker verification completed on 2026-11-18, before handoff and parent staging. These results are the worker's observations, not a claim about the parent's later index, review or final patch verification:

| Command / check | Result |
| --- | --- |
| `npm run content:check` | `{"ok":true,"count":3,"sourceRevision":null,"diagnostics":[]}` |
| `npx --no-install vitest run tests/bootstrap/public-content.test.ts` | 117 tests pass, including exactly three prepared sheets, preserved IDs/narratives/provenance, original-draft rejection and existing safety/provenance regressions |
| `PYTHONDONTWRITEBYTECODE=1 python3 tests/fixtures/synthetic-corpus/check.py` | Six original-fixture checks pass; sheets unchanged |
| `npm run typecheck` | All four TypeScript configurations pass |
| `npm test` | 45 workstation fixture cases and 192 Vitest tests in six files pass |
| `git diff --check` | Pass |
| Exact prepared copies in disposable Git repositories (focused test) | Local success has null revision; old snapshot rejects new copies; committed exact copies succeed at the temporary full SHA; subsequent changed bytes reject with null revision |
| `npm run content:check -- --revision 256e757a3fff3c52fbff74cdbd224befde1b98ea` | Expected nonzero rejection: three inputs, null revision, `SNAPSHOT_MISMATCH` |
| Byte comparisons / scope inspection | Original private sheets equal fixture sheets and baseline fixture blobs; validator/policy/fixture-sheet diff empty; worker observed no staged files before handoff (before parent staging); selected-scope changes only |

**Independent parent gate: complete (2026-11-18).** Three fresh-context review layers completed at the inherited model capability. Nine verified test/documentation findings were patched and inspected; the author-instruction discoverability follow-up B10 is recorded in `deferred-work.md` under the mandatory agent-context deferral policy. It does not change the current owner-approved synthetic-only exception or relax real-content review rules.

Parent verification after the patches passed all 117 focused cases in verbose mode with no skips, six fixture checks, four TypeScript configurations, 45 workstation cases and 192 total Vitest tests on the WSL/Linux host with Node 24.22.0/npm 11.19.1. The source gate accepts exactly three local inputs with null revision; baseline SHA validation fails safely with `SNAPSHOT_MISMATCH` and exit 1. Parent also checked complete-body suffix detection, pinned prepared-byte hashes, descriptor-aware read isolation, original-input integrity and unchanged validator/policy/source-fixture bytes. The approved public sheets remained byte-unchanged during review corrections. Parent staged the approved changes for inspection; the worker's earlier empty-index observation is historical, not the final index state. No actual repository commit or push was made, as explicitly excluded by the approved plan.

The baseline repository HEAD remains `256e757a3fff3c52fbff74cdbd224befde1b98ea`. These prepared public copies are **uncommitted**. Their hashes identify the prepared bytes but are not a Git source revision. Temporary test commits certify only disposable test snapshots, never this actual repository. Actual committed provenance awaits a separately authorized commit and rerun of `npm run content:check -- --revision <full-commit>` against the exact committed public set. Do not label new worktree bytes as old HEAD or consume mutable worktree bytes as a hosted committed snapshot.

## Accepted limitations and downstream obligations

- BC accepts documentary gaps. No advance question-map/completeness prerequisite blocks 2.1. The fixture guide's 14 question examples are optional development/evaluation examples, not exhaustive coverage requirements or executed model results.
- No budget, financial savings, current use after December 2024, prototype productivity gain or other unsupported conclusion may be invented. A missing passage means insufficient retrieved evidence in the submitted scope, not proof that no information exists anywhere. Never follow links or widen scope to compensate.
- Story 2.4 retrieval, 2.11 generation and 2.14 actual-model evaluation still owe grounding, missing-information and scope evidence; this task ran no application model and proves no semantic answer quality. Preserve explicit fiction/non-attribution through chunking, retrieval, prompts, evaluation and display.
- Before recruiter use, replace fiction with BC-selected real-portfolio material, genuine factual/standalone-comprehension/publication review, actual metadata, deliberate copying and unchanged safety/provenance checks. Real pilot history is not renewed or replaced by this approval. OPEN-1's real-portfolio/catalog obligations and all privacy/provider, browser, dependency, operational and launch gates remain visible in planning.
- Story 3.1 still owns project Resource descriptors/maps; no runtime, API, database or selectable editorial-type change was made.
