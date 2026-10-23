# Format A — Contexte professionnel et responsabilités

Template **1.0.2**, critères **1.0.0**. Ce fichier est une ressource générique, pas un document BC ni un pilote. Copier seulement le squelette utile dans un brouillon privé ; retirer instructions, placeholders et sections inapplicables avant revue.

```markdown
---
document_id: "<UUID stable>"
created_at: ""
modified_at: ""
title: "<Titre factuel du contexte professionnel>"
reviewed_by: ""
reviewed_at: ""
---

# <Titre factuel du contexte professionnel>

## Environnement et périmètre
<Activité, environnement, termes expliqués et bornes attestées. C1 requis.>

## Mon rôle et mes responsabilités
<Ce dont je répondais réellement, pouvoir de décision et limites. C2 requis.>

## Autonomie et collaboration
<Qui faisait/décidait quoi ; contribution personnelle/partagée ou travail seul. C3 requis.>

## Activités concrètes
<Exemples suffisants pour comprendre le rôle sans suivre de lien. C4 requis.>

## Contraintes structurantes
<Seulement si réellement pertinentes ; leur effet sur le rôle. C5 conditionnel.>
```

Optionnel : titre de poste, noms/dates précis autorisés, évolution du rôle, technologies pertinentes, liens sûrs vers réalisations approuvées. Ne pas confondre intitulé ou durée et compétence démontrée. Une absence de précision ne doit pas suggérer une actualité ou une certitude fausse.

Avant éligibilité, vérifier C1–C4 et C5 si applicable par **passages du brouillon**, jamais par notes cachées. Chaque manque requis bloque ; une omission inapplicable a un motif privé, pas un paragraphe de justification public. Aucune date, équipe, responsabilité ou preuve inventée. Les liens/artefacts sont facultatifs et ne remplacent pas l’explication.

Le brouillon conserve `reviewed_by: ""` et `reviewed_at: ""` comme placeholders, jamais comme accords, et ne préremplit pas `visibility: public`. À toute réécriture ou retrait de revues, retirer `visibility: public` et remettre les deux champs de revue à vide ; conserver `document_id`, `created_at` et l’historique privé des accords retirés/remplacés. Les champs documentaires requis sont `document_id`, `created_at`, `modified_at`, `title` et les dates connues sont des chaînes UTC `YYYY-MM-DDTHH:mm:ssZ`. Renseigner les dates réelles, actualiser `modified_at` seulement lors d’une modification du document et ne pas inventer d’heure historique ; une ancienne date de création sans heure reste une exception privée signalée jusqu’à clarification. Voir `content/AGENTS.md` depuis la racine du projet. Son sidecar conserve identité/type/révision/versions/provenance/accords.

Suivre les deux passes de `workflow/review.md` : après les trois premiers accords réels, ajouter seulement les métadonnées nouvellement recueillies du contrat public existant (`document_id` stable, `created_at` réel, `modified_at` réel, `title` factuel, `visibility: public`, `reviewed_by` et `reviewed_at` réels). Archiver ces premiers accords ; l’ajout crée une nouvelle révision privée/provisoire avec accords nuls, puis les trois revues doivent porter sur les octets finaux exacts, métadonnées incluses. Un refus/retrait retire à nouveau `visibility: public` et remet les deux champs de revue à vide. `title` est requis ; `topics` et `aliases` restent optionnels et sûrs. Toutes les dates publiques doivent être connues et conformes ; les placeholders ne passent pas la validation publique. Aucun nouveau champ public de type/état/version. Même après réapprobation le fichier reste privé jusqu’à 2.1 ; aucune réécriture/publication automatique.
