# Ébauche d'architecture — Candidate Copilot + Hermes
*v2 — amendée suite à réflexion sur le contexte et les objectifs*

---

## Intention du projet

**Candidate Copilot** est un projet vitrine technique destiné à aider des recruteurs à poser des questions sur un parcours et à obtenir des réponses structurées, précises ou synthétiques.

Le projet sert aussi à construire une base d'informations personnelle sur le parcours professionnel, les projets, les compétences, les preuves, les anecdotes et les réponses d'entretien.

**Le projet est lui-même une preuve.** Il démontre concrètement une capacité à concevoir, structurer et déployer un système agentique de bout en bout — du cadrage à la vitrine publique. C'est à mettre en avant explicitement.

Hermes n'est pas la base de connaissance elle-même.
Hermes est une couche d'exploitation au-dessus de cette base.

```text
Base Markdown structurée
+ tags / liens explicites
+ agents Hermes
+ export public contrôlé
= Candidate Copilot
```

---

## Principe central

La connaissance doit vivre dans des fichiers lisibles, versionnables et modifiables sans outil spécial.

Hermes sert à :

- recevoir des documents ;
- extraire les faits importants ;
- classer les informations ;
- poser des questions pour approfondir les projets ;
- générer des synthèses ;
- relier projets, compétences, preuves et questions ;
- critiquer les réponses ;
- préparer un export public contrôlé.

Il ne doit pas devenir l'unique endroit où vit la connaissance.

---

## Séparation privé / public

Le repo source doit être **privé par défaut**.

Raisons :

- présence possible de données personnelles ;
- noms de clients ou d'entreprises ;
- documents RH ;
- détails de carrière ;
- notes brutes ;
- stratégies de recherche d'emploi ;
- prétentions salariales ;
- anecdotes sensibles ;
- informations non publiables.

Le bot public ou semi-public ne doit jamais interroger toute la base privée.

```text
Base privée complète
        ↓
Corpus public validé
        ↓
Candidate Copilot
        ↓
Réponses recruteur
```

---

## Structure possible du repo

Structure volontairement resserrée pour le MVP 1. On n'ouvre les dossiers supplémentaires que quand le besoin est réel.

```text
candidate-copilot/
├── 00-inbox/
│   ├── raw-documents/
│   ├── extracted-facts/
│   ├── needs-redaction/
│   └── rejected/
│
├── 10-profile/
│   ├── identity.md
│   ├── positioning.md
│   ├── strengths.md
│   ├── constraints.md
│   └── career-summary.md
│
├── 20-career-projects/
│   ├── project-template.md
│   └── ...
│
├── 30-skills/
│   ├── architecture.md
│   ├── automation.md
│   ├── agents.md
│   ├── product-thinking.md
│   └── ...
│
├── 40-interview-questions/
│   ├── motivation/
│   ├── parcours/
│   ├── technique/
│   ├── architecture/
│   ├── collaboration/
│   ├── conflicts/
│   ├── leadership/
│   ├── autonomy/
│   ├── mistakes/
│   └── salary/
│
├── 50-answer-bank/
│   ├── short-answers/
│   ├── long-answers/
│   ├── anecdotes/
│   ├── star-stories/
│   └── anti-answers.md
│
├── 60-evidence/
│   ├── public/
│   ├── private/
│   └── anonymized/
│
├── 70-public-export/
│   ├── public-profile.md
│   ├── validated-answers.md
│   ├── public-projects.md
│   └── public-skills.md
│
├── 80-product/
│   ├── product-spec.md
│   ├── user-flows.md
│   ├── recruiter-modes.md
│   └── safety-rules.md
│
└── 90-system/
    ├── hermes/
    ├── prompts/
    ├── workflows/
    └── schemas/
```

**Note MVP :** pour commencer, seuls `10-profile`, `20-career-projects` et `50-answer-bank` sont indispensables. Le reste s'ouvre au fil des besoins réels.

---

## Modèle de données recommandé

Ne pas tout relier manuellement dans chaque fiche.

Préférer un modèle atomique :

```text
fiches projet
+ fiches compétence
+ fiches question
+ tags
+ liens Obsidian
+ agents de compilation
```

Ce n'est pas forcément un RAG complet au départ.
C'est un entre-deux plus simple et plus contrôlable.

---

## Fiche projet

```markdown
---
type: career-project
status: draft
visibility: private
company: anonymized
period:
role:
tags: []
skills: []
---

# Nom du projet

## Contexte

## Problème initial

## Contraintes

## Ce que j'ai fait

## Décisions importantes

## Difficultés

## Résultats

## Ce que ce projet prouve sur moi

## Anecdotes utilisables en entretien

## Compétences mobilisées

## Preuves associées

## Données sensibles à anonymiser

## Version publique possible
```

---

## Fiche compétence

Les fiches compétence ne doivent pas forcément contenir les questions d'entretien liées.
Cela évite la duplication et la maintenance manuelle.

```markdown
---
type: skill
status: draft
visibility: private
tags: []
---

# Nom de la compétence

## Définition personnelle

## Niveau revendiqué

## Ce que je sais faire

## Limites actuelles

## Projets associés

- [[Projet A]]
- [[Projet B]]

## Preuves associées

- [[Preuve A]]
- [[Preuve B]]

## Tags
```

---

## Fiche question d'entretien

Les questions vivent dans leur propre espace.

```markdown
---
type: interview-question
status: draft
difficulty: medium
visibility: private
tags: []
---

# Question

## Intention du recruteur

Ce que le recruteur cherche réellement à évaluer.

## Angle de réponse recommandé

## Projets potentiellement pertinents

À remplir automatiquement ou semi-automatiquement par un agent.

## Réponse courte

## Réponse développée

## Réponse technique

## Réponse non technique

## Preuves mobilisables

## Risques

## Réponse à éviter
```

---

## Banque d'anecdotes

Les anecdotes sont centrales pour les entretiens.

```text
50-answer-bank/anecdotes/
├── conflit-technique.md
├── erreur-importante.md
├── decision-risquee.md
├── apprentissage-rapide.md
├── collaboration-difficile.md
├── projet-flou.md
└── arbitrage-technique.md
```

Chaque anecdote peut suivre ce format :

```markdown
---
type: anecdote
status: draft
visibility: private
tags: []
---

# Titre de l'anecdote

## Situation

## Tension ou problème

## Action

## Résultat

## Ce que ça démontre

## Questions d'entretien possibles

## Version publique

## Données sensibles
```

---

## Anti-réponses

Créer un fichier spécifique pour éviter les mauvaises formulations.

```markdown
# Anti-réponses

## Trop vague

Exemple :
"J'aime apprendre et je suis motivé."

## Trop défensif

Exemple :
"Je n'ai jamais eu de vrai problème."

## Trop technique

Réponse incompréhensible pour un recruteur non technique.

## Trop sensible

Réponse contenant des noms de clients, conflits internes ou chiffres confidentiels.

## Trop prétentieux

Réponse qui affirme sans preuve.

## Trop longue

Réponse qui perd le recruteur.
```

---

## Agents Hermes envisagés

### `document-ingestor`

Rôle :

- lire un document brut ;
- extraire les faits ;
- détecter les données sensibles ;
- proposer un classement ;
- générer une fiche Markdown.

Sortie attendue :

```text
- résumé
- faits extraits
- compétences détectées
- projets mentionnés
- données sensibles
- destination proposée
```

---

### `career-interviewer`

Rôle :

- discuter projet par projet ;
- poser des questions de clarification ;
- extraire les éléments notables ;
- repérer les anecdotes utiles ;
- identifier ce qui est publiable ou non.

---

### `project-profiler`

Rôle :

- transformer une discussion brute en fiche projet ;
- structurer les éléments selon le template ;
- proposer des tags ;
- relier aux compétences et preuves.

---

### `interview-question-mapper`

Rôle :

- relier une question d'entretien à des projets, compétences, preuves et anecdotes ;
- utiliser tags, liens et recherche sémantique ;
- éviter de maintenir tous les liens manuellement.

---

### `answer-writer`

Rôle :

- produire plusieurs formats de réponse :
  - 20 secondes ;
  - 1 minute ;
  - réponse détaillée ;
  - réponse technique ;
  - réponse non technique.

---

### `red-team-recruiter`

Rôle :

- critiquer les réponses ;
- détecter le flou ;
- signaler les affirmations sans preuve ;
- repérer les fuites d'informations privées ;
- réduire le jargon ;
- challenger les réponses trop longues ou trop faibles.

---

### `learning-coach`

Rôle (ajouté v2) :

- identifier les lacunes dans les réponses ou les fiches projet ;
- orienter vers des concepts à approfondir ;
- fournir ou pointer de la documentation ciblée ;
- critiquer ce qui est produit et suggérer des améliorations qualitatives ;
- ne pas se substituer à l'apprentissage — orienter et challenger.

Cet agent est aussi utile pour le développement du projet lui-même que pour la préparation aux entretiens. Il peut accompagner la production de code, d'architecture, ou de prompts en signalant ce qui est approximatif et en envoyant vers les bonnes ressources.

---

### `public-exporter`

Rôle :

- produire un corpus public validé ;
- anonymiser les éléments sensibles ;
- supprimer les notes privées ;
- ne garder que ce qui peut être montré à un recruteur.

---

## Workflow d'ingestion

```text
1. Déposer un document dans 00-inbox/raw-documents.
2. Hermes analyse le document.
3. Hermes extrait les faits.
4. Hermes signale les données sensibles.
5. Hermes propose une destination.
6. Une fiche temporaire est créée dans 00-inbox/extracted-facts.
7. Validation humaine.
8. Classement dans la base stable.
9. Mise à jour éventuelle des projets, compétences, preuves ou questions.
10. Export public seulement après validation.
```

---

## Workflow de discussion sur un projet

```text
1. Choisir un projet passé.
2. Lancer career-interviewer.
3. Répondre aux questions.
4. Générer une fiche projet.
5. Identifier :
   - compétences mobilisées ;
   - preuves ;
   - anecdotes ;
   - limites ;
   - éléments sensibles.
6. Faire relire par red-team-recruiter.
7. Produire une version publique éventuelle.
```

---

## Workflow de réponse recruteur

```text
1. Le recruteur pose une question.
2. Le système identifie les tags et l'intention.
3. Il cherche dans le corpus public validé.
4. Il sélectionne projets, compétences, preuves et anecdotes pertinentes.
5. Il génère une réponse adaptée au profil du recruteur.
6. Il refuse les questions hors périmètre.
7. Il ne spécule pas.
```

---

## Règles de sécurité du bot public

```text
Tu réponds uniquement à partir du corpus public validé.
Tu refuses les questions hors périmètre.
Tu ne révèles pas les notes privées.
Tu ne spécules pas.
Tu ne cites pas d'informations non validées.
Tu ne donnes pas de données confidentielles.
Tu peux proposer une reformulation professionnelle de la question.
```

---

## Modes recruteur possibles

```text
80-product/recruiter-modes/
├── rh.md
├── tech-lead.md
├── cto.md
├── startup-founder.md
├── esn.md
└── product-manager.md
```

Chaque mode peut adapter :

- niveau de détail ;
- vocabulaire ;
- angle de réponse ;
- preuves mises en avant ;
- longueur ;
- technicité.

**Note MVP :** les modes recruteur sont une fonctionnalité avancée. Ne pas les implémenter avant d'avoir un corpus solide et des réponses testées. Une bonne réponse générique vaut mieux que six versions moyennes.

---

## MVP recommandé

### MVP 1 — Base privée

Objectif : construire la matière. C'est la priorité absolue.

- structure Markdown minimale (3-4 dossiers) ;
- fiches projets ;
- fiches compétences ;
- premières anecdotes ;
- liste des questions qui font peur ;
- fichier `gaps.md` : ce qu'on ne sait pas encore bien répondre ;
- ingestion manuelle ou semi-automatique ;
- validation humaine systématique.

### MVP 2 — Compilation assistée

Objectif : produire des réponses.

- mapping questions → tags ;
- génération de réponses multi-formats ;
- critique par red-team-recruiter ;
- versions courtes / longues ;
- export public manuel.

### MVP 3 — Bot recruteur limité

Objectif : vitrine contrôlée et preuve concrète du projet.

- interface chat simple ;
- corpus public uniquement ;
- réponses sourcées ;
- refus hors périmètre ;
- logs des questions ;
- ajustement progressif.

---

## Décision actuelle

Approche recommandée :

```text
repo privé
+ Markdown atomique
+ tags et liens Obsidian
+ agents Hermes pour ingestion / extraction / critique / apprentissage
+ export public séparé
+ bot recruteur limité au corpus public
```

Ne pas commencer par un RAG ouvert sur toute la base privée.

Commencer par un système simple, lisible et contrôlable.

**Priorité immédiate : produire du contenu, pas de l'architecture.**

---

## Questions ouvertes

Ces sujets ne sont pas tranchés et méritent une décision avant ou pendant le MVP 2.

### Architecture et outillage

- **Obsidian vs autre éditeur** : Obsidian est naturel pour les liens et les tags, mais crée une dépendance légère à l'outil. Est-ce qu'un simple éditeur Markdown + conventions de nommage suffirait ?
- **Format des liens** : liens Obsidian `[[...]]` ou liens Markdown standards `[...](...)` ? Impacte la portabilité si on veut traiter les fichiers programmatiquement.
- **Indexation sémantique** : à quel moment introduire un vrai RAG ? Sur quel corpus ? Avec quel outil ? (embeddings locaux, Chroma, autre) — ou est-ce que le mapping par tags tient suffisamment longtemps ?

### Agents Hermes

- **Implémentation concrète des agents** : sessions Claude avec prompts bien construits au début, ou vrais agents autonomes avec orchestration ? La frontière entre "prompt réutilisable" et "agent" mérite d'être posée tôt.
- **Persistance de l'état entre sessions** : comment un agent reprend-il une discussion interrompue sur un projet ? Format de checkpoint à définir.
- **`learning-coach` : quelle source de documentation ?** Web search, documentation locale, base de liens curatés ? Le périmètre est à cadrer pour éviter la dérive.

### Sécurité et export

- **Granularité de l'anonymisation** : faut-il anonymiser au niveau de la fiche entière, ou au niveau de chaque champ ? Un champ `visibility: field-level` serait plus fin mais plus complexe à maintenir.
- **Validation de l'export** : qui valide que quelque chose est publiable ? L'humain seul, ou l'agent `public-exporter` propose et l'humain confirme ?
- **Logs du bot public** : où sont stockés les logs ? Qui y a accès ? Comment éviter qu'un recruteur ne reconstitue le corpus privé à partir des questions posées ?

### Produit

- **Interface du bot public** : chat intégré dans un portfolio web, ou outil séparé ? Impacte la visibilité du projet comme vitrine.
- **Modes recruteur** : vraiment utiles ou sur-ingénierie ? À décider après avoir testé le bot sans modes différenciés.
- **Périmètre du refus** : comment le bot décide-t-il qu'une question est hors périmètre ? Règles explicites, classification, ou les deux ?
