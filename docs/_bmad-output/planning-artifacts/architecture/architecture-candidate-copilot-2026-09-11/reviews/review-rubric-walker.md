# Review — Good-Spine Rubric Walker

Reviewed artifact: `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md`

Context note: requested `plan.md` and `progress.md` were not present at `/home/cvc/dev/candidate-copilot/`; review proceeded from the architecture spine, companion memlog, and PRD.

## Review

- Correct: The spine fixes the main real divergence points one level below the PRD. It chooses the architecture paradigm and ownership boundary (`application/domain` core with Cloudflare/Hono/browser/provider adapters) at `ARCHITECTURE-SPINE.md:24-37`; public/private content boundary at `ARCHITECTURE-SPINE.md:47-51`; backend-owned answer pipeline at `ARCHITECTURE-SPINE.md:53-57`; canonical D1 runtime state at `ARCHITECTURE-SPINE.md:59-63`; block-level evidence contract at `ARCHITECTURE-SPINE.md:65-69`; pre/post safety gates at `ARCHITECTURE-SPINE.md:71-75`; D1 FTS retrieval at `ARCHITECTURE-SPINE.md:77-81`; replaceable LLM provider/failure behavior at `ARCHITECTURE-SPINE.md:83-87`; public access/API/operator/retention/launch/environment rules at `ARCHITECTURE-SPINE.md:89-123`.

- Correct: Every architecture decision AD-1 through AD-14 has an explicit `Binds`, `Prevents`, and `Rule` line. Evidence: AD-1 begins at `ARCHITECTURE-SPINE.md:41-45`, and the pattern continues through AD-14 at `ARCHITECTURE-SPINE.md:119-123`.

- Correct: Deferred items are mostly bounded by revisit conditions or by already-binding V1 rules, so they do not generally let implementation units diverge. Examples: semantic retrieval is deferred only if D1 FTS launch tests fail (`ARCHITECTURE-SPINE.md:310`) while AD-7 still forbids vector DB/embeddings in V1 (`ARCHITECTURE-SPINE.md:81`); admin dashboard is deferred while CLI-only operator access remains binding (`ARCHITECTURE-SPINE.md:312`, `ARCHITECTURE-SPINE.md:101-105`); immediate visitor deletion is deferred while deletion request/manual handling plus 90-day purge remain binding (`ARCHITECTURE-SPINE.md:313`, `ARCHITECTURE-SPINE.md:107-111`).

- Correct: Named implementation tech is listed with versions or checked-service dates in the stack table (`ARCHITECTURE-SPINE.md:138-152`). The companion memlog records the npm registry check for TypeScript, React, Vite, Hono, Vitest, Playwright, and Wrangler on 2026-09-16 (`.memlog.md:53`) and Cloudflare/D1/Workers AI checks at `.memlog.md:12`, `.memlog.md:25`, `.memlog.md:38`, and `.memlog.md:42`.

- Correct: Functional requirements FR-1 through FR-22 are mapped to architecture locations and governing ADs in the capability map (`ARCHITECTURE-SPINE.md:279-301`). The map covers landing, anonymous conversation, multi-turn, answer language/status, grounding/source excerpts, refusals, retention/deletion, and launch gating.

- Blocker: The spine does not decide/defer/open the PRD-required deletion-request manual review cadence. The PRD explicitly requires “BC must define a manual review cadence before public recruiter use” (`prd.md:254-263`). The spine decides local CLI/script operator access (`ARCHITECTURE-SPINE.md:101-105`) and deletion request metadata/retention (`ARCHITECTURE-SPINE.md:107-111`), but no AD, convention, deferred item, or open item names the cadence or makes it a launch-gate precondition. This fails the checklist item that every owned operations dimension be decided/deferred/open.

- Blocker: The spine does not enforce the PRD’s French-only V1 UI constraint. The PRD states “The V1 UI is French-only” (`prd.md:339-342`) and includes French-only UI in MVP scope (`prd.md:363-365`). The architecture maps FR-1..FR-4 landing experience to `src/web`, CSS, and `content/public` (`ARCHITECTURE-SPINE.md:283`) and has an answer-language rule for FR-7 (`ARCHITECTURE-SPINE.md:286`), but it has no binding rule/convention/deferred/open item requiring French-only UI copy or preventing accidental English/multilingual UI scope. This leaves a spec capability uncovered at architecture-spine level.

- Note: Provider/host log and processing-path privacy is only partially covered. The PRD requires unavoidable host/provider logs to be understood separately before launch (`prd.md:326-337`) and privacy copy to reflect the real storage and AI/provider path (`prd.md:226-234`). The spine decides replaceable providers and failure paths (`ARCHITECTURE-SPINE.md:83-87`) and names Cloudflare managed services/Workers AI (`ARCHITECTURE-SPINE.md:149-152`), but it does not explicitly bind a provider/host logging review or privacy-processing-path verification into AD-13’s launch gate (`ARCHITECTURE-SPINE.md:113-117`) or the deferred/open list (`ARCHITECTURE-SPINE.md:303-316`). This is not as structurally central as the two blockers, but it is an operations/privacy follow-up before launch.

- Note: The detailed D1 schema is acceptably deferred to migrations (`ARCHITECTURE-SPINE.md:316`) because the spine already binds ownership, timestamps, source paths, FTS, retention, and purge behavior (`ARCHITECTURE-SPINE.md:59-63`, `ARCHITECTURE-SPINE.md:107-117`, `ARCHITECTURE-SPINE.md:127-136`).

## Verdict

Needs revision before passing the good-spine gate. The architecture spine is strong and mostly satisfies the rubric, but it should add explicit binding/deferred/open coverage for deletion-request review cadence and French-only V1 UI, and should preferably add launch-gate/provider-privacy verification for host/provider logs and processing-path disclosure.
