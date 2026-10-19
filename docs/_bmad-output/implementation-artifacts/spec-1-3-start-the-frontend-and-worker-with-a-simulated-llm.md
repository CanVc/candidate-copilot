---
title: 'Story 1.3: Start the Frontend and Worker with a Simulated LLM'
type: 'feature'
created: '2026-10-19'
status: 'done'
baseline_commit: 'de375a413b5565191655609cfb68e343ab53af23'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The accepted skeleton builds but cannot demonstrate frontend-to-Worker availability or deterministic model simulation.

**Approach:** Add two local startup commands, a minimal health exchange displayed by the technical frontend, and a simulated LLMProvider verified through dedicated tests, without hosted services.

## Boundaries & Constraints

**Always:** Preserve Ubuntu 24.04, Node 24.22.0/npm 11.19.1, existing pins and approved local Miniflare beta. Bind frontend/Worker to loopback ports 5173/8787; reject occupied ports. Preserve private/build boundaries, disabled browser env exposure, noninteractive Wrangler and empty env-file input. Configuration copying stays optional. French technical UI distinguishes availability from product readiness.

**Never:** Add Conversation/retrieval, real providers/SDKs, D1/bindings/migrations, catalog identity, hosted operations or public model/database diagnostics. Health never invokes a model. Never inspect real private files, expose server configuration, install global skills, change global tools or require Python/sudo. Simulation is test evidence, not a chat UI; it requires no key or model network call.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Behavior | Error Handling |
|---|---|---|---|
| Availability | Both servers; browser loads frontend | Relative GET /api/health reaches Worker; 200 JSON {"status":"ok"}; checking becomes available | Validate JSON before success |
| Failure | Worker absent, HTTP error, malformed body or stalled request | Unavailable within five seconds | No unhandled rejection; cancel on unmount; reload retries |
| Simulation | Repeated LLMProvider calls with "bootstrap-ping" | Exact "Simulated LLM: bootstrap-pong"; no model network | Unsupported fixture rejects |
| Startup | Occupied port or failed server | Nonzero startup/smoke with useful diagnosis | Never reuse/terminate unrelated listeners |
| Privacy | Disposable private/env/preparation canaries | No bytes in bundles or dev HTTP responses | Deny forbidden files; clean owned fixtures |

</frozen-after-approval>

## Code Map

- `package.json:10–15`, `vite.config.ts`, `wrangler.jsonc` — no startup commands. Preserve build safeguards/date. Vite currently permits repository-root file serving despite frontend root.
- `src/worker/index.ts`, `frontend/src/App.tsx` — route-free Hono/static React; `main.tsx` uses StrictMode.
- `tests/bootstrap/foundation.test.ts:6–23` — replace health-404/static assumptions; hooks prohibit direct App() invocation. `safety.test.ts` guards Git/build/terminal boundaries.
- `scripts/check-build-{isolation,interactivity}.mjs` — retain 22 canaries/PTY controls; explicit copy lists need any new build inputs.
- `docs/development/application.md`, completed Story1.2 specs — accepted safeguards/historical evidence.
- Official evidence checked 2026-10-19: Cloudflare Workers commands/local-development docs and installed help confirm `dev --local`, loopback/port flags; Vite server-options documents strictPort/proxy/fs. Registry endpoints for @playwright/test, playwright, playwright-core 1.64.1 confirm exact dependency chain, Node>=20, no required peers; Playwright intro supports Ubuntu24/Node24.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/health.ts`, `src/worker/index.ts` — minimal shared health contract/thin GET route; retain unrelated 404s; no diagnostics.
- [x] `src/ports/LLMProvider.ts`, `src/adapters/llm/simulated.ts`, `src/{ports,adapters}/README.md` — framework-independent string-generation capability and fixture-only adapter; document exact input/output, no speculative business contracts.
- [x] `package.json`, `vite.config.ts` — `dev:frontend`/`dev:worker`, loopback defaults, strict ports, /api proxy, narrow dev filesystem access. Force local/noninteractive Worker, metrics disabled, empty env input; retain build protections.
- [x] `frontend/src/{App.tsx,health.ts}` — bounded/validated health checking, French states and StrictMode-safe cleanup; retain technical shell.
- [x] `tests/bootstrap/{foundation,health,simulation,safety}.test.ts` — matrix branches, simulation with network forbidden, absent diagnostic routes and startup protections; preserve nonsuperseded tests.
- [x] `package.json`, `package-lock.json`, `playwright.config.ts`, `tsconfig.tooling.json`, `.gitignore` — exact `@playwright/test` 1.64.1, separate `test:smoke`, scoped/typechecked browser tests, ignored results; preserve other pins, recheck audit.
- [x] `tests/e2e/{bootstrap.spec.ts,local-fixture.ts}` — real Chromium/frontend/proxy/Worker in disposable copy/HOME/settings, no credentials/server reuse. Test rendered success, stopped-Worker failure, occupied ports and dev HTTP canaries. Bound startup/output/cleanup; stop only owned descendants on success/failure/interruption.
- [x] `docs/development/application.md`, `.dev.vars.example` — current setup, browser installation without automatic privilege escalation, two-terminal startup/shutdown, URLs, simulation fixture, smoke, browser/library/port/config diagnosis, official evidence/results/limits. Preserve historical records.

**Acceptance Criteria:**
- Given locked installation and Chromium, when documented startup/smoke run without credentials or D1, then real browser-to-Worker plumbing and deterministic simulation checks pass.
- Given Story1.2 safeguards, when installation/checks/builds rerun, then npm ci preserves lockfile bytes, private/terminal protections remain effective, and audit claims match results.

## Implementation Notes

Implemented local two-terminal startup, exact health contract and French technical states, fixture-only LLMProvider, strict dev filesystem boundaries and isolated Chromium verification. Existing direct pins/date, build isolation and terminal safeguards remain unchanged; only exact Playwright 1.64.1 was added. No hosted operation or D1 work occurred.

Parent read the complete staged baseline diff and independently ran the workstation gate, unchanged-lockfile npm ci, typechecks, 45 Bash fixtures plus 38 Vitest cases, both builds, both standalone build verifiers, six Chromium smoke checks, full/production audits, dependency resolution and whitespace checks. All passed on Ubuntu 24.04.5/x86_64 with Node 24.22.0/npm 11.19.1. Lock SHA-256: f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f; both audits report zero. No smoke fixtures or application listeners remained.

Matrix audit: availability and stopped-Worker/reload behavior ran in real Chromium; malformed/stalled/lifecycle paths passed both browser and dedicated health tests (headers/body deadline covered); repeated simulation and unsupported inputs passed with transports forbidden; occupied frontend/Worker ports and compile failure passed; HTTP canaries and all 22 bundle canaries passed. Existing two real PTY builds and eight synthetic failure controls also passed. Browser/system-library prerequisites and approved local Miniflare beta remain explicit; no full Epic 1 acceptance is claimed.

Post-review corrections were applied in the original implementation session: abort unconsumed health-error responses, require numeric nonzero exits with signal diagnosis, begin bounded browser-scope cleanup immediately, observe all blocked transport calls, attach bounded failure logs and strengthen mounted-component lifecycle regression coverage. New `tests/e2e/fixture-controls.spec.ts` exercises this fixture's prompts/output/deadline, signal exits, respawning descendants, repeated interruption and suspended Chromium; no product/public API or dependency was added.

Final parent verification repeated the complete documented sequence after patches: gate, unchanged-lockfile npm ci, typechecks, 45 Bash + 39 Vitest cases, both builds, 22-canary isolation, both protected real PTY builds/eight synthetic controls, 17 smoke/fixture-control cases, full/production audits and whitespace checks. Every check passed; audits remain zero, the same lock hash was retained and no smoke fixtures/application listeners remained. Matrix rows remain covered by executed tests. Both approved intent and existing direct pins remain unchanged. All retained review patches are resolved; two separately recorded exceptional constructor-I/O findings were rejected under the rare low-impact complexity rule, not deferred.

Implementation and automated review are complete. Sprint tracking remains at review pending BC's practical workstation/browser verification and acceptance; automated success is not human acceptance. No work was deferred.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
|---|---|---|
| Blind 1: failed health leaves error body active | low | Non-OK responses short-circuit before body consumption and finally does not abort the internal controller. A streaming error can outlive the result/lifecycle; directly abort in finally and exercise this branch; patch. |
| Blind 2: signal termination passes rejection assertion | low | rejected() accepts code null because null !== 0; that is Node's signal-termination state, not a diagnosed nonzero exit. Require a numeric nonzero code and retain signal diagnostics; patch. |
| Blind 3: browser close precedes bounded cleanup | medium | Parent suspended only an identified disposable Chromium root: browser.close() remained pending after 8.1 seconds. Awaiting it first delays scope cleanup beyond its advertised bound. Start owned-scope cleanup without waiting for browser responsiveness; patch. |
| Blind 4: component cancellation lacks conflicting-completion test | medium | Existing unit tests manually abort and browser cases give both StrictMode requests identical outcomes. Removing App cleanup permits an obsolete deadline to overwrite a newer success; add mounted-component cancellation/stale-result evidence; patch. |
| Blind 5: caught transport errors evade no-network assertion | low | HTTP/HTTPS/net mocks throw but their invocation counts are never asserted. A caught transport error can leave current assertions passing; use observable spies and zero-call assertions for accepted/rejected fixtures; patch. |
| Blind 6: fixture safeguards lack recurring negative controls | medium | Repository search finds prompt/output/deadline/repeated-interruption controls only for the separate PTY implementation. Add bounded synthetic controls against LocalFixture itself, including owned respawn cleanup; patch. |
| Blind 7: partial constructor failure leaves directory | low | mkdtemp precedes fallible copy/settings operations and the use/finally begins afterward, so ENOSPC/setup-I/O failure can retain a small partial copy. Reject under the rare low-impact complexity rule: this exceptional pre-start state would require new setup guards/injection machinery rather than a direct correction. |
| Blind 8: later browser failure loses startup logs | low | HTML readiness precedes Vite module compilation; later locator failures dispose the fixture without exposing captured diagnostics. Attach the already byte-bounded command logs on failed smoke cases; patch. |
| Edge 1: constructor cpSync failure leaves partial fixture | low | Same verified exceptional setup-I/O path as Blind 7; retained separately. Reject under the same rare low-impact complexity rule; no extra setup guard/test protocol. |
| Verification 1: App lifecycle regression gap | medium | Trust the filed search/mutation evidence: neither manual-controller tests nor identical browser outcomes detect removed effect cleanup. Group with Blind 4 for the mounted conflicting-completion regression; patch. |
| Verification 2: interruption cleanup has manual evidence only | medium | Trust the filed searches: six ordinary smoke cases do not interrupt LocalFixture; historical PTY controls cover different code. Group the subprocess repeated-signal/owned-descendant/directory assertions with Blind 6; patch. |

## Design Notes

No unresolved intent gaps or irreversible operations. Dispatch spans runtime/frontend/tooling/tests. Two terminals avoid an unnecessary supervisor; dedicated simulation tests avoid a public diagnostic API. Chromium coverage justifies Playwright now; browser download is a test prerequisite, not a startup requirement.

## Verification

- Select repository Node/npm; workstation gate; `npm ci` with before/after lock hash; `npm run typecheck`; `npm test`; `npm run build`; both standalone build checks; `npm run test:smoke`.
- Full/production audits; `git diff --check`. Record environment, full revision/baseline, commands/results/limits; no D1, grounding or full Epic1 acceptance claim.
