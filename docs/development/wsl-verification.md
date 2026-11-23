# WSL development workstation verification

Verified on **2026-11-17** in the existing Ubuntu 24.04 x86_64 WSL2 installation on Windows. This is a workstation transfer, not a native-Windows application port or a hosted deployment.

**Result:** the Linux development environment and application startup work. The functional checks passed, but the complete documented validation chain is **not green**: the existing dependency lockfile now produces npm audit findings. Manual VS Code/browser acceptance and any old-machine private-data migration remain separate checks.

## Environment and scope

- Linux clone: `/home/cabail/dev/candidate-copilot`, branch `main`.
- Tested source revision: `2886a0aab9ff9e2920249baa3507f98ef6e12cd2`.
- WSL 3.0.5.0; kernel `6.18.58.1-microsoft-standard-WSL2`; NAT networking.
- Git 2.43.0; fnm 1.39.0; Linux Node 24.22.0 and bundled npm 11.19.1; Ubuntu Python 3.12.3; uv 0.11.15.
- The assistant session itself ran on Windows; application/tooling commands were explicitly executed with `wsl -d Ubuntu-24.04`. Node/npm were selected inside WSL, not taken from the inherited Windows PATH.
- User performed the documented administrator package installation. Agent verified all 34 application/toolchain/browser packages were installed, plus readable procfs and usable pseudo-terminals.
- Linux clone had no dependencies or local D1 state initially. `npm ci`, Chromium acquisition and new-clone D1 initialization were performed as the normal user. No existing database was reset.
- No application code, dependency pins, shell profiles, default Node alias, Git history, remote resources or existing Windows-clone source/data files were changed. Windows clone and its untracked preparation document remain in place; assistant tooling may retain ignored runtime caches. No private corpus, secrets, old-machine database, Pi authentication or session state were transferred or inspected.

## Executed checks

Followed [workstation preparation](workstation.md) and the [current application journey](application.md#current-setup-and-checks), not its historical sections.

| Check | Observed result |
| --- | --- |
| Workstation gate, including `--bmad` | PASS; exact pinned Linux tool versions |
| BMAD resolver smoke | PASS; `core.project_name` is `candidate-copilot` |
| Existing Linux Pi CLI | `pi --version` returned 1.5.2 after Node selection; authentication, sessions and extensions not tested |
| OS packages, `/usr/bin/script`, procfs and PTY probe | PASS |
| Locked `npm ci` | PASS; lockfile unchanged; unapproved esbuild/workerd script warnings did not require approval |
| `npm run db:types` and declaration diff | PASS; generated declaration unchanged |
| `npm run db:init`, `npm run db:check` | PASS; local bootstrap migration and SQL marker verified |
| Playwright Chromium installation | PASS; Playwright 1.64.1, Chromium/headless shell revision 1248 |
| `npm run typecheck` | PASS; all four TypeScript configurations |
| `npm test` | PASS; 45 Bash fixtures and 48 Vitest tests |
| `npm run test:d1` | PASS; 12 browser-free D1 cases |
| `npm run build` | PASS; frontend and protected dry-run Worker builds; nothing deployed |
| Standalone build isolation | PASS; 33 disposable canaries excluded |
| Standalone build interactivity | PASS; two protected real PTY builds and eight synthetic prompt/cleanup controls |
| `npm run test:smoke` | PASS; 6 simulation cases followed by 31 Playwright cases |
| `npm audit --json` | **FAIL, exit 1**; 4 affected package entries: 3 moderate, 1 high |
| Diagnostic `npm audit --omit=dev --json` | **FAIL, exit 1**; Hono, moderate; no high/critical production-package entries |
| Diagnostic `npm ls --all` | PASS; required packages resolve; absent optional/platform packages are expected |
| Additional authoring regression | PASS; 42 Python unittest cases using synthetic/disposable data |
| Lock/declaration diffs and `git diff --check` | PASS; no tracked changes at the time of checking |

The documented fail-fast validation chain stopped at the full audit. Production audit, dependency resolution, authoring regression, integrity inspections and own-server checks were then run as explicit diagnostics; they do not turn the failed chain into a successful one.

SHA-256 after installation and testing:

```text
f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f  package-lock.json
4b9b3a1f830bfaa264a06b07fbaa21f3de7fc0323ceb7902321e11eab4d0e785  src/worker/env.d.ts
```

## Own-clone startup and Windows access

Temporary diagnostic scripts outside the repository started the real clone's existing `dev:worker` and `dev:frontend` commands in separate PTYs, with explicit clean Bash/fnm initialization and the workstation gate in each. They did not use the smoke suite's copied application fixtures or reuse an existing listener.

Observed:

1. Worker direct health on `127.0.0.1:8787` and frontend-proxied health on `127.0.0.1:5173` returned `{"status":"ok"}` from WSL.
2. Windows `C:\Windows\System32\curl.exe` reached both endpoints through `127.0.0.1`, proving host-to-WSL HTTP access without exposing the servers on the LAN.
3. Linux headless Chromium showed `Worker disponible.`; after stopping the owned Worker it showed `Worker indisponible. Rechargez la page pour réessayer.`; restarting the Worker restored the available state.
4. Owned startup processes were stopped; ports 5173 and 8787 were free afterward.

The first Windows HTTP attempt failed while WSL HTTP worked. A second run with a bounded connection retry succeeded on IPv4 for both ports. No firewall, listening address, WSL network mode or port-forwarding configuration was changed. This proves eventual successful access, not a diagnosed root cause or a guarantee of immediate forwarding on every fresh start.

The successful later diagnostic was invoked as `wsl -d Ubuntu-24.04 -- /bin/bash /tmp/candidate-copilot-wsl.naSWxGqB/own-startup.sh`. That was a temporary test script, not a delivered daily-development entrypoint. The initial failing diagnostic and the later successful run are distinct executions. Sanitized stdout from the **successful later run** is retained here rather than depending on temporary files:

```text
Using Node v24.22.0
PASS own-clone direct and proxied health from WSL
PASS Windows curl.exe -> WSL via 127.0.0.1:8787: {"status":"ok"}
PASS Windows curl.exe -> WSL via 127.0.0.1:5173: {"status":"ok"}
PASS own-clone Chromium UI: Worker disponible.
PASS own-clone Chromium UI: Worker indisponible. Rechargez la page pour réessayer.
PASS own-clone Chromium UI: Worker disponible.
PASS own-clone Worker stop/restart/recovery
PASS owned startup processes stopped; ports 5173/8787 free
```

To reproduce HTTP acceptance without the temporary harness, start the two terminals as described below, then run in **Windows PowerShell**:

```powershell
curl.exe --noproxy "*" --fail --show-error --connect-timeout 3 --max-time 5 http://127.0.0.1:8787/api/health
curl.exe --noproxy "*" --fail --show-error --connect-timeout 3 --max-time 5 http://127.0.0.1:5173/api/health
```

Both must return `{"status":"ok"}`. Compare the same URLs using Linux `curl` in WSL if Windows access fails. Use the browser stop/restart/shutdown checks below for the observable UI journey. The automated diagnostic stopped its owned processes with SIGTERM and bounded SIGKILL escalation; it did **not** test the human Ctrl+C keystroke path.

Windows browser rendering and graphical editor usability were **not** observed by the agent. Linux Chromium plus Windows HTTP access are not substitutes for those human checks.

## Dependency audit blocker

These are findings against the **unchanged, pre-existing lockfile**, not evidence of a WSL-specific regression or proof that every advisory is exploitable by this bootstrap application:

- `hono@4.13.13`: moderate findings; affects the production dependency audit.
- `undici@7.29.1`, through `miniflare@5.20261019.0-beta` and `wrangler@4.151.2`: high findings on Undici and propagated moderate package entries on Miniflare/Wrangler; development-tool dependency chain.
- npm reported Hono **4.13.19** and Wrangler **4.163.0** as available remediation candidates on this date. They have **not** been installed or validated here. Inspect current advisory ranges and compatibility before choosing updates; these numbers are evidence, not an update instruction.

The following identifiers and affected ranges were recorded by the failing full audit on this date. Package-level counts summarize maximum severity per affected package, not the number of distinct advisories. The linked upstream records may change later.

| Package | Advisory | Recorded affected range |
| --- | --- | --- |
| Hono | [GHSA-4m76-xfj5-7975](https://github.com/advisories/GHSA-4m76-xfj5-7975) | `<4.13.16` |
| Hono | [GHSA-h7mg-cq63-vhpq](https://github.com/advisories/GHSA-h7mg-cq63-vhpq) | `>=4.1.4 <=4.13.15` |
| Hono | [GHSA-3gg2-335m-rxc6](https://github.com/advisories/GHSA-3gg2-335m-rxc6) | `>=3.12.0 <=4.13.15` |
| Hono | [GHSA-46wx-v44x-9hh2](https://github.com/advisories/GHSA-46wx-v44x-9hh2) | `<4.13.16` |
| Hono | [GHSA-4h7h-rv7c-7m2v](https://github.com/advisories/GHSA-4h7h-rv7c-7m2v) | `>=4.5.1 <=4.13.15` |
| Undici | [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) | `>=7.0.0 <7.30.1` |
| Undici | [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472) | `>=7.15.0 <7.30.1` |
| Undici | [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) | `>=7.18.0 <7.30.1` |
| Undici | [GHSA-4w7w-5xrc-9h26](https://github.com/advisories/GHSA-4w7w-5xrc-9h26) | `>=7.0.0 <7.30.1` |
| Undici | [GHSA-2m5v-pch6-74hx](https://github.com/advisories/GHSA-2m5v-pch6-74hx) | `>=7.0.0 <7.30.1` |
| Undici | [GHSA-qrxm-fqhp-jwvm](https://github.com/advisories/GHSA-qrxm-fqhp-jwvm) | `>=7.0.0 <7.30.1` |
| Undici | [GHSA-9fm3-97px-rjf6](https://github.com/advisories/GHSA-9fm3-97px-rjf6) | `>=7.0.0 <7.30.1` |
| Undici | [GHSA-55wc-3pg8-jfw6](https://github.com/advisories/GHSA-55wc-3pg8-jfw6) | `>=7.15.0 <7.30.1` |

Do not run `npm audit fix --force`, approve dependency scripts, replace the lockfile or weaken verification to declare the migration green. An explicitly scoped dependency-maintenance change should assess/update the pins and lockfile and rerun the entire documented chain. Until then, installation is usable but the zero-finding audit acceptance remains blocked. The older Ubuntu evidence remains historical; it does not describe today's registry advisories.

## Daily opening and human acceptance

No reinstall, `sudo` or manual VM management is normally required for routine development. WSL starts when the remote project is opened. From **Windows PowerShell**:

```powershell
code --remote wsl+Ubuntu-24.04 /home/cabail/dev/candidate-copilot
```

Microsoft's `ms-vscode-remote.remote-wsl` extension is installed on Windows. Verify the window indicator reads **WSL: Ubuntu-24.04**, and that its terminal and Source Control use the Linux clone, not `C:\Dev\Projects\candidate-copilot` or `/mnt/c/...`.

For daily startup, use the repository-local launcher added after the dated workstation rehearsal. In **one VS Code WSL terminal**:

```bash
cd "$HOME/dev/candidate-copilot"
bash scripts/dev.sh
```

It selects the installed pinned Node with fnm, runs the workstation checks and starts **both** services. No pasted initialization block or `WORKSTATION_READY` variable is needed. **Ctrl+C stops both**; if either exits, the launcher stops its sibling and returns nonzero. Read the first error in the shared output. It does not install tools/packages, change shell profiles/defaults, initialize/reset D1 or deploy. It uses ignored local runtime state, so this is not a read-only operation. Wait for startup before checking HTTP; the launcher itself does not wait for health readiness.

For separate logs and the independent Worker stop/recovery exercise, use **two terminals instead of combined mode**:

```bash
# Terminal 1
bash "$HOME/dev/candidate-copilot/scripts/dev.sh" worker
```

```bash
# Terminal 2
bash "$HOME/dev/candidate-copilot/scripts/dev.sh" frontend
```

Each invocation initializes its own toolchain. Do not run combined and separate modes together: they use the same fixed ports. The [application guide](application.md#daily-development-launcher) describes shutdown limits and retains the explicit manual initialization commands for diagnosis/fresh-clone setup.

Open the proven IPv4 URL **http://127.0.0.1:5173/** in the Windows browser. `http://localhost:5173/` is an alternative hostname, but hostname/address-family behavior was not separately verified. The root now opens the local portfolio entry. Follow **Diagnostic technique local** (`/?diagnostic`) for the technical bootstrap page and `Worker disponible.`, not a completed recruiter-facing product. **In separate mode**, stop Worker with Ctrl+C, reload and verify the unavailable message; restart Worker and reload to verify recovery. Stop both separate launchers when finished. **In combined mode**, one Ctrl+C stops both. Then check from WSL:

```bash
ss -ltnp '( sport = :5173 or sport = :8787 )'
```

Expect no listener rows on either application port. If a listener remains, diagnose its owner rather than killing unrelated processes. These startup commands create/use ignored local runtime state; they are not installation-free read-only checks.

### Git identity before future commits

The final read-only check found **no configured Git author identity** in the Linux clone. This does not prevent development/testing, but commits will require the owner's intended identity. Replace the placeholders below with your own values; run in the WSL clone, not globally:

```bash
cd "$HOME/dev/candidate-copilot"
git config --local user.name '<YOUR_NAME>'
git config --local user.email '<YOUR_EMAIL>'
git var GIT_AUTHOR_IDENT
```

The first two commands change only this clone's Git configuration; the last is read-only. No identity was invented or copied from commit authors. No commit/push was performed by this installation task; its evidence documents remain uncommitted.

Before retiring any old environment, the owner must confirm that all required uncommitted/unpushed work, private authoring corpus, secrets and local data are accounted for. A Git clone does not carry ignored/private state. Keep the old clones and machines until that decision; no such deletion or transfer was attempted here.

## Remaining acceptance work

- Owner: graphical VS Code WSL and Windows-browser workflow checks above, including Ctrl+C shutdown and freed-port inspection; configure the intended local Git identity before committing; decide whether any old-machine private state needs transfer.
- Dependency maintenance: resolve the full and production audit findings, then rerun the entire documented validation chain. This is an existing-package issue, not an Ubuntu installation task; no dependency update is silently accepted by this record.
- The assistant used explicit WSL commands from a Windows session. Migrating its own Pi installation, credentials, extensions and sessions is not covered by this record.
- No hosted deployment, model/provider integration or product readiness was tested or claimed.

## References

- [Microsoft: WSL file storage and performance](https://learn.microsoft.com/en-us/windows/wsl/filesystems)
- [Microsoft: WSL networking and localhost access](https://learn.microsoft.com/en-us/windows/wsl/networking)
- [VS Code: development in WSL](https://code.visualstudio.com/docs/remote/wsl)
