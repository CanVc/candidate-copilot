---
title: 'Refine Story 2.0 editorial investigation and document contracts'
type: 'chore'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2.0 already defines an interview agent, document types, templates and real pilots, but does not explicitly require analyst-like exploration of blind spots or distinguish a structurally filled template from an independently understandable, factually faithful document.

**Approach:** Amend Story 2.0 and align PRD §4.3.1 with BC's approved refinement: adaptive investigative interviews; per-type editorial contracts and interview guides; common publication metadata plus type-specific required, optional and conditional sections; distinct handling of forgotten, unknown, confidential and inapplicable information; factual and outside-reader comprehension checks; real pilots proving those behaviors. This is a planning amendment only, not execution of Story 2.0. Preserve all private/public, consent, version/reapproval and resume safeguards. Do not install Builder, select a taxonomy/provider, introduce mandatory public metadata/runtime contracts, publish content, change sprint statuses, or commit/push.

</frozen-after-approval>

## Implementation Notes

- Route facts: no remaining intent gaps; no irreversible operations or external side effects; small documentation footprint with no new callable application interface. Source baseline: clean main at full revision `ffc581e614baffed7e3a0f852be4f66e8688584a`.
- Scope: `docs/_bmad-output/planning-artifacts/epics.md` Story 2.0 and current approval notes; `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md` §4.3.1 and amendment summary; append a decision entry to that PRD directory's `.memlog.md`. This new spec records only this amendment; do not rewrite completed historical specs or prior log entries.
- Preserve 55 stories and 258 acceptance scenarios by refining the existing nine Story 2.0 scenarios. Keep every other story, original outline approval count 54, requirements IDs, 11 open checkpoints and sprint status unchanged. BC approved the refinement's intent, not an as-yet-generated detailed text, implemented method, actual pilot or publication. Record that distinction in current approval notes.
- Require progressive, small-batch questioning guided by the account and document type, not a mechanically exhaustive questionnaire. Applicable investigation angles include implicit context, ambiguous terms, contradictions, constraints, choices/alternatives, personal versus team contribution, evidence, observable results, limitations and learning.
- Each type has purpose, recruiter questions, boundaries/relationships, completeness criteria, a type-specific Markdown template and investigation guide. Do not fill unknown required facts with inventions or equate completeness with populated headings. Confidential material must not be solicited or copied into public-ready output; missing required material can block readiness. Factual/comprehension gaps loop back to BC before explicit validation.
- Preserve public metadata `document_id`, `visibility: public`, `created_at`, `reviewed_by`, `reviewed_at`, with existing optional public `title`, `topics`, `aliases`. Extra editorial type/template-version/preparation-state metadata and its location remain future design choices; working notes/checkpoints are not public-ready documents.
- Record BMad Workflow Builder as the intended authoring aid, not a product acceptance requirement, mandatory service or already-installed dependency; retain final packaging choice with BC during execution. One interview agent may carry both investigative and outside-reader checks.
- Verification: YAML/frontmatter, exact story/scenario counts and unchanged story IDs/statuses, PRD FR IDs, existing links/anchors in changed documents, append-only PRD log, unchanged non-2.0 story text/runtime/architecture/build/private boundaries, and `git diff --check`. Independently review the diff and fix supported findings. Application, hosted, browser and model tests are not evidence for this documentation-only task.
- Implemented the targeted Story 2.0/PRD amendment and append-only decision log. Recorded approval of the refinement's intent without claiming acceptance of generated wording or actual method execution. All other stories, planning/runtime/UX documents, code/configuration and sprint tracking are unchanged; no Builder installation, private material processing, content publication or VCS recording was performed.
- Independent fresh-context same-model Blind Hunter review returned five supported gaps; a separate fix worker patched all five in the story and PRD: draft-passage-grounded comprehension evidence; comprehension reapproval even for factually unchanged rewrites; completeness/applicability criteria included in versioned templates and pilot revalidation; supplemental negative-path probes clearly separated from mandatory real pilots; BC-controlled pause/stop and clear progress/blocking rules without pressure to disclose.
- Host-side verification passed with `python3 /tmp/candidate-story20-refinement-vHmdZ3/validate.py`: YAML/frontmatter; exactly 55 unchanged story IDs, 258 scenarios and nine Story 2.0 scenarios; unchanged other-story text and approval counters; stable 22 PRD FR IDs; PRD changes restricted to amendment note and §4.3.1; append-only log; all sprint statuses unchanged with Epic/Story 2.0 in backlog; matching refinements in story/PRD; 17 local links/anchors; preserved private Git boundary, frozen intent and whitespace. The temporary checker is verification evidence, not delivered application tooling.
- Completion is limited to the planning amendment. BC still reviews the generated wording. Authoring-tool setup, taxonomy/formats and real interviews/pilots remain future Story 2.0 work subject to the Epic 1 prerequisite; they are not deferred defects in this amendment. No review finding remains deferred.

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Outside-reader check could reuse hidden interview knowledge | medium | The initial comprehension criterion did not require evidence from the draft itself. Patched story/PRD to identify supporting draft passages for each applicable completeness criterion or flag a gap; no separate agent or implementation mechanism mandated. |
| Revision reapproval omitted comprehension | medium | The prior revision clause only renewed factual/publication review. Added comprehension/completeness review for changed text, explicitly including factually unchanged rewrites. |
| Pilot approval did not explicitly bind completeness/applicability criteria | medium | Criteria were introduced independently of version-bound acceptance evidence. Included them in versioned templates and final agent/template evidence; changing criteria triggers affected-pilot revalidation without new public metadata. |
| Successful pilots need not cover exceptional behavior | medium | The initial pilot clause demonstrated investigative success but not readiness blocking, justified omission or correction after a comprehension gap. Required future evidence for those cases; supplemental controlled probes may cover cases absent from genuine pilots but never replace them or count as achievements. |
| Adaptive questioning lacked progress/deferral rules | medium | Existing checkpoints supported resume but did not explicitly bound clarification pressure. Added BC-controlled pause/stop, progression on applicable completeness, blocked private checkpoints for unavailable required facts and no exhaustive pursuit of optional gaps. |
