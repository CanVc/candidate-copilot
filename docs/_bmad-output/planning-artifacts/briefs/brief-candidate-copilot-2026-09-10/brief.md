---
title: "Product Brief: Candidate Copilot"
status: final
created: 2026-09-10
updated: 2026-09-11
---

# Product Brief: Candidate Copilot

## Executive Summary

Candidate Copilot is BC's public, interactive proof-of-work portfolio. It gives recruiters a live product through which they can ask natural-language questions about BC's experience, projects, technical skills, working methods, and design decisions, then inspect the public documentary evidence behind each answer.

Building and operating the product demonstrates what BC can design and deliver, while its conversational interface lets recruiting teams explore the candidate beyond what fits in a CV or repository landing page. It is intended primarily for recruiters who encounter it around the middle or end of an interview process. It does not generate initial interest, replace an interview, assess fit, or persuade through unsupported claims. Recruiter demand for this interaction is not yet validated; Candidate Copilot is a product hypothesis and personal demonstration project, not a response to a proven market need.

## The Opportunity

Evidence about a candidate's work is commonly fragmented across a CV, repositories, project descriptions, design documents, and interview explanations. Recruiters have limited time to connect those materials, while static profiles compress the context, decisions, and proof that make experience understandable.

Candidate Copilot tests whether a documentary conversational interface can make that evidence easier to explore once the candidate has entered the interview process.

## Users and Context

The primary user is a recruiter or other member of a recruiting team who wants to explore BC's documented work more deeply.

BC is the product's author, subject, and operator. BC maintains the public knowledge base and may inspect retained conversations to identify documentary gaps and improve the product. Candidate Copilot is a personal product; support for other candidates, candidate accounts, generic onboarding, and multi-tenant operation are not part of its vision.

## The Product Experience

A recruiter visits a public site without creating an account. Before any interaction, the experience should make clear:

- what Candidate Copilot is and that BC created it;
- what kinds of questions it can answer;
- which experiences, projects, and capabilities may be worth exploring;
- why its answers are credible;
- how conversation data is handled.

The landing experience is more than an empty chat box. Candidate highlights, selected projects, and suggested questions provide light guidance, but they do not replace conversation as the exploration path. Meaningful exploration happens through natural-language conversation. The interaction itself should require no tutorial. Recruiters ask a question, receive a structured answer with inspectable citations, and may follow up or move to another topic. Candidate Copilot itself may be one of the documented projects that recruiters ask about.

## Product Principles

### Documentary evidence, not delegated representation

Candidate Copilot retrieves and synthesizes BC's public documentation. It does not represent BC, make decisions or commitments, or infer undocumented intentions on BC's behalf. Answers must be grounded in the public knowledge base and cite their sources. When source support is absent or insufficient, the product abstains rather than guessing. Judgments remain with the recruiter, while intentions and decisions remain with BC.

Accuracy, completeness, and traceability matter more than conversational persuasion. An exact and complete answer may be somewhat mechanical; the product does not need to generate a personalized evaluative summary.

### Public by construction

Only material explicitly designated as public may enter the deployed product. Private candidate material must not be deployed and then hidden through prompts or runtime filtering. Public Markdown remains the human-readable, version-controlled source of truth; search indexes are derived from it.

### Trust before novelty

The interface must feel professional, polished, and dependable before a recruiter sends a message. Session isolation, data-use disclosure, citations, strict abstention, and reliable availability are part of the product experience, not background implementation concerns.

### Simplicity before retrieval sophistication

The MVP should use the simplest retrieval approach that testing shows to be adequate: structured Markdown and section-level lexical search, with explicit grounding and abstention. Semantic or vector retrieval is justified only if evaluation reveals material coverage failures.

## MVP Scope

The MVP includes:

- a public, anonymous, recruiter-facing web experience;
- clear authorship, purpose, candidate highlights, and light question prompts;
- multi-turn natural-language questions about professional experience, projects, outcomes, technical skills, working methods, and documented design decisions;
- grounded answers with inspectable citations and explicit handling of partial or missing evidence;
- strict refusal of value judgments, undocumented intentions, commitments, and decisions on BC's behalf, with optional neutral redirection;
- a deployed runtime containing only the public candidate knowledge base;
- isolated visitor conversations, disclosure of retention and manual review, server-side deletion triggered by the user, and automatic deletion of raw and derived conversation data within 90 days;
- controlled operational access or secure manual export for BC to review retained conversations, without an administration interface.

The MVP excludes:

- motivation, desired role, offer fit, availability, or acceptance decisions;
- recruiter-specific personalization or inference from the visitor's source;
- private candidate content;
- personalized candidate assessment or evaluative summaries;
- an administration dashboard or automated conversation analysis;
- a reusable or multi-candidate platform;
- semantic or vector retrieval without evidence that simpler search is inadequate.

## Success Criteria

Candidate Copilot succeeds as a demonstration project when it is publicly deployed, functional, reliable, and polished enough to present professionally.

Its recruiter utility is validated when at least one recruiter conducts a genuinely exploratory conversation during a recruitment cycle. Meaningful exploration is evidenced by one or more of the following:

- questions spanning multiple topics;
- a question followed by a deeper follow-up;
- a question prompted by a candidate highlight or other presentation cue.

A single generic question without follow-up is only a weak signal: it demonstrates usability, not meaningful value. The product intentionally avoids volume or conversion targets because recruitment cycles vary too much in length and interview frequency for those comparisons to be reliable. Progression through the hiring process is not attributed to Candidate Copilot because the product is introduced too late to isolate that relationship credibly.

## Principal Risks

- **Answer integrity:** an invented, overstated, weakly supported, or evaluative answer could misrepresent BC and damage trust.
- **Confidentiality:** private candidate material, one visitor's conversation, or retained data could be exposed to an unauthorized party.
- **Professional credibility:** a superficial AI presentation could feel like a gimmick rather than evidence of thoughtful product execution.
- **Operational credibility:** latency, downtime, abuse, or uncontrolled cost could make the product unavailable when shown during recruitment.
- **Content currency:** an evolving but neglected knowledge base could produce answers that are grounded yet stale or incomplete.

## Open Questions and Deferred Detail

The PRD, UX work, privacy review, and architecture must define:

- the exact landing-page hierarchy, highlights, prompts, and trust disclosures;
- refusal language, evidence thresholds, and handling of partially answerable questions;
- evaluation cases for grounding, citation coverage, abstention, completeness, and adversarial prompts;
- anonymous session mechanics, access controls, auditability, deletion propagation, backups, and sensitive information entered by visitors;
- abuse prevention, rate and cost limits, response-time targets, and availability expectations;
- the boundary of public profile and contact information;
- the implementation stack and deployment architecture.

## Outlook

There is no committed post-MVP feature roadmap. BC's public documentation is expected to evolve and remain maintained, but further product capabilities will be chosen only in response to observed use. Automated monitoring or analysis of conversations, if pursued, is a separate project and not an implicit expansion of Candidate Copilot.
