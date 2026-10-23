# Deux contrats éditoriaux finis

Critères et applicabilité **1.0.0** pour A et B. Accord de conception BC du 22 octobre 2026 ; aucune validation des faits ou d’un pilote n’en découle. Ces types éditoriaux ne créent pas de Resource. Le périmètre peut être borné ; pas d’inventaire de carrière ou de variante factuelle par employeur cible.

## A — Contexte professionnel et responsabilités

**But / questions du lecteur :** où se situait BC, de quoi était-il responsable, avec quelle autonomie et quelles relations ? **Limite :** contexte partagé, pas catalogue de projets ni score de compétence. Un contexte peut servir plusieurs réalisations B ; les liens n’exemptent pas d’expliquer le rôle localement.

| Critère | Ce que le lecteur doit comprendre | Règle |
|---|---|---|
| C1 | Activité, environnement, vocabulaire et bornes temporelles/périmètre attestés | Requis ; noms exacts/dates précises non universellement obligatoires ; ne pas suggérer un emploi ou usage actuel sans preuve |
| C2 | Responsabilités réelles, autonomie, pouvoir de décision et limites | Requis ; un intitulé est optionnel et ne remplace pas les tâches |
| C3 | Relations de travail, contribution personnelle/partagée ou véritable travail seul | Requis ; ne pas inventer équipe ou leadership |
| C4 | Activités concrètes rendant les responsabilités intelligibles | Requis ; un lien vers B ne remplace pas l’explication essentielle |
| C5 | Contraintes organisationnelles, opérationnelles ou réglementaires structurantes | Conditionnel à leur pertinence réelle ; motif privé si inapplicable |

Sections requises : environnement/périmètre ; rôle/responsabilités ; autonomie/collaboration ; activités concrètes. Section conditionnelle : contraintes structurantes. Ajouts optionnels : évolution significative du rôle, paysage technique pertinent, liens vers réalisations approuvées. La durée d’un poste ne démontre pas la maîtrise de tout le système.

## B — Réalisation ou projet

**But / questions du lecteur :** quel problème ou objectif, qu’a fait BC, pourquoi cette approche, qu’est-ce qui est démontré ou reste inachevé ? **Limite :** module, mécanisme, intégration, amélioration ou projet personnel borné ; ne pas attribuer le produit entier à BC. Un projet personnel n’exige ni employeur/client ni document A. Achèvement, production et impact métier ne sont pas des prérequis.

Enregistrer et expliquer **trois dimensions indépendantes** : cadre professionnel/personnel ; maturité réelle (PoC, prototype, en cours, terminé, arrêté… descriptions, pas nouvelle enum runtime) ; usages/preuves observés (tests, démo locale, démo déployée, utilisation opérationnelle…). Déploiement public ≠ usage de production ; un projet personnel peut avoir de vrais utilisateurs. Distinguer public visé et utilisateurs réels, état passé et état actuel attesté.

| Critère | Ce que le lecteur doit comprendre | Règle |
|---|---|---|
| R1 | Problème/objectif, cadre, public visé, situation initiale, vocabulaire du domaine | Requis ; apprentissage/exploration légitimes |
| R2 | Travail effectué et contribution BC, séparés du collectif, de la réutilisation et du planifié | Requis ; décrire ce qui existe sans suggérer une livraison achevée |
| R3 | Approche mise en œuvre ou véritablement explorée et raisons étayées des choix importants | Requis au niveau pertinent ; alternatives seulement réellement considérées |
| R4 | Maturité, comportement démontré, usage observé ou non-déploiement explicite, état/période attestés | Requis ; non-production honnête satisfait le critère ; récit confirmé par BC possible, code public/captures non obligatoires |
| R5 | Résultats observés, force des preuves, parties non testées/incomplètes, limites | Requis ; tests/démo ≠ impact métier ou fiabilité production ; séparer acquis/attendu |
| R6 | Contraintes, déploiement, maintenance/incidents et apprentissages qui changent la compréhension | Conditionnel à l’expérience/pertinence ; exploitation seulement si l’usage est revendiqué ; apprentissage possible à tout stade |

Sections requises : objectif/contexte ; contribution/périmètre réalisé ; solution/choix ; état/usages réels ; résultats/limites. Section conditionnelle : contraintes/retour d’expérience. Ajouts optionnels : chiffres étayés, diagrammes, artefacts autorisés, prochaines étapes explicitement prospectives. Aucune métrique, échelle, économie ou preuve publique obligatoire. Une démo locale expliquée avec limites peut suffire ; son existence ne doit jamais être inventée.

## Seuil commun

Complétude = explications suffisantes et étayées pour **chaque critère applicable**, pas titres remplis. Dans le checkpoint privé, chaque critère porte son applicabilité, un motif d’omission si nécessaire et les citations exactes/sections de la révision, ou une lacune. Les faits cachés de l’entretien et les liens ne comptent pas comme passages. Information requise indisponible : document bloqué, sans divulgation forcée ; information optionnelle manquante : omission possible. Les omissions privées ne sont pas publiées.

Les métadonnées éditoriales et versions restent en sidecar ; la rendition éligible utilise seulement le contrat public existant : `document_id`, `created_at`, `visibility: public`, `reviewed_by`, `reviewed_at`, et éventuellement `title`, `topics`, `aliases` utiles et sûrs. Ne jamais préremplir une approbation. Toute réécriture garde l’identité et renouvelle faits, compréhension et éligibilité.
