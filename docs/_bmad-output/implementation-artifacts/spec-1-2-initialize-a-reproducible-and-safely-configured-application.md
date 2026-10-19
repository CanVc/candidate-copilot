---
title: 'Story 1.2: Initialize a Reproducible and Safely Configured Application Skeleton'
type: 'chore'
created: '2026-10-19'
status: 'done'
baseline_commit: '21e60d0864d694848206f54809918570f24f7d41'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The workstation lacks a reproducible, safely configured application skeleton.

**Approach:** Establish layered TypeScript/React/Vite/Hono/Worker foundations, locked installation and credential-free checks. Protect private material independently of Git ignores.

## Boundaries & Constraints

**Always:** Target Ubuntu 24.04 with Story 1.1's Node 24.22.0/npm 11.19.1. Use one private npm package and committed lockfile, strict environment-specific TypeScript checks, native CSS/tokens, nonsensitive example configuration and narrowly scoped frontend/Worker builds. Preserve existing tooling and tests. Empty future layers get explanatory placeholders, not speculative interfaces. Record official dependency evidence/date and actual verification limitations.

**Never:** Implement business behavior, schemas, catalog/content publication, provider calls/SDKs, startup orchestration, `/api/health`, simulation, D1 initialization/bindings or hosted deployment. Those belong to later stories. Do not require credentials, Python activation, global tool/default changes or sudo. Never include `content/private/`, local secrets, environment files, preparation documents or generated runtime state in application build inputs/output. Do not expose server configuration through browser variables.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Installation | Fresh copy, verified tools, registry access | `npm ci` installs the locked graph without lockfile changes or credentials | Failed resolution/download exits nonzero; document diagnosis |
| Foundation | Installed seed, no services/database | Typecheck, tests and separate frontend/Worker builds pass | Invalid types, failed assertions or bundling fail nonzero |
| Private/local material | Disposable fixtures containing private files, secrets and generated state | Git ignores sensitive paths; neither application bundle includes their content | Regression checks detect accidental inclusion |
| Minimal behavior | Static React render; in-process Worker request | Technical placeholder renders; unmatched Worker request returns 404 | No readiness, database or model claim |

</frozen-after-approval>

## Code Map

- `docs/_bmad-output/planning-artifacts/epics.md:557–588`, cached `epic-1-context.md` — requirements; no application exists.
- `.node-version`, `scripts/check-workstation.sh`, `tests/toolchain/check-workstation.test.sh` — reuse pin/gate; preserve 45 fixtures. Existing fnm-selected tools passed the gate.
- `docs/development/workstation.md`, completed Story 1.1 spec — installation/evidence conventions. Preserve `_bmad/` and `.agents/`.
- Official metadata: `https://registry.npmjs.org/<package>/<version>` (scoped names supported). Verified 2026-10-19: React/react-dom 19.3.1, TypeScript 5.9.3, Vite 8.3.4, plugin-react 6.1.2, React/DOM types 19.3.0, Node types 24.19.2, Hono 4.13.13, Wrangler 4.100.0, Workers types 4.20260611.1, Vitest 5.0.5. Engines/required peers match Node24 and each other; installation/build remains to prove.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` — pin the verified dependencies above; expose `typecheck`, `test`, `build` commands using local executables. Build frontend and dry-run-bundle Worker only; never deploy. Defer Playwright until browser coverage exists.
- [x] `tsconfig.json`, `tsconfig.frontend.json`, `tsconfig.worker.json`, `tsconfig.tooling.json`, `vite.config.ts`, `vitest.config.ts`, `wrangler.jsonc` — strict checks with browser, Workers and tooling/test globals separated. Limit discovery to application/tests/config; use separate `dist/frontend` and `dist/worker` outputs. Disable Vite public-directory copying and env-file loading; never broadly inject process environment. Use Worker compatibility date 2026-06-11 matching selected tooling.
- [x] `src/shared/README.md`, `src/application/README.md`, `src/ports/README.md`, `src/adapters/README.md`, `migrations/README.md`, `content/public/README.md` — establish boundaries and deferred responsibilities without business contracts, migrations or fabricated knowledge content.
- [x] `src/worker/index.ts`, `frontend/index.html`, `frontend/src/{main.tsx,App.tsx}`, `frontend/src/styles/{tokens.css,base.css}` — minimal Hono export/default 404 and static technical React shell; no API calls or product UI implementation.
- [x] `.gitignore`, `.dev.vars.example` — ignore dependencies, outputs, coverage, local environments, sensitive `.env*`/`.dev.vars*`, Wrangler state and all `content/private/`; allow only intentional nonsensitive example templates. Do not track private placeholders. Example local configuration is optional, not a hidden prerequisite.
- [x] `tests/bootstrap/{foundation,safety}.test.ts`, `scripts/check-build-isolation.mjs` — test matrix, Git exclusions and both bundles using disposable canaries, never real private files. Clean up only owned temporary paths.
- [x] `docs/development/application.md` — ordered installation/config/check/build instructions, output paths, dependency pins/official URLs/date/rationale, Internet needs and dependency/config troubleshooting. Record executed environment/results without claiming later-story acceptance.

**Acceptance Criteria:**
- Given Story 1.1's verified tools, when the skeleton is inspected, then all required layers are distinct without future business behavior or schemas.
- Given historical stack candidates, when dependencies are selected, then official existence/engine/peer evidence and deliberate version choices are documented and an npm lockfile is committed.
- Given a fresh copy, when documented installation and checks run, then lockfile bytes remain unchanged and checks pass without hosted credentials, services, D1 or real models.
- Given local configuration and private preparation material, when Git and both build boundaries are tested independently, then sensitive paths stay untracked and their contents are absent from application artifacts.

## Implementation Notes

Implemented the exact direct pins in one private package with a lockfile, isolated strict TypeScript configurations, static React/Hono entrypoints, native CSS/tokens, explanatory future-layer placeholders and optional comments-only configuration. Vite disables public copying and all application env exposure/loading; Wrangler only dry-run bundles with no bindings. Git exclusions and disposable build canaries are independent checks. Existing BMAD assets and all 45 toolchain fixtures remain unchanged.

Verification on 2026-10-19: Ubuntu 24.04.5/x86_64, Git 2.43.0, shell-local Node 24.22.0/npm 11.19.1. Gate, `npm ci`, all typechecks, 45 existing + 8 bootstrap cases, both builds, standalone 20-canary isolation and whitespace checks passed. A clean disposable copy with fresh HOME/npm cache and an empty credential-free environment repeated installation/checks/builds successfully; lockfile SHA-256 remained `b32afed8ceb1bf488823ac968066bfd2fea41f730758b3842aebfff13546c68d`. Disposable mutations enabling public copying, env exposure and a Worker private-content import were each detected. No later-story startup, browser interaction, D1, model or hosted behavior was verified.

`npm audit` exits 1 with six development-tool dependency findings (five high, one low); production-only audit reports zero. Pins were not silently upgraded or overridden. See `docs/development/application.md` for official version evidence, audit details/action, clean-copy procedure/results and actual limitations. No global/default tools, sudo, Python activation or hosted credentials were used.

Review corrections applied by the parent because the original implementation child could not be resumed. Worker builds now use `/dev/null` for env input and clean only their output; canary builds use disposable HOME/allowlisted environment, raw/base64 scans, a non-Vite secret probe, stale-Worker fixture and shorter internal deadline. Configuration assertions and tracked dist/coverage checks were added; sprint tracking is synchronized. All patch findings above are resolved; the static App finding was rejected on evidence.

Final parent verification passed: gate, unchanged lockfile after `npm ci`, typechecks, 45 Bash + 9 bootstrap cases, both builds and 22-canary isolation. Five disposable negative regressions (base64 private URL, server-secret injection, enabled env loading, omitted Worker env-file input and force-tracked dist) were rejected. A fresh-HOME/cache credential-free clean copy repeated installation and every check successfully. Full audit remains five high/one low development findings; production-only audit is zero. Matrix audit: installation exercised in both copies; foundation and minimal behavior covered by executed tests/builds; private/local behavior covered by Git fixtures, direct config assertions, both-bundle canaries and negative mutations. Frozen intent remains unchanged.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Blind 1: Worker CLI reads local env files | medium | Pinned Wrangler cli.js loads `.env`/`.env.local` before every command unless `--env-file` is explicit. Supply `/dev/null` for this Ubuntu-only dry-run build; patch. |
| Blind 2: stale Worker artifacts survive | medium | Parent reproduced a retained `dist/worker/stale.txt` canary. Clean only the dedicated Worker output before bundling and retain that fixture; patch. |
| Blind 3: encoded private canary escapes detection | medium | Parent reproduced a private Markdown `?url` import that passed the raw-byte scan because Vite emitted base64. Extend matching to encoded representations; patch. |
| Blind 4: disabled env loading is not independently checked | low | Removing `envDir: false` still passes because exposure remains disabled. Add a direct configuration assertion alongside output scanning; patch. |
| Blind 5: real environment inherited by fixture builds | medium | Checker filters only CF/Cloudflare/Vite prefixes and retains HOME and arbitrary provider credentials. Use an allowlisted synthetic environment and disposable HOME; patch. |
| Blind 6: server-secret exposure lacks a canary | low | Fixtures/probe cover only VITE-prefixed values/import.meta.env, so server-specific injection is invisible. Add a synthetic non-Vite value and matching exposure probe; patch. |
| Blind 7: tracked generated artifacts omitted | low | Real-index predicate excludes secrets/runtime directories but not root dist/coverage. Add those exact generated roots; patch. |
| Blind 8: direct App invocation breaks hooks | false | Current App is a static, hook-free JSX function and produces the same tested tree; no supported hook path or current failure exists. A hypothetical future hook change is not a present defect. |
| Blind 9: wrapper deadline can prevent cleanup | low | Outer exec and inner build share 120 seconds; inner cleanup cannot finish if its parent terminates simultaneously. Shorten the inner deadline; patch. Additional signal-handling machinery is disproportionate for rare external termination. |
| Blind 10: sprint tracking remains in-progress | low | Spec is in-review while story tracking remains in-progress. Directly synchronize to sprint schema's review value; patch. |
| Edge 1: matching timeouts skip finally cleanup | low | Same verified deadline race as Blind 9; grouped for one deadline correction, retained separately here. |

## Design Notes

No intent gaps or irreversibles. Dispatch footprint: tooling, layers, two entrypoints, tests and guide. TypeScript 5.9.3 avoids a compiler-major transition; Wrangler 4.100.0 avoids beta Miniflare. Compatibility is not a security guarantee; report actionable audit risks.

## Verification

- `bash scripts/check-workstation.sh`; `bash tests/toolchain/check-workstation.test.sh` — gate and all existing fixtures pass.
- `npm ci`; `npm run typecheck`; `npm test`; `npm run build` — pass credential-free; Worker dry-run only.
- `node scripts/check-build-isolation.mjs` — both bundles exclude canaries.
- Repeat `npm ci` in a disposable clean copy; compare lockfile hashes. This proves installation, not full Epic 1 startup.
- `npm audit`; `git diff --check` — inspect audit findings, imports/configuration and tracked-file exclusions; no whitespace errors.
