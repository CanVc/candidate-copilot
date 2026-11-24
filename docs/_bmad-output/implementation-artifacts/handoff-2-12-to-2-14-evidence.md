# Supervisor evidence check — stories 2.12–2.14

Scope: review of existing evidence; not a new live run, BC acceptance, release approval or permission to repeat the pilot. AC numbers follow the order in `epics.md`.

| Story / criteria | Evidence supported | Outstanding / disposition |
|---|---|---|
| 2.12 AC1 | Dated Cloudflare pricing and candidate model evidence; BC observed Workers Free active on 2026-11-23 at 14:01 and no AI Gateway displayed (`67006cb`). The bounded direct pilot at `e393541` checks membership separately from plan and fixes the model/host. | The historical receipt (`292a93b`) reports 1 classifier attempt, 0 generator attempts, `processing_unavailable`. No HTTP status, remote completion, consumption or successful response was established. Do not diagnose quota or timeout from it. |
| 2.12 AC2–AC4 | Credential-free simulation stays default. Offline tests inspect actual wire projections and fictional A05 sentinels; pre-admission and post-admission failure and replay behavior verified locally (`7c73311`). | The operator pilot is separate from normal application startup. These tests are not live generator proof; final disclosure placement/copy has its own UI criteria. |
| 2.12 AC5 | Negative fixtures cover known vs unknown provider errors. Free/no-paid-path evidence combines official terms, operator observation and fixed direct configuration, not the presence of a software guard alone. | No measured live quota/exhaustion behavior, invoice or model success. Do not spend quota to manufacture a billing test. Keep the story open for actual integration evidence. |
| 2.13 AC1–AC3 | Snapshot at `b1c0604`: deadline/lease/transport settings separate; cancellation and persisted controlled failure; lost/late receipt, ownership and replay exercised on disposable D1. | Local behavior validated; a locally expired attempt is not evidence that remote computation stopped. |
| 2.13 AC4 | Logical counters remain unchanged, no new cooldown or execution cap adopted. | A08 usage evidence for interrupted/manual recovery and a BC/architecture decision are absent. One dispatch count is not cost evidence. |
| 2.14 AC1 | Pinned cases, version and capture protocol (`0886d03`); one sanitized operator receipt exists. | No completed actual evaluation with outputs and independent human judgments. |
| 2.14 AC2–AC3 | Inputs/probes cover missing evidence, professional boundaries, clarification, long questions, FR/EN and original-language excerpts. | Input validation is not an assessment of a model's meaning, citation support or answer language. |
| 2.14 AC4 | Protocol distinguishes retrieval failures, generator failures, unknown observations and sharing blockers. | No quality verdict; the pilot is an unsuccessful observation, not a generated answer. |

Disposition: these stories are not human-accepted. Continue independent local UI work sequentially using public fictional development data and the existing contracts. This does not close the evaluation gate before UI completion or authorize public sharing, a new live attempt, push or deployment.

The offline diagnostics follow-up at `b29ee29` adds prospective stage/failure reporting. All 67 focused pilot tests passed; the broader isolated run passed 1,032/1,035 with three environment-related failures. It neither reclassifies the historical receipt nor authorizes a second attempt.

## Séance finale avec BC

| Story / critère | Décision ou geste attendu | Preuves à préparer | Ce que cela bloque réellement |
|---|---|---|---|
| 2.12 AC1/AC5 — intégration réelle | Si une preuve de bout en bout reste souhaitée, décider séparément d’autoriser ou non un **essai distinct** et borné ; ne pas relancer le pilote consommé. | Reçu historique `292a93b`, [diagnostic hors ligne](spec-2-12-offline-pilot-diagnostics.md), observations gratuites déjà consignées. Pas de secret à fournir ici. | Preuve d’intégration et acceptation, pas le travail UI local ; aucune nouvelle permission acquise. |
| 2.13 AC4 — A08 | BC/architecture : examiner les mesures d’exécutions interrompues/récupérées quand elles existent avant de décider d’un contrôle additionnel ou de son absence. | [Spec et limites de mesure](spec-2-13-bound-processing-and-expose-honest-failure-outcomes.md) ; séparer appels, tours et coût. | Acceptation A08 et exploitation ; pas les contrats locaux indépendants. |
| 2.14 AC1–4 — qualité | Si de vraies sorties sont disponibles, les faire lire et juger sur l’interprétation, les extraits, les langues et les refus ; sinon maintenir le constat d’absence. | [Protocole et cas épinglés](spec-2-14-evaluate-actual-global-scope-answers-before-ui-completion.md), sorties assainies et jugements indépendants, sans données privées. | Achèvement UI au sens de l’épic et partage public, pas le développement local indépendant. |
| 2.15 AC1/AC3/AC5 — textes et identité | BC/UX : lire les textes français sur le rendu réel ; confirmer uniquement les valeurs d’identité publiables qui ne sont pas déjà validées. | [Preuves par critère](spec-2-15-enter-a-french-portfolio-conversation-with-optional-guidance.md#verification) et [scénarios Chromium](../../../tests/e2e/portfolio-entry.spec.ts). Rendus locaux fictifs après corrections : accueil [1280 px](evidence-2-16/entry-landing-desktop.png) / [320 px](evidence-2-16/entry-landing-mobile.png), guide et clarification simulée [1280 px](evidence-2-16/entry-guide-desktop.png) / [320 px](evidence-2-16/entry-guide-mobile.png). | Acceptation des textes et de l’identité, pas la mise en place des emplacements ni les tests sur fixtures. |
| 2.16 — lecture et inspection | Lors de la revue des textes et de l’accessibilité, lire une réponse puis ouvrir sa source sur grand et petit écran. Dire si le passage, l’extrait cité et la mention « sans rapport avec BC » sont compréhensibles ; ne pas juger un modèle à partir de cette simulation. | [Scénarios de lecture, preuves et limites](spec-2-16-read-answers-and-inspect-passage-local-source-excerpts.md#verification). Les captures ci-dessus montrent l’entrée et la clarification, pas le panneau de sources. | Jugement humain sur les textes et l’usage ; pas le développement local indépendant, ni une permission de diffusion. |

**2.17 — geste à réserver à la revue humaine.** Sur appareil réel, saisir la question suivante au clavier/IME pendant l’attente, relire un passage et vérifier le retour au brouillon. Évaluer avec l’AT (technologie d’assistance) les annonces d’attente, de refus et de réception et faire lire les libellés français. Les mesures de viewport ne répondent pas à ces questions. **P1 avant publication :** Échap depuis le brouillon peut rendre le focus à la citation si le panneau non modal est ouvert. C’est une interaction clavier distincte de l’arrivée du reçu, qui préserve le focus dans les cas testés. Les réserves 2.12–2.16 ci-dessus restent ouvertes, notamment l’évaluation réelle 2.14 et la décision A08 ; aucun de ces jugements n’a été rendu à la place de BC.

Aucune reconfirmation du plan Free ou de la décision A05 n’est demandée. Cette séance ne vaut ni accord de publication ni feu vert automatique pour un nouvel appel. Les vérifications du runner restent à la charge de l’équipe technique, pas de BC.

## Reprise technique après 2.17

Travail local 2.17 terminé avec notes. La [spec, section Verification](spec-2-17-compose-the-next-question-without-altering-the-sent-one.md#verification) identifie le diff testé, les commandes isolées (368 tests), les issues POST/GET, les limites et le triage. Le GET projeté après refus n’a jamais écrit une deuxième réponse. Ni acceptation BC, ni clôture d’épic, ni lancement.

**Action immédiate du parent : vérifier, puis commiter localement les seuls fichiers de travail relus.** Sur `work/epic-2-stories-2-12-through-2-22`, parent attendu `7b2f792b115e06fddd8688777d9300e2f8a8453c`. Ne pas commiter l’ancien index tel quel : son SHA-256 `101e4239756d060988818a6c2bad3b1ad9cc7d117b324dfab03cdc6af30acb6e` représente une préparation antérieure (12 chemins), pas le candidat vérifié. Contrôler les trois vues, les non-suivis, les 12 sources/tests et les trois documents de suivi ; s’arrêter sur toute dérive. Aucun nouveau test sur code inchangé n’est nécessaire pour cette mise à jour documentaire.

**Seulement après ce commit**, relever `git rev-parse HEAD`, vérifier son parent unique et son contenu, puis consigner le SHA complet dans la passation du parent et l’utiliser comme baseline de 2.18. Même si la branche a avancé, le candidat à vérifier est le premier descendant sur sa ligne de premiers parents :

```sh
base=7b2f792b115e06fddd8688777d9300e2f8a8453c
branch=refs/heads/work/epic-2-stories-2-12-through-2-22
commit=$(git rev-list --first-parent --ancestry-path --reverse "$base..$branch" | sed -n '1p')
test -n "$commit" && test "$(git show -s --format=%P "$commit")" = "$base" &&
  git diff --name-status "$base" "$commit" --
```

Exiger les **15 chemins attendus**, les octets du manifeste remis au parent et le SHA-256 du diff code/tests donné dans la spec. Si le parent, les noms ou les octets diffèrent, ne pas prendre ce commit pour point de départ. Le SHA du diff de test n’est pas le SHA de ce commit. 2.18 n’est pas commencée : distinguer la vérification en lecture seule de la reprise manuelle de la soumission d’origine, et réexaminer alors la position du bail actif (hypothèse de soumission directe en 2.17).
