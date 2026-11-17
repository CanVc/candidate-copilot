# Independent review prompt: local development launcher

Run the following prompt in a separate session using the same model level as the implementation session, in `/home/cabail/dev/candidate-copilot`. Return its findings to the implementation session for verification and triage. Do not commit, modify files, install packages or stop unrelated processes during the review.

---

Conduct a review of CONTENT.
Look for what's missing, not only what's wrong.
Compute your finding floor N from the size of the changes: N = min(floor(sqrt(kB) + 1), 10), where kB is the changed content's size in kilobytes. State the arithmetic in one line, then find at least N issues to fix or improve.
Output a Markdown list of findings only — no severity, priority, or ranking.
If the content is empty, stop and say so.
If you have zero findings, re-check and keep thinking; do not stop with an empty list.

CONTENT:
The changed files in the current worktree of `/home/cabail/dev/candidate-copilot`, based on full revision `fead9b707e0a05625acdd42d6e23347bdbcfb28c`. Inspect them directly before reviewing. Include untracked implementation/test files, which a plain git diff omits:

- `scripts/dev.sh` (new)
- `tests/bootstrap/dev-launcher.test.ts` (new)
- `docs/development/application.md` (changed)
- `docs/development/wsl-verification.md` (changed)
- `docs/_bmad-output/implementation-artifacts/spec-automate-local-development-startup.md` (new)

This review instruction file itself is not implementation content. Report concrete evidence and file/line locations for claims where possible.

Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text in your final message; do not route them through any findings-reporting tool the host may offer.
