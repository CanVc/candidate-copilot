# Story 1.5 — fresh-clone verification

**Current launcher-independent correction: PASS; Story 1.5 accepted for closure by BC (2026-10-20).** The parent first reproduced all four failures using the unchanged local **Node 24.15.0/npm 11.12.1** launcher, then reran plain **`npm test`** after correction in that same context: **45 Bash + 47 Vitest tests passed**. The exact complete validation block also passed in a fourth genuinely fresh Ubuntu clone under the required **Node 24.22.0/npm 11.19.1**, including types, D1, builds, smoke and audits. See [parent verification of launcher independence](#parent-verification-of-launcher-independence). Earlier full-run records remain historical; none is relabeled as evidence for the changed fixture or validation block. Passing isolated unit tests under the old launcher does not make that launcher a supported application toolchain: the real gate still rejects it.

## Human acceptance and closure

On **2026-10-20**, BC supplied the successful complete fail-fast validation chain from the existing Ubuntu workstation, with **Git 2.43.0, Node 24.22.0/npm 11.19.1** selected. The output records successful typechecks, **45 Bash + 47 Vitest tests**, **12 D1 cases**, both builds and standalone build verifiers, **6 simulation + 31 Playwright smoke cases**, both audits with **zero known findings**, dependency resolution and all three nonpaged Git inspections. The chain reached its final status command, so no intermediate failure was bypassed. Expected optional dependencies and the story's staged changes are not failures.

BC then explicitly requested **Story 1.5 closure, a local commit and push**. This is acceptance based on the supplied user-operated automated verification and the recorded agent rehearsals. It does not assert an additional manual two-terminal/browser check, a new clean-workstation installation, real-model/product readiness or acceptance of other stories. The implementation and tracking are closed; the requested source commit/push is separately authorized and does not relabel any earlier verification snapshot as that source commit.

## Focused launcher-independence and fail-fast checks

Executed **2026-10-20, 15:28 UTC**, using only already installed tools. The successful selected versions in the handoff fixtures are now **explicitly simulated**, independent of `process.execPath` or an adjacent npm. The actual copied toolchain gate and its exact **v24.22.0 / 11.19.1** assertions are unchanged; all six existing handoff modes remain covered.

```bash
for version in 24.15.0 24.22.0; do
  NODE="$HOME/.local/share/fnm/node-versions/v$version/installation/bin/node"
  "$NODE" --version
  "$NODE" node_modules/vitest/vitest.mjs run tests/bootstrap/safety.test.ts \
    -t 'documented (fresh-terminal handoff|validation fail-fast chain)'
done
"$HOME/.local/share/fnm/node-versions/v24.22.0/installation/bin/node" \
  node_modules/typescript/bin/tsc -p tsconfig.tooling.json
git --no-pager diff --check
```

- **Node v24.15.0:** all **7 focused tests passed** (646ms); **Node v24.22.0:** the same **7 passed** (632ms). Seven unrelated publication/build tests were excluded by the requested name filter; no test was disabled or pin assertion weakened.
- Each launcher executes the four handoffs with all six modes (**24 disposable cases**) plus the actual newly marked validation block with initial gate failure, `npm test` failure and a successful tripwire control (**3 more cases**). Initial gate failure exits **1** without any npm stage; failing synthetic `npm test` exits **23** after typecheck/test only. In both failures, the D1/build/smoke/later-stage tripwire remains untouched. The successful control reaches it and the final pager-free Git status command. No outer `set -e` masks a broken guide chain.
- Tooling typecheck and whitespace checks passed. No application packages, D1, builds, browsers, audits or full suites were run during that focused worker phase; the parent's subsequent full runs are recorded separately below. Synthetic HOME/settings/defaults and all tripwires remain disposable; no global tool/default/Git configuration or source dependency changed. Current Git commands use command-local `--no-pager`; historical transcripts below are retained verbatim.

## Parent verification of launcher independence

Executed **2026-10-20**, after reproducing the human's failure. Parent's initial unprefixed focused run on the actual local **Node 24.15.0/npm 11.12.1** produced the same four selected-case failures and unchanged old-version output. Root cause was the fixture's symlink to `process.execPath` and execution of its adjacent npm. Selected version-reporting tools are now explicit simulations; the copied real checker, exact pin expectations and all six handoff scenarios are retained, not skipped or relaxed.

### Actual local context and failure propagation

- Parent ran **`npm test` without a PATH/version override**: **45 Bash + all 47 Vitest tests passed**, four test files, 8.20s Vitest, with initial output explicitly showing **v24.15.0 / 11.12.1**. This is the exact local command/context that previously failed, not merely the focused test report or a pinned-container substitute.
- The worker separately ran all **7 focused tests** under both already installed Node launchers. The four handoff tests cover 24 cases; the three validation tests execute the actual marked guide block for gate failure, failing `npm test` and successful later-stage tripwires. They use no outer `set -e`, preserve exit codes 1/23 and prove that later D1/build/smoke commands do not run after failure.
- Parent executed the real, complete copied validation block in the unchanged old local launcher with Bash tracing. It exited **1 at the actual workstation gate**, reported both old-version mismatches, and executed **no following npm command**. Thus the app still requires its pinned toolchain; fixture isolation is not a compatibility waiver.
- A live PTY control proved the configured synthetic Git pager is invoked for `git --paginate log`; the corrected `git --no-pager diff/status` commands never invoked that same proven pager. No global Git configuration was edited.
- Focused independent review reported **no actionable findings**. Host Node/npm/default remain **24.15.0 / 11.12.1 / v24.15.0**; no host tool or profile change was made.

### Fourth fresh-clone full validation

A new disposable repository was cloned from source baseline **`fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391`**, overlaid only with the seven reviewed files listed below, committed only there, bundled and genuinely cloned inside a fourth fresh Ubuntu container. No source commit/branch or developer D1 was changed.

- Tested candidate **`9f9aabdd3b16874d8ea2341b5f966dd1f8de7ff5`**, tree **`13a76671dac6ca63b48e71fb9b768f3c217285ed`**, parent the source baseline.
- Message `Story 1.5 launcher-independent test and fail-fast verification`; author/committer `Disposable verification <verification@example.invalid>`, both dates **`2026-10-20T17:33:08+02:00`**.
- Bundle SHA-256 **`7652a4b888b9d8bb243b1a847493cbc3c285cfb00a6a55958210de31fd086e25`**.
- New container **`54a159d3137fb5f8cee293c84396ba5ca6568a2f45b06c3745a61bd03b79843a`**; official Ubuntu image digest **`sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac`**, `--init`, **`Mounts=[]`, `PortBindings={}`**.
- Explicit container-root provisioning used the reviewed apt list below. Application phases used fresh **UID/GID 1001 `rehearsal`**, `env -i`, a clean base PATH and **`bash --noprofile --norc`**. Node/npm/fnm, packages/cache/browser/config/D1 were initially absent. The independently downloaded, hash-verified official fnm installer selected the pinned distribution without profile edits or changing the absent default.

| Tested file | SHA-256 |
| --- | --- |
| `package.json` | `d2cf3aff101eeab38b1236d2d40927b738713324dbcf3c26f894f67b0951237c` |
| `tests/bootstrap/safety.test.ts` | `e10364ed1158d6e0f0bcb6764e4012db02c0959728b7665bfccdd37334d74af9` |
| `.dev.vars.example` | `bee5d87da2f2fceb07228924dba0b042c2fd1645c256e4f2d5f4ef4cb0c8f7d8` |
| `docs/development/workstation.md` | `d319cccd9c6ef55e74df307f0cd50995d79e5ac17718b150d448734d1b872efa` |
| `docs/development/application.md` | `b0e5086227b6896b558bcf6ed08f509352315f824592f90eec2fe26056e98514` |
| `tests/e2e/local-fixture.ts` | `cc5e042f0afdc73958be30a1457caf526789738a70512dcd2349439bea41555b` |
| `tests/e2e/fixture-controls.spec.ts` | `84127bbb948fa548b96b49a4e69e463d636a8c050f441b183d76b9d3bfc5849b` |

Parent extracted and executed the actual guide's `fresh-terminal:init`, `install` and **entire `validate` block**, not a separately reconstructed command list. Setup's guarded `npm ci`, generated declarations, `db:init`, `db:check`, real PTY prerequisite and pinned Chromium acquisition passed. Then the complete gate-first fail-fast block passed in order (all normal exit codes 0), **15:33–15:37 UTC**:

| Exact validation stage | Result |
| --- | --- |
| `bash scripts/check-workstation.sh`; `npm run typecheck` | PASS; Git 2.43.0, Node 24.22.0/npm 11.19.1 and all three typechecks. |
| `npm test` | **45 Bash + 47 Vitest passed**, including every handoff and failure-propagation case. |
| `npm run test:d1` | **12 passed (1.6m)**; no browser fixture requested. This run had the browser installed for the subsequent complete smoke; browser-absence evidence below remains historical, not a new absence claim. |
| `npm run build`; both standalone build verifiers | PASS; dry-run Worker only, 22 isolation canaries, protected PTY builds and all eight synthetic controls. |
| `npm run test:smoke` | **6 simulation + 31 Playwright passed (2.0m)**; actual Worker binding SQL, browser/Worker checks, simulation-failure behavior and cleanup controls executed. |
| Full/production audits; `npm ls --all` | PASS; both audits zero known findings, no missing/invalid required dependencies. No forced upgrades or install-script approval. |
| All three `git --no-pager` inspections | PASS; unchanged lock/declaration bytes, no whitespace issue, clean clone status and no interactive pager. |

Afterward `.bashrc`, `.profile` and `.bash_logout` SHA-256 checks remained unchanged, there were no tracked private/runtime files or application listeners, and every tested file still matched the source byte-for-byte. Lock SHA-256 remains **`f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f`**; generated declaration remains **`4b9b3a1f830bfaa264a06b07fbaa21f3de7fc0323ceb7902321e11eab4d0e785`**.

The disposable seven-file reconstruction recipe later in this record can reproduce this current candidate by substituting its recorded **tree, commit, message and date** above for the older candidate's values; the baseline/file list are unchanged and the current seven hashes must match. The exact reconstructed current tree/commit were checked before cleanup. Evidence/spec/sprint files are not in the tested tree. The owned container, candidate/bundle/drivers and fixtures were removed; session-only duplicate logs are not repository prerequisites. No source commit/push, global change or developer-data reset occurred.

Limits: this correction is verified by both the exact formerly failing local unit invocation and a fresh supported-toolchain full validation. It does not certify Node 24.15.0 as an application runtime or replace the user's manual acceptance. The fourth run does not claim a new graphical-workstation, interactive pager UX, offline-runtime or real-model acceptance rehearsal; prior own-server/offline results below remain historical. No retained corrective finding is deferred.

## Historical evidence before this follow-up

The previous third-container run passed **45 Bash + 44 Vitest tests**, 12 browser-free D1 cases, builds, audits and **6 simulation + 31 Playwright smoke cases** against its recorded candidate, and separately exercised a real Zsh-to-Bash handoff. Those measured results remain attributable to that older content and environment only; they did not detect the launcher-dependent fixture failure or the pasted block's failure propagation. See [historical human-feedback full verification](#historical-human-feedback-full-verification).

## Historical focused human-feedback correction checks

Executed **2026-10-20, 12:50 UTC**, using the selected Node **24.22.0/npm 11.19.1**, without acquisition, application installation, browser/D1 startup or full-suite reruns:

- `./node_modules/.bin/vitest run tests/bootstrap/safety.test.ts -t 'documented fresh-terminal handoff'`: **4 passed, 7 unrelated tests skipped** (977ms). Each registered handoff (application setup, Worker terminal, frontend terminal, workstation verification) executes the actual marked guide blocks in a clean Bash launched from `/bin/sh`, starting with disposable old-version Node/npm executables on PATH. All four cover successful selection plus missing fnm, failed fnm environment, failed selection, stale old-tool selection and wrong npm: **24 disposable executions**. Selected versions come from the real pinned Node/bundled npm; a fixture-only fnm models environment/selection. No Zsh dependency or real package installation is used.
- Success requires the gate's exact pins and the guarded next command. Every failure leaves readiness false and never reaches the install/startup tripwire. The launching shell still exposes the old Node afterward, demonstrating that configuring the child Bash does not configure its parent. Synthetic profile/default/config/lock bytes remain unchanged; fixture directories are removed.
- `./node_modules/.bin/tsc -p tsconfig.tooling.json`: passed for the edited registered test and existing tooling types.
- `git diff --check`: passed. No previous container/audit/build/smoke result is relabeled as a result for these changed files. Full fresh-clone verification was still pending at that point; the parent's subsequent result is retained below as historical evidence and predates the newly reproduced launcher/validation failures.

## Historical human-feedback full verification

Executed by the parent **2026-10-20**, with full fresh-container checks **13:00–13:08 UTC**, **before** the newly reproduced old-launcher fixture failures, fail-fast validation correction and pager-free Git commands. This run is retained as historical evidence, not verification of the subsequent changes. The earlier shell-entry issue was reproduced and corrected without installing host tools, changing profiles/defaults or altering source history.

### Real existing-workstation shell handoff

- A disposable HOME, empty profile/configuration state, no `PROJECT_ROOT` and PATH initially pointing to the existing **Node 24.15.0/npm 11.12.1** were supplied to **real Zsh 5.9**. Before the fix, running the checker from Zsh reproduced the exact two version failures (exit 1).
- The parent extracted the corrected application's marked `fresh-terminal:bash` and `fresh-terminal:init` blocks directly from the guide. Zsh launched that exact profile-free Bash command; its stdin executed the initialization block unchanged. Output showed the initial old versions, then **PASS: Node v24.22.0**, **PASS: npm 11.19.1**, and `WORKSTATION_READY=true`.
- After child Bash exited, the original Zsh still reported **v24.15.0**. The host fnm default remained **v24.15.0**, the agent's active original Node remained unchanged, and no disposable `.bashrc`, `.zshrc` or `.profile` was created. This used already installed real fnm/Node binaries for a shell-selection test, not as fresh-install evidence. A first parent harness attempt used Zsh's reserved `status` variable after the successful child; the harness was corrected to `result_code` and the entire proof rerun successfully.
- Focused review also found an acquisition link before Bash entry. It was moved after the separate entry block and wait-for-prompt instruction, so missing-tool readers cannot reach the Bash-only installer confirmation before entering Bash. Acquisition was subsequently exercised in the fresh container below.

### Exact fresh-clone candidate and environment

Source baseline remains **`fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391`**. A disposable snapshot containing exactly the seven files below was committed only in its own repository, bundled, then genuinely cloned by a fresh non-root user in a new container:

- Tested commit **`718284bcc431e320e1476bace635d6a908bf64a7`**, tree **`dd415fe31947fece3544a6abee008f9ee472d228`**, parent the source baseline.
- Message `Story 1.5 fresh-terminal correction verification`; author/committer `Disposable verification <verification@example.invalid>`, both dates **`2026-10-20T15:00:27+02:00`**.
- Bundle SHA-256 **`5a54340448bf6a004c53adb28951f6fbb56784fa85b503765714f818ed8f9f47`**.
- Container **`c9c7c307b2e517f5004293e13ac45d2c0d74bb3a3fb10194ba7dff0e3e72bed8`**, official Ubuntu digest **`sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac`**, `--init`, **`Mounts=[]`, `PortBindings={}`**. No host packages, caches, source worktree or private configuration were mounted/copied.
- Ubuntu **24.04.5 LTS/x86_64**, fresh UID/GID **1001 `rehearsal`**, HOME `/home/rehearsal`, Git **2.43.0**, independently downloaded fnm **1.39.0**, Node **24.22.0/npm 11.19.1**, Chromium/headless revision **1248** and FFmpeg **1013**. Explicit container-root apt/user creation used the reviewed package list recorded below.

| Tested file | SHA-256 |
| --- | --- |
| `package.json` | `d2cf3aff101eeab38b1236d2d40927b738713324dbcf3c26f894f67b0951237c` |
| `tests/bootstrap/safety.test.ts` | `b5ac6f6869af88ff55f652e209c0131f1751173cc480f8cc4eda8faaaec33be3` |
| `.dev.vars.example` | `bee5d87da2f2fceb07228924dba0b042c2fd1645c256e4f2d5f4ef4cb0c8f7d8` |
| `docs/development/workstation.md` | `74ec0d3598a982df19d69e585d51282666470c1698aea274b58923abb644afd8` |
| `docs/development/application.md` | `223ba2497369d7078187fc02f766840b64b69209f7100ec90a8ec89266edead3` |
| `tests/e2e/local-fixture.ts` | `cc5e042f0afdc73958be30a1457caf526789738a70512dcd2349439bea41555b` |
| `tests/e2e/fixture-controls.spec.ts` | `84127bbb948fa548b96b49a4e69e463d636a8c050f441b183d76b9d3bfc5849b` |

Every file was compared byte-for-byte with that tested snapshot after its checks. Evidence/spec/sprint metadata is excluded from the tested tree and written separately. Historical reconstruction requires a checkout matching the seven hashes above, **not today's modified guides/safety test**. With those matching pre-follow-up bytes only, use the disposable seven-file reconstruction recipe below, substituting tree **`dd415fe31947fece3544a6abee008f9ee472d228`**, commit **`718284bcc431e320e1476bace635d6a908bf64a7`**, date **`2026-10-20T15:00:27+02:00`** and message **`Story 1.5 fresh-terminal correction verification`** for the older candidate's four values. The file list and baseline are identical; all recorded hashes and the exact tree/commit must match. No source branch/index/history is changed by that disposable procedure.

### Executed journey and results

All application phases ran as the fresh user with `env -i`, base PATH `/usr/local/bin:/usr/bin:/bin`, **`bash --noprofile --norc`** and no inherited fnm selection/readiness. Acquisition used the fully reviewed, hash-verified official versioned fnm installer and preserved an initially absent default alias. Unlike the historical runs, **no `.bashrc` setup was added**: SHA-256 checks of the image's `.bashrc`, `.profile` and `.bash_logout` stayed unchanged throughout. Missing Node/npm first caused gate exit 1; pre-install typecheck exited 127. The documented acquisition corrected these, with no application package installed before successful initialization.

The parent extracted and sourced the guide's actual marked initialization and guarded-install blocks, rather than maintaining a separate handoff. The full command sequence followed the same previously recorded validation table, with these current results:

| Commands/checks | Corrected-guide outcome |
| --- | --- |
| Exact documented initialization, gate and guarded `npm ci`, lock hashes/diff | PASS; `WORKSTATION_READY=true`, no preexisting packages/cache/config/D1, unchanged lockfile; no install-script approval. |
| `db:types`, declaration diff, `db:init`, `db:check` | PASS; unchanged generated declaration and exact local SQL/migration marker. |
| Documented PTY/procfs prerequisites | PASS, including actual terminal stdin/stdout/stderr. |
| `npm run typecheck`; `npm test` | PASS; **45 Bash + 44 Vitest tests**. Four new registered guide-handoff tests execute **24 scenarios**: successful selection, absent fnm, failing environment, failed selection, stale old selection and wrong npm for application setup, Worker, frontend and workstation handoffs. Failure never reaches install/startup; synthetic profile/default/config/lock state and launching-shell Node remain unchanged. |
| Empty browser path with `npm run test:d1` before Chromium download | **12 passed (1.5m)**; browser-free capability preserved. |
| `npm run build`; both standalone build verifiers | PASS; dry-run Worker only, all 22 canaries, real PTY builds and eight synthetic prompt/cleanup controls. |
| Pinned browser acquisition, `npm run test:smoke` | PASS; **6 simulation + 31 Playwright cases (1.9m)**, including actual workerd SQL and real simulation-failure/tripwire behavior. |
| Full/production audits; `npm ls --all`; whitespace/generated/lock/tracked-state checks | PASS; both audits zero findings, no invalid required dependencies or tracked private/runtime state. |

After bridge disconnection (`NetworkSettings.Networks={}`), own-clone startup used **the exact documented startup initialization and guarded Worker/frontend blocks**, each in a separate profile-free Bash/PTY with a clean base PATH and no inherited readiness flag. These are not sanitized application copies: the scripts read the guide in the actual tested clone and start its own servers/dependencies. Both startup gates reported the pinned versions before readiness. Direct/proxied health returned exact `{"status":"ok"}`; Chromium showed available. Ctrl+C stopped only the Worker; reload showed unavailable in **52ms**, direct curl exited **7**, proxy curl **22**. A separately initialized Worker shell restarted successfully and reload recovered. All observed browser requests were loopback; all owned PTYs/browser closed, with no application listeners.

A final complete smoke then passed again without external networking: **6 simulation + 31 Playwright cases (1.8m)**. All profile hashes, an absent container fnm default, clean Git status and empty listeners were rechecked. Only the final check shell and `ps` remained for that user. Lockfile SHA-256 remains **`f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f`**; generated declaration SHA-256 remains **`4b9b3a1f830bfaa264a06b07fbaa21f3de7fc0323ceb7902321e11eab4d0e785`**.

### Scope and cleanup

The fresh container/snapshot/bundle/drivers and disposable existing-workstation shell fixtures were removed after verification; the preexisting Ubuntu image and host tools/defaults remain unchanged. Source HEAD is still the baseline, no source commit/push was made and no developer D1/private material was used. All prior matrix failures remain covered by the executed full suites. That historical candidate's reconstruction also reproduced its exact tree/commit successfully at the time. Temporary duplicate logs remain outside the removed fixture for this session only; they are not repository prerequisites. The later launcher/validation/pager findings are covered only by the focused checks at the top of this record; their full verification remains pending. This older shell-handoff/headless-bootstrap evidence does not replace the user's terminal/browser acceptance, prove interactive installer review usability or establish real-model/product/launch readiness.

## Historical pre-feedback verification records

The parent previously repeated the complete journey in a second clean Ubuntu container against candidate **`8a6c68382b8f792935b4ec39672f1223e29211ba`**: 45 Bash + 40 Vitest tests, 12 browser-free D1 cases, builds, audits and **6 simulation + 31 Playwright smoke cases**, including the behavioral failure control. Own-clone startup/failure/recovery and final smoke passed without external networking. See [historical reviewed-source full verification](#historical-reviewed-source-full-verification) for provenance, results and cleanup. This remains headless bootstrap evidence only and predates the failed human handoff.

**Historical snapshot evidence, not verification of the corrected source.** Executed **2026-10-20** (10:12–10:22 UTC), before the review corrections below. Procedure: [workstation acquisition/selection](workstation.md), then [application journey](application.md#current-setup-and-checks). All required checks passed for that snapshot. Expected negative controls failed as intended; they are not accepted failures of the normal journey.

The first review corrected acquisition/startup/repair/diagnostic instructions and added a registered supervised smoke-failure regression in `tests/e2e/fixture-controls.spec.ts` (using `local-fixture.ts`). Those focused checks and the parent's subsequent container run are recorded separately below; both predate human feedback. Historical counts/hashes/results must not be relabeled as current. Those shell-entry/selection instructions and their handoff tests had the separate pre-follow-up full-verification record above; it does not verify today's launcher-independent fixtures or fail-fast validation block.

## Exact content and provenance

- Full source revision: **`fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391`**.
- Disposable committed candidate, actually cloned/tested: **`a22838b2fcbc1878db9afcee6b4a2efb7e09009c`**; tree **`498ea8f4835d0143a88800b417ac41b07b0f02b3`**. Parent is the source revision above; this is **not an unchanged baseline**.
- Candidate changes: exactly `package.json`, `tests/bootstrap/safety.test.ts`, `.dev.vars.example`, `docs/development/workstation.md`, `docs/development/application.md`. Only smoke composition/its contract and documentation/template comments changed. Pins, lockfile, compatibility date, runtime APIs and safeguards are unchanged.
- This evidence file was written **after** execution and is not part of that snapshot. Source checkout's preexisting sprint-status edit and untracked Story 1.5 specification were not copied into the candidate. No source branch, commit, tool, shell setting or D1 state was changed for verification.

The source-to-snapshot commands (all exit 0) were:

```bash
# R was mktemp -d /tmp/candidate-story-1-5-XXXXXX:
R=/tmp/candidate-story-1-5-5o2Xgf
# Run in source checkout, after reviewing the five-file changes:
git diff --check
git clone --no-local . "$R/snapshot"
for f in package.json tests/bootstrap/safety.test.ts .dev.vars.example \
  docs/development/workstation.md docs/development/application.md; do
  cp -- "$f" "$R/snapshot/$f"
done
git -C "$R/snapshot" diff --check
git -C "$R/snapshot" add -- package.json tests/bootstrap/safety.test.ts \
  .dev.vars.example docs/development/workstation.md docs/development/application.md
git -C "$R/snapshot" -c user.name='Disposable verification' \
  -c user.email='verification@example.invalid' commit \
  -m 'Story 1.5 candidate snapshot for fresh-clone verification'
git -C "$R/snapshot" rev-parse HEAD
git -C "$R/snapshot" bundle create "$R/candidate.bundle" HEAD
sha256sum "$R/candidate.bundle"
```

Bundle SHA-256: `4e5d2cd11a9b1e2d6418e8a5671891f3057eeaa124962a1f9a5718e5aaffc1e5`. Git objects, not a worktree/archive with ignored files, crossed the container boundary. The normal user ran **`git clone /tmp/candidate.bundle /home/rehearsal/dev/candidate-copilot`**; `git rev-parse HEAD` returned the candidate revision, detached HEAD, with initially empty `git status --porcelain`. No patch was applied to that clone. The mutation control used a separate disposable clone only.

Historical five-file SHA-256 values (the current guides and safety test now differ). The [historical reconstruction procedure](#reconstruct-the-historical-candidate-without-source-history-changes) below requires its matching pre-feedback source bytes, **not today's worktree**:

| File | SHA-256 |
| --- | --- |
| `package.json` | `d2cf3aff101eeab38b1236d2d40927b738713324dbcf3c26f894f67b0951237c` |
| `tests/bootstrap/safety.test.ts` | `74e2dad1bc0688cc3c78a49e7e377d71e8158cd63c8115e60e42f827dd651440` |
| `.dev.vars.example` | `bee5d87da2f2fceb07228924dba0b042c2fd1645c256e4f2d5f4ef4cb0c8f7d8` |
| `docs/development/application.md` | `dd035c9555bda03785a1df70c1574ce01f36450224a2ebdae07fd4e7125644c8` |
| `docs/development/workstation.md` | `360d3cf7bad00d2d8e1a6eeac69555f3b04407f97bc6604a7cf2653f52ab3f82` |

## Disposable environment and administrator provisioning

Official image **`ubuntu@sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac`**, already available in Docker, started with:

```bash
docker run -d --init --name candidate-story-1-5-candidate-story-1-5-5o2Xgf \
  ubuntu@sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac \
  sleep infinity
```

Container ID: `5a3465cbbf3286c9f17caf1c7d3bff8863256192293af922d6544f9a0b31b70d`. `docker inspect` reported **`Mounts=[]`, `PortBindings={}`**. No source worktree, dependency, browser, npm cache, private/config directory or host HOME was mounted. Only the Git bundle and temporary command drivers were copied with `docker cp`. The image reports Ubuntu **24.04.5 LTS**, `VERSION_ID=24.04`, x86_64; shared host kernel **6.17.0-35-generic**. Docker **29.1.3**, default unprivileged container policy, no published ports, initially normal bridge networking, `--init` for orphan reaping.

Before installation, reviewed the complete official [fnm v1.39.0 installer](https://raw.githubusercontent.com/Schniz/fnm/v1.39.0/.ci/install.sh): versioned GitHub binary download, curl/unzip, user-directory writes, `--release` and `--skip-shell` behavior. Installer SHA-256 **`a732195fcf0e69199a21043b9e987a0240d4b12488850c6b13abf2b3b517b522`** matched the independently downloaded container copy. Also reviewed the versioned [Playwright Noble native dependency list](https://raw.githubusercontent.com/microsoft/playwright/v1.64.1/packages/playwright-core/src/server/registry/nativeDeps.ts) before choosing the guide's explicit OS packages. No curl-to-shell, install-deps, with-deps or unreviewed installer execution occurred.

Explicit **container-root administrator** commands were `cat /etc/os-release`, `uname -m`, `id`, `apt-get update`, then these two installations (the guide's sudo commands, with root already selected and `DEBIAN_FRONTEND=noninteractive`):

```bash
apt-get install --yes git curl ca-certificates unzip xz-utils less
apt-get install --yes bsdutils util-linux procps iproute2 \
  fonts-liberation fonts-noto-color-emoji \
  libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libatspi2.0-0t64 \
  libcairo2 libcups2t64 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0t64 \
  libnspr4 libnss3 libpango-1.0-0 libx11-6 libxcb1 libxcomposite1 \
  libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2
useradd --create-home --uid 1001 --shell /bin/bash rehearsal
chown rehearsal:rehearsal /tmp/candidate.bundle
apt-cache policy git
```

All exited 0. Git was **`1:2.43.0-1ubuntu7.4`** from Ubuntu Noble security, executed as **2.43.0**. Apt's transitive OS dependencies included Python; application commands did not require/activate it, uv or BMAD mode. Service-start suppression/no-runlevel messages were container provisioning notices, not application failures. These package changes affected only this container, never the host.

All subsequent application commands ran as **UID/GID 1001 `rehearsal`**, no sudo. Fresh HOME `/home/rehearsal` initially contained only Ubuntu skeleton `.bashrc`, `.bash_logout`, `.profile`; no fnm/Node/npm, application packages, config, browser, cache or D1. The administrator-created user above, not the Docker default/root or host UID, was selected explicitly. To replay normal-user commands after provisioning, with `C` set to your own disposable container ID:

```bash
docker exec --user rehearsal --workdir /home/rehearsal "$C" \
  env -i HOME=/home/rehearsal USER=rehearsal SHELL=/bin/bash \
  PATH=/usr/local/bin:/usr/bin:/bin TERM=dumb bash -c 'id; printf "HOME=%s\\n" "$HOME"'
# Expected: uid=1001(rehearsal) gid=1001(rehearsal), HOME=/home/rehearsal.
# For each historical /tmp/DRIVER.sh copied into the container, the invocation was:
docker exec --user rehearsal --workdir /home/rehearsal "$C" \
  env -i HOME=/home/rehearsal USER=rehearsal SHELL=/bin/bash \
  PATH=/usr/local/bin:/usr/bin:/bin TERM=dumb bash /tmp/DRIVER.sh
```

`--user rehearsal` resolves the container account independently of the host UID. UID 1001 was unused in this pinned image before `useradd`; on a differently provisioned image, an administrator must select a free non-root UID and use the resulting account/HOME consistently.

Drivers were temporary transcripts, not a repository bootstrap framework. `set -euxo pipefail` recorded commands and stopped on unexpected failure. Normal acquisition/setup/checks came from the linked guides; automation replaced pager/approval with the prior complete installer review and supplied two owned PTYs/headless browser instead of a desktop operator. No ambient credentials or host user settings were forwarded.

## Acquisition, configuration and checks — commands/results

After cloning, `id`, HOME/PATH display, initial HOME inventory and `! command -v node/npm/fnm` confirmed the clean normal-user starting state. The gate run before acquisition deliberately exited **1**, identifying missing Node/npm and pointing to the workstation guide. Then:

```bash
cd "$HOME/dev/candidate-copilot"
export PROJECT_ROOT="$PWD"
FNM_SETUP_DIR=$(mktemp -d)
curl --fail --show-error --location \
  https://raw.githubusercontent.com/Schniz/fnm/v1.39.0/.ci/install.sh \
  --output "$FNM_SETUP_DIR/install.sh"
sha256sum "$FNM_SETUP_DIR/install.sh"  # reviewed hash above
bash "$FNM_SETUP_DIR/install.sh" --release v1.39.0 \
  --install-dir "$HOME/.local/share/fnm" --skip-shell
rm -rf -- "$FNM_SETUP_DIR"
# Added exactly once to this new user's .bashrc; also executed in current shell:
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env --use-on-cd --shell bash)"
fnm --version
NODE_VERSION=$(cat .node-version)
NODE_DEFAULT_BEFORE=$(fnm default 2>/dev/null || true)
fnm install "$NODE_VERSION" &&
{ if [[ -z $NODE_DEFAULT_BEFORE ]]; then fnm unalias default; fi; } &&
fnm use "$NODE_VERSION"
hash -r
node --version
npm --version
test "$(fnm default 2>/dev/null || true)" = "$NODE_DEFAULT_BEFORE"
bash scripts/check-workstation.sh
```

All exit 0: **fnm 1.39.0, Node v24.22.0, bundled npm 11.19.1**; fnm default remained absent. An additional `npm run typecheck` **before** dependency installation exited **127**, `tsc: not found`, as the missing-package control. A new clean-environment interactive Bash (`bash -ic`, same HOME, base PATH) entered the clone and repeated `node --version`, `npm --version` and the gate successfully, proving persisted `.bashrc` setup. Expected no-job-control warnings arose because this shell was not attached to a desktop terminal. The real PTY probes below separately passed.

For each later clean shell, fnm PATH/env was initialized and `fnm use "$(cat .node-version)"` selected the pin. Before `npm ci`, assertions confirmed absence of `node_modules`, `.dev.vars`, `.wrangler/state/v3/d1`, `$HOME/.npm/_cacache` and `$HOME/.cache/ms-playwright`.

| Executed command(s), in order | Actual result |
| --- | --- |
| `bash scripts/check-workstation.sh` | Exit 0; Ubuntu 24.04, Git 2.43.0, Node/npm pins pass. |
| `sha256sum package-lock.json src/worker/env.d.ts`; `npm ci`; same hashes again; `git diff --exit-code -- package-lock.json` | Exit 0; **82 packages added, 83 audited** in 2s, zero findings. Both files byte-identical (hashes below). esbuild **0.28.2** and workerd **1.20261019.1** install-script warnings remained unapproved. |
| `test -e .dev.vars || cp -- .dev.vars.example .dev.vars`; `git check-ignore .dev.vars` | Exit 0; optional comment-only copy is ignored; no variables/credentials. |
| `npm run db:types`; `git diff --exit-code -- src/worker/env.d.ts` | Exit 0; binding-only generated declaration unchanged, `DB: D1Database`. |
| `npm run db:init`; `npm run db:check` | Exit 0; local bootstrap migration applied; actual SQL plus exact bootstrap ledger marker pass at `.wrangler/state/v3/d1`. CI supplies noninteractive migration confirmation; no input/login/hosted target. |
| `/usr/bin/script --version`; `dpkg-query -S /usr/bin/script`; `ls -l /dev/ptmx /dev/pts/ptmx`; `findmnt /proc`; `findmnt /dev/pts` | Exit 0; util-linux **2.39.3**, bsdutils ownership, usable procfs/devpts. |
| `/usr/bin/script -q -e -c 'test -t 0 && test -t 1 && test -t 2' /dev/null` | Exit 0; actual stdin/stdout/stderr PTYs, not a presence-only check. |
| `npm run typecheck` | Exit 0; frontend, Worker, tooling all pass. |
| `npm test` | Exit 0; **45 Bash fixtures + 40 Vitest tests in four files** (7.00s Vitest); includes real terminal builds and safety contract for the new exact smoke command. |
| `EMPTY_BROWSER=$(mktemp -d)`; `PLAYWRIGHT_BROWSERS_PATH="$EMPTY_BROWSER" npm run test:d1`; `rmdir "$EMPTY_BROWSER"` | Exit 0; **12 D1 cases passed (1.6m)** before any browser download, with explicitly empty browser path. |
| `npm run build` | Exit 0; frontend and Worker built; only `env.DB (candidate-copilot-local)` binding; Worker `--dry-run: exiting now`, no upload. |
| `node scripts/check-build-isolation.mjs` | Exit 0; both artifacts exclude **22 disposable canaries**. |
| `node scripts/check-build-interactivity.mjs` | Exit 0; **two real protected PTY builds**, fresh/aged accepted settings unchanged; **eight** synthetic prompt/deadline/output/interruption/orphan controls rejected and cleaned. |
| `./node_modules/.bin/playwright --version`; `./node_modules/.bin/playwright install --dry-run chromium`; `./node_modules/.bin/playwright install chromium` | Exit 0; **1.64.1**, independently downloaded Chrome for Testing/headless shell **156.0.8078.4**, revision **1248**, FFmpeg **1013** to fresh user cache. |
| `npm run test:smoke` | Exit 0; **6 simulation tests (89ms) followed by 30 Playwright cases (1.8m)**, including all 12 D1 cases. |
| `npm audit --json` | Exit 0; empty vulnerabilities object, **0 info/low/moderate/high/critical**, metadata dependency total 162 (includes platform/optional graph). |
| `npm audit --omit=dev` | Exit 0; **zero findings** separately. Measured advisory result, not a security guarantee. |
| `npm ls --all` | Exit 0; no invalid/missing required peers. Uninstalled optional peers and other-platform binaries are expected, not forced installations. |
| `sha256sum package-lock.json src/worker/env.d.ts`; `git diff --exit-code -- package-lock.json src/worker/env.d.ts`; `git diff --check`; `git status --short`; `ss -ltnp '( sport = :5173 or sport = :8787 )'` | Exit 0; hashes unchanged, no tracked changes/untracked files, no application listeners. |

Unchanged throughout installation, type generation and final controls:

```text
f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f  package-lock.json
4b9b3a1f830bfaa264a06b07fbaa21f3de7fc0323ceb7902321e11eab4d0e785  src/worker/env.d.ts
```

## Clone's own servers, not sanitized test copies

After downloads/audits, **`docker network disconnect bridge "$C"`** succeeded; inspect returned **`NetworkSettings.Networks={}`**. The following direct journey and the final complete smoke rerun succeeded with only loopback available. No hosted endpoint could substitute for a local service.

An ephemeral Node driver, run in `/home/rehearsal/dev/candidate-copilot` with only the fresh HOME/base settings and selected Node PATH, launched **two separate `/usr/bin/script` PTYs** with exactly `npm run dev:worker` and `npm run dev:frontend` (`script -q -e -f -c 'COMMAND' /dev/null`). It did not copy or patch application source, symlink dependencies, initialize a fixture or reuse a server. It used the clone's installed Playwright to inspect the page headlessly. Startup was bounded to 25s, shutdown to 10s; all finished normally.

| Own-clone action/command | Observed result |
| --- | --- |
| Start Worker, then frontend in their own PTYs | Both ready on documented loopback ports. |
| `curl --fail --show-error http://127.0.0.1:8787/api/health` | **200**, exact `{"status":"ok"}`. |
| `curl --fail --show-error http://127.0.0.1:5173/api/health` | **200**, exact same JSON through proxy. |
| Chromium opens `http://127.0.0.1:5173/` | Role `status` is exactly **“Worker disponible.”** |
| Write Ctrl+C (`0x03`) to owned Worker PTY; reload page | Worker closed (PTY exit 0); unavailable message **“Worker indisponible. Rechargez la page pour réessayer.”** in **53ms**, less than 5s. Frontend remains alive. |
| Repeat direct curl | Exit **7**, connection refused. |
| Repeat proxied curl | Exit **22**, HTTP **502**, not frontend-only success. |
| Restart Worker with same command; reload | **“Worker disponible.”** recovered. |
| Close owned browser; Ctrl+C restarted Worker and frontend | Worker PTY exit 0, frontend PTY exit 130. `ss` shows no application listeners. |

Observed browser requests were exclusively `http://127.0.0.1:5173/` application modules, Vite/React client/dependencies, shared health contract, CSS and `/api/health`. Vite's HMR is also loopback. No simulation/database/administrative route was introduced. Health still returns only availability and never executes SQL/model work.

### Portable replay of the own-clone PTY/browser check

The deleted driver's measured transcript is the table above. This self-contained equivalent uses the selected clone's own dependencies/servers, relative module resolution and bounded curls (the original measured curls lacked those deadlines). It was initially syntax-checked only; **the parent subsequently executed this exact block end-to-end** in the second disposable container, as recorded below. After completing provisioning, clone installation and browser acquisition, set `C` to the owned container, ensure ports are free, and disconnect its bridge as above. Do not run this against a developer checkout or delete its D1. On failure, keep the logs and stop/remove only that exact disposable container; the outer timeout is a final bound, not proof of graceful cleanup.

```bash
docker exec --interactive --user rehearsal --workdir /home/rehearsal/dev/candidate-copilot "$C" \
  env -i HOME=/home/rehearsal USER=rehearsal SHELL=/bin/bash \
  PATH=/usr/local/bin:/usr/bin:/bin TERM=dumb bash -s <<'BASH'
set -euo pipefail
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env --shell bash)"
fnm use "$(cat .node-version)"
timeout --signal=TERM 90s node --input-type=module <<'JS'
import { spawn, execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(join(process.cwd(), 'node_modules/playwright/index.mjs')).href);
const servers = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function bounded(promise, ms) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Deadline ${ms}ms`)), ms);
    })]);
  } finally { clearTimeout(timer); }
}
function start(name) {
  console.log(`$ /usr/bin/script -q -e -f -c 'npm run ${name}' /dev/null`);
  const child = spawn('/usr/bin/script', ['-q', '-e', '-f', '-c', `npm run ${name}`, '/dev/null']);
  const server = { name, child, closed: false };
  server.done = new Promise((resolve) => child.once('close', (code, signal) => {
    server.closed = true;
    resolve({ code, signal });
  }));
  for (const stream of [child.stdout, child.stderr]) stream.on('data', (bytes) =>
    appendFileSync(`/tmp/own-clone-${name}.log`, bytes));
  servers.push(server);
  return server;
}
async function ready(server, url) {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    assert.equal(server.closed, false, `${server.name} exited before ready`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(750) });
      await response.body?.cancel();
      if (response.ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error(`Startup deadline: ${url}`);
}
async function stop(server) {
  if (server.closed) return;
  console.log(`Ctrl+C to owned ${server.name} PTY`);
  server.child.stdin.write('\x03');
  const result = await bounded(server.done, 10000);
  assert.equal(result.signal, null);
  assert.ok([0, 130].includes(result.code));
  console.log(`${server.name} closed: ${JSON.stringify(result)}`);
}
function curl(port, expectedExit = 0) {
  const url = `http://127.0.0.1:${port}/api/health`;
  const args = ['--fail', '--show-error', '--connect-timeout', '2', '--max-time', '5', url];
  console.log('$ curl ' + args.join(' '));
  let output, code = 0;
  try { output = execFileSync('curl', args, { encoding: 'utf8', timeout: 6000 }); }
  catch (error) { code = error.status; }
  assert.equal(code, expectedExit);
  if (code === 0) assert.equal(output, '{"status":"ok"}');
  console.log(`curl exit ${code}${output ? ': ' + output : ''}`);
}
let browser;
try {
  const worker = start('dev:worker');
  await ready(worker, 'http://127.0.0.1:8787/api/health');
  const frontend = start('dev:frontend');
  await ready(frontend, 'http://127.0.0.1:5173/');
  curl(8787); curl(5173);
  browser = await chromium.launch({ headless: true, timeout: 10000 });
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(10000);
  const requests = new Set();
  page.on('request', (request) => requests.add(request.url()));
  const available = () => page.getByRole('status').filter({ hasText: /^Worker disponible\.$/ }).waitFor();
  await page.goto('http://127.0.0.1:5173/');
  await available();
  console.log('PASS: own-clone Worker disponible.');
  await stop(worker);
  const startTime = Date.now();
  await page.reload();
  await page.getByRole('status').filter({ hasText: 'Worker indisponible. Rechargez la page pour réessayer.' }).waitFor();
  assert.ok(Date.now() - startTime < 5000);
  console.log(`PASS: stopped Worker unavailable in ${Date.now() - startTime}ms.`);
  curl(8787, 7); curl(5173, 22);
  const restarted = start('dev:worker');
  await ready(restarted, 'http://127.0.0.1:8787/api/health');
  await page.reload();
  await available();
  console.log('PASS: own-clone restart/reload recovered.');
  assert.ok([...requests].every((url) => new URL(url).hostname === '127.0.0.1'));
  console.log([...requests].sort().join('\n'));
} finally {
  const cleanup = await Promise.allSettled([
    ...servers.toReversed().map(stop),
    ...(browser ? [bounded(browser.close(), 2000)] : []),
  ]);
  const failed = cleanup.find((result) => result.status === 'rejected');
  if (failed) throw failed.reason;
}
const listeners = execFileSync('ss', ['-H', '-ltnp', '( sport = :5173 or sport = :8787 )'], { encoding: 'utf8' });
assert.equal(listeners.trim(), '');
console.log('PASS: no application listeners; own PTYs and browser closed.');
JS
BASH
```

Expected replay transcript: both curls exit 0 with exact JSON; page available; Ctrl+C Worker; unavailable within 5s; direct curl 7 and proxy curl 22; restart/reload available; close browser and both owned PTYs; empty listener assertion. Record fresh timing/exit output rather than copying the historical 53ms measurement.

## Disposable simulation failure and reset controls

A **separate** `git clone --no-local "$PROJECT_ROOT" "$CONTROL/project"` was made under `CONTROL=$(mktemp -d)`. This control alone reused the container-installed packages via per-package symlinks; it is not fresh-install evidence. Its manifest/smoke command was not changed. The exact executed control was:

```bash
mkdir -p "$CONTROL/project/node_modules/.bin"
for package in "$PROJECT_ROOT"/node_modules/*; do
  ln -s "$package" "$CONTROL/project/node_modules/"
done
ln -s "$PROJECT_ROOT/node_modules/.bin/vitest" "$CONTROL/project/node_modules/.bin/vitest"
export SMOKE_CONTROL_MARKER="$CONTROL/playwright-executed"
printf '#!/bin/sh\nprintf "Playwright reached\\n" > "$SMOKE_CONTROL_MARKER"\n' \
  > "$CONTROL/project/node_modules/.bin/playwright"
chmod u+x "$CONTROL/project/node_modules/.bin/playwright"
"$CONTROL/project/node_modules/.bin/playwright"  # positive tripwire check
test -s "$SMOKE_CONTROL_MARKER"
rm -- "$SMOKE_CONTROL_MARKER"
sed -i 's/Simulated LLM: bootstrap-pong/DELIBERATE_SIMULATION_FAILURE/' \
  "$CONTROL/project/src/adapters/llm/simulated.ts"
cd "$CONTROL/project"
set +e
npm run test:smoke > "$CONTROL/failure.log" 2>&1
CONTROL_EXIT=$?
set -e
cat "$CONTROL/failure.log"
test "$CONTROL_EXIT" -eq 1
test ! -e "$SMOKE_CONTROL_MARKER"
cd "$PROJECT_ROOT"
rm -rf -- "$CONTROL"
```

Result: **exit 1**, exact-output simulation assertion failed (**1 failed, 5 passed**). The previously proven working Playwright tripwire **was not invoked**. Thus `&&` prevents a simulation failure from reporting smoke success or reaching Playwright. The primary tested clone remained unmodified.

The warned [D1-only procedure](application.md#d1-diagnosis-and-destructive-local-only-reset) was also executed on the **disposable primary clone only**, after all own servers/browser/one-shots stopped:

```bash
ss -ltnp '( sport = :5173 or sport = :8787 )'  # empty
npm run db:init  # safe rerun: no migrations to apply, SQL/marker pass
mkdir -p .wrangler/state/v3
printf 'OTHER_LOCAL_STATE\n' > .wrangler/state/v3/keep.txt
pwd -P
realpath -- .wrangler/state/v3/d1
# Reviewed /home/rehearsal/dev/candidate-copilot/.wrangler/state/v3/d1:
rm -r -- .wrangler/state/v3/d1  # destructive; disposable data only
grep -Fx OTHER_LOCAL_STATE .wrangler/state/v3/keep.txt
npm run db:init
npm run db:check
grep -Fx OTHER_LOCAL_STATE .wrangler/state/v3/keep.txt
rm -- .wrangler/state/v3/keep.txt
```

All exit 0. Only D1 was deleted; the other-state sentinel survived, bootstrap migration reapplied and SQL/marker checks passed. No developer D1 was inspected, copied or reset.

**Historical snapshot retest:** with networking still disconnected and no patch in the primary clone, repeated `npm run test:smoke`: **6 simulation + all 30 Playwright cases passed (1.8m Playwright)**. Then `sha256sum package-lock.json src/worker/env.d.ts`, `git diff --exit-code`, `git diff --check`, `git status --short` passed unchanged/empty. These results precede the review corrections, including the newly registered behavioral regression. Corrected-source full verification is assigned to the parent; this snapshot is not its result.

## Matrix coverage

| Spec row | Executed evidence (not inherited Story 1.4 results) |
| --- | --- |
| Fresh journey, no carried state | Empty normal-user HOME/caches/config/dependencies/D1; independently downloaded fnm/Node/npm, apt packages and browser; genuine Git bundle clone; gate, locked install, types/init/check, all validation commands and own-server PTY/browser journey pass. No first failing normal step remained. |
| Smoke/free ports | Both full runs pass **6 + 30**; simulation exact repeat/unsupported/network-forbidden tests run before Playwright. Workerd scheduled handler executes private SQL helper, with independent-storage/missing-binding/wrong-marker controls; CLI/proxy persistence checked separately. Deliberate simulation mutation exits 1 before working Playwright tripwire. |
| Missing/wrong tools/packages | Actual pre-acquisition gate exits 1 for missing Node/npm; actual pre-install typecheck exits 127 for missing tsc; documented acquisition/ci correct them. All **45** disposable toolchain fixtures pass, including old/malformed/broken/missing tools and historical Node/npm rejection; safety/type/build checks pass after locked installation. |
| Occupied port | Both retained browser-suite controls pass: `dev:frontend` and `dev:worker` reject their occupied ports, leaving the control's unrelated listener alive. No unknown listener is killed, reused or bypassed. |
| Wrong config/binding | All **12** D1 regressions pass (three executions: browser-free and both smoke runs): missing/renamed/wrong identity/remote/preview/additional binding/ledger-pattern controls, inherited selectors, missing/malformed SQL, later migration exactly-once/transactional-failure preservation, unusable storage/proxy failure, exact marker and actual Worker-binding SQL. Also failed Worker compilation, malformed/stalled health and StrictMode controls pass; health remains availability-only. |
| Local reset, stopped writers | Own disposable clone's exact warned D1-only reset above passes with other-state sentinel preserved. Retained disposable D1 reset and interruption/cleanup regressions also pass. Never applied to source/developer data. |

## Downloads versus runtime traffic; limits

Acquisition needs Internet: Ubuntu `archive.ubuntu.com`/`security.ubuntu.com` package indexes/packages, `raw.githubusercontent.com` versioned installer/dependency-list review, GitHub fnm release (including its release-asset redirect), `nodejs.org/dist` Node **24.22.0** archive, `registry.npmjs.org` locked packages/platform binaries and audit requests, and `cdn.playwright.dev` browser/FFmpeg downloads (normal CDN redirects). Repository acquisition here was a local Git bundle transfer, not a claim about a developer's Git-host authorization/network. No global-tool update, login, model download or Cloudflare resource provisioning occurred.

Application runtime is loopback: browser → Vite → Worker, Worker/local binding → workerd/SQLite. Direct own-clone journey plus final complete smoke passed with Docker's external network disconnected; simulation tests separately forbid observed fetch/http/https/net transports. This establishes no external network **requirement** for this measured local runtime, not a packet-capture/security proof against every hypothetical attempted background connection. Downloads/audit calls are not model/application traffic.

This is an **x86_64 headless Ubuntu container rehearsal**, sharing the host kernel, not a graphical workstation installation, manual browser/pager UX check, other architecture/OS support or browser sandbox assurance. Playwright's existing launch policy is unchanged. Bootstrap checks prove component plumbing only: no real model behavior, grounding/retrieval, business Conversation pipeline, hosted operation, production-security or recruiter/launch readiness is established. Optional BMAD tooling is outside this application journey. The historical snapshot's required checks passed; the independently tested reviewed-source result is recorded in the final section below.

## Cleanup and final state

Before container removal, these commands all passed:

```bash
test -z "$(git ls-files .wrangler .dev.vars content/private node_modules dist test-results playwright-report)"
ss -ltnp '( sport = :5173 or sport = :8787 )'
ps -u rehearsal -o pid,ppid,args
find /tmp -maxdepth 1 -type d -name 'candidate-copilot-*' -print
```

No tracked runtime/private paths, application listeners, fixture directories or owned runtime survivors. `ps` showed only the executing check shell and `ps` itself. Own browser and PTYs closed before these checks; mutation fixture was removed only after its command exited. Ignored local D1/config/dependencies/browser caches/build/test output existed only inside the owned container.

The five source files were compared with the snapshot using `cmp -- "$f" "$R/snapshot/$f"` (all exit 0). Then exact owned resources were removed (all commands exit 0, subsequent container inspection confirmed absence):

```bash
C=5a3465cbbf3286c9f17caf1c7d3bff8863256192293af922d6544f9a0b31b70d
R=/tmp/candidate-story-1-5-5o2Xgf
docker stop "$C"
docker rm "$C"
test "$R" = /tmp/candidate-story-1-5-5o2Xgf
rm -rf -- "$R"  # owned snapshot, bundle, drivers and logs only
rm -- /tmp/candidate-story-1-5-path
test ! -e "$R"
git rev-parse HEAD
git diff --check
sha256sum package-lock.json src/worker/env.d.ts
ss -ltnp '( sport = :5173 or sport = :8787 )'
git status --short
```

The preexisting Ubuntu image was retained. Source HEAD stayed `fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391`; source hashes remained unchanged, whitespace checks passed, no application listener remained, and only these deliverables plus the preexisting sprint-status/spec work appeared in source status. No host tool/default, real private/env file or developer D1 was used. Cleanup never used broad process/directory matching.

## Reconstruct the historical candidate without source-history changes

**Historical recipe; its current-file assumptions no longer hold after human feedback.** The original disposable repository/bundle was deleted, not published. The recipe below was checked with the **pre-feedback reviewed revision** of the five files and the retained first-review delta. It must not copy the newly corrected guides/safety test from today's worktree: those bytes no longer match. Use only a checkout of the corresponding pre-feedback revision whose restored files pass every recorded SHA-256 and exact tree/commit check. The old claim that three nonguide files were unchanged applied only before the new safety-test coverage. New fixture-regression files and this evidence file remain excluded from that historical tree.

For historical reproduction only, use that matching pre-feedback checkout and its corresponding evidence; replace `SOURCE_REPO` with that checkout's absolute path. This creates objects/commits/bundles **only in a disposable clone**, never changes source branches/history/index, downloads nothing and installs nothing. The trap deletes only its own mktemp directory. Reconstruction is not a new application verification run.

```bash
(
set -euo pipefail
SOURCE_REPO=/absolute/path/to/candidate-copilot
EVIDENCE="$SOURCE_REPO/docs/development/fresh-clone-verification.md"
REBUILD=$(mktemp -d /tmp/candidate-historical-rebuild-XXXXXX)
trap 'rm -rf -- "$REBUILD"' EXIT
git clone --no-local --no-checkout "$SOURCE_REPO" "$REBUILD/snapshot"
git -C "$REBUILD/snapshot" checkout --detach fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391
for f in package.json tests/bootstrap/safety.test.ts .dev.vars.example \
  docs/development/workstation.md docs/development/application.md; do
  cp -- "$SOURCE_REPO/$f" "$REBUILD/snapshot/$f"
done
awk '/^<!-- BEGIN review-delta -->$/{copy=1;next}
     /^<!-- END review-delta -->$/{copy=0}
     copy && $0 != "````diff" && $0 != "````" {print}' "$EVIDENCE" \
  > "$REBUILD/review-delta.patch"
git -C "$REBUILD/snapshot" apply --unidiff-zero --reverse --check "$REBUILD/review-delta.patch"
git -C "$REBUILD/snapshot" apply --unidiff-zero --reverse "$REBUILD/review-delta.patch"
cd "$REBUILD/snapshot"
sha256sum --check <<'HASHES'
d2cf3aff101eeab38b1236d2d40927b738713324dbcf3c26f894f67b0951237c  package.json
74e2dad1bc0688cc3c78a49e7e377d71e8158cd63c8115e60e42f827dd651440  tests/bootstrap/safety.test.ts
bee5d87da2f2fceb07228924dba0b042c2fd1645c256e4f2d5f4ef4cb0c8f7d8  .dev.vars.example
dd035c9555bda03785a1df70c1574ce01f36450224a2ebdae07fd4e7125644c8  docs/development/application.md
360d3cf7bad00d2d8e1a6eeac69555f3b04407f97bc6604a7cf2653f52ab3f82  docs/development/workstation.md
HASHES
git add -- package.json tests/bootstrap/safety.test.ts .dev.vars.example \
  docs/development/workstation.md docs/development/application.md
TREE=$(git write-tree)
test "$TREE" = 498ea8f4835d0143a88800b417ac41b07b0f02b3
REV=$(printf '%s\n' 'Story 1.5 candidate snapshot for fresh-clone verification' | \
  env GIT_AUTHOR_NAME='Disposable verification' GIT_AUTHOR_EMAIL='verification@example.invalid' \
  GIT_COMMITTER_NAME='Disposable verification' GIT_COMMITTER_EMAIL='verification@example.invalid' \
  GIT_AUTHOR_DATE='2026-10-20T12:12:26+02:00' GIT_COMMITTER_DATE='2026-10-20T12:12:26+02:00' \
  git commit-tree "$TREE" -p fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391)
test "$REV" = a22838b2fcbc1878db9afcee6b4a2efb7e09009c
git update-ref HEAD "$REV"  # detached HEAD in disposable clone only
git bundle create "$REBUILD/reconstructed.bundle" HEAD
git clone "$REBUILD/reconstructed.bundle" "$REBUILD/clone-check"
test "$(git -C "$REBUILD/clone-check" rev-parse HEAD)" = "$REV"
printf 'Reconstructed historical tree=%s commit=%s\n' "$TREE" "$REV"
cd "$SOURCE_REPO"  # leave owned temp directory before trap removes it
)
```

Expected: all five hash checks `OK`, tree `498ea8f4835d0143a88800b417ac41b07b0f02b3`, commit `a22838b2fcbc1878db9afcee6b4a2efb7e09009c`, genuine bundle-clone revision matches, and no reconstruction directory remains. Bundle bytes need not match the original pack encoding; the Git commit/tree/content must. This reconstruction and the focused registered smoke-failure regression/tooling typecheck were checked after review. The parent subsequently reran this exact reconstruction and executed the portable PTY/browser recipe plus full corrected-source verification, recorded below.

<details>
<summary>Review delta to reverse for historical guide content</summary>

<!-- BEGIN review-delta -->
````diff
diff --git a/docs/development/application.md b/docs/development/application.md
index f520b96..c43015c 100644
--- a/docs/development/application.md
+++ b/docs/development/application.md
@@ -106 +106 @@ Require readable same-user `/proc` (including `self/stat` and `self/environ`) an
-In **each** terminal, enter the clone, initialize fnm per the workstation guide and select `.node-version` (no default changes):
+In **each** terminal, initialize the clone path explicitly (new terminals do not inherit another shell's export; replace the example path), initialize fnm per the workstation guide and select `.node-version` (no default changes):
@@ -108,0 +109 @@ In **each** terminal, enter the clone, initialize fnm per the workstation guide
+export PROJECT_ROOT="$HOME/dev/candidate-copilot"
@@ -122,2 +123,2 @@ Open **http://127.0.0.1:5173/**. The French technical shell should show “Worke
-curl --fail --show-error http://127.0.0.1:8787/api/health
-curl --fail --show-error http://127.0.0.1:5173/api/health
+curl --fail --show-error --connect-timeout 2 --max-time 5 http://127.0.0.1:8787/api/health
+curl --fail --show-error --connect-timeout 2 --max-time 5 http://127.0.0.1:5173/api/health
@@ -141 +142 @@ No combined supervisor, blanket `pkill`, unknown-process killing, login or deplo
-| Missing/inconsistent packages or native binary | `npm ls --all`; `npm config get registry`; `npm config get omit`; `npm cache verify`; `git diff -- package.json package-lock.json` | Fix first download/DNS/CA/permission error; restore matching reviewed manifest/lock and rerun `npm ci` with optional packages. Public registry needs no token. Never disable TLS, dump token-bearing config, delete the lock or install a global bundler. |
+| Missing/inconsistent packages or native binary | `npm ls --all`; `npm config get registry`; `npm config get omit`; `npm cache verify`; `git diff -- package.json package-lock.json` | Fix first download/DNS/CA/permission error; restore matching reviewed manifest/lock and run `npm ci --include=dev --include=optional` to override inherited development/optional dependency omissions. Public registry needs no token. Never disable TLS, dump token-bearing config, delete the lock or install a global bundler. |
diff --git a/docs/development/workstation.md b/docs/development/workstation.md
index 5bdb272..9412845 100644
--- a/docs/development/workstation.md
+++ b/docs/development/workstation.md
@@ -29 +29,8 @@ Use Ubuntu's configured official repositories, not a third-party Git PPA. Keep d
-If the repository is not cloned yet, clone it using its actual authorized URL and enter it. For an existing clone, enter its root now. Set this variable for subsequent commands (replace the example path):
+If the repository is not cloned yet, create its parent directory and clone using its actual authorized URL (replace the placeholder; do not run it literally):
+
+```bash
+mkdir -p "$HOME/dev"
+git clone '<AUTHORIZED_REPOSITORY_URL>' "$HOME/dev/candidate-copilot"
+```
+
+For an existing clone, skip acquisition and enter its root now. Set this variable for subsequent commands (replace the example path):
````
<!-- END review-delta -->

</details>

## Historical reviewed-source full verification

Independent parent run **2026-10-20**, starting **10:47 UTC**; full checks completed **10:52 UTC**, additional disconnected-runtime checks **10:52–10:55 UTC**. This superseded the first snapshot for the then-reviewed source only. It predates the failed human fresh-terminal handoff and does **not** verify the subsequently corrected guide or safety test.

### Exact candidate and acquisition

- Source baseline/unchanged source HEAD: **`fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391`**.
- Actually cloned reviewed candidate: **`8a6c68382b8f792935b4ec39672f1223e29211ba`**, tree **`62e3031e8709d79c0b73f28fb76d5f34131c119f`**, parent the source baseline. Commit message: `Story 1.5 reviewed candidate for independent fresh-clone verification`; author/committer `Disposable verification <verification@example.invalid>`, both dates **`2026-10-20T12:47:57+02:00`**.
- Candidate bundle SHA-256: **`18768f509a6f97ffc1545aa7665b3c17fdf49501880cf38a2c90df45e37c901e`**.
- Exactly seven source files differed from baseline, listed below. Evidence/spec/sprint metadata is deliberately outside that snapshot. After testing, all seven files were compared byte-for-byte with the source checkout using `cmp`; all matched. No source-history/branch change, private/env file read, host installation or developer-state reset occurred.

| Tested file | SHA-256 |
| --- | --- |
| `package.json` | `d2cf3aff101eeab38b1236d2d40927b738713324dbcf3c26f894f67b0951237c` |
| `tests/bootstrap/safety.test.ts` | `74e2dad1bc0688cc3c78a49e7e377d71e8158cd63c8115e60e42f827dd651440` |
| `.dev.vars.example` | `bee5d87da2f2fceb07228924dba0b042c2fd1645c256e4f2d5f4ef4cb0c8f7d8` |
| `docs/development/workstation.md` | `6d1afaffaa308a78efdca15bf214014be2b299719e6c1ecc3068e382c9b2edf9` |
| `docs/development/application.md` | `8c908356590d3590921c61b25526acf3c9a9c9730ca530955328542d1f3160d4` |
| `tests/e2e/local-fixture.ts` | `cc5e042f0afdc73958be30a1457caf526789738a70512dcd2349439bea41555b` |
| `tests/e2e/fixture-controls.spec.ts` | `84127bbb948fa548b96b49a4e69e463d636a8c050f441b183d76b9d3bfc5849b` |

The parent repeated the source-to-snapshot procedure above with these seven files, committed **only in the disposable clone**, and transferred its Git bundle into a new container. Its non-root user genuinely cloned `/tmp/candidate.bundle`; no patch or source/dependency/cache mount was applied to the tested clone.

Environment: same official Ubuntu image digest **`sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac`**, new container **`4c0c8da69629836cf38bbde47a9748b1cb9935eae0f66c30342a1800d9a3c093`**, `--init`, **`Mounts=[]`, `PortBindings={}`**. Explicit administrator provisioning used the exact apt/useradd list above. Fresh UID/GID **1001 `rehearsal`**, HOME `/home/rehearsal`, Ubuntu **24.04.5 LTS/x86_64**, Git **2.43.0**, fnm **1.39.0**, independently acquired Node **24.22.0/npm 11.19.1**. The parent read the complete official versioned fnm installer before execution; the container download matched its SHA-256 above. The original user/default/tools/caches on the host were never used by the container.

Every normal-user phase used the documented `docker exec --user rehearsal ... env -i ...` invocation, fresh base PATH and selected container-local fnm/Node. Before acquisition, Node/npm/fnm were absent; the gate failed with exit 1 as expected. Before packages, typecheck failed with exit 127 (`tsc: not found`). The documented acquisition fixed both; absent fnm default stayed absent, and a new clean-environment interactive Bash with an explicitly initialized `PROJECT_ROOT` passed selection and the gate. Before `npm ci`, assertions confirmed no dependencies, config, D1, npm package cache or Playwright browser cache.

### Executed commands and results

All normal commands exited 0; the deliberate controls are identified separately. The exact command sequence was the acquisition/configuration/check table above, with the current seven-file snapshot and these fresh outcomes:

| Command(s) | Reviewed-source result |
| --- | --- |
| Workstation acquisition and `bash scripts/check-workstation.sh` | PASS; missing tools/package controls corrected, persisted Bash setup works. |
| `sha256sum package-lock.json src/worker/env.d.ts`; `npm ci`; hashes and `git diff --exit-code -- package-lock.json` | PASS; 82 packages installed/83 audited, zero findings, unchanged bytes; no dependency-script approval. |
| Optional comment-only copy; `db:types`; generated diff; `db:init`; `db:check` | PASS; no credentials, exact local SQL/migration marker and unchanged declaration. |
| All documented `/usr/bin/script`, dpkg, devpts and procfs probes | PASS, including actual terminal stdin/stdout/stderr. |
| `npm run typecheck`; `npm test` | PASS; all three typechecks, **45 Bash + 40 Vitest tests**, Vitest 6.92s. |
| Empty `PLAYWRIGHT_BROWSERS_PATH` with `npm run test:d1` | **12 passed (1.5m)** before browser acquisition; disposable empty browser directory removed. |
| `npm run build`; both standalone build verifiers | PASS; dry-run Worker only, 22 canaries, two protected PTY builds and all eight synthetic controls. |
| Pinned Playwright version/dry-run/Chromium install | PASS; **1.64.1**, browser/headless revision **1248**, FFmpeg **1013**, fresh user cache. |
| `npm run test:smoke` | **6 simulation + 31 Playwright cases passed (1.8m)**. The new registered case executes the unchanged smoke command first with real successful simulation and a working Playwright tripwire, then with a genuinely mutated disposable adapter; it observes exit 1 and no tripwire invocation, and closes owned descendants before deletion. |
| `npm audit --json`; `npm audit --omit=dev`; `npm ls --all` | PASS; both audits zero known findings, no invalid/missing required peers. Optional/other-platform entries remain optional. |
| Generated/lock comparisons, `git diff --check`, empty `git status`, tracked-state and listener assertions | PASS; exact original hashes below, no tracked runtime/private files or app listeners. |

The explicitly browser-free subset was exercised before Chromium download as an additional negative prerequisite control; full smoke ran only after documented browser acquisition. No undocumented runtime dependency was supplied.

Unchanged lock/declaration SHA-256: **`f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f`** and **`4b9b3a1f830bfaa264a06b07fbaa21f3de7fc0323ceb7902321e11eab4d0e785`**, respectively.

The parent then disconnected the container bridge (`NetworkSettings.Networks={}`) and executed **the entire portable PTY/browser replay block above**, unmodified. Both bounded curls returned exact 200 health JSON; Chromium displayed available. Ctrl+C stopped only the owned Worker; reload displayed unavailable in **51ms**, direct curl exited **7**, proxy curl **22/HTTP 502**. Restart/reload recovered. Both own PTYs and browser closed, with an empty listener assertion; Worker exits 0 and frontend exit 130 were observed. Every observed browser request was loopback.

A separate disposable loopback handler accepted a connection but deliberately never responded. The documented curl flags `--connect-timeout 2 --max-time 5` exited **28** in **5009ms**; the handler was closed afterward. This confirms that the corrected diagnostic cannot wait indefinitely on that reachable stalled case.

For the omission-repair instruction only, bridge access was temporarily restored for registry/audit traffic. In the same disposable clone, **`npm_config_omit=dev NODE_ENV=production npm ci --include=dev --include=optional`** passed (82 packages, zero findings), both `tsc` and Playwright executables remained present, typechecks passed and lock/declaration bytes stayed unchanged. The bridge was disconnected again before runtime checks.

With every owned writer stopped, the parent repeated the documented **destructive D1-only reset only in this disposable container clone**, explicitly verifying `/home/rehearsal/dev/candidate-copilot/.wrangler/state/v3/d1` before deletion. The unrelated `keep.txt` sentinel survived, initialization/check passed, and the sentinel was removed. The final unmodified candidate smoke then passed again with no external network: **6 simulation + all 31 Playwright cases (1.8m)**, including the recurring genuine-simulation-failure regression. All 12 D1 cases therefore ran three times (browser-free and both smoke runs). Matrix coverage includes the fresh journey, component failures, tool/dependency/port/configuration negatives and warned local reset, not merely test registration.

The parent also executed the exact historical reconstruction recipe above successfully, recovering **`a22838b2fcbc1878db9afcee6b4a2efb7e09009c`** and its exact historical tree. This is artifact reproducibility evidence, not an extra application acceptance claim.

### Reconstruct the pre-feedback reviewed candidate

**Historical recipe, not a reconstruction from today's files.** To reconstruct that pre-feedback tested commit after disposable cleanup, use a checkout whose seven files match its recorded SHA-256 table. The current guides and safety test do not match; copying today's worktree will correctly fail the tree check. This procedure creates objects only in a disposable clone; differing file hashes are not accepted as the same verification. Run only from the matching pre-feedback checkout:

```bash
(
set -euo pipefail
SOURCE_REPO=$(pwd -P)
REBUILD=$(mktemp -d /tmp/candidate-reviewed-rebuild-XXXXXX)
trap 'rm -rf -- "$REBUILD"' EXIT
git clone --no-local --no-checkout "$SOURCE_REPO" "$REBUILD/snapshot"
git -C "$REBUILD/snapshot" checkout --detach fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391
for f in package.json tests/bootstrap/safety.test.ts .dev.vars.example \
  docs/development/workstation.md docs/development/application.md \
  tests/e2e/local-fixture.ts tests/e2e/fixture-controls.spec.ts; do
  cp -- "$SOURCE_REPO/$f" "$REBUILD/snapshot/$f"
done
cd "$REBUILD/snapshot"
git add -- package.json tests/bootstrap/safety.test.ts .dev.vars.example \
  docs/development/workstation.md docs/development/application.md \
  tests/e2e/local-fixture.ts tests/e2e/fixture-controls.spec.ts
TREE=$(git write-tree)
test "$TREE" = 62e3031e8709d79c0b73f28fb76d5f34131c119f
REV=$(printf '%s\n' 'Story 1.5 reviewed candidate for independent fresh-clone verification' | \
  env GIT_AUTHOR_NAME='Disposable verification' GIT_AUTHOR_EMAIL='verification@example.invalid' \
  GIT_COMMITTER_NAME='Disposable verification' GIT_COMMITTER_EMAIL='verification@example.invalid' \
  GIT_AUTHOR_DATE='2026-10-20T12:47:57+02:00' GIT_COMMITTER_DATE='2026-10-20T12:47:57+02:00' \
  git commit-tree "$TREE" -p fc503557c13cb6ebc7bfef9ebd7e305e4dbd4391)
test "$REV" = 8a6c68382b8f792935b4ec39672f1223e29211ba
git update-ref HEAD "$REV"  # detached disposable HEAD only
git bundle create "$REBUILD/candidate.bundle" HEAD
git clone "$REBUILD/candidate.bundle" "$REBUILD/clone-check"
test "$(git -C "$REBUILD/clone-check" rev-parse HEAD)" = "$REV"
printf 'Reconstructed reviewed tree=%s commit=%s\n' "$TREE" "$REV"
cd "$SOURCE_REPO"
)
```

The exact reconstruction was run and passed before final cleanup. No evidence/spec/sprint file participates in its tree.

### Reviewed-run cleanup and scope

Before removal, `git status --porcelain`, `git diff --exit-code`, tracked runtime/private-file and empty-listener assertions all passed. `ps -u rehearsal -o pid,ppid,args` showed only the final check shell and `ps`; no owned runtime survived. `/tmp` had no retained application fixture directories. The source's seven tested files still matched the candidate byte-for-byte.

Owned resources were the exact container above and `/tmp/candidate-story-1-5-parent-final-g3YOXm` (snapshot, bundle, drivers, command logs). The container and directory were stopped/removed after results were recorded; two temporary log copies were retained outside that directory for this session only (`/tmp/candidate-story-1-5-parent-final-verification.log` and `/tmp/candidate-story-1-5-parent-final-controls.log`), not as portable repository prerequisites. No runtime or source snapshot was retained; no broad process kill or developer-data deletion was used. The preexisting image remains. Source HEAD, lockfile and generated declarations stayed unchanged. That run resolved the then-retained review patches; the later human-feedback handoff correction and its independent pre-follow-up full verification are retained in the historical section above. As with the first run, this is headless x86_64 bootstrap evidence, not graphical-workstation usability, real-model/Conversation quality, hosted deployment, production security or launch acceptance.
