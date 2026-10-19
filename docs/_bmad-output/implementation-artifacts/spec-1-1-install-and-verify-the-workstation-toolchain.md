---
title: 'Story 1.1: Install and Verify the Workstation Toolchain'
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

**Problem:** BC needs reproducible Ubuntu 24.04 preparation before application initialization; no setup guide exists.

**Approach:** Deliver a dated installation/troubleshooting guide and a tested read-only prerequisite gate, separating application tools from optional BMAD tooling.

## Boundaries & Constraints

**Always:** Ubuntu 24.04 LTS/Bash; explicit Internet/sudo requirements and per-user shell setup. Select Node 24.22.0 LTS/bundled npm 11.19.1, Ubuntu-maintained Git >=2.43.0 (distribution security revisions accepted), and fnm 1.39.0. Separately document Ubuntu Python 3.12 (BMAD >=3.11) and uv 0.11.15. Record official references/date and actual test limitations, not claims that every pin is latest.

**Never:** Add application dependencies/skeleton, business tables, hosted resources, secrets or live-model calls. Do not edit installed BMAD files, require manual Python activation, create a repository virtualenv, or automatically modify OS packages/global shell defaults. Dependency compatibility belongs to Story 1.2.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Ready | Ubuntu 24.04, supported Git, exact Node/npm | App prerequisite checks pass with versions | Exit 0 |
| Missing/broken tool | Executable absent or version command fails | Name tool and corrective guide section | Nonzero; never report success |
| Wrong version | Node/npm mismatch, Git below minimum or malformed output | Actual versus required version and correction | Nonzero |
| Separate tooling | Default versus explicit BMAD mode | Default ignores Python/uv; BMAD mode additionally verifies them | Missing/unsupported tooling fails only BMAD mode |
| Unsupported usage/platform | Unknown argument or non-Ubuntu-24.04 system | Explain supported invocation/platform | Nonzero, no install or mutation |

</frozen-after-approval>

## Code Map

- `docs/_bmad-output/planning-artifacts/epics.md:519–555` — Story 1.1; later bootstrap stories stay deferred.
- `_bmad/scripts/resolve_config.py` — read-only BMAD smoke; Python >=3.11/PEP 723. No existing setup files to reuse; preserve installed `.agents/` and `_bmad/`.
- Verified 2026-10-19: `https://nodejs.org/dist/index.json` lists Node 24.22.0/npm 11.19.1; `https://nodejs.org/en/about/previous-releases` marks 24 LTS; `https://registry.npmjs.org/npm/11.19.1` permits Node `^20.17.0 || >=22.9.0`.
- Installation evidence: `https://github.com/Schniz/fnm/tree/v1.39.0`, `https://launchpad.net/ubuntu/noble/+package/git`, `https://docs.astral.sh/uv/getting-started/installation/`. Versioned uv 0.11.15 installer was reachable.

## Tasks & Acceptance

**Execution:**
- [ ] `.node-version` — single Node pin, 24.22.0, consumed by checks and guide.
- [ ] `docs/development/workstation.md` — ordered install/setup/check commands, dated references, privileges/network needs, separate BMAD section, PATH/version/download/permission corrections and story boundary. Review downloaded installers; avoid sudo npm/global upgrades.
- [ ] `scripts/check-workstation.sh` — implement matrix without network, dependencies, mutation or working-directory assumptions; link failures to guide and verify actual execution.
- [ ] `tests/toolchain/check-workstation.test.sh` — disposable PATH fixtures cover matrix, default without Python/uv, nonzero failures and outside-repository invocation; no added framework.

**Acceptance Criteria:**
- Given a clean Ubuntu 24.04 workstation, when BC follows the guide, then Git and the selected Node/npm can be installed and verified before application initialization, with acquisition privileges and Internet requirements explicit.
- Given historical architecture candidates, when reviewing the guide, then selected versions have dated official availability/compatibility evidence rather than inherited guarantees.
- Given missing or incompatible prerequisites, when running the checks, then actionable diagnostics identify what must pass before Story 1.2.
- Given BMAD work, when following its separate section, then Python/uv and the existing resolver smoke command work without manual activation or becoming application-runtime dependencies.
- Given only this story's deliverables, when checking readiness, then no Cloudflare account, hosted service, production secret, application implementation or later-story setup is required.

## Implementation Notes

No intent gaps or irreversible operations. Footprint: four files, including a reusable gate and failure-path suite; dispatch route. Observed Ubuntu 24.04.5/x86_64: Git 2.43.0, Node 24.15.0/npm 11.12.1, fnm 1.39.0, Python 3.12.3, uv 0.11.15. BMAD resolver passed. Test selected Node/npm in isolation, preserving the agent runtime. Clean-machine installation is not yet proven.

## Spec Change Log

## Review Triage Log

## Verification

- `bash -n scripts/check-workstation.sh tests/toolchain/check-workstation.test.sh` — syntax passes.
- `bash tests/toolchain/check-workstation.test.sh` — all positive/negative fixture cases pass.
- `bash scripts/check-workstation.sh` — passes with selected Node/npm; existing historical versions must fail clearly.
- `bash scripts/check-workstation.sh --bmad` — also checks tooling; `uv run _bmad/scripts/resolve_config.py --project-root "$PWD" --key core.project_name` returns the project name.
- `git diff --check` — no whitespace defects. Inspect guide commands and record which were actually executed versus documented only.
