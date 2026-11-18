# Knowledge-source guidance

Only explicitly reviewed Markdown under `content/public/**/*.md` is eligible evidence. Keep authoring instructions and guides here or under `tools/`, never in that directory. There is no README exemption: an unapproved placeholder fails the same validation as any other Markdown. Nothing is automatically bundled, indexed or published by copying a file.

## Approved synthetic development corpus

BC selected and reviewed three fictional sheets and approved the prepared development revision on 2026-11-18 at `2026-11-18T08:45:47Z`, including administrative metadata and development-only warning updates:

- `public/mission-regie-collections.md`
- `public/projet-reperage-reserves.md`
- `public/projet-prototype-prets.md`

Their stable IDs, creation instants, narratives and local links are preserved. `reviewed_by` names BC's final **development-only** review; `reviewed_at` records this current decision, not an inferred first review. `modified_at` records the actual preparation edit. This approval covers that proposed administrative preparation; it is not a claim that BC performed another review at the later edit instant. Each sheet explicitly identifies the narrator and all professional events as fiction unrelated to BC. Preserve this context through chunking, retrieval, evaluation and display. Public visibility is a technical source-eligibility marker, **not recruiter-release authorization**.

When extending or replacing this temporary three-sheet acceptance snapshot, update the accepted inventory, handoff, raw-byte hashes and dedicated synthetic-corpus assertions in `tests/bootstrap/public-content.test.ts` together. Retain the generic validator safety and provenance tests.

Documentary gaps are accepted: no advance question-to-document map or completeness gate blocks development. Optional question examples remain in `tests/fixtures/synthetic-corpus/README.md`. Later runtime and evaluation must acknowledge insufficient evidence without inventing facts, treating absence as proof of nonexistence, or widening scope.

Run `npm run content:check`. Local success reports `sourceRevision: null`; only an exact committed public snapshot can be certified with `--revision <full-commit>`. Story 2.2 may develop against these sources, but actual committed provenance awaits an explicitly authorized commit. See `docs/_bmad-output/implementation-artifacts/handoff-2-1-development-corpus.md` for inventory and verification.

## Private preparation and real-portfolio replacement

`content/private/` is local-only, ignored by Git and outside application entrypoints. Never place private material in browser assets, imports or hosted build contexts; Git ignores are not a publication boundary. The selected private originals and versioned fixture drafts remain unchanged and unapproved as-is; this approval applies only to the prepared development copies.

Story 2.0's accepted workflow and real pilots remain historical evidence, not replaced by fiction and not automatically promoted. Real-portfolio replacement still requires BC's explicit selection, factual and standalone-comprehension review, publication authorization, actual metadata, deliberate copying and unchanged safety/provenance validation. Disclose actual authoring-model/session-log processing and obtain BC consent before remote processing of nonpublic material. Story 3.1 owns project Resource descriptors/maps, not new selectable types for every editorial category. Real-content, actual-model grounding/missing-information evaluations and launch approval remain separate obligations before recruiter use.
