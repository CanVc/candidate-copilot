---
title: 'Story 2.0: Define and Pilot the Content-Authoring Workflow'
type: 'feature'
created: '2026-10-21'
status: 'in-progress'
baseline_commit: 'ffc581e614baffed7e3a0f852be4f66e8688584a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/docs/_bmad-output/implementation-artifacts/epic-2-context.md'
  - '{project-root}/docs/_bmad-output/implementation-artifacts/design-2-0-content-authoring.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Amendments delivered no method or pilots.

**Approach:** Deliver one method through interactive design with BC → construction with BMad Workflow Builder → genuine BC pilots. All nine Story 2.0 scenarios in `docs/_bmad-output/planning-artifacts/epics.md` bind execution; amendments prove no implementation.

## Boundaries & Constraints

**Always:** BC approves types/contracts/packaging/facts/publication eligibility during execution, not plan approval. One agent suffices. Tooling stays outside both content trees; working material private/gitignored. Builder is not a runtime dependency; no silent `bmad-build` substitution.

**Never:** Fabrication, pressured disclosure, automatic publication, mandatory paid service or full-corpus/index/runtime/UI/hosted work. 2.1 owns corpus review/copying; 3.1 Resource maps.

**Construction authorization (BC, 2026-10-22):** BC approved the corrected detailed design and authorized construction, then explicitly authorized the project-local BMad/Builder update. Implement the reusable tool and disposable construction checks now; synchronize tracking. Real private-source intake, interviews/pilots and publication still require the later handling/consent gates. No commits/push or unrelated changes. Preserve BC's existing work.

## I/O & Edge-Case Matrix

| State | Expected behavior |
|---|---|
| Forgotten/unknown/confidential/inapplicable | Targeted recall/uncertainty/exclusion without solicitation/privately justified omission; required gaps block, optional gaps do not prolong questions |
| Pause/revision | BC may stop; resume from checkpoint without hidden context; retain document identity and renew factual/comprehension/publication reviews even for unchanged facts |

</frozen-after-approval>

## Code Map

- [Detailed design](design-2-0-content-authoring.md) — BC-approved framing, contracts/formats/guides, processing gate, session map and nine-scenario traceability. Load before construction; design approval is not implementation evidence.
- `sprint-status.yaml` — Epic 1/all its stories are done; synchronize 2.0/Epic 2 to in-progress for construction, never done before real pilot acceptance.
- `_bmad/_config/manifest.yaml`, `.agents/skills/bmad-workflow-builder/` — BMad 6.12.4 and official Builder 2.2.2 installed project-locally; Builder revision `4a1422274a2acb0fb0ec0511753da6263948f072`. Use this Builder, not a substitute. Do not reinstall, rerun setup/migrations or change vendor files; preserve amendment-only specs, PRD/epics and existing work.
- `.gitignore`, `vite.config.ts`, `scripts/check-build-isolation.mjs`, `tests/bootstrap/safety.test.ts` — preserve Git/build isolation; authoring paths are new.

## Tasks & Acceptance

### A. Approve design and handling

- [x] `tools/content-authoring/README.md`, `types.md` — materialize BC's approved detailed design: method, two finite types, per-type purposes/boundaries/criteria and session map. Approval includes the corrected personal/non-production branch, not any document's facts or publication.
- [ ] `tools/content-authoring/handling.md` — document actual Pi/provider processing, session/log copies, retention/deletion and limits. Before nonpublic intake, BC screens selected inputs and automatic context and explicitly consents. Keep consent/provenance private; unknown handling blocks intake.

### B. Authorized construction

- [x] `.pi/skills/content-authoring/SKILL.md`, `tools/content-authoring/agent.md`, `workflow/`, `README.md` — use the installed official Workflow Builder to construct one explicitly invocable Pi skill and start/resume instructions. Package setup is complete; do not rerun it. Keep the delivered authoring tool independent of BMad at runtime.
- [x] `tools/content-authoring/templates/`, `guides/` — implement versioned French formats and adaptive investigation for professional context and realization/project. Type B supports professional or personal work at its actual maturity; production criteria are conditional, not entry requirements. Include required/optional/conditional sections, applicability and passage-grounded completeness. Keep editorial state/version metadata in private sidecars, not new mandatory public fields.

### C. Real acceptance pending — only disposable construction checks authorized now

- [ ] `content/private/authoring/pilots/`, `checkpoints/`, `evidence/` — interview, synthesize, correct and validate one real pilot per type. Demonstrate account-specific follow-ups and fresh-session checkpoint restoration of corrections, facts, uncertainties, decisions and next questions.
- [ ] `content/private/authoring/probes/` — cover blocked readiness, justified omission, comprehension-gap correction and Type B non-production applicability where real pilots do not. A separate synthetic probe may verify adaptation but never substitute for a genuine pilot or achievement; no third type or extra compulsory real pilot is introduced.
- [ ] `tools/content-authoring/acceptance.md`, `content/private/authoring/evidence/` — refine/revalidate affected pilots against final agent/template/guide/criteria versions. Privately bind types, versions, pilot revisions and dated BC factual/comprehension/eligibility approvals. Version only safe references, opaque pilot IDs/revisions and dated outcomes, never private facts/paths/hashes/mappings. Explain the 2.1 handoff.
- [x] `scripts/check-build-isolation.mjs`, `tests/bootstrap/safety.test.ts` — use disposable Pi-entry-point/tooling/private canaries to prove Git/build exclusion without touching real private files.

**Acceptance Criteria:**
- Given authorized inputs, when authoring starts, then selected French material is reused without mandatory re-narration; inference is not treated as BC-confirmed fact.
- Given an approved type, when drafting, then each applicable criterion cites actual draft passages or a gap; hidden interview knowledge and links cannot fill missing explanations.
- Given a genuine personal/non-production project, when applying Type B, then distinguish its setting, maturity, observed results and future plans; absent production use alone never blocks readiness, and tests/demos do not imply business impact or production experience.
- Given unavailable required facts, when assessing readiness, then block without invention or disclosure pressure; optional gaps do not prolong questioning indefinitely.
- Given a revised document, when seeking renewed eligibility, then preserve `document_id` and renew factual/comprehension/publication checks even for factually unchanged rewrites. Never fabricate `reviewed_by`/`reviewed_at`.
- Given final delivered versions, when accepting the method, then all nine source scenarios have evidence and both types have genuine BC-validated pilots; no automatic public copying or other gate closure follows.

## Design Notes

Confirmed 2026-10-22: Pi; French authoring; no employer/sector exclusions; selected documentation/transcripts may seed interviews. Start interviews with production work, but support personal projects, PoCs, prototypes and work in progress from the initial tool design. Two working types: professional context/responsibilities and realization/project. Professional/personal setting, actual maturity and demonstrated usage are distinct; no mandatory production deployment or business impact. Career analyses are orientation hypotheses, not applications or skill evidence.

BC approved the corrected detailed design, first-person voice, Pi packaging and session procedure, then asked to continue. This run constructs the tool; later pilots use fresh sessions and private checkpoints. A fresh session guarantees neither filesystem isolation nor local-only processing. Actual provider/account handling and processing consent remain mandatory before nonpublic intake.

## Implementation Notes

- 2026-10-22: Planning approval is now persisted after the project-local BMad upgrade. Installation verification found all 34 BMad skills discoverable by Pi without diagnostics and preserved existing planning/application work; no authoring tool or real pilot existed at construction start.
- Construction scope: deliver the generic tooling plus disposable isolation/checkpoint/probe tests; no real `content/private` reads/writes or neighbouring career-folder access. Prepare `acceptance.md` with explicit pending pilot/handling gates, not fabricated outcomes. Do not mark the story done or pilot tasks complete.
- Use the installed Builder's actual scaffolder, memlog and lint tooling. Pi's supported `disable-model-invocation: true` is a necessary platform-specific frontmatter addition; validate it with the Builder validator's `--allow-key disable-model-invocation`. No vendor edits. Installed `memlog.py` has `init`, `append`, `set`, not `set-complete`; record construction events with the real append API, not a nonexistent lifecycle command.
- Runtime state uses private structured checkpoints carrying both facts and decisions; the Builder construction memlog under the skill contains nonsensitive construction decisions only. No BMad runtime dependency. Prefer standard-library-only helpers if deterministic checkpoint validation needs code. The selected provider/account is a later preflight input, not a fact to invent or a reason to read secret settings now.

### Construction delivery and verification — 2026-10-22

- Built the single explicit-only Pi entry, French start/resume instructions, agent, finite A/B contracts, two versioned Markdown formats and investigation guides, handling preflight, checkpoint/review procedures, per-type private JSON skeletons, version manifest and nonsensitive `tools/content-authoring/acceptance.md`. Type B treats professional/personal setting, maturity and observed use independently; no production, employer, Type A context or business-impact prerequisite. Selected authorized French documentation/transcripts may supply the initial account instead of mandatory re-narration.
- Runtime memory is a private structured checkpoint carrying facts **and** decisions, corrections, provenance, uncertainty, applicability, gaps and next questions. The stdlib-only helper checks containment, exact versions, identity, revisions, draft-byte/passages binding, approval record shape and atomic single-file saves. It cannot authenticate consent/approval or judge meaning. Rewrites, including factually unchanged rewrites, reset all three reviews; previous review records remain private. Unknown scope can be checkpointed without invention. Neither helper nor runtime instructions call BMad.
- Parent scaffolding/init was retained, not rerun. The existing construction memlog was read once and thereafter updated only via the installed `memlog.py append --path ... --type ... --text ...` API; no nonexistent set-complete call or vendor edit. Headless customization defaults to **NO**, logged; no customization surface or runtime resolver. Full model/baseline/variant evals and real-input runs were not authorized, so no semantic superiority or method acceptance is asserted.
- Checkmarks above mean **materialization/construction checks only**, not method acceptance. `handling.md` exists, but its combined handling/consent task remains unchecked because provider/account route, retention/deletion/copies and BC consent are unknown. All real pilot/probe/evidence/acceptance tasks remain unchecked. Story remains in-progress. Tracking is parent-owned and was not edited by this construction worker.

Exact verification commands from the project root:

```sh
uv run _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-workflow-builder --project-root . --key workflow
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/quick_validate.py .pi/skills/content-authoring --allow-key disable-model-invocation
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-path-standards.py .pi/skills/content-authoring
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-scripts.py .pi/skills/content-authoring
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-scripts.py tools/content-authoring
python3 .agents/skills/bmad-workflow-builder/scripts/count_tokens.py .pi/skills/content-authoring/SKILL.md
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/content-authoring/scripts/tests -v
git diff --check
```

Results: customization resolution succeeded (empty hooks/facts/standards/required evals, 2000 desired/3000 budget); quick_validate **exit 0**, no errors with the authorized Pi key. Official path scan **exit 1 / raw fail**, exactly two high findings: required root `.memlog.md` misclassified as prompt content, and Pi's supported `disable-model-invocation` rejected as an unknown key. These conflict with mandatory task/Builder/Pi requirements, not malformed project paths. No vendor patch, journal move or removal of explicit-only protection was attempted to manufacture a green result. **Parent disposition is pending; the Builder path gate is not claimed clear.** Script scans **exit 0**, no internal entry scripts and one external helper with tests/no findings. Ruff is absent (`uv run ruff --version` could not spawn it), so that scanner result does not establish external Ruff lint. Token count **716 / fallback chars-over-four**, under both thresholds, not exact tiktoken. Manual canon/leanness review kept only task-specific gates/wiring in the entry and branch resources; no full Analyze fanout or model comparison was performed. Final helper suite **19/19 PASS** (initial pass 17, before the independent scope/unknown-pause additions).

Tooling side effect/limit: the exploratory `uv run .agents/skills/bmad-workflow-builder/scripts/count_tokens.py --help` materialized **seven packages in the installed script's isolated uv cache**. No helper/application package, lockfile, vendor file or global/default setting changed, but this is an acquisition outside a strict no-new-packages reading. It is disclosed, not hidden or undone by deleting shared caches. Actual token measurement subsequently used plain Python's documented fallback and further scanners used `UV_OFFLINE=1`. Parent review of this deviation remains pending.

Application checks used the documented fnm selection **inside a child Bash**, without changing the parent shell or global defaults. Exact commands:

```sh
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && node --version && npm --version && bash scripts/check-workstation.sh'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && node tools/content-authoring/scripts/tests/pi-entry.mjs /home/cvc/.local/share/fnm/node-versions/v24.15.0/installation/lib/node_modules/@earendil-works/pi-coding-agent'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && npm exec -- vitest run tests/bootstrap/safety.test.ts -t "publication boundaries"'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && npm exec -- vitest run tests/bootstrap/safety.test.ts && node scripts/check-build-isolation.mjs'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && node --check scripts/check-build-isolation.mjs && node --check tools/content-authoring/scripts/tests/pi-entry.mjs && npm run typecheck'
```

All these commands **exit 0**. Node **24.22.0** / npm **11.19.1** selected; Ubuntu 24.04.5 LTS, Git 2.43.0; workstation gate PASS. Pi **1.3.0** installed docs (`skills`, `sessions`, `cli`, `security`) and relevant SDK examples were read before APIs/flags. The documented loader on an owned synthetic project found one skill with zero diagnostics, explicit-only flag true and no automatic model skill-prompt entry; routed generic resources exist. This is loader wiring, not interactive command execution or model behavior. No session/auth/provider/model was constructed or called by the probe.

Focused safety selection: **8 PASS / 7 skipped**; subsequent whole `tests/bootstrap/safety.test.ts`: **15/15 PASS**, including existing terminal checks and synthetic Git fixtures. Standalone isolation: frontend/Worker exclude **33 disposable raw/base64 canaries**, including Pi entry/tooling/private-state-shaped fixtures; only owned application-input copies are built. Generic skill/tooling remains intentionally versionable; private canaries are Git-ignored, and build exclusion is verified independently. Syntax checks and all four TypeScript configurations PASS. The available Wrangler skill was loaded before Wrangler-backed checks; only the existing protected dry-run builds ran, with disposable HOME/XDG/npm/Wrangler cache and no source upload/deployment or account inspection.

Final rerun of the official quick/path/script scans retained the exact results above (quick 0, path 1 with the same two findings, both script scans 0, token fallback 716). Whitespace/new-file and unchanged source/configuration checks **exit 0**, with **22 construction files PASS** (no construction-memlog reread):

```sh
python3 - <<'PY'
from pathlib import Path
paths = sorted(p for p in Path('tools/content-authoring').rglob('*') if p.is_file())
paths += [Path(p) for p in ['.pi/skills/content-authoring/SKILL.md', 'scripts/check-build-isolation.mjs', 'tests/bootstrap/safety.test.ts', 'docs/_bmad-output/implementation-artifacts/spec-2-0-define-and-pilot-the-content-authoring-workflow.md']]
errors = []
for path in paths:
    text = path.read_text(encoding='utf-8')
    if not text.endswith('\n'):
        errors.append(f'{path}: missing final newline')
    for number, line in enumerate(text.splitlines(), 1):
        if line.rstrip() != line:
            errors.append(f'{path}:{number}: trailing whitespace')
assert not errors, errors
print(f'PASS: whitespace for {len(paths)} construction files (construction memlog not reread).')
PY
git diff --check
git diff --exit-code -- package.json package-lock.json .gitignore vite.config.ts wrangler.jsonc tsconfig.json tsconfig.frontend.json tsconfig.worker.json tsconfig.tooling.json src frontend
```

`acceptance.md` maps all nine Story scenarios and records commands, raw lint results, pending gates and limits. No real content/private material, neighbouring career directory or professional achievement was read/created/modified. No real interview/pilot, model/provider/eval call, publication, commit/push, new application dependency/configuration or unrelated work was performed. No actual provider/account handling or deletion was verified. Deterministic tests establish neither real-input fidelity, comprehension, genuine pilots nor method acceptance. Story 2.1 copying/corpus and 3.1 Resource maps remain out of scope; privacy/model/retrieval/launch gates stay open.

### Parent construction handoff — 2026-10-22

The parent inspected the reviewed fixes and independently reran 31 helper tests, the Pi loader probe, all 15 safety tests, the 33-canary dual-build isolation check and all four TypeScript checks under subprocess-selected Node 24.22.0/npm 11.19.1: PASS. Quick validation passes with the supported Pi key allowance. The official path scan remains raw fail with exactly the two documented compatibility exceptions and no additional findings; no vendor change or blanket suppression. The script scanner reports no findings but does not prove unavailable Ruff lint. Versions/skeletons and whitespace are coherent; 524 protected pre-existing files and HEAD remain unchanged, with no staging/commit.

Construction 1.0.1 is available for preflight, not accepted as a proven editorial method. Actual provider/account handling, informed consent, genuine per-type pilots, fresh-session interview evidence and dated BC document/method approvals remain pending in this story. No private intake or pilot was authorized or performed. Full Builder Analyze/model-baseline/trigger evaluations have not been run; optional follow-up only with explicit authorization. Detailed commands, supported review findings/fixes and verification limits remain in `tools/content-authoring/acceptance.md`.

### User-requested pause — 2026-10-22

BC paused the work. Construction 1.0.1 is saved, not method-accepted; no work should continue unattended. Resume from [the handoff](handoff-2-0-content-authoring.md), not a fresh discovery/build: next ask the intended provider/model/access type without credentials or professional sources, then complete handling/consent before real pilots. Preserve all uncommitted installation/planning/tooling work. Story remains in-progress; no real private interview checkpoint exists from this construction phase.

## Spec Change Log

## Review Triage Log

## Verification

Preparation: whitespace, local links, metadata/criteria/scenario coverage, unchanged frozen intent and unrelated work. Execution: `git diff --check`; `npm exec -- vitest run tests/bootstrap/safety.test.ts` with the documented toolchain/disposable builds. BC inspects invocation/resume and private evidence; automated checks/probes do not prove fidelity, comprehension, genuine pilots or acceptance.

### Appended construction-review triage — 2026-10-22

Accepted fix pass only, not new discovery/build or a real pilot. Original executed-check history above is preserved; frozen intent, task gates and in-progress status are unchanged.

- **Approval-history loss — fixed:** a newly appended full `{revision, approvals}` snapshot is required whenever an existing non-null approval is removed/replaced, including same-revision handling/source changes. Existing history remains append-only; adding a previously absent approval requires no archive. Validate/save regressions cover failure preservation and successful archival/replacement.
- **Omitted draft — fixed:** newly accepted candidates require explicit nullable `draft`; a previously accepted absent-as-null predecessor can be repaired with stable identity/history and the next sequence. First draft/version changes still require a new revision. Initial rejection and legacy repair/save regressions added.
- **Stale public-review metadata — instructions corrected:** revised text or withdrawn reviews also withdraw `visibility: public`, `reviewed_by`, `reviewed_at`, preserving `document_id`/`created_at` and private review history. Two-pass finalization uses only newly collected real metadata, stays private/provisional with approvals null, then requires three exact-final-byte reapprovals. Templates/README/agent/review/checkpoint agree. A synthetic byte-binding regression manually simulates these edits; it does not prove model instruction-following, frontmatter enforcement or human approval. No real files rewritten/published.
- **Non-standard JSON — fixed:** the parent's `/tmp/candidate-content-authoring-build-lzia9le9/parent-probes.json` confirmed accepted NaN; intake now rejects NaN/±Infinity and float overflow, serialization independently forbids nonfinite values, and failure preserves the old checkpoint with safe JSON diagnostics. No deep-recursion defect claimed: the parent's 2000-layer probe returned valid JSON diagnostics.
- **Scanner dispositions — accepted compatibility exceptions:** official raw path scan still **fail / exit 1, exactly two high**: root construction `.memlog.md` required by Builder, and Pi-supported `disable-model-invocation` required for explicit-only invocation. Parent accepts these compatibility exceptions; no fabricated green, journal move, flag removal or vendor edit. `quick_validate --allow-key disable-model-invocation` passes.
- **Process deviation — disclosed:** seven packages fetched earlier by installed `count_tokens.py --help` live in its isolated uv cache, not project dependencies. No shared cache deletion; this fix pass uses plain Python or `UV_OFFLINE=1`, with no acquisitions. Ruff remains unavailable; no external Ruff lint claimed.

### Appended implementation/verification — 1.0.1

Agent/release and changed templates A/B are **1.0.1**; unchanged guides/criteria **1.0.0**, checkpoint schema **1**. Both JSON skeletons match exact versions. No real pilots exist to migrate/reapprove. Writes are limited to generic authoring resources, this appended story note and installed `memlog.py append` construction entries; no runtime BMad/customization dependency, tracking/vendor/app/global changes, other workflow or subagent.

Final checks from project root: `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/content-authoring/scripts/tests -v` **31/31 PASS**, adding 12 regression tests to the prior 19 (an intermediate fix pass ran 29/29). Offline Builder quick validation with Pi allowance **exit 0**; path scanner **exit 1 / two accepted high**; script scans on skill and tool **exit 0** (0/1 scripts, 0 findings). Plain Python `count_tokens.py .pi/skills/content-authoring/SKILL.md` **716 fallback chars/4**; helper `--help` **exit 0**. `UV_OFFLINE=1 uv run ruff --version` **exit 2**, unavailable, no install. Standard-library AST **2 Python files**, strict JSON **3 manifests/skeletons**; whitespace **19 tool/spec files** without memlog reread, `git diff --check` and unchanged app/dependency/config diff **exit 0**. Exact rerun commands and limits are appended in `tools/content-authoring/acceptance.md`. JavaScript untouched; earlier Node/Pi/app execution history retained, not rerun in this pass.

Actual provider/account processing, retention/copies/deletion and consent, genuine BC pilots A/B, fresh interview restoration, exceptional-case evidence, three dated final-rendition reviews and human method acceptance remain pending. No real content/private/career material read/created, model/provider/eval call, publication, commit/push or human approval claimed. Story 2.0 remains **in-progress**.
