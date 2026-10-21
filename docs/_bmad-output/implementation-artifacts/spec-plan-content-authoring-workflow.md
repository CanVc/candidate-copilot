---
title: 'Plan the content-authoring workflow as Story 2.0'
type: 'chore'
created: '2026-10-21'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 2.1 requires actual public professional content but leaves its creation method implicit. BC wants an interview agent to help elicit raw information and formalize it into reliable documents, before the technical public-corpus work.

**Approach:** Add Story 2.0 to define and pilot the editorial workflow, one interview agent, the finite V1 document-type inventory, a Markdown output format for each type, and one real BC-validated pilot per type. Synchronize affected current planning sources, traceability, sequencing and sprint tracking without renumbering existing stories. This task creates the planning story only: do not build the agent, choose the final taxonomy or fabricate pilots. Preserve private/public boundaries, explicit BC publication approval, existing runtime contracts, approved visual design and all unrelated acceptance reservations.

</frozen-after-approval>

## Implementation Notes

- Route: documentation-only synchronization with explicit scope supplied in the conversation; no remaining intent gap or irreversible action. Actual taxonomy, agent packaging and provider choice are deliverables of the future story, not decisions to guess now. No code, schema, dependency, deployment, paid service or private-data processing is required. No commit is requested.
- Source baseline: `225447db0bfb18bb6a1a2f8a5b5b38f1db6844c3`; clean `main` at entry. This is not execution of Epic 2 or Story 2.0; leave Epic 2 and the new story in backlog.
- `docs/_bmad-output/planning-artifacts/epics.md`: add 2.0 before 2.1, retaining all other IDs; update story/scenario totals and describe the new scope authorization without implying separate approval of generated detailed criteria. Extend FR-9/AR7 and OPEN-1 traceability. Clarify 2.0 → 2.1 → public indexing and 3.1 ownership of project Resource descriptors/maps.
- Story 2.0 must be demonstrable without the future app, index or runtime provider. Require a reusable invocable interview-agent definition and versioned instructions/templates outside indexed content; free narration, targeted questions, correction, pause/resume, factual versus team attribution, unknowns, human review and explicit publication eligibility. Each BC-approved V1 document type needs purpose, recruiter questions, required/optional sections, missing-information rules and one genuine corrected pilot. Pilot acceptance is not publication or corpus completeness.
- Private raw notes, drafts and resume material stay under local gitignored `content/private/`. Non-sensitive reusable tooling is versioned outside both private material and `content/public/`; no auto-promotion. Document actual agent/provider/session-log processing and BC consent before sending nonpublic material remotely; local file storage alone is not a confidentiality guarantee. Never relax deployed application's public-only prompt/evidence boundary.
- Under planning artifacts, synchronize `briefs/brief-candidate-copilot-2026-09-10/{brief.md,addendum.md}`, `prds/prd-candidate-copilot-2026-09-11/{prd.md,addendum.md}` and `architecture/architecture-candidate-copilot-2026-09-11/{ARCHITECTURE-SPINE.md,RUNTIME-CONTRACTS.md}` with concise ownership/boundary references, not new runtime mechanisms. Extend OPEN-1 rather than inventing a new FR or declaring content decisions closed.
- `ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md`: explain that authoring is outside recruiter UI; document types are not new selectable Resource types. Keep `DESIGN.md`, mocks, recruiter guide, historical reports/impact notes and old specs unchanged. `reviews/open-acceptance-items.md`: reference the expanded content obligation while keeping audit A05–A10 open and unmodified in meaning. Append dated entries to the four affected `.memlog.md` files, retaining prior bytes.
- `docs/_bmad-output/implementation-artifacts/sprint-status.yaml`: add `2-0-define-and-pilot-the-content-authoring-workflow: backlog` before 2.1 and note dependency; preserve every prior status and reservation. Update `content/public/README.md` with the planned handoff; do not add private placeholders or real content.
- Verify changed Markdown local links/anchors, YAML parsing, 55 unique stories and matching sprint entries, exact scenario count, intact FR-1..22 and AD-1..18, original statuses, append-only logs, unchanged runtime schemas/visual assets/historical reports and absence of tracked private files; run `git diff --check`. Use an independent read-only review and fix supported findings. No application/model/browser tests are relevant to this planning change.
- Implemented the story and synchronized 15 current documentation/tracking files. Preserved the original 54-story outline approval count as historical approval metadata, recorded 2.0 separately in additionalStoryScopeApprovals, and set the current story count to 55. Generated 9 new Given/When/Then scenarios (258 total); all original story IDs/statuses and the 11 open checkpoints remain. DESIGN, mocks, user guide, dated audits, old specs and runtime schemas were deliberately not rewritten.
- Independent same-model fresh-context Blind Hunter review returned seven evidence-backed documentation gaps. A separate fix worker applied all seven: explicit corpus coverage evidence, private version-bound pilot approvals, final-version revalidation, fresh-session resume demonstration, BC-controlled remote-input screening, authoring-copy retention/deletion disclosure, and revision/reapproval. These refine the authorized editorial workflow; no final taxonomy, provider, storage mechanism or fixed retention duration was selected. No findings were deferred.
- Final host-side document verification passed via `python3 /tmp/candidate-content-story-0WQ1px/validate.py`: YAML/frontmatter, 55 unique story headings and matching sprint entries, 258 scenarios, 22 FR/18 AD IDs, 93 local links/anchors, unchanged previous statuses/reservations, append-only logs, preserved runtime schemas/audit A05–A10/visual-history files, private Git boundary and diff whitespace. The temporary checker is verification evidence, not delivered application tooling. This completes only the planning amendment; BC still needs to review the generated story criteria, and 2.0 remains unimplemented in backlog.

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Corpus completeness has no acceptance evidence | medium | The new 2.1 handoff assigned coverage, but its final scenario only selected public information. Added a BC-approved question-to-document coverage record with accepted limitations/deferred gaps; pilots imply neither universal answers nor full OPEN-1 closure. Patched existing scenario and PRD/architecture handoff. |
| Pilot approval cannot be tied to identifiable versions | medium | The acceptance record named types/templates/outcomes without pilot or method revisions. Added a private evidence record binding opaque pilot IDs/revisions, final agent/template versions and dated BC approval, plus a safe versioned summary that excludes private facts/paths/hashes. |
| Refining prompts/templates can invalidate earlier pilot evidence | medium | Initial wording accepted pilots before refining the delivered method. Require rerunning affected steps and reconfirming pilots against the final delivered versions. Patched story, PRD and architecture. |
| Resume promise lacks a fresh-session demonstration | medium | A checkpoint alone did not prove independence from hidden conversation history. Require demonstrated resumption in a fresh authoring session preserving BC corrections, confirmed/unknown facts and next questions. |
| Secret/confidential-input exclusion has no pre-transmission workflow | medium | Provider consent did not control automatic attachments/context. Added BC-controlled review/selection/sanitization and attachment/context inspection/control before remote transmission, without promising comprehensive automatic redaction. |
| Authoring copy lifecycle is implicit | medium | Session/log disclosure omitted retention, deletion procedures and unavoidable copies/limits. Require those disclosures for working files and tool/provider-managed copies; explicitly distinguish them and avoid assuming runtime Conversation retention applies. No duration was selected. |
| Updating reviewed documents can preserve stale approval | low | The new creation workflow did not specify its correction/reapproval loop despite the content-maintenance claim. Added stable document_id preservation, changed-fact identification and renewed factual/publication review before revised text becomes eligible. Simple documentary correction, no CMS feature. |
