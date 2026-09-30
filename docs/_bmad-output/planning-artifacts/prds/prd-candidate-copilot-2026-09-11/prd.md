---
title: Candidate Copilot PRD
status: final
created: 2026-09-11
updated: 2026-09-30
---

# PRD: Candidate Copilot

## 0. Document Purpose

This PRD defines the first public version of Candidate Copilot: a simple, recruiter-facing, evidence-backed conversational portfolio for BC. It is intended for BC and downstream planning workflows such as UX, architecture, epics, stories, and implementation. Requirements are grouped by feature with stable Functional Requirement IDs. The product foundation is `docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md`. Approved interaction decisions in [EXPERIENCE.md](../../ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md), [DESIGN.md](../../ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md), and their UX `.memlog.md` supersede earlier landing-project and session-state restrictions as reconciled here. The UX remains an approved sketch, not a completed implementation or accessibility/privacy validation. Its approved disposition and style are not reopened; exact editorial content may evolve. Technical follow-up is recorded in `addendum.md` and `architecture-update-needed.md`; the existing architecture/runtime documents have not been amended by this update.

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

- **UJ-1. A recruiter explores BC's work from a shared link.** A Recruiter opens the app from a shared, unlisted link without creating an account. The minimal French landing explains BC's authorship, public-document grounding, Source Excerpts and Conversation retention. Choosing a suggested question opens Conversation and submits it under normal admission rules; choosing free entry opens Conversation without sending. Both paths show an initially open, optional guide. The Recruiter can ask freely or open the Resource Library on demand; no project showcase or resource/context selection is required. They select projects A and B, which immediately create two Active Resource Tokens without changing their draft, then explicitly send a question. Its Submitted Scope and Historical Resource Tokens are frozen. While waiting, they draft the next question and remove A from the active selection; the pending question still uses A/B. The complete answer uses only evidence eligible for that question and offers passage-local citations with inspectable Source Excerpts. Closing the viewer preserves reading position. The next draft and B remain ready but unsent. A same-tab refresh restores this continuity without resubmission; a new visit starts fresh.

- **UJ-2. A Recruiter asks for a judgment and is redirected to evidence.** A Recruiter asks, "Is BC good at software architecture?" The system explains that it cannot make a value judgment, then offers documented examples of architectural work, decisions, and outcomes within the question's Submitted Scope that may help the Recruiter form their own view.

- **UJ-3. A Recruiter asks an inappropriate personal question.** A Recruiter asks about religion, sexuality, health, politics, family situation, or another personal/sensitive topic unrelated to professional documented work. The system refuses calmly, states that the Conversation must remain in a professional context, and offers to answer questions about documented projects, skills, working methods, or decisions instead.

- **UJ-4. A Visitor requests deletion of Conversation history.** A Visitor opens the permanently available “Confidentialité” control in the Conversation header, including during waiting or after reaching the turn limit. The dialog explains storage/review and processing, shows the Conversation UUID, and allows an in-app Deletion Request. The app records the request for that UUID; repeat submission preserves its original date. Confirmation explains manual, non-immediate handling by BC and the 90-day creation-based retention limit with its minimal audit exception. Closing the dialog preserves the draft and reading position.

## 3. Glossary

- **Candidate Copilot** — The public, recruiter-facing conversational portfolio for BC.
- **BC** — The author, subject, and operator of Candidate Copilot.
- **Recruiter** — Any recruiting-team member using Candidate Copilot to explore BC's documented professional work.
- **Visitor** — Any anonymous person using Candidate Copilot. In expected use this is a Recruiter, but privacy and deletion controls apply to any Visitor.
- **Public Knowledge Base** — The explicitly public, BC-maintained source material from which Candidate Copilot may answer; never Web or private material.
- **Resource** — A selectable public item with an identity, name, short factual description, and a trusted mapping to public documents. V1 Resources are projects; uploads and future resource types are not included.
- **Resource Library** — The on-demand Conversation surface for choosing Resources, not a full-document browser.
- **Active Selection** — The editable set of Resources for the next explicitly submitted question; empty means the entire deployed Public Knowledge Base is eligible. It persists within the same active tab/session until explicit removal.
- **Active Resource Token** — One individually removable representation of a Resource in the Active Selection; each Resource has exactly one token.
- **Submitted Scope** — The immutable snapshot of selected Resources attached to one sent question. A nonempty snapshot restricts documentary evidence to the union of their mapped public documents; an empty snapshot permits the entire deployed Public Knowledge Base only.
- **Historical Resource Token** — A noneditable representation of one Resource in a question's Submitted Scope, distinct from a citation and from the Active Selection.
- **Source Excerpt** — A recorded passage from the Public Knowledge Base cited to support an answer, with its source-version provenance; not a generated source summary.
- **Conversation** — A single Visitor interaction thread with Candidate Copilot.
- **Conversation UUID** — The identifier associated with a Conversation and used for Deletion Requests and diagnostics.
- **Deletion Request** — A request submitted from the app asking BC to delete the Conversation history associated with a Conversation UUID.
- **Out-of-Scope Question** — A question Candidate Copilot must not answer directly because it asks for a value judgment, undocumented/private information, commitments or intentions on BC's behalf, or personal/sensitive information outside a professional context.
- **V1** — The first public deployed version that BC can show to recruiters in real recruitment contexts.

## 4. Features

### 4.1 Minimal Entry and On-Demand Project Discovery

**Description:** The landing experience presents Candidate Copilot as a finished, trustworthy, simple public product. It is more than an empty chat box, but it must not over-direct the Recruiter or imply a narrow target role. The UI is French-only in V1.

**Functional Requirements:**

#### FR-1: Explain the product simply

The landing page must explain that Candidate Copilot is an interactive portfolio created by BC and that it answers from public documentation.

**Acceptance / Planning Notes:**
- A first-time Visitor can understand the product purpose before submitting a question.
- The landing page does not present Candidate Copilot as an autonomous representative of BC.

#### FR-2: Provide light guidance without constraining questions

The minimal landing must offer self-contained suggested questions and a distinct free-entry path. Conversation guidance is optional and does not constrain questions or require context, Resources, a category, or a target role. Realizes UJ-1.

**Acceptance / Planning Notes:**
- Activating one of the two to three suggested questions opens Conversation and submits that question once under normal admission rules; free entry opens Conversation without admitting a message. Entry does not add a separate landing form or mandatory context step.
- Both entry paths show an initially open, short guide outside the transcript. It can be manually collapsed/reopened under “Quelques repères”; an answer never automatically hides it.
- Questions provide light factual capability cues without a static skills/proof band, fixed categories, a permanent conversation suggestion row, or targeted role/job-type positioning.
- Visitor-provided context is optional and may orient documented answers, but must not enable inferred personalization or candidate-role fit assessment. Exact questions and guide wording remain editorial work.

#### FR-3: Access and select projects on demand

A Recruiter can open the Resource Library from the Conversation composer to explore factual project descriptions and optionally choose multiple Resources for future questions. Projects are not a mandatory landing or permanent Conversation showcase. Realizes UJ-1.

**Acceptance / Planning Notes:**
- Library access is available on desktop/mobile in the composer toolbar, opposite Send. V1 lists public project names, short factual descriptions, and selection controls; no upload or future resource type is implied.
- Each add/remove immediately changes exactly one Resource and its corresponding Active Resource Token, without duplicates or effects on other Resources. The library remains open for further changes; there is no batch Apply step or arbitrary numeric selection cap.
- Each Active Resource Token has its own removal control. Selection never inserts a project prefix, modifies typed text, submits a question, or consumes a turn.
- Sending leaves the Active Selection in place until explicit removal. Removing the last Resource leaves an empty selection for future questions only.
- Active Resource Tokens appear above typed text in one horizontally scrollable row, without wrapping or a collapsed +N substitute. Every selected Resource remains reachable and removable; the empty row is hidden. Exact labels and geometry remain governed by the approved UX sketch.

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
- The Recruiter can ask a broad question, then refine or change topic, up to the configurable 20 admitted user messages per Conversation.
- Only one turn is processed at a time in a Conversation, without a server-side queue. Send is disabled during processing or while the outcome remains unknown; concurrent submissions are rejected without adding another message. Reading, Resource selection, text editing, privacy access, and Deletion Request submission remain available.
- Explicit submission freezes the question and Submitted Scope, independently of the editable next-turn draft and Active Selection. Editing either while waiting affects only the next explicit submission. Response arrival preserves those newer edits, never queues or auto-sends them.
- Every selected Resource has a Historical Resource Token inside that turn's answer container immediately before its content, visible from waiting through completed/error states and same-tab replay. Tokens cannot be removed or changed, are not citations, and wrap on mobile so all remain visible. An empty Submitted Scope produces no historical token, global label, or empty scope band.
- Follow-ups and clarification replies use their own Submitted Scope. Conversation history may orient intent but cannot supply factual evidence outside that scope or silently widen it.
- If the available context does not resolve an ambiguity that materially changes the question's subject or intent, the system asks a short clarification question before searching for evidence or giving a factual answer; it does not guess between plausible interpretations.
- A clarification reply is interpreted together with the original question and the clarification asked. If older context is unavailable, the system asks again rather than inventing it.
- The product remains focused on documented professional material.

#### FR-7: Answer in the language of the question

Candidate Copilot must answer in the language of the Recruiter’s question, where practical.

**Acceptance / Planning Notes:**
- If a Recruiter asks in French, the answer is in French.
- If a Recruiter asks in English, the answer is in English.
- An explicit request for another answer language takes precedence where practical; the Recruiter may change language between turns, including clarification turns.
- Source Excerpts remain in their original document language, expected to be French in V1.

#### FR-8: Show working status during generation

The UI must show a clear working indicator while Candidate Copilot retrieves and synthesizes an answer.

**Acceptance / Planning Notes:**
- Normal waiting shows the approved generic assistant badge and three small activity dots with an accessible working-state indication; explanatory prose is not required for ordinary waiting. The indicator must not invent backend progress stages.
- V1 presents a complete result after checks and durable recording, not unvalidated token-by-token streaming. Answers and their evidence are recorded together; a failed finalization leaves the original admitted question without a partial answer.
- A network interruption or browser timeout does not imply the question failed. Preserve the original pending question, submission identity and Submitted Scope. Manual recovery uses that original submission, never the newer draft/Active Selection, and neither duplicates its display nor consumes another turn.
- A received, recorded recoverable technical failure offers a “Réessayer” icon on the failed question in the chat, never in the composer. Its accessible name identifies the action. Explicit activation submits the failed question's original text and Submitted Scope as a new logical turn with a new submission identity, subject to the same admission, turn-limit and single-processing rules; the original failed turn remains unchanged.
- Technical retry does not use or overwrite the newer draft/Active Selection, which stay ready for a later explicit send. An invalid or unavailable Resource in the original scope must not silently widen retry to global scope. A normal answer, partial answer, business refusal, clarification or unknown outcome does not get this technical retry action.
- The short [user guide](../../../../guide-utilisateur.md) explains the question-local retry action, original scope, new-turn accounting, preserved draft/selection, and the difference from “Vérifier à nouveau” for an unknown outcome.
- There are no automatic processing retries, whether in the browser or backend. Waiting and recovery are bounded as specified in §5.2.

### 4.3 Grounded Answers and Evidence

**Description:** Candidate Copilot answers only from the Public Knowledge Base. Accuracy, completeness, and traceability matter more than persuasion.

**Functional Requirements:**

#### FR-9: Use only public Markdown source material

Candidate Copilot must answer only from the deployed Public Knowledge Base. The Public Knowledge Base must be maintained as human-readable, version-controlled public Markdown, with any runtime search or index artifacts derived from that source.

**Acceptance / Planning Notes:**
- Private material must not be deployed and hidden through prompts or runtime filtering.
- If BC knows something that is not in the Public Knowledge Base, Candidate Copilot must not invent it.
- Runtime retrieval artifacts cannot become a separate opaque source of truth.
- A nonempty Submitted Scope strictly limits retrieval and factual support to the union of public documents mapped to its Resources. Other public documents cannot supplement an answer even when they would answer the question better. An empty Submitted Scope permits the entire deployed Public Knowledge Base; neither case permits Web search or private evidence.
- Resource identities and document mappings are validated against trusted public metadata, not accepted as browser-supplied evidence. An invalid or unavailable selected Resource must never silently turn into empty/global scope. Catalog/mapping revision handling belongs in the architecture follow-up.
- Changes to the Active Selection affect future submissions only; they never rewrite a pending question, earlier answer, Historical Resource Tokens, or Source Excerpts.

#### FR-10: Include inspectable Source Excerpts

Candidate Copilot answers must include Source Excerpts sufficient for the Recruiter to inspect why the answer was produced. Answers should be structured enough to distinguish supported claims, partial evidence, and missing information.

**Acceptance / Planning Notes:**
- Citations are associated with the passage they support. Desktop shows clickable file-title tokens beside that passage without hover-only essential information. Mobile uses one passage-level citation control with overlapping source circles, at most three then +N; its accessible label states the actual distinct-file count and all cited files remain inspectable.
- Activating a citation opens only that passage's relevant Source Excerpts, grouped by file without duplicate file rows, retaining all relevant cited sections/excerpts. File names and cited section titles are visible; rows expand inline, and a single source shows its excerpt directly. The viewer contains neither generated source summaries nor full documents.
- Activating another citation replaces the current viewer content rather than stacking windows. Closing restores trigger focus and preserves reading position; shared surface behavior is defined in §5.6.
- Full source cards or full document views remain out of scope for V1. The Resource Library selects scope, while this viewer inspects cited excerpts; neither is a full-source browser.
- Historical excerpts retain the text and source-version provenance used for the answer; updating or removing a current public document must not silently rewrite that history. Accidentally sensitive source material requires separate remediation of historical copies.
- Representative launch evaluations assess whether actual model answers are supported by their cited excerpts and sufficiently complete for the question asked.
- A valid response structure or citation reference does not prove that the cited text supports an assertion. V1 relies on LLM behavior for semantic interpretation; automated contract checks do not certify meaning, completeness, or factual correctness.

#### FR-11: Handle partial or missing evidence explicitly

When support is absent, weak, or partial, Candidate Copilot must say so rather than guessing.

**Acceptance / Planning Notes:**
- Unsupported claims are not presented as facts.
- Partial answers distinguish what is supported from what is unavailable.
- Finding no suitable passage is reported as insufficient retrieved evidence within the Submitted Scope, not proof that the information does not exist anywhere in the Public Knowledge Base.
- Partial/missing selected evidence never triggers a fallback to unselected Resources or other public documents. Factual examples offered after a refusal remain subject to the same scope.

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

The app must tell Visitors that Conversation content and associated runtime data may be stored and manually reviewed by BC, that they are deleted within 90 days of Conversation creation, and that questions may be processed through the AI/provider path chosen during implementation. The separate, minimal Deletion Request audit retained indefinitely must be disclosed explicitly.

**Acceptance / Planning Notes:**
- The disclosure is visible before or during use, not hidden in a long policy only; landing trust/privacy information must not be replaced solely by an unopened dialog.
- A discreet “Confidentialité” control remains visible in the Conversation header on desktop/mobile, outside menus and the collapsible guide. Its dedicated dialog explains storage, BC review and actual processing, exposes the Conversation UUID and Deletion Request control, and closes without clearing the draft or shifting reading position.
- The approved privacy-dialog sketch is not final disclosure copy or proof of privacy comprehension; complete pending/error/open/handled states and truthful disclosures must be checked before launch.
- Visitors understand that the 90-day maximum runs from Conversation creation, not the date of their latest message.
- Disclose the indefinite audit exception: Deletion Request identity, historical Conversation UUID when known, status, and lifecycle timestamps only; no Conversation text, excerpts, tokens, or Visitor identity in that audit.
- Explain the minimal temporary IP-based abuse counter separately from Conversation storage; it is not an account or durable browsing fingerprint.
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
- V1 does not restore previous Conversation history, drafts or Active Selection across new visits/sessions. A new visit/session starts a new Conversation UUID with empty selection; no durable cross-visit browser state or account-like identity is introduced.
- Reloading the same active tab/session restores the server-recorded transcript and processing state together with the current unsent draft, Active Selection and agreed view-state continuity. It preserves each turn's Submitted Scope/Historical Resource Tokens and displays each submission once, without sending again.
- Session-only state may retain the unsent draft, Active Selection and necessary view state separately from an unknown-outcome submission's immutable question, identity and Submitted Scope. The browser does not own a canonical transcript; server-recorded state remains authoritative. Exact session lifecycle/reconciliation rules must be completed in architecture/runtime contracts before implementation.
- Completion/recovery clears only the matching pending submission state, never the newer next-turn draft or Active Selection.
- After reload, an active turn may be observed through bounded read-only checks. Stop on completion, expired processing, communication failure, or the observation limit; never automatically resubmit a question. Observation errors offer “Vérifier à nouveau” rather than falsely claiming generation failure.
- Inaccessible/expired/deleted Conversations show a neutral unavailable message and may offer a new Conversation. Do not silently recreate the old one or send its pending question into the new one.
- The product avoids account-like tracking or identity linkage in V1.

#### FR-19: Provide in-app Deletion Request submission

The app must allow the Visitor to submit a Deletion Request from the interface for the current Conversation UUID.

**Acceptance / Planning Notes:**
- Deletion requests are handled manually by BC.
- A Deletion Request must initially be persisted with the current Conversation UUID and request timestamp. Repeated submission returns the same request without resetting its date.
- Deletion Request states are `open` and `handled`. Mark handled only after confirmed deletion or confirmation that the data is already gone; an unsuccessful deletion leaves the request open.
- Submission remains available during generation and after the message limit is reached. Actual deletion waits while processing is active on that Conversation, without blocking cleanup of other Conversations.
- Minimal audit metadata survives Conversation deletion indefinitely as disclosed in FR-16; the historical Conversation UUID may be absent but should be retained when known. No content or credentials belong in this audit.
- Deletion Requests must be visible to BC through the same controlled access/export path used for retained Conversations.
- BC must define a manual review cadence before public recruiter use.
- UI confirmation must honestly state that deletion is manual and not immediate.
- V1 does not require immediate automatic user-triggered deletion.
- V1 does not require outbound email.

#### FR-20: Automatically delete conversation data within 90 days

Raw and derived Conversation content/runtime data must be deleted no later than the Conversation creation timestamp plus 90 × 24 hours, calculated in UTC. The narrow Deletion Request audit exception is defined in FR-16/FR-19.

**Acceptance / Planning Notes:**
- New messages and recovery attempts never extend the deadline; newer associated records may therefore be kept for less than 90 days.
- Automatic cleanup starts early enough to account for scheduling, active processing, and operational recovery. Deferring a busy Conversation must not permit retention beyond the deadline.
- Raw/derived data and deletion-completion state must not be left partially removed/updated after failure.
- Loss of access is not proof of deletion; overdue or failed cleanup must be operator-visible and recoverable. Architecture must account for all associated messages, answers, excerpts, Submitted Scope snapshots/display metadata, processing metadata, and diagnostics. Submitted Scope data shares this retention/deletion deadline and never belongs in the indefinite Deletion Request audit.

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
- Tests include long or ambiguous questions, clarification and its resolution on the next turn, French/English language changes, and corporate terms or paraphrases that differ from source vocabulary.
- Deterministic tests verify response contracts, citation references and source integrity, isolation, and controlled failure paths; mocked model responses test application behavior, not semantic model capability.
- Separate evaluations of actual configured model outputs assess citation support, answer completeness, appropriate refusal/redirection, clarification relevance, and actual response language on representative questions. Human inspection assesses meaning; sampled success is not a guarantee for every future response.
- Tests verify privacy disclosure including audit/counter exceptions, visible Conversation UUID, idempotent Deletion Request state, and creation-based 90-day cleanup, including busy-conversation deferral and failure visibility.
- Tests verify single active processing, atomic answer/evidence persistence, duplicate/conflicting requests, interrupted processing, manual recovery versus explicit new-turn retry, and reload observation without automatic processing retries.
- Tests verify the 1,000-character boundary, 20-turn accounting, 10 new Conversations per IP per UTC day, generation/browser time limits, professional failures, and safe free-quota behavior. Same-submission recovery and reads do not consume extra logical turns.
- Provider quota, rate-limit, reset, and billing cases must be derived from current official Cloudflare documentation during implementation and tested in the adapter; no assumed universal error code or reset schedule.
- Tests include a manual Public Knowledge Base launch review confirming that deployed source files are intended to be public and contain no obvious secrets, private notes, private contact details, or unintended sensitive personal data.
- Tests verify suggested-question submission versus free-entry no-send; initially open/manual guide; optional on-demand project access; immediate 1:1 multi-selection/removal, unchanged typed text, persistence after send, last-token removal and reachable token overflow.
- Deterministic tests verify trusted Resource mappings and strict multi-resource documentary scope, including overlaps, no matches, invalid/unavailable Resources, changed scope under the same submission identity, immutable snapshots from admission through waiting/error/completion/replay, and retention/deletion of scope data. Empty selection remains public-only; no outside-selected or Web/private evidence is eligible.
- Real-model evaluations additionally assess selected-scope adherence, insufficiency, follow-ups/clarification after scope changes, refusal redirection and resistance to history/catalog/prompt injection. Existing citation/semantic limits still apply.
- Tests verify next-turn draft/selection editing during pending/unknown outcomes, original-scope manual recovery, same-tab draft/selection restoration, no duplicate display/resubmission, response-arrival preservation, and fresh new-visit state. Tests verify that question-local “Réessayer” uses the failed question's original text/scope and a new submission identity, preserves the newer draft/Active Selection and original failed turn, consumes a turn only on admission, and cannot compete with an active/unknown turn or bypass limits. The action is absent from the composer and from nontechnical/unknown outcomes; its accessible name and the short user guide are checked.
- Desktop/mobile checks cover passage-local citation/file grouping and all-source inspection, non-displacing panels/sheets, focus and reading-position preservation, no forced scroll on response arrival, visible bounded composer and mobile keyboard-open usability, identity and functional parity, permanent privacy/deletion access, truthful disclosures and complete failure/limit/unavailable/deletion states. Real keyboard, touch and screen-reader checks verify §5.6; mock geometry/interaction checks are not substitutes.

#### FR-22: Block launch on critical failures

Candidate Copilot must not be shown to recruiters if the minimal test set reveals critical grounding, privacy, refusal, abuse-control, free-quota, source-safety, deletion-workflow, or visible-crash failures.

**Acceptance / Planning Notes:**
- Launch readiness is based on professional trust, not feature quantity.
- Known critical failures are fixed before recruiter use, including those found in real-model evaluations; passing deterministic checks alone is insufficient. Acknowledging the limits of automatic semantic verification does not relax these acceptance requirements.
- A launch test fails critically if the system fabricates unsupported claims, exposes or deploys private material, answers prohibited personal/sensitive questions, loses or hides Deletion Requests, shows raw provider/runtime errors, hangs without recovery, or cannot safely handle exhausted free quota.
- Scope widening beyond selected public documents, mutation/loss of a sent question's Submitted Scope, duplicate submission during recovery, or durable cross-visit restoration also blocks launch. Sketch approval does not waive runtime, privacy, accessibility or complete-state acceptance work.

## 5. Cross-Cutting Non-Functional Requirements

### 5.1 Simplicity and Cost

- V1 should be the simplest implementation that satisfies this PRD.
- V1 should avoid overengineering and avoid semantic/vector retrieval unless simpler retrieval fails evaluation.
- V1 must cost zero euros and avoid mandatory paid services.
- V1 should rely on a shared, unlisted link rather than accounts or broad public discovery.
- Initial configurable limits are 1,000 characters per user message with a visible counter and matching server enforcement, and 20 admitted logical user messages per Conversation. Never silently truncate user input.
- Clarification replies and explicit new submissions after recorded failures consume a turn; recovery of the same submission, rejected messages, transcript reads, and Deletion Requests do not consume another turn.
- Limit creation to 10 Conversations per IP per UTC calendar day using a short-lived pseudonymous counter, without linking Conversations to a durable Visitor profile. Explain when creation can resume; do not block existing Conversations or deletion controls solely because this creation limit is reached. Shared corporate IPs are a known trade-off and limits must remain configurable.
- No automatic processing retry, paid overage, or fallback to another provider. Confirmed pre-admission quota unavailability preserves the draft and Active Selection without consuming a turn; an admitted turn that receives a provider rejection ends in a controlled recorded failure when possible.
- Document and test actual plan quotas/billing before launch; only display a recovery time when it is known. The product must fail professionally rather than assume an exhausted free quota permits continued use.
- V1 should not depend on outbound email unless a free, simple, reliable option is later confirmed and explicitly accepted.

### 5.2 Performance and Reliability

- Normal answers may take several seconds due to LLM use.
- Initial configurable limits are a 30-second total backend processing budget and 45-second browser wait. Expiry of the browser wait is an unknown outcome, not proof the backend stopped; retries remain manual.
- Following a reload only, read-only observation of an active turn runs approximately every 3 seconds for at most 45 seconds, stopping on error or terminal state. It must not trigger another generation or indefinitely show a spinner.
- The UI must show a meaningful working state during answer generation, allowing next-turn draft/Active Selection edits while preventing competing sends during processing or unknown outcome. Arrival, recovery and reload must not overwrite newer edits with the submitted question/scope.
- Raw crashes, stack traces, or broken states must not be visible to recruiters.
- Failure states must be professional, safe, and understandable.

### 5.3 Security and Privacy

- Only public source material may enter the deployed Public Knowledge Base.
- Conversations must be isolated from each other.
- V1 must not use non-essential analytics or tracking.
- V1 must not create an account-like identifier across visits.
- The Conversation UUID must not be tied to Recruiter identity by the app.
- App-retained Conversation data is limited to message/answer content and evidence, Submitted Scope snapshots/display metadata, identifiers and timestamps needed for correlation/recovery, and minimal diagnostics. These follow FR-20; the indefinitely retained Deletion Request audit contains only the separate identifiers/status/timestamps disclosed in FR-16.
- Temporary pseudonymous IP counters support creation limits only, expire after their useful window, and are not stored as Visitor identifiers in Conversations. Avoid unnecessary raw IP logs or browser fingerprinting.
- Conversation access credentials must travel securely, never appear in URLs/logs/model prompts, and authorize only their own Conversation. Model-generated text must not execute as trusted HTML or script.
- Any unavoidable host/provider logs must be understood separately from app-retained Conversation data before launch.
- BC contact details must not be displayed publicly in V1.
- Operational access to retained Conversations and Deletion Requests must be controlled, even if simple.
- The system must preserve enough diagnostic visibility for BC to understand Recruiter questions, malfunctions, misuse, and unsafe prompts during the retention window.

### 5.4 Language

- The V1 UI is French-only.
- Answers should follow the language of the Recruiter's question where practical.
- Source Excerpts remain in the original source language.

### 5.5 Delivery and Operations

- Validate changes in an isolated preview before BC manually promotes the evaluated revision to production. Preserve source-version traceability and run post-deployment checks.
- Delivery/Operations stories must include a usable operator runbook as acceptance work: deployment, migration compatibility, rollback, deletion/purge handling, and provider incidents. The runbook documents required secret configuration, never secret values.
- A deployment or rollback must not discard newer Conversations or Deletion Requests. Implementation must define recovery for partially completed deployments without claiming cross-service atomicity.
- CI/deployment quotas and actual hosting/provider billing must preserve the zero-euro constraint; detailed tooling and procedures belong to the architecture and implementation stories.

### 5.6 Responsive Interaction and Accessibility

- The approved UX disposition/style remains in DESIGN.md; these are interaction acceptance obligations, not a visual redesign. Desktop/mobile provide the same conversation, guide, Resource selection, citation, privacy/deletion and recovery capabilities, including readable long answers/excerpts.
- Compact candidate identity remains visible on mobile through wrapping/stacking, scrolls with the page rather than sticking over content, and does not become a permanent presentation sidebar. Conversation remains the central reading surface.
- The composer remains visible at the bottom while browsing; long drafts grow only to a bounded cap and remain editable without taking over the experience. Exact cap, keyboard-open geometry and overflow cues must be verified in implementation, not copied from illustrative mock measurements.
- Source/resource panels use available right margin without covering, shifting, reflowing or changing transcript reading width. Insufficient space uses a bottom-sheet overlay, including on narrow desktop windows. Open/close preserves reading position and restores trigger focus on close; a new answer must not pull a scrolled-up reader to the bottom.
- Keyboard/touch/screen-reader checks cover entry, guide collapse/reopen, Resource selection/removal and horizontal token overflow, passage citations and source-row expansion, privacy/deletion and recovery. Essential information is not hover-only; states are not conveyed by color alone.
- Verify visible focus, logical reading/focus order, meaningful selected/expanded/disabled labels, dialog/sheet focus containment and restoration, actual distinct-source-count labels, readable contrast and zoom/reflow, usable touch targets, waiting/error/recovery announcements and reduced-motion behavior. Exact sizes and announcement wording remain implementation/UX acceptance work; no accessibility certification is claimed.

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
- Candidate Copilot will not include full source-card/document browsing in V1; on-demand Resource selection and passage-local Source Excerpts are included, not full-document navigation.
- Candidate Copilot will not retrieve Web evidence, upload Visitor documents, or add unapproved Resource types in V1.
- Candidate Copilot will not include contact, email, or recruitment follow-up UI in V1.

## 7. MVP Scope

### 7.1 In Scope

- Anonymous web app accessible through a shared, unlisted link.
- French-only UI.
- Minimal landing with authorship, purpose, trust/privacy explanation, suggested questions and free entry; optional initially open Conversation guide.
- On-demand project Resource Library, immediate multi-selection/removal, persistent Active Selection and immutable per-question Submitted Scope/Historical Resource Tokens; no mandatory project showcase.
- Free-form multi-turn Q&A about documented professional topics, with strict selected-document scope or the entire public base when nothing is selected, never the Web.
- Editable next-turn draft/selection while waiting; same-tab refresh continuity without automatic send or durable cross-visit restoration.
- Passage-local excerpt inspection, preserved reading/focus, and desktop/mobile accessibility and functional parity under the approved UX sketch.
- Answers in the question language where practical.
- Structured answers with Source Excerpts, supported-claim clarity, and explicit partial/missing-evidence handling.
- Refusals for value judgments, BC intentions/commitments, private information, sensitive personal topics, and prompt-injection attempts.
- Visible Conversation UUIDs.
- In-app Deletion Request submission linked to the Conversation UUID.
- Conversation retention disclosure and automatic content/runtime-data deletion within 90 days of creation, with the separately disclosed minimal deletion-audit exception.
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
- **SM-2: Meaningful recruiter exploration.** At least one recruiter conducts a genuinely exploratory Conversation during a recruitment cycle. Meaningful exploration is evidenced by multiple topics, a deeper follow-up, or a question prompted by an on-demand project or the optional guide. Validates FR-2, FR-3, FR-5, FR-6, FR-9, FR-10.

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

1. Which public projects, names and factual descriptions populate the V1 Resource Library, and how are their trusted public-document mappings maintained? BC owns content; architecture owns mapping/version/invalid-resource handling before implementation acceptance. This is no longer a requirement to choose two to three landing highlights.
2. What exact French copy should be used for entry questions, guide, Resource labels, trust/privacy, refusal and recovery/limit/deletion states? BC/UX owns editorial completion before public launch; the approved disposition/style is not reopened.
3. Does the initial lexical retrieval baseline find sufficient evidence on representative questions, including selected-resource scope, and what evaluation result would justify semantic/vector retrieval? BC/implementation owns evaluation evidence before public launch; architecture retains the simplest sufficient approach.
4. What exact operator commands and runbook will implement the chosen controlled local CLI/script access, deletion, purge, export, and deployment procedures? Implementation/operations owns the usable runbook and tested procedures before public launch under §5.5.
5. Which session-only view-state fields and lifecycle/reconciliation rules complete same-tab continuity, including stale/unavailable Resource handling? Architecture/runtime owns this follow-up before implementation, preserving original-scope recovery, server transcript authority and no durable cross-visit storage. See `architecture-update-needed.md`.

## 11. Assumptions Index

No unresolved inline assumptions are currently present. Open launch decisions are tracked in §10.
