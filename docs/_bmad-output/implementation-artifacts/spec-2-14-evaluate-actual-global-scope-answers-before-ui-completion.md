---
title: 'Story 2.14: evaluate actual global-scope answers before UI completion'
type: 'feature'
created: '2026-11-23'
status: 'in-progress'
baseline_commit: 'b1c060498fba2e1e1724b6da914a7facc284a5d6'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/_bmad-output/implementation-artifacts/epic-2-context.md'
  - 'docs/development/workers-ai.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Correct schemas, citation IDs and deterministic test results cannot tell BC whether the engine understood a recruiter, answered in the right language or supported each claim.

**Approach:** Prepare versioned global conversation cases and a reproducible evidence-collection and human inspection protocol. Validate the inputs offline. Leave the actual-model run, findings and human assessment unfilled and the pre-UI milestone blocked.

## Boundaries & Constraints

**Always:** Use the three public fictional development copies, never attribute them to BC. Start each case in a fresh global conversation; follow-ups use actual preceding turns, not scripted assistant answers. Separate raw user input from reviewer-only expectations. Keep the A05 warning and actual processing distinction; no new scanning, masking or blocking policy. Preserve access, replay and counters, including A08's undecided usage policy.

**Never:** No live runner, binding, provider/account access, deployment, UI, automatic inference, retry, repair, failover, generated verdicts or numeric release threshold. Do not publish sensitive content. No new acceptance, authorization or status promotion on simulated evidence.

## I/O & Edge-Case Matrix

| Situation | Protocol behavior |
| --- | --- |
| Offline preparation, missing account proof | Validate case inputs only; no output, verdict, call or score |
| Long question or ambiguous referent | Stay within admission limit; inspect actual clarification and linked resolution without feeding expected terms |
| Factual question, lexical miss or missing fact | Compare classification, retrieval, prompt evidence and cited claim separately; distinguish absent support from corpus-wide absence |
| Redirect/refusal or injection | Inspect professional boundaries and appropriate alternative; safe case references rather than sensitive report text |
| FR/EN switch | Inspect actual prose and unmodified original-language excerpt; tags alone do not establish either |
| Failure or unavailable stage | Keep case/turn identity, note not reached vs unknown, no substitute result or rerun |

</frozen-after-approval>

## Code Map

- `tests/fixtures/retrieval/cases.json`, `tools/retrieval/evaluate.ts`, `docs/evaluations/retrieval-2-4.md`: historical scoped lexical baseline with pre-resolved questions, not observed interpretation or global answer quality. Reuse passage identities, not score claims.
- `src/application/{classify-professional-intent,retrieve-evidence,generate-answer}.ts`: application owns interpretation, scoped retrieval and the bounded selected source pool. Validated canonical results can differ from raw model output.
- `docs/development/workers-ai.md`: dated general Free/candidate evidence, no target-account proof or enabled processor. No changes to production wiring or to earlier checkpoints.

## Tasks & Acceptance

**Execution:**
- [x] `tests/fixtures/global-evaluation/cases.json`: define stable raw case and ordered turn inputs, review probes and public passage anchors, pinned corpus and version. Include long, ambiguous/clarification, corporate vocabulary, language switch, documented/missing information, value judgment, commitment, sensitive-personal and injection requests.
- [x] `tools/global-evaluation/preflight.mjs`: fixed local input-only check with no provider imports, operator configuration, writes or result-generation mode. Check identity, global scope, case coverage, turn limits/relationships, expected public anchors and pinned source integrity. Report what was checked, not acceptance.
- [x] `tests/bootstrap/global-evaluation.test.ts`: exercise shipped cases and negative mutations (missing categories, invalid scope/turns/length, stale evidence and result fields); prove the offline command cannot be used to certify output or enable execution.
- [x] `docs/evaluations/global-2-14.md`: document exact offline invocation, gates, authorized-future manual sequence and evidence fields. Bind run to corpus commit and artifact hashes, actual application revision, case version/digest, effective per-role model/config. Separate actual stage observations, per-turn saved output and independent human assessment. Explain claim-to-excerpt inspection, skipped stages, attribution, safe failure references and blocking critical findings. No filled example evidence.

**Acceptance Criteria (original story, not met by preflight):**
- Given configured actual models, pinned reviewed corpus and versioned questions, when explicitly evaluated, then record real outputs, provenance and human judgments separately from deterministic results; never run inference by default or retry automatically.
- Given normal, missing, judgment, commitment, sensitive and injection requests, when humans inspect actual answers, then check citation support, completeness, refusals/redirection, insufficiency and boundaries, preserving safe reproducible references.
- Given long/ambiguous questions, clarification resolution, corporate terms and FR/EN changes, when inspected, then evaluate meaning, response language and original excerpt language, not just declarations.
- Given critical findings or inadequate retrieval, when assessing results, then separate retrieval from generator failures, keep known critical failures blocking public sharing and do not generalize sampled success.

## Implementation Notes

Supervisor approved local preparation only. First possible operator action: independently provide sanitized, dated target-account evidence without agent access; this is not a request to run inference. Writer: no staging/commit, status changes, other agents, skills, external CLI agents, network, operator files, services, private data or configuration. Use only disposable tracked-source snapshots (include four new story files), private short mktemp, clean environment, isolated PID/proc/network with loopback only, installed tools; inspect `/tmp/story-2-12-isolated-verify.sh` for a template. No tests on host; coordinator owns full checks. Preserve exact runtime failures/logs and return immediately to coordinator before retry. Do not change harness or earlier stories.

## Spec Change Log

## Review Triage Log

Three fresh, read-only layers completed together on delivery diff SHA-256 `2c2387bf7c2c87653d2f70955c3016f337a8fa9436552e75870b875af10ce2af`: blind `7c6dc404-8124-4849-b447-773a67e6b999`, edge `723cd4b0-25a1-46cb-a611-9b321e5ccb6a`, verification `abe8b19c-b5c7-4a03-bef4-0bf47ef9bb84`. All reports were collected before triage. Individual verdicts on the reviewed implementation:

| ID | Verdict, disposition and evidence |
| --- | --- |
| B1 | medium / patch: step 6 conflates proposed pre-UI disclosure with observation of the future rendered guide; distinguish them. |
| B2 | medium / patch: the processor also returns a clarification on missing context. Require actual ambiguity decision and no reset, not just a saved clarification. |
| B3 | medium / patch: `answerGenerationInput` includes original question and selected history; document both role projections. |
| B4 | medium / patch: the original dynamic digest identifies bytes but does not prevent prose drift under the same version. Pin exact input bytes and require deliberate updates. |
| B5 | medium / patch: `JSON.parse(Buffer)` can replace invalid UTF-8 before string checks. Decode fatally. |
| B6 | medium / patch: escaped NUL is well formed Unicode but rejected by `intentText`; align fixture text checks without changing visitor policy. |
| B7 | medium / patch: only one expected document per documentary turn. Add a public project comparison and two review anchors; no selection or gold text in the question. |
| B8 | low / patch: 21 turns also exceed the fixed profile count. Name the assertion for what it tests, not independent runtime admission. |
| E1 | medium / patch: malformed UTF-8 inside string data can survive implicit Buffer decoding. |
| E2 | medium / patch: parsing duplicate keys discards earlier values. Exact reviewed-byte pin rejects an inserted duplicate without introducing a new JSON parser. |
| E3 | medium / patch: version and structure alone allow changed questions/probes. Bind version to the checked bytes. |
| E4 | low / patch: unexpected large regular input can allocate before hashing. Check size before reading these fixed, immutable snapshot files. Not a general concurrent-file reader. |
| E5 | low / patch: setup recursively copies the directory before the command checks the inventory. Copy only the fixed regular input files. |
| V1 | medium / patch: no existing assertion distinguishes stat from lstat on a linked fixed path. Add disposable link checks. |
| V2 | medium / patch: substring checks fail to detect leaked diagnostic context. Assert exact stderr for invalid JSON, missing input and other failures. |
| V3 | medium / patch: originally two different same-version inputs could pass but only one digest was asserted. With exact-byte pinning a second success is intentionally impossible; assert independently computed digest on success and reject altered bytes, including whitespace. |
| V4 | medium / patch: shortened allowlist does not catch length-only validation. Exercise duplicated member at constant length. |
| V5 | medium / patch: reversal also changes predecessor kind; duplicate just the turn number. |
| V6 | medium / patch: blanks and isolated surrogates were not exercised independently of length. Test both. |
| V7 | medium / patch: invalid heading does not distinguish a valid but wrong heading. Test the latter. |
| V8 | medium / patch: wrong review language and empty probe could survive regression with current tests. Check both. |

Common roots after individual triage: B4/E2/E3 and changed V3 contract; B5/E1. Remaining items correct the local protocol or add focused input checks/tests without any new command or runtime surface. The writer's completed blocking mission has no active resumable run; supervisor approved inline patches by the coordinator. No re-review attestation to subsequent edits.

## Design Notes

No unresolved local product choice. Four new preparation files plus this spec and sprint tracking; no runtime dependencies or irreversible operations. The external dependencies are genuine: effective Free-account protection and separate authorization, verified real integration, actual outputs and human review. Neither 2.12 nor 2.13 is closed. Stop before UI work.

## Verification

**Verified offline.** The original implementation tree `ba85ba0a3b74e585774bfaeadcdc40a32ed101ab` passed the explicit preflight, full unfiltered Vitest (955 tests) and all four typechecks. Log SHA-256 `12ca28060d90cb180b99fc11746e0f78cffd38278828b2becdae722c82f41396`. Separately, the writer's optional filtered command collected no tests (`sh` did not expand braces); it was not repeated or counted. Sandbox-script preparation initially returned `/bin/bash: line 1: python: command not found`; no test ran. Supervisor checked the unchanged index/tree and authorized `python3` to prepare the same temporary script. No installation or harness changes.

**After corrections:** coordinator inspected the full patch and 291-line review delta (SHA-256 `e55ac3cde128376041f2a1c6cb88c38afd024e546c409cf46a2c9e4968655a49`). Corrected tree `57af6b624faf39de07340933b660b3b3504602cd`: `node tools/global-evaluation/preflight.mjs && ./node_modules/.bin/vitest run && npm run typecheck` passed in a disposable source snapshot with clean HOME, isolated PID/proc/network and only loopback. Case-set SHA-256 `3075022367346d57870a1f663170e29a6ad444f6c1f1d392c092f45a52e3c654`: **10 global cases, 12 turns, three pinned public sources**. All **967 Vitest tests**, including 29 input-preflight tests, and four typechecks passed; `/tmp/sHfKCRb9G/corrected.log` SHA-256 `556fc4a55ba9c8711774ce02b9cd86c6cb20ecc2771d41e24eb2b9c441340ec5`. Only this handoff changed afterward. No browser/remote evaluation was run. Test coverage concerns the input side of the matrix, not observed stage behavior or quality.

**How to inspect:** In equivalent isolation run the command above. Consult the [protocol](../../evaluations/global-2-14.md): check both review-only anchors for the cross-project comparison, distinguish classifier clarification from core reset, inspect the FR/EN sequence and original-language excerpt requirement, and ensure controlled errors or unobservable stages cannot be replaced with a verdict. There is no live command here.

**Blocked before UI:** none of the four actual-output/human-assessment ACs can be concluded. No account-specific protection, authorized verified real processor, observed answers or human assessments. First possible operator action: provide dated, sanitized evidence for the intended account's effective Free plan, exhaustion protection and exclusion of Paid/Gateway paths without granting agent access. General published terms are not that evidence. A separate authorization would still be required afterward. Spec and sprint stay `in-progress`; the local commit is a preparation checkpoint only. No A08 decision, launch or transition to UI.
