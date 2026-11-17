---
document_id: "87ddaeda-8ee4-4056-9931-5ebf7b677875"
created_at: "2026-11-17T14:31:20Z"
modified_at: "2026-11-17T14:34:31Z"
title: "Fiction — Prototype de suivi des prêts d'objets"
reviewed_by: ""
reviewed_at: ""
---

# Fiction — Prototype de suivi des prêts d'objets

> **DOCUMENT SYNTHÉTIQUE POUR LES TESTS.** Tout le scénario est inventé et sans rapport avec BC. Le « je » désigne une personne fictive. Les démonstrations et résultats décrits sont fictifs, pas des tests réellement exécutés. Ce document n'est pas approuvé pour publication.

## Objectif et contexte

Dans ce scénario professionnel fictif, le Musée Démo des objets quotidiens préparait des prêts d'objets à d'autres établissements. Une même opération pouvait nécessiter une autorisation, un constat d'état, une préparation du transport et un suivi du retour. Le constat d'état est un relevé de l'état de conservation avant et après un mouvement ; ce n'est pas une autorisation de prêt.

De septembre à novembre 2024, j'ai exploré une présentation commune de ces étapes pour éviter qu'un statut vague, comme « en cours », masque les pièces encore manquantes. L'objectif était de tester la compréhension du parcours, pas de mettre en service un nouveau logiciel métier.

## Ma contribution et le périmètre réalisé

J'ai décrit les étapes avec la conservatrice et les deux agents de collections, puis réalisé des maquettes papier et un tableur de démonstration. J'ai préparé 12 dossiers de prêt entièrement inventés pour représenter des départs, des retours et des pièces manquantes.

La conservatrice a défini les décisions qui nécessitaient son autorisation. Les agents ont commenté la lisibilité des étapes pendant une démonstration interne du scénario. Ma contribution ne comprend ni l'autorisation des prêts, ni une application web, ni une intégration au tableur de référence.

Les relances automatiques, signatures électroniques et échanges avec d'autres établissements n'ont pas été réalisés. Ils ne sont pas présentés comme des fonctions disponibles.

## Solution et choix importants

Le prototype séparait les pièces du dossier et l'étape du mouvement. Un dossier pouvait ainsi afficher « transport à préparer » tout en signalant qu'une autorisation manquait. Un message de vigilance n'était pas assimilé à une validation de la conservatrice.

Les maquettes et le tableur permettaient de déplacer manuellement un dossier entre plusieurs situations et d'en discuter avec l'équipe. Ils n'empêchaient pas matériellement une saisie contradictoire. Aucun moteur de règles, contrôle d'accès ou historique infalsifiable n'a été développé.

Le prototype a volontairement précédé tout développement logiciel afin de vérifier le vocabulaire et la séparation des responsabilités. Aucune comparaison de fournisseurs ou décision d'achat n'est décrite.

## État du projet et usages réels

Le projet est resté un prototype de démonstration interne. Dans le scénario, une séance de lecture a eu lieu en novembre 2024 avec la conservatrice et les deux agents, sur les seuls 12 dossiers inventés. Aucun prêt réel n'a été géré dans le prototype et aucun service n'a été déployé.

L'exploration s'est arrêtée à la fin de la mission en décembre 2024, sans décision de mise en production. Le corpus ne décrit ni reprise ultérieure ni utilisation actuelle. Le prototype n'a pas remplacé le suivi existant.

## Résultats démontrés et limites

Le scénario prévoit un résultat qualitatif de la démonstration : la distinction entre « autorisation reçue » et « constat d'état disponible » est jugée plus lisible que l'ancien libellé unique « dossier prêt ». Il s'agit d'un retour fictif pendant une séance, pas d'une mesure réelle ni d'un audit de sécurité.

Les dossiers de démonstration couvrent un départ standard, une autorisation manquante et un retour complet. Le retour partiel et la modification d'un dossier par plusieurs personnes n'ont pas été évalués, même dans le scénario. La présentation ne permet donc pas de conclure à la fiabilité du processus en exploitation.

Aucun gain de temps, taux d'erreur, montant économisé ou taux d'adoption n'est établi pour ce projet. Les chiffres du [projet de repérage des réserves](projet-reperage-reserves.md) ne doivent pas lui être attribués.

## Contraintes et retour d'expérience

L'expérimentation devait rester compréhensible sans formation technique et ne pas mélanger les documents fictifs avec les dossiers de prêts utilisés par l'équipe. Le principal enseignement du récit est qu'une liste d'étapes peut aider à discuter du travail sans constituer un système de contrôle opérationnel.

La [fiche de mission](mission-regie-collections.md) présente le rôle de régie et les décisions réservées à la conservatrice. Le périmètre de ce prototype reste limité à la démonstration décrite, quelles que soient les responsabilités plus larges de la mission.
