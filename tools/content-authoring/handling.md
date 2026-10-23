# Préflight de traitement — bloquant avant toute entrée non publique

**État de construction : route réelle, compte, rétention fournisseur, copies d’extensions et consentement NON VÉRIFIÉS. Aucun matériau réel n’a été lu ou demandé pour ces contrôles.** Ne pas consulter des paramètres secrets pour combler ces inconnues. BC doit préparer la divulgation et choisir les entrées avant toute transmission, checkpoint compris.

## Ce qui est établi, et ce qui ne l’est pas

Documentation installée Pi **1.3.0** (`docs/skills.md`, `sessions.md`, `cli.md`, `security.md`, exemples SDK ressources/sessions) consultée pendant la construction :

- Pi persiste normalement les sessions sous `~/.pi/agent/sessions/` ; `--session-dir` en change la destination pour ce processus. `/session` permet de vérifier le fichier réel. `--no-session` est éphémère mais n’efface ni copies antérieures ni copies fournisseur/extension.
- Historique, arguments/résultats d’outils, fichiers lus et messages peuvent figurer dans les sessions. Compaction et changement de branche n’effacent pas les entrées originales. `/new` sépare l’historique ; `/resume` le rouvre.
- Les contextes automatiques, ressources, extensions, MCP, outils et processus peuvent transmettre ou conserver des données. Les fichiers de contexte peuvent se charger même sans confiance projet. La confiance projet et le dossier courant ne sont pas un bac à sable.
- `/share`, `/export`, `/bug` peuvent créer ou transmettre d’autres copies : ne pas les utiliser automatiquement. Les extensions possèdent les permissions du processus.

Ces faits documentaires **ne vérifient pas le compte ou les réglages de BC**. Fichiers locaux ≠ modèle local ; nouveau dossier ≠ zéro rétention ; aucune politique de 90 jours de l’application ne s’applique à l’authoring. Aucun service payant n’est imposé et aucun fournisseur n’est sélectionné par l’outil.

## Dossier privé de préflight, à remplir plus tard avec BC

Ne pas mettre ici noms de comptes, détails de consentement ou chemins de sources. En privé, consigner pour la session sélectionnée :

| Point à divulguer et vérifier | Preuve attendue avant entrée |
|---|---|
| Route exacte | Pi/version, modèle, fournisseur, type de compte/organisation, local ou distant ; aucune clé/token dans le dossier |
| Traitement fournisseur | Conditions officielles correspondant au compte, entraînement, rétention, région/sous-traitants si pertinents, exceptions et impossibilités de suppression ; date de vérification |
| Entrées et contexte | Sélection/screening BC, fichiers de contexte, historique, pièces jointes, extensions/MCP, commandes et journaux/exports actifs ; réduire ou désactiver ce qui n’est pas autorisé avant lecture |
| Copies locales | Emplacements effectifs de travail, session, logs, caches d’extensions, exports, sauvegardes/synchronisation ; permissions et personnes pouvant y accéder |
| Conservation/suppression | Durée choisie par BC, procédure précise par copie, limites connues, preuve de test jetable ; ne pas promettre effacement fournisseur par suppression locale |
| Accord | Consentement BC explicite daté sur cette route, cette sélection et ce contexte ; portée privée et possibilité d’arrêt |

**Inconnu matériel ⇒ STOP.** Ne pas faire téléverser les sources brutes pour les nettoyer. BC exclut secrets et informations confidentielles de tiers non autorisées avant transmission ; l’agent ne garantit pas une détection/extraction exhaustive. Un accord générique de conception n’est pas ce consentement. Refaire l’accord si route, matériaux, contexte automatique ou divulgation changent. Ne pas exploiter un ancien historique pour contourner le gate.

## Stockage et suppression, sans automatisme destructeur

Après accord seulement, utiliser les zones privées gitignorées prévues : sources sélectionnées, pilotes, checkpoints, evidence, sessions sous `content/private/authoring/`. L’outil générique reste hors des deux arbres de contenu. Ces instructions n’imposent pas de créer ces zones pendant la construction.

Pour la session dédiée, proposer `pi --session-dir content/private/authoring/sessions` depuis la racine et vérifier `/session`. Ne pas déplacer rétroactivement d’autres sessions. Aucun changement de paramètres globaux. Une séparation système réelle demande une solution explicitement choisie par BC ; ne pas la supposer.

Procédure locale à faire confirmer/tester **sur fixtures jetables** pour la route réelle : fermer les processus qui écrivent ; inventorier avec BC les seules copies autorisées et les sauvegardes ; sélectionner les fichiers exacts ; demander confirmation avant suppression ; utiliser la suppression du sélecteur Pi pour la session sélectionnée ou supprimer les fichiers exacts approuvés ; vérifier leur absence sans en afficher le contenu. Traiter séparément checkpoints/brouillons/exports/logs/caches et sauvegardes. Pas de suppression récursive globale, pas de scan de dossiers voisins. La suppression logique ne prouve ni effacement physique du disque ni destruction de copies hors contrôle.

Les docs Pi décrivent la suppression dans le sélecteur, mais **aucune suppression de session réelle ni procédure propre au fournisseur/compte n’a été testée ici**. BC doit documenter le mécanisme fournisseur et ses limites, ou maintenir le blocage. Arrêter une session n’annule pas des transmissions déjà effectuées. Les scans Git/build ne remplacent pas ce préflight.
