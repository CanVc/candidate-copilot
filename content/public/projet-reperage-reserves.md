---
document_id: "a53a192f-51d5-4537-8200-427a09ee1ea3"
created_at: "2026-11-17T14:31:20Z"
modified_at: "2026-11-18T08:46:57Z"
title: "Fiction — Repérage et fiabilisation des emplacements en réserve"
visibility: public
reviewed_by: "BC — revue finale pour le développement synthétique uniquement"
reviewed_at: "2026-11-18T08:45:47Z"
---

# Fiction — Repérage et fiabilisation des emplacements en réserve

> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les mesures et usages ci-dessous sont des données de scénario, pas des observations réelles ni des preuves de compétence de BC. Autorisé par BC uniquement comme copie publique de développement synthétique ; aucune diffusion aux recruteurs ni acceptation de faits professionnels réels.

## Objectif et contexte

Ce projet fictif s'inscrit dans une mission de régie des collections au Musée Démo des objets quotidiens, établissement inventé. Entre février et juin 2024, l'équipe devait fiabiliser la localisation de 600 objets peu fragiles répartis dans trois réserves. Les agents perdaient du temps lorsque le tableur indiquait seulement une salle, sans préciser le meuble ou l'étagère.

L'objectif était de rendre un emplacement suffisamment précis pour retrouver un objet sans dépendre de la mémoire d'un collègue. Il ne s'agissait ni de restaurer les objets, ni d'évaluer leur valeur, ni de réaliser un récolement réglementaire officiel. Le périmètre était un inventaire interne des emplacements.

## Ma contribution et le périmètre réalisé

J'ai conçu une nomenclature à trois niveaux : réserve, meuble et étagère. J'ai préparé les listes de vérification, les règles de saisie et un registre séparé pour les anomalies non résolues. J'ai également rapproché les relevés validés avec les lignes du tableur existant.

Les deux agents de collections ont participé aux vérifications physiques et aux confirmations d'emplacement. La conservatrice a arbitré les contradictions d'identité et autorisé la méthode. Je n'ai pas réalisé seul les vérifications des 600 objets et je n'ai pas attribué de nouveaux identifiants patrimoniaux.

Le travail décrit est terminé dans le scénario, à l'exception de 33 anomalies laissées explicitement ouvertes. Les objets fragiles et les autres collections du musée sont hors périmètre.

## Solution et choix importants

La nomenclature utilisait des codes lisibles sur place, par exemple « R2-M04-E03 » pour la réserve 2, le meuble 4 et l'étagère 3. Ces codes désignent des emplacements, pas l'identité des objets. L'identifiant documentaire de chaque objet restait inchangé lorsqu'il était déplacé.

Le tableur existant a été conservé comme outil de travail, avec des colonnes distinctes pour les trois niveaux et la date de vérification. Une localisation différente n'était enregistrée qu'après confirmation par deux membres de l'équipe. Une contradiction d'identité restait dans le registre d'anomalies jusqu'à arbitrage.

L'achat d'un logiciel spécialisé n'a pas été étudié dans ce scénario. Je ne présente donc pas le maintien du tableur comme le résultat d'une comparaison de marché. Le choix répondait au besoin limité de repérage et à la familiarité de l'équipe avec l'outil.

## État du projet et usages réels

Dans le récit fictif, la campagne a été clôturée en juin 2024 et le tableur corrigé a ensuite servi à préparer les mouvements d'objets jusqu'à la fin de la mission, en décembre 2024. Aucun usage après cette date n'est documenté.

Les 600 objets du périmètre ont une ligne de vérification. Le registre initial comportait 150 entrées d'anomalies ; 117 ont été résolues et 33 sont restées ouvertes. Plusieurs entrées pouvaient concerner un même objet ; le nombre d'objets distincts touchés n'est pas défini. On ne peut donc pas déduire que 150 objets, ni 25 % du périmètre, présentaient une anomalie. La clôture du projet ne signifie pas que tout l'inventaire du musée était exact ou complet.

## Résultats démontrés et limites

Pour fournir un cas chiffré aux tests, le scénario prévoit un exercice de recherche sur 24 objets : le temps médian passe de 12 minutes avant correction à 3 minutes après correction. Ces valeurs sont entièrement inventées. Dans le récit, l'exercice est réalisé par les mêmes agents sur le même échantillon ; il ne prouve donc pas un gain généralisable à toutes les réserves.

La baisse de 9 minutes de la médiane n'est pas une mesure du temps de travail total économisé. Les durées individuelles avant et après ne sont pas fournies : on ne peut pas calculer la médiane des gains individuels, ni affirmer que chaque objet est retrouvé 9 minutes plus vite. Aucun coût, retour sur investissement ou gain financier n'est établi. Les 33 anomalies restantes, les objets fragiles exclus et l'absence de suivi après décembre 2024 limitent la portée du résultat.

## Contraintes et retour d'expérience

Le travail a été découpé en lots courts pour rester compatible avec la préparation d'une exposition. Le principal enseignement du scénario est de séparer l'emplacement, qui peut être corrigé après observation, de l'identité de l'objet, qui nécessite un arbitrage différent.

La [fiche de mission](mission-regie-collections.md) précise les responsabilités et les limites de décision. Le [prototype de suivi des prêts](projet-prototype-prets.md) est une autre réalisation de la même mission, sans lien causal établi avec le temps de recherche des objets.
