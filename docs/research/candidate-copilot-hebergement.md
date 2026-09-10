# Hébergement de Candidate Copilot

## Contexte

Candidate Copilot doit être accessible depuis Internet afin qu’un recruteur puisse ouvrir le site et poser des questions à tout moment.

L’idée initiale était de faire tourner l’application directement sur un PC personnel. Cette approche pose cependant un problème évident : le PC n’est pas allumé 24 h/24.

À l’inverse, louer un VPS classique à environ 5 à 10 € par mois paraît disproportionné pour une application :

- peu utilisée ;
- avec un trafic irrégulier ;
- essentiellement composée d’un frontend, d’un moteur de recherche dans une base de connaissances et de quelques appels à un LLM.

L’objectif est donc de disposer d’un hébergement :

- accessible presque 24 h/24 ;
- sans serveur personnel à maintenir ;
- sans coût fixe mensuel, ou avec un coût quasi nul ;
- suffisamment fiable pour être présenté à un recruteur.

---

## Principe retenu : éviter le serveur permanent

Candidate Copilot n’a pas réellement besoin d’un serveur qui tourne en permanence.

L’application ne travaille que lorsqu’un utilisateur :

1. ouvre le site ;
2. pose une question ;
3. déclenche une recherche dans la base de connaissances ;
4. provoque éventuellement un appel à une API LLM.

Ce type de fonctionnement correspond très bien à une architecture **serverless**.

Contrairement à un VPS, aucune machine virtuelle n’est réservée en permanence.

Quand personne n’utilise Candidate Copilot, pratiquement aucune ressource n’est consommée.

---

# Architecture recommandée

La solution privilégiée est :

- **GitHub** pour stocker le code et la base Markdown ;
- **Cloudflare Pages** pour héberger le frontend ;
- **Cloudflare Workers** pour exécuter le backend ;
- **Cloudflare D1** pour stocker l’index de recherche ;
- une **API LLM** pour générer les réponses.

Architecture générale :

```text
GitHub
│
├── knowledge/
│   ├── profil.md
│   ├── experience.md
│   ├── competences.md
│   ├── projets.md
│   └── ia.md
│
└── application/
        │
        │ déploiement
        ▼
Cloudflare Pages
Frontend public
        │
        │ question
        ▼
Cloudflare Worker
        │
        ├── recherche
        │       │
        │       ▼
        │   Cloudflare D1
        │   SQLite / FTS
        │
        └── appel API
                │
                ▼
               LLM
```

---

# Cloudflare Pages

Cloudflare Pages héberge le frontend de l’application.

Il peut contenir par exemple :

- HTML ;
- CSS ;
- JavaScript ;
- React ;
- Vue ;
- Svelte ;
- ou un framework similaire.

Le site est distribué par le réseau Cloudflare et reste disponible même lorsqu’aucun serveur personnel n’est allumé.

Un déploiement peut être automatiquement déclenché lorsqu’un commit est envoyé sur GitHub.

Exemple :

```text
git push
   │
   ▼
GitHub
   │
   ▼
Cloudflare Pages
   │
   ▼
nouvelle version en ligne
```

---

# Cloudflare Worker

Le Worker constitue le petit backend de Candidate Copilot.

Il peut notamment :

1. recevoir la question du recruteur ;
2. vérifier et nettoyer la requête ;
3. chercher les informations pertinentes ;
4. construire le contexte envoyé au LLM ;
5. appeler l’API du modèle ;
6. retourner la réponse au navigateur.

Exemple :

```text
POST /api/question

{
    "question": "Quelle expérience avez-vous avec Oracle ?"
}
```

Le Worker peut alors produire une requête de recherche avant d’appeler le LLM.

---

# Cloudflare D1

D1 est la base SQL serverless de Cloudflare, basée sur SQLite.

Elle peut servir à stocker l’index construit à partir des fichiers Markdown.

Exemple :

```text
knowledge/*.md
      │
      │ indexation
      ▼
Cloudflare D1
      │
      ├── documents
      ├── sections
      └── index de recherche
```

Une table simplifiée pourrait ressembler à :

```sql
CREATE TABLE knowledge_chunks (
    id INTEGER PRIMARY KEY,
    document TEXT,
    section TEXT,
    content TEXT
);
```

Les fichiers Markdown restent la **source de vérité**.

D1 n’est qu’un index permettant d’effectuer rapidement les recherches utilisées par l’application.

---

# Fonctionnement complet

Lorsqu’un recruteur pose une question :

```text
Recruteur
    │
    │ "Quelles sont vos compétences Oracle ?"
    ▼
Frontend
    │
    ▼
Cloudflare Worker
    │
    ▼
Recherche FTS
    │
    ▼
D1
    │
    ├── experience-oracle.md
    ├── competences.md
    └── projets.md
    │
    ▼
Top passages pertinents
    │
    ▼
Construction du prompt
    │
    ▼
API LLM
    │
    ▼
Réponse
    │
    ▼
Frontend
```

Le LLM n’a donc pas besoin de connaître l’ensemble de la base.

Il reçoit uniquement :

- la question ;
- quelques extraits pertinents ;
- les instructions de Candidate Copilot.

---

# Variante encore plus simple : recherche entièrement dans le navigateur

Pour une petite base de connaissances, il est possible de supprimer complètement D1.

Lors du build, les fichiers Markdown peuvent être transformés en un index statique.

Exemple :

```text
Markdown
   │
   │ build
   ▼
knowledge-index.json
   │
   ▼
Cloudflare Pages
```

Le navigateur télécharge ensuite cet index et effectue lui-même la recherche avec une bibliothèque telle que :

- MiniSearch ;
- FlexSearch ;
- Lunr ;
- Fuse.js.

Architecture :

```text
Navigateur
   │
   ├── frontend
   ├── knowledge-index.json
   └── moteur de recherche JS
           │
           ▼
     passages pertinents
           │
           ▼
     Cloudflare Worker
           │
           ▼
          LLM
```

Cette architecture est extrêmement simple et peut fonctionner sans aucune base de données.

---

# Limite de la recherche côté navigateur

La principale limite est la confidentialité.

Tout fichier envoyé au navigateur peut être récupéré par l’utilisateur.

Même si l’interface n’affiche jamais directement :

```text
knowledge-index.json
```

un utilisateur technique pourra le télécharger.

Cette architecture convient donc uniquement si la base contient des informations pouvant être considérées comme publiques.

Pour Candidate Copilot, deux possibilités existent :

### Base entièrement publique

Le contenu de la base ne contient que des informations que l’on accepterait de communiquer à un recruteur.

Dans ce cas :

```text
Markdown
→ index JSON
→ navigateur
```

est probablement suffisant.

### Base contenant des informations privées

Certaines informations peuvent être utilisées par le bot sans devoir être directement accessibles aux visiteurs.

Dans ce cas :

```text
Markdown
→ D1
→ Worker
```

est préférable.

La recherche reste alors entièrement côté serveur.

---

# Appel au LLM

Il n’est pas nécessaire d’héberger le modèle IA.

Candidate Copilot peut utiliser une API externe.

Par exemple :

```text
Worker
   │
   ├── OpenAI
   ├── Anthropic
   ├── Mistral
   └── autre fournisseur
```

La clé API reste stockée dans les secrets du Worker et n’est jamais envoyée au navigateur.

C’est important.

Il ne faut jamais faire :

```text
Browser
   │
   ▼
API OpenAI
```

avec une clé API présente dans le JavaScript du site.

Elle serait immédiatement récupérable.

Le bon fonctionnement est :

```text
Browser
   │
   ▼
Worker
   │
   ▼
API LLM
```

---

# Coût

Le principal intérêt de cette architecture est l’absence de coût fixe lié à un serveur permanent.

Pour un trafic faible, les services serverless disposent généralement de quotas gratuits suffisants pour un projet de démonstration.

Le coût potentiel principal devient alors :

```text
nombre de questions
        ×
tokens utilisés
        ×
prix du modèle
```

Autrement dit, si personne ne consulte Candidate Copilot :

```text
coût LLM ≈ 0
```

et l’hébergement peut également rester à :

```text
≈ 0 €/mois
```

---

# Attention au coût des appels LLM

Même si l’hébergement est gratuit, l’endpoint LLM doit être protégé.

Sans protection, quelqu’un pourrait automatiser des milliers de requêtes :

```text
script
  │
  ├── question
  ├── question
  ├── question
  ├── question
  └── ...
        │
        ▼
      API LLM
        │
        ▼
      facture
```

Il faut donc prévoir dès le début :

- une limite de requêtes par IP ;
- une limite par session ;
- une taille maximale pour les questions ;
- une limite de tokens de sortie ;
- éventuellement un CAPTCHA comme Cloudflare Turnstile ;
- éventuellement un budget maximal côté fournisseur LLM.

Par exemple :

```text
20 questions / heure / IP
```

serait déjà largement suffisant pour une démonstration destinée à des recruteurs.

---

# Alternative : hébergement à domicile

Une autre solution serait d’utiliser une petite machine restant allumée chez soi.

Par exemple :

```text
Internet
   │
   ▼
Cloudflare Tunnel
   │
   ▼
Box Internet
   │
   ▼
Mini-PC / Raspberry Pi
   │
   └── Docker
       ├── frontend
       ├── backend
       └── SQLite
```

Cette solution offre beaucoup de contrôle.

Elle permet également de conserver une architecture traditionnelle.

Mais elle implique :

- une machine allumée en permanence ;
- consommation électrique ;
- maintenance ;
- mises à jour ;
- sauvegardes ;
- surveillance ;
- dépendance à la connexion Internet domestique ;
- dépendance aux coupures électriques.

Pour un laboratoire personnel, c’est une bonne option.

Pour une démonstration envoyée à un recruteur, une architecture cloud serverless est probablement plus fiable.

---

# Alternative : VPS gratuit

Certaines plateformes proposent ponctuellement des VM gratuites ou des offres « Always Free ».

Cela permettrait d’utiliser une architecture traditionnelle :

```text
VM Linux
│
├── nginx
├── frontend
├── backend
└── SQLite
```

Cependant cette approche réintroduit toute l’administration système :

- sécurité SSH ;
- pare-feu ;
- mises à jour ;
- monitoring ;
- reverse proxy ;
- certificats ;
- sauvegardes ;
- redémarrages ;
- espace disque.

Pour Candidate Copilot, cette complexité ne semble pas justifiée.

---

# Alternative : plateformes avec mise en veille

Des plateformes gratuites comme certains PaaS peuvent mettre les applications inactives en veille.

Cela peut fonctionner pour un projet personnel.

Le problème est le « cold start ».

Exemple :

```text
recruteur ouvre Candidate Copilot
               │
               ▼
          application endormie
               │
               ▼
        redémarrage du container
               │
               ▼
          attente utilisateur
```

Une attente importante lors de la première visite donne une mauvaise impression pour une démonstration professionnelle.

Cette solution est donc moins adaptée.

---

# Architecture finale envisagée

La solution cible pourrait être :

```text
                    GitHub
                       │
             Markdown + source code
                       │
                       ▼
              Cloudflare Pages
                       │
                       ▼
                 Frontend Web
                       │
                       │ question
                       ▼
              Cloudflare Worker
                 │            │
                 │            │
             recherche      API LLM
                 │            │
                 ▼            ▼
             D1 / FTS      OpenAI /
                          Anthropic /
                           Mistral
```

Avec éventuellement :

```text
Cloudflare Turnstile
Rate limiting
Logs
Analytics
```

---

# Variante minimale recommandée pour le premier prototype

Pour commencer, il est possible de faire encore plus simple :

```text
GitHub
│
├── Markdown
├── frontend
└── script de build
        │
        ▼
knowledge-index.json
        │
        ▼
Cloudflare Pages
        │
        ├── recherche locale
        │
        └── Worker
                │
                ▼
               LLM
```

Cette version évite complètement :

- serveur ;
- VPS ;
- base SQL ;
- administration système.

Elle permet de valider très rapidement le concept.

Si les besoins deviennent plus importants, l’index statique pourra ensuite être remplacé par D1.

---

# Recommandation

Pour Candidate Copilot :

## Phase 1 — prototype

```text
Cloudflare Pages
+
Cloudflare Worker
+
index Markdown/JSON côté navigateur
+
API LLM
```

Objectif :

- architecture minimale ;
- zéro serveur ;
- coût quasi nul ;
- mise en ligne rapide.

## Phase 2 — version plus propre

Si la base grandit ou si certaines données doivent rester privées :

```text
Cloudflare Pages
+
Cloudflare Worker
+
Cloudflare D1 / FTS
+
API LLM
```

Cette architecture semble être le meilleur compromis entre :

- simplicité ;
- disponibilité ;
- coût ;
- sécurité ;
- capacité d’évolution.

Elle évite surtout de payer et d’administrer un serveur qui resterait inutilisé la majorité du temps.
