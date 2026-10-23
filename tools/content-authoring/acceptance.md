# État de livraison et d’acceptation

**23 octobre 2026 — ressources 1.0.2 ; Story 2.0 reste in-progress.**

Les ressources génériques sont construites. BC confirme avoir exercé les entretiens et la reprise fraîche, et accepte le traitement/consentement avec les limites divulguées. Des documents réels B existent ; les versions corrigées doivent être revalidées et le pilote A manque encore. La méthode n’est **pas encore acceptée**. L’historique de construction ci-dessous reste daté : ses mentions « aucun pilote réel » décrivent cette phase passée, pas l’état actuel. Le gate Builder de chemins produit toujours exactement deux high, acceptés par le parent comme exceptions de compatibilité Builder/Pi ; son résultat brut reste **fail**, pas un succès fabriqué. L’historique exécuté ci-dessous est conservé ; la vérification finale 1.0.1 précise les dispositions désormais acquises.

## Références de versions sûres

| Type | Agent | Template | Guide | Critères/applicabilité | Pilote réel / révision | Accords BC datés |
|---|---|---|---|---|---|---|
| A — contexte professionnel | 1.0.2 | 1.0.2 | 1.0.0 | 1.0.0 | En attente / — | Faits, compréhension, éligibilité : en attente |
| B — réalisation/projet | 1.0.2 | 1.0.2 | 1.0.0 | 1.0.0 | B-01 / 8 | Revalidation de la rendition corrigée en attente ; accords antérieurs archivés en privé |
| B — réalisation/projet | 1.0.2 | 1.0.2 | 1.0.0 | 1.0.0 | B-02 / 3 | Revues en attente ; heure de création inconnue, sans invention |

Le schéma checkpoint est 1 ; la version agent couvre les procédures d’authoring/revue/handling livrées. B-01/B-02 sont des références opaques attribuées au suivi du 23 octobre, pas des approbations inventées ; leur correspondance reste privée. Seules versions sûres, révisions et issues datées sont consignées ici. Aucun fait, correspondance, chemin ou hash de matériau privé ne doit entrer dans ce résumé.

## Historique de construction 1.0.1 — neuf scénarios de la Story 2.0

Ce tableau décrit les preuves manquantes au 22 octobre, pas une liste actuelle d’actions à refaire. Pour l’état courant, utiliser le suivi du 23 octobre en fin de fichier et les références de versions ci-dessus.

| Scénario source, dans l’ordre | Construction disponible | Ce qui manque encore comme preuve réelle |
|---|---|---|
| 1. Récit, investigation, pause et reprise fraîche | Boucle adaptative, ressources françaises, checkpoint ; aller-retour JSON/processus synthétique | Relances propres au récit et restauration en nouvelle session d’entretien BC sans contexte caché |
| 2. Agent réutilisable invocable | Une skill Pi explicit-only, définition/guides/templates ; loader Pi sans diagnostic | Exécution interactive avec BC ; loader ≠ entretien ou exécution de commande complète |
| 3. Types finis, distincts, complets | Contrats A/B C1–C5/R1–R6 approuvés en conception et matérialisés | Complétude passage-grounded sur vrais documents |
| 4. Formats, métadonnées, révisions | Deux formats versionnés ; sidecars privés ; identité stable, invalidation des accords | Revues et métadonnées réelles sur renditions finales |
| 5. Attribution, incertitude, compréhension | Guides et distinctions de statuts ; vérification littérale des citations synthétiques | Fidélité des contributions, compréhension autonome confirmée et correction utile par BC |
| 6. Entrées privées et traitement divulgué | Gate handling documenté, isolation Git/build jetable | Fournisseur/compte, contexte effectif, copies, rétention/suppression et consentement réels vérifiés |
| 7. Pilotes réels et cas exceptionnels | Tests de plomberie : lacune requise bloquante, omission motivée, citation absente/corrigée, B non-production | Un pilote véritable corrigé par type ; preuves de cas exceptionnels réels ou probes contrôlés séparés ; les tests ne les remplacent pas |
| 8. Acceptation sur versions finales | Liaison type/versions/révision/accords et procédure de revalidation | Raffinement après pilotes, revalidation des pilotes affectés, trois accords datés et acceptation BC |
| 9. Démonstration bornée | Outil indépendant de BMad à l’exécution, sans intégration app/index/hosted | Démonstration complète de la méthode avec BC ; corpus/catalogue/modèles/confidentialité/lancement restent ouverts |

Pour B, les contrôles de structure couvrent professionnel/personnel × maturités diverses × non-usage/usages déclarés sans couplage. La pause accepte un cadre encore inconnu sans invention. Cela ne prouve ni une réalisation personnelle de BC ni la pertinence sémantique des passages. L’absence honnête de production ne bloque pas à elle seule un projet ; aucun test/démo n’est présenté comme impact métier.

## Commandes exécutées et résultats

Depuis la racine du projet le 22 octobre 2026. Les fixtures de tous les probes sont temporaires, synthétiques et possédées par chaque test ; aucun matériau réel n’a été lu/créé/modifié. Le scaffolder officiel et l’initialisation memlog avaient été exécutés par le parent : **non réexécutés**. Journal de construction lu une fois puis enrichi uniquement par `memlog.py append` (API réelle init/append/set, pas set-complete). Customization headless = NO, sans surface ni resolver dans l’outil livré.

### Builder officiel et contrôles locaux

```sh
uv run _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-workflow-builder --project-root . --key workflow
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/quick_validate.py .pi/skills/content-authoring --allow-key disable-model-invocation
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-path-standards.py .pi/skills/content-authoring
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-scripts.py .pi/skills/content-authoring
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-scripts.py tools/content-authoring
python3 .agents/skills/bmad-workflow-builder/scripts/count_tokens.py .pi/skills/content-authoring/SKILL.md
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/content-authoring/scripts/tests -v
git diff --check
```

- Résolution : succès ; hooks/faits/standards/évals requis vides ; seuils SKILL 2000 souhaité / 3000 budget.
- `quick_validate` : **exit 0**, aucune erreur avec l’exception Pi explicitement autorisée.
- `scan-path-standards` : **exit 1, raw status fail**, exactement deux high : `.memlog.md` à la racine traité comme prompt, et `disable-model-invocation` rejeté comme clé inconnue. Le journal racine est imposé par le Builder et la tâche ; la clé est imposée pour l’invocation explicite Pi et prise en charge par sa documentation/loader. Aucune autre violation de chemin. On ne déplace pas le journal, ne retire pas la protection Pi et ne modifie pas le vendor pour obtenir un faux vert. **Disposition de ces incompatibilités de scanner à revoir par le parent ; gate Builder non annoncé comme clair.**
- `scan-scripts` sur la skill : **exit 0**, aucun script interne (le helper est à l’emplacement outillage approuvé). Sur l’outillage : **exit 0**, un helper Python, tests trouvés, zéro finding. **Limite : Ruff absent** (`uv run ruff --version` échoue à le trouver) ; le scanner annonce zéro sans prouver une passe de lint externe. Aucun Ruff/linteur installé pour contourner la limite. Tests Node/Python vérifiés séparément.
- Token count : **716, méthode fallback** chars/4, pas un compte exact tiktoken ; sous les deux seuils. Revue manuelle de leanness selon le canon : entrée limitée au rôle, gates non inférables et routage ; ressources de type chargées à la branche utile ; pas d’entretien scripté obligatoire. Pas de comparaison de modèles/variant eval ni de scan multi-agent complet autorisé ici.
- Unit tests finaux : **19/19 PASS**, y compris 12 combinaisons de cadre/maturité/usage, pause avec cadre inconnu, identité/date, séquence/révision, versions, accords périmés, confinement/liens, JSON sûr, sauvegarde atomique interrompue et restauration des corrections/décisions/questions. Une première passe comptait 17 tests, avant ajout des deux cas de pause/indépendance.
- Whitespace : `git diff --check` passe ; les fichiers neufs ont aussi un contrôle explicite des espaces finaux/fin de fichier : **22 fichiers PASS**, sans relire le memlog de construction. La vérification de diff source/configuration ci-dessous sort 0 (inchangés).

```sh
python3 - <<'PY'
from pathlib import Path
paths = sorted(p for p in Path('tools/content-authoring').rglob('*') if p.is_file())
paths += [Path(p) for p in ['.pi/skills/content-authoring/SKILL.md', 'scripts/check-build-isolation.mjs', 'tests/bootstrap/safety.test.ts', 'docs/_bmad-output/implementation-artifacts/spec-2-0-define-and-pilot-the-content-authoring-workflow.md']]
errors = []
for path in paths:
    text = path.read_text(encoding='utf-8')
    if not text.endswith('\n'):
        errors.append(f'{path}: missing final newline')
    for number, line in enumerate(text.splitlines(), 1):
        if line.rstrip() != line:
            errors.append(f'{path}:{number}: trailing whitespace')
assert not errors, errors
print(f'PASS: whitespace for {len(paths)} construction files (construction memlog not reread).')
PY
git diff --check
git diff --exit-code -- package.json package-lock.json .gitignore vite.config.ts wrangler.jsonc tsconfig.json tsconfig.frontend.json tsconfig.worker.json tsconfig.tooling.json src frontend
```

**Effet de tooling à signaler :** l’appel exploratoire `uv run .agents/skills/bmad-workflow-builder/scripts/count_tokens.py --help` a matérialisé **sept packages dans le cache isolé uv** déclaré par ce script installé. Il n’a modifié ni dépendances/lockfile de l’application, ni vendor, ni paramètres globaux ; néanmoins ce n’est pas une exécution sans acquisition de packages au sens strict. Aucun helper n’en dépend. Les comptes effectifs utilisent ensuite Python standard et son fallback, les scanners `UV_OFFLINE=1`. Cet écart à la limite « pas de nouveaux packages » est transmis au parent, pas dissimulé ni corrigé en supprimant un cache partagé.

### Sélection documentée du toolchain dans un sous-processus

La sélection fnm des instructions installées n’a changé ni shell parent ni défaut global. Commandes exactes :

```sh
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && node --version && npm --version && bash scripts/check-workstation.sh'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && node tools/content-authoring/scripts/tests/pi-entry.mjs /home/cvc/.local/share/fnm/node-versions/v24.15.0/installation/lib/node_modules/@earendil-works/pi-coding-agent'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && npm exec -- vitest run tests/bootstrap/safety.test.ts -t "publication boundaries"'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && npm exec -- vitest run tests/bootstrap/safety.test.ts && node scripts/check-build-isolation.mjs'
bash --noprofile --norc -c 'export PATH="$HOME/.local/share/fnm:$PATH"; FNM_ENV=$(fnm env --shell bash) && eval "$FNM_ENV" && fnm use "$(cat .node-version)" && hash -r && node --check scripts/check-build-isolation.mjs && node --check tools/content-authoring/scripts/tests/pi-entry.mjs && npm run typecheck'
```

Résultats **exit 0** :

- Ubuntu 24.04.5 LTS/Git 2.43.0 ; Node **24.22.0**, npm **11.19.1**, gate workstation PASS.
- Probe sur Pi installé **1.3.0** : une skill chargée dans un projet synthétique, zéro diagnostic, `disableModelInvocation === true`, absente du prompt de découverte automatique ; ressources génériques routées présentes. Aucune session, prompt, auth ou requête modèle créée. Cela ne prouve pas l’exécution interactive de `/skill:content-authoring` ni le comportement d’un modèle.
- Sélection publication boundaries : **8 PASS, 7 skipped**. Puis fichier safety complet : **15/15 PASS** ; aucune omission dans cette seconde passe. Le contrôle de terminal existant garde ses builds PTY et huit contrôles synthétiques.
- Isolation standalone : frontend et Worker excluent **33 canaris jetables**, brut/base64, indépendamment de Git. La fixture crée elle-même les faux chemins skill/outillage/état et ne copie jamais un arbre réel de contenu. Les instructions génériques sont intentionnellement versionnables, pas gitignorées ; seules les préparations privées doivent être ignorées. L’exclusion build est indépendante.
- Syntaxe Node et quatre configurations TypeScript : PASS. Aucun changement d’application/dépendances/configuration requis. Pas de test complet du produit, browser, modèle ou hosted.

Le skill Wrangler disponible a été lu avant les checks qui utilisent les commandes de build existantes. Les builds sont exclusivement des copies jetables, avec Worker `deploy --dry-run`, CI/metrics/env-file protégés et HOME/XDG/cache npm/Wrangler temporaires. Aucun upload/déploiement, login ou accès à un compte n’a été demandé.

## Historique du 22 octobre — gates alors ouverts

Cette liste historique ne révoque ni la confirmation BC des entretiens/reprise ni son acceptation ultérieure du traitement/consentement. Les points encore ouverts sont distingués dans le suivi du 23 octobre.

- Route fournisseur/modèle/compte et traitement effectifs, contexte automatique, copies, rétention et suppression vérifiés ; sélection et consentement BC avant toute entrée non publique. La procédure locale spécifique n’a pas été exercée sur une session réelle.
- Un vrai pilote BC corrigé par type, relances adaptées au récit, reprise en session fraîche, preuve de fidélité/compréhension et trois accords datés sur révisions finales. Probes exceptionnels/branche non-production à démontrer séparément s’ils ne surviennent pas naturellement.
- Revalidation des futurs pilotes affectés après refinements et acceptation de méthode par BC ; audit humain des décisions de construction. Aucun pilote réel n’existe à migrer/réapprouver. Les deux exceptions scanner sont dispositionnées ci-dessous ; l’écart de cache uv reste divulgué, sans dépendance projet.
- Story 2.1 : couverture corpus, revue/sécurité source publique et copie explicitement approuvée. Story 3.1 : Resource/maps. Tous gates modèle/retrieval/confidentialité/lancement restent séparés.

Aucun entretien/pilote réel, accès aux dossiers de carrière voisins, appel provider/eval, publication, commit ou push. Les tests de structure ne prouvent ni authenticité d’un accord, ni fidélité réelle, ni compréhension humaine, ni acceptation de la méthode.

## Vérification finale du fix pass accepté — 1.0.1, 22 octobre 2026

Historique 1.0.0 ci-dessus conservé, y compris ses mentions de disposition alors en attente. **Disposition parent désormais acquise :** les deux high du scanner sont des exceptions de compatibilité acceptées (journal racine imposé par Builder ; clé Pi supportée imposant l’invocation explicite). Le résultat officiel demeure **exit 1 / raw fail, exactement deux high**. Journal, flag et vendor restent intacts. Les sept packages de l’ancien `count_tokens.py --help` sont un écart de processus divulgué dans un cache uv isolé, pas une dépendance projet ; aucun cache partagé supprimé, aucune acquisition pendant ce fix pass. Ruff reste indisponible, sans prétention de lint externe.

Correctifs : snapshot privé nouvellement ajouté dès retrait/remplacement d’un accord existant, même à révision constante ; complétion d’un accord absent sans fausse exigence d’archive. `draft` devient un champ explicite nullable ; un ancien précédent absent-as-null se répare sans perte d’identité/historique, sans contourner les règles de versions/révisions. Intake et sérialisation rejettent les nombres non finis, avec diagnostics JSON sûrs et préservation du checkpoint précédent. Les instructions retirent aussi les trois mentions frontmatter d’approbation lors d’une réécriture/retrait ; la préparation en deux passes reste privée/provisoire jusqu’aux accords sur les octets finaux exacts. Aucun fichier réel réécrit/publié. Agent/release et templates A/B : **1.0.1** ; guides/critères inchangés **1.0.0**, schéma **1**, deux squelettes synchronisés. Aucun pilote réel à migrer/réapprouver.

Commandes du fix pass (Python standard ou uv hors ligne uniquement) :

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/content-authoring/scripts/tests -v
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/quick_validate.py .pi/skills/content-authoring --allow-key disable-model-invocation
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-path-standards.py .pi/skills/content-authoring
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-scripts.py .pi/skills/content-authoring
UV_OFFLINE=1 uv run .agents/skills/bmad-workflow-builder/scripts/scan-scripts.py tools/content-authoring
python3 .agents/skills/bmad-workflow-builder/scripts/count_tokens.py .pi/skills/content-authoring/SKILL.md
python3 tools/content-authoring/scripts/checkpoint.py --help
UV_OFFLINE=1 uv run ruff --version
git diff --check
git diff --exit-code -- package.json package-lock.json .gitignore vite.config.ts wrangler.jsonc tsconfig.json tsconfig.frontend.json tsconfig.worker.json tsconfig.tooling.json src frontend
```

Résultats finaux : **31/31 tests PASS** (12 nouvelles régressions depuis 19), dont transitions/save handling/sources/remplacement, absence puis réparation de `draft`, archives append-only, finalisation/réapprobation des octets, cinq formes non finies à l’intake et garde indépendante de sérialisation/diagnostics. `quick_validate` **0**, path scan **1 / deux high acceptés**, deux script scans **0** (0 script interne, 1 helper externe, 0 finding), tokens **716 fallback chars/4** sous 2000/3000, aide helper **0**, probe Ruff **2 indisponible**. Contrôles Python standard supplémentaires : AST **2 fichiers**, JSON **3 fichiers**, whitespace **19 fichiers** d’outillage/spec sans relire le memlog ; `git diff --check` et diff source/configuration ci-dessus **0**. Aucun JavaScript modifié : checks Node/Pi/app antérieurs conservés comme historique, non réexécutés ici.

Le probe de finalisation simule explicitement l’édition de frontmatter en fixture temporaire : preuve de liaison structurelle aux octets, **pas d’exécution d’instructions par un modèle**. Le helper ne contrôle ni ne retire le frontmatter et n’authentifie pas les accords. Restent ouverts : handling réel/fournisseur/consentement, pilotes BC véritables A et B avec reprise fraîche et revues datées, preuves exceptionnelles et acceptation humaine de méthode. Story 2.0 reste **in-progress** ; aucun appel modèle/provider/eval, matériau privé réel, publication ou fermeture de gate.

## Contre-vérification du parent — 22 octobre 2026

Après lecture des correctifs et des ressources livrées, le parent a réexécuté indépendamment les **31 tests Python**, le probe de chargement Pi, le fichier safety complet (**15/15**), l’isolation standalone (**33 canaris exclus des deux builds**) et les quatre configurations TypeScript : succès, avec Node **24.22.0** / npm **11.19.1** dans un sous-processus. `quick_validate` avec l’exception Pi passe ; le scanner de scripts retourne zéro finding, sans prétendre remplacer Ruff absent. Le comptage reste **716 tokens estimés**, méthode fallback.

Le parent a également vérifié que le résultat brut du scanner de chemins contient **exactement** les deux exceptions acceptées, sans finding supplémentaire. Ce résultat reste `fail` dans l’historique officiel. **524 fichiers préexistants protégés** sont inchangés depuis le début de la construction ; versions/squelettes cohérents, whitespace propre, HEAD inchangé et aucun fichier staged. Aucun matériau privé réel ni pilote n’a été traité. Ces contrôles valident la construction et sa plomberie, pas la fidélité ou le comportement d’un modèle. La prochaine étape était alors le préflight réel de traitement/consentement, puis les pilotes séparément autorisés.

## Suivi propriétaire et frontmatter — 23 octobre 2026, version 1.0.2

BC confirme les entretiens investigatifs et la reprise fraîche et accepte le traitement/consentement. Les limites techniques de rétention/suppression/copies antérieurement divulguées ne deviennent pas vérifiées par cet accord ; les exceptions consenties restent bornées aux matériaux sélectionnés. Aucun nouvel audit fournisseur ou effacement n’est revendiqué.

L’examen des traces privées soutient déjà les cas **omission justifiée** et **correction après lacune de compréhension**. Aucun checkpoint inspecté ne démontre le blocage explicite de préparation pour une information requise indisponible ; cette preuve reste à établir. Les documents B ne démontrent pas non plus la branche personnelle/non-production : probe distinct possible, pas de troisième pilote réel imposé. Le pilote A reste absent.

Les templates 1.0.2 portent dès le brouillon `document_id`, `created_at`, `modified_at`, `title`, `reviewed_by: ""` et `reviewed_at: ""`. Les dates connues sont en UTC avec heure, secondes et `Z`. Aucune heure historique inconnue n’est inventée ; une ancienne date seule reste explicitement lacunaire et privée jusqu’à preuve suffisante. `content/AGENTS.md` rappelle la règle hors corpus public. Les deux documents courants conservent leur récit ; les archives sont préservées. Le changement de métadonnées/versions invalide les revues des nouveaux octets, sans effacer les anciennes attestations.

Vérification locale 1.0.2 : `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools/content-authoring/scripts/tests -v` : **34/34 PASS** (31 tests existants et trois tests de contrat générique). Les tests couvrent notamment les placeholders, l’unicité des clés de template, les versions agent/procédures/templates et les squelettes de dates documentaires. Les deux sauvegardes et validations de checkpoints courants avec précédents privés passent ; contrôle direct des corps inchangés, identité/instant de création, lacune horaire conservée, historique et références/digests : PASS. Des cas UTC franchissant la limite de jour sont vérifiés localement. Les archives/fichiers antérieurs non concernés sont inchangés au contrôle d’intégrité, sans interprétation des sources. `git diff --check`, whitespace des fichiers neufs, exclusion Git du sous-arbre privé et recherche de marqueurs privés sélectionnés dans les changements génériques : PASS ; pas de certification exhaustive de confidentialité.

Ces validations ne sont ni un nouvel entretien, ni un audit fournisseur, ni une preuve d’ingestion/build applicatif, ni une publication ou clôture de story. L’éligibilité publique, les revues finales et l’acceptation de méthode restent ouvertes. Avant promotion 2.1, clarifier avec BC l’événement exact représenté par le `reviewed_at` public dans la procédure de revue en deux passes ; les champs des brouillons restent vides jusque-là, sans date de revue inventée.
