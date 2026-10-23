# Format B — Réalisation ou projet

Template **1.0.1**, critères **1.0.0**. Ressource générique, pas réalisation ou pilote BC. Un projet professionnel **ou personnel**, même PoC/prototype/en cours/arrêté, est recevable à son état réel. Aucun employeur, document A, achèvement, production ou impact métier exigé.

```markdown
# <Titre factuel de la réalisation ou du projet>

## Objectif et contexte
<Problème ou objectif d’apprentissage/exploration ; cadre professionnel/personnel,
public visé, point de départ et vocabulaire. R1 requis.>

## Ma contribution et le périmètre réalisé
<Ce que j’ai fait, ce que d’autres/composants réutilisés ont apporté,
ce qui n’est encore que prévu. R2 requis.>

## Solution et choix importants
<Approche effectivement mise en œuvre/explorée et raisons attestées ;
alternatives seulement vraiment envisagées. R3 requis.>

## État du projet et usages réels
<Maturité réelle, comportement démontré, usages observés ou absence d’usage /
non-déploiement explicites, état/période attestés. R4 requis.>

## Résultats démontrés et limites
<Observations, comment elles ont été établies, force de preuve,
parties inachevées/non testées et limites ; distinguer bénéfices attendus. R5 requis.>

## Contraintes et retour d’expérience
<Seulement les contraintes/apprentissages pertinents réellement vécus ;
déploiement, exploitation/incidents uniquement si applicables. R6 conditionnel.>
```

Cadre, maturité et usage sont indépendants, décrits dans la narration et l’applicabilité privée, pas de nouveaux enums/champs publics. Une démo publique ne prouve pas un usage opérationnel ; des tests ne prouvent ni impact économique ni fiabilité de production. Un projet personnel peut avoir de vrais utilisateurs, sans les inférer. Ne pas transformer un plan en acquis ni un état passé en usage actuel.

Optionnel : mesures étayées, diagrammes, artefacts autorisés, étapes futures clairement prospectives. Un récit BC-confirmé peut suffire sans code public, captures ou client nommé. Une démo locale attestée avec limites peut satisfaire R4/R5 ; ne pas inventer démo/utilisateurs/résultat. Si un fait requis manque, bloquer ; ne pas traiter l’absence honnête de production comme un manque.

Pour R1–R5 et R6 applicable, consigner des passages exacts ou une lacune dans le sidecar. Un lien, une rubrique remplie ou une connaissance cachée ne vaut pas explication. Omettre les rubriques inapplicables et garder leur motif privé.

Le brouillon ne préremplit aucun accord ni `visibility: public`. À toute réécriture ou retrait de revues, retirer `visibility: public`, `reviewed_by` et `reviewed_at` du frontmatter ; conserver `document_id`, `created_at` et l’historique privé des accords retirés/remplacés. Sidecar privé : identité, révision, type, état, versions, preuves et accords.

Suivre les deux passes de `workflow/review.md` : après les trois premiers accords réels, ajouter seulement les métadonnées nouvellement recueillies du contrat public existant (`document_id` stable, `created_at` réel, `visibility: public`, `reviewed_by` et `reviewed_at` réels). Archiver ces premiers accords ; l’ajout crée une nouvelle révision privée/provisoire avec accords nuls, puis recueillir les trois accords sur les octets finaux exacts, métadonnées incluses. Un refus/retrait retire à nouveau les trois champs d’approbation. `title`, `topics`, `aliases` sont optionnels et sûrs ; aucun champ public éditorial supplémentaire. Le fichier reste privé jusqu’à 2.1, même après réapprobation ; aucune réécriture/publication automatique.
