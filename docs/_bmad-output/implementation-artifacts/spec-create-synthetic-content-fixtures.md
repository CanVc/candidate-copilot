---
title: 'Create a three-document synthetic corpus for local development'
type: 'chore'
created: '2026-11-17'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** BC's previous Linux SSD was formatted without a known backup of the ignored private corpus. BC will recreate the real documents later and explicitly requests two entirely fictional project sheets and one fictional professional-context sheet to validate principles and continue development without using or inventing BC's career facts.

**Approach:** Create a coherent French-language sample corpus, following the existing A/B editorial structures, for an explicitly fictional museum collections scenario unrelated to BC. Keep every sheet visibly labeled as synthetic and version the samples under `tests/fixtures/synthetic-corpus/`, outside the real public knowledge base. Include one operational project and one non-production prototype, clear individual versus collective contributions, bounded observations, and unanswered questions. A short English README explains their safe use and gives French example questions and expected documentary coverage. Do not publish or copy anything to `content/public/`, fabricate human approvals or checkpoints, reconstruct claimed career history, change Story 2.0's historical acceptance, mark Story 2.1 complete, implement the broader Story 2.1 validator, deploy, or commit/push.

</frozen-after-approval>

## Implementation Notes

- Route assessment: no intent gaps or irreversible actions. This is a narrow standalone fixture task supporting Story 2.1, not implementation or acceptance of the entire story; leave `story_key` unset and preserve sprint tracking. Repository is clean on `main` at full revision `ceb88d7b0f62cafcefd8b1c6366c976acf6ae436`.
- Footprint: this task record; `tests/fixtures/synthetic-corpus/README.md`; and three Markdown inputs under its `documents/` directory: `mission-regie-collections.md`, `projet-reperage-reserves.md`, `projet-prototype-prets.md`. No runtime code, dependencies, build inputs, provider access, private sources or local database changes.
- Reuse `tools/content-authoring/templates/professional-context.md`, `templates/realization.md` and `types.md` for the A/B structures. French prose is the fixture input language, matching the existing authoring formats; operational documentation remains English. Use stable newly generated UUIDs and actual UTC creation/edit timestamps for these newly created files. Review fields remain empty strings and `visibility: public` is absent: these fixtures are not approved public documents and should not pass the final public-metadata gate as-is.
- Each sheet must independently identify its narrative as fiction, not a BC achievement, interview, real user outcome or actual evaluation result. Fictional metrics and events belong only inside this explicitly fictional scenario. Cross-file references must resolve locally; each sheet remains readable on its own. The README distinguishes scripted expected answers from executed retrieval/model tests and notes that the real corpus and final publication approval remain outstanding.
- Verification plan: standard-library checks for exactly three sheets, UUID uniqueness, real quoted UTC metadata, empty review fields, absent public visibility, per-file fiction warnings, expected A/B headings and safe local Markdown links. Inspect narrative consistency and question-to-document coverage. Run whitespace checks and the existing tests/typechecks as applicable; no synthetic success may be reported as real-corpus acceptance.
- Implemented the three independently labeled French fictional sheets and English usage guide, with 11 future question/coverage cases. The mission and two projects share a consistent 2024 timeline, collective contribution and decision boundaries. The inventory scenario contains bounded fictional observations; the loan prototype explicitly has no deployment, operational usage or productivity evidence. Renamed the inventory fixture to `projet-reperage-reserves.md` to avoid suggesting official regulatory inventory work.
- Initial verification passed: standard-library metadata/UUID/headings/link/provenance checks, scripted arithmetic consistency, unchanged `content/public/`, 11 documented coverage expectations and whitespace checks. WSL/local Node 24.22.0/npm 11.19.1: all four TypeScript configurations and `npm test` passed (45 Bash fixtures, 75 Vitest cases). These are local structural/regression checks, not retrieval, real-model, publication or human acceptance. Final fixture checks will be repeated after review.
- Independent fresh-context Blind Hunter review completed using the inherited session model. Its six findings were checked against the files and patched; none is deferred. The only configured review layer was Blind Hunter. Clarified anomaly-entry versus object counts and paired-gain statistics; removed incidental personal history from the portable guide; added explicit non-attribution and negative public-metadata coverage.
- Added the small fixture-only `tests/fixtures/synthetic-corpus/check.py` to make the previously inline checks reproducible, without creating the Story 2.1 public validator or changing application test wiring. The README now documents 14 future question cases, three expected public-validation rejections, and the read-only command `PYTHONDONTWRITEBYTECODE=1 python3 tests/fixtures/synthetic-corpus/check.py`. This script checks file structure and scripted arithmetic, not real outcomes or authenticity of approval/creation events. Actual file timestamps were captured with `date -u '+%Y-%m-%dT%H:%M:%SZ'`; no historical time was inferred from filesystem metadata.
- Final verification after all patches: the six fixture self-check tests passed; `npm run typecheck` passed all four configurations; `npm test` passed 45 Bash fixtures and 75 Vitest tests; `git diff --check` passed. A path-scoped `git diff --exit-code` confirmed no changes to `content/public/`, sprint tracking, package pins or lockfile. No application-model call, retrieval, corpus promotion, deployment, commit or push occurred. Human inspection of the fictional sheets remains separate from these checks; real-corpus and publication acceptance remain future work.

## Review Triage Log

| Finding | Verdict / disposition | Evidence |
| --- | --- | --- |
| Incidental real file-loss history in portable fixture README | low / patched | The guide's first paragraph unnecessarily carried real context. Removed that circumstance while retaining explicit synthetic provenance and non-attribution. |
| Missing explicit BC-attribution question | medium / patched | Warnings existed in every sheet but the future question matrix did not directly exercise attribution. Added the explicit BC question with an expected rejection of the inference. |
| Anomaly-entry count could be mistaken for affected-object count | medium / patched | The original 150/600 wording did not define the relationship. The sheet now states multiple entries can concern one object and the distinct-object count is unknown; the README adds a percentage-inference case. |
| Difference of medians could be mistaken for paired individual gains | low / patched | The original text excluded total financial/labor inference but not paired-gain inference. Added explicit unavailable individual timings and a corresponding future question. |
| Missing documented negative public-metadata cases | low / patched | The narrative described expected rejection but no case table existed. Added absent-visibility, empty-reviewer and empty-review-time expectations, explicitly not executed public-validator results. |
| Bespoke verification was not reproducible from a delivered command | medium / patched | Initial checks existed only in the parent execution transcript. Added a read-only standard-library self-check and documented its command, six cases and limits, including that timestamp syntax does not authenticate creation history. |
