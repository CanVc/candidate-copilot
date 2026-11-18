# Deferred work

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-0-document-frontmatter-and-pilot-evidence.md`
  summary: Clarify which real editorial review event public reviewed_at represents in the two-pass final-byte approval procedure before public promotion.
  evidence: Existing workflow/review.md inserts actual first-pass metadata before final-byte reapproval, but does not define whether the embedded date labels the editorial review or the final byte-bound approval. Current private drafts intentionally retain empty review placeholders; no public approval timestamp was invented. Resolve this publication-contract clarification with BC before Story 2.1 promotion, preserving real private approval dates and never copying an old approval to changed bytes.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-0-remove-editorial-completeness-veto.md`
  summary: Harden the pre-existing checkpoint approval revision field to require a positive integer rather than accepting Python equality coercion.
  evidence: Fresh review and parent synthetic reproduction confirm that approval revision true or 1.0 compares equal to document revision 1 in checkpoint.py::validate. The document revision itself is strictly typed; approval byte/version/consent checks remain intact. This older record-shape weakness was not introduced by removing editorial vetoes, does not create human approval or public promotion, and is deferred as medium record-integrity hardening rather than silently expanding the current policy amendment. Add validate/save rejection regressions and preserve existing records on failure when addressed.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-verify-wsl-workstation.md`
  summary: Assess and remediate the pre-existing Hono and Wrangler/Miniflare/Undici dependency audit findings before claiming complete workstation validation or deployment readiness.
  evidence: On 2026-11-17 the unchanged lockfile at source revision 2886a0aab9ff9e2920249baa3507f98ef6e12cd2 produced npm audit exit 1 with four affected package entries (three moderate, one high), including Hono 4.13.13 and Undici 7.29.1 through Miniflare 5.20261019.0-beta/Wrangler 4.151.2. A diagnostic production-only audit also failed with Hono as one moderate entry. Advisory identifiers/ranges and the functional-check outcomes are retained in docs/development/wsl-verification.md. This is an existing dependency-maintenance issue outside the installation-only boundary, not a WSL regression or an accepted security exception. Explicitly scope compatible pin/lock updates and rerun the entire documented chain; do not force fixes or describe the migration as fully accepted meanwhile.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore explicit clarification/new-ID-retry versus recovery/replay/read/reject turn accounting in the generated Epic 2 context.
  evidence: Reviews B7/R2-B8/R3-B4 confirmed the regenerated context drops distinctions present at baseline 37b3b2e0a4645e0577441c9c6f69933e3c60a65e. This agent-context correction is deferred per build policy; restore the authoritative accounting before implementing affected admission/usage stories, without changing the underlying policy.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore reload-only, nonoverlapping, approximately three-second and maximum-45-second observation bounds in the generated Epic 2 context.
  evidence: Reviews B8/R2-B9/R3-B5 confirmed the original context's explicit observation contract was reduced to a verification/retry distinction. Defer this agent-context correction until authorized context maintenance; preserve the authoritative runtime/UX bounds before affected recovery/frontend work.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore authentication-before-replay ordering in the generated Epic 2 context.
  evidence: Reviews R2-B7/R3-B3/R3-E3 confirmed token hashing survived regeneration but the baseline's authenticate-before-replay requirement did not. This is a medium agent-context follow-up, not a current validator defect; restore the authoritative security ordering before conversation/replay implementation.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore separate total-prompt capacity checks alongside the history-token cap in the generated Epic 2 context.
  evidence: Reviews R2-B10/R3-B6/R3-E5 confirmed the regenerated context retains 3,000 history tokens but drops the original total-capacity requirement. Agent-context maintenance must restore that distinction before provider/generation implementation; history limits alone do not bound complete prompts.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore the explicit no-question-truncation constraint in the generated Epic 2 context.
  evidence: Review R3-B7 confirmed the baseline's 1,000-character limit explicitly prohibited truncation while the refreshed summary only states the number. Defer this agent-context correction, preserving the authoritative immutable-input policy before admission/composer implementation.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore temporary, shared and pseudonymous creation-counter requirements in the generated Epic 2 context.
  evidence: Review R3-B8 confirmed regeneration retained the 10-creations/IP/day number but omitted the baseline's counter privacy and cross-instance properties. Restore those existing constraints through authorized agent-context maintenance before rate-limit work; no new counter policy is selected.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore explicit no-streaming and no-independent-completion-flag requirements in the generated Epic 2 context.
  evidence: Review R3-B9 confirmed these baseline constraints are no longer explicit in the regenerated atomic-finalization summary. This medium agent-context follow-up must preserve authoritative validated-output and canonical-terminal-state rules before answer/generation/UI implementation.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-validate-public-content.md`
  summary: Restore the creation-based anchor of the 90-day lifecycle in the generated Epic 2 context.
  evidence: Reviews R3-B10/R3-E7 confirmed the regenerated Epic 4 dependency summary dropped the original creation-based qualification. Restore the authoritative creation-time deadline through authorized context maintenance before retention work; do not introduce activity-based sliding retention.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-1-approve-synthetic-development-corpus.md`
  summary: Make the owner-approved synthetic-development administrative-preparation exception discoverable from the content authoring instructions without weakening final-byte review for real content.
  evidence: Review B10 and parent inspection confirm content/AGENTS.md still states an unconditional renewed final-byte review after rewrites, while content/README.md and the dated 2.1 handoff explicitly record BC's approval of proposed metadata/development-warning preparation before its actual edit instant. This medium agent-context consistency follow-up must point to that narrow synthetic-only decision, never authorize reuse of historical real-career approvals or bypass final review on later substantive edits. Agent-instruction edits are deferred under review policy; the current owner-approved scope remains recorded in the approved spec and handoff.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-6-enforce-fair-and-private-conversation-creation-limits.md`
  summary: Assess whether a large expired creation-counter backlog needs bounded cleanup to preserve recovery under D1 transaction limits (medium, unverified).
  evidence: Review B4 identifies an indexed but unbounded DELETE coupled atomically with key erasure; a sufficiently large failing transaction could prevent progress. No such backlog failure was demonstrated. Settle with disposable load measurements against current documented D1 transaction/resource limits and realistic growth; do not invent a retention grace or claim hosted cleanup reliability from current local tests.

- source_spec: `docs/_bmad-output/implementation-artifacts/spec-2-7-admit-one-immutable-global-question-at-a-time.md`
  summary: Measure full-publication admission guard payload and latency against representative populated corpus sizes and D1 limits (medium, unverified).
  evidence: Review B8 observes repeated JSON bindings of documents/chunks/FTS to guarantee read-to-write coherence. No actual accepted-corpus limit or latency failure was demonstrated. Settle with isolated real-D1 size/latency/limit measurements before changing the guard; preserve exact catalog/registry/scope atomicity and fail-closed corruption checks. No new resource cap or production readiness is implied.
