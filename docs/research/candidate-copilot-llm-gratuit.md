# LLM gratuit pour Candidate Copilot

Pour une application publique comme Candidate Copilot, il ne faut pas utiliser les quotas inclus dans des abonnements personnels de type ChatGPT/Codex ou Z.ai Coding Plan comme backend.

Ces abonnements sont prévus pour un usage interactif personnel dans leurs outils respectifs, pas pour servir des utilisateurs externes via une application publique.

En revanche, il existe plusieurs vraies API avec un niveau gratuit.

## Options intéressantes

### 1. Cloudflare Workers AI

Probablement le meilleur choix si l’application est déjà hébergée sur Cloudflare.

Cloudflare fournit un quota gratuit quotidien pour Workers AI.

Architecture possible :

```text
Cloudflare Pages
      │
      ▼
Cloudflare Worker
      │
      ├── D1 / recherche FTS
      │
      └── Workers AI
```

Avantages :

- pas de serveur à maintenir ;
- pas de fournisseur supplémentaire ;
- quota gratuit suffisant pour un petit site de démonstration ;
- plusieurs modèles disponibles, par exemple GLM, Gemma, Qwen ou GPT-OSS selon l’offre du moment.

Pour Candidate Copilot, quelques centaines de réponses par jour peuvent théoriquement rentrer dans le quota gratuit avec un modèle économique.

---

### 2. GroqCloud Free

Groq propose également une vraie API gratuite prévue pour être intégrée dans des applications.

Modèles intéressants :

- GPT-OSS 120B ;
- GPT-OSS 20B ;
- Qwen 27B, selon disponibilité.

Les limites gratuites actuelles sont largement suffisantes pour un projet à faible trafic.

Le principal plafond est généralement le nombre de tokens par jour plutôt que le nombre de requêtes.

Pour un bot destiné à quelques recruteurs, cela peut déjà représenter plusieurs dizaines de conversations quotidiennes.

---

### 3. OpenRouter Free

OpenRouter donne accès à plusieurs modèles gratuits.

Il existe notamment un routeur :

```text
openrouter/free
```

Sans achat de crédits, le quota gratuit est relativement limité, mais probablement encore suffisant pour une démonstration à faible trafic.

L’inconvénient est que les modèles gratuits disponibles et leur capacité peuvent changer régulièrement.

Je le verrais plutôt comme solution secondaire ou fallback.

---

## Gemini

Gemini possède également un free tier API.

Cependant, les conditions applicables dans l’Espace économique européen imposent des contraintes particulières pour les applications mises à disposition d’utilisateurs externes.

Pour un projet public hébergé depuis la France, je ne le choisirais donc pas comme solution gratuite principale.

---

# Recommandation

Je testerais en priorité :

```text
Candidate Copilot
      │
      ▼
Cloudflare Pages
      │
      ▼
Cloudflare Worker
      │
      ├── D1 / SQLite / FTS
      │
      └── Workers AI
             │
             ▼
       GLM / Qwen / GPT-OSS
```

Puis je comparerais avec :

```text
Cloudflare Worker
      │
      ▼
GroqCloud Free
      │
      ▼
GPT-OSS 120B / Qwen
```

L’objectif n’est pas nécessairement d’utiliser le modèle le plus puissant.

Le moteur de recherche fournit déjà au LLM les passages pertinents de la base de connaissances.

Le rôle du modèle est principalement de transformer ces informations en une réponse claire et fidèle, par exemple :

```text
Question :
"Quelle expérience avez-vous avec Oracle ?"

Contexte fourni au LLM :
- expérience Oracle depuis plusieurs années ;
- PL/SQL ;
- Forms / Reports ;
- migrations ;
- optimisation SQL ;
- etc.

Instruction :
Répondre uniquement à partir des informations fournies,
sans inventer d’expérience supplémentaire.
```

Un modèle relativement léger peut donc être largement suffisant.

## Conclusion

Les abonnements personnels OpenAI et Z.ai ne sont pas adaptés comme backend d’une application publique.

Mais il n’est pas nécessaire de payer immédiatement une API LLM.

Les options gratuites les plus intéressantes à tester sont :

1. **Cloudflare Workers AI**
2. **GroqCloud Free**
3. **OpenRouter Free**

Pour Candidate Copilot, **Cloudflare Workers AI semble actuellement être le choix le plus cohérent**, surtout si le reste de l’application utilise déjà Cloudflare Pages, Workers et D1.
