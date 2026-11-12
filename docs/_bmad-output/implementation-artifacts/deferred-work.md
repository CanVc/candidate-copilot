# Deferred work

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-0-document-frontmatter-and-pilot-evidence.md`
  summary: Clarify which real editorial review event public reviewed_at represents in the two-pass final-byte approval procedure before public promotion.
  evidence: Existing workflow/review.md inserts actual first-pass metadata before final-byte reapproval, but does not define whether the embedded date labels the editorial review or the final byte-bound approval. Current private drafts intentionally retain empty review placeholders; no public approval timestamp was invented. Resolve this publication-contract clarification with BC before Story 2.1 promotion, preserving real private approval dates and never copying an old approval to changed bytes.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-0-remove-editorial-completeness-veto.md`
  summary: Harden the pre-existing checkpoint approval revision field to require a positive integer rather than accepting Python equality coercion.
  evidence: Fresh review and parent synthetic reproduction confirm that approval revision true or 1.0 compares equal to document revision 1 in checkpoint.py::validate. The document revision itself is strictly typed; approval byte/version/consent checks remain intact. This older record-shape weakness was not introduced by removing editorial vetoes, does not create human approval or public promotion, and is deferred as medium record-integrity hardening rather than silently expanding the current policy amendment. Add validate/save rejection regressions and preserve existing records on failure when addressed.
