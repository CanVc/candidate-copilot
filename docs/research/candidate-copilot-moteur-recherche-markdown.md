# Candidate Copilot — Exploitation de la base de connaissances Markdown

## Objectif

Candidate Copilot doit permettre à un recruteur de poser des questions en langage naturel sur un candidat, puis d’obtenir des réponses fondées uniquement sur une base de connaissances préalablement préparée.

L’idée est de conserver une architecture volontairement simple :

- la **source de vérité** est constituée de fichiers Markdown ;
- un petit moteur local indexe leur contenu ;
- SQLite FTS5 permet la recherche plein texte ;
- un LLM peut éventuellement améliorer la requête de recherche ;
- un LLM principal rédige ensuite la réponse à partir des passages retrouvés.

Le but n’est donc pas de construire immédiatement un système RAG complexe avec base vectorielle, embeddings, orchestration ou agents.

---

## 1. La base de connaissances

La base de connaissances est un ensemble de fichiers Markdown versionnés dans Git.

Exemple :

```text
candidate-knowledge/
├── profile.md
├── experience/
│   ├── current-job.md
│   ├── previous-job.md
│   └── oracle-modernization.md
├── skills/
│   ├── oracle.md
│   ├── sql.md
│   ├── architecture.md
│   └── ai-development.md
├── projects/
│   ├── candidate-copilot.md
│   └── second-brain.md
└── career/
    ├── goals.md
    └── preferred-roles.md
```

Les fichiers peuvent contenir du YAML Front Matter pour ajouter des métadonnées.

Exemple :

```markdown
---
title: Oracle / PL/SQL
tags:
  - oracle
  - plsql
  - sql
  - database
type: skill
---

# Oracle

Expérience générale avec Oracle.

## PL/SQL

Développement de procédures, packages, triggers et requêtes complexes.

## Oracle Forms

Maintenance et évolution d'applications historiques.

## Modernisation

Participation à la réflexion autour du remplacement progressif d'Oracle Forms
et de l'unification du moteur métier.
```

Cette organisation présente plusieurs avantages :

- la base reste lisible directement par un humain ;
- elle est facilement éditable dans VS Code ou Obsidian ;
- elle est versionnée dans Git ;
- aucune interface d’administration spécifique n’est nécessaire ;
- son contenu peut être réutilisé par d’autres fonctions de Candidate Copilot.

---

## 2. Découpage des documents

Le moteur de recherche ne doit pas forcément indexer chaque fichier comme un seul bloc.

Il est préférable de découper les fichiers Markdown en sections à partir des titres.

Par exemple :

```text
skills/oracle.md
├── Oracle
├── PL/SQL
├── Oracle Forms
└── Modernisation
```

Chaque section devient un document logique indexable.

Exemple conceptuel :

```json
{
  "path": "skills/oracle.md",
  "title": "Modernisation",
  "section": "Oracle > Modernisation",
  "tags": ["oracle", "plsql", "database"],
  "content": "Participation à la réflexion autour du remplacement progressif..."
}
```

Cela permet d’envoyer au LLM uniquement les passages pertinents plutôt qu’un fichier entier.

---

## 3. Indexation avec SQLite FTS5

SQLite possède un moteur de recherche plein texte intégré : **FTS5**.

Il peut être utilisé pour créer un index local extrêmement léger.

Exemple simplifié :

```sql
CREATE VIRTUAL TABLE knowledge_fts USING FTS5(
    path,
    title,
    section,
    tags,
    content
);
```

Lors de l’indexation :

```text
Fichiers Markdown
        ↓
Parsing du YAML et des headings
        ↓
Découpage en sections
        ↓
Insertion dans SQLite FTS5
```

L’index peut être reconstruit :

- au démarrage de l’application ;
- après un `git pull` ;
- après modification de la base Markdown ;
- lors du déploiement du site.

La base SQLite n’est donc pas la source de vérité.

Elle n’est qu’un **index dérivé** des fichiers Markdown.

---

## 4. Recherche simple sans LLM

La première version peut fonctionner sans aucun LLM pour la recherche.

Exemple de question :

> Quelle expérience a-t-il avec les migrations Oracle ?

Le backend extrait une requête de recherche simple :

```text
oracle migration
```

Puis interroge SQLite :

```sql
SELECT
    path,
    title,
    section,
    content,
    bm25(knowledge_fts) AS score
FROM knowledge_fts
WHERE knowledge_fts MATCH 'oracle migration'
ORDER BY score
LIMIT 8;
```

SQLite renvoie les passages les plus pertinents.

Exemple :

```text
1. experience/oracle-modernization.md > Contexte
2. skills/oracle.md > Modernisation
3. experience/current-job.md > Architecture
```

Cette approche peut déjà être suffisante pour une petite base de connaissances bien structurée.

---

## 5. Limite de la recherche lexicale

Une recherche plein texte fonctionne principalement sur les mots présents dans les documents.

Cela peut poser problème lorsqu’un recruteur formule une question avec un vocabulaire différent de celui de la base.

Exemple :

> A-t-il déjà modernisé une vieille application métier ?

Alors que les notes contiennent plutôt :

```text
migration Oracle Forms
remplacement d'une stack historique
refonte du moteur métier
modernisation du SI
```

Une recherche stricte sur :

```text
vieille application métier
```

peut donc manquer certains passages pertinents.

---

## 6. Rôle éventuel d’un petit LLM

Un petit LLM peut être ajouté avant SQLite pour reformuler ou enrichir la requête.

Le LLM **ne cherche pas directement dans SQLite**.

Son rôle est uniquement de transformer la question en termes de recherche plus pertinents.

Exemple :

```text
Question recruteur :

"A-t-il déjà modernisé une vieille application métier ?"

        ↓

LLM de reformulation

        ↓

Termes de recherche :

legacy
modernisation
migration
refonte
Oracle Forms
ancienne stack
moteur métier

        ↓

SQLite FTS5
```

On parle ici de **query rewriting** ou de **query expansion**.

Le LLM peut être :

- un petit modèle rapide et peu coûteux ;
- un modèle local ;
- ou simplement le même modèle que celui utilisé pour produire la réponse finale, avec un premier appel très court.

Il n’est donc pas nécessaire d’avoir deux modèles physiquement différents.

---

## 7. Stratégie recommandée pour le MVP

Pour éviter de complexifier inutilement le système, la stratégie recommandée est :

```text
Question
   ↓
Recherche SQLite FTS5 directe
   ↓
Résultats suffisamment bons ?
   │
   ├── Oui → utilisation des passages
   │
   └── Non
        ↓
     Reformulation LLM
        ↓
     Nouvelle recherche FTS5
```

Le LLM de reformulation n’est donc utilisé qu’en cas de besoin.

Cela permet :

- de réduire les appels LLM ;
- de diminuer les coûts ;
- de réduire la latence ;
- de garder une architecture compréhensible ;
- de mesurer réellement si la reformulation apporte quelque chose.

---

## 8. Génération du contexte

Une fois les meilleurs passages trouvés, le backend construit un contexte.

Exemple :

```text
SOURCE 1
Fichier : skills/oracle.md
Section : Modernisation

Participation à la réflexion autour du remplacement progressif
d'Oracle Forms et de l'unification du moteur métier.

SOURCE 2
Fichier : experience/oracle-modernization.md
Section : Architecture

...

SOURCE 3
Fichier : experience/current-job.md
Section : Migration

...
```

Le contexte est ensuite envoyé au LLM principal.

---

## 9. Génération de la réponse

Le prompt système peut imposer des règles strictes.

Exemple :

```text
Tu es Candidate Copilot.

Tu réponds aux questions d'un recruteur sur le candidat.

Utilise uniquement les informations contenues dans les sources fournies.

Ne complète jamais une information absente par supposition.

Si les sources ne permettent pas de répondre, indique clairement
que l'information n'est pas disponible dans la base de connaissances.

Mentionne les sources utilisées.
```

Puis :

```text
Question :
Quelle expérience Baptiste a-t-il avec la modernisation d'applications Oracle ?

Sources :
[...]
```

Le LLM produit alors une réponse fondée sur ces passages.

---

## 10. Flux complet

Architecture complète du MVP :

```text
                    ┌──────────────────────┐
                    │  Base Markdown Git   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Parser Markdown/YAML │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   SQLite + FTS5      │
                    │   index local        │
                    └──────────┬───────────┘
                               │
                               │
Recruteur                      │
    │                          │
    ▼                          │
Question                       │
    │                          │
    ▼                          │
┌─────────────────────┐        │
│ Backend Candidate   │        │
│ Copilot             │        │
└─────────┬───────────┘        │
          │                    │
          ▼                    │
   Recherche FTS5 ─────────────┘
          │
          ▼
 Résultats suffisants ?
       │       │
      oui     non
       │       │
       │       ▼
       │   Petit LLM
       │   reformulation
       │       │
       │       ▼
       │   FTS5 à nouveau
       │       │
       └───┬───┘
           ▼
     Top passages
           │
           ▼
    Contexte structuré
           │
           ▼
      LLM principal
           │
           ▼
        Réponse
           │
           ▼
    Réponse + sources
```

---

## 11. Architecture logicielle possible

Une première implémentation pourrait rester très compacte.

```text
candidate-copilot/
├── app/
│   ├── api.py
│   ├── knowledge.py
│   ├── markdown_parser.py
│   ├── search.py
│   └── llm.py
│
├── candidate-knowledge/
│   ├── profile.md
│   ├── skills/
│   ├── experience/
│   └── projects/
│
├── data/
│   └── knowledge.db
│
└── tests/
```

Le module principal pourrait exposer une API conceptuelle de ce type :

```python
class KnowledgeBase:

    def rebuild_index(self):
        ...

    def search(self, query: str, limit: int = 8):
        ...

    def build_context(self, question: str):
        ...
```

Le endpoint de chat pourrait ensuite être très simple :

```python
@app.post("/ask")
def ask(question: str):

    context = knowledge_base.build_context(question)

    answer = llm.answer(
        question=question,
        context=context
    )

    return {
        "answer": answer.text,
        "sources": answer.sources
    }
```

---

## 12. Pourquoi ne pas commencer directement avec une base vectorielle ?

Une base vectorielle apporte une recherche sémantique plus avancée, mais introduit également :

- génération d’embeddings ;
- gestion d’un index vectoriel ;
- synchronisation entre documents et index ;
- choix d’un modèle d’embeddings ;
- réglage du chunking ;
- réglage des scores de similarité ;
- infrastructure supplémentaire.

Pour quelques dizaines ou centaines de fichiers Markdown, cette complexité n’est pas forcément justifiée.

Le MVP peut donc commencer avec :

```text
Markdown
+
YAML Front Matter
+
découpage par headings
+
SQLite FTS5 / BM25
+
LLM de reformulation optionnel
+
LLM de réponse
```

Une recherche vectorielle pourra être ajoutée plus tard si les tests montrent que FTS5 ne retrouve pas suffisamment bien les informations.

---

## 13. Évolution possible vers une recherche hybride

Si nécessaire, le système pourra évoluer vers :

```text
                    ┌── Recherche FTS5 / BM25 ──┐
Question ───────────┤                            ├── Fusion / reranking
                    └── Recherche vectorielle ──┘
                                   │
                                   ▼
                              Top passages
```

La recherche FTS5 est efficace pour :

- mots précis ;
- technologies ;
- noms de projets ;
- produits ;
- acronymes ;
- termes métier.

La recherche vectorielle est utile pour :

- synonymes ;
- formulations différentes ;
- questions conceptuelles ;
- proximité sémantique.

Les deux approches sont donc complémentaires.

Mais cette évolution n’est pas nécessaire pour valider le concept de Candidate Copilot.

---

## 14. Principe directeur

Le composant central du projet n’est pas le chatbot.

Le composant central est la **base de connaissances structurée sur le candidat**.

Le moteur de recherche et le chatbot ne sont que des interfaces permettant de l’exploiter.

La même base pourrait ensuite servir à :

- répondre aux recruteurs ;
- préparer un entretien ;
- générer un CV adapté à une offre ;
- produire une lettre de motivation ;
- préparer des réponses à des questions classiques ;
- alimenter un portfolio ;
- mettre à jour un profil professionnel ;
- analyser l’adéquation avec une offre d’emploi.

Cela permet de construire Candidate Copilot progressivement sans enfermer le projet dans une architecture RAG complexe dès le départ.
