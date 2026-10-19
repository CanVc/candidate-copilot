---
title: 'Story 1.2: Initialize a Reproducible and Safely Configured Application Skeleton'
type: 'chore'
created: '2026-10-19'
status: 'ready-for-dev'
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
- [ ] `package.json`, `package-lock.json` — pin the verified dependencies above; expose `typecheck`, `test`, `build` commands using local executables. Build frontend and dry-run-bundle Worker only; never deploy. Defer Playwright until browser coverage exists.
- [ ] `tsconfig.json`, `tsconfig.frontend.json`, `tsconfig.worker.json`, `tsconfig.tooling.json`, `vite.config.ts`, `vitest.config.ts`, `wrangler.jsonc` — strict checks with browser, Workers and tooling/test globals separated. Limit discovery to application/tests/config; use separate `dist/frontend` and `dist/worker` outputs. Disable Vite public-directory copying and env-file loading; never broadly inject process environment. Use Worker compatibility date 2026-06-11 matching selected tooling.
- [ ] `src/shared/README.md`, `src/application/README.md`, `src/ports/README.md`, `src/adapters/README.md`, `migrations/README.md`, `content/public/README.md` — establish boundaries and deferred responsibilities without business contracts, migrations or fabricated knowledge content.
- [ ] `src/worker/index.ts`, `frontend/index.html`, `frontend/src/{main.tsx,App.tsx}`, `frontend/src/styles/{tokens.css,base.css}` — minimal Hono export/default 404 and static technical React shell; no API calls or product UI implementation.
- [ ] `.gitignore`, `.dev.vars.example` — ignore dependencies, outputs, coverage, local environments, sensitive `.env*`/`.dev.vars*`, Wrangler state and all `content/private/`; allow only intentional nonsensitive example templates. Do not track private placeholders. Example local configuration is optional, not a hidden prerequisite.
- [ ] `tests/bootstrap/{foundation,safety}.test.ts`, `scripts/check-build-isolation.mjs` — test matrix, Git exclusions and both bundles using disposable canaries, never real private files. Clean up only owned temporary paths.
- [ ] `docs/development/application.md` — ordered installation/config/check/build instructions, output paths, dependency pins/official URLs/date/rationale, Internet needs and dependency/config troubleshooting. Record executed environment/results without claiming later-story acceptance.

**Acceptance Criteria:**
- Given Story 1.1's verified tools, when the skeleton is inspected, then all required layers are distinct without future business behavior or schemas.
- Given historical stack candidates, when dependencies are selected, then official existence/engine/peer evidence and deliberate version choices are documented and an npm lockfile is committed.
- Given a fresh copy, when documented installation and checks run, then lockfile bytes remain unchanged and checks pass without hosted credentials, services, D1 or real models.
- Given local configuration and private preparation material, when Git and both build boundaries are tested independently, then sensitive paths stay untracked and their contents are absent from application artifacts.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Design Notes

No intent gaps or irreversibles. Dispatch footprint: tooling, layers, two entrypoints, tests and guide. TypeScript 5.9.3 avoids a compiler-major transition; Wrangler 4.100.0 avoids beta Miniflare. Compatibility is not a security guarantee; report actionable audit risks.

## Verification

- `bash scripts/check-workstation.sh`; `bash tests/toolchain/check-workstation.test.sh` — gate and all existing fixtures pass.
- `npm ci`; `npm run typecheck`; `npm test`; `npm run build` — pass credential-free; Worker dry-run only.
- `node scripts/check-build-isolation.mjs` — both bundles exclude canaries.
- Repeat `npm ci` in a disposable clean copy; compare lockfile hashes. This proves installation, not full Epic 1 startup.
- `npm audit`; `git diff --check` — inspect audit findings, imports/configuration and tracked-file exclusions; no whitespace errors.
