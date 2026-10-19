---
title: 'Synchronize approved Candidate Copilot planning documents'
type: 'chore'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The alignment audit found that the brief and current PRD/UX navigation still describe superseded policies or already-completed architecture work. Readers can mistake historical impact notes for current contracts.

**Approach:** Synchronize the brief/addendum, PRD/addendum and Experience with already-approved decisions and the current architecture/runtime contracts. Mark the old architecture impact note as historical and link its resolved adaptations to their current owners. Preserve the audit and record genuinely unresolved acceptance questions without selecting new product or technical policy. Preserve approved UX, stable FR/AD identifiers, safety/retention boundaries, historical decision provenance and no-implementation disclaimers. Append synchronization events to the affected decision logs. The user explicitly permits the existing untracked audit reports to remain and requests no commit.

</frozen-after-approval>

## Implementation Notes

- Route assessment: no intent gap, irreversible action, deployment, code/API/schema change or external side effect. This is a bounded documentation-only synchronization; use oneshot.
- Source baseline: `c9cb363aea928192b666dc458c5ebdef94028f7c`. Existing untracked `planning-artifacts/reviews/` belongs to this session's audit and must be preserved.
- Under `docs/_bmad-output/planning-artifacts/`: update `briefs/brief-candidate-copilot-2026-09-10/{brief.md,addendum.md}` for manual deletion requests, creation-based 90-day content retention plus metadata-only audit exception, optional on-demand projects and scoped cited factual redirection. Reuse the later approved PRD decisions; do not invent deletion SLAs.
- Update `prds/prd-candidate-copilot-2026-09-11/{prd.md,addendum.md}` to link completed Resource/scope/session contracts and distinguish implementation proof from unresolved decisions. Give `architecture-update-needed.md` a current disposition map above its retained historical analysis.
- Update `ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md` to remove live claims of unchanged PRD/question-only payloads/pending contract definitions. Preserve sketch approval, geometry/copy/accessibility deferrals, original-scope retry and lifecycle proof requirements.
- Reuse `architecture/architecture-candidate-copilot-2026-09-11/{ARCHITECTURE-SPINE.md,RUNTIME-CONTRACTS.md}` unchanged as current technical authority. Do not alter DESIGN, guide, mocks, old reports or historical log entries.
- Add `reviews/open-acceptance-items.md` as one linked open-question register for audit A05–A10: visitor-entered sensitive data, backup restore/deletion, creation origin policy, measured recovery execution bounds, lost creation response and conditional text contrast. Record owners/gates/evidence; select no new solutions, caps, endpoints or palette.
- Append dated synchronization events to the three affected brief/PRD/UX decision logs. Preserve source audit report and JSON bytes.
- Validate Markdown file/anchor links, stable FR/AD IDs, unchanged technical/visual/audit source hashes, append-only logs, removal of stale live claims and `git diff --check`. Use an independent review to check policy drift; no runtime readiness claim and no commit.
- Implemented six primary document updates, three append-only decision-log events and the new acceptance register. The old impact analysis is preserved from its original Sources section onward; a current disposition map precedes it and historical Git snapshots were verified against repository history. Architecture/runtime, DESIGN, user guide and original audit reports remain unchanged.
- Documentation verification passed: 85 local file/anchor links, stable FR-1..22/AD-1..18, final/sketch status, historical-body preservation, append-only logs, unchanged original non-target sources, frozen intent and `git diff --check`. Verification script and baselines are temporary under `/tmp/candidate-planning-sync-grprxzi8/`; no application/runtime/browser/provider tests apply to this synchronization.
- Independent same-model, fresh-context Blind Hunter review returned seven findings; each was checked against current source contracts and corrected without changing those contracts. Clarified global admission-time membership and original-root-context retry, separated storage-denial fallback from ordinary reload, corrected navigation/privacy/token wording and added explicit closure checkpoints to the existing open-item register.
- Final documentation verification passed with 87 local file/anchor links and the same preservation/identifier/whitespace checks. All review findings below are patched; original audit A05–A10 remain explicitly unresolved in the register, not silently accepted or implemented. No commit was made, honoring BC's explicit instruction over the workflow's default commit step.

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Blocked storage conflated with reload continuity | medium | New PRD §10 wording could require continuity in the failure case where Runtime §5 instead permits volatile UI and fresh entry. Patched §10 to distinguish working-storage reload and the explicit storage-denied fallback. |
| Empty selection described as an empty scope | medium | Existing glossary/FR-6/FR-9 wording exposed a mismatch with Runtime §1/§4 nonempty frozen global registry. Patched those PRD descriptions and Experience eligibility to distinguish an empty Resource selection from an empty document allowlist; newly published documents cannot join recovery/retry scope. |
| Retry attributed to UJ-1–UJ-4 | low | Those journeys do not describe question-local retry. Patched Experience to link retry to FR-8, keeping the actual journey reference separate. |
| Prompt-minimization summary narrowed FR-16 | medium | The register said “adding” and omitted unrelated personal data. Patched it to quote the full existing “intentionally include” requirement; application to user-entered text remains open A05. |
| Plural credential hash implied hashed UUID | low | Runtime §4 hashes only sessionToken, not the persisted Conversation UUID. Corrected the A09 summary; no credential storage design changed. |
| Register supplied context but implicit closure gates | low | The register had owners/evidence and requirement references but not explicit checkpoints. Added acceptance/launch/conditional-backup-enable checkpoints without selecting solutions or numeric policies. |
| Original interpretation context absent from synchronized retry coverage | medium | Runtime §1/§4 already pins retry/retry-of-retry to the root pre-origin context. Added that existing policy to FR-8, a concrete failed-follow-up/intervening-topics acceptance case in FR-21, and the Experience retry summary. No new behavior was selected. |
