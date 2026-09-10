# Discussion — Positionnement et sécurité

## Décisions actuelles

- L’utilisateur prioritaire de Candidate Copilot est le **recruteur**.
- L’application est pensée comme un **portfolio interactif post-entretien**, et non comme un outil destiné à ouvrir ou conduire l’entretien.
- Le candidat peut la présenter en fin d’échange afin que le recruteur puisse explorer ultérieurement son parcours, ses projets et ses preuves.
- La base de connaissances pourra être réutilisée par d’autres projets, notamment pour la préparation personnelle.
- Le nom retenu pour cette base est `candidate-knowledge/`.

## Séparation public / privé

Structure envisagée :

```text
candidate-knowledge/
├── public/
└── private/
```

L’application accessible aux recruteurs doit rechercher exclusivement dans `public/`.

Les données privées ne doivent pas être récupérées puis filtrées par un prompt. Idéalement, elles ne doivent pas être présentes sur le serveur public. L’index utilisé par l’application publique doit donc être construit uniquement à partir des documents publics.

## Recherche avec SQLite FTS5

FTS5 est le moteur de recherche plein texte intégré à SQLite. Il permet d’indexer les sections des fichiers Markdown, de rechercher rapidement des mots ou expressions et de classer les passages par pertinence.

Il s’agit principalement d’une recherche lexicale, pas d’une compréhension sémantique. Une reformulation par LLM ou une recherche vectorielle ne devra être ajoutée que si les tests montrent que FTS5 est insuffisant.

Les fichiers Markdown restent la source de vérité ; l’index SQLite est un artefact dérivé et reconstructible.

## Bornage de l’application publique

Points à prévoir avant mise en production :

- réponses fondées uniquement sur les sources publiques ;
- citations systématiques ;
- refus clair lorsque l’information manque ou que la question sort du périmètre ;
- limites de taille, de durée, de volume et de coût ;
- protection contre les abus et les tentatives de prompt injection ;
- tests sur un jeu de questions et réponses attendues.

## Questions encore ouvertes

- Habillage exact de l’interface : chat seul, présentation rapide, projets mis en avant ou questions suggérées.
- Présence ou non de coordonnées sur un site accessible publiquement.
- Moyen de contact éventuel protégeant les informations personnelles : formulaire, adresse dédiée, lien temporaire ou accès restreint.
- Niveau d’accès au site : entièrement public, lien non référencé, accès par invitation ou authentification légère.
