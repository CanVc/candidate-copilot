# Checkpoint privé, reprise fraîche et révision

Procédure **1.0.1**, schéma **1**. Le checkpoint est l’état durable, avec les raisons des décisions ; la conversation n’est pas une sauvegarde. Ne lire ni créer d’état réel avant le préflight de traitement/consentement. Le journal de construction de la skill est nonsensible et ne reçoit jamais les faits d’entretien. Aucun appel BMad à l’exécution.

## Contenu et sauvegarde

Utiliser `checkpoint-template.json` pour A ou `checkpoint-realization-template.json` pour B comme squelette **privé**, pas comme exemple de réalisation. Les squelettes sont volontairement incomplets : identité/date et, pour B, les trois dimensions doivent venir du sujet réel autorisé. Un cadre encore inconnu reste nul, maturité/usage peuvent rester vides dans un checkpoint de pause ; signaler ces lacunes, sans inventer ni fermer la revue. Les valeurs vides/nulles ne sont pas des accords. À la première création du document, allouer un UUID stable (`document_id`) et la date réelle de création (`created_at`) ; conserver cette identité à toute révision/déplacement. Le champ `draft` est obligatoire : avant le premier brouillon, il vaut explicitement `null` et les accords le restent ; ensuite il contient `path` relatif et `sha256` des octets sélectionnés. Un candidat sans ce champ est rejeté. À la création de l’état : révision 1 et séquence 1.

Le checkpoint contient : type ; révision et séquence de sauvegarde ; cadre/maturité/usage pour B ; stade ; versions exactes agent/template/guide/critères ; chemin relatif et SHA-256 **privé** du brouillon ; sources autorisées sélectionnées/provenance ; assertions/inférences/faits confirmés ; corrections BC ; conflits/incertitudes ; décisions/omissions et raisons d’applicabilité ; lacunes requises/optionnelles ; prochaines questions ; route/contexte et portée du consentement ; trois accords distincts et leur historique. Les noms, correspondances de sources et empreintes restent privés, jamais dans `acceptance.md`. Dans `provenance`, lier un identifiant de source privé et son emplacement sélectionné aux assertions/faits concernés ; chaque fait conserve son statut et son origine, et une confirmation BC indique l’échange/la correction qui la fonde. La liste des sources n’est pas un ordre de toutes les ouvrir.

Chaque critère C/R contient `applicability`, `rationale`, `passages` (section et citation exacte) et `gap`. Les critères requis le restent. Pour le critère conditionnel, choisir applicable/inapplicable avec motif privé, ou unresolved. Le helper vérifie la présence littérale des citations, **pas leur pertinence**. BC et l’agent jugent leur suffisance.

Pour sauvegarder, préparer un JSON candidat distinct dans la racine privée choisie. Avec Python standard-library seulement, lire d’abord l’interface :

```sh
python3 tools/content-authoring/scripts/checkpoint.py --help
```

Après autorisation réelle uniquement, la forme d’appel depuis la racine du projet est :

```sh
python3 tools/content-authoring/scripts/checkpoint.py save "$CANDIDATE" --root "$PRIVATE_ROOT" --out "$CHECKPOINT" --versions tools/content-authoring/versions.json
```

BC/agent sélectionne explicitement ces chemins. `PRIVATE_ROOT` est le sous-arbre privé authoring autorisé ; candidat, checkpoint et références internes doivent y rester. Aucune recherche par glob ni lecture d’autres sources par le helper. Pour les tests, utiliser exclusivement une racine temporaire synthétique. Les sources sont vérifiées pour confinement sans être ouvertes.

`save` charge le checkpoint destination existant comme précédent et contrôle la continuité avant remplacement atomique (temporaire privé, flush/fsync et rename). Incrémenter `checkpoint_seq` à chaque sauvegarde, y compris les échanges sans changement de texte. Ne pas écraser ou tronquer les listes `corrections`, `decisions`, `review_history` ; ajouter une correction explicite si une ancienne décision est remplacée. Dès qu’un accord existant non nul est retiré ou remplacé, ajouter le snapshot complet `{revision, approvals}` du précédent dans la nouvelle portion de `review_history`, même à révision identique (retrait de revue, changement handling/sources ou remplacement d’attestation). Une archive déjà ancienne ne suffit pas ; compléter un accord auparavant nul n’exige pas d’archive. Un changement de handling ou de sources autorisées remet les trois accords à null et demande un nouveau préflight/consentement adapté. Le JSON doit être standard : doublons de clés et nombres non finis (`NaN`, `Infinity`, débordement flottant) sont rejetés ; une erreur de lecture/validation/sérialisation préserve le checkpoint existant. Un seul écrivain ; pas de garantie contre un processus hostile, une course de liens symboliques ou une panne d’alimentation. Ce n’est pas une transaction entre brouillon et checkpoint. Conserver la révision antérieure sélectionnée et signaler toute divergence après interruption.

## Reprise dans une session sans historique

1. Refaire le gate handling/consentement **avant la lecture du checkpoint**, car il contient des sources et décisions privées. Démarrer une nouvelle session Pi dédiée, pas un fork de la construction ni `/resume` de l’ancien entretien. Vérifier `/session` et le contexte automatique.
2. BC sélectionne un checkpoint précis ; lire ce seul état et les ressources génériques. Contrôler versions, identité, type/révision, fichier/digest du brouillon et confinement. `validate "$CHECKPOINT" --root "$PRIVATE_ROOT" --versions tools/content-authoring/versions.json` est en lecture seule ; ajouter `--previous "$PREVIOUS"` seulement si BC sélectionne aussi un état antérieur pour vérifier la continuité. Sans précédent, le helper ne prouve pas l’historique.
3. Présenter à BC une restitution des corrections, faits confirmés/incertains, décisions d’applicabilité, lacunes, accords et prochaines questions. Faire confirmer ce qui a changé, reprendre au stade enregistré et ne poser que les questions encore utiles.

Fichier absent, texte/digest divergent, ancien schéma, version différente, provenance ou consentement incomplet : **bloquer la reprise automatique** et demander clarification. Ne pas explorer sessions, corpus ou dossiers voisins pour inventer l’état perdu. Une restauration JSON déterministe n’est pas une preuve d’entretien adaptatif ou de compréhension réelle.

## Révision et évolution de l’outil

Toute modification du texte, même purement rédactionnelle, conserve identité/date de création, incrémente `revision`, consigne les faits modifiés (`changed_facts`, vide si aucun) et remet `facts`, `comprehension`, `eligibility` à null. Avant de les effacer, archiver les accords précédents dans `review_history` sous `{revision, approvals}`. Le premier enregistrement d’une nouvelle révision doit les laisser nuls ; les revues renouvelées seront enregistrées ensuite, sans nouveau changement du texte.

Lors d’une réécriture ou du retrait de revues, retirer aussi du frontmatter du texte `visibility: public`, `reviewed_by` et `reviewed_at` : remettre seulement le sidecar à null ne suffit pas. Conserver `document_id`, `created_at` et l’historique privé des revues. Si ce retrait modifie les octets, appliquer les règles de nouvelle révision ci-dessus même si les faits n’ont pas changé. Ne pas réutiliser les anciennes métadonnées comme preuve d’une nouvelle revue. Seule la préparation en deux passes de `review.md` peut insérer des métadonnées **nouvellement recueillies et réelles** après les premiers accords : cette nouvelle rendition reste privée/provisoire, avec accords nuls jusqu’à la réapprobation de ses octets finaux exacts. Un refus/retrait enlève à nouveau ces trois champs. Ce sont des instructions éditoriales ; le helper ne modifie ni ne contrôle le frontmatter et ne publie rien.

Un ancien checkpoint accepté avec `draft` absent peut servir de précédent, cette absence étant comparée à `null` seulement pour la continuité. Préparer un candidat explicite `draft: null`, conserver identité et listes historiques, puis incrémenter la séquence. Cette seule réparation n’impose pas une nouvelle révision ; un premier vrai brouillon ou un changement de versions l’impose toujours. Ne pas supprimer le précédent pour contourner les contrôles. Aucun pilote réel n’existe à migrer/réapprouver dans cette construction.

Une modification d’agent/template/guide/critères demande analyse des effets et revalidation des pilotes concernés. Ne pas changer silencieusement l’ancien checkpoint pour le faire passer : préserver l’état antérieur, expliquer la migration, reprendre la même identité avec une nouvelle révision et accords nuls, puis renouveler les trois revues. Le contrôle de versions est exact, pas une interprétation sémantique de compatibilité.

Si le helper ou Python est indisponible, on peut conserver le candidat et faire une revue manuelle explicitement non vérifiée, mais ne pas annoncer une sauvegarde atomique/validation déterministe réussie ou une éligibilité acquise. Résoudre la divergence avant un transfert ; ne jamais contourner une erreur de contrôle en effaçant le précédent.
