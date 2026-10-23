# Story 2.0 — Point de reprise après pause

## Mise à jour du 23 octobre 2026 — reprise actuelle

Les ressources sont désormais en **1.0.2**. BC a réalisé deux documents B, valide l’investigation et la reprise fraîche, et confirme que traitement/consentement lui conviennent. Les limites techniques divulguées restent des limites, pas des vérifications acquises. Ne pas redemander les formalités déjà acceptées sur le périmètre inchangé.

Le frontmatter et les checkpoints courants sont corrigés, sans réécrire les récits ou les archives. Les champs de revue restent vides ; les attestations antérieures sont conservées en privé, pas reportées sur de nouveaux octets. Les omissions justifiées et une correction de compréhension sont déjà documentées. Il reste le pilote **A**, la preuve de blocage pour fait requis indisponible, la branche B non-production si absente, puis les revues affectées et l’acceptation finale. Une heure de création inconnue reste explicitement manquante, sans invention, jusqu’à preuve suffisante avant éligibilité publique.

Références actuelles : `tools/content-authoring/acceptance.md`, `content/AGENTS.md` et `spec-2-0-document-frontmatter-and-pilot-evidence.md` dans ce dossier. Story 2.0 reste `in-progress` ; aucune publication. Les paragraphes ci-dessous décrivent exclusivement la pause et la construction du **22 octobre**, pas les prochaines formalités à répéter.

## Historique de la pause du 22 octobre

**Pause demandée par BC le 22 octobre 2026. Aucun travail autonome à poursuivre pendant la pause.**

## État réel

- Epic 1 terminé. Epic 2 et Story 2.0 restent `in-progress`.
- Cadrage corrigé approuvé ; outil d’entretien construit en **1.0.1** avec le Builder officiel.
- BMad de ce projet : **6.12.4** ; Builder : **2.2.2**. Installation déjà effectuée, ne pas la relancer.
- Entrée explicite Pi : `/skill:content-authoring`. Guide : `tools/content-authoring/README.md` ; état des preuves : `tools/content-authoring/acceptance.md`.
- Deux types : contexte professionnel/responsabilités et réalisation/projet. Le second couvre aussi les projets personnels, prototypes, PoCs et travaux en cours. Commencer par la production est un ordre de travail, pas une condition d’admissibilité.
- Français, première personne, réutilisation des documents/transcriptions sélectionnés ; investigation adaptative et corrections BC, pas questionnaire exhaustif.

## Ce qui a été vérifié

Le parent a contrôlé les correctifs et réexécuté **31 tests du helper**, **15 tests de sécurité**, le chargement explicite dans Pi, l’exclusion de **33 canaris** des deux builds et les quatre vérifications TypeScript. Node 24.22.0/npm 11.19.1 sélectionnés dans un sous-processus, sans changement de défaut global.

Le scanner officiel conserve exactement deux exceptions documentées : journal de construction `.memlog.md` à la racine et clé Pi `disable-model-invocation`. Son résultat brut reste fail ; ne pas retirer ces protections ni modifier le vendor pour fabriquer un succès. Ruff absent, aucun lint Ruff revendiqué. Un appel antérieur au script de comptage a alimenté le cache isolé uv, sans dépendance ajoutée au projet ; suites suivantes hors ligne/Python standard. Détails et limites dans `acceptance.md`.

## Prochaine action, sans recommencer la construction

Demander à BC quel **fournisseur/modèle et mode d’accès** il souhaite utiliser pour les entretiens (abonnement, API, local), **sans clé, identifiant ni source professionnelle**. Compléter ensuite le préflight de `tools/content-authoring/handling.md` : traitement, contexte automatique, copies, rétention, suppression et consentement adapté.

Seulement après ces vérifications et autorisations : sessions Pi neuves dédiées, vrais pilotes corrigés et validés par BC, un par type, avec reprise fraîche depuis un checkpoint privé et accords datés sur les versions finales. Aucun checkpoint d’entretien réel ni pilote n’a été créé par cette phase de construction. Le journal du skill contient uniquement la construction générique ; ne pas le confondre avec un checkpoint d’entretien.

L’analyse complète Builder et les évaluations modèle supplémentaires restent facultatives et non autorisées automatiquement. Aucune publication ; la copie publique relève de 2.1. La story ne sera terminée qu’après les preuves réelles et l’acceptation humaine de la méthode.

## Conservation et reprise

Les changements sont écrits dans le worktree, **sans staging, commit ni push**. Préserver aussi les changements de planning antérieurs et la mise à jour BMad ; ne pas lancer reset/clean/restauration automatique.

Pi conserve sa session localement. Depuis ce dépôt, `pi --continue` reprend la plus récente ; `pi --resume` permet de choisir. Une nouvelle session peut repartir de ce fichier : « Reprends la Story 2.0 depuis docs/_bmad-output/implementation-artifacts/handoff-2-0-content-authoring.md ».

Une archive locale des fichiers de travail sélectionnés est conservée hors du dépôt sous `${XDG_STATE_HOME:-$HOME/.local/state}/candidate-copilot/pauses/`. Elle exclut `.git`, les dépendances, les environnements, les sessions Pi et `content/private`. Aucune exportation ou transmission de session. Consulter l’archive si une récupération est nécessaire ; ne pas la restaurer automatiquement par-dessus des travaux ultérieurs.
