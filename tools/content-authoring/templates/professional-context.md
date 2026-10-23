# Format A — Contexte professionnel et responsabilités

Template **1.0.1**, critères **1.0.0**. Ce fichier est une ressource générique, pas un document BC ni un pilote. Copier seulement le squelette utile dans un brouillon privé ; retirer instructions, placeholders et sections inapplicables avant revue.

```markdown
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

Le brouillon ne préremplit pas `reviewed_by`, `reviewed_at` ou `visibility: public`. À toute réécriture ou retrait de revues, retirer ces trois champs du frontmatter ; conserver `document_id`, `created_at` et l’historique privé des accords retirés/remplacés. Son sidecar conserve identité/type/révision/versions/provenance/accords.

Suivre les deux passes de `workflow/review.md` : après les trois premiers accords réels, ajouter seulement les métadonnées nouvellement recueillies du contrat public existant (`document_id` stable, `created_at` réel, `visibility: public`, `reviewed_by` et `reviewed_at` réels). Archiver ces premiers accords ; l’ajout crée une nouvelle révision privée/provisoire avec accords nuls, puis les trois revues doivent porter sur les octets finaux exacts, métadonnées incluses. Un refus/retrait retire à nouveau les trois champs d’approbation. `title`, `topics`, `aliases` restent optionnels et sûrs. Aucun nouveau champ public de type/état/version. Même après réapprobation le fichier reste privé jusqu’à 2.1 ; aucune réécriture/publication automatique.
