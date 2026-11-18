# Scoped lexical retrieval — Story 2.4

This is a development-only local D1 FTS5 baseline, not a relevance guarantee,
model evaluation, real-career claim or recruiter/release acceptance. The public
corpus is approved fiction unrelated to BC. No HTTP search route, generation,
model calls, Web/private fallback, semantic provider or dependencies were added.

## Rerun the actual engine evaluation

With the repository's pinned Node 24.22.0/npm 11.19.1 and installed lockfile:

```bash
npm run evaluate:retrieval
npm run test:retrieval
```

The evaluation command writes `docs/evaluations/retrieval-2-4.md`. It copies named
application/tooling inputs into a newly created temporary project, fetches only
from this repository's local Git object store, and restores the exact approved
source `4323afe312f43b6b87a014abee062e03e12f6022` there. The original worktree,
operator D1, `.wrangler/state`, migrations and corpus approvals are not changed.
No running frontend/Worker, browser, credentials, account or network is needed.
The source commit must be present locally; absence fails, never substitutes HEAD.

Wrangler's real local D1/workerd harness applies the existing migrations to
fresh disposable storage. `installEvaluationPublication` installs only trusted
assembled artifact bytes into that disposable database in one batch. This is
fixture setup, **not operator activation**: the existing operator command still
requires HTTP verification of immutable assets. The harness is closed and the
owned temporary directory removed after a normal run, including evaluation
errors. The child has a 90-second deadline and bounded retained output. As with
other local tooling, host failure/SIGKILL can require inspecting leftover owned
temporary processes/directories; this is not a hostile-process sandbox.

The report records the independent pinned source SHA, catalog/search artifact
SHA-256, application base HEAD, and an `applicationFilesHash` over copied inputs
(sorted paths, each path + NUL + bytes + NUL). The copied input roots are `src`,
`tools/public-content`, `tools/retrieval`, `migrations`, the retrieval test Worker,
fixture JSON, evaluation script, `package.json` and `package-lock.json`. Hashing
reads the copied project, not the possibly changed original worktree. This
identifies executed implementation bytes without pretending that source SHA or
HEAD contains them. Installed Wrangler and its Miniflare-resolved workerd package
versions, Node version and the copied dependency-lock SHA-256 are also recorded.
These are toolchain identities, not alternate corpus/application revisions.
Unchanged inputs produce identical report
bytes; timestamps and race observation counts are intentionally excluded.

## Runtime contract and limits

- `Retriever` has exactly architecture `RetrievalRequest`/`RetrievalResult`, using
  existing `RetrievedChunk`. Core passes a **trusted frozen nonempty document
  allowlist**, never a browser/model-selected filter. This story does not admit
  scopes, resolve Resource edges or resolve conversation follow-ups. Those
  upstream policies remain prerequisites; fixtures supply already-resolved intent.
- Core validates request shape and Unicode, snapshots/deduplicates membership,
  and rejects any outside-allowlist adapter result. Empty/malformed scope or a
  missing frozen document rejects the whole request as `retrieval_unavailable`,
  not an intersection or unrestricted search. Technical exceptions are redacted
  to the same controlled error, never raw SQL, query text or partial evidence.
- Limits on prepared input: at most 32 terms, 256 UTF-16 code units per term,
  resolved question at most 8000 units. At most 64 unique lexical tokens, each
  at most 64 units. Excess input fails closed, not silently truncated. No
  arbitrary document-count cap: the complete allowlist is one bound JSON array.
- Tokens contain Unicode letters/numbers/combining marks; each is double-quoted
  as literal FTS data and joined with implementation-owned `OR`. Quotes,
  operators, punctuation and SQL-like text never become executable syntax.
  `OR`, `NEAR`, `DROP`, etc. supplied by callers can only be literal words.
  D1's existing unicode61 tokenizer controls case/diacritic matching. No
  translation, stemming, synonym expansion or query rewriting is added.
- Membership joins `public_chunks_fts` to `public_chunks` and filters candidates
  before ordering or limits. Ascending FTS5 BM25 ranks eligible passages, then
  binary document ID, ordinal and chunk ID break ties. BM25 uses engine-wide
  corpus statistics; scores are neither relevance probabilities nor thresholds.
- Search is the seventh read in the same D1 transactional batch as the six
  publication-validation reads. All matches resolve only against that batch's
  fully validated chunks. Publication faults anywhere (even excluded content)
  fail closed. There is no later unguarded MATCH/metadata reread. Existing
  `ResourceCatalog.readSnapshot()` behavior stays six-read/null-on-unavailable.
- Defaults: `topK=5`, `textBudget=12000` UTF-16 units of exact chunk text, including
  standalone fictional/non-BC context. Config accepts positive safe integers,
  topK at most 100 and budget at most 1,000,000. Iterate eligible ranked matches;
  skip a chunk that cannot fit, never truncate it; stop at topK. Output ranks
  are consecutive 1-based positions after budget selection. Titles/locations
  and provenance remain exact artifact values. Tiny budgets can yield no chunks.

No tokens or no matches with valid scope/publication succeeds with `{chunks:[]}`.
The correct interpretation is **insufficient retrieved evidence**, not universal
absence. Neither empty nor nonempty evidence proves answer adequacy. Technical
unavailability is a different outcome, not an empty successful result.

## Evaluation interpretation and BC handoff

`tests/fixtures/retrieval/cases.json` versions all prepared terms, frozen scopes,
required document/section passages and forbidden passages. Every expectation
must exist in the pinned artifacts before any case is retrieved/scored, including
forbidden passages outside the case's eligible scope. Misspellings fail evaluation
rather than becoming recall gaps or vacuous negatives. Every case executes;
missing required passages are recorded, not skipped or used to trigger retries.
Exact returned text, location, chunk ID, revision and content hash are checked
against independently assembled pinned artifacts. Ranks are not artifact fields:
the evaluator separately checks consecutive one-based output ranks. Recall is
passage presence, not correctness of an answer. Successful empty expectations
are also recorded. Non-required hits are review candidates, not automatically
semantic false positives. Forbidden passage hits and failed empty expectations
make the standalone command exit nonzero **after preserving the generated
report**; ordinary required-passage recall gaps do not fail the command.

The actual baseline finds **6/10 required passages** in **12 cases**, with **zero
forbidden passage hits**. English, corporate and synonym-only paraphrases miss
French source vocabulary. The scoped prototype-limits case also misses its
required results/limits passage: the supplied word `prototype` matches other
sections, while timing words from the excluded project cannot rescue it.
Named-project and follow-up queries return additional non-required passages.
These are transparent lexical recall/precision limits, not model failures.
Salary/ROI/current-use cases retrieve explicit limitations, not the missing fact.

BC should inspect [the actual report](../../docs/evaluations/retrieval-2-4.md)
and choose to retain this baseline or request an explicit architecture decision
before expanding retrieval. There is no fabricated BC assessment, automatic
acceptance, universal threshold or recommendation to silently add semantics.

## Verification coverage

`tests/bootstrap/retrieval.test.ts` covers request/query/config limits, hostile
encoding, membership guard (including adapter mutation), exact provenance copy,
budget behavior, no-token validation and redacted faults. The real-D1 matrix
uses two independent Workers, at least six globally dominant excluded
distractors, document/ordinal ties, a strictly better eligible BM25 winner at
topK=1, whole-chunk oversized-hit skipping, uninitialized/corrupt/SQL-fault states,
read-only sentinel checks and A/B publication replacement races with bounded
per-reader revision milestones. Known per-case found/missed passages and 6/10
aggregate recall are asserted independently. Focused evaluator/command tests
also cover misspelled expectations, ranks, report-preserving negative exits,
copied-input hashing and installed toolchain/lock identity. It then runs
all approved-fiction fixtures in D1 and both Workers and compares all returned
provenance to pinned artifacts. Existing full publication/smoke suites remain
separate regression coverage.
