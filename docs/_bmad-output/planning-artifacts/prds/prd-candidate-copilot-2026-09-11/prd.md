---
title: Candidate Copilot PRD
status: final
created: 2026-09-11
updated: 2026-09-11
---

# PRD: Candidate Copilot

## 0. Document Purpose

This PRD defines the first public version of Candidate Copilot: a simple, recruiter-facing, evidence-backed conversational portfolio for BC. It is intended for BC and downstream planning workflows such as UX, architecture, epics, stories, and implementation. Requirements are grouped by feature with stable Functional Requirement IDs. The authoritative input is `docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md`.

## 1. Vision

Candidate Copilot is BC's public, interactive proof-of-work portfolio. It lets recruiters ask natural-language questions about BC's documented experience, projects, technical skills, working methods, and design decisions, then receive grounded answers with inspectable Source Excerpts.

The product is not meant to be flashy, persuasive, or artificially impressive. It succeeds if it feels like a finished, functional, secure, and reliable professional artifact: recruiters can ask expected recruiting questions, receive useful answers, inspect supporting evidence, and understand the boundaries of what the system will and will not say.

Candidate Copilot is a personal product and a product hypothesis. Recruiter demand is not yet validated. The V1 goal is to build the simplest public product that satisfies the documented need, avoids overengineering, and costs zero euros.

## 2. Target User

### 2.1 Primary User

The primary user is a recruiter or recruiting-team member who has received access to Candidate Copilot during a mid- or late-stage recruitment process and wants to explore BC's documented work more deeply than a static CV allows.

BC is the product's author, subject, and operator. BC maintains the Public Knowledge Base and may inspect retained conversations primarily to understand what recruiters ask, and secondarily to identify documentation gaps, misuse, bugs, or answer-quality problems.

### 2.2 Jobs To Be Done

- Explore BC's documented projects, experience, technical skills, working methods, outcomes, and design decisions.
- Ask follow-up questions without needing to navigate a large static portfolio.
- Inspect the evidence behind an answer rather than trusting an unsupported AI statement.
- Understand when the system cannot answer because information is private, unavailable, insufficiently documented, or outside a professional recruiting context.

### 2.3 Non-Users for V1

- Other candidates who want to create their own copilot.
- Recruiters expecting an automated hiring recommendation or fit score.
- Visitors looking for personal, sensitive, or non-professional information about BC.
- BC as a daily dashboard user; V1 may provide controlled manual access to retained conversations, but not an admin product.

### 2.4 Key User Journeys

- **UJ-1. A recruiter explores BC's work from a shared link.** A Recruiter opens the app from a shared, unlisted link without creating an account. They see a minimal French landing page explaining that Candidate Copilot was created by BC, that it answers from the Public Knowledge Base, that Conversations may be retained for up to 90 days, and that answers include Source Excerpts. They see two to three selected projects and example question guidelines, then ask freely about a project or skill. The system answers in the language of the question, includes Source Excerpts, and leaves the Recruiter able to form their own view.

- **UJ-2. A Recruiter asks for a judgment and is redirected to evidence.** A Recruiter asks, "Is BC good at software architecture?" The system explains that it cannot make a value judgment, then offers documented examples of architectural work, decisions, and outcomes that may help the Recruiter form their own view.

- **UJ-3. A Recruiter asks an inappropriate personal question.** A Recruiter asks about religion, sexuality, health, politics, family situation, or another personal/sensitive topic unrelated to professional documented work. The system refuses calmly, states that the Conversation must remain in a professional context, and offers to answer questions about documented projects, skills, working methods, or decisions instead.

- **UJ-4. A Visitor requests deletion of Conversation history.** A Visitor opens the app privacy/deletion control from the Conversation interface. The app submits a Deletion Request associated with the Conversation UUID. The Visitor understands that Conversations are retained for at most 90 days and that Deletion Requests are handled manually by BC.

## 3. Glossary

- **Candidate Copilot** — The public, recruiter-facing conversational portfolio for BC.
- **BC** — The author, subject, and operator of Candidate Copilot.
- **Recruiter** — Any recruiting-team member using Candidate Copilot to explore BC's documented professional work.
- **Visitor** — Any anonymous person using Candidate Copilot. In expected use this is a Recruiter, but privacy and deletion controls apply to any Visitor.
- **Public Knowledge Base** — The explicitly public, BC-maintained source material from which Candidate Copilot may answer.
- **Source Excerpt** — A visible quoted or summarized snippet from the Public Knowledge Base used to support an answer.
- **Conversation** — A single Visitor interaction thread with Candidate Copilot.
- **Conversation UUID** — The identifier associated with a Conversation and used for Deletion Requests and diagnostics.
- **Deletion Request** — A request submitted from the app asking BC to delete the Conversation history associated with a Conversation UUID.
- **Out-of-Scope Question** — A question Candidate Copilot must not answer directly because it asks for a value judgment, undocumented/private information, commitments or intentions on BC's behalf, or personal/sensitive information outside a professional context.
- **V1** — The first public deployed version that BC can show to recruiters in real recruitment contexts.

## 4. Features

### 4.1 Minimal Public Landing Experience

**Description:** The landing experience presents Candidate Copilot as a finished, trustworthy, simple public product. It is more than an empty chat box, but it must not over-direct the Recruiter or imply a narrow target role. The UI is French-only in V1.

**Functional Requirements:**

#### FR-1: Explain the product simply

The landing page must explain that Candidate Copilot is an interactive portfolio created by BC and that it answers from public documentation.

**Acceptance / Planning Notes:**
- A first-time Visitor can understand the product purpose before submitting a question.
- The landing page does not present Candidate Copilot as an autonomous representative of BC.

#### FR-2: Provide light guidance without constraining questions

The landing page must provide example questions, guidelines, and lightweight documented capability cues while making clear that the Recruiter may ask freely within the professional scope.

**Acceptance / Planning Notes:**
- Example questions help the Recruiter start.
- Capability cues suggest areas worth exploring without implying a target role or job type.
- The UI does not force the Recruiter into fixed categories or a rigid guided flow.

#### FR-3: Show selected projects before conversation

The landing page must display two to three documented projects selected by BC before launch, with short factual highlights that help a Recruiter choose what to ask about.

**Acceptance / Planning Notes:**
- Project selection remains an open launch task until BC chooses them.
- Project highlights stay factual and evidence-oriented.
- The landing page must not state a targeted role or targeted job type.

#### FR-4: Avoid contact or recruiting-channel UI

V1 must not include a contact CTA, contact button, public BC contact details, or a message instructing recruiters to continue via another channel.

**Acceptance / Planning Notes:**
- Recruiters use the recruiting channel through which they received the link.
- The product avoids awkward or unnecessary contact affordances.

### 4.2 Recruiter Conversation

**Description:** The Recruiter asks natural-language questions and receives structured answers. Conversation is the main exploration path. No account or tutorial is required.

**Functional Requirements:**

#### FR-5: Allow anonymous public conversation

A Recruiter can start a Conversation from the web app through a shared, unlisted link without creating an account.

**Acceptance / Planning Notes:**
- No recruiter login, onboarding, or account management is required for V1.
- The app should not be broadly discoverable through normal public indexing.
- Conversations are isolated from each other.

#### FR-6: Support multi-turn questions

Candidate Copilot must support follow-up questions within a Conversation about BC's documented experience, projects, outcomes, technical skills, working methods, and design decisions.

**Acceptance / Planning Notes:**
- The Recruiter can ask a broad question, then refine or change topic.
- The product remains focused on documented professional material.

#### FR-7: Answer in the language of the question

Candidate Copilot must answer in the language used by the Recruiter’s question, where practical.

**Acceptance / Planning Notes:**
- If a Recruiter asks in French, the answer is in French.
- If a Recruiter asks in English, the answer is in English.
- Source Excerpts remain in their original document language, expected to be French in V1.

#### FR-8: Show working status during generation

The UI must show a clear progress or working message while Candidate Copilot retrieves and synthesizes an answer.

**Acceptance / Planning Notes:**
- The Recruiter can tell the app is working during normal multi-second LLM latency.
- Longer answers that take up to roughly 30 seconds do not appear as a frozen UI.

### 4.3 Grounded Answers and Evidence

**Description:** Candidate Copilot answers only from the Public Knowledge Base. Accuracy, completeness, and traceability matter more than persuasion.

**Functional Requirements:**

#### FR-9: Use only public Markdown source material

Candidate Copilot must answer only from the deployed Public Knowledge Base. The Public Knowledge Base must be maintained as human-readable, version-controlled public Markdown, with any runtime search or index artifacts derived from that source.

**Acceptance / Planning Notes:**
- Private material must not be deployed and hidden through prompts or runtime filtering.
- If BC knows something that is not in the Public Knowledge Base, Candidate Copilot must not invent it.
- Runtime retrieval artifacts cannot become a separate opaque source of truth.

#### FR-10: Include inspectable Source Excerpts

Candidate Copilot answers must include Source Excerpts sufficient for the Recruiter to inspect why the answer was produced. Answers should be structured enough to distinguish supported claims, partial evidence, and missing information.

**Acceptance / Planning Notes:**
- V1 may show excerpts/snippets in the response rather than full public source pages.
- Full source cards or full document views are out of scope for V1.
- Representative launch tests verify that answers are not merely cited, but sufficiently complete for the question asked.

#### FR-11: Handle partial or missing evidence explicitly

When support is absent, weak, or partial, Candidate Copilot must say so rather than guessing.

**Acceptance / Planning Notes:**
- Unsupported claims are not presented as facts.
- Partial answers distinguish what is supported from what is unavailable.

### 4.4 Refusals and Professional Boundaries

**Description:** Candidate Copilot keeps the conversation in a professional, documented recruiting context. It does not make judgments, commitments, or personal disclosures.

**Functional Requirements:**

#### FR-12: Refuse value judgments and redirect to evidence

When asked for a value judgment, Candidate Copilot must state that it cannot judge BC and then redirect to documented examples relevant to the topic.

**Acceptance / Planning Notes:**
- For "Is BC good at architecture?", the system does not answer yes/no.
- The system may provide examples of architectural work, decisions, and outcomes.

#### FR-13: Refuse commitments, intentions, and decisions on BC's behalf

Candidate Copilot must not answer as if it represents BC's current intentions, commitments, availability, desired role, compensation expectations, offer acceptance, or hiring decisions.

**Acceptance / Planning Notes:**
- The system does not negotiate, promise, accept, decline, or infer BC's intentions.
- Where useful, it may redirect to documented professional facts.

#### FR-14: Refuse non-professional personal or sensitive topics

Candidate Copilot must refuse questions about religion, sexuality, health, politics, family situation, origin, protected characteristics, or other sensitive personal subjects that are not legitimate professional documented topics.

**Acceptance / Planning Notes:**
- The refusal is calm and professional.
- The system offers to answer about documented projects, skills, working methods, or decisions instead.

#### FR-15: Resist prompt-injection and rule-bypass attempts

Candidate Copilot must not comply with requests to ignore its boundaries, reveal hidden instructions, fabricate evidence, expose private data, or answer outside the Public Knowledge Base.

**Acceptance / Planning Notes:**
- Adversarial prompts are handled safely.
- The system preserves grounding and refusal rules even when challenged.

### 4.5 Conversation Privacy, Retention, and Deletion Requests

**Description:** Candidate Copilot is public and anonymous, but Conversations may be retained so BC can diagnose failures, understand misuse, and improve documentation. The UX must disclose this clearly and provide a deletion-request mechanism without exposing BC's contact details.

**Functional Requirements:**

#### FR-16: Disclose conversation retention, review, and processing

The app must tell Visitors that Conversation data may be stored and manually reviewed by BC, that retained Conversation data is deleted within 90 days, and that questions may be processed through the AI/provider processing path chosen during implementation.

**Acceptance / Planning Notes:**
- The disclosure is visible before or during use, not hidden in a long policy only.
- Visitors understand the 90-day maximum retention window.
- Before launch, the privacy copy must reflect the real storage and AI/provider processing path.
- The app must not intentionally include private source material, secrets, unnecessary Visitor identifiers, or unrelated personal data in model prompts.

#### FR-17: Associate conversations with a visible UUID

Each Conversation must have a Conversation UUID used for diagnostics, Deletion Requests, and Visitor support references. The Conversation UUID must be visible from the interface.

**Acceptance / Planning Notes:**
- BC can identify the Conversation associated with a Deletion Request or support reference.
- Visitors can reference their current Conversation without needing BC contact details.
- The UUID does not expose BC contact details or Visitor identity by itself.

#### FR-18: Start a new Conversation for returning Visitors

V1 must start a new Conversation with a new Conversation UUID when a Visitor returns in a new visit/session.

**Acceptance / Planning Notes:**
- V1 does not restore previous Conversation history for returning Visitors.
- If the current browser tab/session remains open, the current Conversation may remain visible.
- The product avoids account-like tracking or identity linkage in V1.

#### FR-19: Provide in-app Deletion Request submission

The app must allow the Visitor to submit a Deletion Request from the interface for the current Conversation UUID.

**Acceptance / Planning Notes:**
- Deletion requests are handled manually by BC.
- A Deletion Request must be persisted with the Conversation UUID and request timestamp.
- Deletion Requests must be visible to BC through the same controlled access/export path used for retained Conversations.
- BC must define a manual review cadence before public recruiter use.
- UI confirmation must honestly state that deletion is manual and not immediate.
- V1 does not require immediate automatic user-triggered deletion.
- V1 does not require outbound email.

#### FR-20: Automatically delete conversation data within 90 days

Raw and derived Conversation data retained by the system must be deleted within 90 days.

**Acceptance / Planning Notes:**
- Retention cannot silently exceed the promised maximum.
- Architecture must account for raw and derived data deletion.

### 4.6 Pre-Launch Evaluation

**Description:** Before public recruiter use, Candidate Copilot must pass a small predefined test set. The test set may grow over time, but V1 must not launch without basic coverage of grounding, refusals, privacy, and user experience.

**Functional Requirements:**

#### FR-21: Maintain a predefined launch test set

BC must define and run a minimal test set before public deployment.

**Acceptance / Planning Notes:**
- Tests include normal project/skill questions.
- Tests include missing-information questions.
- Tests include value-judgment questions.
- Tests include sensitive personal questions.
- Tests include prompt-injection or rule-bypass attempts.
- Tests include long or ambiguous questions.
- Tests verify citations/source excerpts, answer completeness for representative questions, and refusal behavior.
- Tests verify privacy disclosure, visible Conversation UUID, Deletion Request persistence, and 90-day deletion behavior.
- Tests verify maximum prompt length, excessive-use handling, generation timeout, professional error states, and safe free-quota exhaustion behavior.
- Tests include a manual Public Knowledge Base launch review confirming that deployed source files are intended to be public and contain no obvious secrets, private notes, private contact details, or unintended sensitive personal data.

#### FR-22: Block launch on critical failures

Candidate Copilot must not be shown to recruiters if the minimal test set reveals critical grounding, privacy, refusal, abuse-control, free-quota, source-safety, deletion-workflow, or visible-crash failures.

**Acceptance / Planning Notes:**
- Launch readiness is based on professional trust, not feature quantity.
- Known critical failures are fixed before recruiter use.
- A launch test fails critically if the system fabricates unsupported claims, exposes or deploys private material, answers prohibited personal/sensitive questions, loses or hides Deletion Requests, shows raw provider/runtime errors, hangs without recovery, or cannot safely handle exhausted free quota.

## 5. Cross-Cutting Non-Functional Requirements

### 5.1 Simplicity and Cost

- V1 should be the simplest implementation that satisfies this PRD.
- V1 should avoid overengineering and avoid semantic/vector retrieval unless simpler retrieval fails evaluation.
- V1 must cost zero euros and avoid mandatory paid services.
- V1 should rely on a shared, unlisted link rather than accounts or broad public discovery.
- V1 must include simple zero-euro guardrails for obvious abuse and runaway usage: unlisted access, no broad indexing, maximum prompt length, maximum turns per Conversation or browser session, generation timeout, professional failure message, and safe behavior when any free quota is exhausted.
- V1 should use basic per-session or per-IP throttling if the chosen zero-euro host/runtime provides it without meaningful complexity.
- V1 should not depend on outbound email unless a free, simple, reliable option is later confirmed and explicitly accepted.

### 5.2 Performance and Reliability

- Normal answers may take several seconds due to LLM use.
- Deeper retrieval or synthesis may take up to roughly 30 seconds.
- The UI must show a meaningful working state during answer generation.
- Raw crashes, stack traces, or broken states must not be visible to recruiters.
- Failure states must be professional, safe, and understandable.

### 5.3 Security and Privacy

- Only public source material may enter the deployed Public Knowledge Base.
- Conversations must be isolated from each other.
- V1 must not use non-essential analytics or tracking.
- V1 must not create an account-like identifier across visits.
- The Conversation UUID must not be tied to Recruiter identity by the app.
- App-retained Conversation data should be limited to message content, timestamps, Conversation UUID, Deletion Request state, and minimal diagnostics needed for debugging or abuse control.
- Any unavoidable host/provider logs must be understood separately from app-retained Conversation data before launch.
- BC contact details must not be displayed publicly in V1.
- Operational access to retained Conversations and Deletion Requests must be controlled, even if simple.
- The system must preserve enough diagnostic visibility for BC to understand Recruiter questions, malfunctions, misuse, and unsafe prompts during the retention window.

### 5.4 Language

- The V1 UI is French-only.
- Answers should follow the language of the Recruiter's question where practical.
- Source Excerpts remain in the original source language.

## 6. Non-Goals

- Candidate Copilot will not assess whether BC should be hired.
- Candidate Copilot will not generate a fit score, evaluative summary, or recommendation.
- Candidate Copilot will not replace interviews or recruiter judgment.
- Candidate Copilot will not represent BC, negotiate, commit, or state current intentions on BC's behalf.
- Candidate Copilot will not answer questions about private or sensitive personal topics outside a professional context.
- Candidate Copilot will not expose private candidate material.
- Candidate Copilot will not support other candidates, candidate accounts, onboarding, or multi-tenant use.
- Candidate Copilot will not include an admin dashboard in V1.
- Candidate Copilot will not include recruiter-specific personalization or infer context from where the Visitor came from.
- Candidate Copilot will not include full source-card/document browsing in V1.
- Candidate Copilot will not include contact, email, or recruitment follow-up UI in V1.

## 7. MVP Scope

### 7.1 In Scope

- Anonymous web app accessible through a shared, unlisted link.
- French-only UI.
- Minimal landing page with authorship, purpose, trust explanation, privacy notice, example question guidelines, lightweight capability cues, and two to three selected documented projects.
- Free-form multi-turn Q&A about documented professional topics.
- Answers in the question language where practical.
- Structured answers with Source Excerpts, supported-claim clarity, and explicit partial/missing-evidence handling.
- Refusals for value judgments, BC intentions/commitments, private information, sensitive personal topics, and prompt-injection attempts.
- Visible Conversation UUIDs.
- In-app Deletion Request submission linked to the Conversation UUID.
- Conversation retention disclosure and automatic deletion within 90 days.
- Controlled simple BC access or export for retained conversations.
- Minimal pre-launch evaluation test set, including public-source review, deletion-request workflow checks, abuse/quota behavior checks, and privacy/provider disclosure checks.

### 7.2 Out of Scope for MVP

- Multi-language UI.
- Full public source-page or source-card display.
- Automated immediate deletion triggered by the user.
- Outbound email notifications.
- Public BC contact details or contact CTA.
- Admin dashboard.
- Automated conversation analysis.
- Multi-candidate platform.
- Candidate onboarding.
- Vector/semantic retrieval unless evaluation proves simpler retrieval inadequate.
- Enterprise-grade availability, performance, or abuse-control targets beyond a professional, non-crashing, zero-euro public experience.

## 8. Success Metrics

### Primary

- **SM-1: Public professional readiness.** Candidate Copilot is deployed, functional, stable enough to show in a recruitment process through a shared link, and passes the predefined launch test set. Validates FR-1 through FR-22.
- **SM-2: Meaningful recruiter exploration.** At least one recruiter conducts a genuinely exploratory Conversation during a recruitment cycle. Meaningful exploration is evidenced by multiple topics, a deeper follow-up, or a question prompted by a visible project/guideline. Validates FR-2, FR-3, FR-5, FR-6, FR-9, FR-10.

### Secondary

- **SM-3: Trustworthy answer behavior.** Test conversations show that normal answers cite evidence, missing information is acknowledged, and value/sensitive/out-of-scope questions are refused or redirected correctly. Validates FR-9 through FR-15, FR-21, FR-22.
- **SM-4: Privacy comprehension.** A Visitor can understand from the interface that Conversations may be retained, may be reviewed by BC, can have deletion requested from the app, and are deleted within 90 days. Validates FR-16 through FR-20.

### Counter-Metrics

- **SM-C1: Do not optimize for conversation volume.** High usage volume is not a V1 goal because recruitment cycles are variable and the product is a personal demonstration.
- **SM-C2: Do not optimize for persuasion.** The product should not maximize positive claims about BC; it should maximize grounded usefulness, boundaries, and trust.
- **SM-C3: Do not optimize for feature breadth.** Adding dashboards, personalization, source browsers, automation, or advanced retrieval is negative if it compromises simplicity, cost, or launchability.

## 9. Risks and Mitigations

- **Answer integrity risk:** The system may invent, overstate, or weakly support claims. Mitigation: Public Knowledge Base only, Source Excerpts, abstention, refusal rules, and launch test set.
- **Privacy risk:** Visitor conversation data or private BC material could be exposed. Mitigation: public-by-construction source base, conversation isolation, retention disclosure, Deletion Requests, and 90-day deletion.
- **Professional credibility risk:** The app could feel like a gimmick or unfinished AI demo. Mitigation: minimal finished UI, clear boundaries, working states, no raw crashes, and no unnecessary features.
- **Operational risk:** Latency, cost, abuse, or downtime could undermine a recruitment interaction. Mitigation: simple architecture, cost ceiling, progress states, basic abuse controls, and professional failure messages.
- **Content currency risk:** The Public Knowledge Base may become stale. Mitigation: BC maintains the source material and reviews retained conversations for gaps during the retention window.

## 10. Open Questions

1. Which two to three documented projects should appear on the landing page?
2. What exact French copy should be used for landing-page trust, privacy, and refusal messages?
3. What simple retrieval approach is sufficient for V1, and what evaluation result would justify changing it?
4. Which simple controlled access/export mechanism will architecture choose for retained Conversations and Deletion Requests?

## 11. Assumptions Index

No unresolved inline assumptions are currently present. Open launch decisions are tracked in §10.
