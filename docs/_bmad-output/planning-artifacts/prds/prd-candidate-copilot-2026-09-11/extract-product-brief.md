---
title: "Extract: Product Brief Facts for Candidate Copilot PRD"
sources:
  - /home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md
  - /home/cvc/dev/candidate-copilot/docs/research/product-brief-candidate-copilot.md
created: 2026-09-11
---

# Extract: Product Brief Facts for Candidate Copilot PRD

## Sources

1. `docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md`
   - Status: final.
   - Created: 2026-09-10.
   - Updated: 2026-09-11.
   - Language: English.
2. `docs/research/product-brief-candidate-copilot.md`
   - Language: French.
   - Earlier/research-style product brief with recommended approach, content structures, MVP CLI, future modes, and roadmap.

## High-level product definition

- Product name: Candidate Copilot.
- Candidate Copilot is a public, interactive proof-of-work portfolio for BC.
- It lets recruiters ask natural-language questions about BC's experience, projects, technical skills, working methods, and design decisions.
- It answers from a prepared public knowledge base and exposes the documentary evidence behind each answer.
- It is a live product demonstrating what BC can design and deliver.
- It is not intended to replace BC in interviews, assess fit, generate initial interest, or persuade through unsupported claims.
- Recruiter demand is not yet validated; the product is a hypothesis and personal demonstration project, not a proven market response.

## Opportunity / problem facts

- Evidence about a candidate's work is fragmented across CVs, repositories, project descriptions, technical notes, screenshots, design documents, written exchanges, and oral interview explanations.
- Static profiles compress context, decisions, and proof.
- Recruiters have limited time to connect the materials.
- Declared skills are often not linked to concrete evidence.
- Technical projects can be difficult to understand quickly.
- Candidate Copilot tests whether a documentary conversational interface can make candidate evidence easier to explore once BC has entered an interview process.

## Users and operating context

### From the final brief

- Primary user: recruiter or recruiting-team member who wants to explore BC's documented work more deeply.
- Product timing: mainly middle or end of an interview process.
- BC is the product's author, subject, and operator.
- BC maintains the public knowledge base.
- BC may inspect retained conversations to identify documentary gaps and improve the product.
- Candidate Copilot is a personal product.
- Not part of the vision: support for other candidates, candidate accounts, generic onboarding, or multi-tenant operation.

### From the research brief

- Primary user was described as the candidate, using the tool to structure their background, prepare interviews, answer recruiters more clearly, analyze job offers, and identify gaps.
- Secondary users were recruiters, managers, CTOs, or technical leads exploring the candidate profile and preparing more targeted interviews.
- Use cases included before-interview preparation, live demo during interview, post-interview export/link, and job-offer analysis.

## Product experience facts

- A recruiter visits a public site without creating an account.
- Before interaction, the experience should explain:
  - what Candidate Copilot is;
  - that BC created it;
  - what kinds of questions it can answer;
  - which experiences, projects, and capabilities may be worth exploring;
  - why its answers are credible;
  - how conversation data is handled.
- The landing experience is more than an empty chat box.
- Candidate highlights, selected projects, and suggested questions provide light guidance.
- Conversation remains the main exploration path.
- The interaction should require no tutorial.
- Recruiters ask a question, receive a structured answer with inspectable citations, and can follow up or change topic.
- Candidate Copilot itself may be one of the documented projects recruiters ask about.

## Product principles

### Documentary evidence, not delegated representation

- Candidate Copilot retrieves and synthesizes BC's public documentation.
- It does not represent BC.
- It does not make decisions or commitments.
- It does not infer undocumented intentions on BC's behalf.
- Answers must be grounded in the public knowledge base and cite sources.
- If source support is absent or insufficient, the product abstains rather than guesses.
- Recruiter judgments remain with the recruiter.
- BC's intentions and decisions remain with BC.
- Accuracy, completeness, and traceability matter more than conversational persuasion.
- The product does not need to generate a personalized evaluative summary.

### Public by construction

- Only material explicitly designated public may enter the deployed product.
- Private candidate material must not be deployed and then hidden through prompts or runtime filtering.
- Public Markdown is the human-readable, version-controlled source of truth.
- Search indexes are derived from the public Markdown source.

### Trust before novelty

- The interface must feel professional, polished, and dependable before a recruiter sends a message.
- Session isolation, data-use disclosure, citations, strict abstention, and reliable availability are part of the product experience.

### Simplicity before retrieval sophistication

- MVP should use the simplest retrieval approach testing shows is adequate.
- Final brief names structured Markdown and section-level lexical search, with explicit grounding and abstention.
- Semantic or vector retrieval is justified only if evaluation reveals material coverage failures.
- Research brief similarly says not to start with classic/vector RAG and to prioritize a controlled Markdown base.

## MVP scope from final brief

### Included

- Public, anonymous, recruiter-facing web experience.
- Clear authorship, purpose, candidate highlights, and light question prompts.
- Multi-turn natural-language questions about:
  - professional experience;
  - projects;
  - outcomes;
  - technical skills;
  - working methods;
  - documented design decisions.
- Grounded answers with inspectable citations.
- Explicit handling of partial or missing evidence.
- Strict refusal of:
  - value judgments;
  - undocumented intentions;
  - commitments;
  - decisions on BC's behalf.
- Optional neutral redirection after refusal.
- Deployed runtime containing only the public candidate knowledge base.
- Isolated visitor conversations.
- Disclosure of retention and manual review.
- Server-side deletion triggered by the user.
- Automatic deletion of raw and derived conversation data within 90 days.
- Controlled operational access or secure manual export for BC to review retained conversations.
- No administration interface.

### Excluded

- Motivation, desired role, offer fit, availability, or acceptance decisions.
- Recruiter-specific personalization or inference from visitor source.
- Private candidate content.
- Personalized candidate assessment or evaluative summaries.
- Administration dashboard or automated conversation analysis.
- Reusable or multi-candidate platform.
- Semantic or vector retrieval without evidence that simpler search is inadequate.

## Research brief technical/content facts useful to PRD

- The knowledge base is treated as the product; AI is an interface over it.
- Initial approach: controlled Markdown base, versioned in Git.
- Benefits stated for Markdown: simple, readable, hand-editable, compatible with Obsidian/VS Code, versionable, easy to review, usable by an LLM without a complex pipeline.
- Earlier proposed flow:
  1. recruiter question;
  2. intent classification;
  3. select relevant Markdown files;
  4. generate answer only from those files;
  5. provide sourced answer and explicit limits if information is missing.
- Earlier proposed minimal content:
  - `profile.md`;
  - `target-roles.md`;
  - `skills.md`;
  - 3 project sheets;
  - 3 interview/story sheets;
  - `recruiter-faq.md`.
- Earlier proposed candidate knowledge areas included profile, target roles, skills, projects, stories, proof, job offers, and prompts.
- Earlier proposed response rules:
  1. answer only from the provided base;
  2. cite files used;
  3. do not invent experience;
  4. explicitly signal missing information;
  5. distinguish facts, interpretations, and recommendations;
  6. do not oversell the candidate;
  7. prepare answers the candidate can own orally;
  8. propose points to clarify when the profile is ambiguous.

## Success criteria and validation signals

- Demonstration-project success: publicly deployed, functional, reliable, and polished enough to present professionally.
- Recruiter utility is validated when at least one recruiter conducts a genuinely exploratory conversation during a recruitment cycle.
- Meaningful exploration is evidenced by one or more:
  - questions spanning multiple topics;
  - a question followed by a deeper follow-up;
  - a question prompted by a candidate highlight or other presentation cue.
- A single generic question without follow-up is a weak signal: it shows usability, not meaningful value.
- The product intentionally avoids volume or conversion targets due to variable recruitment cycles.
- Hiring-process progression is not attributed to Candidate Copilot because the product is introduced too late to isolate that relationship credibly.

## Principal risks

- Answer integrity: invented, overstated, weakly supported, or evaluative answers could misrepresent BC and damage trust.
- Confidentiality: private candidate material, one visitor's conversation, or retained data could be exposed to an unauthorized party.
- Professional credibility: a superficial AI presentation could feel like a gimmick rather than proof of thoughtful product execution.
- Operational credibility: latency, downtime, abuse, or uncontrolled cost could make the product unavailable when shown during recruitment.
- Content currency: an evolving but neglected knowledge base could produce answers that are grounded yet stale or incomplete.
- Research brief additionally highlighted over-engineering risk and the risk that recruiters think the candidate is hiding behind AI.

## Open questions and deferred detail from final brief

The PRD, UX work, privacy review, and architecture must define:

- Exact landing-page hierarchy, highlights, prompts, and trust disclosures.
- Refusal language, evidence thresholds, and handling of partially answerable questions.
- Evaluation cases for grounding, citation coverage, abstention, completeness, and adversarial prompts.
- Anonymous session mechanics, access controls, auditability, deletion propagation, backups, and sensitive information entered by visitors.
- Abuse prevention, rate and cost limits, response-time targets, and availability expectations.
- Boundary of public profile and contact information.
- Implementation stack and deployment architecture.

## Differences between the two briefs

- **Primary user**:
  - Final brief: recruiter/recruiting team is primary user.
  - Research brief: candidate is primary user; recruiters/managers/CTOs are secondary users.
- **MVP surface**:
  - Final brief: public anonymous recruiter-facing web experience is in MVP.
  - Research brief: says the MVP need not be technically ambitious and a local CLI command is sufficient initially; web UI appears as future Phase 5.
- **Scope of use cases**:
  - Final brief: focuses on recruiter exploration of public documented work during mid/late recruitment process.
  - Research brief: includes candidate interview preparation, live demo, post-interview export, and job-offer analysis.
- **Assessment/job fit**:
  - Final brief: excludes motivation, desired role, offer fit, availability, acceptance decisions, personalized assessment, and evaluative summaries.
  - Research brief: includes questions/use cases around candidate relevance for a role, work environment fit, job-offer match, weaknesses, risks, and recruiter summaries.
- **Roadmap**:
  - Final brief: no committed post-MVP roadmap; future capabilities depend on observed use.
  - Research brief: proposes phased roadmap through content base, local generation, automatic routing, job-offer analysis, and web interface.
- **Data/privacy detail**:
  - Final brief: explicit requirements for public-only deployed material, session isolation, retention disclosure, manual review disclosure, user-triggered server-side deletion, and deletion within 90 days.
  - Research brief: raises personal-data risk and recommends separating public/private material, but is less specific.
- **Retrieval approach**:
  - Final brief: structured Markdown and section-level lexical search; semantic/vector retrieval only if evaluation shows coverage failures.
  - Research brief: no vector RAG initially; suggests intent classification, file routing, manifest YAML, and LLM responses based on selected files.
- **Administration/operations**:
  - Final brief: no admin interface; only controlled operational access or secure manual export for BC.
  - Research brief: mentions history/export/future web modes but does not define admin constraints.
- **Product status**:
  - Final brief: frames Candidate Copilot as a product hypothesis with unvalidated recruiter demand.
  - Research brief: frames it as relevant if centered on proof and structure, with stronger emphasis on candidate preparation and differentiation.

## Likely PRD spine implied by the briefs

1. Purpose and positioning.
2. Problem/opportunity.
3. Target users and recruitment context.
4. Product principles.
5. MVP user experience.
6. Knowledge base and public-content boundaries.
7. Answer behavior, grounding, citations, abstention, and refusal policy.
8. Conversation/session privacy, retention, review, and deletion.
9. MVP scope and explicit exclusions.
10. Success criteria and validation signals.
11. Risks and mitigations.
12. Open questions for UX, privacy, evaluation, abuse/cost limits, availability, and architecture.
