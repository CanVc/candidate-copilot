---
title: 'Story 1.2 follow-up: Harden bootstrap tooling'
type: 'bugfix'
created: '2026-10-19'
status: 'done'
baseline_commit: 'ed408954e0614d6fe942b883a69f5acfac05e668'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Human verification exposed a Wrangler skill-install prompt that noninteractive tests missed; the pinned development graph also has six known vulnerabilities.

**Approach:** Make foundation builds noninteractive and prove this under a real pseudo-terminal without touching user-installed skills. Deliberately remediate audited dependencies where an approved compatible graph exists; escalate any required beta/incompatibility compromise before adopting it.

## Boundaries & Constraints

**Always:** Preserve Node 24.22.0/npm 11.19.1, credential-free dry-run builds, empty env-file input, metrics disablement, dedicated output cleanup and existing publication isolation. Use exact verified pins and unchanged-lockfile installation. Terminal tests use disposable HOME/XDG/cache, fake agent directories and synthetic sentinels. Target zero known vulnerabilities across the installed graph, not only production dependencies; report any unmet target honestly.

**Never:** Install/delete/update real global skills, edit BMAD assets or user configuration, approve dependency scripts blindly, run forced audit fixes or apply unreviewed overrides. No deployment, login, business behavior, startup orchestration, D1 or live providers. Existing historical frozen intent remains unchanged.

**Decision (BC):** Adopt Cloudflare's published Wrangler 4.151.2 and matching Workers types 5.20261019.1, including its exact upstream Miniflare 5.20261019.0-beta dependency. This is accepted for local tooling, not deployed as the production runtime. Keep other direct pins unchanged; verify the installed graph and builds before claiming success.

**Test adjustment (BC):** Wrangler 4.151.2 disables automatic first-install prompts upstream. Keep the real protected PTY build, but replace the impossible genuine-prompt positive control with an explicitly synthetic harmless unexpected-prompt fixture that the verifier must reject. Never label that fixture as a real Wrangler prompt or install skills to exercise it.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Interactive build | Fresh fake agent HOME, PTY, outer CI disabled | Protected real build completes dry-run without prompt or skill installation | Unexpected prompt, skill writes or metadata fail the check |
| Synthetic regression control | Separate fresh PTY fixture with harmless unexpected-prompt injection | Verifier detects and rejects the prompt; no skills installed | Missing detection fails, preventing vacuous coverage |
| Ordinary verification | Existing noninteractive checks and isolated clean installation | Types, tests, builds and 22-canary isolation still pass; lockfile unchanged | Failures propagate nonzero |
| Dependency choice | Exact published candidate graph | Record engines, peers, prereleases and full audit result before adoption | Beta/incompatible or still-vulnerable candidate requires explicit disposition |

</frozen-after-approval>

## Code Map

- `package.json:13–15` — Worker dry-run already neutralizes env-file discovery and cleans output; it does not set CI. `WRANGLER_SEND_METRICS=false` does not disable skill installation.
- `node_modules/wrangler/wrangler-dist/cli.js` — historical 4.100.0 prompts in a non-CI interactive terminal; 4.151.2 command handling explicitly sets `shouldInstall = false`, disabling automatic first-install prompts independently of CI. Retain command-local CI for defense in depth. Existing install metadata can mask regressions.
- `scripts/check-build-isolation.mjs`, `tests/bootstrap/safety.test.ts` — reuse scratch-copy/environment/artifact patterns and all 22 canaries. Current CI=true fixture cannot prove terminal behavior.
- `docs/development/application.md` — current guide/evidence/audit record; preserve historical results while distinguishing the follow-up.
- Official `https://registry.npmjs.org/wrangler` metadata checked 2026-10-19: newest numeric Wrangler with non-prerelease Miniflare is 4.116.0, using Miniflare 4.20260730.0; latest 4.151.2 uses Miniflare 5.20261019.0-beta. Both Wrangler engines allow Node >=22.
- Parent resolved full manifests with unchanged other direct dependencies in owned temp directories, without scripts/overrides: Wrangler4.116.0 + Workers-types5.20260730.1 audits at four high findings (sharp/undici and inherited effects); Wrangler4.151.2 + types5.20261019.1 audits at zero, adding beta Miniflare. No repository pins changed. Version-specific official registry URLs establish exact engines/peers/dependencies.
- Ubuntu `/usr/bin/script` from util-linux provides child TTYs with `-q -e -c`; no Python or new PTY npm dependency is needed. Keep Wrangler cache inside fixture; shared symlinked node_modules can otherwise host its default cache.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` — scope CI=true to Worker build; preserve other safety flags. Pin Wrangler 4.151.2 and Workers types 5.20261019.1; verify engines/peers/full audit without overrides or forced fixes.
- [x] `scripts/check-build-interactivity.mjs` — add bounded real PTY build check and separate explicitly synthetic unexpected-prompt rejection control; assert TTY status, detection, sentinel preservation and no installation metadata. Terminate and reap owned descendants before cleanup; never answer yes.
- [x] `tests/bootstrap/safety.test.ts` — run the terminal regression through the standard test command; assert command-local protection independently of inherited CI. Preserve existing Git and bundle checks.
- [x] `docs/development/application.md` — record observed human failure, corrected terminal journey, selected dependency evidence/audit disposition, installation effects and actual verification limits. Do not claim startup/D1 readiness.

**Acceptance Criteria:**
- Given the supported Ubuntu workstation, when the documented build runs interactively, then no skills prompt or global installation is required and normal artifacts are produced.
- Given fresh settings and synthetic agent directories, when the harmless synthetic prompt control runs in a PTY, then the verifier rejects it and preserves fake skills, proving prompt detection is exercised independently of upstream suppression.
- Given the selected dependency disposition, when installation/audit and foundation checks run in a clean copy, then documented security claims match measured results and the lockfile is stable.

## Implementation Notes

Implementation paused on a newly verified upstream behavior change. The approved Wrangler 4.151.2 and Workers-types 5.20261019.1 pins are installed; parent `npm audit --json` returns exit 0 with zero findings. Worker build has command-local CI=true. A before/after hash inventory confirms existing global skill files/symlinks remain unchanged.

Published Wrangler 4.151.2 cli.js explicitly sets `shouldInstall = false` in command handling, disabling automatic first-install prompts independently of CI. The protected PTY case succeeds, but the frozen positive-control requirement (remove only CI protection and require a genuine prompt) cannot succeed for this version. The private terminal-check script is unfinished and not registered in the standard suite; no completion claim is made. Human approval is required to replace the impossible genuine-prompt control with an explicitly synthetic unexpected-prompt rejection control while retaining the real interactive build verification. No frozen expectation was changed to match the implementation.

BC approved replacing the genuine-prompt control with an explicitly synthetic unexpected-prompt rejection control; implementation may resume. Historical pause evidence above is retained.

Implemented the approved pins, command-local CI protection, real PTY verifier with explicitly synthetic rejection control, standard-suite registration and updated historical/current guide evidence. Parent read the full staged diff and independently repeated the workstation gate, unchanged-lockfile `npm ci`, typechecks, 45 Bash + 10 Vitest cases, both builds, 22-canary isolation, terminal checks and both audits. Every check passed; full audit exits 0 with zero findings. A credential-free clean copy with fresh HOME/cache repeated the same installation/check/build/audit journey successfully; lockfile SHA-256 stayed `1380780909df866f449e37da80a48a88bd79e3777d89ca54a614fd91d530d505`.

Matrix audit: real PTY build and synthetic rejection both executed through the registered safety test and standalone script; ordinary checks and clean installation passed; official pin/integrity/peer evidence plus all 79 installed package Node engines were verified. A parent hash/symlink comparison confirms all 1,449 baseline global-skill entries remain unchanged. No later-story readiness is claimed; independent review is next.

Independent review completed with fifteen findings recorded below; all retained patch findings were corrected in the original implementation session. Two real PTY builds now cover fresh and aged accepted synthetic metadata, alongside eight independent synthetic controls for install/update/wrapped/generic prompts, deadline, output cap, repeated interruption and a detached orphan. Ownership uses a unique inherited marker plus PID/start-time identity; output retention is byte-bounded and signal handling stays active during cleanup. This verifies trusted local tooling, not containment of hostile processes that discard markers or survive host termination.

Final post-review parent verification on Ubuntu 24.04.5/x86_64 with Node 24.22.0/npm 11.19.1 passed syntax, workstation gate, stable-lockfile installation, typechecks, 45 Bash + 10 Vitest cases, both builds, isolation and every terminal control. Both audits remain zero; required peers resolve. A fresh credential-free HOME/cache clean copy repeated the complete journey after patches and retained the same lockfile hash. All 1,449 real global-skill baseline entries and both approved frozen intent blocks remain unchanged; no terminal fixture directories remain. Matrix rows are covered by these executed checks. Blind 6 was rejected as disproportionate low-impact protocol complexity; Blind 10 was refuted for the current seed. No deferred work was introduced; Miniflare beta remains the explicitly approved local-tooling limitation.

## Spec Change Log

- Human-approved adjustment: inspection of the new published CLI found `shouldInstall = false`; a genuine first-install prompt cannot be required. BC authorized the synthetic rejection control after explanation. Updated the frozen matrix/decision and corresponding task/AC; keep real PTY verification, disposable settings, no global writes, approved upstream pins and existing isolation. Never relabel synthetic behavior as genuine Wrangler behavior.

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| Blind 1: orphaned descendants escape ownership polling | medium | PPID-only discovery loses a descendant reparented before polling; reviewer reproduced a late writer after reported cleanup. Track the demonstrated orphan state using a unique inherited scope marker plus PID/start-time identities; patch. |
| Blind 2: interruption handlers removed before cleanup | medium | SIGINT/SIGTERM listeners are removed before awaited termination/reaping. A second interruption can abort cleanup; retain idempotent handling until cleanup finishes; patch. |
| Blind 3: output accumulation continues after cap | medium | receive appends before rejecting and stays attached during asynchronous cleanup. Additional chunks can exceed the advertised bound; truncate retained output and stop accumulation after saturation; patch. |
| Blind 4: actual update/wrapped prompts missed | low | Current upstream update wording uses “update them” after a preceding sentence mentioning skills; the regex cannot match it or wrapped install text. Correct normalization/matching and add independent controls; patch. |
| Blind 5: installed-skill metadata path untested | low | Fresh fixtures exercise neither accepted metadata nor the still-enabled update-flow early CI guard. Add an aged synthetic accepted-metadata fixture and verify its bytes/skills remain unchanged without new writes; patch. |
| Blind 6: inert control does not read stdin | low | The control indeed cannot observe a hypothetical response mutation, but the verifier has no stdin write/send path. Adding an input protocol guards no normal reachable response here; reject under the low-impact complexity rule. |
| Blind 7: overlapping prompt branches mask omissions | low | The single control matches skills-specific and generic confirmation patterns simultaneously. Independent real-wording/wrapped/generic synthetic controls can expose branch regressions; patch. |
| Blind 8: failure-path checks are not recurring | medium | The registered suite currently exercises success and prompt rejection only; documented one-off mutations do not preserve deadline/output/interruption cleanup coverage. Add bounded synthetic failure controls to the same verification command; patch. |
| Blind 9: PTY prerequisite failures lack correction | low | ENOENT/PTY errors currently surface without a supported-platform remedy. Add a small preflight/actionable failure diagnostic and guide instructions; keep the existing workstation gate unchanged; patch. |
| Blind 10: newer ambient types imply runtime API availability | false | The Worker seed uses only Hono's baseline fetch/404 path, not a newer date-gated API. The guide already explicitly says the tooling update does not change the compatibility date; no unsupported caller was identified. Future API availability requires later runtime tests, not speculative bootstrap type generation. |
| Edge 1: reparented SIGHUP-ignoring descendant survives | medium | Same verified PPID discovery defect as Blind 1; grouped for the scope-ownership patch and retained separately. |
| Edge 2: noisy output grows during cleanup | medium | Same verified accumulation defect as Blind 3; reviewer captured over 43 million characters despite the nominal cap. Grouped for bounded retention patch. |
| Edge 3: signal during cleanup bypasses reaping | medium | Same verified listener-lifetime defect as Blind 2; grouped for cleanup signal handling patch. |
| Edge 4: descendant-lifetime claim is not guaranteed | medium | The claim combines the demonstrated orphan and signal windows above. Resolve both cleanup defects and retain explicit scope/verification limitations; patch. |
| Verification 1: deadline lacks automated exercise | medium | Filed evidence shows removing the deadline timer leaves existing cases passing. Trust the pre-verified gap; add a short silent nonterminating fixture asserting deadline rejection and cleanup, grouped with recurring failure-path coverage. |

## Design Notes

No remaining intent gaps or irreversible operations. Footprint: manifest/lock, one private verification script, existing safety tests and guide; dispatch route. BC explicitly accepted Cloudflare's upstream Miniflare beta after clarification that it is local tooling. Do not rewrite historical Story1.2 evidence as if terminal verification had previously passed.

## Verification

- `bash scripts/check-workstation.sh`; `npm ci`; `npm run typecheck`; `npm test`; `npm run build`; `node scripts/check-build-isolation.mjs` — existing foundation succeeds and lockfile bytes remain unchanged.
- `node scripts/check-build-interactivity.mjs` — real protected build and synthetic prompt-rejection control pass in fresh disposable settings.
- Repeat installation and checks in a credential-free clean copy; inspect exact direct pins, required peers, `npm audit --json` and `npm audit --omit=dev` separately.
- `git diff --check` — no whitespace errors; inspect tracked exclusions and verify real agent-skill directories/configuration were not modified by this work.

## Human Verification and Acceptance

BC supplied a successful interactive-terminal verification transcript on 2026-10-19 at 23:52, then explicitly authorized recording acceptance and pushing the local commits. Tested implementation revision: `4d4fb3a9fa84c5d91c8b47432179c058b31bc92d`.

The workstation gate passed on Ubuntu 24.04 with Git 2.43.0, Node 24.22.0 and npm 11.19.1. Human-executed `npm ci` preserved lockfile SHA-256 `1380780909df866f449e37da80a48a88bd79e3777d89ca54a614fd91d530d505`; `npm test` passed all 45 Bash fixtures and 10 Vitest cases; both builds succeeded with Wrangler 4.151.2 in dry-run mode and no bindings. The standalone terminal check passed both protected real builds (fresh settings and aged accepted metadata) and all eight explicitly synthetic rejection/cleanup controls. No skills-install/update prompt appeared in the reported terminal journey. Full `npm audit` reported zero vulnerabilities. The esbuild/workerd unapproved-install-script warnings remained informational; no approval was required for these checks.

Story 1.2 is accepted within its application-skeleton scope and its sprint entry is set to `done`. The previously approved local Miniflare beta limitation remains explicit. This acceptance does not establish Story 1.3 startup/simulation, D1 readiness, hosted operation or recruiter-launch approval.
