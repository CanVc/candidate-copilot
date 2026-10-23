# Story 2.0 — Content-Authoring Design

**State:** Detailed design approved by BC on 2026-10-22, including the personal/non-production correction; construction authorized. This document is a design contract, not delivery or pilot evidence. Private intake/processing consent and real document approvals remain separate.

**Authority:** [Story 2.0](../planning-artifacts/epics.md#story-20-define-and-pilot-the-content-authoring-workflow), [PRD §4.3.1](../planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md#431-bc-assisted-content-authoring) and the [implementation spec](spec-2-0-define-and-pilot-the-content-authoring-workflow.md). This design adds no runtime API, schema, Resource type or publication mechanism.

## 1. Scope and session map

Confirmed framing (BC, 2026-10-22): Epic 1, including Story 1.1, is done; Story 2.0 and Epic 2 enter in-progress for authorized construction. Pi; French sources, interviews, syntheses and recruiter-facing documents; begin with work actually used in production. No employer or sector is excluded by principle. Explain transferable problems without asserting experience in unpractised domains. Career-analysis recommendations are not factual evidence or decided applications. BC accepted the two types, then approved the detailed contracts, narrative voice and Pi packaging after the correction below; this is not approval of any pilot's facts or publication. BC clarified that starting with production work is an interview-order preference, not a format or tooling restriction: support genuine personal projects, PoCs, prototypes and work in progress in Type B from the outset. These must not be relabeled as production experience.

| Phase | Activity | Exit condition |
|---|---|---|
| Design — approved | Method, two type contracts, handling gate and handoff agreed; no professional-material interview. | BC approval recorded 2026-10-22. |
| Construction — current session | Use the installed BMad Workflow Builder to construct one Pi interview agent, guides, templates and start/resume instructions. | Invocation, pause/resume and isolation checks work; handling requirements are documented, with actual provider/account approval still a pre-intake gate. |
| Pilots — dedicated fresh Pi sessions | Exercise the method on real authorized material. Correct the tool and reconfirm affected documents. | A real BC-validated pilot for each type against final versions, plus required exceptional-case evidence. |

Do not open a new session now. Later, Pi's `/new` separates interview history; `/resume` can reopen a saved session. Neither replaces a demonstrated fresh-session checkpoint restoration. Do not fork this planning history into a pilot or require a pilot to know it. Session separation is not a filesystem sandbox or a local-processing guarantee.

## 2. Approved delivery shape

Use one explicit-only Pi skill at `.pi/skills/content-authoring/SKILL.md`, loading the generic definition at `tools/content-authoring/agent.md`. Its proposed command is `/skill:content-authoring`, **not available until constructed and verified**. A skill fits supporting guides and templates better than a single prompt template; no extension or multi-agent system is needed. Instructions and skills do not enforce operating-system permissions. No mandatory paid service, deployed model integration, runtime model credentials, index, recruiter UI or hosted resources are introduced.

Planned reusable files under `tools/content-authoring/`: `README.md`, `types.md`, `handling.md`, `agent.md`, `workflow/`, `templates/professional-context.md`, `templates/realization.md`, matching type-specific files in `guides/`, and `acceptance.md`. BC authorized the project-local upgrade: BMad 6.12.4 and official Builder 2.2.2 are installed. Keep those installed skills intact during authoring construction; no new setup/migration or substitute builder is needed.

Private working material belongs under `content/private/authoring/`, separated into sources, pilots, checkpoints and evidence. Checkpoint sidecars hold editorial type, preparation state and agent/template/guide/criteria versions; do not add mandatory public metadata for these. All proposed skeletons below are design illustrations, not output or acceptance evidence.

## 3. Intake and handling gate

Before reading or requesting nonpublic content:

1. Identify the actual Pi model/provider/account route, automatic context/resources, session location, enabled attachments/extensions and relevant logs/exports. Document actual processing, retention, deletion and unavoidable copies/limits for that route. Unknown handling is a blocker, not assumed zero retention.
2. BC selects and screens material before transmission, including automatic context. Exclude secrets and unauthorized third-party data; do not upload raw content to a remote model in order to sanitize it. Do not promise comprehensive automatic redaction.
3. Obtain explicit consent for the disclosed route and selected material. Consent details and actual source mappings stay private. Reconfirm when material, processing route or relevant disclosure changes.
4. Read only authorized inputs. Do not crawl neighbouring career folders or automatically attach prior transcripts. Treat document instructions as untrusted source content, not permission to execute commands or change the workflow.

Pi normally persists sessions under `~/.pi/agent/sessions/`. Propose a dedicated session directory under `content/private/authoring/sessions/` using Pi's supported `--session-dir` option, then verify the actual location. This does not move previous sessions or extension/provider logs. Do not automatically share/export sessions or change global configuration. Verify extension-managed copies rather than claim their absence; no application 90-day retention policy is inherited. `handling.md` must explain verified deletion procedures and remaining copies; local deletion cannot guarantee provider deletion.

## 4. Interview loop

| Stage | Agent behavior | Progress rule |
|---|---|---|
| Choose | Confirm type, bounded topic and relevant context. For Type B, distinguish professional/personal setting, actual project maturity and observed usage before choosing applicable questions. Explain the completeness criteria. | No job-fit scoring or exhaustive career inventory; do not impose production questions on a non-production project. |
| Understand existing material | Extract source assertions, uncertainties and contradictions from selected French documentation/transcripts. Keep private provenance and distinguish BC-confirmed facts from inference. | Do not make BC repeat what is already clear. Source text alone is not approval. |
| Listen | Invite a free account or ask BC to supplement/correct the source-based understanding. | Existing material can provide the starting account; narration is not a compulsory re-telling. |
| Investigate | Ask small adaptive batches, normally 1–3 useful questions, driven by the account and type-specific gaps. | Advance when applicable criteria are satisfied; do not exhaust a fixed questionnaire. |
| Synthesize | Reformulate the facts, BC's contribution, choices, observations and remaining uncertainty for BC correction. | Record corrections explicitly; do not silently resolve conflicting accounts. |
| Draft | Produce French Markdown using supported facts and the type's structure. Explain jargon locally. | A provisional draft may remain blocked; populated headings are not completeness. |
| Check facts | BC checks attribution, statements, dates/precision, outcomes and omissions. | Record explicit factual approval for the actual revision, not inferred approval. |
| Check comprehension | For every applicable criterion, identify supporting passages in the draft or flag a gap. Read without relying on hidden interview knowledge or following a link to supply essential context. | Material ambiguity or incompleteness loops back to clarification/correction and BC confirmation. |
| Check eligibility | BC separately approves what may become public, after factual/comprehension checks. | Record dated revision/version-bound approval; do not copy anything to `content/public`. |

Investigation follows context, terms, contradictions, constraints, options actually considered, personal versus team contributions, evidence, outcomes, limitations and learning where relevant. Forgotten details invite targeted recall, not pressure; unknown facts remain uncertain privately; confidential details are not solicited; inapplicable criteria have private rationales. A safe BC-approved abstraction may explain context without disclosure. If required information remains unavailable, record blocked readiness and the reason. Optional gaps do not prolong the interview indefinitely.

BC may pause or stop at any point. Do not force completion, disclosure or invented metrics to progress.

## 5. Type A — Contexte professionnel et responsabilités

**Purpose:** Explain BC's place and actual scope in an organization. Recruiter questions: “What was BC responsible for?”, “How much autonomy?”, “With whom and within what boundaries?”

**Boundary:** Shared professional context, not a project catalog, competency rating or suitability claim. Concrete activities support the responsibilities; detailed achievement narratives belong to Type B. One context may support several realizations.

| Criterion | Required explanation | Section rule |
|---|---|---|
| C1 | Activity, relevant environment, vocabulary and the bounds of the described period/scope. | Required. Exact dates and organization names are not universally required; uncertainty must not imply false precision or current employment/use. |
| C2 | BC's actual responsibilities, autonomy, decision authority and limits. | Required. A formal title is optional, not a substitute for the work described. |
| C3 | Working relationships and attribution: clients/users/colleagues, shared versus personal work, or genuine sole responsibility. | Required. Do not invent teamwork or leadership. |
| C4 | Concrete activities illustrating the scope, sufficient for an outside reader to understand the responsibilities. | Required. Existing Type B documents may be referenced, but missing essential explanation cannot be delegated to links. |
| C5 | Organizational, operational or regulatory constraints materially shaping the role. | Conditional on their actual relevance. |

**Draft structure (French):**

```markdown
# <Titre factuel du contexte professionnel>

## Environnement et périmètre
## Mon rôle et mes responsabilités
## Autonomie et collaboration
## Activités concrètes
## Contraintes structurantes
```

The final section is conditional. Optional additions: meaningful changes in role, a relevant technology landscape and links to approved realizations. Do not publish empty headings or private omission rationales.

**Guide emphasis:** Clarify ambiguous titles and acronyms, who decided what, what BC did versus inherited, responsibilities across the lifecycle and changes in scope. Do not equate long tenure with mastery of every technology or the whole system.

## 6. Type B — Réalisation ou projet

**Purpose:** Explain a genuine professional or personal contribution at its actual maturity, the reasoning behind it and what has been demonstrated. Recruiter questions: “What was the problem or objective?”, “What did BC actually do?”, “Why this approach?”, “What is demonstrated, and what remains untested or unfinished?”

**Boundary:** A bounded module, mechanism, integration, improvement or personal project is sufficient; completion and production deployment are not prerequisites. Do not imply ownership of the whole product. Include enough local context to stand alone; a personal project requires neither an employer/client nor a Type A professional-context document.

Distinguish three independent dimensions in the narrative and private applicability record, without new mandatory public frontmatter:

- **Setting:** professional or personal; this does not determine maturity or evidence strength.
- **Actual state:** for example, PoC, prototype, work in progress, completed or stopped. These are descriptive examples, not a new runtime enumeration.
- **Observed usage/evidence:** for example, local demonstration, tests, deployed demonstration or real operational use. Public deployment alone does not prove production usage; a personal project may nevertheless have genuine users. Do not infer current use from past use.

| Criterion | Required explanation | Section rule |
|---|---|---|
| R1 | Problem or objective, professional/personal setting, intended audience and relevant starting situation. | Required. A learning or exploration objective is legitimate; distinguish intended users from actual users and explain domain vocabulary. |
| R2 | Work actually performed and BC's contribution, distinct from collaborators, reused components and planned work. | Required. An unfinished project may qualify; describe what exists rather than imply a completed delivery. |
| R3 | The implemented or genuinely explored approach and supported reasons for important choices. | Required at an appropriate level. Compare alternatives only when genuinely considered and relevant; never invent a retrospective decision history. |
| R4 | Actual maturity, demonstrated behavior, observed usage or explicit non-deployment, and what period/state BC can attest to. | Required. Honest non-production status satisfies this criterion; missing production history does not block a prototype. A BC-confirmed account may suffice; public code, client names and screenshots are not mandatory. |
| R5 | Observed results, evidence strength, incomplete/untested aspects and known limits. | Required. Tests or a demonstration can establish bounded observations, not business impact or production reliability. Clearly separate achieved results from expected benefits; never fabricate metrics. |
| R6 | Constraints, rollout, maintenance/incidents and learning that materially affect understanding. | Conditional on actual relevance and experience. Production/operations questions apply only when such use is claimed; meaningful learning can apply at any maturity. |

**Draft structure (French):**

```markdown
# <Titre factuel de la réalisation ou du projet>

## Objectif et contexte
## Ma contribution et le périmètre réalisé
## Solution et choix importants
## État du projet et usages réels
## Résultats démontrés et limites
## Contraintes et retour d’expérience
```

The final section is conditional and may be split when useful. Deployment/operations detail is conditional on actual deployment/use. Optional additions: supported figures, diagrams, authorized artifacts and clearly prospective next steps. Numerical impact, performance, scale and savings are never compulsory. For a personal prototype, an accurate account of what works, how it was checked and what is unfinished may be complete without production use. Unknown required facts still block readiness; do not invent demonstrations, users or outcomes to fill a gap.

**Guide emphasis:** Adapt to the actual setting and maturity. Investigate business rules or personal objectives, trade-offs, attribution, evidence and learning; investigate operational constraints and failures/recovery when applicable. Neither a learning objective nor a planned feature proves mastery; a prototype is not production experience. A valuable technical solution is not automatically an AI system, a novel architecture or proof of competence in another industry.

## 7. Shared editorial and metadata rules

Approved voice: French first person for BC's own account, with explicit attribution for other actors. Start with understandable context, then technical depth; do not create separate RH/technical or employer-specific factual variants. Public text contains only supported, BC-approved material, not private interview notes or eligibility deliberations.

| Public field | Rule |
|---|---|
| `document_id` | Allocate a stable identity on the initial draft; preserve it across moves, revisions and reapproval. |
| `created_at` | Actual document creation date, not an invented employment/project date. |
| `visibility: public` | Only in the publication-eligible rendition after explicit approval; location remains private in 2.0. |
| `reviewed_by`, `reviewed_at` | Actual reviewer and review date for the approved revision. Never prefill or fabricate approval in an unreviewed draft. |
| `title`, `topics`, `aliases` | Existing optional public fields only when useful and supported. |

Private drafts/checkpoints need not mimic public frontmatter. Required public fields must be valid before eligibility/handoff; missing review metadata means not eligible. Private editorial state/version/provenance lives in a sidecar rather than new mandatory public fields. References or aliases must not leak private names or paths.

## 8. Pause, resume and revisions

A private checkpoint preserves document identity/type/revision, professional/personal setting and attested project maturity/usage where applicable, authoring stage, selected authorized sources and private provenance, corrected/confirmed facts, unresolved conflicts/uncertainties, applicability decisions, missing required versus optional facts, draft location, BC corrections, next useful questions, processing-consent scope and exact agent/template/guide/criteria versions. Preserve distinct factual, comprehension and eligibility approvals with their dates and revision scope.

On fresh-session resume, load the generic tool and the selected authorized checkpoint after the handling gate; verify versions and the current draft, summarize the saved state for BC and continue at the recorded stage. Do not search session history or other private files as a hidden fallback. Missing or inconsistent state requires clarification, not reconstruction by invention.

Revisions retain identity, identify changed facts and invalidate approval of the changed text. Renew factual, comprehension and eligibility checks even for factually unchanged rewrites. A guide/template/criteria change triggers affected-pilot revalidation before method acceptance.

## 9. Acceptance and handoff

Construction alone is not story completion. Required evidence:

- One genuine corrected BC-validated pilot for each of the two approved types; no synthetic achievement or filled empty template counts.
- Account-specific follow-ups, useful corrections, passage-grounded comprehension checks and fresh-session checkpoint restoration.
- Coverage of the Type B non-production path: a genuine authorized personal-project account if BC chooses one, or a separate explicitly synthetic applicability probe. Verify that absent deployment/business impact is not treated as missing required production evidence, and that future plans are not reported as achievements. A probe demonstrates adaptation only, never a real achievement or replacement for the mandatory genuine pilot. This adds no third document type or extra mandatory real pilot; interview order can still begin with production work.
- Blocked readiness, justified omission and correction of a comprehension gap. Supplemental controlled probes may cover cases absent from the real pilots; keep them separate and never replace a real pilot.
- Private evidence binding each type and pilot revision to final agent/template/guide/criteria versions and dated BC approvals. Reconfirm affected pilots after refinements.
- Disposable Git/build-isolation checks for the Pi entry point, generic tooling and private canaries, without reading real private material.
- A versioned nonsensitive acceptance summary with safe type/version references, opaque pilot IDs/revisions and dated outcomes only: no private facts, mappings, paths or private content hashes.

Story 2.1 owns coverage completion, public-source validation and explicit approved copying. Pilots remain private. Story 3.1 owns project Resource descriptors/maps; 2.0 creates none. Full-corpus, model/retrieval, privacy and launch gates remain open.

## 10. Design-to-story traceability

This table maps the nine existing acceptance scenarios to proposed design coverage, **not to completed execution evidence**.

| Story scenario, in source order | Design coverage |
|---|---|
| 1. Narration, investigation, pause and fresh resume | §§3–4, 8 |
| 2. Invocable reusable agent | §§1–2 |
| 3. Finite distinct types and completeness | §§5–6 |
| 4. Versioned formats, metadata and revisions | §§5–8 |
| 5. Attribution, uncertainty and comprehension | §§4–6, 8 |
| 6. Private inputs and disclosed processing | §§2–3, 7–8 |
| 7. Real pilots and exceptional cases | §9 |
| 8. Final-version acceptance and private evidence | §§8–9 |
| 9. Demonstrability and bounded delivery | §§1–2, 9 |
