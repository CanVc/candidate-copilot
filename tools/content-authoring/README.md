# Rédaction documentaire — usage Pi

**Version de construction 1.0.1 ; méthode non acceptée.** Deux types approuvés en conception ; aucun pilote réel ni traitement de données privées autorisé par cette livraison. Les versions exactes sont dans `versions.json`, les limites dans `acceptance.md`.

## Sessions

| Moment | But | Sortie |
|---|---|---|
| Conception approuvée | Types, contrats, voix française à la première personne, emballage Pi | Accord de conception du 22 octobre 2026, pas accord sur les faits |
| Construction | Outil réutilisable et contrôles jetables | Livraison technique seulement |
| Pilotes, plus tard | Un vrai document corrigé et validé par BC par type, reprises fraîches | Preuves privées, approbations distinctes et revalidation sur versions finales |

Une seule entrée, `/skill:content-authoring`, explicite uniquement. Lancer depuis la racine du dépôt ; Pi découvre `.pi/skills/`. Examiner la confiance projet et les diagnostics ; après modification, `/reload`. Pas d’installation, extension, abonnement payant ou dépendance BMad à l’exécution. Python 3.10+ suffit pour le helper local standard-library ; pas d’environnement Python applicatif.

**Avant tout matériau non public**, BC fait compléter le préflight de `handling.md` sans joindre le matériau à une route inconnue. Ne pas commencer par coller une transcription ou ajouter `@fichier`. Puis seulement, dans une session neuve dédiée, depuis la racine :

```sh
pi --session-dir content/private/authoring/sessions
```

Vérifier l’emplacement effectif avec `/session` avant la première transmission. Cette commande ne choisit pas de fournisseur et n’isole pas les fichiers ; examiner également le contexte automatique et les extensions. Ne pas forker l’historique de conception/construction.

```text
/skill:content-authoring démarrer type A — sujet borné à confirmer
/skill:content-authoring démarrer type B — projet personnel prototype, sans usage réel attesté à ce stade
```

BC choisit des documents/transcriptions français déjà disponibles et autorisés ; ils peuvent fournir le récit initial. Le modèle propose une compréhension à corriger et ne redemande pas ce qui est clair. BC peut aussi raconter librement. Commencer de préférence par un travail utilisé en production n’exclut aucun projet personnel, PoC, prototype ou travail en cours.

## Pause et reprise

Demander « pause » à tout moment. L’agent écrit le checkpoint et signale ses lacunes ; le fichier sélectionné est l’autorité de reprise. À une nouvelle session, refaire le préflight **avant de lire** le checkpoint, puis :

```text
/skill:content-authoring reprendre le checkpoint privé que je sélectionnerai après le préflight
```

L’agent vérifie le fichier sélectionné et le brouillon lié, présente faits corrigés, incertitudes, décisions et prochaines questions à BC, puis reprend au stade enregistré. Aucun accès caché à l’ancienne session. `/new` crée une session vierge ; `/resume` rouvre un historique et ne prouve donc pas cette restauration. Une contradiction ou une version incompatible bloque la reprise automatique et appelle une clarification.

Ressources : `agent.md` (posture), `types.md` (contrats C1–C5/R1–R6), `templates/` et `guides/` (branche choisie), `workflow/` (boucle, checkpoint, revue). Le helper `scripts/checkpoint.py --help` décrit les contrôles déterministes ; un succès ne valide ni sens, ni consentement, ni faits. Ses tests n’utilisent que des racines temporaires synthétiques. Le checkpoint exige un champ `draft` explicite (`null` avant brouillon), du JSON standard sans nombres non finis et un historique append-only. Un accord retiré/remplacé exige un nouveau snapshot privé, même à révision identique ; compléter un accord absent n’en exige pas. Le helper accepte comme précédent un ancien état sans `draft`, comparé à null, pour une réparation explicite sans perte d’identité/historique ; les règles de versions/révisions restent inchangées.

## Fin et transfert

BC approuve séparément la fidélité factuelle, la compréhension autonome et l’éligibilité à publication pour une révision précise. Toute réécriture ou retrait de revues retire du texte `visibility: public`, `reviewed_by`, `reviewed_at`, conserve `document_id`/`created_at` et archive les accords privés ; renouveler les trois revues même sans changement de faits. Suivre `workflow/review.md` en deux passes : seuls les nouveaux accords réellement recueillis permettent de préparer les métadonnées ; leur ajout crée une nouvelle révision privée/provisoire avec accords nuls, puis exige les trois accords sur les octets finaux exacts. Le helper ne retire pas le frontmatter et ne prouve pas le comportement du modèle. Aucun pilote réel n’existe à migrer/réapprouver ; tous les futurs pilotes restent privés. Story 2.1 possède couverture du corpus, validation publique et copie explicitement approuvée ; 3.1 possède les Resource/maps. Cet outil ne copie, ne publie, n’indexe et n’évalue aucune candidature.
