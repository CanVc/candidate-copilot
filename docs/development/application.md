# Application foundation — Story 1.2

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

   `npm ci` replaces this copy's `node_modules/`; it must not regenerate the lockfile. Do not substitute `npm install` or delete the lockfile to resolve an installation failure. The selected npm reports unapproved dependency install scripts for esbuild, sharp and workerd; these foundation checks pass without approving them. Do not blindly approve dependency scripts. `npm install-scripts ls` can inspect them if later tooling needs review.

4. **Configuration is optional:** no variables are consumed by this skeleton. `.dev.vars.example` contains comments only and is intentionally tracked. You may copy it to `.dev.vars`, but no copy is needed for any check. Never add real credentials to examples or put server configuration behind `VITE_*`. There is no D1 binding, provider SDK, simulated provider or catalog configuration yet.
5. Run all checks and both narrowly scoped builds:

   ```bash
   npm run typecheck
   npm test
   npm run build
   node scripts/check-build-isolation.mjs
   npm audit                 # inspect findings; current known findings below
   git diff --check
   git status --short
   ```

All commands use package-local executables. Failed assertions, type errors, resolution/download errors and build errors exit nonzero. `npm test` preserves the existing 45 Bash workstation fixtures and adds nine Vitest assertions/cases. It includes the build-isolation check; the separate command is also available for diagnosis. Playwright/browser automation is deferred until browser coverage exists.

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
- Wrangler starts only at `src/worker/index.ts` with compatibility date **2026-06-11**, aligned with Workers types/workerd. There are no static assets, content globs, extra modules or bindings configured.
- `npm run build:frontend` writes **`dist/frontend/`** (HTML, JS, CSS). `npm run build:worker` writes **`dist/worker/`** (Worker JS, source map and Wrangler's output README). The Worker command is always `wrangler deploy --dry-run --env-file /dev/null --outdir dist/worker`, with metrics disabled and `--env-file /dev/null` to prevent Wrangler's default `.env`/`.env.local` loading; despite the CLI verb, it only bundles and never uploads/deploys. No login is needed. Builds clean only their respective output directory, so stale Worker artifacts cannot survive rebundling.

## Private/local material safety

`.gitignore` excludes dependencies, both build outputs, coverage, local virtual environments, `.env*`, `.dev.vars*`, Wrangler state and **all `content/private/`**, including nested example-named files. Only deliberate `.env.example` / `.dev.vars.example` templates are excepted outside private content. There is no tracked private placeholder. Place local preparation documents under `content/private/`, not in application source or frontend assets. Git ignores do not remove already tracked files or constitute a build boundary.

The build boundary is independently checked without consulting Git: `check-build-isolation.mjs` creates its own temporary project, copies application code/config only, shares installed dependencies via a symlink and writes **22 synthetic canaries** across private/public content, preparation documents, tooling directories, env files, shell environment, public asset directories and generated/local state. Temporary frontend-only probes materialize Vite's env object and a synthetic server-secret reference. Builds receive only allowlisted settings and a disposable HOME, never inherited credentials or real user npm configuration. Both real build commands run, and every output file (including Worker source maps) is scanned for raw and base64 marker representations. A direct configuration assertion independently verifies disabled Vite loading/exposure and Wrangler env-file discovery. The script never reads real private content or local env files; it removes only its own temporary directory. Separate disposable Git fixtures check exclusions and allowed templates, while `git ls-files` checks the real tracked path list, including root dist/coverage, without reading private data. The internal build deadline is shorter than the test wrapper's deadline to leave cleanup time.

These checks detect accidental broad inclusion. They do not authorize importing private material, embedding secrets in source or manually deploying a whole repository; review import/configuration changes as well as test results. No application build currently consumes public knowledge or preparation documents. Future publication/deployment needs its own explicitly reviewed allowlist; do not use this story as approval for a hosted build context.

## Dependency choices and official evidence

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

### Known audit findings — not a clean security bill

On **2026-10-19**, `npm audit` exited **1**, reporting **six affected packages (five high, one low)** in the development tooling graph:

- `wrangler 4.100.0` / `miniflare 4.20260611.0` inherit high findings through `sharp 0.34.5`, `undici 7.24.8` and `ws 8.20.1`: image-library vulnerabilities, HTTP/proxy/TLS/cache issues and WebSocket denial of service. Representative advisories: [sharp/libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [undici TLS validation](https://github.com/advisories/GHSA-w293-vg96-wgc3), [ws memory exhaustion](https://github.com/advisories/GHSA-96hv-2xvq-fx4p).
- `esbuild 0.27.3` (also present as Vite's optional peer) has a low [Windows development-server file-read finding](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr). This verification targets Ubuntu and starts no development server, but that does not erase the advisory.

`npm audit --omit=dev` reported **zero findings** at verification time, not a guarantee of runtime security. npm recommends Wrangler **4.151.2** to remediate this chain. Changing the spec's exact pins or adding transitive overrides is not part of this implementation: review an updated toolchain and its peer/engine/compatibility implications before local server work or hosted use, then regenerate and reverify the lock deliberately. Do **not** blindly run `npm audit fix --force`. No untrusted images, live proxy traffic or public dev servers were exercised here; these limitations are not a mitigation guarantee.

## Verification record and limits

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
