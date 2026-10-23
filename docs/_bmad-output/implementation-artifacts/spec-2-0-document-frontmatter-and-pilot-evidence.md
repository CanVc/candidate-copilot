---
title: 'Story 2.0 follow-up: explicit document frontmatter and pilot evidence'
type: 'chore'
created: '2026-10-23'
status: 'done'
route: 'oneshot'
baseline_commit: 'd1285be8bb80c95bcb1bdd69be25a98b955f1ab0'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Current private pilot documents and reusable templates do not consistently expose the owner-approved frontmatter. Acceptance tracking predates the real interviews, so exceptional-case coverage needs checking against existing private evidence rather than repeating interviews.

**Approach:** Correct the two current pilot documents without changing their narrative or inventing historical timestamps, leaving review fields empty. Add a content-folder reminder and align the existing authoring templates and planning metadata contract: stable document_id, created_at, modified_at and title; known document timestamps are quoted UTC timestamps with time and Z. Preserve a known date-only creation value as an explicitly unresolved legacy exception rather than guessing its hour or replacing document creation with this edit's time. Preserve historical archives exactly. Reconcile current private checkpoints with the changed bytes, archive previous reviews and invalidate current approvals. Inspect only the authorized authoring subtree for existing omission/blocking/comprehension evidence. Record the owner's confirmation that processing/consent is accepted without claiming technical verification of unresolved provider retention or copies. No publication, source edits, private data in tracked artifacts, story closure, or new runtime validator.

</frozen-after-approval>

## Implementation Notes

- Route facts: no unresolved intent choices; reversible Markdown/JSON edits and owned private snapshots; no network, deployment or destructive operation. Narrow metadata/evidence change, no new callable application interface. The tracked worktree was clean at the baseline above.
- Public minimum previously required document_id/visibility/created_at/reviewed_by/reviewed_at, with title optional; modified_at and UTC grammar were not part of the Markdown contract. Align PRD 4.3.1, architecture consistency/frontmatter/launch clauses and Story 2.0/2.1 metadata clauses. Draft review placeholders are empty strings and never evidence of approval or public eligibility. Public fields must be real and nonempty before Story 2.1 promotion.
- Reusable resources: tools/content-authoring/{templates/,types.md,workflow/review.md,workflow/checkpoint.md,README.md,versions.json}; update template versions and JSON skeletons coherently. Keep internal checkpoint schema 1 created_at as its existing date-only identity, using document_timestamps for full frontmatter times. No schema/helper change. Add content/AGENTS.md outside content/public and content/private; no instruction file is knowledge evidence.
- Private execution: current pilots/checkpoints are selected by their current checkpoint draft references, not historical revision filenames. Preserve exact old document/checkpoint bytes under private revision snapshots before edits. Existing manual drift in one pilot must be recorded, not erased or retroactively approved; refresh literal criterion passages to the selected current narrative and request renewed reviews. Keep all facts and review history private. Do not read source code, PDFs, neighbouring career folders, or session logs; existing checkpoints/evidence suffice.
- Evidence: write a private summary of which exceptional cases are actually supported and which are not. The owner's validation of investigative questioning and fresh-session restoration is a human attestation, not an independently replayed test. Processing acceptance is an owner decision with existing technical limits preserved; no new source processing consent or publication approval is fabricated.
- Verification: synthetic helper tests; deterministic checks of current frontmatter, exact UTC instant conversion, unchanged narrative/archives, checkpoint identity/sequences/revision/history/null approvals/digests and literal passages; Git ignore/tracked-path checks; whitespace and generic-contract consistency. Do not print private facts, paths or hashes in tracked acceptance notes. Keep Story 2.0 in-progress and pilot A outstanding.
- Implemented agent/release/templates/procedures 1.0.2 with unchanged guides/semantic criteria 1.0.0 and checkpoint schema 1. PRD, architecture and epics agree; content/AGENTS.md is outside the knowledge corpus. Empty draft reviews remain placeholders, not public eligibility. Historical design/construction evidence and historical private archives were not rewritten.
- Current private document bodies are byte-for-byte preserved. Known creation instant converted exactly to UTC; a missing historical hour is explicitly preserved as missing. Current checkpoints were saved via the existing structural helper with new revisions, exact manifest versions, archived historical approvals and null current reviews. A pre-existing document/checkpoint mismatch was recorded rather than silently undone or approved; literal references were reconciled with the selected current narrative. Existing source files were checksummed locally solely for integrity, not interpreted or sent to the reviewer.
- A private evidence assessment records actual omission/comprehension-correction cases, the owner's questioning/resumption and processing confirmations, and remaining required-gap/non-production demonstrations. No new real pilot, publication authorization, provider audit or consent backdating was fabricated. Story 2.0 remains in-progress.
- Final local verification: 34/34 authoring unittest cases PASS; two save operations and two current-vs-previous checkpoint validations PASS; direct metadata/body/identity/review-history/private-file-integrity checks and UTC rollover probes PASS. Generic whitespace/private-marker checks and Git private-path exclusion PASS. No application, browser, deployment, provider-policy or runtime ingestion checks were run or claimed.

## Review Triage Log

A fresh-context same-model reviewer inspected generic changes only. No private authoring records or session history were shared. Eight findings were returned; no other review layers were required for this documentation/metadata correction.

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| document_timestamps lacks a defined shape/skeleton | low, patched | Added nullable creation/modification entries to both skeletons; checkpoint procedure defines exact frontmatter synchronization, date-only legacy status and the helper's enforcement limit. Regression check covers skeleton defaults. |
| Acceptance history looks like current open work | medium, patched | Marked both the scenario matrix and former open-gates list explicitly historical; current owner confirmations and remaining work are stated separately. |
| Template test discards duplicate keys | low, patched | Count parsed pairs and distinct keys before constructing the dictionary; duplicate keys now fail. |
| Missing direct UTC/legacy verification | low, patched | Private read-only verification checks exact old/new creation instant, untouched date-only value and two UTC day-rollover examples, alongside actual unchanged narrative and metadata/checkpoint bindings. This is not a runtime normalizer or a future ingestion validator. |
| Reminder path assertion does not prove ingestion/build isolation | low, rejected | The test asserts only reminder existence/location, not ingestion or build safety. No ingester was added; public-source validation remains Story 2.1. Final verification explicitly disclaims new ingestion/build proof, so adding application machinery here would exceed the metadata correction. |
| Manifest checks omit agent/procedure declarations | low, patched | Added a generic regression covering agent and changed procedure declarations against the manifest, plus timestamp skeleton defaults. |
| No reproducible 1.0.2 test totals | low, patched | acceptance.md now records the exact unittest command, 34/34 result, private checkpoint/body/integrity checks and limits, separate from historical 31-test results. |
| Public reviewed_at event ambiguous in existing two-pass review | medium, deferred | Current drafts remain private with empty fields, so no timestamp semantics or approval is fabricated. Existing first-pass-versus-final-review semantics need owner clarification before public promotion, recorded in deferred-work.md rather than silently choosing a new policy. |
