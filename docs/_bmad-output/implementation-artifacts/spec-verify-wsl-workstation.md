---
title: 'Finish and verify the WSL development workstation'
type: 'chore'
created: '2026-11-17'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The developer moved from Ubuntu to Windows and wants the existing Ubuntu development workflow working inside WSL2 without manually managing a separate machine. WSL is installed but application validation and daily-workflow handover remain incomplete.

**Approach:** Follow the existing workstation and current application guides in the clean Linux clone at `/home/cabail/dev/candidate-copilot`; select the pinned Linux tools, install locked dependencies and Chromium, initialize only the new local D1, and run the documented checks and own-server startup checks. Record reproducible evidence and clear remaining human checks in `docs/development/wsl-verification.md`. Preserve the Windows clone, its untracked preparation document, local data and secrets. Do not change application code, dependency pins/lockfile, shell profiles, tool defaults, remote resources or Git history. Do not claim browser-on-Windows or editor verification unless actually observed.

</frozen-after-approval>

## Implementation Notes

- Route assessment: no unresolved user choices or destructive operations; installation and new-clone local state are reversible. Footprint is this task record plus one workstation evidence document; no application interface changes. User authorized working in the clean WSL clone and preserving the Windows document.
- Baseline: Linux clone on `main`, initially clean, full revision `2886a0aab9ff9e2920249baa3507f98ef6e12cd2`; no `node_modules` or `.wrangler` directory. WSL Ubuntu 24.04, Python 3.12.3, Git 2.43.0, fnm 1.39.0 and Node 24.22.0 already acquired. uv 0.11.15 installed as the normal user with reviewed installer and no shell modifications. User reports successful administrator provisioning of the explicit system/browser package list; verify package and PTY availability before tests.
- Reuse `docs/development/workstation.md` and the current (not historical) sections of `docs/development/application.md`. `package.json` supplies protected scripts; `scripts/local-d1.mjs` rejects remote/alternate identities and never resets existing data. Keep those files unchanged. Capture command outcomes and hashes; stop at the first failure and diagnose instead of bypassing controls.
- Implementation: confirmed all 34 documented OS/toolchain/browser packages and PTY/procfs prerequisites; selected Linux Node/npm; passed both workstation gates and BMAD resolver. Locked installation, unchanged type generation, local D1 init/check and Chromium acquisition succeeded. No profiles/defaults or application files changed.
- Functional verification: four TypeScript configurations, 45 Bash fixtures, 48 Vitest cases, 12 D1 cases, both builds, 33-canary isolation, two protected PTY builds/eight controls and smoke (6 simulation + 31 Playwright) passed. Additional diagnostic dependency resolution and 42 authoring unittest cases passed. Lockfile SHA-256 stayed `f0c3e526cb4102bbf86bc7e8686f97ef105e78a78da6037a1f2fff74999e385f`.
- Existing dependency audit blocker: full chain stopped at `npm audit --json` (4 affected package entries, 3 moderate/1 high); a diagnostic production-only audit reports Hono as one moderate entry. No updates or forced fixes were applied. Dependency maintenance is outside this workstation-only intent and requires an explicit follow-up; do not describe the full validation as successful.
- Own-clone diagnostics: real dev commands ran in separate PTYs with explicit initialization; WSL direct/proxied health, Windows curl.exe HTTP, Linux Chromium available/unavailable/recovered UI all passed. First Windows request initially failed; a bounded-retry rerun succeeded on IPv4 with no network/firewall changes. All owned processes stopped and ports freed afterward. Windows graphical browser/editor acceptance remains human work.
- Deliverable: `docs/development/wsl-verification.md` records evidence, limits, audit blocker and exact daily opening/startup commands. Temporary diagnostic scripts/logs remain outside the repository; no assistant-runtime/auth or private-data migration is claimed. No Git commit is made because preserving Git history is an explicit frozen boundary for this installation task.
- Independent review completed on the same inherited model. All four documentation findings were verified and patched; no code-review layers were run because application code is unchanged. The security-maintenance follow-up is additionally recorded in `docs/_bmad-output/implementation-artifacts/deferred-work.md` without modifying existing entries. This administrative tracking is the only additional file beyond the original two-document footprint.
- Final handoff checks: the existing Linux Pi CLI reports 1.5.2 without inspecting authentication/sessions; Git author identity is missing, so the guide now tells the owner to configure the intended identity locally before future commits. No identity was guessed or borrowed from commit authors.
- Completion boundary: `done` records the installation and reviewed evidence delivery, not successful full audit acceptance or graphical human acceptance. All originally tracked application files and source HEAD are preserved. Temporary diagnostic scripts/logs are removed after their successful startup transcript and dated advisory identifiers/ranges are retained in the evidence document; user-owned installer downloads and old clones are not removed.

## Review Triage Log

| Finding | Verdict and evidence | Resolution |
| --- | --- | --- |
| Handoff used localhost although only Windows IPv4 was proven | low; the successful own-server run used Windows curl.exe against 127.0.0.1 on both ports, not a separate hostname/address-family check | Patched the primary browser URL to the proven IPv4 address and explicitly distinguished the unverified localhost alias. |
| Successful custom startup evidence existed only in temporary scripts/session observations | medium; the initial diagnostics log ends at the first Windows request failure, whereas the later successful run was a separate tool invocation | Preserved the exact later successful sanitized stdout and executed temporary entrypoint in the evidence document; added repeatable Windows HTTP commands and the existing-guide startup/browser reproduction path. |
| Human shutdown did not include a freed-port check or distinguish harness signals from Ctrl+C | medium; the temporary harness used owned-process SIGTERM/SIGKILL cleanup, not human keystrokes | Added the existing ss listener check and expected absence of listener rows; explicitly retained manual Ctrl+C testing as an unverified human acceptance step. |
| Audit blocker lacked advisory identifiers/affected ranges for follow-up | medium; original npm JSON includes 5 Hono and 8 Undici advisory records but the first evidence draft only named packages/candidates | Retained all 13 linked advisory identifiers and exact affected ranges, explained package-level severity counts, and recorded a separate dependency-maintenance follow-up without accepting or applying updates. |
