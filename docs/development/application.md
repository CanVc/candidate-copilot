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

No combined supervisor, blanket `pkill`, unknown-process killing, login or deployment is part of this journey.

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
