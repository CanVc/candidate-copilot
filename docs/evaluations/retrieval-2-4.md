# Retrieval 2.4 — actual local D1 lexical baseline

Development-only fictional corpus, unrelated to BC. No model/generation calls, recruiter acceptance, BC judgment or release approval.

Rerun: `npm run evaluate:retrieval`. See [configuration and interpretation](../../tools/retrieval/README.md).

Source: `4323afe312f43b6b87a014abee062e03e12f6022`

Application base HEAD: `dd1ed890484ca6e9b4a5ebb845715a31a3cfc2f2`; working-tree implementation (not a committed release). Source identity is not application HEAD.

Catalog SHA-256: `053eec31f9374f443caada2221b093a912c18f0581e132bc2bae5252335034e6`

Search artifact SHA-256: `88297f906c707949024c5a66507fd4111cdcdef8003d084847e43ce17df9c28a`

Limits: topK=5, textBudget=12000 UTF-16 code units, whole chunks. All 12 cases executed against disposable real D1. Required passage recall: 6/10. Forbidden passage hits: 0.

Successful empty evidence means **insufficient retrieved evidence**, not universal absence. Nonempty evidence does not establish answer adequacy. Non-required hits are lexical false-positive candidates, not model judgments; repeated fictional context and shared museum vocabulary can match otherwise irrelevant passages.

## BC handoff

BC should inspect the actual passages/gaps below and retain the lexical baseline or request an explicit architecture decision before expansion. English/corporate paraphrases are deliberately not translated or rewritten. No semantic provider, fallback, retry, threshold or automatic release decision is inferred. Missing salary, financial ROI and current-use facts must not be fabricated from related evidence.

## Case summary

| Case | Category | Required found | Negative hits | Returned |
| --- | --- | --- | --- | --- |
| fr-mesures | French | 1/1 | 0 | 1 |
| en-results | English | 0/1 | 0 | 0 |
| corporate | corporate | 0/1 | 0 | 0 |
| paraphrase | paraphrase | 0/1 | 0 | 0 |
| named-project | named-project | 1/1 | 0 | 4 |
| resolved-follow-up | resolved-follow-up | 1/1 | 0 | 4 |
| missing-salary | missing-information | 1/1 | 0 | 1 |
| missing-roi | missing-information | 1/1 | 0 | 1 |
| missing-current-use | missing-information | 1/1 | 0 | 1 |
| no-match | missing-information | 0/0 | 0 | 0 |
| no-tokens | empty-lexical | 0/0 | 0 | 0 |
| scoped-exclusion | scope | 0/1 | 0 | 4 |

## Versioned passage-level results

The complete deterministic result includes prepared terms, frozen scope, required/missed passages, negative expectations, non-required hit IDs, exact text, locations, hashes, revision and ranks. All expected passages must exist in pinned artifacts before scoring. Provenance fields are checked against those artifacts; ranks are separately checked as sequential one-based positions. A gap is a retrieval finding, not a model failure.

```json
{
  "version": 1,
  "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
  "applicationRevision": "dd1ed890484ca6e9b4a5ebb845715a31a3cfc2f2",
  "applicationState": "working-tree implementation (not a committed release)",
  "catalogHash": "053eec31f9374f443caada2221b093a912c18f0581e132bc2bae5252335034e6",
  "searchHash": "88297f906c707949024c5a66507fd4111cdcdef8003d084847e43ce17df9c28a",
  "limits": {
    "topK": 5,
    "textBudget": 12000
  },
  "requiredPassages": 10,
  "foundPassages": 6,
  "negativeHits": 0,
  "results": [
    {
      "id": "fr-mesures",
      "category": "French",
      "resolvedQuestion": "Quels résultats et limites pour le temps de recherche des objets ?",
      "searchTerms": [
        "médian",
        "minutes"
      ],
      "eligibleDocumentIds": [
        "a53a192f-51d5-4537-8200-427a09ee1ea3"
      ],
      "requiredPassages": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "negativePassages": [],
      "expectEmpty": false,
      "limitation": "Les médianes du scénario ne prouvent ni gain individuel ni ROI financier.",
      "chunks": [
        {
          "chunkId": "3357189161f8c998a9fed3ceb052443191d2427609e443050b38e4bc35b107d0",
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sourcePath": "content/public/projet-reperage-reserves.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "549741d259b2a52d938d562f8bb401f1af9e74a10ad55b136a5c6d829b6b9bcb",
          "sourceTitle": "Fiction — Repérage et fiabilisation des emplacements en réserve",
          "sectionTitle": "Résultats démontrés et limites",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les mesures et usages ci-dessous sont des données de scénario, pas des observations réelles ni des preuves de compétence de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Résultats démontrés et limites\n\nPour fournir un cas chiffré aux tests, le scénario prévoit un exercice de recherche sur 24 objets : le temps médian passe de 12 minutes avant correction à 3 minutes après correction. Ces valeurs sont entièrement inventées. Dans le récit, l'exercice est réalisé par les mêmes agents sur le même échantillon ; il ne prouve donc pas un gain généralisable à toutes les réserves.\n\nLa baisse de 9 minutes de la médiane n'est pas une mesure du temps de travail total économisé. Les durées individuelles avant et après ne sont pas fournies : on ne peut pas calculer la médiane des gains individuels, ni affirmer que chaque objet est retrouvé 9 minutes plus vite. Aucun coût, retour sur investissement ou gain financier n'est établi. Les 33 anomalies restantes, les objets fragiles exclus et l'absence de suivi après décembre 2024 limitent la portée du résultat.\n\n",
          "location": "lines:43-48;context:13-13",
          "rank": 1
        }
      ],
      "found": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "en-results",
      "category": "English",
      "resolvedQuestion": "What measurable outcomes and limitations came from locating stored objects?",
      "searchTerms": [
        "measurable",
        "outcomes",
        "storage",
        "limitations"
      ],
      "eligibleDocumentIds": [
        "a53a192f-51d5-4537-8200-427a09ee1ea3"
      ],
      "requiredPassages": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "negativePassages": [],
      "expectEmpty": false,
      "limitation": "English literal terms may miss French passages; do not infer absence or model failure.",
      "chunks": [],
      "found": [],
      "missed": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "corporate",
      "category": "corporate",
      "resolvedQuestion": "How did the fictional contributor align stakeholders and manage governance?",
      "searchTerms": [
        "stakeholders",
        "alignment",
        "governance"
      ],
      "eligibleDocumentIds": [
        "0eaf8b1d-791d-4c60-9234-168a6a03acbd"
      ],
      "requiredPassages": [
        {
          "documentId": "0eaf8b1d-791d-4c60-9234-168a6a03acbd",
          "sectionTitle": "Autonomie et collaboration"
        }
      ],
      "negativePassages": [],
      "expectEmpty": false,
      "limitation": "Corporate vocabulary is not automatically mapped to conservatrice/agents.",
      "chunks": [],
      "found": [],
      "missed": [
        {
          "documentId": "0eaf8b1d-791d-4c60-9234-168a6a03acbd",
          "sectionTitle": "Autonomie et collaboration"
        }
      ],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "paraphrase",
      "category": "paraphrase",
      "resolvedQuestion": "Comment évitait-on de chercher à tâtons dans les armoires et rayonnages ?",
      "searchTerms": [
        "armoires",
        "rayonnages",
        "tâtons"
      ],
      "eligibleDocumentIds": [
        "a53a192f-51d5-4537-8200-427a09ee1ea3"
      ],
      "requiredPassages": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Solution et choix importants"
        }
      ],
      "negativePassages": [],
      "expectEmpty": false,
      "limitation": "Lexical baseline does not expand synonyms to meuble/étagère.",
      "chunks": [],
      "found": [],
      "missed": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Solution et choix importants"
        }
      ],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "named-project",
      "category": "named-project",
      "resolvedQuestion": "Quel est le statut du prototype de suivi des prêts ?",
      "searchTerms": [
        "prototype",
        "déployé"
      ],
      "eligibleDocumentIds": [
        "87ddaeda-8ee4-4056-9931-5ebf7b677875"
      ],
      "requiredPassages": [
        {
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sectionTitle": "État du projet et usages réels"
        }
      ],
      "negativePassages": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "expectEmpty": false,
      "limitation": "No deployed service or operational use follows from an internal prototype.",
      "chunks": [
        {
          "chunkId": "897ddcd68b8bb636a15f45cda43b5147eae578876857bb61f832ffcf814652ed",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "58190968ba6d8760b96109dfcee850318ce6e8018ec3f0192606b6b4b49008f0",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "État du projet et usages réels",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## État du projet et usages réels\n\nLe projet est resté un prototype de démonstration interne. Dans le scénario, une séance de lecture a eu lieu en novembre 2024 avec la conservatrice et les deux agents, sur les seuls 12 dossiers inventés. Aucun prêt réel n'a été géré dans le prototype et aucun service n'a été déployé.\n\nL'exploration s'est arrêtée à la fin de la mission en décembre 2024, sans décision de mise en production. Le corpus ne décrit ni reprise ultérieure ni utilisation actuelle. Le prototype n'a pas remplacé le suivi existant.\n\n",
          "location": "lines:37-42;context:13-13",
          "rank": 1
        },
        {
          "chunkId": "01897e18d8463031dc12c07657141651fec25bceb0350a669850e65f222180ce",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "d93963c0b1715746bc19f324c9b20349721afbbc4941875086763caa23c80ca6",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "text": "# Fiction — Prototype de suivi des prêts d'objets\n\n> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n\n",
          "location": "lines:11-14",
          "rank": 2
        },
        {
          "chunkId": "1c7c8af2e3ee8bc50f8992dc4b9d132300cd3d39c2dc36ca0b9d62e5496486d2",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "1b4842fc20f8b47c7bc38bfd9db7578965be167f233727440666e4f391299402",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "Solution et choix importants",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Solution et choix importants\n\nLe prototype séparait les pièces du dossier et l'étape du mouvement. Un dossier pouvait ainsi afficher « transport à préparer » tout en signalant qu'une autorisation manquait. Un message de vigilance n'était pas assimilé à une validation de la conservatrice.\n\nLes maquettes et le tableur permettaient de déplacer manuellement un dossier entre plusieurs situations et d'en discuter avec l'équipe. Ils n'empêchaient pas matériellement une saisie contradictoire. Aucun moteur de règles, contrôle d'accès ou historique infalsifiable n'a été développé.\n\nLe prototype a volontairement précédé tout développement logiciel afin de vérifier le vocabulaire et la séparation des responsabilités. Aucune comparaison de fournisseurs ou décision d'achat n'est décrite.\n\n",
          "location": "lines:29-36;context:13-13",
          "rank": 3
        },
        {
          "chunkId": "239614ea3304ec32afa200545dc0efe87e52a6c0ed05dc9d340dec8df7e27254",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "0c026178671afd491954d1fff079a2d5896788a4c192aefa14b37af7dba0802c",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "Contraintes et retour d'expérience",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Contraintes et retour d'expérience\n\nL'expérimentation devait rester compréhensible sans formation technique et ne pas mélanger les documents fictifs avec les dossiers de prêts utilisés par l'équipe. Le principal enseignement du récit est qu'une liste d'étapes peut aider à discuter du travail sans constituer un système de contrôle opérationnel.\n\nLa [fiche de mission](mission-regie-collections.md) présente le rôle de régie et les décisions réservées à la conservatrice. Le périmètre de ce prototype reste limité à la démonstration décrite, quelles que soient les responsabilités plus larges de la mission.\n",
          "location": "lines:51-55;context:13-13",
          "rank": 4
        }
      ],
      "found": [
        {
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sectionTitle": "État du projet et usages réels"
        }
      ],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [
        "01897e18d8463031dc12c07657141651fec25bceb0350a669850e65f222180ce",
        "1c7c8af2e3ee8bc50f8992dc4b9d132300cd3d39c2dc36ca0b9d62e5496486d2",
        "239614ea3304ec32afa200545dc0efe87e52a6c0ed05dc9d340dec8df7e27254"
      ],
      "emptyExpectationMet": true
    },
    {
      "id": "resolved-follow-up",
      "category": "resolved-follow-up",
      "resolvedQuestion": "Dans le projet de repérage des réserves, combien des anomalies sont restées ouvertes ?",
      "searchTerms": [
        "117",
        "33",
        "anomalies"
      ],
      "eligibleDocumentIds": [
        "a53a192f-51d5-4537-8200-427a09ee1ea3"
      ],
      "requiredPassages": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "État du projet et usages réels"
        }
      ],
      "negativePassages": [
        {
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "expectEmpty": false,
      "limitation": "Question is already resolved; no history resolver or automatic rewriting is evaluated.",
      "chunks": [
        {
          "chunkId": "a26a18ce9ee292f20b7522ab1168ff3e929ecb198664a9778875d57605db0d7a",
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sourcePath": "content/public/projet-reperage-reserves.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "bbb1dc207a52e34a7bbcb2ed0793e57a3348bf41728130e804434cc508580d90",
          "sourceTitle": "Fiction — Repérage et fiabilisation des emplacements en réserve",
          "sectionTitle": "État du projet et usages réels",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les mesures et usages ci-dessous sont des données de scénario, pas des observations réelles ni des preuves de compétence de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## État du projet et usages réels\n\nDans le récit fictif, la campagne a été clôturée en juin 2024 et le tableur corrigé a ensuite servi à préparer les mouvements d'objets jusqu'à la fin de la mission, en décembre 2024. Aucun usage après cette date n'est documenté.\n\nLes 600 objets du périmètre ont une ligne de vérification. Le registre initial comportait 150 entrées d'anomalies ; 117 ont été résolues et 33 sont restées ouvertes. Plusieurs entrées pouvaient concerner un même objet ; le nombre d'objets distincts touchés n'est pas défini. On ne peut donc pas déduire que 150 objets, ni 25 % du périmètre, présentaient une anomalie. La clôture du projet ne signifie pas que tout l'inventaire du musée était exact ou complet.\n\n",
          "location": "lines:37-42;context:13-13",
          "rank": 1
        },
        {
          "chunkId": "0020a3ec7ac1505e5a42e6b88da7ebe0bda8cf5882f380f3435de3f5a404cfff",
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sourcePath": "content/public/projet-reperage-reserves.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "e50074d874d28a8d7d6fa235df589b561820958f482944b18375954920885b6c",
          "sourceTitle": "Fiction — Repérage et fiabilisation des emplacements en réserve",
          "sectionTitle": "Ma contribution et le périmètre réalisé",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les mesures et usages ci-dessous sont des données de scénario, pas des observations réelles ni des preuves de compétence de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Ma contribution et le périmètre réalisé\n\nJ'ai conçu une nomenclature à trois niveaux : réserve, meuble et étagère. J'ai préparé les listes de vérification, les règles de saisie et un registre séparé pour les anomalies non résolues. J'ai également rapproché les relevés validés avec les lignes du tableur existant.\n\nLes deux agents de collections ont participé aux vérifications physiques et aux confirmations d'emplacement. La conservatrice a arbitré les contradictions d'identité et autorisé la méthode. Je n'ai pas réalisé seul les vérifications des 600 objets et je n'ai pas attribué de nouveaux identifiants patrimoniaux.\n\nLe travail décrit est terminé dans le scénario, à l'exception de 33 anomalies laissées explicitement ouvertes. Les objets fragiles et les autres collections du musée sont hors périmètre.\n\n",
          "location": "lines:21-28;context:13-13",
          "rank": 2
        },
        {
          "chunkId": "3357189161f8c998a9fed3ceb052443191d2427609e443050b38e4bc35b107d0",
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sourcePath": "content/public/projet-reperage-reserves.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "549741d259b2a52d938d562f8bb401f1af9e74a10ad55b136a5c6d829b6b9bcb",
          "sourceTitle": "Fiction — Repérage et fiabilisation des emplacements en réserve",
          "sectionTitle": "Résultats démontrés et limites",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les mesures et usages ci-dessous sont des données de scénario, pas des observations réelles ni des preuves de compétence de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Résultats démontrés et limites\n\nPour fournir un cas chiffré aux tests, le scénario prévoit un exercice de recherche sur 24 objets : le temps médian passe de 12 minutes avant correction à 3 minutes après correction. Ces valeurs sont entièrement inventées. Dans le récit, l'exercice est réalisé par les mêmes agents sur le même échantillon ; il ne prouve donc pas un gain généralisable à toutes les réserves.\n\nLa baisse de 9 minutes de la médiane n'est pas une mesure du temps de travail total économisé. Les durées individuelles avant et après ne sont pas fournies : on ne peut pas calculer la médiane des gains individuels, ni affirmer que chaque objet est retrouvé 9 minutes plus vite. Aucun coût, retour sur investissement ou gain financier n'est établi. Les 33 anomalies restantes, les objets fragiles exclus et l'absence de suivi après décembre 2024 limitent la portée du résultat.\n\n",
          "location": "lines:43-48;context:13-13",
          "rank": 3
        },
        {
          "chunkId": "99c2a3e2d652bf1fd2fe761a1991119f338aa20a64c2e737e45d4d8ca9f8e745",
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sourcePath": "content/public/projet-reperage-reserves.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "7abd550cca2b569172671619e855396ccc7645a75e10393af652dec689942fc4",
          "sourceTitle": "Fiction — Repérage et fiabilisation des emplacements en réserve",
          "sectionTitle": "Solution et choix importants",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les mesures et usages ci-dessous sont des données de scénario, pas des observations réelles ni des preuves de compétence de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Solution et choix importants\n\nLa nomenclature utilisait des codes lisibles sur place, par exemple « R2-M04-E03 » pour la réserve 2, le meuble 4 et l'étagère 3. Ces codes désignent des emplacements, pas l'identité des objets. L'identifiant documentaire de chaque objet restait inchangé lorsqu'il était déplacé.\n\nLe tableur existant a été conservé comme outil de travail, avec des colonnes distinctes pour les trois niveaux et la date de vérification. Une localisation différente n'était enregistrée qu'après confirmation par deux membres de l'équipe. Une contradiction d'identité restait dans le registre d'anomalies jusqu'à arbitrage.\n\nL'achat d'un logiciel spécialisé n'a pas été étudié dans ce scénario. Je ne présente donc pas le maintien du tableur comme le résultat d'une comparaison de marché. Le choix répondait au besoin limité de repérage et à la familiarité de l'équipe avec l'outil.\n\n",
          "location": "lines:29-36;context:13-13",
          "rank": 4
        }
      ],
      "found": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "État du projet et usages réels"
        }
      ],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [
        "0020a3ec7ac1505e5a42e6b88da7ebe0bda8cf5882f380f3435de3f5a404cfff",
        "3357189161f8c998a9fed3ceb052443191d2427609e443050b38e4bc35b107d0",
        "99c2a3e2d652bf1fd2fe761a1991119f338aa20a64c2e737e45d4d8ca9f8e745"
      ],
      "emptyExpectationMet": true
    },
    {
      "id": "missing-salary",
      "category": "missing-information",
      "resolvedQuestion": "Quel était le salaire de la personne fictive ?",
      "searchTerms": [
        "salaire"
      ],
      "eligibleDocumentIds": [
        "0eaf8b1d-791d-4c60-9234-168a6a03acbd"
      ],
      "requiredPassages": [
        {
          "documentId": "0eaf8b1d-791d-4c60-9234-168a6a03acbd",
          "sectionTitle": "Contraintes structurantes"
        }
      ],
      "negativePassages": [],
      "expectEmpty": false,
      "limitation": "The passage explicitly leaves salary undefined; matching is not an answer value.",
      "chunks": [
        {
          "chunkId": "4e4322c9178fc58d8c4fa8b1b2c64bf2d10ebe2f0bcfe19a20bd42d84089bd56",
          "documentId": "0eaf8b1d-791d-4c60-9234-168a6a03acbd",
          "sourcePath": "content/public/mission-regie-collections.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "7cffcea2a6883533d8a71b3d5347d6220017b99214b6119d8a8122dc181e3f74",
          "sourceTitle": "Fiction — Mission de régie des collections dans un musée",
          "sectionTitle": "Contraintes structurantes",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les dates, contributions et résultats décrits ne sont pas des faits professionnels réels. Ce document n'est pas une fiche du portfolio de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Contraintes structurantes\n\nLes vérifications devaient préserver l'identité des objets et éviter les manipulations inutiles. Les objets fragiles étaient exclus de la campagne décrite. Les changements de localisation devaient rester compréhensibles pour les agents sans formation spécialisée à un nouveau logiciel.\n\nLa période de préparation d'une exposition réduisait la disponibilité de l'équipe. J'ai donc découpé les vérifications en petits lots plutôt que de demander une fermeture des réserves. Aucun budget global, salaire, bénéfice financier ou devenir professionnel après décembre 2024 n'est défini dans ce scénario.\n",
          "location": "lines:43-47;context:13-13",
          "rank": 1
        }
      ],
      "found": [
        {
          "documentId": "0eaf8b1d-791d-4c60-9234-168a6a03acbd",
          "sectionTitle": "Contraintes structurantes"
        }
      ],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "missing-roi",
      "category": "missing-information",
      "resolvedQuestion": "Quel retour sur investissement financier est établi pour le repérage ?",
      "searchTerms": [
        "financier",
        "investissement"
      ],
      "eligibleDocumentIds": [
        "a53a192f-51d5-4537-8200-427a09ee1ea3"
      ],
      "requiredPassages": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "negativePassages": [],
      "expectEmpty": false,
      "limitation": "No financial ROI is established; do not compute it from the fictional timing exercise.",
      "chunks": [
        {
          "chunkId": "3357189161f8c998a9fed3ceb052443191d2427609e443050b38e4bc35b107d0",
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sourcePath": "content/public/projet-reperage-reserves.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "549741d259b2a52d938d562f8bb401f1af9e74a10ad55b136a5c6d829b6b9bcb",
          "sourceTitle": "Fiction — Repérage et fiabilisation des emplacements en réserve",
          "sectionTitle": "Résultats démontrés et limites",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les mesures et usages ci-dessous sont des données de scénario, pas des observations réelles ni des preuves de compétence de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Résultats démontrés et limites\n\nPour fournir un cas chiffré aux tests, le scénario prévoit un exercice de recherche sur 24 objets : le temps médian passe de 12 minutes avant correction à 3 minutes après correction. Ces valeurs sont entièrement inventées. Dans le récit, l'exercice est réalisé par les mêmes agents sur le même échantillon ; il ne prouve donc pas un gain généralisable à toutes les réserves.\n\nLa baisse de 9 minutes de la médiane n'est pas une mesure du temps de travail total économisé. Les durées individuelles avant et après ne sont pas fournies : on ne peut pas calculer la médiane des gains individuels, ni affirmer que chaque objet est retrouvé 9 minutes plus vite. Aucun coût, retour sur investissement ou gain financier n'est établi. Les 33 anomalies restantes, les objets fragiles exclus et l'absence de suivi après décembre 2024 limitent la portée du résultat.\n\n",
          "location": "lines:43-48;context:13-13",
          "rank": 1
        }
      ],
      "found": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "missing-current-use",
      "category": "missing-information",
      "resolvedQuestion": "Le prototype est-il utilisé actuellement ?",
      "searchTerms": [
        "actuelle",
        "ultérieure"
      ],
      "eligibleDocumentIds": [
        "87ddaeda-8ee4-4056-9931-5ebf7b677875"
      ],
      "requiredPassages": [
        {
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sectionTitle": "État du projet et usages réels"
        }
      ],
      "negativePassages": [],
      "expectEmpty": false,
      "limitation": "No current or later use is documented.",
      "chunks": [
        {
          "chunkId": "897ddcd68b8bb636a15f45cda43b5147eae578876857bb61f832ffcf814652ed",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "58190968ba6d8760b96109dfcee850318ce6e8018ec3f0192606b6b4b49008f0",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "État du projet et usages réels",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## État du projet et usages réels\n\nLe projet est resté un prototype de démonstration interne. Dans le scénario, une séance de lecture a eu lieu en novembre 2024 avec la conservatrice et les deux agents, sur les seuls 12 dossiers inventés. Aucun prêt réel n'a été géré dans le prototype et aucun service n'a été déployé.\n\nL'exploration s'est arrêtée à la fin de la mission en décembre 2024, sans décision de mise en production. Le corpus ne décrit ni reprise ultérieure ni utilisation actuelle. Le prototype n'a pas remplacé le suivi existant.\n\n",
          "location": "lines:37-42;context:13-13",
          "rank": 1
        }
      ],
      "found": [
        {
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sectionTitle": "État du projet et usages réels"
        }
      ],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "no-match",
      "category": "missing-information",
      "resolvedQuestion": "Quelle technologie quantique était employée ?",
      "searchTerms": [
        "supraconducteur",
        "qubit"
      ],
      "eligibleDocumentIds": [
        "0eaf8b1d-791d-4c60-9234-168a6a03acbd",
        "87ddaeda-8ee4-4056-9931-5ebf7b677875",
        "a53a192f-51d5-4537-8200-427a09ee1ea3"
      ],
      "requiredPassages": [],
      "negativePassages": [],
      "expectEmpty": true,
      "limitation": "Empty evidence is insufficient retrieved evidence, not universal absence.",
      "chunks": [],
      "found": [],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "no-tokens",
      "category": "empty-lexical",
      "resolvedQuestion": "Existe-t-il des éléments avec ces termes sans tokens ?",
      "searchTerms": [
        "\" * -- 😀"
      ],
      "eligibleDocumentIds": [
        "a53a192f-51d5-4537-8200-427a09ee1ea3"
      ],
      "requiredPassages": [],
      "negativePassages": [],
      "expectEmpty": true,
      "limitation": "No lexical tokens is successful empty evidence with valid publication/scope.",
      "chunks": [],
      "found": [],
      "missed": [],
      "negativeHits": [],
      "nonRequiredHits": [],
      "emptyExpectationMet": true
    },
    {
      "id": "scoped-exclusion",
      "category": "scope",
      "resolvedQuestion": "Quelles sont les limites du prototype, sans les chiffres du repérage ?",
      "searchTerms": [
        "minutes",
        "médian",
        "prototype"
      ],
      "eligibleDocumentIds": [
        "87ddaeda-8ee4-4056-9931-5ebf7b677875"
      ],
      "requiredPassages": [
        {
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "negativePassages": [
        {
          "documentId": "a53a192f-51d5-4537-8200-427a09ee1ea3",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "expectEmpty": false,
      "limitation": "Repérage timing must never be attributed to the prototype.",
      "chunks": [
        {
          "chunkId": "897ddcd68b8bb636a15f45cda43b5147eae578876857bb61f832ffcf814652ed",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "58190968ba6d8760b96109dfcee850318ce6e8018ec3f0192606b6b4b49008f0",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "État du projet et usages réels",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## État du projet et usages réels\n\nLe projet est resté un prototype de démonstration interne. Dans le scénario, une séance de lecture a eu lieu en novembre 2024 avec la conservatrice et les deux agents, sur les seuls 12 dossiers inventés. Aucun prêt réel n'a été géré dans le prototype et aucun service n'a été déployé.\n\nL'exploration s'est arrêtée à la fin de la mission en décembre 2024, sans décision de mise en production. Le corpus ne décrit ni reprise ultérieure ni utilisation actuelle. Le prototype n'a pas remplacé le suivi existant.\n\n",
          "location": "lines:37-42;context:13-13",
          "rank": 1
        },
        {
          "chunkId": "01897e18d8463031dc12c07657141651fec25bceb0350a669850e65f222180ce",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "d93963c0b1715746bc19f324c9b20349721afbbc4941875086763caa23c80ca6",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "text": "# Fiction — Prototype de suivi des prêts d'objets\n\n> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n\n",
          "location": "lines:11-14",
          "rank": 2
        },
        {
          "chunkId": "1c7c8af2e3ee8bc50f8992dc4b9d132300cd3d39c2dc36ca0b9d62e5496486d2",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "1b4842fc20f8b47c7bc38bfd9db7578965be167f233727440666e4f391299402",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "Solution et choix importants",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Solution et choix importants\n\nLe prototype séparait les pièces du dossier et l'étape du mouvement. Un dossier pouvait ainsi afficher « transport à préparer » tout en signalant qu'une autorisation manquait. Un message de vigilance n'était pas assimilé à une validation de la conservatrice.\n\nLes maquettes et le tableur permettaient de déplacer manuellement un dossier entre plusieurs situations et d'en discuter avec l'équipe. Ils n'empêchaient pas matériellement une saisie contradictoire. Aucun moteur de règles, contrôle d'accès ou historique infalsifiable n'a été développé.\n\nLe prototype a volontairement précédé tout développement logiciel afin de vérifier le vocabulaire et la séparation des responsabilités. Aucune comparaison de fournisseurs ou décision d'achat n'est décrite.\n\n",
          "location": "lines:29-36;context:13-13",
          "rank": 3
        },
        {
          "chunkId": "239614ea3304ec32afa200545dc0efe87e52a6c0ed05dc9d340dec8df7e27254",
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sourcePath": "content/public/projet-prototype-prets.md",
          "sourceRevision": "4323afe312f43b6b87a014abee062e03e12f6022",
          "contentHash": "0c026178671afd491954d1fff079a2d5896788a4c192aefa14b37af7dba0802c",
          "sourceTitle": "Fiction — Prototype de suivi des prêts d'objets",
          "sectionTitle": "Contraintes et retour d'expérience",
          "text": "> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.\n## Contraintes et retour d'expérience\n\nL'expérimentation devait rester compréhensible sans formation technique et ne pas mélanger les documents fictifs avec les dossiers de prêts utilisés par l'équipe. Le principal enseignement du récit est qu'une liste d'étapes peut aider à discuter du travail sans constituer un système de contrôle opérationnel.\n\nLa [fiche de mission](mission-regie-collections.md) présente le rôle de régie et les décisions réservées à la conservatrice. Le périmètre de ce prototype reste limité à la démonstration décrite, quelles que soient les responsabilités plus larges de la mission.\n",
          "location": "lines:51-55;context:13-13",
          "rank": 4
        }
      ],
      "found": [],
      "missed": [
        {
          "documentId": "87ddaeda-8ee4-4056-9931-5ebf7b677875",
          "sectionTitle": "Résultats démontrés et limites"
        }
      ],
      "negativeHits": [],
      "nonRequiredHits": [
        "897ddcd68b8bb636a15f45cda43b5147eae578876857bb61f832ffcf814652ed",
        "01897e18d8463031dc12c07657141651fec25bceb0350a669850e65f222180ce",
        "1c7c8af2e3ee8bc50f8992dc4b9d132300cd3d39c2dc36ca0b9d62e5496486d2",
        "239614ea3304ec32afa200545dc0efe87e52a6c0ed05dc9d340dec8df7e27254"
      ],
      "emptyExpectationMet": true
    }
  ],
  "applicationFilesHash": "378f75f342dc94b2068fedfe11a5345f88a49bc9bfd8dc725a3d90200a8cff84",
  "toolchain": {
    "node": "v24.22.0",
    "wrangler": "4.151.2",
    "workerd": "1.20261019.1",
    "dependencyLockHash": "693a18f40a0581e70f15d4223729f5f841bc7c6d3818f7381a1d83765f744fd2",
    "engine": "local D1/workerd FTS5"
  }
}
```
