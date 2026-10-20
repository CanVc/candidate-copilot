---
title: 'Story 1.5: Verify the Fresh-Clone Workflow and Document Troubleshooting'
type: 'feature'
created: '2026-10-20'
status: 'done'
baseline_commit: 'fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Earlier stories verify separate bootstrap components, not the complete documented journey from a fresh clone. The smoke command currently omits deterministic LLM simulation.

**Approach:** Consolidate the current startup/troubleshooting guide, include simulation in smoke, and execute the whole journey in clean Ubuntu 24.04 with attributable evidence.

## Boundaries & Constraints

**Always:** Preserve pins, lockfile, compatibility date, loopback ports, noninteractive/privacy/build safeguards and availability-only health. Use disposable Ubuntu 24.04, fresh non-root HOME, independently downloaded tools/packages/browser and fresh Git checkout/state. Review installers and explicit OS prerequisites before container-only installation; distinguish downloads/audits from application runtime traffic. Record container/headless limitations honestly.

**Never:** Install/change host tools or defaults, read real private/env files, reset developer D1, change source branches, deploy, log in or require Cloudflare/model credentials. Add product features, public diagnostics, a new framework or general-purpose bootstrap supervisor. Do not commit in the source checkout without explicit human authorization. Verification snapshots may be committed only in disposable repositories.

**Human closure authorization (2026-10-20):** After supplying a successful complete validation chain with the required tool versions, BC explicitly accepted Story 1.5 for closure and requested a local commit and normal push to the configured origin on the existing main branch. This authorizes that closure commit/push; all other constraints remain unchanged.

## I/O & Edge-Case Matrix

| Scenario | State | Expected behavior | Failure response |
|---|---|---|---|
| Fresh journey | No tools, dependencies, config, browser or D1 carried over | Documented acquisition, install, init, startup and checks succeed | Record first failing step; correct guide/code and rerun |
| Smoke | Installed clone, free ports | Simulation plus frontend/Worker and actual D1 checks execute | Any failed component exits nonzero |
| Common failures | Missing/wrong tools or packages; occupied port; wrong config/binding | Diagnostics identify corrective action | No forced upgrades, unknown-process killing or hosted fallback |
| Local reset | Disposable data; writers stopped | Existing warned D1-only procedure works | Never apply to developer state |

</frozen-after-approval>

## Code Map

- `docs/development/application.md:5–83,91–167,322–359`: current D1 journey and scattered historical browser/terminal instructions; preserve dated evidence and reset safeguards.
- `docs/development/workstation.md`: selected-tool acquisition/default preservation; prior container rehearsal proves tools only. Docker daemon and pinned Ubuntu image are available.
- `package.json`, `tests/bootstrap/safety.test.ts:46`, `tests/bootstrap/simulation.test.ts`: smoke currently runs only Playwright; reuse existing exact-output/unsupported-input/network-forbidden simulation tests.
- `tests/e2e/{bootstrap,d1,fixture-controls}.spec.ts`: existing browser, D1 binding/SQL and cleanup negatives. `local-fixture.ts` symlinks installed dependencies and modifies copied source: useful regression coverage, not fresh-clone proof.
- `.dev.vars.example`: comment-only optional configuration; stale no-D1 statement needs correction. No runtime-variable change.

## Tasks & Acceptance

**Execution:**
- [x] `tests/bootstrap/safety.test.ts`, `docs/development/application.md`, `docs/development/workstation.md` — resolve the second human acceptance failure: selected-tool fixtures must not alias the Vitest launcher's Node/npm as the simulated successful pin. Keep exact expected pins and all rejection controls; verify the isolated tests under both installed Node launchers. Make the pasted full validation block run the toolchain gate and stop at the first failing command, cover gate/test failure propagation behaviorally, and disable Git paging for current operator commands without changing global Git configuration.
- [x] `docs/development/application.md`, `docs/development/workstation.md`, `tests/bootstrap/safety.test.ts` — resolve the human-reported fresh-terminal failure: make entry into supported Bash explicit even from Zsh, then initialize the repository path, fnm environment and pinned Node in that same shell before the first gate and in both startup terminals. Do not rely on .bashrc, automatic switching or another shell's exports; stop before installation on selection/gate failure. Add executable coverage of the actual documented sequence from a clean shell with an old Node initially selected, and verify the original/default environment is unchanged. Keep installer acquisition separate and preserve existing safeguards.
- [x] `package.json`, `tests/bootstrap/safety.test.ts` — compose `test:smoke` as the existing simulation Vitest file followed by Playwright using fail-fast `&&`; update the command contract. Verify successful execution and a disposable simulation-failure control that prevents Playwright execution. Do not duplicate adapter tests or expose it publicly.
- [x] `docs/development/workstation.md`, `docs/development/application.md`, `.dev.vars.example` — establish one linked, ordered current journey: clone/tool selection, locked install, optional empty config, D1, browser/system and PTY prerequisites, checks, two-terminal startup/shutdown. Provide diagnostic commands and corrective actions for every matrix failure, retain the pre-deletion warning and clearly label historical instructions. OS changes are explicit administrator actions, never automatic application behavior.
- [x] `docs/development/fresh-clone-verification.md` — execute and record a fresh-container rehearsal following only that guide. Create a disposable committed candidate snapshot from reviewed changes, then genuinely clone it without source worktree/dependency/cache mounts. Record full source and tested snapshot revisions, image digest, snapshot provenance, environment, every command/result, unchanged lockfile/generated declarations and cleanup. Test direct and proxied health and stopped-Worker failure on the clone's own servers, not only sanitized test copies. Retest the final code after review fixes; never label a patched baseline as an unchanged tested revision.
- [x] `docs/development/fresh-clone-verification.md` — map executed regressions and disposable controls to all matrix rows; record download endpoints versus runtime calls and any limitation/blocker. Remove only owned container/snapshot/process resources; leave no application listeners or tracked runtime/private files. Failure is not acceptance.

**Acceptance Criteria:**
- Given clean Ubuntu 24.04, when the documented fresh-clone journey runs as a normal user after explicit administrator provisioning, then acquisition, configuration, local D1, frontend/Worker startup and every validation command succeed without inherited application state or hosted credentials.
- Given the installed clone, when `test:smoke` runs, then deterministic network-forbidden simulation, browser/Worker availability and actual Worker-binding SQL access are covered; a simulation failure cannot report smoke success.
- Given the verification record, when another developer follows its linked procedure, then prerequisites, failures, tested content and results are attributable without claiming graphical-workstation, business-pipeline, real-model or launch readiness.

## Implementation Notes

- Implemented fail-fast simulation plus Playwright smoke and its exact command regression; consolidated current acquisition/setup, browser/PTY prerequisites, startup/shutdown and troubleshooting while preserving historical records. Corrected optional template comments without introducing runtime variables.
- [Fresh-clone evidence](../../development/fresh-clone-verification.md) records the disposable Ubuntu image, non-root acquisition, source baseline and exact committed/cloned candidate `a22838b2fcbc1878db9afcee6b4a2efb7e09009c`, command outcomes, unchanged hashes, own-clone server failure/recovery, simulation-failure tripwire and warned disposable-only reset. External networking was disconnected for own-server checks and final complete smoke. Evidence is limited to headless bootstrap, not graphical workstation or product acceptance.
- Parent read the entire staged baseline diff, independently matched all five tested-file SHA-256 values to the record, and repeated the workstation gate, all typechecks, 45 Bash + 40 Vitest cases, 12 browser-free D1 cases, both builds, both standalone build verifiers, 6 simulation + 30 Playwright smoke cases, full/production audits, dependency resolution and whitespace checks. All passed; both audits report zero findings, lockfile/generated declarations are unchanged, source HEAD is unchanged, no application listener or verification container remains, and runtime/private paths are untracked. Parent log: `/tmp/candidate-copilot-story-1-5-parent-verification-eYJ89q.log` (temporary, not a portable repository artifact).
- Matrix audit: executed fresh-container acquisition/setup and missing-package controls cover fresh/missing state; smoke executes deterministic simulation, browser/Worker and actual workerd SQL plus the documented failing-simulation control; occupied-port, binding/configuration/toolchain failures and disposable D1-only reset all ran successfully. Every task and acceptance criterion is satisfied; no code/intent deviation or deferred work.

- After three independent review layers, the same implementation worker applied all seven retained patch groups. The existing fixture now registers a real successful-simulation/tripwire run followed by genuine simulation failure and verifies nonzero exit, no Playwright invocation and owned-process cleanup; no public API or dependency changed. Documentation fixes cover clone syntax, new-terminal path initialization, omission-safe repair, bounded curls, portable UID/PTY/browser replay and exact snapshot reconstruction.
- Final independent parent verification used a second fresh Ubuntu 24.04 container and a genuine clone of reviewed candidate `8a6c68382b8f792935b4ec39672f1223e29211ba` (tree `62e3031e8709d79c0b73f28fb76d5f34131c119f`), with no mounts, inherited tools/packages/config/cache or credentials. Independently acquired fnm/Node/npm/browser, stable-lockfile npm ci, binding generation/init/check, all typechecks, 45 Bash + 40 Vitest tests, 12 browser-free D1 cases, builds, standalone verifiers, full/production audits and dependency resolution all passed. Complete smoke now passes 6 simulation + 31 Playwright cases; a second full smoke passed with external networking disconnected. All seven tested source files match that candidate exactly.
- The exact documented own-clone PTY/browser recipe executed successfully without external networking: direct/proxied health, stopped-Worker failure in 51ms, restart/reload recovery and complete owned cleanup. The corrected stalled-handler curl control exits 28 in 5009ms; omission-safe npm ci also passes with NODE_ENV=production and inherited omit=dev. Only disposable D1 was reset, with other state preserved. Both historical and reviewed candidate reconstruction recipes reproduce their exact Git trees/commits. The final evidence section records commands, hashes, environment, limits and cleanup separately from pre-review history.
- Final matrix/task audit is complete: all required checks and every matrix row executed successfully, no retained review finding remains unresolved and none was deferred. The owned second container/snapshot/bundle/drivers were removed; source HEAD, lockfile and generated declarations remain unchanged, with no application listeners or tracked runtime/private state. Frozen intent is unchanged; implementation and automated review are complete, pending human acceptance.

- Human acceptance follow-up (2026-10-20): BC followed the application guide in an existing terminal and observed the old Node 24.15.0/npm 11.12.1 at the first gate. The guide's first command block omitted explicit shell initialization/version selection and assumed the linked Bash setup had affected the current terminal. BC explicitly requested correction. Reopened the existing story within unchanged frozen intent; prior snapshot results remain historical and do not establish the corrected shell handoff. Source commits remain unauthorized.

- Human-feedback correction completed: both guides now explicitly enter profile-free Bash before acquisition, initialize the clone/fnm/pinned Node in the same shell before any gate, and guard installation and each server startup on successful initialization. No shell profile, login shell, host tool or default is changed. Four registered tests execute the marked guide blocks for 24 success/failure scenarios; review's acquisition-before-Bash link issue was corrected without changing the tested blocks.
- Parent reproduced the user's exact old-version gate failure from real clean Zsh, then executed the actual corrected entry/init blocks successfully: old Node/npm initially, pinned versions and ready=true afterward, original shell/default still 24.15.0 and no profiles created. A third entirely fresh Ubuntu container genuinely cloned corrected candidate `718284bcc431e320e1476bace635d6a908bf64a7` (tree `dd415fe31947fece3544a6abee008f9ee472d228`). Documented acquisition, exact initialization/guarded installation, D1, types, 45 Bash + 44 Vitest tests, 12 browser-free D1 cases, builds, standalone verifiers, audits and dependency checks passed. Full smoke passed 6 simulation + 31 Playwright cases, then passed again offline. Own-clone Worker/frontend each executed the exact documented startup handoff in fresh clean-PATH Bash/PTYs; availability, stopped-Worker failure in 52ms, restart/reload and cleanup passed without external networking. Container profile hashes and absent default stayed unchanged.
- Current evidence records corrected content/hashes/results separately from historical pre-feedback runs. All seven tested files match the candidate, its documented reconstruction reproduces the exact tree/commit, lock/declarations and source HEAD remain unchanged, and all owned container/snapshot/shell fixtures were removed. No deferred correction remains. Source commits remain unauthorized; implementation/automated checks are complete and human acceptance of the corrected guide is pending.

- Second human feedback (2026-10-20): BC's full validation output has four failed fresh-terminal unit cases but passing D1/build/smoke/audits. Parent reproduced the exact four failures with the unmodified local Node 24.15.0/npm 11.12.1 launcher. The selected fixture uses process.execPath and its adjacent npm, so it inadvertently tests its positive case with the launcher's old versions. Reopened for isolated fixture correction and fail-fast/nonpaged operator validation; no pin/expectation weakening, global update, source commit or developer-state reset is authorized.

- Second-feedback correction completed: selected Node/npm version-reporting fixtures are explicit simulations independent of the Vitest launcher, while the copied checker and exact pin/failure assertions are unchanged. The marked complete validation block now checks the toolchain first, chains every command with && and uses command-local Git --no-pager. Three registered executable controls cover initial gate rejection, npm test failure exit 23 with no later stages, and successful later-stage tripwires, without an outer set -e.
- Parent independently ran plain npm test in the unchanged original local Node 24.15.0/npm 11.12.1 context that reproduced the four failures: 45 Bash + 47 Vitest cases now pass. Focused tests also pass under both installed launchers; targeted independent review has no actionable findings. The exact validation block still correctly rejects the actual old launcher at the gate before any npm command, and a live PTY positive-pager control proves corrected inspections bypass paging. This does not advertise the old launcher as a supported application runtime.
- Parent repeated actual marked initialization, guarded npm ci and the entire actual validation block in a fourth fresh Ubuntu 24.04 container, genuine clone of candidate 9f9aabdd3b16874d8ea2341b5f966dd1f8de7ff5 (tree 13a76671dac6ca63b48e71fb9b768f3c217285ed). Required Node 24.22.0/npm 11.19.1, types, 45 Bash + 47 Vitest cases, 12 D1 cases, builds, both verifiers, 6 simulation + 31 Playwright smoke cases, both audits and dependency/Git checks all passed. Seven tested files match the snapshot; exact reconstruction reproduces its commit/tree; lock/declarations, profiles, absent container default and source HEAD remain unchanged. Owned container/snapshot/fixtures are removed. Current evidence separates this from prior historical runs; no correction is deferred and human acceptance remains pending. No source commit/push or global change was made.

- Human closure (2026-10-20): BC supplied a complete successful && validation chain on Ubuntu 24.04 with Git 2.43.0, Node 24.22.0/npm 11.19.1: all typechecks, 45 Bash + 47 Vitest tests, 12 D1 cases, both builds/verifiers, 6 simulation + 31 Playwright smoke cases, zero-finding audits, dependency resolution and nonpaged Git inspections passed. BC then explicitly requested story closure, commit and push. This records user-operated automated checks and explicit acceptance, not additional manual browser/physical-workstation or clean-clone claims. Sprint tracking is synchronized to done; the frozen commit prohibition is narrowed only to reflect BC's explicit closure authorization. No corrective work remains deferred.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Blind 1: no executable fresh-clone example | low | Workstation lines 29–33 describe authorized cloning but give only cd/export, requiring the reader to supply acquisition syntax. Add mkdir/clone example; direct documentation patch. |
| Blind 2: PROJECT_ROOT missing in new terminals | medium | The current startup block expands an export made only in another shell. A fresh terminal has no PROJECT_ROOT and cannot reliably enter the clone/select its pin; initialize an explicit example path in each terminal; patch. |
| Blind 3: inherited dependency omission survives repair | medium | npm_config_omit=dev is observable with npm config get omit; plain npm ci honors it. The repair row names optional packages but no explicit includes, leaving tsc/browser tooling missing. Document npm ci --include=dev --include=optional as the corrective command; patch. |
| Blind 4: diagnostic curl can hang | medium | Both new curl commands omit connect/overall deadlines; a reachable stalled handler has no bound. Add --connect-timeout 2 --max-time 5 to both; patch. |
| Blind 5: fail-fast control is one-time only | low | Repository search finds only the source-string assertion plus the executed evidence transcript, not a registered behavioral orchestration test. Retain the disposable failure/tripwire control in normal automated coverage; patch. |
| Blind 6: normal-user invocation/driver not replayable | low | The evidence gives the env command but omits docker exec's user selection and the removed own-server driver body. Add portable invocation/transcript detail sufficient to repeat the owned-clone checks; documentation patch. |
| Blind 7: deleted candidate snapshot cannot be retrieved | low | Cleanup intentionally removes the only candidate repository/bundle. Full revisions, tree and file hashes identify content but there is no reconstruction recipe; add explicit disposable reconstruction and tree verification, rather than retaining runtime resources; documentation patch. |
| Blind 8: sprint in-progress during automated review | false | Step 3 synchronizes sprint in-progress; Step 4 changes only spec status before review completes. The presentation step has not run, so this is the expected intermediate workflow state, not a completed-story mismatch. |
| Edge 1: unbounded diagnostic curls | medium | Same demonstrated stalled-response behavior as Blind 4 at both new startup commands. Group with that direct deadline patch, preserving this separate finding row. |
| Verification 1: recurring smoke failure propagation absent | low | Trust the filed test/search evidence: only the literal command contract and a one-time real mutation protect orchestration; no normal suite executes that branch. Group the registered real failure/tripwire regression with Blind 5; patch. |

All seven retained patch groups above are resolved and independently retested on the reviewed candidate; Blind 8 remains rejected on its workflow-state refutation. No finding was deferred and no frozen intent was amended.

### Human-acceptance follow-up

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Human 1: first gate relies on implicit parent-shell selection | medium | Real Zsh with old Node reproduces both version failures; running bash checker does not select the parent shell's Node. Explicit supported Bash entry, shell-local initialization/pin selection and guarded install/startup now execute from the guide itself; registered 24-scenario coverage, real Zsh proof and a fresh-container full journey pass. Resolved. |
| Follow-up review 1: acquisition links precede Bash entry | medium | Bash-only read -r -p can fail as no-coprocess in Zsh when linked anchors bypass the shell-entry section. Acquisition instructions now occur only after the separate Bash command and wait-for-prompt explanation. The installed-tools and fresh-acquisition journeys both pass; no new shell/runtime dependency was added. Resolved. |

### Second human-feedback follow-up

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Human 2: selected fixture aliases the launcher runtime | medium | Parent reproduced all four failures with plain local Node 24.15.0. process.execPath/adjacent npm supplied the old versions to a positive case requiring new pins. Explicit selected-version simulations now isolate that case; unchanged gate/pin assertions and every negative control pass under both launchers, and unprefixed full npm test passes 45 Bash + 47 Vitest cases. Resolved, not skipped or relaxed. |
| Human 3: copied validation continues after failure | medium | Human log shows npm test failure followed by D1/build/smoke. Actual copied block is now gate-first and && chained; executable no-set-e controls preserve failures and prevent later tripwires, and parent actual old-launcher execution stops at the real gate. Full supported-toolchain fresh validation passes. Resolved. |
| Human 4: empty Git pager looks hung | low | Screenshot shows an empty pager; live PTY positive/negative controls confirm normal paging versus command-local no-pager. Current operator Git commands bypass paging without global configuration edits; historical transcripts are unchanged. Resolved. |

## Design Notes

No unresolved intent gaps. Downloads and OS packages affect only disposable resources. Footprint: four existing documentation/configuration/test files plus the workstation guide and one evidence file; no runtime API. Choose documentation plus measured rehearsal, not a reusable clone-runner framework. A disposable candidate commit permits an exact fresh-clone revision without modifying source history; evidence written afterward is identified separately.

## Verification

Run the workstation gate; before/after lock hashes around `npm ci`; `db:types`, `db:init`, `db:check`; `typecheck`; `npm test`; browser-free `test:d1`; `build`; both standalone build verifiers; pinned Chromium installation; direct startup/shutdown checks; complete `test:smoke`; full/production audits; `npm ls --all`; generated-file comparison; `git diff --check` and tracked-state/owned-resource checks. Record actual counts and outcomes, not inherited Story 1.4 results.
