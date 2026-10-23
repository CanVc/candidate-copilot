# Content authoring rules

This file is an instruction reminder, not a knowledge source. Keep authoring tooling and instructions outside `content/public/`; only explicitly reviewed public Markdown can become indexed evidence. `content/private/` remains gitignored and excluded from application builds. Never promote a file automatically.

## Document frontmatter (types A and B)

Every current authored document, including a private draft, carries:

```yaml
---
document_id: "<stable UUID>"
created_at: "" # Actual creation timestamp; never guess.
modified_at: "" # Actual timestamp of the document edit.
title: "<factual title>"
reviewed_by: ""
reviewed_at: ""
---
```

- Use quoted UTC timestamps with seconds and `Z`: `YYYY-MM-DDTHH:mm:ssZ`. Placeholders above are not valid final timestamps or approvals.
- Keep `document_id` stable through edits, renames and moves. Preserve the creation instant. Convert a known offset to UTC without changing the instant.
- Set `modified_at` from the actual edit time when the document changes, not on reading, copying or checkpoint-only saves. Metadata-only edits also count as edits.
- Never infer a historical creation hour from an unrelated timestamp or silently substitute midnight, the current time, or a file copy's filesystem metadata. For an existing date-only creation value, retain it as a documented private legacy exception until reliable evidence supplies the missing time. It blocks public readiness, not private continuation. Record the gap privately; do not alter historical snapshots to normalize them.
- Keep `reviewed_by` and `reviewed_at` as empty strings in unreviewed private drafts. Empty fields are not approvals. Never populate them with an assumed reviewer or date.
- On any rewrite or withdrawal of reviews, remove `visibility: public`, reset both review fields to empty strings, and archive/invalidate private approvals. Renew factual, standalone-comprehension and publication-eligibility reviews on the final bytes, even when facts did not change. Preserve the previous document/checkpoint before edits and reconcile the current checkpoint's digest, revision and literal passage references.
- Public eligibility additionally requires `visibility: public` and real, nonempty `reviewed_by` / `reviewed_at`. All timestamps must be known and valid before public promotion. A metadata field alone never authorizes publication; Story 2.1 owns explicit review, validation and copying into `content/public/`.
- `topics` and `aliases` remain optional. Type, template version, interview state, provenance, review history, uncertainties and omission rationales belong in private sidecars, not mandatory public fields.
- Internal checkpoint schema 1 keeps its existing date-only `created_at` identity; full document timestamps belong in `document_timestamps`. Do not silently migrate that schema.

Use the versioned templates and procedures under `tools/content-authoring/`. Do not read private sources, checkpoints or sessions without the owner's authorization for the selected material and processing route. Owner acceptance of disclosed processing limits is not proof that provider retention or deletion has been technically verified.
