# Product Brief — Candidate Copilot

## 1. Résumé

**Candidate Copilot** est un système de présentation candidat destiné aux entretiens d’embauche.

L’objectif est de permettre à un recruteur, un manager ou un CTO de poser des questions sur un candidat et d’obtenir des réponses fiables, sourcées et cohérentes, à partir d’une base de connaissances préparée à l’avance.

Le projet ne vise pas à remplacer le candidat pendant l’entretien. Il sert plutôt de **portfolio vivant**, **interrogeable**, **structuré** et **démontrable en live**.

L’approche initiale privilégiée n’est pas un RAG classique, mais une **base Markdown contrôlée**, proche d’un second brain professionnel.

---

## 2. Contexte

Le candidat prépare une recherche d’emploi prochaine et souhaite se différencier auprès des recruteurs.

Il a déjà expérimenté des workflows de développement assistés par IA, notamment :

- génération de spécifications ;
- stockage des specs dans un repo ;
- génération d’epics et de stories ;
- lancement d’agents de développement sur une story précise ;
- revue de code par IA ;
- revue A/B avec plusieurs agents.

Le projet s’inscrit dans cette continuité : utiliser l’IA non seulement pour produire du code, mais aussi pour **présenter son parcours, ses compétences, ses projets et ses preuves de travail** de manière structurée.

---

## 3. Problème à résoudre

Pendant un processus de recrutement, les informations sur un candidat sont souvent dispersées :

- CV ;
- GitHub ;
- projets personnels ;
- notes techniques ;
- expériences professionnelles ;
- captures d’écran ;
- documents de conception ;
- échanges écrits ;
- explications données oralement en entretien.

Cela pose plusieurs problèmes :

1. Le recruteur ne voit qu’une version très condensée du profil.
2. Le candidat doit répéter les mêmes explications.
3. Les projets techniques sont difficiles à comprendre rapidement.
4. Les compétences déclarées sont rarement reliées à des preuves concrètes.
5. Les réponses en entretien peuvent manquer de structure malgré un bon fond.

Candidate Copilot cherche à résoudre ce problème en transformant le dossier candidat en **base de connaissances exploitable par question/réponse**.

---

## 4. Objectif produit

Créer un outil permettant de répondre à des questions de recrutement à partir d’une base fiable, structurée et maintenue en Markdown.

L’outil doit permettre de répondre à des questions comme :

- Pourquoi ce candidat est-il pertinent pour ce poste ?
- Quels projets démontrent le mieux ses compétences ?
- Quel est son niveau réel en développement logiciel ?
- Quel est son niveau en IA, agents, automatisation ou architecture ?
- Quelles preuves concrètes peut-il montrer ?
- Quelles difficultés techniques a-t-il résolues ?
- Quels sont ses points faibles ou zones de progression ?
- Quel type d’environnement de travail lui convient ?
- Comment son profil correspond-il à une offre d’emploi précise ?

---

## 5. Positionnement

Candidate Copilot ne doit pas être positionné comme un simple “chatbot CV”.

Le positionnement recommandé est :

> Un portfolio candidat vivant, interrogeable et sourcé, conçu pour préparer, enrichir et démontrer un entretien d’embauche.

Le produit doit montrer :

- la capacité du candidat à structurer l’information ;
- sa maîtrise des workflows IA ;
- sa capacité à documenter ses projets ;
- sa maturité technique ;
- sa capacité à relier compétences et preuves concrètes.

---

## 6. Utilisateurs cibles

### Utilisateur principal

Le candidat lui-même.

Il utilise l’outil pour :

- structurer son parcours ;
- préparer ses entretiens ;
- répondre plus clairement aux recruteurs ;
- analyser des offres ;
- identifier les trous dans son dossier candidat.

### Utilisateurs secondaires

Recruteurs, managers, CTO ou responsables techniques.

Ils peuvent utiliser l’outil pour :

- explorer le profil du candidat ;
- poser des questions sur ses projets ;
- comprendre ses compétences ;
- obtenir des exemples concrets ;
- préparer un entretien plus ciblé.

---

## 7. Cas d’usage principaux

### 7.1. Avant entretien

Le candidat utilise Candidate Copilot pour préparer ses réponses.

Exemples :

- “Prépare-moi une réponse à : parlez-moi de vous.”
- “Quels projets dois-je mettre en avant pour cette offre ?”
- “Quels risques le recruteur pourrait voir dans mon profil ?”
- “Quelles questions techniques risque-t-on de me poser ?”

### 7.2. Pendant entretien

Le candidat peut faire une démonstration live.

Exemple de formulation :

> “J’ai préparé une base de connaissances sur mes projets et mon parcours. Vous pouvez poser une question, l’assistant retrouve les éléments factuels, puis je commente la réponse.”

Cela transforme l’outil en démonstration concrète de :

- documentation ;
- structuration ;
- IA appliquée ;
- transparence ;
- capacité à expliquer son travail.

### 7.3. Après entretien

Le candidat peut envoyer un lien ou un export contenant :

- les points abordés ;
- les réponses détaillées ;
- les preuves associées ;
- les liens vers projets ou documents.

### 7.4. Analyse d’offre

Le candidat colle une offre d’emploi.

Le système produit :

- niveau de correspondance ;
- compétences alignées ;
- compétences manquantes ;
- projets à mettre en avant ;
- risques à anticiper ;
- réponse courte à envoyer au recruteur.

---

## 8. Principe de conception

Le produit ne doit pas commencer par un RAG.

La priorité est de construire une **base candidat minimale, propre et exploitable**.

Le bot ne peut pas compenser une base faible. Si la base est vague, l’IA produira du contenu vague. Si la base est structurée, même une approche simple peut générer des réponses crédibles.

Principe central :

> La base de connaissances est le produit. L’IA est une interface dessus.

---

## 9. Approche technique initiale

### 9.1. Pas de RAG au départ

Un RAG vectoriel peut être utile plus tard, mais il n’est pas nécessaire pour le MVP.

Inconvénients d’un RAG trop précoce :

- complexité supplémentaire ;
- résultats parfois imprévisibles ;
- récupération de passages hors angle ;
- risque de réponses génériques ;
- maintenance plus lourde.

### 9.2. Base Markdown contrôlée

L’approche recommandée est une base Markdown versionnée dans Git.

Avantages :

- simple ;
- lisible ;
- modifiable à la main ;
- compatible avec Obsidian / VS Code ;
- versionnable ;
- facile à relire ;
- exploitable par un LLM sans pipeline complexe.

### 9.3. Routage par fichiers

Au lieu de vectoriser tout le contenu, le système peut commencer par sélectionner explicitement les fichiers pertinents selon le type de question.

Flux cible :

```text
Question recruteur
  ↓
Classification de l’intention
  ↓
Sélection de fichiers Markdown pertinents
  ↓
Génération d’une réponse basée uniquement sur ces fichiers
  ↓
Réponse sourcée + limites explicites si l’information manque
```

---

## 10. Structure initiale de la base Markdown

Structure MVP recommandée :

```text
candidate-knowledge/
├── profile.md
├── target-roles.md
├── skills.md
├── projects/
│   ├── project-01.md
│   ├── project-02.md
│   └── project-03.md
├── stories/
│   ├── difficult-bug.md
│   ├── architecture-choice.md
│   └── learning-fast.md
└── recruiter-faq.md
```

Structure plus complète à terme :

```text
candidate-knowledge/
├── 00-index/
│   ├── profile.md
│   ├── cv-summary.md
│   ├── target-roles.md
│   └── recruiter-faq.md
│
├── 10-projects/
│   ├── mypi-config.md
│   ├── second-brain.md
│   ├── wordpress-portfolio.md
│   └── interview-minion.md
│
├── 20-skills/
│   ├── python.md
│   ├── agentic-coding.md
│   ├── llm-workflows.md
│   ├── wordpress.md
│   ├── automation.md
│   └── technical-writing.md
│
├── 30-stories/
│   ├── debugging-hard-problem.md
│   ├── architecture-tradeoff.md
│   ├── learning-fast.md
│   ├── handling-ambiguity.md
│   └── conflict-or-feedback.md
│
├── 40-proof/
│   ├── github-links.md
│   ├── screenshots.md
│   ├── demos.md
│   └── deliverables.md
│
├── 50-job-offers/
│   ├── company-a.md
│   └── company-b.md
│
└── 90-prompts/
    ├── answer-as-candidate.md
    ├── match-job-offer.md
    ├── prepare-interview.md
    └── generate-recruiter-summary.md
```

---

## 11. Première étape concrète

La première étape n’est pas de coder le bot.

La première étape est de rédiger une base candidat minimale permettant de répondre proprement à environ 20 questions recruteur classiques, sans IA.

Objectif : produire un dossier Markdown suffisamment clair pour être utilisable manuellement.

### 11.1. Fichier `profile.md`

```md
# Profil candidat

## Positionnement court
Développeur expérimenté orienté automatisation, IA appliquée au développement logiciel, structuration de systèmes et amélioration des méthodes de travail.

## Ce que je cherche
- Type de poste :
- Zone géographique :
- Télétravail :
- Stack souhaitée :
- Stack à éviter :

## Ce que je sais bien faire
-
-
-

## Ce que je peux démontrer
-
-
-

## Mes preuves principales
- Projet 1 :
- Projet 2 :
- Projet 3 :

## Mes limites assumées
-
-
-

## Message recruteur en 5 lignes
...
```

### 11.2. Fichier `target-roles.md`

```md
# Postes visés

## Rôles principaux
- Développeur logiciel
- Développeur IA / automatisation
- Développeur backend
- Assistant architecte / tech lead junior selon contexte
- Intégrateur IA dans workflow de développement

## Rôles à éviter
- Windev pur
- Oracle Forms / Reports pur
- Maintenance legacy sans trajectoire de modernisation

## Critères importants
- Équipe qui veut moderniser ses méthodes
- Usage sérieux de Git, tests, CI/CD ou volonté d’y aller
- Stack moderne ou transition vers stack moderne
- Ouverture à l’IA dans le développement
```

---

## 12. Format recommandé pour une fiche projet

```md
# Nom du projet

## Résumé
Résumé court du projet en 3 à 5 lignes.

## Problème initial
Quel problème le projet cherchait-il à résoudre ?

## Contexte
Dans quel cadre le projet a-t-il été réalisé ?
Personnel, professionnel, formation, expérimentation, POC, outil interne, etc.

## Mon rôle
- conception :
- développement :
- documentation :
- tests :
- architecture :
- coordination :

## Stack technique
-
-
-

## Décisions importantes
- Décision 1 : pourquoi ce choix ?
- Décision 2 : pourquoi ce choix ?
- Décision 3 : pourquoi ce choix ?

## Difficultés rencontrées
-
-
-

## Résultats
-
-
-

## Ce que ce projet démontre
-
-
-

## Questions recruteur possibles
### Question 1
Réponse courte :

Réponse longue :

### Question 2
Réponse courte :

Réponse longue :

## Preuves
- Repo :
- Capture :
- Démo :
- Document :

## Limites à ne pas exagérer
-
-
-
```

---

## 13. Format recommandé pour une fiche compétence

```md
# Compétence : nom

## Niveau estimé
Débutant / intermédiaire / confirmé / avancé selon contexte.

## Description honnête
Ce que je sais réellement faire avec cette compétence.

## Exemples concrets
- Exemple 1 :
- Exemple 2 :
- Exemple 3 :

## Projets associés
- Projet 1 :
- Projet 2 :

## Preuves
-
-
-

## Limites
Ce que je ne maîtrise pas encore ou pas totalement.

## Bonne formulation en entretien
...

## Formulation à éviter
...
```

---

## 14. Format recommandé pour une fiche histoire d’entretien

Les fiches histoires servent à répondre aux questions comportementales et aux questions de contexte.

Exemples :

- “Parlez-moi d’un problème difficile.”
- “Donnez un exemple de décision technique.”
- “Racontez une situation où vous avez appris rapidement.”
- “Racontez une erreur ou une limite.”

Format recommandé :

```md
# Histoire : titre

## Question recruteur cible
Exemple : “Parlez-moi d’un problème technique difficile que vous avez résolu.”

## Réponse courte
Réponse en 30 à 60 secondes.

## Réponse longue
Réponse en 2 à 4 minutes.

## Structure STAR
### Situation

### Tâche

### Action

### Résultat

## Compétences démontrées
-
-
-

## Preuves associées
-
-
-

## Risques / points à clarifier
-
-
-
```

---

## 15. Questions recruteur à couvrir dans la première version

Le premier objectif est de répondre à ces questions sans IA :

1. Parlez-moi de vous.
2. Pourquoi vous plutôt qu’un autre candidat ?
3. Quel type de poste cherchez-vous ?
4. Pourquoi quittez-vous ou souhaitez-vous quitter votre poste actuel ?
5. Quel est votre niveau en développement logiciel ?
6. Quel est votre niveau en SQL / base de données ?
7. Quel est votre niveau en IA appliquée au développement ?
8. Avez-vous déjà utilisé des agents IA pour développer ?
9. Quels projets démontrent le mieux vos compétences ?
10. Quel est votre projet le plus abouti ?
11. Quel est votre projet le plus représentatif de votre façon de travailler ?
12. Décrivez un problème technique difficile que vous avez résolu.
13. Décrivez une décision d’architecture ou de conception.
14. Comment travaillez-vous avec Git ?
15. Comment voyez-vous les tests, la CI/CD et l’industrialisation ?
16. Quelle stack aimeriez-vous utiliser ?
17. Quelle stack voulez-vous éviter ?
18. Quelles sont vos limites actuelles ?
19. Qu’avez-vous appris récemment ?
20. Qu’est-ce qui vous motive dans ce poste ?

---

## 16. MVP fonctionnel

Le MVP ne doit pas être ambitieux techniquement.

### Contenu minimal

- `profile.md`
- `target-roles.md`
- `skills.md`
- 3 fiches projets
- 3 fiches histoires
- `recruiter-faq.md`

### Fonctionnalité minimale

Une commande locale suffit :

```bash
candidate-copilot ask "Pourquoi êtes-vous pertinent pour ce poste ?" --job offers/company-a.md
```

Sortie attendue :

```md
## Réponse courte

## Réponse détaillée

## Preuves à mentionner

## Questions probables du recruteur

## Risques / points à clarifier
```

---

## 17. Architecture MVP possible

```text
Fichiers Markdown
  ↓
Manifest YAML
  ↓
Script de sélection de fichiers
  ↓
Prompt système strict
  ↓
LLM
  ↓
Réponse sourcée
```

### Exemple de manifeste

```yaml
skills:
  python:
    files:
      - 20-skills/python.md
      - 10-projects/mypi-config.md
      - 30-stories/debugging-hard-problem.md

  agentic-coding:
    files:
      - 20-skills/agentic-coding.md
      - 10-projects/mypi-config.md
      - 10-projects/second-brain.md

questions:
  weakness:
    files:
      - 00-index/profile.md
      - 30-stories/learning-fast.md

  project_example:
    files:
      - 10-projects/
```

---

## 18. Règles de réponse du bot

Le bot doit suivre des règles strictes :

1. Répondre uniquement à partir de la base fournie.
2. Citer les fichiers utilisés.
3. Ne pas inventer d’expérience.
4. Signaler explicitement quand l’information manque.
5. Distinguer faits, interprétations et recommandations.
6. Ne pas sur-vendre le candidat.
7. Préparer des réponses que le candidat peut assumer oralement.
8. Proposer des points à clarifier quand le profil est ambigu.

---

## 19. Fonctionnalités futures

### 19.1. Interface web

Une interface web pourrait proposer :

- chat recruteur ;
- mode préparation entretien ;
- mode analyse d’offre ;
- mode démo live ;
- historique des questions ;
- export Markdown ou PDF.

### 19.2. Mode recruteur pressé

Sorties rapides :

- résumé en 30 secondes ;
- top 3 raisons de contacter le candidat ;
- top 3 preuves ;
- top 3 réserves potentielles.

### 19.3. Mode entretien technique

Questions orientées :

- architecture ;
- code ;
- debugging ;
- dette technique ;
- migration de stack ;
- IA dans le développement ;
- tests et CI/CD.

### 19.4. Mode analyse d’offre

Entrée : fiche de poste.

Sortie :

- score de correspondance qualitatif ;
- compétences alignées ;
- compétences absentes ;
- projets à mettre en avant ;
- pitch candidat ;
- questions à poser à l’entreprise.

### 19.5. Ajout éventuel d’un RAG

Un RAG peut être ajouté plus tard si la base devient volumineuse.

Il servirait surtout à :

- recherche floue ;
- exploration de notes longues ;
- récupération de passages oubliés ;
- analyse transversale entre documents.

Mais il ne doit pas remplacer la structure contrôlée de la base Markdown.

---

## 20. Risques

### 20.1. Risque de perception

Le recruteur pourrait penser que le candidat se cache derrière une IA.

Mitigation : présenter l’outil comme un portfolio interactif, pas comme un substitut à l’entretien.

Formulation recommandée :

> Ce bot ne remplace pas l’entretien. Il sert à explorer mes projets, mes choix techniques et mes preuves de travail de manière structurée.

### 20.2. Risque d’hallucination

Le bot pourrait inventer ou exagérer des informations.

Mitigation :

- réponses uniquement à partir des fichiers ;
- citations obligatoires ;
- refus explicite si l’information manque ;
- prompt système strict ;
- base Markdown contrôlée.

### 20.3. Risque de sur-ingénierie

Le projet pourrait devenir trop complexe trop tôt.

Mitigation :

- commencer sans RAG ;
- commencer sans interface web ;
- commencer avec 3 projets et 3 histoires ;
- valider manuellement les réponses avant automatisation.

### 20.4. Risque de données personnelles

Le candidat pourrait stocker trop d’informations privées.

Mitigation :

- séparer informations publiques et privées ;
- prévoir un mode “public/recruteur” ;
- éviter les détails personnels inutiles ;
- contrôler les fichiers exposés.

---

## 21. Roadmap proposée

### Phase 1 — Base candidat

Objectif : produire le contenu minimal.

Livrables :

- structure de dossier ;
- `profile.md` ;
- `target-roles.md` ;
- `skills.md` ;
- 3 fiches projets ;
- 3 fiches histoires ;
- `recruiter-faq.md`.

### Phase 2 — Génération assistée locale

Objectif : utiliser un LLM pour générer des réponses à partir de fichiers sélectionnés manuellement.

Livrables :

- script CLI simple ;
- prompt système ;
- template de réponse ;
- citations de fichiers.

### Phase 3 — Routage automatique

Objectif : sélectionner automatiquement les fichiers selon la question.

Livrables :

- manifest YAML ;
- classification d’intention ;
- mapping question → fichiers ;
- gestion des cas inconnus.

### Phase 4 — Analyse d’offre

Objectif : comparer une fiche de poste avec la base candidat.

Livrables :

- import d’offre ;
- analyse de correspondance ;
- pitch adapté ;
- questions à poser à l’entreprise.

### Phase 5 — Interface web

Objectif : rendre l’outil utilisable en démo.

Livrables :

- page web ;
- chat ;
- affichage des sources ;
- mode public / privé ;
- export.

---

## 22. Décision de départ recommandée

Ne pas commencer par le développement logiciel.

Commencer par le contenu.

Première action : créer le dossier `candidate-knowledge/` et rédiger `profile.md`.

Critère de réussite de la première étape :

> Être capable de répondre clairement à 20 questions recruteur classiques à partir de fichiers Markdown, sans RAG et sans interface.

Une fois ce socle fiable, l’IA pourra être ajoutée comme interface de synthèse et de préparation.

---

## 23. Nom provisoire

Nom de travail : **Candidate Copilot**.

Autres noms possibles :

- Interview Knowledge Base
- Candidate Brain
- Proof-of-Work Bot
- Portfolio Copilot
- Interview Minion
- Hire Me Console

---

## 24. Synthèse

Candidate Copilot est un projet pertinent s’il reste centré sur la preuve et la structure.

Le risque serait de produire un chatbot CV générique.

La bonne direction est de construire un second brain professionnel, orienté recrutement, capable de relier :

- compétences ;
- projets ;
- histoires ;
- preuves ;
- offres d’emploi ;
- réponses d’entretien.

Le premier livrable n’est donc pas un bot, mais une base Markdown candidat courte, propre et exploitable.
