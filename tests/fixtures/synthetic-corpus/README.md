# Synthetic corpus for local development

This is **fictional test data** for local development. It is not a reconstruction of private files, BC's biography, a set of real authoring pilots, or evidence that the real public corpus has been approved. No private career sources or previous sessions were used.

The three French Markdown sheets describe a fictional museum collections role. Their first-person narrator is an invented person, **never BC**. All organizations, dates, contributions, measurements, demonstrations and outcomes within the narrative are invented. Document `created_at` and `modified_at` values instead record the actual creation/edit time of these fixture files; they do not date the fictional professional events.

## Documents

| File | Editorial structure | Scenario |
| --- | --- | --- |
| [mission-regie-collections.md](documents/mission-regie-collections.md) | A — professional context and responsibilities | Collections coordination, January–December 2024; explicit decision boundaries and collective contribution |
| [projet-reperage-reserves.md](documents/projet-reperage-reserves.md) | B — realization/project | Internal location inventory, February–June 2024; operational use only inside the fictional narrative; limited metrics and unresolved anomalies |
| [projet-prototype-prets.md](documents/projet-prototype-prets.md) | B — realization/project | Paper/spreadsheet loan-tracking prototype, September–November 2024; no deployment, real loans or proven productivity gain |

## Boundaries and intended use

- Keep the source fixtures versioned under `tests/fixtures/`, outside `content/public/`. Local synthetic working copies may be used under `content/private/synthetic-corpus/` as described below. Never mix them with real career evidence or publish them as BC's professional work.
- Each sheet carries its own fiction warning so that opening or copying a single sheet does not remove its basic provenance. Any later chunking/evaluation integration must also preserve that synthetic context; it must never be silently treated as genuine evidence about BC.
- The sheets reuse the existing A/B headings and documentary fields. Each has a stable unique UUID, real UTC file timestamps, and empty `reviewed_by` / `reviewed_at`. `visibility: public` is deliberately absent. These are draft test inputs, **not a final valid public corpus**. The strict public-source validator rejects them as-is.
- No approval, private checkpoint, per-version owner consent or real publication eligibility is fabricated. Normalization into additional disposable test cases must not mutate these files or represent synthetic approval values as human acceptance.
- The README is a fixture guide, not a fourth knowledge sheet. A test harness must select only the three files under `documents/` explicitly; no retrieval/model test harness or application corpus-selection override is implemented here.
- Do not widen the application's production source boundary from `content/public/` to consume these fixtures. Disposable tests use separate workspaces; the approved prepared development copies stay within the existing public boundary. This acceptance does not index, invoke an application LLM provider or deploy anything.
- Story 2.0's historical method/pilot acceptance remains unchanged. These files do not replace its genuine pilot evidence or establish real-career acceptance. Story 2.1 is amended to accept separately prepared development copies, not these drafts or a real portfolio.

## Approved public development copies

On 2026-11-18 BC approved three separately prepared copies under `content/public/` for continuing synthetic development. They preserve IDs, creation times, narratives, links and fiction/non-attribution warnings, but add public visibility, genuine final BC development-review metadata and actual preparation times. Development-only authorization replaces obsolete no-approval wording in those copies only. This is not recruiter-publication approval, historical pilot approval or evidence of BC achievements. The original fixture sheets here and selected private drafts remain byte-for-byte unchanged and must still be rejected as-is. See `content/README.md` and the Story 2.1 development handoff.

No advance question map or exhaustive completeness is an acceptance prerequisite. BC accepts gaps; later runtime must say when evidence is insufficient without inventing or widening scope. Grounding, missing-information and scope evaluations remain required.

## Private working copies

The three sheets have initial byte-identical working copies in `content/private/synthetic-corpus/` for rehearsing the private-draft authoring path. Their fiction warnings, document identities, timestamps and empty review fields are preserved; copying is not an edit, interview, approval or public promotion.

The private directory is ignored by Git and is **not a backup**. The source fixtures remain here; no automatic synchronization is configured. Later edits to a working copy must update its actual `modified_at` and keep the synthetic provenance and review rules intact. These copies do not reconstruct missing real documents or create authoring checkpoints.

## Example questions and expected documentary coverage

These optional examples are **scripted expectations for future tests**, not executed retrieval or model evaluation results. They describe answers within the fictional scenario, never facts about BC. The test setup and output must make that fictional scope explicit.

| French question | Relevant document / section | Expected support or limitation |
| --- | --- | --- |
| « Est-ce que BC a réalisé ces projets ? » | Fiction warnings in every sheet | No; the narrator and all professional events are fictional and unrelated to BC |
| « En quoi consistait cette mission de régie ? » | Mission: Environnement et périmètre; Mon rôle et mes responsabilités | Explain object location/movement coordination and the January–December 2024 boundary; no restoration responsibility |
| « Qui décidait d'autoriser les prêts ? » | Mission: Mon rôle et mes responsabilités; Prototype: Ma contribution et le périmètre réalisé | The conservator, not the first-person narrator |
| « La personne a-t-elle vérifié seule les 600 objets ? » | Inventory: Ma contribution et le périmètre réalisé | No; checks were collective with two collections agents |
| « Comment les emplacements étaient-ils codés ? » | Inventory: Solution et choix importants | Reserve/furniture/shelf; location code is distinct from object identity |
| « Combien d'anomalies sont restées ouvertes ? » | Inventory: État du projet et usages réels | 33 of the initial 150; 117 resolved, without claiming every museum object was verified |
| « Les 150 anomalies concernaient-elles 25 % des objets ? » | Inventory: État du projet et usages réels | Unknown distinct-object count; multiple anomaly entries may concern one object, so that percentage cannot be inferred |
| « Le temps de recherche a-t-il diminué ? » | Inventory: Résultats démontrés et limites | Fictional median 12 to 3 minutes on 24 objects; same agents/sample; not total saved labor or established financial benefit |
| « Chaque objet était-il retrouvé neuf minutes plus vite ? » | Inventory: Résultats démontrés et limites | No such conclusion; difference of medians is not a per-object gain or the median of paired gains, and individual timings are unavailable |
| « Le prototype de prêts a-t-il servi en production ? » | Prototype: État du projet et usages réels | No deployment or real loans; an internal demonstration with 12 invented dossiers |
| « Le prototype a-t-il fait gagner neuf minutes ? » | Prototype: Résultats démontrés et limites; Inventory: Résultats démontrés et limites | Do not transfer the inventory project's metric to the prototype; no measured productivity gain for the prototype |
| « Le retour partiel a-t-il été testé ? » | Prototype: Résultats démontrés et limites | No; neither partial returns nor concurrent editing were evaluated, even within the fictional narrative |
| « Quel était le budget et le montant économisé ? » | Mission: Contraintes structurantes; both projects: Résultats démontrés et limites | No established budget or savings; do not invent figures |
| « Ce musée utilise-t-il encore ces outils aujourd'hui ? » | Both projects: État du projet et usages réels | No documented use after December 2024; do not infer current use |

In a future scoped-retrieval test, selecting only the prototype must not retrieve the inventory's numeric results, even though the prototype links to that other sheet. Local links explain relationships; they do not authorize scope widening or require retrieval of a linked file.

## Original-draft public-validation rejections

The table records expectations, **not results from such a validator**; it is not an execution report. The implemented gate’s rejection results are exercised separately in `tests/bootstrap/public-content.test.ts`; the local self-check below confirms only the deliberately unapproved shape.

| Current fixture input | Required public-validation result |
| --- | --- |
| No `visibility: public` | Reject as not explicitly public |
| Empty `reviewed_by` | Reject missing real reviewer metadata |
| Empty `reviewed_at` | Reject missing real review timestamp |

Passing the local fixture self-check must not reverse any of these expected rejections or imply publication approval.

## Local fixture self-check

From the repository root, run this read-only Python-standard-library check; it neither installs packages nor writes fixture files:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 tests/fixtures/synthetic-corpus/check.py
```

Expected: six `unittest` cases pass. They check the exact three-file inventory; unique UUIDs and quoted UTC timestamps with valid ordering and no future dates; empty approvals and absent public visibility; synthetic warnings and A/B headings; local link containment; scenario arithmetic; documented question/negative-case coverage; and whitespace. The files' actual timestamps were captured from the UTC system clock when authored; syntax/order checks cannot independently authenticate their historical creation event or human approval. The command does not run retrieval, generate answers, validate the production public corpus, verify real career facts or prove exclusion from every future build.

## Resuming work with real content

BC can recreate and approve real sheets later using the existing authoring workflow. Replacing the fictional development scenario with real content still requires explicit public selection, actual review metadata, publication authorization and the corresponding safety/provenance checks. Preserve the fixtures as test data rather than converting their fictional claims into career facts. Synthetic test success is not launch approval or real-corpus acceptance.
