# UX Discovery Extraction — Product Brief

Source: `/home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md`

## Target Users
- Primary user: recruiter or other recruiting-team member who wants to explore BC's documented work more deeply.
- Context: recruiters encounter the product around the middle or end of an interview process.
- BC is the product's author, subject, operator, and maintainer of the public knowledge base.

## Jobs-to-Be-Done
- Ask natural-language questions about BC's experience, projects, technical skills, working methods, and documented design decisions.
- Inspect the public documentary evidence behind each answer.
- Connect fragmented candidate evidence across CV, repositories, project descriptions, design documents, and interview explanations.
- Explore the candidate beyond what fits in a CV or repository landing page.
- Identify experiences, projects, and capabilities worth exploring via landing-page guidance and prompts.

## Outcomes / Success Signals
- Publicly deployed, functional, reliable, and polished enough to present professionally.
- At least one recruiter conducts a genuinely exploratory conversation during a recruitment cycle.
- Meaningful exploration may be evidenced by questions spanning multiple topics, a deeper follow-up, or a question prompted by a candidate highlight/presentation cue.
- A single generic question without follow-up is a weak usability signal, not meaningful value.

## Stated Product Surfaces / Features
- Public anonymous recruiter-facing web experience with no account creation.
- Landing experience that explains what Candidate Copilot is, that BC created it, supported question types, notable experiences/projects/capabilities, credibility rationale, and conversation data handling.
- Landing page includes candidate highlights, selected projects, and suggested questions as light guidance.
- Multi-turn natural-language conversation as the primary exploration path.
- Structured answers with inspectable citations.
- Explicit handling of partial or missing evidence.
- Strict refusal/abstention for unsupported claims, value judgments, undocumented intentions, commitments, and decisions on BC's behalf, with optional neutral redirection.
- Deployed runtime contains only the public candidate knowledge base.
- Isolated visitor conversations.
- Disclosure of retention and manual review.
- User-triggered server-side deletion.
- Automatic deletion of raw and derived conversation data within 90 days.
- Controlled operational access or secure manual export for BC to review retained conversations, without an administration interface.

## Tone / Brand Hints
- Public, interactive proof-of-work portfolio.
- Professional, polished, dependable, and credible before a recruiter sends a message.
- Trust before novelty.
- Accuracy, completeness, and traceability over conversational persuasion.
- Answers may be somewhat mechanical if exact and complete.
- Should not feel like a superficial AI gimmick.
- Interaction should require no tutorial.

## Constraints
- Only public material explicitly designated as public may enter the deployed product.
- Private candidate material must not be deployed and hidden via prompts/runtime filtering.
- Public Markdown is the human-readable, version-controlled source of truth; search indexes are derived from it.
- MVP should use simplest adequate retrieval: structured Markdown and section-level lexical search; semantic/vector retrieval only if evaluation reveals material coverage failures.
- Judgments remain with recruiter; intentions and decisions remain with BC.
- Product does not represent BC, make decisions/commitments, or infer undocumented intentions.
- No recruiter-specific personalization or inference from visitor source in MVP.
- No administration interface in MVP.

## Risks
- Answer integrity: invented, overstated, weakly supported, or evaluative answers could misrepresent BC and damage trust.
- Confidentiality: private material, another visitor's conversation, or retained data could be exposed.
- Professional credibility: superficial AI presentation could feel gimmicky rather than thoughtful.
- Operational credibility: latency, downtime, abuse, or uncontrolled cost could affect availability during recruitment.
- Content currency: neglected knowledge base could produce grounded but stale/incomplete answers.
- Recruiter demand is not validated; this is a product hypothesis/personal demonstration project.

## Explicit Non-Goals / Exclusions
- Does not generate initial interest, replace an interview, assess fit, or persuade through unsupported claims.
- Does not support other candidates, candidate accounts, generic onboarding, or multi-tenant operation.
- MVP excludes motivation, desired role, offer fit, availability, or acceptance decisions.
- MVP excludes private candidate content.
- MVP excludes personalized candidate assessment or evaluative summaries.
- MVP excludes an administration dashboard or automated conversation analysis.
- MVP excludes reusable or multi-candidate platform.
- MVP excludes semantic/vector retrieval unless simpler search proves inadequate.
- No committed post-MVP feature roadmap.

## Open Questions / Deferred Detail
- Exact landing-page hierarchy, highlights, prompts, and trust disclosures.
- Refusal language, evidence thresholds, and handling of partially answerable questions.
- Evaluation cases for grounding, citation coverage, abstention, completeness, and adversarial prompts.
- Anonymous session mechanics, access controls, auditability, deletion propagation, backups, and sensitive information entered by visitors.
- Abuse prevention, rate/cost limits, response-time targets, and availability expectations.
- Boundary of public profile and contact information.
- Implementation stack and deployment architecture.
