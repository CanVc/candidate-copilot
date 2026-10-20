---
title: 'Story 1.4: Initialize and Verify Local D1 Reproducibly'
type: 'feature'
created: '2026-10-20'
status: 'done'
baseline_commit: 'ec180e7d226825d37f9fab51ef8f5d3e972e2eab'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The application cannot initialize D1 or demonstrate persistence access without a hosted database.

**Approach:** Add rerunnable local migrations, dedicated SQL/binding verification and a warned local-reset procedure.

## Boundaries & Constraints

**Always:** Preserve pins, compatibility date, loopback startup, noninteractive/empty-env operation and privacy/build safeguards. Initialization preserves data; failures exit nonzero. Health stays availability-only, independent of database initialization.

**Never:** Require accounts, credentials, hosted resources or Python for application work. Add business tables/public diagnostics, inspect real private/env files, change global tools/skills, reset during initialization or execute resets against existing developer data during verification.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior | Error Handling |
|---|---|---|---|
| Initialize | No local state | Bootstrap migration recorded; SQL check passes | Explicit setup/SQL failure |
| Rerun | Initialized state with synthetic row | Marker once; row unchanged | No deletion/recreation |
| Binding | Missing/renamed DB, wrong identity or uninitialized storage | Dedicated check fails | Diagnose binding/state; no remote fallback |
| Migration | Missing SQL, malformed SQL or unusable storage | Initialization exits nonzero | No swallowed error/reset |
| Reset | Writers stopped; operator verifies target | Only local D1 removed; reinitialization works | Explicit destructive warning before deletion |

</frozen-after-approval>

## Code Map

- `wrangler.jsonc`, `package.json:10–18`, `migrations/README.md`: no D1. `.gitignore` already excludes `.wrangler/`.
- `src/worker/index.ts`, `tests/bootstrap/{foundation,health,safety}.test.ts`: retain health/404 contracts and exact-command safeguards.
- `tests/e2e/local-fixture.ts:59–177`: sanitized copies, bounded commands/ownership cleanup; lacks successful one-shot execution; copy filter excludes SQL/MJS.
- `scripts/check-build-{isolation,interactivity}.mjs`: preserve narrow inputs, canaries/PTY controls. `tsconfig.{worker,tooling}.json` scopes types explicitly.

## Tasks & Acceptance

**Execution:**
- [x] `wrangler.jsonc`, `package.json` — configure `DB`, database `candidate-copilot-local`, stable all-zero UUID, `remote:false`, `migrations_dir:migrations`. Add `db:init`, `db:check`, browser-free `test:d1`, protected binding generation; make dev persistence explicitly `.wrangler/state`.
- [x] `migrations/0001_local_bootstrap.sql`, `migrations/README.md` — schema-free `SELECT 1` migration; document Wrangler ledger, ordered immutable migrations and local application. No custom engine/business schema.
- [x] `scripts/local-d1.mjs`, `src/worker/local-d1.ts` — guarded init/check and private `verifyLocalD1`. Validate local identity; reject remote/preview/extra target arguments. Use local Wrangler, explicit config/`--local`/`--persist-to .wrangler/state`, CI/metrics/env protections. Check SQL result plus exact bootstrap ledger marker, not merely SELECT 1. Proxy uses `remoteBindings:false`, `envFiles:['/dev/null']`, `.wrangler/state/v3`; await disposal and propagate errors.
- [x] `src/worker/env.d.ts`, `src/worker/index.ts`, `tsconfig.{worker,tooling}.json` — generate binding-only declarations with `wrangler types --include-runtime=false`; type Worker/tests without handwritten Env or frontend backend-type exposure.
- [x] `tests/e2e/{local-fixture.ts,d1.spec.ts,d1-runtime.mjs,d1-worker.ts}` — narrowly copy needed SQL/scripts; add bounded one-shot execution. Cover every matrix branch using disposable state/HOME, synthetic data and negative controls. Prove CLI/proxy shared-state preservation. Separately invoke the private SQL helper in an actual workerd handler through createTestHarness/test-only entrypoint; its storage is independent, not CLI persistence evidence. Close runtimes and clean owned fixtures on success/failure/interruption.
- [x] `tests/bootstrap/safety.test.ts`, `docs/development/application.md` — update command assertions/current setup, retain regressions/history. Document binding/storage, init/check/tests, migrations and diagnosis. Warn before resetting only `.wrangler/state/v3/d1`, after stopping writers/verifying repository target; test reset solely in disposable state. Record official references and measured results/limits.

**Acceptance Criteria:**
- Given the locked foundation, when documented init/check and integration tests run without credentials or Chromium, then local D1 and actual Worker-binding SQL access are demonstrated without business tables/public diagnostics.
- Given Story 1.3 safeguards, when existing checks/builds/smoke rerun, then availability, simulation, private-file and terminal protections remain effective and D1 runtime state stays untracked.

## Implementation Notes

- Added guarded `db:init`, `db:check`, `db:types`, browser-free `test:d1`, explicit dev persistence, schema-free SQL migration and generated binding-only Env. Health and public routes are unchanged.
- CLI/proxy bidirectional synthetic-data preservation is tested separately from the private helper's actual workerd scheduled-handler execution. Nine disposable D1 cases cover the matrix, constructor failure, interruption and a local-D1-only manual reset rehearsal. One-shot execution reuses existing bounded output/prompt/deadline/ownership cleanup; its synthetic regression control is retained in smoke.
- Tooling now explicitly includes Workers types and generated Env; Node URL imports in tooling files avoid Node/Workers iterator-type conflicts without exposing backend declarations to frontend compilation.
- Installed proxy construction can reject while retaining handles before a dispose API is returned. Directory preflight and explicit error exit through upstream cleanup prevent a hang; an obstructed-cache negative control verifies no owned survivors before fixture cleanup. Miniflare's synchronous SIGINT handler exits 130 before async finally blocks; interruption is therefore verified through independent owned-process cleanup, not a claim of awaited API disposal on that signal. Returned proxies/harnesses are awaited on success/SQL failure.
- Current setup, binding/storage/migration diagnosis, destructive warning and measured limits are documented above retained Story 1.3/1.2 history. No dependency or frozen-intent changes.
- Parent independently read the complete staged baseline diff, then repeated the gate, byte-stable npm ci, binding generation, all typechecks, 45 Bash + 40 Vitest cases, both builds, both standalone build verifiers, nine D1 tests, 27 smoke cases, both audits and staged/unstaged whitespace checks. All passed on the pinned toolchain; both audits report zero. The lock hash above is unchanged, generated declarations reproduce exactly, no fixture/application listeners remain, and D1 runtime paths are ignored/untracked.
- Matrix audit: executed D1 tests cover initial/uninitialized storage, rerun row and ledger preservation, missing/renamed/wrong/remote/preview bindings, missing/malformed SQL, unusable storage, and warned local-only reset in disposable state. The actual workerd helper checks and independent CLI/proxy sharing both ran. All tasks and acceptance criteria are satisfied without using existing developer data.
- After three independent reviews, the original implementation worker applied all seven patch groups: environment selector, ledger/pattern guard, history advice, migration copying, incremental-migration evidence, immediate completion cleanup and production-command env isolation. Parent read every patch and independently repeated the full documented sequence: stable-lockfile installation, generation, types, 45 Bash + 40 Vitest cases, builds, both build verifiers, 12 browser-free D1 cases and 30 smoke cases, both audits, dependency resolution and whitespace checks. All passed; unchanged lock/declaration bytes, no surviving fixture/application listeners or tracked D1 state. Matrix coverage remains complete; pending migration success/failure preservation and production proxy isolation now execute as behavioral regressions. All retained findings are resolved, none deferred; frozen intent is unchanged.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
|---|---|---|
| Blind 1: inherited environment selection | medium | Installed Wrangler selects args.env or CLOUDFLARE_ENV; the wrapper only deletes WRANGLER_ENV. Clear the actual selector and exercise inherited-environment isolation; patch. |
| Blind 2: configurable migration ledger/pattern bypass guard | medium | The existing guard omits both fields, while installed migration resolution uses them. A changed ledger replays migrations and a narrowed pattern omits pending files; constrain both in the existing guard and add negatives; patch. |
| Blind 3: altered history is described as initialization failure | low | Renaming the marker makes check fail, but init legitimately reapplies an unrecorded bootstrap name and leaves the old row. Correct the misleading documentation/helper advice; do not introduce a history-repair engine; patch. |
| Blind 4: fixture copies only bootstrap SQL | low | The fixture names only 0001, so additional reviewed migration files are absent from its project. Copy only SQL beneath the migration directory; patch. |
| Blind 5: later failed migration lacks preservation evidence | low | The malformed-SQL case starts without existing data; it cannot prove rows/original ledger survive a subsequent failure. Add initialized-state failure coverage; patch. |
| Blind 6: completed failure skips immediate cleanup | low | reject throws before stop on deadline/output/nonzero branches; teardown eventually cleans, but completed itself leaves those owned processes active. Move its stop into finally and assert failure-scope cleanup; patch. |
| Blind 7: duplicate-marker/unexpected-constant-result branches lack controls | low | Wrangler creates name TEXT UNIQUE and real SELECT 1 has a fixed result; existing tests execute SQL/state failure paths. Hitting these defensive-result branches requires artificial schema/DB mocks, not an everyday supported state. Reject under the rare low-impact complexity rule. |
| Blind 8: sprint still in-progress during automated review | false | Step 4 deliberately changes spec status before review finishes; implementation tracking has not reached the presentation/synchronization step yet. This is an intermediate workflow state, not a completed-story mismatch; no early status patch. |
| Edge 1: alternate migration table disagrees with helper | medium | Installed Wrangler uses configured migrations_table, but the helper reads d1_migrations. Same verified guard omission as Blind 2; group that patch, retain this row. |
| Verification 1: pending migrations on initialized storage untested | medium | Trust the filed searches/tests: reruns have no pending SQL, so skipping later migration application would pass. Add successful exactly-once 0002 application, row/original-ledger preservation and another stable rerun, alongside Blind 5 failure coverage; patch. |
| Verification 2: production proxy env isolation only source-checked | medium | Trust the filed tracing: binding-key assertions inspect a separate proxy; production command tests only inspect output/declarations. Instrument the disposable helper to reject unexpected env bindings and run actual init/check with synthetic env files; patch. |

## Design Notes

No intent gaps. Dispatch spans configuration, local metadata mutation and tests; reset is manual documentation. Disposable planning probes verified SQL-only migration, CLI/proxy sharing, rerun preservation and workerd scheduled SQL. Use file-based scripts: eval-mode probes failed. The harness cannot establish CLI persistence sharing.

Official evidence checked 2026-10-20: [D1 local](https://developers.cloudflare.com/d1/best-practices/local-development/), [migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Wrangler APIs](https://developers.cloudflare.com/workers/wrangler/api/), corroborated by installed 4.151.2 schema/declarations. No dependency change planned.

## Verification

Workstation gate; unchanged-lockfile `npm ci`; binding generation; `npm run typecheck`; `npm test`; `npm run test:d1`; `npm run build`; both standalone build verifiers; `npm run test:smoke`; full/production audits; `git diff --check`. Record full VCS revision, environment/results/cleanup. No hosted, Story 1.5 fresh-clone or full-epic acceptance claim.

Executed 2026-10-20 on Ubuntu 24.04.5 LTS/x86_64, Git 2.43.0, selected Node 24.22.0/npm 11.19.1, against the uncommitted working tree based on full revision `ec180e7d226825d37f9fab51ef8f5d3e972e2eab`.

- All commands above passed. `npm test`: 45 Bash + 40 Vitest cases. `test:d1`: nine cases, about 55 seconds, also with an empty disposable `PLAYWRIGHT_BROWSERS_PATH`. `test:smoke`: 27 cases. Both builds, 22-canary isolation, two real PTY builds and eight historical synthetic PTY controls passed.
- The documented npm init/check/types commands run in a sanitized disposable copy/HOME with outer CI=false. CLI/proxy sharing, unchanged rerun data/ledger, actual workerd SQL and all negative/reset/interruption controls pass. Existing developer data was never reset; no real private/env files were used.
- Lockfile unchanged: SHA-256 `f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f`. No scripts approved or pins/compatibility date changed. Both audits exit 0 with zero known findings, not a security guarantee.
- No smoke/isolation/terminal/browserless fixture directories or application-port listeners remained. D1 state remains ignored/untracked. See `docs/development/application.md` for official references, measured cleanup behavior and limits. No hosted, fresh-clone or complete-Epic acceptance is claimed.

Final independent parent verification after review repeated every verification command successfully, including 45 Bash + 40 Vitest cases, 12 D1 cases with no browser available and 30 complete smoke cases. Both audits remain zero, the lock hash and generated declarations are unchanged, and cleanup checks are clear. All retained review patches are resolved; no work was deferred. Implementation and automated review are complete; sprint tracking remains at review pending BC's practical verification and human acceptance.
