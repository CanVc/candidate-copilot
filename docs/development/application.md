# Eligible structured answer generation — Story 2.11 (technical review)

The portable continuation now joins the real classifier/context selector to scoped
D1 retrieval, one structured generator call, mechanical validation and the
existing atomic result finalizer. **Production remains unconfigured.** Only the
disposable fixture composes `EligibleEvidenceContinuation` with
`ScriptedAnswerGenerator`; `generate(string)` remains the bootstrap ping.

## Contracts and safety boundaries

- `src/shared/answer-generation.ts` owns the exact request/draft schema and
  configurable structural bounds. Only paragraph/summary blocks require citations;
  nonempty evidence may still yield limitations. Every non-failed redirect must
  contain a refusal, including unsourced partial results. Failed/error drafts map
  to application-owned processing failure, never raw model explanations.
- Candidate chunks are checked for frozen document membership, duplicates,
  public paths, original provenance, Unicode and configured forbidden patterns
  before prompting, including candidates beyond the selected-pool count cap.
  Canonical hard limits constrain configuration; selection also reserves aggregate
  reconstructed excerpt/metadata and block-ID space before a call. Whole ranked
  chunks alone are selected. A private copied
  pool supplies original-language persisted excerpts and citation edges; model
  output cannot author source metadata, scope, reset or retry policy.
- `answerReceiver` is the actual generation accounting descriptor. Every candidate
  uses the processor's real 2.10 callback to reselect canonical complete exchanges,
  including required pending clarification chains. Classifier-pruned history is
  not reused. The configurable default history allowance remains 3,000 tokens;
  each other component, exact serialized framing and output reservation are
  independently checked. Dispatch independently reconstructs typed expected
  instructions/data/projections, not merely generic envelope integrity.
- Successful empty retrieval avoids generation, returning scoped insufficiency
  (plus reason-specific value-judgment, commitment or bypass refusal). Nonempty evidence that cannot fit, or missing/nonfitting
  required context, returns the identity-only core limit outcome. The processor
  emits its exact local restatement and trusted reset marker; arbitrary
  continuation `contextReset` remains stripped. No truncation, summary call,
  repair, regeneration, search rewrite, retry or fallback provider is added.
- The required `GenerationRetriever` port distinguishes coherent missing publication
  or frozen members from actual dependency failure in one read. It also reports
  whole-chunk budget exhaustion separately from successful no-match. Legacy
  retrieval readers remain fail-closed with their existing empty-budget behavior.
  Corrupt publication is not treated as confirmed withdrawal in either classifier
  preparation or generation search. Typed schema/policy errors remain invalid
  results, not technical reset provenance.
- Full normalized language declarations must agree (`en-US` differs from `en-GB`).
  Local copy uses supported current language, supported preceding-root language,
  then French, recording the actual copy language. Source excerpts remain unchanged.
- Finalization still owns atomic all-frozen-member checks, canonical children and
  lease release. Stable-ID reindex/title/path changes retain loaded provenance.
  Withdrawal of even an uncited zero-chunk member blocks factual finalization.
  Saved `scope_unavailable` remains nonretryable/`none` after restoration; same-ID
  replay does no classification, retrieval or generation, even without publication.

## Reproduce and inspect

```bash
npx vitest run tests/bootstrap/{answer-generation,professional-intent,conversation-context,model-context-budget,conversation-results,retrieval}.test.ts
npx playwright test conversations.spec.ts -g 'eligible answer generation'
timeout 1200s bash -c 'npm run typecheck && npm test && npm run build && npm run test:smoke' > /tmp/story-2-11-full-verification.log 2>&1
```

The new real-D1/workerd/Chromium fixture checks auth-before-replay, isolation,
POST/GET/replay parity and exact call counts, source reconstruction, hostile
inputs/outputs, no-match/redirect, receiver-specific pending context and limits,
dependency faults, loaded-provenance reindex, uncited withdrawal/restoration,
rollback and expired/successor-owner fences. Existing result, retrieval and context
fault suites are retained without relaxed assertions, skips or timeouts.

### Re-derivation verification — historical blocker, corrected before review

The amended implementation passed **420 focused units**, four typechecks and the
standalone actual D1/Chromium generation fixture. The complete command then passed
45 workstation fixtures, **863 units / 18 files**, both builds, six simulations
and **43/44 Playwright tests**. The new generation pipeline passed, including
multi-document/chunk reconstruction with reversed citations, language switches,
current-versus-previous local language precedence and preparation/search corruption.

The full command **failed** the retained professional-intent fixture at
`tests/e2e/professional-intent-runtime.mjs:172`: expected `scope_unavailable`,
observed `processing_unavailable`. Its `member` fault at
`tests/e2e/professional-intent-worker.ts:38` deletes a registry member without
updating the catalog digest, so the publication is incoherent, not a confirmed
coherent withdrawal. The amended B7 contract requires dependency classification
for corruption. No assertion, timeout or retry was changed. The stalled-health
assertion passed this run; earlier recurrence remains unexplained.

**Stopped without rerunning.** Supervisor coordination was unavailable because
the parent workflow was blocking. Proposed next step requires parent approval:
make that legacy member fixture a coherent atomic withdrawal while retaining all
its existing assertions, then perform targeted and complete verification. This
implementation is partial pending that decision, independent review and final
checks; historical pass-1 evidence in the spec does not certify this revision.
Spec/sprint tracking was not changed by this writer.

| Temporary evidence | SHA-256 |
| --- | --- |
| `/tmp/story-2-11-rederive-full.log` (failed complete command) | `de37c43f0862cbf8b3afad1ae7582ac20b83d426c85db20bef6627e2a0774b46` |
| `/tmp/story-2-11-rederive-failure-context.md` | `348608ab860983de3e1d948f60be188fb4d8d12dc0a3c90dca71d3c41cc23f80` |
| `/tmp/story-2-11-rederive-focused.log` (420 passing) | `fb7850e624c148b940376dc44b4d4f30305f4c122c9a2e29aba167fb0e25b951` |
| `/tmp/story-2-11-rederive-pipeline.log` (passing) | `428a21babbe5b6bfb03d6f81c139656b6bbffda0302e1a7b8f2a42daf717aad1` |

After the writer stopped, the supervisor authorized an inline fixture-only
correction because retained-worker continuation was unavailable. The legacy
withdrawal now updates registry/mappings and catalog digest atomically and
explicitly verifies a coherent publication; all existing assertions are unchanged.
Separate corruption scenarios still require processing_unavailable. The complete
reconstructible partial patch and failure context remain preserved in `/tmp`.

Coordinator verification now **passes**: 420 focused units and three D1/Chromium
pipelines; then the unchanged full chain with four typechecks, 45 workstation
fixtures, **863 units**, builds, six simulations and **44 Playwright tests**.
Full log `/tmp/story-2-11-rederived-coordinator-verification.log`, SHA-256
`426c8d96207001c3ffa89e154ba2a1211d1b8530f77a8c8af0881f808fb703d4`.
No health assertion/configuration was changed; its earlier recurrence remains
unexplained. The complete 19-file diff was personally audited before the second
fresh three-layer review. That evidence is superseded by the completed pass-2
corrections below.

### Reviewed implementation verification

Two fresh complete three-layer reviews are finished; each finding has an individual
verdict in the story spec. Ten retained pass-2 patches/regressions are complete,
with no deferred finding. Portable generation now independently enforces the exact
output reservation, rejects invalid prepared binding without context reset, checks
forbidden local IDs/citations and rejects impossible canonical configuration.
Tests additionally cover generated limitation/refusal-only results, coherent
search-time withdrawal, exact byte/citation boundaries, configured output patterns,
every localized fixture block and zero processing-publication reads on replay.
The existing finalizer is unchanged; no full corruption-revalidation claim is made.

Latest focused checks: **431 units and three D1/Chromium pipelines PASS**.
Latest full chain: **four typechecks, 45 workstation fixtures, 874 units, both
builds, six simulations and 44 Playwright tests PASS**, without retries or weakened
assertions. Log `/tmp/story-2-11-pass2-patch-full.log`, SHA-256
`45347433f7c48d1d3274b61060660b0fc4ae196f1909fb6eeacf4ed4b61e89b8`.
The conventional local commit is followed by the complete committed-revision gate;
its immutable commit and result are reported in the final acceptance handoff.

## Human handoff and limits

Inspect the controlled no-match/refusal/restatement copy and original-language
fiction/non-attribution in saved excerpts. Real-model meaning, entailment,
completeness, proper block labels, refusal and actual language still require
human evaluation. Synthetic scalar accounting demonstrates mechanics only, not
real-provider token correctness. Patterns are not comprehensive privacy detection.
No UI, production provider binding/free-quota/A05 (2.12), shared deadlines/A08
(2.13), selected admission, public recovery/retry (2.18/2.19), deployment or
operator migration is delivered here. Independent review, committed-revision
verification and parent final advancement remain separate from implementation;
sprint stays **review**, and BC product/human acceptance is pending.

---

# Bounded conversation context — Story 2.10 (controlled development)

The delivered disposable composition now uses `ModelAwareIntentPreparation`.
Production still has **no configured processor/provider**. No factual generator,
retry/recovery admission, selected admission, UI, live model or operator migration
is enabled. The Story 2.9 section below is historical context; its byte-only
history selector remains for unchanged regression fixtures. Its base class still
owns shared runtime request/catalog assembly; the delivered subclass overrides
history selection and acceptance with receiver-aware accounting.

## Receiving-model accounting contract

`LLMProvider.receiver` binds model/version, tokenizer/profile/version, exact
serialization/framing version, capacities, component budgets and counting to the
same adapter that accepts the call. `prepareProfessionalIntent` uses the identical
trusted instructions and validated data serialization for selection and dispatch.
`prepareModelCall` freezes the exact serialized input, component/whole-input counts
and output reservation. Immediately before dispatch, `validatePreparedModelCall`
requires independently derived expected instructions, data and component
projections from the actual typed request, and checks receiver identity (including
the actual descriptor/functions), serialization, counts and reservation again.
`validateModelCallIntegrity` is only the adapter-side integrity defense; it does
not replace the mandatory typed-consumer expected-input check. Nonempty serialized
inputs require positive token counts; empty components may count as zero. Missing/invalid/changed accounting, modified envelopes
or overflow cause a local restatement, never an unaccounted model call.

History defaults to **3,000 receiver tokens**, configurable in `receiver.budget`.
Independent initial engine allocations are instructions 6,000, question 4,000,
catalog/scope 4,000, evidence 12,000, handoff 2,000 and output 2,000 tokens.
Every component is checked separately; the exact serialized input **including
framing/metadata plus output** must also fit receiver capacity. Structural/Unicode
and UTF-8 byte bounds remain separate, not token estimates. Nothing silently
truncates the immutable question or summarizes through another model.

`deterministicReceiver` supplies only explicit local synthetic vocabularies:
`scalar-v1` assigns one token per Unicode scalar and `scalar-pair-v1` packs pairs.
Their golden vectors, distinct counts and captured exact JSON framing prove
mechanics, **not actual provider tokens, semantic safety or language quality**.
Story 2.12 must bind real model/tokenizer/context/output capacity using official
provider facts. A05/A08 remain later owner gates.

The same `prepareModelCall`/`validatePreparedModelCall` envelope and
`selectConversationExchanges` fit callback support a different future generation
receiver, including independently counted eligible evidence and handoff metadata.
Its typed consumer must supply independent expected projections to validation,
not reuse caller-authored component strings. The selection callback is checked
even when history is empty.
Tests exercise receiver-specific reselection; Story 2.11 must wire its actual
generator. Bootstrap `generate('bootstrap-ping')` remains a nonfactual fixture,
not a generation integration or a budgeted product call.

## Canonical roots, clarification chains and reset provenance

`resolveConversationContext` consumes the authenticated post-admission snapshot.
It validates unique identities, self-root direct messages or bounded earlier
failed/retryable links, matching questions/scopes/roots, and excludes later topics.
Missing/forward/cyclic/foreign/nonretryable/mismatched lineage yields unavailable
context. Future retry/retry-of-retry cases are **typed synthetic unit fixtures**;
D1 still admits only direct self-anchors. Supported preceding-root language then
French governs local templates before classification; there is no language detector.
The immutable current question and explicit language request govern classification.

Selection retains chronological complete question/response pairs. The immediately
preceding exchange and **all pending model clarifications across failed replies**
(including the complete failed question/error pairs) are indispensable, selected once before optional older exchanges/catalog. History and
catalog interpret only: no old excerpt attachments, credentials, unnecessary IDs,
policy authority or additional evidence eligibility. Missing/unrepresentable or
oversized indispensable context asks for restatement without provider/retrieval.

Migration `0007_conversation_context_reset.sql` adds `answers.context_reset`,
default false for old rows. Only local missing-context/limit clarifications set it;
model outputs cannot author it, ordinary outcomes stay false, and HTTP never
accepts/returns it. The application canonical-result handler verifies association
with the exact supported local clarification and records invalid_result with
marker false on inconsistency; the D1 adapter retains the same defense. The marker lives in the answer row, sharing its atomic
rollback, lease fences, retention and deletion cascade. The **unique answer**
remains the only terminal authority; immutable message/scope/history are untouched.
Selection stops before the most recent marked exchange, retaining that whole pair
if representable. An unusable marked pair asks again; a clean marked reformulation
allows the next reply to recover without reimporting poisoned history. Matching
text without trusted provenance never resets a model clarification chain.

Scope withdrawal remains false/none after restoration; dependency failure remains
distinct. Canonical POST/GET/replay and stale-owner fencing are unchanged.

## Verification and human handoff

Run only normal builds and disposable fixtures; these commands do not authorize
migration of operator storage, remote calls, deployment or activation:

```bash
timeout 1200 bash -c 'npm run typecheck && npx vitest run tests/bootstrap/conversation-context.test.ts tests/bootstrap/model-context-budget.test.ts tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts'
timeout 1200 bash -c 'npx playwright test conversations.spec.ts'
timeout 1200 bash -c 'npm run typecheck && npm test && npm run build && npm run test:smoke'
```

Historical pass-1 implementation evidence below is against the uncommitted working tree based on
`14fd8635d502458d23d5bae414b5f95cbdcd194a`, not a committed-release certificate.
Focused units passed (243 before the additional forged-provenance case); all six
conversation E2Es passed. Logs: `/tmp/story-2-10-focused.log`,
`/tmp/story-2-10-context-e2e-rerun.log`. Initial full verification passed four
typechecks, 45 workstation fixtures, 713 units, both builds, six simulation tests
and 42/43 Playwright. The only failure was an old expected migration count (six,
now seven), corrected without weakening assertions. Earlier focused failures were
also fixture compatibility expectations (migration list and positional old answer
INSERT), corrected with the new migration name and explicit columns; no runtime
launch failure occurred. Full initial output:
`/tmp/story-2-10-full-verification.log`.

Final full rerun after the additional exact serialized-history boundary test
passed: four typechecks, **45 workstation fixtures, 714 unit tests, both builds,
six simulation tests and all 43 Playwright cases**. Complete combined output:
`/tmp/story-2-10-final-full-verification.log`. Final focused typechecks and all
245 classifier/context/result cases also passed:
`/tmp/story-2-10-final-focused.log`. No staged files,
commit, hosted mutation or live/paid provider call was made.

Re-derivation verification (this working tree): exact typed-payload projection
binding, nonempty-count rejection, failed-reply dependency bridging, empty-history
fit validation, service marker validation and safe new-direct fallback now have
regressions. Populated catalog tests isolate token-only component and total pruning;
actual question serialization has exact boundary tests. Persisted failed chains,
aggregate-reset next follow-up and positive/negative receiver-capacity outcomes
are asserted, including exact histories, calls, statuses and provenance markers.
Final verification passed four typechecks, 271 focused verbose cases, 45
workstation fixtures, 740 unit tests, both builds, six simulations and all 43
Playwright cases: `/tmp/story-2-10-rederivation-verified.log`. Earlier passing
focused/context/full logs are `/tmp/story-2-10-rederivation-focused.log`,
`/tmp/story-2-10-rederivation-context-e2e.log` and
`/tmp/story-2-10-rederivation-full.log`.

One intervening run failed the unchanged stalled-health browser assertion at
`tests/e2e/bootstrap.spec.ts:82` (5000ms, still “Vérification du Worker…”):
`/tmp/story-2-10-rederivation-final.log`; its error context is retained at
`/tmp/story-2-10-rederivation-health-failure-context.md`. Inspection found no story
edits to frontend health/App, that test or runner configuration; Vite started
normally. This does not prove the failure's cause. Supervisor authorized one
unchanged focused rerun and one unchanged full rerun: both passed, respectively
`/tmp/story-2-10-rederivation-health-rerun.log` and the verified log above. No test,
timeout, retries, assertion or runner setting was changed to obtain a pass.

The full run report is `/tmp/story-2-10-rederivation.json`. Coordinator-owned
spec/sprint index entries are preserved; the implementation worker stages and
commits nothing.
Independent review, coordinator tracker reconciliation and final advancement remain
separate gates, not implied by these deterministic results or BC acceptance.

The new real-D1/Chromium fixture proves populated 0006 upgrade/defaults, complete
long/clarification/current-language sequences, poison/individual/aggregate recovery,
exact captured budgets/prompts, reset persistence/rollback/replay/stale fences,
deletion cascade, auth/browser-history rejection and immutable scope. The unchanged
2.9 scenarios run with the new preparer in D1. Unit tests cover exact 3000/3001,
configurable/component/aggregate/output boundaries, invalid accounting, receiver
changes, mutation rejection and synthetic future lineage. No mocks establish actual
model meaning, actual answer language or live-provider token correctness.

Final coordinator closure: both complete fresh three-layer reviews, one
specification-driven re-derivation and every retained correction are complete.
The continuation now exposes attachment-free receiver-specific reselection through
an internal callback; interrupted pending dependencies request restatement,
scripted outputs honor their reserved token budget, and the shared reset assertion
is tested directly at both application and disposable D1 boundaries. Final personal
full checks passed **753 units, 284 focused units, 45 workstation fixtures, both
builds, four typechecks, six simulations and 43 Playwright** without skipped tests
or weakened assertions. Full log: `/tmp/story-2-10-final-coordinator-verification.log`
(SHA256 `83e71053f7cccf6d60e55f9f22262847a13616b65ee1ecd0995e9d427ca7a9c1`).

A durable command/outcome/report-hash manifest, all individual review verdicts and
the practical developer checklist are committed in the
[Story 2.10 spec](../_bmad-output/implementation-artifacts/spec-2-10-preserve-bounded-follow-up-and-clarification-context.md#durable-evidence-manifest).
That manifest preserves evidence identities, not raw /tmp availability in another
checkout. The earlier unexplained health assertion remains recorded, not diagnosed
as flakiness. Postcommit full checks and explicit supervisor technical advancement
are still distinct from these working-tree results. **Sprint is review; BC human
acceptance and recruiter-launch authorization are not granted.**

---

# Professional intent — Story 2.9 (controlled development)

Story 2.9 adds the portable classifier and direct-result path; the default Worker
still has **no configured processor**. Only the explicit disposable test
composition uses `ScriptedLLMProvider` and `ProfessionalIntentProcessor`. The
bootstrap `generate('bootstrap-ping')` fixture remains unchanged. No live model,
factual generator, new route, schema migration or chat UI is enabled.

## Classification and trust boundaries

- `ClassifyTurnRequest` follows the spine: immutable current question, documentary
  scope labels, bounded server-owned conversation context, public interpretation
  catalog and current-question/explicit-request language policy. Trusted policy
  and serialized untrusted data are separate provider arguments. Conversation,
  message, request and document IDs, credentials, review metadata, source paths
  and old excerpt attachments are not model-payload fields.
- The provider is called once per prepared attempt, never on saved replay.
  `answer`/`redirect` require an owned reason, professional topic, standalone
  question and bounded lexical terms; `refuse`/`clarify` require only their direct
  text plus reason/language. Extra or mixed fields, sparse arrays, malformed
  Unicode/tags, lexical syntax, oversized output and configured forbidden markers
  fail closed without repair, reclassification or a fifth business decision.
- Professional value judgments instruct a redirect to eligible documented facts,
  not yes/no, fit assessment or hiring recommendation. Sensitive-personal topics
  instruct refusal; commitments/bypass cannot authorize disclosure, negotiation,
  promises, hidden instructions or fabricated evidence. Catalog/history remain
  interpretation data, never evidence or policy; missing catalog terms do not
  prohibit a professional topic. These instructions are **not semantic proof**.
- Direct classifier text persists unchanged as `clarification/clarification` or
  `refused/refusal`, with normalized declared BCP-47 language and no sources,
  retrieval or second generation call. Invalid classification becomes controlled
  `invalid_result`; dependency failure becomes `processing_unavailable` if saved.
  Unknown persistence remains `result_unavailable`, not a recorded failure.
- Answer/redirect continue through a typed seam retaining decision, reason,
  current question, context and a separately copied/frozen admitted allowlist.
  The test continuation exercises real scoped FTS and returns explicitly synthetic
  text, not an operational factual generator. Existing atomic ownership,
  membership, replay, auth and scope-unavailable **false/none after restoration**
  semantics remain intact.

## Bounded preparation and later-story seams

`BoundedSimulationIntentPreparation` selects complete recent question/answer
exchanges before the immutable server context anchor, never later turns or
browser history. The immediately preceding question/clarification pair is
included before older exchanges. Missing, unrepresentable or nonfitting immediate context asks a
controlled clarification without a model call. Template language uses supported
recorded language, otherwise French; the core does not guess the current text's
language. An unusable older exchange stops history selection after a usable
recent pair, so a clean clarification reply can recover from earlier admitted
control text. No admission character policy or input sanitization is added.
Full root-context prioritization and recovery execution remain later
work, not claimed here.

Defaults in `DEFAULT_INTENT_BOUNDS`: 12,000 UTF-8 JSON bytes each for history and
catalog, 32,000 for the data request, 12,000 for classifier output, 40 catalog
entries, 16 aliases/entry and 16 search terms. Text bounds use UTF-16 length:
4,000 current/resolved question, 200 topic, 64 term, 600 direct/metadata text.
Admission's independent 1,000-code-point question limit is unchanged. Oversized
current questions are never truncated: an unrepresentable/nonfitting immutable
base takes the controlled clarification path, not `invalid_result`. Preparation
reserves the question/scope/language-policy envelope and most-recent necessary
complete exchange first, then admits whole older exchanges and optional metadata
only while both component and aggregate data-byte bounds hold. These bytes do
not include a receiving model's policy tokens or reserved generation capacity.
Catalog projection deterministically
includes only eligible public titles/topics/aliases and fully eligible project
names/descriptions, omitting invalid optional strings/entries and whole nonfitting
metadata while preserving usable titles/aliases where possible, without changing
the complete frozen eligibility set. It never includes chunks or review fields.
These are configurable **simulation byte/structural bounds, not token counts**.
The trusted classifier instructions include the active output bounds and accepted
lexical grammar, including a nonempty encoder token per term and at most 64 total
lexical tokens and 64 UTF-16 code units per token even when term bounds increase.
Structured downstream failures without a declaration preserve the validated
current language for existing template fallback. Invalid downstream drafts use
separate validated classifier-language metadata for failure templates, never the
invalid draft's language or a relabeled answer.

The D1 catalog's internal processing read distinguishes a failed storage batch
(`processing_unavailable`, retryable/new_request when recorded) from confirmed
missing/incoherent publication or membership (`scope_unavailable`, false/none).
Legacy health/admission/search readers retain fail-closed null behavior. No
second read or automatic retry is performed; saved results remain identical after
restoration.

Story 2.10 must implement receiving-model 3,000-token history and separate
component/total-capacity accounting with reserved output.

The processor/provider/continuation accept an optional orchestration-owned
`AbortSignal`, kept outside model data. Already-cancelled attempts and late
classifier completions do not start a continuation; a continuation finishing after
cancellation is also discarded. For the subsequent 2.13 local deadline implementation, see
[bounded local message attempts](#bounded-local-message-attempts-story-213-in-progress). Cancellation does not establish that remote work stopped. Existing
40-second lease/finalization fencing remains active; no automatic retry/failover
or new usage policy is introduced.

## Reproduce and inspect Story 2.9

Use the locked checkout and installed Chromium; these commands create disposable
local D1/Worker/browser fixtures only, without operator migrations or live models:

```bash
npx vitest run tests/bootstrap/professional-intent.test.ts tests/bootstrap/conversation-results.test.ts
npx playwright test conversations.spec.ts -g 'real D1 professional intent'
npm run typecheck
npm test
npm run build
npm run test:smoke
git diff --check
```

The focused runtime checks exact direct text/language/status/no citations,
answer/redirect's real FTS continuation, all branches, injected metadata, bounded
same-Conversation context, POST/GET/replay parity, no extra calls at cap or lost
receipt, disabled processing replay, auth/isolation, unknown persistence,
withdrawal/restoration and stale fences. Regressions include an actual failing D1
preparation batch after successful admission and finalization, missing publication
and member after admission, three sequential poisoned-history/recovery HTTP
submissions, valid empty optional publication metadata, exact aggregate bounds,
non-string discriminator, zero-token/65-token output and structured-failure
language. Independent policy-string assertions protect the approved instructions;
they still cannot establish that a real model follows them. Chromium exercises the actual HTTP
protocol, not an undelivered chat UI or accessibility journey. The existing
Story 2.8 result regressions are retained.

Deterministic routing and schema tests do not establish actual-model semantics,
actual language, citation entailment, privacy guarantees or BC acceptance.
A05 sensitive-input transmission/disclosure and A08 measured recovery-usage policy
remain unresolved later gates; no exception, blanket input ban or consent is
invented. The catalog port still loads a whole publication internally; large
publication/read costs and inherited ingress/graph/preflight risks are unmeasured.
Independent review and BC inspection remain required; sprint stays review.
Current command logs/counts are recorded in the Story 2.9 specification.

---

# Atomic complete results — Story 2.8 (controlled development)

Final technical review: two fresh three-layer passes, one re-derivation and all
retained fixes verified. Final coordinator checks pass four typechecks, 45
workstation fixtures, 533 unit cases, both builds, six simulations and all 41
Playwright cases (`/tmp/story-2-8-final-coordinator-verification.log`). This
supersedes the intermediate worker totals below, not BC human acceptance.
Populated 0005→0006 migration, leading-NUL safe failure, previous-language
withdrawal fallback, non-null historical headings and opposite citation orders
are included. Ingress and graph/preflight scaling remain unverified deferrals.

This section supersedes the historical Story 2.7 **no-result/no-message-POST**
boundary below. Story 2.8 adds authenticated
`POST /api/conversations/:id/messages`, canonical completed GET turns and saved
same-ID replay. It adds no UI, real classifier/generator/provider, selected
admission, new-ID retry execution, automatic recovery or physical purge.

`submitConversationQuestion` authenticates before saved lookup and accepts only
the existing exact submission shape. Direct global questions keep their exact
admitted text, scope, identity, context anchor and position. Changed same-ID input
conflicts. Same-ID completed replay precedes live catalog, processor, owner and
turn-cap checks, returns the original result and consumes no processing call or
turn. An interrupted POST does **not** automatically reacquire work; it returns
`result_unavailable` with `retryMode: same_request`. Existing explicit internal
admission recovery is unchanged; public recovery execution remains later work.

## Persistence and development composition

- Migration **0006** adds `answers`, `answer_blocks`, `source_excerpts` and
  `answer_block_sources`. A unique message answer is the sole terminal marker.
  Composite FKs keep citation edges inside their answer; an answer-leading index
  bounds citation reconstruction to that answer. Historical excerpts
  retain loaded text, path/title/section, location, stable document/chunk IDs,
  content hash and source revision, with no live-publication FK.
- One real D1 batch checks current Conversation existence/creation-based retention
  and matching unexpired request/attempt ownership before inserting the answer.
  All children, persisted failure metadata, modified timestamp and release of
  that same owner commit or roll back together. Late workers cannot release a
  successor, insert partial children or recreate deleted state.
- Factual finalization checks **every original member**, including uncited and
  zero-chunk documents, against current public membership and active revision in
  that transaction. Ordinary atomic publication updates may change text, title
  or path or add documents; none relabels loaded excerpts or widens eligibility.
  Withdrawal records `failed/scope_unavailable` without factual blocks/excerpts.
  BC's decision is persisted: **`retryable: false`, `retryMode: none`**. Restoration
  never changes that saved result or authorizes technical retry.
- POST returns complete, nonstreamed JSON only after canonical reconstruction.
  GET turns distinguish `completed`, `in_progress`, `interrupted`; completed
  `result` uses exactly the POST/replay schema. All five statuses use HTTP 200,
  including recorded failures. Unconfirmed persistence uses safe HTTP 503
  `result_unavailable`/`same_request`, not a fabricated terminal failure. Auth
  failures remain neutral HTTP 401; authenticated responses are `no-store`.
- `createWorker` takes one effective `limits` configuration for **both POST and
  GET** (defaults: 1,000 code points, 20 admitted messages, 40-second lease).
  Its optional processor factory is invoked lazily, never during saved replay.
  The default Worker deliberately has **no new-processing adapter configured**:
  new POSTs safely return 503 without admission, while saved GET/replay works.
  Idle GET reports `admission.available: false` with `processing_unavailable`
  when the catalog is usable but processing is unconfigured. Existing live
  ownership still takes precedence over processing readiness.
  `SyntheticConversationProcessor` is explicitly opt-in in disposable fixtures;
  it selects deterministic test statuses, not visitor intent, and labels output
  fictional/non-BC. No browser-authored answer/evidence or test-control route is
  installed in the public Worker.
- `catalog_stale` responses include top-level `catalogRevision` and `catalogHash`
  from the deciding snapshot, including an atomic A→B publication race. Absent
  active publication instead reports unavailable scope, not invented readiness.
- Mechanical validation rejects sparse processor/citation arrays and checks exact shapes, supported enums, normalized BCP-47
  declarations, bounded output, factual citations, graph uniqueness, eligible
  public paths/provenance and application-owned failure metadata. It does not
  establish actual language, semantic support, real-model safety or BC evidence.

## Owner verification of Story 2.8

From the existing locked checkout with installed Chromium; no operator migration,
server restart, credentials, download or live-model call is needed:

```bash
npx vitest run tests/bootstrap/conversation-results.test.ts
npx playwright test conversations.spec.ts -g 'real D1 complete results'
npm run typecheck
npm test
npm run build
npm run test:smoke
git diff --check
```

The focused runtime creates two independent Workers sharing disposable D1,
applies 0001–0006 there and exercises the real public protocol. Internal fixture
controls pause only at the real atomic port, never through an unresolved Worker
Promise. It proves all six write-boundary rollbacks (plus recorded-failure
metadata rollback), duplicate and terminal races, stale/expired/deleted fences,
lost receipts, cap/config parity, immutable scope and loaded-provenance changes,
withdrawal/restoration and all five full-schema POST/GET/replay outcomes.
Actual Chromium performs authenticated POST, GET and replay for every status.
Fixtures reject non-local browser traffic and use the existing executable.

Implementation checks on baseline
`9953276e9973b80f566c5ad39f92c3006a44083a`: four typechecks,
45 workstation fixtures, 529 Vitest cases, both builds, six simulations and all
41 Playwright cases pass in the re-derived pass. Full output:
`/tmp/story-2-8-rederived-full-verification.log`. Focused results include exact
Unicode/whitespace block preservation, customized historical scope-failure copy,
cited-refusal withdrawal, large immutable request identity, supported-language
fallback and an actual citation-index query plan. The specification distinguishes
this verification from superseded-pass evidence and interruptions. These are
implementation-worker results, not independent review, BC acceptance or launch
approval. Do not infer deletion from access expiry. Large-corpus guard/read cost,
actual model behavior, privacy/provider policies and hosted operations remain
unverified; earlier story limitations retain their owners. Message-body ingress
resource bounds remain an unmeasured risk (B4), not a newly invented input limit.

# Immutable global question admission — Story 2.7 (controlled development)

`admitConversationQuestion` is a portable **internal application service**, not a
public message endpoint. It authenticates before saved-request lookup, validates
exact direct/retry request shapes, and currently admits **only direct global**
questions. Selected-resource/new-ID technical retries reject without admission;
their normalized identities still participate in saved-ID conflict detection.
No model, queue, result/answer table, completion flag or UI is added. Public
`POST /api/conversations/:id/messages` remains unsupported until canonical result
integration. The older Story 2.5/2.6 sections below are historical scope records;
this section supersedes their empty-transcript/admission-unavailable description.
Creation origin/privacy/IP controls are unchanged.

## Admission and recovery contract

- `action: 'submit'` admits one new logical request; an already interrupted ID
  returns `interrupted` without processing. **Only explicit `action: 'recover'`**
  reacquires an admitted ID. Neither GET nor ordinary duplicate submission
  renews a lease. Recovery keeps original text, message, scope, position/count
  and self context anchor; later questions cannot alter its interpretation root.
- `admissionLimits` accepts explicit positive safe-integer overrides for
  `maxQuestionCharacters` (initially 1,000), `maxMessages` (20) and
  `leaseMilliseconds` (40,000). Shared `countQuestionCharacters` counts Unicode
  code points: astral characters once, CR and LF each once, combining marks
  separately. There is no normalization, trim-on-save or truncation. Blank and
  malformed-Unicode questions reject. Recovery is not blocked merely by a cap.
- Identity includes exact question text, sorted unique case-sensitive Resource
  IDs, catalog SHA/hash and body variant. Saved-ID conflict/in-progress/busy
  decisions precede live-catalog validation. Conflicts never substitute IDs.
- Global scope freezes **all registry IDs, including zero-chunk documents**, in a
  nonempty version-1 allowlist with `resources: []`. Missing/corrupt/empty/stale
  publication rejects. Recovery checks all original members; additions never
  widen it and withdrawal never narrows it. No historical live-publication FK.
- The D1 adapter rechecks existence, creation-based retention, saved identity,
  lease and count at mutation. A full validated publication is compared with
  the live authority, Resources/maps, registry/document JSON, chunks and FTS
  inside the write batch; a pointer-only or same-pointer corruption race cannot
  admit mixed membership. A changed publication fails closed, not an automatic
  retry. Lease/message/count/modified timestamp changes roll back together.
  Counts derive from unique messages; no redundant mutable turn counter exists.
- Acquisition returns an **internal** fresh attempt owner, distinct from request
  ID. Only this owner may be used by later fenced processing. Results/finalization
  are not implemented here. All admitted messages become interrupted when their
  matching lease expires. A deliberately distinct new question may then count
  normally without erasing the old one; recovery cannot steal its active lease.

Authenticated public GET now returns ordered exact messages/scopes with explicit
`in_progress`/`interrupted` status, current processing and admissibility. It never
exposes attempt IDs, token hashes or internal submission identities, never
renews processing, and remains `Cache-Control: no-store`. Missing publication
blocks new admission but does not hide historical messages. Creation limits do
not disable reads. `available: true` describes internal admission readiness, not
an implemented public POST/result protocol or provider availability guarantee.

## Owner verification of Story 2.7

From the existing locked development checkout, with no operator migration or
server restart:

```bash
npx vitest run tests/bootstrap/conversation-admission.test.ts
npx playwright test conversations.spec.ts -g 'real D1 global admission'
npm run typecheck
npm test
npm run build
npm run test:smoke
git diff --check
```

The focused Playwright case creates two independent workerd instances sharing
**disposable D1**, applies 0001–0005 there, and verifies concurrent duplicate and
competing requests, limits, immutable scope/anchor/text, explicit recovery,
last-slot races, rollback at every mutation, A/B and same-pointer corruption
interleavings, deletion/expiry fencing, and actual Chromium authenticated GETs
for both active and interrupted messages. Normal service calls are uninstrumented;
race cases split only at the production atomic port after application validation,
mutate real D1 through the other instance, then commit under the real guard.
Its test-only acquisition transport is not shipped in the Worker. Chromium uses
the already installed executable with disposable environment/state; no install,
operator database, credentials, live model or remote deployment is required.

Implementation verification on baseline
`9177f84c859e5687795f86f2c9e8eb634ecb1022`: four typechecks, **45 workstation
fixtures + 469 Vitest cases**, both builds, six simulations and **40 Playwright
cases** pass after all retained independent-review corrections. Final coordinator
output: `/tmp/story-2-7-final-verification.log`; targeted correction logs:
`/tmp/story-2-7-review-focused-unit.log` and `/tmp/story-2-7-review-admission-d1.log`.
The three fresh review layers, individual triage, corrections, orchestration
recovery and AC traceability are recorded in the Story 2.7 spec. Local commit and
supervisor advancement are technical gates, never BC human/product acceptance.

**Limitations:** access refusal at 90 days is not physical deletion. Purge,
early admission cutoff, canonical results/finalization, provider policy/A05,
execution-usage policy/A08, selected admission and UI remain later stories.
Full-publication validation/guard cost has not been load-tested on large corpora.
No hosted, provider, recruiter-launch, privacy-complete or BC acceptance claim.

# Conversation creation allowance — Story 2.6 (controlled development)

Creation now uses one shared D1 allowance: initially **10 per canonical trusted
address per UTC day**, configurable with `CONVERSATION_CREATION_LIMIT` (positive
safe integer; absent means 10, malformed values fail closed). Corporate NATs
share the allowance. A07 Origin/JSON/body rejection occurs before key lookup or
counter consumption. Exhaustion returns no-store `429 { error: 'rate_limited' }`
with an authoritative **HTTP-date Retry-After at the next UTC midnight**. Reads,
authentication and token hashing are unchanged and never touch counters. No
later-story admission, privacy UI, deletion endpoint or results are introduced.
A09 is unchanged: a lost credential response remains uncertain; only explicit
fresh creation may consume another allowance, never automatic retry or suggested
question carry/send. The controlled entry fixture now exercises actual D1 exhaustion.

## Actual temporary processing and retention

`0004_conversation_creation_limits.sql` adds two isolated tables, with no foreign
key or identifier linking them to Conversations:

- `conversation_creation_key`: a migration-seeded singleton with UTC day, expiry
  and a CSPRNG 256-bit daily key. Atomic conditional rollover selects one shared
  winner across Workers. No root secret or cross-day visitor identifier exists.
  Missing singleton or missing/malformed same-day key fails closed, not reset.
- `conversation_creation_counters`: domain-separated HMAC-SHA-256 pseudonym of
  canonical address plus UTC date, next-midnight expiry and creation count.
  A capped UPSERT immediately gates the Conversation INSERT via SQLite `changes()`
  in one D1 batch. Insert failure rolls back the counter. The SQL window/key guard
  is the transaction's admission boundary; SQLite time includes production queue
  delay. Credentials return only after confirmed insertion.

The address is transient request processing, not stored by the app, logged by
application code, sent to a model, or placed in a Conversation. Daily pseudonyms
**remain personal-data processing, not anonymization**; a party holding the
current daily key and counters could test candidate addresses. Daily key changes
prevent this mechanism itself from supplying a durable cross-day fingerprint.
This is not a claim that infrastructure cannot correlate traffic or timestamps.

Expiry is exactly next UTC midnight, with **no retention grace**. The Worker
Cron entry `* * * * *` atomically deletes expired counter rows and erases expired
key material even without requests, preserving only a nonvisitor operational day
watermark. A stale request cannot restore erased same-day keys. Scheduled failure
rejects with fixed `conversation_creation_cleanup_unavailable`, never raw SQL,
keys or addresses; the next scheduled pass can recover. Scheduler/D1 outages can
**delay physical deletion** beyond expiry. They do not authorize retention
extension, and logical expiry is not proof of deletion. No guarantee is made
about storage pages, host logs, D1 backups or restoration. Before hosting, verify
actual scheduling/failure visibility and the host/provider logs/backups policies;
Conversation-content 90-day physical purge remains a separate later story.

## Address trust and hosted activation prerequisites

Checked-in `CREATION_ADDRESS_MODE=local-fixed` uses **one synthetic 127.0.0.1**
identity for all local requests, ignoring every client IP header. This is a local
test/development setting, not a per-visitor hosted limiter. No IP secret or `.dev.vars`
copy is needed. Unknown/missing modes fail closed with the redacted uncertain
creation response; hosted failures never fall back to local identity.

Opt-in `cloudflare-direct` requires runtime `request.cf` colo/ASN metadata and one
strict valid `CF-Connecting-IP`; Worker subrequest and Pseudo IPv4 headers and
Cloudflare's cross-zone Worker sentinel are rejected. Equivalent IPv6 and
IPv4-mapped representations normalize together. Malformed, multiple and zoned
addresses fail closed. `X-Forwarded-For`/`X-Real-IP` never select the counter.

**Do not activate hosted mode from these tests alone.** An operator must verify
direct Cloudflare ingress, no upstream/same-zone/cross-zone Worker subrequests,
and no Pseudo IPv4 overwrite, together with trusted origin/HTTPS/environment
settings. Runtime metadata/header checks cannot prove this topology: same-zone
Workers can influence headers. Supervisor source checked 2026-11-18:
[Cloudflare request headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/).
No deployment/topology verification or production/privacy/human acceptance is
claimed here. Wrangler observability is explicitly disabled and application code
adds no request/address logging; unavoidable hosting/proxy/provider logging and
backups remain unproved launch prerequisites, not zero-retention promises.

## Verification of Story 2.6

Use the commands below in the existing verification section; all D1/browser
fixtures are disposable. `conversation-creation-limits.test.ts` checks UTC/config,
canonicalization, trusted-adapter metadata/header gates, pseudonym separation,
A07 ordering, no-store 429 and redaction. `conversations-runtime.mjs` checks 32
racing requests across two Workers yield exactly 10 creations, configured/shared
IPv6 caps, rollover, actual batch rollback, stale/missing/corrupt state, no-traffic
scheduled physical cleanup and failure/recovery, unchanged reads and A09.
Chromium verifies checked-in local configuration and persistent cap across a
Worker restart. Synthetic fixture address/clock overrides exist only in the test
composition, never in production request parsing. These are not hosted-ingress,
entry-UI, infrastructure-retention or BC acceptance evidence. Three fresh review
layers and retained fixes are complete; final supervisor advancement is separate
from pending BC acceptance.

Implementation-worker verification on 2026-11-18 against baseline
`8eb77d13766f8a8793b2d6cae6efcb3b755428b1`: all four typechecks, 45 workstation
fixtures plus 427 Vitest cases, both builds, six simulation cases and all 39
Playwright cases passed. Full smoke/build preceded two additional test-only
unit assertions; all typechecks and unit tests passed again afterward. Logs:
`/tmp/story-2-6-{typecheck,tests,build,smoke}.log`. The spec records corrected
intermediate test failures. Final independent coordinator rerun after all review
fixes passed the same full suite without skips; output is
`/tmp/story-2-6-final-verification.log`. Added real-D1 regressions cover mixed live/
expired cleanup, already-null idle keys, invalid counter expiry, NULL pseudonym
rejection, in-flight key/clock rollover and last-allowance response loss. One
unverified medium concern remains in deferred-work.md: measure substantial expired
backlogs against D1 limits before deciding whether cleanup needs bounded batches.
No load-induced cleanup failure has been demonstrated or waived.

## Owner verification of Story 2.6

**Verified by agents:** local deterministic tests, actual disposable D1/workerd
and Chromium; no hosted deployment, provider calls or operator storage changes.
Automated success is not BC acceptance. The four story ACs are traced in the spec.

**Developer checklist:** from the installed repository, run
`npx playwright test conversations.spec.ts` (two tests). It creates isolated
fixtures, verifies 32 racing requests across two Workers commit exactly 10,
returns 429 with the next UTC midnight, and preserves authenticated reads. It
also exercises configured shared IPv6 limits, rollback, no-traffic cleanup,
current-state preservation, corrupted state, post-key-acquisition rollover and
lost last-slot credentials. Chromium uses checked-in local configuration,
creates ten conversations, restarts only its owned Worker and verifies the cap
persists plus the existing thread remains readable. No entry UI is claimed.
The fixtures own their test data and clean only disposable state; no `db:init`
on your normal storage is required. If ports 5173/8787 are occupied, do not kill
operator servers: report the occupied-port failure and rerun when their owner
has deliberately freed them. For full regressions run `npm run typecheck`,
`npm test`, `npm run build`, then `npm run test:smoke`.

**Remaining work:** BC reviews this development handoff; before hosted activation,
operators must verify Cloudflare direct-ingress topology, scheduling/failure
visibility and infrastructure logs/backups. These are unproved release
prerequisites, not local-test conclusions. B4 backlog sizing is explicitly
unverified follow-up. Entry UI and Conversation-content purge belong to later
stories and are not delivered here.

**Next action:** inspect the spec and run the isolated checklist; report the
commands/results and any mismatched cap, reset, read or cleanup behavior before
human acceptance. The supervisor alone may accept technical advancement; sprint
status remains review and no BC acceptance is inferred.

---

# Anonymous conversation identity — Story 2.5 (controlled local development)

`POST /api/conversations` accepts an empty JSON object (`{}`), returning HTTP
201 with exactly `{ conversationId, sessionToken }` only after D1 persistence.
UUIDs are separate from 32 random-byte opaque tokens (64 lowercase hex chars).
Only SHA-256 token hashes and UTC `created_at`/`modified_at` are stored by
`0003_conversations.sql`; there is no message/result/lease schema yet.
Creation bodies are limited to 1,024 bytes (an implementation-owned transport
limit): declared excess is rejected before reading; streams are byte-counted
before buffering/JSON parsing even without an accurate Content-Length. Excess
returns redacted `413 creation_body_too_large` with no-store and no persistence.
Origin/media-type checks still precede body processing.

`GET /api/conversations/:id` accepts only `Authorization: Bearer <sessionToken>`.
It authenticates the UUID/hash pair before producing authoritative state:
`{ conversationId, transcript: [], processing: { status: 'idle' }, admission:
{ available: false, reason: 'admission_unavailable' } }`. No token, hash or
execution owner is returned. Missing/malformed/wrong/crossed credentials and
missing/deleted/expired records all return `401 { error:
'conversation_unavailable' }` with the identical `WWW-Authenticate: Bearer`
challenge. Bearer credentials accept one or more separator spaces, not tabs or
malformed tokens. HEAD is explicitly unsupported (404/empty/no-store, no DB),
not an implicit GET alias. Access expires at creation plus exactly 90 × 24
hours (allowed strictly before, denied at/after); activity cannot extend it.
Reads are independent of publication, read-only, and never invoke providers.
Creation/read/error responses use `Cache-Control: no-store`.

**A07:** `wrangler.jsonc` explicitly configures `TRUSTED_BROWSER_ORIGIN` as
`http://127.0.0.1:5173`. Vite's existing `/api` proxy preserves browser Origin;
the Worker does not infer trust from Host or forwarding headers. Missing,
`null` and foreign Origin, non-JSON media types, contradictory Fetch Metadata
(site other than `same-origin`, mode other than `cors`/`same-origin`, destination
other than `empty`) and nonempty/malformed bodies are rejected before mutation.
JSON accepts equivalent quoted/unquoted UTF-8 charset parameters (case-insensitive).
Fetch Metadata may be absent, but Origin and JSON may not. Headerless CLI clients
are unsupported; forged headers are not authentication. No CORS allowance is
added. Loopback HTTP is for local testing, not hosted HTTPS/security sign-off.

**A09:** A failed creation may already have committed. The redacted 503
`creation_uncertain` notice says so and requires explicit fresh creation, which
may consume another allowance. A transport loss requires that same notice at
future entry integration. There is no unknown-token recovery, automatic retry,
implicit fresh creation or suggested-question carry/send. Exhaustion must show
the authoritative allowance resume time. Controlled exhaustion uses canonical
`429 rate_limited` and `Retry-After`; the fixture derives resume time from its
authoritative Retry-After HTTP date, not an invented response payload.
Historically Story 2.5 used controlled allowance fixtures only. Story 2.6 now
implements the actual shared counter above; entry UI remains Story 2.15, and
admission/messages/results remain 2.7/2.8. There
are no listing/admin/deletion/message routes, browser credential storage or
Conversation-content purge scheduler in Story 2.5. Expiry prevents reads but physical purge,
backup assessment and hosted acceptance remain later obligations.

Verification commands (all disposable D1, never operator storage):

```bash
npm run typecheck
npm test
npm run build
npx playwright test conversations.spec.ts d1.spec.ts fixture-controls.spec.ts
git diff --check
npm run test:smoke
```

The conversation E2E uses two independent actual-workerd readers over shared D1,
checks hash-only storage, isolation, 90-day boundary, deletion, policy ordering,
read-only state, migration reruns/preservation, redacted dependency failures and
lost-response/explicit-fresh/exhaustion/suggested-intent controlled fixtures. It
also verifies the actual Vite proxy on ephemeral ports, plus Chromium-generated
same-origin headers through the unmodified checked-in frontend/Worker origin
configuration over disposable initialized D1. A real browser foreign-origin
simple POST is rejected before media-type processing and adds no record. These
are HTTP/configuration checks, not entry-UI acceptance. Node's fetch transport
overwrites `Sec-Fetch-Mode`, so its contradictory-mode case uses a test-only raw
header injector and asserts the actual application-handler input. The production
Worker interprets neither that injector nor the fixture clock header. Fixtures
were not proof of IP counting in Story 2.5; the updated Story 2.6 fixtures cover
counters, but not browser lifecycle/entry UX or recruiter readiness.

**Historical pre-review implementation verification (2026-11-18, working tree based on
`d39c16146c5592c96c7ad41c7105d36a2c7ff188`):** typecheck, 45 Bash fixtures plus
380 Vitest tests, both builds and whitespace checks passed. The focused
conversation/D1/fixture-control run passed all 25 cases without skips. Full
`npm run test:smoke` passed its six simulation tests and all 38 Playwright cases,
including Chromium/proxy, publication and retrieval. Ports 5173/8787 were free;
only disposable fixture servers/storage were used. This supersedes the earlier
Story 2.4 occupied-port verification gap for this working tree, without changing
its historical record. No deployment, operator migration, counter/UI or hosted
security acceptance is claimed. These results precede the review corrections;
they are not a full-verification claim for the corrected working tree. Review
corrections add bounded bodies, HTTP interoperability/challenge fixes, executable
controlled entry transitions and checked-in-config browser coverage. Focused correction verification passed: `npx vitest run
tests/bootstrap/conversations.test.ts` (38 tests), `npx playwright test
conversations.spec.ts` (two cases, including actual Chromium), and
`git diff --check`. No wider test/build/typecheck run is claimed for these
corrections; the final parent verification is recorded next.

**Final post-review verification (2026-11-18):** the parent read every correction,
fixed the browser test's DOM typing through a real form/button without weakening
TypeScript settings, and passed all four typechecks, 45 workstation fixtures,
397 Vitest tests, both builds, six simulation tests and all 39 Playwright cases
(no skips). This includes actual configured Chromium creation/read, foreign-origin
rejection without a write, real D1 isolation and all publication/retrieval controls.
All retained findings from the three independent review layers are fixed and
verified; no unresolved finding or deferred work remains. No operator migration,
deployment or hosted acceptance was performed.

**Owner acceptance (2026-11-18):** BC explicitly accepted the delivered local
Story 2.5 scope and authorized closure/local commit against implementation
`17ed3edf27da49da180695d77da6a686298156f3`. Sprint status is done; Epic 2 remains
in-progress. No additional operator test output was supplied or inferred; prior
agent verification/review stands. This documentation-only closure does not
approve hosted/recruiter release or claim later counter/UI/retention integration.

## Owner verification of Story 2.5

**Prerequisites:** pinned toolchain and installed packages from the setup below;
Chromium already installed for browser tests. Ports 5173/8787 must be free; stop
only your own servers. No real professional corpus or active publication is needed.

**Isolated automated check:** `npx playwright test conversations.spec.ts` should
pass two cases. It starts disposable D1/servers, exercises real Chromium, and
cleans up its own state; it does not migrate your operator database. For full
regression evidence run `npm run test:smoke` (39 Playwright cases plus six
simulation tests). These tests create temporary data, not read-only observations.

**Optional own-clone API journey (mutates local state):** after reviewing the
additive migration, run `npm run db:init` to apply pending local migrations
without reset; this changes `.wrangler/state`. Then `bash scripts/dev.sh` starts
both services. Open **http://127.0.0.1:5173/**; the shell remains technical, not a
chat UI. In its developer console, keep the token only in volatile memory and
never copy it into URLs, logs, screenshots or shared output:

```js
const c25 = await fetch('/api/conversations', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
}).then(r => r.json());
// Inspect the UUID, not the secret token.
c25.conversationId;
await fetch(`/api/conversations/${c25.conversationId}`, {
  headers: { Authorization: `Bearer ${c25.sessionToken}` }
}).then(async r => ({ status: r.status, cache: r.headers.get('Cache-Control'), body: await r.json() }));
```

Expect a UUID and a 200 read with `no-store`, empty transcript, idle processing
and explicitly unavailable admission. Repeated authenticated GETs are read-only.
Remove Authorization: expect neutral 401 with `WWW-Authenticate: Bearer`.
Create another conversation explicitly and use its token against the first UUID:
expect the same 401, never the other conversation. Missing/foreign Origin and
non-JSON creation must reject before writing; the isolated tests cover exact
expiry, lost responses and streaming/body limits without operator clock edits.
Stop your launcher with Ctrl+C before rerunning smoke.

**Limits and acceptance:** no turn admission, result generation, entry UI, shared
IP counter or physical purge is delivered here. A09's loss/exhaustion/suggested
intent fixture is an executable contract example, not actual entry/counter
integration (2.15/2.6); hosted origin/HTTPS and retention operations remain their
later acceptance obligations. No current-story defect is outstanding; BC has
accepted and closed this development story. For later regression checks, report
the two conversation-test results and any divergent API status/body without
tokens. Story 2.6 may now be taken up separately; it is not implemented by this
closure.

# Scoped lexical evidence retrieval — Story 2.4

The portable `Retriever` and core `retrieveEvidence` guard now support trusted
frozen document membership against one verified local D1 publication. This is
not exposed over application HTTP or connected to a conversation/model/UI.
Existing health/publication startup below is unchanged. No operator D1 or
approved public corpus/approvals were modified to implement or verify retrieval.

```bash
npm run typecheck
npm test
npm run build
npm run test:retrieval       # isolated real D1, no browser or fixed app ports
npm run evaluate:retrieval   # writes the actual versioned fictional-corpus report
```

Evaluation needs only the installed locked toolchain and the pinned source
commit in the local object store. It creates a disposable project/D1 with
allowlisted settings, never activates or resets existing developer storage.
See [retrieval tooling](../../tools/retrieval/README.md) for input/configuration
limits, bound literal FTS encoding, membership/ranking/budget order, coherent
transactional reads, provenance validation, and rerun/report identity details.

Defaults are topK 5 and a whole-chunk text budget of 12,000 UTF-16 units,
including the standalone fictional/non-BC context. No lexical tokens/matches
with valid publication/scope yields successful empty evidence: **insufficient
retrieved evidence**, not universal absence. Unusable publication, missing frozen
members and D1 faults are controlled `retrieval_unavailable`, not empty success.
Nonempty evidence is also not an answer-adequacy guarantee. There is no automatic
query rewriting, retry, fallback, semantic provider or relevance threshold.

The [actual report](../evaluations/retrieval-2-4.md) executes all 12 cases on the
approved fictional source `4323afe312f43b6b87a014abee062e03e12f6022`, independently
of application HEAD. Required passage recall is 6/10, forbidden passage hits 0.
English/corporate/paraphrase vocabulary and a scoped prototype-limits query
expose lexical gaps; named-project/follow-up cases also return extra passages.
The report retains exact text/hash/location/rank provenance and the implementation
input fingerprint. BC should inspect the evidence and retain the baseline or
request an explicit architecture decision before expansion. This is not a model
judgment, real-career/recruiter acceptance or release approval.

Verification on the Story 2.4 working tree (base HEAD
`dd1ed890484ca6e9b4a5ebb845715a31a3cfc2f2`): typecheck, all 45 Bash workstation
fixtures plus 359 Vitest cases, both builds, both focused retrieval E2E cases
(two independent Workers, dominant excluded distractors, independently asserted
ranking/ties/budgets, faults/corruption, read-only checks, pinned provenance,
coordinated publication races and standalone negative-failure exits), and the
evaluation command pass after review corrections. All 24 existing isolated
D1/fixture-control cases also passed in the parent run. Two consecutive final
evaluations produced byte-identical reports. Actual installed Wrangler/workerd
versions and the copied dependency lock are identified in the report.

**Full-suite environmental gap:** `npm run test:smoke` was attempted: the
simulation precheck and 26/36 Playwright cases passed, including all 12 existing
D1 cases and the new retrieval matrix. Ten existing browser/publication cases
failed because pre-existing operator servers occupied ports 5173 and 8787
(`EADDRINUSE`), not because of an assertion about retrieval. Failures were seven
`bootstrap.spec.ts` cases (browser availability, ready shell, stalled/malformed
health, StrictMode, both occupied-port controls, and dev-HTTP privacy) and all
three `publication.spec.ts` cases. The failed-Worker-startup bootstrap case
passed. Neither server nor its operator storage was stopped, reused or mutated
for tests. Full smoke/publication verification remains to rerun when their owner
has freed these fixed ports; no pass is claimed for those blocked cases.

**Owner acceptance and closure (2026-11-18):** BC accepted Story 2.4 and its
development lexical baseline against implementation
`01fe6fc05c9de87466f8d5161c00b60167599cd3`, and authorized closure plus a local
commit, not a push. The supplied operator smoke run passed all six simulation
tests and 27/37 Playwright cases, including both retrieval cases. All ten
browser/publication failures were occupied-port startup failures on 5173/8787.
No subsequent complete pass was supplied; this environmental verification gap
remains documented rather than being turned into a success claim. The accepted
baseline retains its 6/10 required-passage recall and development-only fictional
scope; acceptance is not a model-quality or recruiter-release guarantee. The
existing regenerated report now identifies the implementation commit, with
unchanged source, fingerprint and passage outcomes.

---

# Current local publication — Story 2.3

This section supersedes historical availability-only health instructions below.
Use the pinned Node/npm toolchain and locked installation described here; no
new dependency, credential, hosted service or recruiter release is required.

```bash
npm run db:init             # bootstrap + publication migration; preserves data
# Separate terminals, fixed loopback ports:
npm run dev:worker
npm run dev:frontend
# Once both are running, in another terminal:
SOURCE_REVISION=4323afe312f43b6b87a014abee062e03e12f6022
npm run content:activate -- --revision "$SOURCE_REVISION"
curl -i http://127.0.0.1:5173/api/health
```

The source revision is explicit and independent of application HEAD. The public
worktree must exactly match its committed Markdown snapshot. The approved corpus
is fiction unrelated to BC: warnings remain in evidence, and local activation is
not permission for recruiter use. See [public-content tooling](../../tools/public-content/README.md#coherent-local-activation-story-23)
for source validation, exact immutable asset delivery and rollback prerequisites.

Before activation, a live Worker honestly returns HTTP 503
`{"status":"unavailable"}` and the French shell reports unavailable. A complete
coherent publication returns HTTP 200 with only `status: "ok"`,
`catalogRevision`, `catalogHash`, `catalogAssetPath`. Health is `no-store` and
contains no diagnostics, visitor state or evidence. Invalid/unusable publication
state also fails closed. `npm run db:check` still privately verifies bootstrap
storage; it does not assert publication readiness. No processing UI is enabled.

The frontend server must run on `127.0.0.1:5173` before activation. Only exact
`/assets/resources-catalog.<64-lowercase-hex-hash>.json` generated assets are
served with verified canonical bytes and immutable caching. Source/private trees,
search bundles, traversal and symlinks remain denied. This is a development-only
Vite delivery adapter, not production asset packaging or a deployment promise.

Activation verifies the asset over HTTP before a single D1 transactional batch
replaces the entire current publication plus singleton authority. A failure
before/during the batch leaves the previous dataset intact (or none on first
activation); already-built immutable assets remain. No automatic retry occurs.
Rollback uses the same command with the deliberate previous full source revision
after safely restoring its public worktree bytes; unrelated D1/history is never
restored/reset. CLI and Worker continue sharing `.wrangler/state/v3/d1`. Stop
only your owned servers with Ctrl+C after use.

Checks: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:d1`,
`npm run test:publication`, `npm run test:smoke`, `git diff --check`. D1 and
publication tests need no browser and use disposable state; smoke retains the
browser/startup/privacy controls below. No hosted D1, deployment, model call,
retrieval/ranking or publication history is implemented.

---

# Local application — current fresh-clone journey (Story 1.5)

Current instructions for **Ubuntu 24.04 LTS / Bash**, **Node 24.22.0 / npm 11.19.1**. This verifies local frontend/Worker availability, local D1 and deterministic test-only LLM simulation, not a business pipeline or launch readiness. No hosted resource, Cloudflare/model credential, login or Python is required. [Measured fresh-clone evidence and limitations](fresh-clone-verification.md) are separate from the preserved, dated Story 1.4/1.3/1.2 evidence below. **Historical instructions are not the current procedure.**

## Current setup and checks

Run in order; stop at the first failing command and use [troubleshooting](#current-troubleshooting), not a forced upgrade or hosted fallback.

1. **Shell entry — run this block alone**, even if your current terminal uses Zsh or already uses Bash:

   <!-- fresh-terminal:bash -->
   ```bash
   bash --noprofile --norc
   ```

   **Wait for the new Bash prompt before copying the next block.** This starts a child Bash without reading profiles; `exit` returns to your original shell. It does not change your login/default shell. Running `bash scripts/check-workstation.sh` later only runs a check in a child process: it does **not** switch or configure the calling shell.

   Only after entering that Bash, if Git/the clone, fnm or the pinned Node distribution is missing, complete [workstation acquisition](workstation.md#git) and [Node/npm acquisition](workstation.md#node-and-npm) separately. Run their acquisition commands in this Bash, not the original Zsh. Do not install application packages to fix a tool-selection failure. Keep profiles and existing defaults (including an absent fnm default) unchanged.

   In that Bash, initialize the clone path explicitly (replace the example path), initialize fnm for **this** shell, select the repository pin, then run the gate. No `.bashrc`, automatic cd hook or inherited `PROJECT_ROOT` is needed:

   <!-- fresh-terminal:init -->
   ```bash
   WORKSTATION_READY=false
   export PROJECT_ROOT="$HOME/dev/candidate-copilot" &&
   cd "$PROJECT_ROOT" &&
   export PATH="$HOME/.local/share/fnm:$PATH" &&
   FNM_ENV=$(fnm env --shell bash) &&
   eval "$FNM_ENV" &&
   fnm use "$(cat .node-version)" &&
   hash -r &&
   node --version &&
   npm --version &&
   bash scripts/check-workstation.sh &&
   WORKSTATION_READY=true
   ```

   Require **v24.22.0 / 11.19.1**, a successful gate and `WORKSTATION_READY=true`. On any failure, stop and use [workstation troubleshooting](workstation.md#troubleshooting); do not continue with installation. The `&&` chain stops selection/checks at the first failure, and the following install guard refuses to run after a failed handoff.

2. Only after successful selection/gate **in the same Bash**, install the locked graph as your normal user, with Internet access to the public registry/platform packages and no token. `npm ci` replaces only this clone's dependencies:

   <!-- fresh-terminal:install -->
   ```bash
   [[ ${WORKSTATION_READY:-false} == true ]] &&
   sha256sum package-lock.json &&
   npm ci &&
   sha256sum package-lock.json &&
   git --no-pager diff --exit-code -- package-lock.json
   ```

   Both lock hashes must match. If the guard fails, repeat step 1, not an unguarded install.

   Do not delete/regenerate the lockfile, use `npm install`, approve dependency scripts blindly or run `npm audit fix --force`. The selected npm warns about unapproved esbuild/workerd scripts; the verified workflow needs no approval. Use package-local tools, never global Vite/Wrangler/Playwright.

3. **Configuration is optional and empty.** No copy is needed. `.dev.vars.example` is comment-only; if desired, copy it only when no local file already exists:

   ```bash
   test -e .dev.vars || cp -- .dev.vars.example .dev.vars
   ```

   Never inspect/copy real private or env files for verification, add credentials or use `VITE_*` for server settings. Protected Worker/build/D1 commands explicitly use `/dev/null`, command-local CI and disabled metrics. D1's `DB` binding is reviewed in `wrangler.jsonc`, not provided by an env variable.

4. Generate binding-only declarations and initialize the clone's local D1 (safe to rerun without deletion):

   ```bash
   npm run db:types
   git --no-pager diff --exit-code -- src/worker/env.d.ts
   npm run db:init
   npm run db:check
   ```

   The generated declarations must match the reviewed configuration. Storage, migration identity and [warned D1-only reset](#d1-diagnosis-and-destructive-local-only-reset) are detailed below. Health does **not** check D1.

5. Provision the [explicit browser/system and PTY prerequisites](#browser-system-and-terminal-prerequisites). They must be available **before** `npm test` (real PTY builds) and full smoke. As your normal user, download Chromium selected by the locked Playwright (Internet/disk required, no global browser or inherited cache needed):

   ```bash
   ./node_modules/.bin/playwright --version  # 1.64.1
   ./node_modules/.bin/playwright install chromium
   ```

   Browser installation is separate from `npm ci` and optional for ordinary startup or `test:d1`, but **required for full verification**. Never use automatic `--with-deps`/`install-deps` privilege escalation.

6. With ports 5173/8787 free and no manually started servers, run every validation. This pasted block checks the toolchain first and stops at the first failure; do not run later stages separately to bypass a failed check:

   <!-- fresh-terminal:validate -->
   ```bash
   bash scripts/check-workstation.sh &&
   npm run typecheck &&
   npm test &&
   npm run test:d1 &&  # browser-free: no page/browser fixture requested
   npm run build &&
   node scripts/check-build-isolation.mjs &&
   node scripts/check-build-interactivity.mjs &&
   npm run test:smoke &&
   npm audit --json &&
   npm audit --omit=dev &&
   npm ls --all &&
   git --no-pager diff --exit-code -- package-lock.json src/worker/env.d.ts &&
   git --no-pager diff --check &&
   git --no-pager status --short
   ```

   `test:smoke` runs the **existing** `tests/bootstrap/simulation.test.ts` first (exact repeatable output, unsupported-input rejection, forbidden network transports), then Playwright via fail-fast `&&`. A simulation failure prevents Playwright execution. Playwright covers browser/Worker availability, actual Worker-binding SQL and fixture negatives; its sanitized copies reuse installed dependencies, so those copies alone are **not fresh-clone evidence**. Tests never reuse existing servers. Build verifiers retain 22 canaries, real terminal builds and synthetic prompt/cleanup controls. Worker build is dry-run only, never upload/deploy. Audits require registry access; findings require review, not automatic fixes.

7. Perform the [two-terminal startup/shutdown checks](#current-two-terminal-startup-and-shutdown) on this clone's own servers. Stop both before rerunning smoke. Check `ss` and `git --no-pager status --short` afterward: no application listener or tracked runtime/private file may remain. Expected local dependencies, build output, optional comment-only config, logs and D1 are ignored, not committed.

## Browser, system and terminal prerequisites

These are **explicit administrator actions**, not application behavior. Review the following Ubuntu 24.04 x86_64 packages before asking an administrator to install them; use the workstation's official Ubuntu repositories. The browser libraries match [Playwright 1.64.1's Noble Chromium list](https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-core/src/server/registry/nativeDeps.ts); the two font packages support this headless shell. No desktop/Xvfb, Firefox or WebKit is needed for this suite.

```bash
sudo apt-get update
sudo apt-get install --yes bsdutils util-linux procps iproute2 \
  fonts-liberation fonts-noto-color-emoji \
  libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libatspi2.0-0t64 \
  libcairo2 libcups2t64 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0t64 \
  libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
  libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2
```

No application/test script runs sudo or installs OS packages. Check actual terminal/procfs access, not just package presence:

```bash
/usr/bin/script --version
dpkg-query -S /usr/bin/script  # bsdutils, from util-linux
ls -l /dev/ptmx /dev/pts/ptmx
findmnt /proc
findmnt /dev/pts
/usr/bin/script -q -e -c 'test -t 0 && test -t 1 && test -t 2' /dev/null
```

Require readable same-user `/proc` (including `self/stat` and `self/environ`) and working PTYs. `npm test` runs the real in-terminal probe, two protected builds and eight synthetic controls. Cleanup is trusted-tool regression coverage, not a sandbox: hostile marker removal, SIGKILL, host failure or restricted `/proc` are not covered. Container/headless success does not prove graphical-workstation usability or browser sandbox/security guarantees.

## Daily development launcher

After completing the one-time setup above, run from the Linux clone in a terminal (no manual fnm block or `WORKSTATION_READY` variable needed):

```bash
bash scripts/dev.sh
```

This starts **both** Worker and frontend. Open **http://127.0.0.1:5173/**. One **Ctrl+C** stops both owned services. If either service exits, the launcher stops the sibling and returns nonzero; read the first error in the shared logs. It does not wait for HTTP readiness, so a brief unavailable state during Worker startup is normal.

For separate logs or the Worker stop/recovery exercise, use two terminals instead:

```bash
# Terminal 1
bash scripts/dev.sh worker
```

```bash
# Terminal 2
bash scripts/dev.sh frontend
```

Do not run combined and separate modes at the same time: they use the same fixed ports. `bash scripts/dev.sh all` is equivalent to the default; `--help` lists supported modes. No additional arguments are forwarded. From outside the clone, use its absolute script path, for example `bash "$HOME/dev/candidate-copilot/scripts/dev.sh"`.

The launcher resolves its own clone, initializes the installed fnm only in its child shell, selects `.node-version`, runs the existing workstation gate and checks for the required local tools. Missing tools/packages fail with guidance; nothing is installed, no D1 migration/reset or full audit runs, and profiles/defaults remain unchanged. Existing protected npm commands are reused without changing their ports or local-only settings. Startup uses ignored runtime state and can persist local Worker/D1 writes; it is not a read-only check.

Shutdown targets only process groups created by this invocation, with up to five seconds for termination before forced cleanup. It never kills a process by name or occupied port. SIGINT/Ctrl+C returns 130 and SIGTERM returns 143. Cleanup assumes trusted npm tools keep descendants in their inherited groups; detached/daemonized descendants, SIGKILL of the launcher and host failure are not cleanup guarantees.

The explicit blocks below remain the manual diagnostic/fresh-clone alternative, not a prerequisite for running the daily launcher.

## Current two-terminal startup and shutdown

In **each** terminal, first run this shell-entry block **alone** (including when starting in Zsh):

<!-- fresh-terminal:bash -->
```bash
bash --noprofile --norc
```

**Wait for the new Bash prompt before the next block.** Then explicitly initialize the clone path (replace the example), fnm's Bash environment and the repository-pinned Node, and rerun the gate. Do not rely on `.bashrc`, cd hooks, another terminal's exports or a previous selection:

<!-- fresh-terminal:init -->
```bash
WORKSTATION_READY=false
export PROJECT_ROOT="$HOME/dev/candidate-copilot" &&
cd "$PROJECT_ROOT" &&
export PATH="$HOME/.local/share/fnm:$PATH" &&
FNM_ENV=$(fnm env --shell bash) &&
eval "$FNM_ENV" &&
fnm use "$(cat .node-version)" &&
hash -r &&
node --version &&
npm --version &&
bash scripts/check-workstation.sh &&
WORKSTATION_READY=true
```

Stop on failure; missing tools/versions use the separate [acquisition guide](workstation.md#node-and-npm), never automatic installation or a default/profile change. Only after success, run **one** command in each prepared Bash:

Terminal 1:

<!-- fresh-terminal:worker -->
```bash
[[ ${WORKSTATION_READY:-false} == true ]] && npm run dev:worker
```

Terminal 2 (separately):

<!-- fresh-terminal:frontend -->
```bash
[[ ${WORKSTATION_READY:-false} == true ]] && npm run dev:frontend
```

Both services bind IPv4 loopback with fixed ports; neither reuses an occupied port or selects a hosted fallback. Worker uses `--local`, explicit `.wrangler/state`, empty env-file input, CI, disabled metrics and a loopback inspector. Internal loopback runtime/inspector ports are not application URLs.

Open **http://127.0.0.1:5173/**. The French technical shell should show “Worker disponible.” Check both endpoints from another terminal:

```bash
curl --fail --show-error --connect-timeout 2 --max-time 5 http://127.0.0.1:8787/api/health
curl --fail --show-error --connect-timeout 2 --max-time 5 http://127.0.0.1:5173/api/health
```

Each returns exactly `{"status":"ok"}` (200); health is availability-only, with no SQL, model call, configuration or public diagnostic. A frontend HTML 200 alone is insufficient. Run `db:check`/`test:d1` for persistence evidence. The simulated provider is test-only, never a public route or chat UI.

Stop **only the owned Worker with Ctrl+C in terminal 1**; leave frontend running and reload. Within five seconds expect “Worker indisponible. Rechargez la page pour réessayer.” Direct curl must fail to connect and proxied health must not return a successful health response. Restart the Worker, reload and confirm recovery. Finally Ctrl+C **each** owned command in its terminal and check:

```bash
ss -ltnp '( sport = :5173 or sport = :8787 )'  # no application listeners
```

This manual two-terminal procedure allows independent Worker stop/recovery checks; the daily launcher above is an alternative. Neither procedure uses blanket `pkill`, unknown-process killing, login or deployment.

## Current troubleshooting

| Failure | Diagnose without reading private configuration | Corrective action |
| --- | --- | --- |
| Missing/wrong tool or PATH | `type -a git node npm fnm`; `node --version`; `npm --version`; `bash scripts/check-workstation.sh` | Follow [workstation troubleshooting](workstation.md#troubleshooting), reselect the pin and `hash -r`. Administrator restores Ubuntu Git if needed. Never force engine checks, change defaults or globally upgrade npm. |
| Missing/inconsistent packages or native binary | `npm ls --all`; `npm config get registry`; `npm config get omit`; `npm cache verify`; `git --no-pager diff -- package.json package-lock.json` | Fix first download/DNS/CA/permission error; restore matching reviewed manifest/lock and run `npm ci --include=dev --include=optional` to override inherited development/optional dependency omissions. Public registry needs no token. Never disable TLS, dump token-bearing config, delete the lock or install a global bundler. |
| Port occupied (5173/8787 or reported inspector port) | `ss -ltnp '( sport = :5173 or sport = :8787 )'` (substitute reported inspector port if needed) | Stop only your own listener in its original terminal, or ask its owner. Keep ports fixed; smoke deliberately fails instead of reusing/stopping an unknown service. |
| Wrong configuration/binding or uninitialized D1 | `npm run db:check`; compare reviewed `wrangler.jsonc` with `git --no-pager diff -- wrangler.jsonc`; inspect reported migration/path, not real env files | Restore exactly the local `DB` identity below. New storage: `db:init`, then `db:check`. For altered history or unusable storage, follow [D1 diagnosis](#d1-diagnosis-and-destructive-local-only-reset); never hosted IDs, login, remote flags or automatic deletion. |
| Worker unavailable, build/type error, unexpected prompt | Check owned terminal's first error; direct and proxied curls above; `npm run typecheck`; `npm run build:worker` | Restart only the corrected local Worker and reload. Stop on questions; do not approve skills or provide credentials. Check command-local CI/local/metrics/empty-env safeguards. A secret or D1 reset cannot fix compilation or availability. |
| Missing/mismatched browser or library | `./node_modules/.bin/playwright --version`; `./node_modules/.bin/playwright install --dry-run chromium`; `ldd /reported/browser/executable` (look for `not found`) | Rerun the pinned Chromium install after `npm ci`. Administrator reviews the explicit Ubuntu library list above. No system browser substitution or automatic install-deps. OS policy may block launch. |
| PTY, `/proc`, deadline/output or cleanup failure | Run prerequisite commands above and `node scripts/check-build-interactivity.mjs`; inspect first bounded error and retained owned-fixture path | Administrator repairs bsdutils/procfs/devpts policy as appropriate; no npm PTY workaround, blind chmod/remount or security weakening. Stop only provably owned survivors before removing that fixture; do not delete beneath a writer. |
| Forbidden dev file (403/404) or isolation failure | Inspect failed application-module requests and Vite output; `node scripts/check-build-isolation.mjs` | Keep env/private/content/preparation/state excluded. Do not broaden filesystem allowlists, enable SPA fallback or import private material to silence a test. |

## Binding, storage and migrations

- `wrangler.jsonc` configures exactly `DB`, database **`candidate-copilot-local`**, stable **`00000000-0000-0000-0000-000000000000`**, **`remote:false`**, `migrations_dir:migrations`. The all-zero UUID is local identity, not a provisioned hosted database. No `d1 create`, login, remote or preview operation is needed or supported here.
- `scripts/local-d1.mjs` validates that identity before initialization/check/type generation. Migration settings must be omitted defaults or exactly `migrations_table:d1_migrations` and `migrations_pattern:migrations/*.sql`; ledger/pattern overrides are rejected before storage access. These commands accept **no extra arguments** (including remote, preview, alternate targets, environments or persistence paths), and inherited `CLOUDFLARE_ENV`/`WRANGLER_ENV` selectors are cleared before loading Wrangler. Local Wrangler is used, never a global executable or remote fallback. Initialization checks the bootstrap SQL exists, applies pending migrations with explicit config, `--local`, `--persist-to .wrangler/state`, `/dev/null`, CI and metrics protection, then invokes the private SQL helper through a local binding proxy. Errors are nonzero and never trigger reset.
- `npm run dev:worker` uses the same explicit **`.wrangler/state`** persistence root. Wrangler CLI adds `v3`; `getPlatformProxy` instead receives **`.wrangler/state/v3`**, `remoteBindings:false` and `envFiles:['/dev/null']`. D1 lives beneath **`.wrangler/state/v3/d1`**. Proxy disposal is awaited on success and SQL failure. An unusable storage directory is rejected before starting the proxy runtime. `.wrangler/` remains ignored and excluded from application publication.
- `migrations/0001_local_bootstrap.sql` runs only `SELECT 1`; Wrangler records **`0001_local_bootstrap.sql`** in its own **`d1_migrations`** ledger. Only ledger/SQLite metadata tables are created, not Conversation or other business tables. The helper checks both the exact SQL result and **exactly one matching ledger marker**; a working empty SQLite database is not initialized storage. There is no custom migration engine. Add ordered, uniquely numbered reviewed migrations; **never edit, rename or reorder an applied migration**. See [migrations/README.md](../../migrations/README.md).
- `npm run db:types` invokes protected `wrangler types --include-runtime=false` with explicit config and empty env-file input. Commit the generated binding declarations, and regenerate after a reviewed config change. Worker and test typing use the generated `Cloudflare.Env`, not a handwritten Env. Workers runtime types are scoped to Worker/tooling configs; the frontend config still includes only browser/Vite/shared inputs. Node tooling explicitly imports Node's URL where its iterator types differ from Workers types.

## D1 diagnosis and destructive local-only reset

- **Missing/renamed/wrong binding:** `npm run db:check` must fail. Compare the nonsensitive binding identity above with the reviewed `wrangler.jsonc`; restore that configuration rather than logging in, supplying a hosted ID, adding a preview binding or changing health to run SQL. Health/404/build contracts do not diagnose D1 readiness.
- **New, never-initialized storage:** run `npm run db:init`, then `npm run db:check`. Use the same repository and explicit persistence root for CLI/proxy/dev; the independent workerd harness is not that storage.
- **Altered history in previously initialized storage:** stop and review the unexpected ledger/marker change before running initialization again. Initialization is **not history repair**: if a recorded name was renamed/deleted, Wrangler can replay that now-unrecorded migration, add its original name and leave the altered row. The bootstrap marker check can then pass without repairing that history. Do not forge ledger entries, edit applied SQL or blindly rerun initialization to hide the discrepancy.
- **Missing/malformed migration:** inspect the reported SQL filename and restore the reviewed file. Do not delete state or change already-applied SQL as a repair. A failed migration exits nonzero; a later rerun applies remaining pending work, not a rebuild/reset.
- **Unusable storage:** stop owned writers; inspect the reported local path, disk space and ownership/permissions without reading real private/env files. A directory obstructed by a file or inaccessible to the current user is an error. Do not use sudo, broad chmod/chown or automatic deletion to hide it. If proxy construction itself fails before returning a disposable handle, the command exits nonzero through upstream exit cleanup rather than hanging on runtime handles. A disposable obstructed-cache control checks that failure and absence of owned runtime survivors before fixture fallback cleanup.
- **Test failure:** inspect bounded attachments under ignored `test-results/`. All D1 integration state, HOME/XDG/npm/Wrangler settings and env/content canaries are disposable. Only SQL files beneath `migrations/`, named scripts and the existing allowlisted application inputs are copied; real private/env files and developer D1 state are never copied or reset. Fixture-owned runtimes/descendants are stopped before deletion; a cleanup failure retains its fixture. The same trusted-tool, readable-`/proc`, SIGKILL/host-failure limits documented below apply.

**DESTRUCTIVE RESET — deletes all local D1 data and its migration ledger. This is never initialization or a routine repair.** Stop all Worker/dev, proxy, test and other writers to this repository's local state first. Verify the absolute repository target and that you intend to lose its local D1 data; preserve anything needed before proceeding. Do not substitute another directory, use `--remote`, or delete all `.wrangler/` (which may contain other local state). There is deliberately no automatic reset script.

Only after that manual review, from the verified repository root:

```bash
pwd -P  # verify the intended repository, not a parent/other checkout
realpath -- .wrangler/state/v3/d1  # inspect the exact local target before deletion
# STOP if either target is unexpected or any writer is still running.
rm -r -- .wrangler/state/v3/d1    # DESTRUCTIVE: local D1 only
npm run db:init
npm run db:check
```

If the target is absent, there is nothing to reset: initialize instead. Verification exercises this deletion **only in owned disposable state**, with all one-shots closed; another synthetic state file must survive and reinitialization must work. No existing developer data is reset to prove this procedure.

## Historical Story 1.4 evidence and measured verification

Official references supplied by the approved spec were checked **2026-10-20**, and all three URLs returned HTTP 200 during implementation:

- [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/): local bindings and storage, no hosted database prerequisite.
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/): ordered SQL and Wrangler's ledger/application mechanism.
- [Wrangler APIs](https://developers.cloudflare.com/workers/wrangler/api/): binding proxy and runtime lifecycle. Installed **4.151.2** schema/declarations corroborate `remote:false`, `getPlatformProxy` persistence/env/remote options, `createTestHarness`/scheduled events and migration application. The harness explicitly uses independent nonpersistent storage; it cannot establish CLI persistence sharing.

Verified **2026-10-20**, **Ubuntu 24.04.5 LTS / x86_64**, Git **2.43.0**, selected Node **24.22.0 / npm 11.19.1**. Tested the uncommitted Story 1.4 working tree based on full VCS revision **`ec180e7d226825d37f9fab51ef8f5d3e972e2eab`**, not a later commit or fresh clone.

- Workstation gate and `npm ci` passed; the lockfile remained byte-identical, SHA-256 **`f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f`**. No dependency/pin/compatibility-date change, install-script approval, global-tool/skill change or Python work was performed. esbuild/workerd installation warnings remain unapproved.
- Protected binding generation, all three typechecks and `npm test` passed: **45 Bash + 40 Vitest cases**. Health/404 and deterministic simulation remain independent of D1 initialization.
- **Nine D1 integration cases passed in about 55 seconds**, with `PLAYWRIGHT_BROWSERS_PATH` pointing to a newly created empty disposable directory (removed afterward). Documented `npm run db:init`, `db:check` and `db:types` execute inside the sanitized fixture with outer `CI=false`, fresh HOME/settings and only synthetic env files, not credentials. Bootstrap ledger/schema-free initialization, rerun preservation, exact marker and failure branches all pass.
- CLI-created synthetic data survives repeated initialization, is read/updated through the binding proxy, and is read back by CLI with the original ledger row unchanged. Separately, the actual workerd scheduled handler invokes the private helper against independent harness storage, with uninitialized, missing-binding and wrong-marker negative controls. This is Worker-binding SQL evidence, not CLI persistence-sharing evidence.
- Both builds and both standalone build verifiers passed: **22 build canaries**, two real protected PTY builds and all eight historical synthetic PTY controls. Worker dry-run reports only `env.DB (candidate-copilot-local)` and exits without upload. `npm run test:smoke` passed **27 cases**, including all retained browser/fixture controls, the bounded one-shot controls and all nine D1 cases.
- Full `npm audit --json` and separate `npm audit --omit=dev` both exited 0 with **zero known findings**; this is a measured advisory result, not a security guarantee. `git diff --check` passed. No smoke/isolation/terminal/browserless fixture directories or application-port listeners remained; `.wrangler/state/v3/d1` is ignored and no `.wrangler/` path is tracked. Existing developer D1 data was never reset or inspected for verification.
- During implementation, an obstructed D1 directory exposed an upstream proxy-construction rejection that retained runtime handles. Directory preflight plus explicit nonzero exit cleanup corrected it; an independent obstructed-cache constructor control now passes without fixture cleanup masking survivors. An active-D1 interruption control confirmed Miniflare's upstream synchronous SIGINT exit (130): asynchronous API disposal cannot be awaited on that signal. The fixture independently identifies/stops any owned descendants and removes only its disposable directory; successful and SQL-failing returned proxies/harnesses have disposal/closure awaited normally. Repeated-interruption controls for the supervising fixture remain passing.

**Review corrections (2026-10-20):** reran only the focused D1/one-shot coverage: **12 D1 cases + one completion-control case passed**. Added inherited-environment isolation, rejected ledger/pattern overrides, subsequent-migration exactly-once success and transactional-failure preservation, and immediate cleanup assertions for all completion outcomes. The disposable helper now checks binding keys in actual production init/check calls with synthetic env files; separately removing only the copied wrapper's proxy `envFiles` option made both npm entrypoints fail that check. The earlier full-journey results above precede these corrections; a full rerun is not claimed here.

**Final independent parent verification after review (2026-10-20):** repeated the entire documented verification on the same Ubuntu host and pinned toolchain: workstation gate, unchanged-lockfile `npm ci`, binding generation, all typechecks, **45 Bash + 40 Vitest cases**, both builds, both standalone build verifiers, **12 D1 cases with an empty disposable browser directory**, **30 complete smoke cases**, full/production audits, dependency resolution and whitespace checks. All passed. Both audits remain zero; the lock hash above and generated binding declarations remain unchanged. Matrix branches, pending-migration preservation, actual-command env isolation and bounded cleanup controls all executed. No fixture/application listeners remained and no D1 runtime path is tracked. All retained review corrections are resolved; no work was deferred. These results do not replace human acceptance.

Limits: this is existing-workstation Story 1.4 evidence only, not hosted operation, Story 1.5 fresh-clone or full-Epic acceptance. No retrieval, grounding, real model, catalog identity, product readiness or production-security claim is made. Cleanup remains trusted-tool regression coverage with the `/proc`, SIGKILL and host-failure limits below; no reset was executed against existing developer data.

---

# Historical local startup — Story 1.3

Historical instructions for **Ubuntu 24.04 LTS**, **Node 24.22.0 / npm 11.19.1**, superseded by Story 1.4 above. Story 1.3 added local frontend-to-Worker availability and a test-only simulated LLM, not a chat interface or product readiness. The Story 1.2 records below are also preserved as historical evidence.

## Setup and verification

1. Enter the repository and select its `.node-version` using [workstation.md](workstation.md). Do not change global/default tools or activate Python.
2. Run `bash scripts/check-workstation.sh`.
3. Install the locked graph (public registry downloads required, no account/token):

   ```bash
   sha256sum package-lock.json
   npm ci
   sha256sum package-lock.json  # must be identical
   ```

   Do not regenerate/delete the lockfile or approve install scripts blindly. The selected npm still warns about unapproved esbuild/workerd scripts; the checks below pass without approval.
4. Configuration copying is **optional**. No variable, Cloudflare login, key, model service or D1 is required. `.dev.vars.example` contains comments only. Do not put server configuration in `VITE_*`; browser env-file loading and application env exposure remain disabled. Worker commands explicitly use `--env-file /dev/null`.
5. For browser tests only, download this pinned Playwright's Chromium as your normal user:

   ```bash
   ./node_modules/.bin/playwright install chromium
   ```

   This downloads browser/headless-shell and FFmpeg binaries to Playwright's per-user cache (Internet and disk space required); `npm ci` alone does not install them. It is **not** required for ordinary two-terminal startup. Do not use `--with-deps` or run `install-deps` automatically: they may invoke OS package installation/privilege escalation. Missing Ubuntu libraries require explicit administrator review, not application-script sudo.
6. With ports 5173/8787 free, run:

   ```bash
   npm run typecheck
   npm test
   npm run build
   node scripts/check-build-isolation.mjs
   node scripts/check-build-interactivity.mjs
   npm run test:smoke
   npm audit --json
   npm audit --omit=dev
   git diff --check
   ```

`npm test` retains all 45 workstation fixtures and the Git/build/real-terminal safeguards, and adds contract, health-failure and deterministic-simulation tests. `test:smoke` is separate: 17 serial Chromium/local-server and synthetic fixture checks, no server reuse, credentials or database. Browser test discovery is restricted to `tests/e2e/*.spec.ts`, and tooling typechecking includes only named configs/bootstrap/e2e sources. Results under `test-results/` and `playwright-report/` are ignored.

## Two-terminal startup and shutdown

Select the repository Node/npm and enter the repository in **each** terminal:

```bash
# Terminal 1
npm run dev:worker

# Terminal 2
npm run dev:frontend
```

- Open **http://127.0.0.1:5173/**. The French technical shell initially displays “Vérification du Worker…”, then “Worker disponible.” only after validated JSON from a relative `GET /api/health`. Vite proxies `/api` to **http://127.0.0.1:8787**.
- The Worker endpoint **http://127.0.0.1:8787/api/health** returns exactly `{"status":"ok"}`. It never invokes a model or database and exposes no configuration/diagnostics. Unrelated routes remain 404. Availability is explicitly not product readiness.
- An absent Worker, HTTP error, invalid body or stalled request becomes “Worker indisponible. Rechargez la page pour réessayer.” within five seconds of the check (4.5-second deadline covering headers and body). Reload retries. Unmount/React StrictMode cleanup cancels old requests and prevents stale updates.
- Both services bind IPv4 loopback, not public interfaces. Vite uses strict port 5173; Wrangler's explicit port 8787 also rejects occupancy rather than falling back. Worker execution is forced `--local`, noninteractive (`CI=true`), metrics disabled, with empty env-file input and loopback inspector. Wrangler may use additional loopback-only internal/inspector ports; they are not application URLs.
- Stop **each owned command with Ctrl+C in its terminal**. Stopping only the Worker intentionally makes the page unavailable on reload. Do not kill an unknown listener or point the proxy at a hosted service to make a check pass. These scripts start two independent processes; there is no supervisor or combined startup command.
- Wrangler's ignored `.wrangler/` may hold local generated state/logs. There is no D1 binding or migration. Vite's normal dependency cache is under ignored `node_modules/`. Builds remain separate under `dist/frontend/` and `dist/worker/`, and the Worker build remains a protected dry-run only.

## Minimal implementation and safety boundaries

- `src/shared/health.ts` contains the exact availability contract and validator; `src/worker/index.ts` is a thin Hono GET adapter.
- `src/ports/LLMProvider.ts` defines only `generate(input: string): Promise<string>`. `src/adapters/llm/simulated.ts` accepts **exactly** `bootstrap-ping` and returns **exactly** `Simulated LLM: bootstrap-pong` on every call. All other inputs reject. Verify it with `npm test` (or `./node_modules/.bin/vitest run tests/bootstrap/simulation.test.ts`), with network transports forbidden. It consumes no configuration/key and has no model network call. It is not exposed by health, a public diagnostic route or a chat UI.
- No Conversation/retrieval, catalog identity, real provider/SDK, database binding/schema, hosted operation or product readiness is delivered.
- Vite keeps `publicDir: false`, `envDir: false` and `envPrefix: []`. Its strict filesystem allowlist is limited to frontend HTML/source and shared contracts (plus Vite's own required client handling), **not the repository root**. Deny rules cover env/private/preparation/tooling/generated paths and public asset directories. This shell has no client routes (`appType: 'mpa'`), so forbidden/missing files do not receive a successful SPA fallback. Never store private preparation in application source or import it into a bundle.
- The existing 22-canary build and terminal verifiers remain unchanged; their explicit copy lists already include every new runtime/build input under `src/` and `frontend/src/`. No real private/env files are read by the fixtures.
- `tests/e2e/local-fixture.ts` copies only application inputs, shares installed packages through per-package symlinks, and keeps Vite caches, HOME, XDG/npm/Wrangler settings, temporary files and browser profile disposable. Child/browser environments are allowlisted; real credentials/configuration are not forwarded. Chromium's installed binary is reused, not a running browser/server. Browser requests are restricted to loopback.
- Smoke coverage includes rendered success through the real proxy/Worker, stopped-Worker failure and reload recovery, malformed/stalled health, conflicting StrictMode completions with observed obsolete-request cancellation, both occupied ports (listener left intact), failed Worker compilation, absent diagnostic routes, and **16 synthetic canaries** across private/public content, env, preparation, generated files and shell env. It scans loaded dev responses for raw/base64 markers and explicitly requires forbidden-file requests to return 403/404. Only owned fixtures are cleaned.
- Startup is bounded to 25 seconds per command; retained output to 250,000 bytes per command. Unexpected questions/output overflow fail rather than receive input. Cleanup uses inherited random scope markers plus `/proc` PID/start-time identities, signals owned dev watchers and descendants together (avoiding leaf respawn), escalates survivors after 300ms, and allows six seconds plus two for pipe closure. Cleanup attempts all commands and retains a fixture if owned writers survive. Browser protocol closure starts alongside owned-scope cleanup rather than delaying it; its own completion has a two-second deadline. Failed smoke cases attach the existing byte-bounded startup logs. Recurring controls exercise this fixture's install/update/wrapped/generic prompt rejection, output cap, deadline, numeric-versus-signal exits, respawning descendants, repeated SIGINT/SIGTERM and suspended Chromium cleanup. These harmless synthetic programs are not Wrangler or installers. SIGINT/SIGTERM handlers remain installed through cleanup, including repeated interruption. This is trusted-tool regression coverage, not a sandbox: hostile marker removal, SIGKILL, host failure or unavailable/restricted `/proc` are not cleanup guarantees.

## Startup and browser troubleshooting

- **Tool/dependency mismatch:** select `.node-version`, rerun the gate, then `npm ci` with before/after lock hashes. Retain all prior pins, including the explicitly approved local Miniflare beta. Do not use a global Vite/Wrangler/Playwright, forced audit fix or Python/sudo workaround.
- **Occupied ports:** inspect `ss -ltnp '( sport = :5173 or sport = :8787 )'`. Startup and smoke intentionally fail rather than reuse/terminate unrelated services. Stop only a listener you own via its original terminal, or ask its owner. Do not silently change ports; the default proxy and smoke require 5173/8787. Inspect any separately reported loopback inspector-port conflict the same way.
- **Worker unavailable:** verify terminal 1 did not exit; run `curl --fail --show-error http://127.0.0.1:8787/api/health`, then the same path at port 5173. Expect 200 JSON with only `status: ok`. A frontend-only 200 is insufficient. Start the Worker and reload. For type/build errors use `npm run typecheck` / `npm run build:worker`; a secret or D1 setup will not fix them.
- **Forbidden file / 403 / 404:** the dev server intentionally cannot publish repository-root files, env/private/preparation/public directories or local state. Do not broaden `server.fs.allow` or disable deny rules. A blank technical page should instead be diagnosed through failed application-module requests and Vite's terminal; required Vite client files must remain usable.
- **Browser executable missing or mismatched after install:** run the local `playwright install chromium` command above again after the locked install. Check `./node_modules/.bin/playwright --version`. Do not substitute a system browser or auto-download a different package. To inspect expected paths without installing: `./node_modules/.bin/playwright install --dry-run chromium`.
- **Missing shared libraries / browser launch failure:** inspect the reported library and `ldd` on the reported executable (`not found` entries), plus the [official browser requirements](https://playwright.dev/docs/browsers#install-system-dependencies). Ask the workstation administrator to install/reconcile the reviewed Ubuntu packages if needed; application tests never install libraries or invoke sudo. OS/container policy can also block launching Chromium; supported evidence is on the Ubuntu workstation, not arbitrary containers.
- **Smoke deadline/output/cleanup failure:** inspect the first startup error and retained bounded output; ensure loopback and readable `/proc` are permitted. The failure reports a retained owned-fixture path if cleanup could not complete. Do not delete it under a surviving writer or use blanket `pkill`. Resolve/stop only the processes whose fixture ownership can be established, then remove only that disposable directory. Terminal-specific prerequisites and historical prompt controls remain documented below.
- **Unexpected configuration/prompt:** stop the owned command; do not answer yes, log in or install global skills. Configuration copying remains optional, and real credentials should never be added to troubleshoot this story. Review command-local CI, local-mode, metrics and `/dev/null` protection without printing real env/configuration contents.

## Story 1.3 official evidence and measured results

Evidence supplied with the approved specification was checked on **2026-10-19**; versioned registry metadata and installed CLI behavior were rechecked during implementation on **2026-10-20** (local time). References:

- [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/) and [local development](https://developers.cloudflare.com/workers/local-development/): installed `wrangler dev --help` confirms `--local`, `--ip`, `--port`, inspector loopback and `--env-file`. Actual occupied-port/startup smoke establishes behavior for the preserved Wrangler **4.151.2**, not an assumption about future versions.
- [Vite server options](https://vite.dev/config/server-options): host, strictPort, proxy and filesystem allow/deny. Browser checks exercise the actual preserved **8.3.4**.
- [@playwright/test 1.64.1](https://registry.npmjs.org/@playwright/test/1.64.1) → [playwright 1.64.1](https://registry.npmjs.org/playwright/1.64.1) → [playwright-core 1.64.1](https://registry.npmjs.org/playwright-core/1.64.1): exact chain, Node `>=20`, no required peers. Only the exact test dependency was added; other direct pins and Worker compatibility date **2026-06-11** are unchanged.
- [Playwright introduction](https://playwright.dev/docs/intro) and [browsers](https://playwright.dev/docs/browsers): Ubuntu 24.04 / Node 24 support and separate browser/system-library installation. Downloaded Chromium **156.0.8078.4**, Playwright browser revision **1248** (plus FFmpeg revision 1013); no OS library/global tool/skill installation was performed.

Verified **2026-10-20**, **Ubuntu 24.04.5 LTS / x86_64**, Git **2.43.0**, selected Node **24.22.0** / npm **11.19.1**. This is the uncommitted Story 1.3 working tree based on full revision **`de375a413b5565191655609cfb68e343ab53af23`**, not a claim about a later commit or fresh OS acquisition.

- Workstation gate, locked `npm ci`, typechecking, all **45 Bash + 38 Vitest cases**, both builds, both standalone build verifiers and **six Playwright smoke checks** passed. Build isolation retains all **22 canaries**; both real PTY builds and all eight historical synthetic controls pass. Worker build reports no bindings and dry-run exit.
- `npm ci` preserved lockfile bytes: SHA-256 **`f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f`**. The only added direct pin resolves to `@playwright/test@1.64.1`; the exact transitive Playwright chain resolves as above. esbuild/workerd scripts remained unapproved.
- Full `npm audit --json` exited 0 with empty vulnerabilities and zero known findings; separate `npm audit --omit=dev` also reported zero. These are measured advisory results, not a security guarantee. `git diff --check` passed.
- During development, the smoke suite caught an overbroad deny rule blocking Vite's own client and successful SPA fallbacks on forbidden URLs; both were corrected. A later full run exposed dev-watcher leaf respawn during cleanup; signaling all scope-owned processes together corrected it. The known retained synthetic fixture was then cleaned using its exact scope marker, never by killing an unknown listener.
- A separate active-fixture interruption exercise started frontend, Worker and Chromium, sent SIGINT then SIGTERM during cleanup, and verified exit 130, no surviving fixture-owned processes and removal of the disposable copy/settings. No unrelated listener was reused/stopped. Successful smoke runs leave no owned fixture directories or port-5173/8787 listeners.

**Final parent verification after review (2026-10-20):** independently repeated the gate, stable-lockfile installation, all typechecks, **45 Bash + 39 Vitest cases**, both builds, both standalone build verifiers and **17 smoke/fixture-control cases**. All passed, including streaming-error cancellation, conflicting mounted-component completions, suspended Chromium and repeated-interruption/respawn cleanup. Both audits still returned zero and the lockfile hash above remained unchanged. No dependency scripts were approved. No smoke fixture directories, fixture-owned processes or application-port listeners remained. The implementation worker additionally reported that two disposable lifecycle mutations (removing effect cleanup or stale-result protection) were rejected by the targeted browser test; the parent reran the complete corrected suite, not those mutation experiments.

Limits: this verifies local availability plumbing and deterministic simulation only. No D1, grounding, retrieval, real-model behavior, hosted operation, production security, recruiter/product readiness or complete Epic 1/fresh-machine acceptance is claimed. Historical clean-copy evidence below belongs to Story 1.2, not a new Story 1.3 clean-install rehearsal.

---

# Historical application foundation — Story 1.2

Selected and verified **2026-10-19** for **Ubuntu 24.04 LTS** with Story 1.1's **Node 24.22.0 / npm 11.19.1**. This is one private npm package, not a workspace or a published package. It establishes component foundations only, not full Epic 1 startup or product readiness.

## Ordered setup and checks

1. Clone the repository using its authorized URL and enter the root. Follow [workstation.md](workstation.md) to select the committed `.node-version` in your shell; do not change global/default tools, use sudo, or activate Python for application work.
2. Run the read-only prerequisite gate:

   ```bash
   bash scripts/check-workstation.sh
   ```

3. Install exactly the committed graph. Internet access to the public npm registry and platform-specific optional binary packages is required; this is not an offline-install promise. No hosted credentials, Cloudflare login, database, running service or real model is required.

   ```bash
   sha256sum package-lock.json
   npm ci
   sha256sum package-lock.json  # must match the first hash
   ```

   `npm ci` replaces this copy's `node_modules/`; it must not regenerate the lockfile. Do not substitute `npm install` or delete the lockfile to resolve an installation failure. With the hardened graph, the selected npm reports unapproved dependency install scripts for esbuild 0.28.2 and workerd 1.20261019.1; these foundation checks pass without approving them. The original graph also warned about sharp. Do not blindly approve dependency scripts. `npm install-scripts ls` can inspect them if later tooling needs review.

4. **Configuration is optional:** no variables are consumed by this skeleton. `.dev.vars.example` contains comments only and is intentionally tracked. You may copy it to `.dev.vars`, but no copy is needed for any check. Never add real credentials to examples or put server configuration behind `VITE_*`. There is no D1 binding, provider SDK, simulated provider or catalog configuration yet.
5. Run all checks and both narrowly scoped builds:

   ```bash
   npm run typecheck
   npm test
   npm run build
   node scripts/check-build-isolation.mjs
   node scripts/check-build-interactivity.mjs
   npm audit --json           # full graph; measured disposition below
   npm audit --omit=dev       # separate production-only result
   git diff --check
   git status --short
   ```

All commands use package-local executables. Failed assertions, type errors, resolution/download errors and build errors exit nonzero. `npm test` preserves the existing 45 Bash workstation fixtures and now runs ten Vitest cases, including build isolation and the terminal regression. Both standalone scripts are available for diagnosis. The terminal regression requires Ubuntu's `/usr/bin/script` (util-linux), `/proc` and usable pseudo-terminals; it needs no Python, new npm PTY package or credentials. Playwright/browser automation is deferred until browser coverage exists.

## Structure and boundaries

| Path | Responsibility now / deferred boundary |
| --- | --- |
| `src/shared/` | Placeholder for shared API/domain types, no speculative contracts |
| `src/application/` | Placeholder for framework-independent policy, no business behavior |
| `src/ports/` | Placeholder for application-owned capability interfaces, not defined yet |
| `src/adapters/` | Placeholder for later infrastructure implementations |
| `src/worker/index.ts` | Hono export with no routes or bindings; unmatched requests return default 404 |
| `frontend/index.html`, `frontend/src/` | Static React technical shell, native CSS and tokens; no API calls |
| `migrations/` | Explanatory placeholder, no SQL or database initialization |
| `content/public/` | Explanatory placeholder, not fabricated knowledge or a published catalog |
| `tests/bootstrap/`, `scripts/` | Component and publication-boundary checks; existing toolchain checks retained |

Policy must remain independent of browser code, Hono, Worker bindings and future provider SDKs. There is deliberately no `/api/health`, application startup orchestration, database schema, binding, simulation, provider call, deployment or product UI. A default 404 and static render do not imply availability or readiness of any later service.

### Type and build inputs

- `tsconfig.json` is a strict no-emit base with no ambient type packages. `tsconfig.frontend.json` supplies browser libraries and Vite client types; `tsconfig.worker.json` supplies Workers types without DOM/Node globals; `tsconfig.tooling.json` supplies Node tooling/test types without browser/Worker ambient libraries. Vitest APIs are imported explicitly, not global. Dependency declaration checking is skipped, not application strict checking.
- Discovery is limited to application sources, bootstrap tests and named configuration files. No root-wide test or TypeScript source glob includes documentation, BMAD tooling, preparation documents or runtime state.
- Vite's root is `frontend/`, with its explicit HTML/module graph. `publicDir: false` disables automatic asset-directory copying, `envDir: false` disables env-file loading, and `envPrefix: []` exposes no application environment variables, including shell `VITE_*`. There is no broad `process.env` injection. Vite's own built-in mode flags are not server configuration.
- Wrangler starts only at `src/worker/index.ts` with the unchanged compatibility date **2026-06-11**. The follow-up updates local tooling/types, not that runtime compatibility date. There are no static assets, content globs, extra modules or bindings configured.
- `npm run build:frontend` writes **`dist/frontend/`** (HTML, JS, CSS). `npm run build:worker` writes **`dist/worker/`** (Worker JS, source map and Wrangler's output README). The Worker invocation is `CI=true WRANGLER_SEND_METRICS=false wrangler deploy --dry-run --env-file /dev/null --outdir dist/worker`, with CI scoped to Wrangler (not the whole shell or frontend), metrics disabled and `--env-file /dev/null` to prevent Wrangler's default `.env`/`.env.local` loading; despite the CLI verb, it only bundles and never uploads/deploys. No login is needed. Builds clean only their respective output directory, so stale Worker artifacts cannot survive rebundling.

## Private/local material safety

`.gitignore` excludes dependencies, both build outputs, coverage, local virtual environments, `.env*`, `.dev.vars*`, Wrangler state and **all `content/private/`**, including nested example-named files. Only deliberate `.env.example` / `.dev.vars.example` templates are excepted outside private content. There is no tracked private placeholder. Place local preparation documents under `content/private/`, not in application source or frontend assets. Git ignores do not remove already tracked files or constitute a build boundary.

The build boundary is independently checked without consulting Git: `check-build-isolation.mjs` creates its own temporary project, copies application code/config only, shares installed dependencies via a symlink and writes **22 synthetic canaries** across private/public content, preparation documents, tooling directories, env files, shell environment, public asset directories and generated/local state. Temporary frontend-only probes materialize Vite's env object and a synthetic server-secret reference. Builds receive only allowlisted settings and a disposable HOME, never inherited credentials or real user npm configuration. Both real build commands run, and every output file (including Worker source maps) is scanned for raw and base64 marker representations. A direct configuration assertion independently verifies disabled Vite loading/exposure and Wrangler env-file discovery. The script never reads real private content or local env files; it removes only its own temporary directory. Separate disposable Git fixtures check exclusions and allowed templates, while `git ls-files` checks the real tracked path list, including root dist/coverage, without reading private data. The internal build deadline is shorter than the test wrapper's deadline to leave cleanup time.

These checks detect accidental broad inclusion. They do not authorize importing private material, embedding secrets in source or manually deploying a whole repository; review import/configuration changes as well as test results. No application build currently consumes public knowledge or preparation documents. Future publication/deployment needs its own explicitly reviewed allowlist; do not use this story as approval for a hosted build context.

## Dependency choices and official evidence

The following table preserves the **original Story 1.2 selection**, including the two Cloudflare pins superseded by the hardening follow-up below. All other direct pins remain unchanged.

Rechecked the following versioned **official npm registry metadata on 2026-10-19**, before generating the lockfile. Each link establishes existence and reports engines/required peers (where present); successful installation, typechecking and both builds separately establish compatibility for this foundation. These are deliberate pins, not claims of latest releases or security guarantees. Historical stack candidates were not adopted without rechecking.

| Package/version (official metadata) | Engine/required peer evidence and rationale |
| --- | --- |
| [react 19.3.1](https://registry.npmjs.org/react/19.3.1) | Node `>=0.10.0`; selected React runtime |
| [react-dom 19.3.1](https://registry.npmjs.org/react-dom/19.3.1) | React `^19.3.1`; match runtime exactly |
| [typescript 5.9.3](https://registry.npmjs.org/typescript/5.9.3) | Node `>=14.17`; avoid a compiler-major transition |
| [vite 8.3.4](https://registry.npmjs.org/vite/8.3.4) | Node `^20.19.0 || >=22.12.0`; optional Node types accept 24.19.2; lightweight frontend bundler |
| [@vitejs/plugin-react 6.1.2](https://registry.npmjs.org/@vitejs/plugin-react/6.1.2) | Same Node range as Vite; required Vite `^8.0.0`; standard React integration, optional compiler/Babel peers not required |
| [@types/react 19.3.0](https://registry.npmjs.org/@types/react/19.3.0) | No Node engine/required peer constraint; aligned React type line |
| [@types/react-dom 19.3.0](https://registry.npmjs.org/@types/react-dom/19.3.0) | Requires `@types/react ^19.3.0`; aligned DOM renderer types |
| [@types/node 24.19.2](https://registry.npmjs.org/@types/node/24.19.2) | No Node engine/required peer constraint; Node 24 tooling types, not Worker/browser globals |
| [hono 4.13.13](https://registry.npmjs.org/hono/4.13.13) | Node `>=16.9.0`, no required peers; minimal Worker HTTP boundary |
| [wrangler 4.100.0](https://registry.npmjs.org/wrangler/4.100.0) | Node `>=22.0.0`; optional Workers types peer `^4.20260611.1`; deliberate non-beta Miniflare dependency line, dry-run bundling only |
| [@cloudflare/workers-types 4.20260611.1](https://registry.npmjs.org/@cloudflare/workers-types/4.20260611.1) | No engine/required peers; matches Wrangler's type peer and compatibility date |
| [vitest 5.0.5](https://registry.npmjs.org/vitest/5.0.5) | Node `^22.12.0 || ^24.0.0 || >=26.0.0`; required Vite `^6.4.0 || ^7.0.0 || ^8.0.0`; optional Node types accept 24.x; Node-only tests, no DOM emulator/browser dependencies |

All selected Node engines and required peers include this graph. React and Hono are runtime dependencies; compiler, bundlers, types and test tools are development dependencies. Native CSS needs no framework. A single committed lockfile v3 pins transitive versions/integrities, including platform optional binaries. Do not add provider SDKs or Playwright until the corresponding capability exists.

## Troubleshooting

- **Missing or incompatible tools:** run `node --version`, `npm --version`, `type -a node npm` and the workstation gate. Re-select the repository pin per [workstation.md](workstation.md), not a global upgrade. Unsupported engine warnings must be diagnosed, not bypassed with `--force`.
- **Resolution/download/TLS errors:** inspect the failing package URL, `npm config get registry` (expected public `https://registry.npmjs.org/`), DNS/proxy/CA settings and Internet access. Use `npm cache verify` for cache diagnosis, then retry `npm ci`. Never disable TLS verification or print token-bearing config into a bug report. Public dependency installation needs no registry token. A failed install exits nonzero; a partially populated `node_modules/` is not proof of success.
- **Lock/package mismatch:** `npm ci` correctly refuses an inconsistent manifest/lock. Restore the matching reviewed files from Git. Dependency updates require a deliberate pin/metadata/lock review, not deleting the lock or an automatic audit fix. Compare hashes and `git diff -- package-lock.json` after installation.
- **Missing optional native binary:** verify Ubuntu/architecture and that optional dependencies have not been omitted (`npm config get omit`). Re-run `npm ci` with normal optional dependency selection. Do not install a global bundler. Script-approval warnings alone are not build failure; review scripts rather than globally enabling them. Other architectures have not been verified here.
- **Typecheck/test/build failure:** run `npm run typecheck`, `npm run build:frontend` or `npm run build:worker` independently. Check the first error and the specific input path. No `.dev.vars`, secret, account, D1 initialization or running service can fix a skeleton type/build failure. Default Worker 404 is intentional, including `/api/health`.
- **Isolation failure:** run `node scripts/check-build-isolation.mjs`. Check for broadened asset/content globs, env exposure, root changes or unsafe imports. Never make a test pass by copying real preparation material or loosening Git ignores. The script cleans its own temporary fixture even on failure; it does not reset your repository or real runtime state.
- **Ports and bindings:** these checks start no listening service and configure no D1 binding. Port occupancy and local frontend-to-Worker/D1 startup troubleshooting belong to later stories; do not add startup or database initialization as a prerequisite here.

### Historical audit findings — original graph, now superseded

On **2026-10-19**, with the original Story 1.2 graph, `npm audit` exited **1**, reporting **six affected packages (five high, one low)** in the development tooling graph:

- `wrangler 4.100.0` / `miniflare 4.20260611.0` inherit high findings through `sharp 0.34.5`, `undici 7.24.8` and `ws 8.20.1`: image-library vulnerabilities, HTTP/proxy/TLS/cache issues and WebSocket denial of service. Representative advisories: [sharp/libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [undici TLS validation](https://github.com/advisories/GHSA-w293-vg96-wgc3), [ws memory exhaustion](https://github.com/advisories/GHSA-96hv-2xvq-fx4p).
- `esbuild 0.27.3` (also present as Vite's optional peer) has a low [Windows development-server file-read finding](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr). This verification targets Ubuntu and starts no development server, but that does not erase the advisory.

`npm audit --omit=dev` reported **zero findings** at that verification time, not a guarantee of runtime security. npm recommended Wrangler **4.151.2** to remediate this chain. The original implementation deliberately deferred changing its approved pins or adding overrides pending review; the separately approved follow-up below records the subsequent choice and re-verification. Do **not** blindly run `npm audit fix --force`. No untrusted images, live proxy traffic or public dev servers were exercised here; these limitations are not a mitigation guarantee.

## Historical Story 1.2 verification record and limits

Executed **2026-10-19**, Ubuntu **24.04.5 LTS / x86_64**, Git **2.43.0**. Node **24.22.0** / npm **11.19.1** were selected by temporarily prepending the existing fnm installation's `bin` to command PATH; no global tool/default, shell configuration, sudo, Python environment or hosted credentials were changed. Tested the uncommitted Story 1.2 working tree based on **`21e60d0864d694848206f54809918570f24f7d41`**, not a later committed revision.

- Official metadata for every direct pin was fetched and its engines/peers inspected. `npm ls --depth=0` resolved the exact twelve direct pins without missing or invalid peers.
- `bash scripts/check-workstation.sh` and all **45** existing toolchain fixture cases passed unchanged.
- `npm ci` passed with lockfile bytes unchanged (SHA-256 **`b32afed8ceb1bf488823ac968066bfd2fea41f730758b3842aebfff13546c68d`**).
- `npm run typecheck`, `npm test` (**9** bootstrap cases plus the 45 fixtures), `npm run build` and the standalone isolation command passed. Worker output reported **no bindings** and **dry-run: exiting now**. Both bundles excluded all **22** synthetic canaries after review corrections.
- Disposable regression mutations independently enabled frontend public copying, enabled Vite env-file/shell exposure, and imported private Markdown into the Worker via a text-module rule. Each failed the isolation check with a canary leak in the corresponding output. These mutations never touched the real application or real private files.
- Parent verification after review repeated all checks. Five additional disposable negative regressions rejected a base64-inlined private Markdown URL, explicit server-secret injection, removal of Vite's env-loading disablement, omission of Wrangler's explicit empty env-file input, and force-tracked `dist/` output. No mutation touched real application/private files. Worker cleanup was also exercised with a preexisting synthetic stale artifact.
- Full audit and production-only audit results are recorded above. `git diff --check` passed; application imports/configuration and tracked-path exclusions were inspected.

**Clean-copy rehearsal:** copied only Git-tracked/nonignored working-tree files into a new disposable directory (including the new implementation files), initialized a disposable Git index for tracked-path tests, and started with no `node_modules/`. Executed under `env -i` with a fresh temporary HOME/npm cache and only PATH, locale, CI and metrics-disable settings: the real prerequisite gate, `npm ci`, all typechecks, all 45 + 9 tests, both builds, standalone isolation and whitespace/status checks passed. Installation downloaded the public graph without credentials or a preexisting npm cache; the lockfile SHA-256 above remained identical. The temporary copy/HOME/cache were removed afterward. This was a clean-copy install on the existing Ubuntu host, not a fresh OS acquisition or a clone of a committed Story 1.2 revision.

This story does **not** verify browser interaction, dev-server startup, frontend-to-Worker availability, simulation, local D1, provider behavior, grounding/retrieval, hosted delivery, or full Epic 1/fresh-machine acceptance. No browser coverage, business schemas, public catalog or deployment is claimed.

## Hardening follow-up — terminal behavior and audited tooling

### Observed failure and corrected terminal journey

Human verification of the original graph exposed a Wrangler skill-install prompt during an interactive build. The original noninteractive checks (including a `CI=true` fixture) did **not** prove terminal safety; their historical passing results above must not be read as terminal verification.

The Worker command now sets command-local `CI=true`, retaining output cleanup, metrics disablement, dry-run bundling and empty env-file input. Frontend behavior and shell/global configuration are unchanged. Separately, inspection of the published Wrangler **4.151.2** CLI found `shouldInstall = false` in command handling: it disables automatic first-install prompts upstream, independently of CI. CI remains defense in depth. A genuine first-install prompt control is therefore impossible for this pin; BC explicitly approved the synthetic rejection control instead. No `--install-skills` invocation or skills installation was used.

`check-build-interactivity.mjs`, also run by `npm test`, creates separate disposable project/HOME/settings fixtures for **two real builds and eight synthetic controls**. `/usr/bin/script` supplies real stdin/stdout/stderr TTYs; an in-terminal probe verifies them and outer `CI=false`, even when the standard suite inherits `CI=true`. Both protected real cases run `npm run build` and check dry-run completion and both artifacts. One starts without installation metadata; the other seeds **aged accepted synthetic metadata**, fake installed skills and a fresh synthetic repository cache with a different revision in disposable XDG settings. The latter avoids cooldown masking and supplies local update information without network access if a regression reaches the update path. Its metadata/cache bytes and fake skills must remain unchanged; no new installation metadata/cache or project skill directories are allowed. Ordinary fixture-local Wrangler log/preferences files are not installation writes.

The controls are explicitly **synthetic harmless Node programs, not Wrangler or installers**. Independent install, actual upstream two-sentence update wording (ending “update them for you?”), wrapped install, and generic `[y/N]` questions each must be rejected. Wrapping is normalized, including line breaks within words. Separate silent-deadline, finite noisy-output, repeated-interruption, and detached-orphan controls assert their expected failure reason and cleanup. The orphan ignores HUP/TERM, records its changed parent and PID/start-time, and schedules a late write; the check requires its disappearance and absence of that write. No control receives input or exercises an actual installation.

All fixtures have fake agent directories and random synthetic skill sentinels. Their HOME inventories and sentinel bytes must remain unchanged. HOME, XDG directories, npm configuration/cache, temporary files, logs and Wrangler cache are fixture-local; no credentials or ambient agent/CI settings are forwarded. Keeping `WRANGLER_CACHE_DIR` local also avoids cache writes through shared symlinked dependencies. Real builds have a 45-second deadline; synthetic controls have 1.5-second deadlines. Retained terminal output is capped at 1,000,000 bytes (4,096 in the noisy control); further bytes are discarded once saturated, including during cleanup.

Ownership discovery uses a unique inherited fixture environment marker read from `/proc`, plus PID/start-time identities, so it does not depend on an orphan retaining its original PPID. Cleanup re-scans that scope, terminates leaves first, allows 300ms before escalation, and waits up to six seconds for tracked processes to disappear plus two seconds for PTY closure. Direct children are reaped through Node; an orphan's adopter is responsible for reaping it, and the check requires its `/proc` identity to disappear too. Idempotent SIGINT/SIGTERM handlers remain installed through awaited cleanup. Cleanup failure retains the fixture rather than deleting under known surviving writers. The enclosing registered check allows 200 seconds plus Vitest cleanup margin.

This is regression verification for trusted local tools, **not a hardened sandbox**. Scope tracking assumes inherited markers and readable same-user `/proc` entries; it does not contain hostile processes that deliberately discard their marker, evade discovery, or survive verifier/host termination. SIGKILL of the verifier and host failure are not cleanup guarantees.

For an unexpected question or terminal-check failure, run the standalone script and inspect the first failure. Do not answer yes, delete real skill metadata, alter global skills or weaken the check. Missing `/usr/bin/script` or unavailable PTYs are prerequisite failures, not skipped coverage.

### Terminal prerequisites

The verifier performs read-only checks for executable `/usr/bin/script`, readable `/proc/self/stat` and `/proc/self/environ`, and accessible `/dev/ptmx`. The real in-terminal probe additionally checks that PTY allocation actually works. Failures point here; the workstation gate is unchanged and nothing is auto-installed.

On the supported Ubuntu 24.04 host, diagnose with:

```bash
/usr/bin/script --version
dpkg-query -S /usr/bin/script   # Ubuntu package: bsdutils, from util-linux
ls -l /dev/ptmx /dev/pts/ptmx
findmnt /proc
findmnt /dev/pts
```

If `script` is missing/damaged, ask the workstation administrator to restore Ubuntu's **bsdutils** package using the OS package manager (administrator permission and downloads may be required). Do not install an npm PTY substitute or escalate privileges from application scripts. If `/proc` access or PTY allocation is restricted, use the supported workstation host, or ask its administrator to restore appropriate procfs/devpts mounts and normal PTY access. Do not blindly chmod device nodes, remount filesystems, or loosen host/container security policy to bypass a failure. Container and non-Ubuntu support are not claimed.

### Current dependency disposition and official evidence

Rechecked version-specific official registry metadata on **2026-10-19**:

| Current pin / upstream dependency | Evidence and disposition |
| --- | --- |
| [Wrangler 4.151.2](https://registry.npmjs.org/wrangler/4.151.2) | Node `>=22.0.0`; optional Workers-types peer `^5.20261019.1`; replaces 4.100.0 |
| [Workers types 5.20261019.1](https://registry.npmjs.org/@cloudflare/workers-types/5.20261019.1) | No engine/required peers; satisfies Wrangler's peer; replaces 4.20260611.1 |
| [Miniflare 5.20261019.0-beta](https://registry.npmjs.org/miniflare/5.20261019.0-beta) | Exact published Wrangler dependency; Node `>=22.0.0`; **beta explicitly accepted by BC for local tooling**, not deployed as the production runtime |

All other direct pins remain as originally selected. The installed graph resolves esbuild **0.28.2**, workerd **1.20261019.1**, sharp **0.35.5**, undici **7.29.1** and ws **8.21.0**. Its prereleases are Miniflare above plus the preexisting unenv **2.0.0-rc.24** and youch **4.1.0-beta.10**; prerelease status is not hidden by the numeric Wrangler pin. The prior compatible non-beta-Miniflare candidate (Wrangler 4.116.0 / types 5.20260730.1) still had four high audit findings in the parent investigation, so it was not selected. No forced audit fix, override or script approval was used.

`npm ls --all` succeeds without invalid required peers (uninstalled optional peers/platform binaries are expected). All **79 installed package** Node-engine constraints include Node 24.22.0. Full `npm audit --json` exits **0** with an empty vulnerabilities object and **zero known findings across all severities**, including development tooling. The separate `npm audit --omit=dev` also reports **zero**. These are measured registry-advisory results on the verification date, not a security guarantee or production-runtime approval.

### Follow-up verification and installation effects

Initial **pre-review** verification on **2026-10-19**, Ubuntu **24.04.5 LTS / x86_64**, Git **2.43.0**, Node **24.22.0**, npm **11.19.1**, against the uncommitted follow-up working tree based on **`ed408954e0614d6fe942b883a69f5acfac05e668`** (targeted review-correction results follow separately):

- Workstation gate, `npm ci`, all typechecks, **45 Bash fixtures + 10 Vitest cases**, both builds and both standalone build-verification scripts passed. Isolation still excludes all **22 canaries**. Worker output reports no bindings and dry-run exit.
- `npm ci` leaves lockfile bytes unchanged: SHA-256 **`1380780909df866f449e37da80a48a88bd79e3777d89ca54a614fd91d530d505`**. Installation replaces local dependencies and downloads optional binaries; esbuild/workerd script-approval warnings remain unapproved. Build outputs are generated under the existing ignored directories.
- A credential-free clean-copy rehearsal started without dependencies or an npm cache, copied Git-tracked/nonignored working-tree files and initialized a disposable Git index. With an allowlisted environment, fresh HOME/XDG/npm/Wrangler cache and empty user/global npm configuration, installation, exact direct-pin resolution, workstation gate, types, all tests, builds, both standalone checks and both audits passed. The lockfile hash remained identical; disposable copy/settings/cache were removed. This is an existing-host clean copy, not a fresh OS install or clone of a committed follow-up revision.
- Disposable negative mutations removed command-local CI (despite inherited `CI=true`), disabled prompt detection, and shortened the deadline to interrupt an active build. Each correctly failed; owned terminal descendants were reaped and fixture directories were cleaned. No mutation touched the real application or user skills.
- A read-only hash/symlink inventory matched the pre-change baseline for **1,449 entries across four existing real global skill directories**. No real skill installation, deletion/update, user configuration change, BMAD asset change, login or deployment was performed. `git diff --check` and tracked exclusions passed.

**Review-correction verification:** the targeted registered Vitest terminal case passed with both real protected builds and all eight recurring synthetic controls above, including bounded output retention, repeated signals during cleanup and a demonstrably reparented descendant. Disposable missing-path simulations for `script`, `/proc/self/stat`, `/proc/self/environ` and `/dev/ptmx` also produced the expected actionable prerequisite diagnostics. Only this targeted test and edited-file checks were rerun for these corrections; the earlier full-suite, audit, inventory and clean-copy records are historical evidence, not a claim that those wider checks were repeated after review. Full re-verification is left to the parent review.

**Final parent verification after review:** on the same supported Ubuntu host and selected Node/npm, repeated syntax, workstation gate, `npm ci` with unchanged lockfile, all typechecks, all 45 Bash + 10 Vitest cases, both builds, 22-canary isolation, both real PTY builds and all eight synthetic controls. Every check passed. Full and production-only audits still returned zero; `npm ls --all` and whitespace checks passed. A second fresh-HOME/cache credential-free clean copy repeated the complete installation/check/build/audit journey after corrections with the same lockfile hash. The 1,449-entry real global-skill hash/symlink inventory remained identical, the historical Story 1.2 specification and latest human-approved frozen intent were unchanged, and no terminal fixture directories remained.

The synthetic controls do not prove that Wrangler will prompt or that every possible future prompt wording is detected. The two real PTY builds prove the currently pinned build journey with fresh and accepted synthetic settings without a prompt; command inspection separately enforces local CI protection. The prior limits still apply: no startup orchestration, browser journey, D1 readiness, live provider, hosted runtime or full Epic 1 acceptance is claimed.

### Bounded local message attempts (Story 2.13, in progress)

Worker composition accepts `timing` overrides (integer milliseconds) and an injectable timer alongside its clock. The public Worker still has no configured message processor. On submission, authentication and saved replay precede admission. While the atomic admission is outstanding, a local receipt watchdog bounds the wait: if the receipt never arrives, the caller does not acquire authority to process, finalize or release. This is not a timeout on all pre-admission reads.

For a confirmed acquisition, subtract the configured lease duration from the database's `processing_until` to recover acquisition time, **not** receipt time or original message creation time. The earlier of database acquisition and local admission dispatch starts the budget; a future database timestamp cannot extend it. The default is 30 s, capped by lease duration, with the finalization reserve inside that cap. Context, classification, evidence retrieval, generation and result validation have the first 28 s. Classifier preparation through validated classification gets at most 5 s within that interval. Cutoffs are exclusive: a draft arriving at 28 s is too late. If total time remains, submit one guarded `processing_unavailable` failure using the existing retry policy. Only the atomic result write releases its lease; there is no timeout cleanup write. The finalizer, including canonical readback, must be confirmed before 30 s. Timely confirmation of lost access returns the neutral 401. An indeterminate, stalled or late receipt means `result_unavailable`, even if the write succeeded. An authenticated read or saved same-ID replay can then show what was actually recorded. Neither starts a recovery execution.

The 40 s lease fences ownership; it is not extra compute time. The separately configurable browser message transport wait (initially 45 s) is for a future POST client, not health polling or a server-side deadline. Its expiry means the browser did not observe confirmation, **not** that processing failed. No UI or automatic resubmission is part of this change. The application stops waiting or starting later stages when the runtime delivers its timer or its clock shows the cutoff. A Worker clock need not advance during synchronous JavaScript. These checks neither preempt it nor retract an issued storage/provider operation; the fixtures do not establish live wall-clock timing.

**Offline walkthrough** (inside a private, source-only changed-tree snapshot with isolated PID/proc/network namespaces, loopback only, installed dependencies, disposable storage and no operator credentials):

1. Run `npm run typecheck` and `./node_modules/.bin/vitest run tests/bootstrap/{conversation-results,professional-intent,answer-generation}.test.ts`. The manual clock can advance without delivering timers: check the 27,999/28,000/30,000 ms acquisition receipts and synchronous receiver accounting. Stalled operations ignore cancellation; the tests inspect calls, saved failure vs unknown, timer cleanup and logical-turn count.
2. Run `./node_modules/.bin/playwright test conversations.spec.ts -g 'real D1 (global admission|complete results)'` in that isolated snapshot. The disposable workers exercise interrupted acquisition, same-ID manual recovery, expired-owner writes, completion at the work cutoff, and D1 commit followed by a receipt at the total cutoff. Compare the original POST with authenticated GET and same-ID replay, including the saved answer graph and remaining lease.

These are local timing and persistence fixtures, not remote usage measurements. An interrupted or manually recovered execution can consume provider capacity even though it is not another logical turn. A08 remains open: actual admitted, interrupted and manually recovered usage and a BC/architecture decision are required before changing controls. No execution cap, cooldown, global budget, telemetry or paid fallback is introduced.
