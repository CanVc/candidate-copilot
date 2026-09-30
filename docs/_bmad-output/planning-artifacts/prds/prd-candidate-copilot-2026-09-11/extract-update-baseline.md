# Update baseline: source extraction

Extraction only. No source requirements have been changed and no new UX decision is asserted here. All four requested files were read in full.

## Sources and authority

- **P** — `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md` (final; updated 2026-09-17).
- **A** — `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/addendum.md`.
- **M** — `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/.memlog.md` (updated 2026-09-17T16:47).
- **B** — authoritative original brief, `docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md` (final; updated 2026-09-11).

P §0 identifies B as the authoritative input. M explicitly records approved subsequent overrides; notably, immediate user-triggered deletion in B was replaced with a manual Deletion Request. A is now a pointer to architecture contracts rather than an independent requirements list. Linked architecture documents were not part of this extraction and were not read.

**ID convention:** P has journeys **UJ-1–UJ-4** and stable requirements **FR-1–FR-22**. Its acceptance bullets are headed **“Acceptance / Planning Notes”** and have **no independent AC IDs**. Do not invent AC identifiers when reconciling. B, A, and M have no FR/AC IDs.

## 1. Existing coverage and missing specifications

| Requested topic | Existing source coverage / exact IDs | Not specified in these four sources |
| --- | --- | --- |
| Projects | UJ-1; FR-2, FR-3, FR-6; §7.1; §10 question 1; SM-2 | Interactive project/resource selection, selected-project state, automatic scoping when a project is clicked, project library beyond 2–3 launch highlights |
| Resource selection / scope | FR-2 (free questions), FR-6 (professional multi-turn and clarification), FR-9 (deployed public KB only), FR-10 (excerpts, not full documents), FR-11 (insufficient retrieved evidence); §6 / §7.2 source-browsing exclusions | Resource picker, selection cardinality/defaults, “all resources” semantics, project-to-resource mapping, scope labels, explicit user-selected retrieval filters |
| Request snapshots | FR-8 (durable complete result, original admitted question retained), FR-10 (historical excerpt text + source-version provenance), FR-18 (temporary pending question + submission identity), FR-21 (same-submission accounting) | Snapshot of selected resource IDs, selection revisions, per-message scope metadata, point at which resource selection is captured/frozen |
| Editing while pending | FR-6 (one turn; disabled Send; reads/deletion still available), FR-8 (manual recovery; explicit new-turn retry), §5.2 (preserve draft/prevent competing sends) | Whether composer text can be edited during processing, distinction between editable next draft and immutable admitted request, resource-selection editing while a turn is active/unknown |
| Tab refresh / privacy | FR-18 (same active tab/session reload restores server transcript/state; new visit/session gets new UUID), FR-16–FR-20, §5.2, §5.3 | Exact tab-versus-browser-session boundary; duplicate/new tab behavior; browser storage technology/lifetime; refresh behavior for unsent drafts or resource selection |

A historical evidence snapshot is already required by FR-10, but is **not** an existing requirement for a user-selected resource-scope snapshot. The resource-selection and editable-pending behaviors above would be new product detail, not a quotation of existing requirements.

## 2. Journey passages (verbatim)

### P §2.4 — UJ-1

> - **UJ-1. A recruiter explores BC's work from a shared link.** A Recruiter opens the app from a shared, unlisted link without creating an account. They see a minimal French landing page explaining that Candidate Copilot was created by BC, that it answers from the Public Knowledge Base, that Conversations may be retained for up to 90 days, and that answers include Source Excerpts. They see two to three selected projects and example question guidelines, then ask freely about a project or skill. The system answers in the language of the question, includes Source Excerpts, and leaves the Recruiter able to form their own view.

### P §2.4 — UJ-4

> - **UJ-4. A Visitor requests deletion of Conversation history.** A Visitor opens the app privacy/deletion control from the Conversation interface. The app submits a Deletion Request associated with the Conversation UUID. The Visitor understands that Conversations are retained for at most 90 days and that Deletion Requests are handled manually by BC.

**Related boundaries:** UJ-2 redirects a value judgment to documented architectural work, decisions, and outcomes. UJ-3 refuses inappropriate personal/sensitive questions and redirects to documented projects, skills, working methods, or decisions.

## 3. Project presentation and unconstrained professional exploration

### P §4.1 — FR-1: Explain the product simply (verbatim)

> The landing page must explain that Candidate Copilot is an interactive portfolio created by BC and that it answers from public documentation.
>
> **Acceptance / Planning Notes:**
> - A first-time Visitor can understand the product purpose before submitting a question.
> - The landing page does not present Candidate Copilot as an autonomous representative of BC.

### P §4.1 — FR-2: Provide light guidance without constraining questions (verbatim)

> The landing page must provide example questions, guidelines, and lightweight documented capability cues while making clear that the Recruiter may ask freely within the professional scope.
>
> **Acceptance / Planning Notes:**
> - Example questions help the Recruiter start.
> - Capability cues suggest areas worth exploring without implying a target role or job type.
> - The UI does not force the Recruiter into fixed categories or a rigid guided flow.

### P §4.1 — FR-3: Show selected projects before conversation (verbatim)

> The landing page must display two to three documented projects selected by BC before launch, with short factual highlights that help a Recruiter choose what to ask about.
>
> **Acceptance / Planning Notes:**
> - Project selection remains an open launch task until BC chooses them.
> - Project highlights stay factual and evidence-oriented.
> - The landing page must not state a targeted role or targeted job type.

### P §4.2 — FR-5: Allow anonymous public conversation (verbatim)

> A Recruiter can start a Conversation from the web app through a shared, unlisted link without creating an account.
>
> **Acceptance / Planning Notes:**
> - No recruiter login, onboarding, or account management is required for V1.
> - The app should not be broadly discoverable through normal public indexing.
> - Conversations are isolated from each other.

### P §4.2 — FR-6: Support multi-turn questions (verbatim)

> Candidate Copilot must support follow-up questions within a Conversation about BC's documented experience, projects, outcomes, technical skills, working methods, and design decisions.
>
> **Acceptance / Planning Notes:**
> - The Recruiter can ask a broad question, then refine or change topic, up to the configurable 20 admitted user messages per Conversation.
> - Only one turn is processed at a time in a Conversation, without a server-side queue. Send is disabled during processing and concurrent submissions are rejected without adding another message; reading and Deletion Request submission remain available.
> - If the available context does not resolve an ambiguity that materially changes the question's subject or intent, the system asks a short clarification question before searching for evidence or giving a factual answer; it does not guess between plausible interpretations.
> - A clarification reply is interpreted together with the original question and the clarification asked. If older context is unavailable, the system asks again rather than inventing it.
> - The product remains focused on documented professional material.

### P §4.2 — FR-7: Answer in the language of the question (verbatim)

> Candidate Copilot must answer in the language used by the Recruiter’s question, where practical.
>
> **Acceptance / Planning Notes:**
> - If a Recruiter asks in French, the answer is in French.
> - If a Recruiter asks in English, the answer is in English.
> - An explicit request for another answer language takes precedence where practical; the Recruiter may change language between turns, including clarification turns.
> - Source Excerpts remain in their original document language, expected to be French in V1.

### P scope / success / open questions (verbatim extracts)

§7.1:
> - Minimal landing page with authorship, purpose, trust explanation, privacy notice, example question guidelines, lightweight capability cues, and two to three selected documented projects.
> - Free-form multi-turn Q&A about documented professional topics.

§8:
> - **SM-2: Meaningful recruiter exploration.** At least one recruiter conducts a genuinely exploratory Conversation during a recruitment cycle. Meaningful exploration is evidenced by multiple topics, a deeper follow-up, or a question prompted by a visible project/guideline. Validates FR-2, FR-3, FR-5, FR-6, FR-9, FR-10.

§10:
> 1. Which two to three documented projects should appear on the landing page?
> 2. What exact French copy should be used for landing-page trust, privacy, and refusal messages?
> 3. Does the initial lexical retrieval baseline find sufficient evidence on representative questions, and what evaluation result would justify semantic/vector retrieval?

## 4. Resource/evidence scope and historical snapshots

### P §4.3 — FR-9: Use only public Markdown source material (verbatim)

> Candidate Copilot must answer only from the deployed Public Knowledge Base. The Public Knowledge Base must be maintained as human-readable, version-controlled public Markdown, with any runtime search or index artifacts derived from that source.
>
> **Acceptance / Planning Notes:**
> - Private material must not be deployed and hidden through prompts or runtime filtering.
> - If BC knows something that is not in the Public Knowledge Base, Candidate Copilot must not invent it.
> - Runtime retrieval artifacts cannot become a separate opaque source of truth.

### P §4.3 — FR-10: Include inspectable Source Excerpts (verbatim)

> Candidate Copilot answers must include Source Excerpts sufficient for the Recruiter to inspect why the answer was produced. Answers should be structured enough to distinguish supported claims, partial evidence, and missing information.
>
> **Acceptance / Planning Notes:**
> - V1 may show excerpts/snippets in the response rather than full public source pages.
> - Full source cards or full document views are out of scope for V1.
> - Historical excerpts retain the text and source-version provenance used for the answer; updating or removing a current public document must not silently rewrite that history. Accidentally sensitive source material requires separate remediation of historical copies.
> - Representative launch evaluations assess whether actual model answers are supported by their cited excerpts and sufficiently complete for the question asked.
> - A valid response structure or citation reference does not prove that the cited text supports an assertion. V1 relies on LLM behavior for semantic interpretation; automated contract checks do not certify meaning, completeness, or factual correctness.

### P §4.3 — FR-11: Handle partial or missing evidence explicitly (verbatim)

> When support is absent, weak, or partial, Candidate Copilot must say so rather than guessing.
>
> **Acceptance / Planning Notes:**
> - Unsupported claims are not presented as facts.
> - Partial answers distinguish what is supported from what is unavailable.
> - Finding no suitable passage is reported as insufficient retrieved evidence, not proof that the information does not exist anywhere in the Public Knowledge Base.

### P source-browsing / personalization exclusions (verbatim extracts)

§6:
> - Candidate Copilot will not include recruiter-specific personalization or infer context from where the Visitor came from.
> - Candidate Copilot will not include full source-card/document browsing in V1.

§7.2:
> - Full public source-page or source-card display.
> - Vector/semantic retrieval unless evaluation proves simpler retrieval inadequate.

§8:
> - **SM-C3: Do not optimize for feature breadth.** Adding dashboards, personalization, source browsers, automation, or advanced retrieval is negative if it compromises simplicity, cost, or launchability.

**Extraction distinction:** The sources prohibit full-document/source-card browsing, not an explicitly specified lightweight selector (none exists here). Whether a new project/resource interface crosses that exclusion needs reconciliation; this extraction does not decide it.

## 5. Pending requests, durable results, and manual recovery

### P §4.2 — FR-8: Show working status during generation (verbatim)

> The UI must show a clear progress or working message while Candidate Copilot retrieves and synthesizes an answer.
>
> **Acceptance / Planning Notes:**
> - The Recruiter can tell the app is working during normal multi-second LLM latency; the indicator must not invent backend progress stages.
> - V1 presents a complete result after checks and durable recording, not unvalidated token-by-token streaming. Answers and their evidence are recorded together; a failed finalization leaves the original admitted question without a partial answer.
> - A network interruption or browser timeout does not imply the question failed. Preserve the pending question and offer manual recovery without duplicating its submission.
> - A received, recorded recoverable technical failure may show a small “Réessayer” button that explicitly submits the same text as a new turn. A normal answer, partial answer, business refusal, or clarification does not get this technical retry action.
> - There are no automatic processing retries, whether in the browser or backend. Waiting and recovery are bounded as specified in §5.2.

### P §4.5 — FR-18: Start a new Conversation for returning Visitors (verbatim)

> V1 must start a new Conversation with a new Conversation UUID when a Visitor returns in a new visit/session.
>
> **Acceptance / Planning Notes:**
> - V1 does not restore previous Conversation history across new visits/sessions; reloading the same active tab/session is different and restores the server-recorded transcript and processing state.
> - While the outcome of a submission is unknown, retain just that pending question and its submission identity temporarily in the current session, not a browser-owned transcript.
> - After reload, an active turn may be observed through bounded read-only checks. Stop on completion, expired processing, communication failure, or the observation limit; never automatically resubmit a question. Observation errors offer “Vérifier à nouveau” rather than falsely claiming generation failure.
> - Inaccessible/expired/deleted Conversations show a neutral unavailable message and may offer a new Conversation. Do not silently recreate the old one or send its pending question into the new one.
> - The product avoids account-like tracking or identity linkage in V1.

### P §5.2 — Performance and Reliability (verbatim)

> - Normal answers may take several seconds due to LLM use.
> - Initial configurable limits are a 30-second total backend processing budget and 45-second browser wait. Expiry of the browser wait is an unknown outcome, not proof the backend stopped; retries remain manual.
> - Following a reload only, read-only observation of an active turn runs approximately every 3 seconds for at most 45 seconds, stopping on error or terminal state. It must not trigger another generation or indefinitely show a spinner.
> - The UI must show a meaningful working state during answer generation, preserving the draft and preventing competing sends while processing or its state remains unknown.
> - Raw crashes, stack traces, or broken states must not be visible to recruiters.
> - Failure states must be professional, safe, and understandable.

**Extraction distinction:** FR-6 disables Send, not expressly text editing. §5.2 requires draft preservation but does not define an editable next-turn draft. FR-8/18 preserve the admitted/pending question and its identity; they do not define resource-scope fields in that pending request. Recovered submission and new-turn retry are explicitly different operations.

## 6. Privacy, security, limits, and deletion constraints to preserve

### P §4.5 — FR-16: Disclose conversation retention, review, and processing (verbatim)

> The app must tell Visitors that Conversation content and associated runtime data may be stored and manually reviewed by BC, that they are deleted within 90 days of Conversation creation, and that questions may be processed through the AI/provider path chosen during implementation. The separate, minimal Deletion Request audit retained indefinitely must be disclosed explicitly.
>
> **Acceptance / Planning Notes:**
> - The disclosure is visible before or during use, not hidden in a long policy only.
> - Visitors understand that the 90-day maximum runs from Conversation creation, not the date of their latest message.
> - Disclose the indefinite audit exception: Deletion Request identity, historical Conversation UUID when known, status, and lifecycle timestamps only; no Conversation text, excerpts, tokens, or Visitor identity in that audit.
> - Explain the minimal temporary IP-based abuse counter separately from Conversation storage; it is not an account or durable browsing fingerprint.
> - Before launch, the privacy copy must reflect the real storage and AI/provider processing path.
> - The app must not intentionally include private source material, secrets, unnecessary Visitor identifiers, or unrelated personal data in model prompts.

### P §4.5 — FR-17: Associate conversations with a visible UUID (verbatim)

> Each Conversation must have a Conversation UUID used for diagnostics, Deletion Requests, and Visitor support references. The Conversation UUID must be visible from the interface.
>
> **Acceptance / Planning Notes:**
> - BC can identify the Conversation associated with a Deletion Request or support reference.
> - Visitors can reference their current Conversation without needing BC contact details.
> - The UUID does not expose BC contact details or Visitor identity by itself.

### P §4.5 — FR-19: Provide in-app Deletion Request submission (verbatim)

> The app must allow the Visitor to submit a Deletion Request from the interface for the current Conversation UUID.
>
> **Acceptance / Planning Notes:**
> - Deletion requests are handled manually by BC.
> - A Deletion Request must initially be persisted with the current Conversation UUID and request timestamp. Repeated submission returns the same request without resetting its date.
> - Deletion Request states are `open` and `handled`. Mark handled only after confirmed deletion or confirmation that the data is already gone; an unsuccessful deletion leaves the request open.
> - Submission remains available during generation and after the message limit is reached. Actual deletion waits while processing is active on that Conversation, without blocking cleanup of other Conversations.
> - Minimal audit metadata survives Conversation deletion indefinitely as disclosed in FR-16; the historical Conversation UUID may be absent but should be retained when known. No content or credentials belong in this audit.
> - Deletion Requests must be visible to BC through the same controlled access/export path used for retained Conversations.
> - BC must define a manual review cadence before public recruiter use.
> - UI confirmation must honestly state that deletion is manual and not immediate.
> - V1 does not require immediate automatic user-triggered deletion.
> - V1 does not require outbound email.

### P §4.5 — FR-20: Automatically delete conversation data within 90 days (verbatim)

> Raw and derived Conversation content/runtime data must be deleted no later than the Conversation creation timestamp plus 90 × 24 hours, calculated in UTC. The narrow Deletion Request audit exception is defined in FR-16/FR-19.
>
> **Acceptance / Planning Notes:**
> - New messages and recovery attempts never extend the deadline; newer associated records may therefore be kept for less than 90 days.
> - Automatic cleanup starts early enough to account for scheduling, an active treatment, and operational recovery. Deferring a busy Conversation must not permit retention beyond the deadline.
> - Raw/derived data and deletion-completion state must not be left partially removed/updated after failure.
> - Loss of access is not proof of deletion; overdue or failed cleanup must be operator-visible and recoverable. Architecture must account for all associated messages, answers, excerpts, processing metadata, and diagnostics.

### P §5.1 — Simplicity and Cost (verbatim)

> - V1 should be the simplest implementation that satisfies this PRD.
> - V1 should avoid overengineering and avoid semantic/vector retrieval unless simpler retrieval fails evaluation.
> - V1 must cost zero euros and avoid mandatory paid services.
> - V1 should rely on a shared, unlisted link rather than accounts or broad public discovery.
> - Initial configurable limits are 1,000 characters per user message with a visible counter and matching server enforcement, and 20 admitted logical user messages per Conversation. Never silently truncate user input.
> - Clarification replies and explicit new submissions after recorded failures consume a turn; recovery of the same submission, rejected messages, transcript reads, and Deletion Requests do not consume another turn.
> - Limit creation to 10 Conversations per IP per UTC calendar day using a short-lived pseudonymous counter, without linking Conversations to a durable Visitor profile. Explain when creation can resume; do not block existing Conversations or deletion controls solely because this creation limit is reached. Shared corporate IPs are a known trade-off and limits must remain configurable.
> - No automatic processing retry, paid overage, or fallback to another provider. Confirmed pre-admission quota unavailability preserves the draft without consuming a turn; an admitted turn that receives a provider rejection ends in a controlled recorded failure when possible.
> - Document and test actual plan quotas/billing before launch; only display a recovery time when it is known. The product must fail professionally rather than assume an exhausted free quota permits continued use.
> - V1 should not depend on outbound email unless a free, simple, reliable option is later confirmed and explicitly accepted.

### P §5.3 — Security and Privacy (verbatim)

> - Only public source material may enter the deployed Public Knowledge Base.
> - Conversations must be isolated from each other.
> - V1 must not use non-essential analytics or tracking.
> - V1 must not create an account-like identifier across visits.
> - The Conversation UUID must not be tied to Recruiter identity by the app.
> - App-retained Conversation data is limited to message/answer content and evidence, identifiers and timestamps needed for correlation/recovery, and minimal diagnostics. These follow FR-20; the indefinitely retained Deletion Request audit contains only the separate identifiers/status/timestamps disclosed in FR-16.
> - Temporary pseudonymous IP counters support creation limits only, expire after their useful window, and are not stored as Visitor identifiers in Conversations. Avoid unnecessary raw IP logs or browser fingerprinting.
> - Conversation access credentials must travel securely, never appear in URLs/logs/model prompts, and authorize only their own Conversation. Model-generated text must not execute as trusted HTML or script.
> - Any unavoidable host/provider logs must be understood separately from app-retained Conversation data before launch.
> - BC contact details must not be displayed publicly in V1.
> - Operational access to retained Conversations and Deletion Requests must be controlled, even if simple.
> - The system must preserve enough diagnostic visibility for BC to understand Recruiter questions, malfunctions, misuse, and unsafe prompts during the retention window.

### P §4.4 — refusal/security requirement passages (verbatim extracts)

**FR-12: Refuse value judgments and redirect to evidence**
> When asked for a value judgment, Candidate Copilot must state that it cannot judge BC and then redirect to documented examples relevant to the topic.

**FR-13: Refuse commitments, intentions, and decisions on BC's behalf**
> Candidate Copilot must not answer as if it represents BC's current intentions, commitments, availability, desired role, compensation expectations, offer acceptance, or hiring decisions.

**FR-14: Refuse non-professional personal or sensitive topics**
> Candidate Copilot must refuse questions about religion, sexuality, health, politics, family situation, origin, protected characteristics, or other sensitive personal subjects that are not legitimate professional documented topics.

**FR-15: Resist prompt-injection and rule-bypass attempts**
> Candidate Copilot must not comply with requests to ignore its boundaries, reveal hidden instructions, fabricate evidence, expose private data, or answer outside the Public Knowledge Base.
>
> **Acceptance / Planning Notes:**
> - Adversarial prompts are handled safely.
> - The system preserves grounding and refusal rules even when challenged.

**FR-4: Avoid contact or recruiting-channel UI** (P §4.1)
> V1 must not include a contact CTA, contact button, public BC contact details, or a message instructing recruiters to continue via another channel.

### P §5.4 — Language (verbatim)

> - The V1 UI is French-only.
> - Answers should follow the language of the Recruiter's question where practical.
> - Source Excerpts remain in the original source language.

### P §5.5 — Delivery and Operations (verbatim)

> - Validate changes in an isolated preview before BC manually promotes the evaluated revision to production. Preserve source-version traceability and run post-deployment checks.
> - Delivery/Operations stories must include a usable operator runbook as acceptance work: deployment, migration compatibility, rollback, deletion/purge handling, and provider incidents. The runbook documents required secret configuration, never secret values.
> - A deployment or rollback must not discard newer Conversations or Deletion Requests. Implementation must define recovery for partially completed deployments without claiming cross-service atomicity.
> - CI/deployment quotas and actual hosting/provider billing must preserve the zero-euro constraint; detailed tooling and procedures belong to the architecture and implementation stories.

## 7. Existing evaluation / acceptance obligations

### P §4.6 — FR-21: Maintain a predefined launch test set (verbatim)

> BC must define and run a minimal test set before public deployment.
>
> **Acceptance / Planning Notes:**
> - Tests include normal project/skill questions.
> - Tests include missing-information questions.
> - Tests include value-judgment questions.
> - Tests include sensitive personal questions.
> - Tests include prompt-injection or rule-bypass attempts.
> - Tests include long or ambiguous questions, clarification and its resolution on the next turn, French/English language changes, and corporate terms or paraphrases that differ from source vocabulary.
> - Deterministic tests verify response contracts, citation references and source integrity, isolation, and controlled failure paths; mocked model responses test application behavior, not semantic model capability.
> - Separate evaluations of actual configured model outputs assess citation support, answer completeness, appropriate refusal/redirection, clarification relevance, and actual response language on representative questions. Human inspection assesses meaning; sampled success is not a guarantee for every future response.
> - Tests verify privacy disclosure including audit/counter exceptions, visible Conversation UUID, idempotent Deletion Request state, and creation-based 90-day cleanup, including busy-conversation deferral and failure visibility.
> - Tests verify single active processing, atomic answer/evidence persistence, duplicate/conflicting requests, interrupted processing, manual recovery versus explicit new-turn retry, and reload observation without automatic processing retries.
> - Tests verify the 1,000-character boundary, 20-turn accounting, 10 new Conversations per IP per UTC day, generation/browser time limits, professional failures, and safe free-quota behavior. Same-submission recovery and reads do not consume extra logical turns.
> - Provider quota, rate-limit, reset, and billing cases must be derived from current official Cloudflare documentation during implementation and tested in the adapter; no assumed universal error code or reset schedule.
> - Tests include a manual Public Knowledge Base launch review confirming that deployed source files are intended to be public and contain no obvious secrets, private notes, private contact details, or unintended sensitive personal data.

### P §4.6 — FR-22: Block launch on critical failures (verbatim)

> Candidate Copilot must not be shown to recruiters if the minimal test set reveals critical grounding, privacy, refusal, abuse-control, free-quota, source-safety, deletion-workflow, or visible-crash failures.
>
> **Acceptance / Planning Notes:**
> - Launch readiness is based on professional trust, not feature quantity.
> - Known critical failures are fixed before recruiter use, including those found in real-model evaluations; passing deterministic checks alone is insufficient. Acknowledging the limits of automatic semantic verification does not relax these acceptance requirements.
> - A launch test fails critically if the system fabricates unsupported claims, exposes or deploys private material, answers prohibited personal/sensitive questions, loses or hides Deletion Requests, shows raw provider/runtime errors, hangs without recovery, or cannot safely handle exhausted free quota.

## 8. Authoritative original brief passages (verbatim)

### B — The Product Experience

> A recruiter visits a public site without creating an account. Before any interaction, the experience should make clear:
>
> - what Candidate Copilot is and that BC created it;
> - what kinds of questions it can answer;
> - which experiences, projects, and capabilities may be worth exploring;
> - why its answers are credible;
> - how conversation data is handled.
>
> The landing experience is more than an empty chat box. Candidate highlights, selected projects, and suggested questions provide light guidance, but they do not replace conversation as the exploration path. Meaningful exploration happens through natural-language conversation. The interaction itself should require no tutorial. Recruiters ask a question, receive a structured answer with inspectable citations, and may follow up or move to another topic. Candidate Copilot itself may be one of the documented projects that recruiters ask about.

### B — Product Principles

**Documentary evidence, not delegated representation**
> Candidate Copilot retrieves and synthesizes BC's public documentation. It does not represent BC, make decisions or commitments, or infer undocumented intentions on BC's behalf. Answers must be grounded in the public knowledge base and cite their sources. When source support is absent or insufficient, the product abstains rather than guessing. Judgments remain with the recruiter, while intentions and decisions remain with BC.
>
> Accuracy, completeness, and traceability matter more than conversational persuasion. An exact and complete answer may be somewhat mechanical; the product does not need to generate a personalized evaluative summary.

**Public by construction**
> Only material explicitly designated as public may enter the deployed product. Private candidate material must not be deployed and then hidden through prompts or runtime filtering. Public Markdown remains the human-readable, version-controlled source of truth; search indexes are derived from it.

**Trust before novelty**
> The interface must feel professional, polished, and dependable before a recruiter sends a message. Session isolation, data-use disclosure, citations, strict abstention, and reliable availability are part of the product experience, not background implementation concerns.

**Simplicity before retrieval sophistication**
> The MVP should use the simplest retrieval approach that testing shows to be adequate: structured Markdown and section-level lexical search, with explicit grounding and abstention. Semantic or vector retrieval is justified only if evaluation reveals material coverage failures.

### B — MVP Scope (directly relevant inclusion / exclusion extracts)

> - a public, anonymous, recruiter-facing web experience;
> - clear authorship, purpose, candidate highlights, and light question prompts;
> - multi-turn natural-language questions about professional experience, projects, outcomes, technical skills, working methods, and documented design decisions;
> - grounded answers with inspectable citations and explicit handling of partial or missing evidence;
> - a deployed runtime containing only the public candidate knowledge base;
> - isolated visitor conversations, disclosure of retention and manual review, server-side deletion triggered by the user, and automatic deletion of raw and derived conversation data within 90 days;
> - controlled operational access or secure manual export for BC to review retained conversations, without an administration interface.

**Superseded detail:** The “server-side deletion triggered by the user” phrase is retained here as an exact historical extract. M's explicit override and P FR-19 now require manual handling of in-app Deletion Requests, not immediate automatic deletion.

Exclusions:
> - recruiter-specific personalization or inference from the visitor's source;
> - private candidate content;
> - personalized candidate assessment or evaluative summaries;
> - an administration dashboard or automated conversation analysis;
> - a reusable or multi-candidate platform;
> - semantic or vector retrieval without evidence that simpler search is inadequate.

### B — Open Questions and Deferred Detail (relevant extracts)

> - the exact landing-page hierarchy, highlights, prompts, and trust disclosures;
> - refusal language, evidence thresholds, and handling of partially answerable questions;
> - evaluation cases for grounding, citation coverage, abstention, completeness, and adversarial prompts;
> - anonymous session mechanics, access controls, auditability, deletion propagation, backups, and sensitive information entered by visitors;
> - abuse prevention, rate and cost limits, response-time targets, and availability expectations;

## 9. Prior decisions and recorded reasons

The following are exact M passages. A rationale is not added where M provides none.

### Project / landing / scope decisions

> - (decision) Stakes calibrated as serious public recruiter-facing tool, with explicit principle to keep MVP as simple as possible and avoid overengineering
> - (decision) Product impression goal: recruiter should perceive Candidate Copilot as finished, functional, secure, and answering questions as expected rather than as a flashy concept
> - (decision) MVP capability blocks confirmed: guided landing, Q&A conversation, grounding/citations, refusals/boundaries, session privacy; landing should provide examples/guidelines without constraining user questions
> - (decision) For V1, answer citations may show source excerpts/snippets in the response; full public source pages/cards are deferred for later consideration
> - (decision) Landing page should be minimal, show 2-3 projects, and avoid targeted role or job-type positioning so it remains open to all recruiters
> - (decision) Landing projects are not selected yet; PRD should require 2-3 BC-selected documented projects before launch
> - (decision) Open item deferred to UX/launch copy: BC selects 2-3 landing projects and exact French trust/privacy/refusal copy before public launch
> - (decision) Open item deferred to architecture: choose simplest sufficient retrieval approach and controlled access/export mechanism for retained conversations and deletion requests before implementation/launch

### Privacy / retention / returning-session decisions

> - (override) Privacy deletion requirement changed from user-triggered server-side deletion to user-submitted deletion request handled manually by BC, to preserve diagnostic visibility into malfunction triggers; 90-day automatic deletion remains
> - (decision) Deletion requests must be submitted from the app interface using the conversation UUID; BC contact details should not be exposed publicly; users must understand conversations are stored for at most 90 days and may request history deletion
> - (decision) BC reviews retained conversations primarily to see recruiter questions in general, and also for documentation gaps, misuse, bugs, and answer-quality problems
> - (event) User raised access-control concern about avoiding data leakage outside France and asked whether returning users should see history or receive new conversation UUIDs
> - (decision) V1 access should rely on a shared/unlisted link rather than broad discoverability; no recruiter account is required
> - (decision) Returning visitors should start a new session with a new Conversation UUID; V1 does not restore previous conversation history
> - (decision) Conversation UUID should be visible in the interface so visitors can reference a session for deletion requests or complaints; this is low-cost and useful for support

**Interpretation caution:** The France-related item is an event/concern, not a recorded France-only processing/storage decision. P instead requires disclosure of the real storage/provider path. The earlier broad “does not restore previous conversation history” decision is qualified by the later reload decision and current FR-18's same-active-tab/session exception.

### Clarification / grounded semantics decisions

> - (decision) Approved clarification-first behavior for unresolved question ambiguity, per-turn answer language honoring explicit language requests, and honest missing-evidence responses; implementation details (classifier/catalog/FTS/3000-token history) belong in the architecture spine. Binds FR-6/7/11/21; avoids irrelevant answers from guessed intent.
> - (decision) Keep grounded, safe, complete answers as product requirements, but distinguish mechanical runtime contract checks from semantic correctness, which relies on LLM behavior and real-model sample evaluation. Deterministic tests or valid citations alone cannot prove meaning; known critical grounding/privacy/refusal failures remain launch blockers under FR-22. Clarifies FR-10/21/22 without relaxing acceptance criteria.

### Pending / recovery / limits / delivery decisions

> - (decision) Performance expectation: responses may take several seconds and up to about 30 seconds for deeper retrieval/synthesis; UI must show meaningful progress/status so the recruiter sees the app working; visible crashes are unacceptable in recruiting context
> - (decision) Cost requirement tightened: V1 must cost zero euros, not merely where possible
> - (decision) Consolidate approved concurrency/recovery UX, nonstreaming complete results, one admitted message retained after crash, no automatic processing retries, same logical request recovery vs explicit new-message retry of persisted failure, and bounded reload observation. Preserve existing FR IDs and leave HTTP/lease/SQL mechanics to architecture. Binds FR-5/6/8/18/21.
> - (decision) Approved product limits:1000 characters per message,20 admitted turns,10 conversation creations/IP/UTCday, configurable. Retention is creation+90*24hoursUTC for raw/derived conversation data, no activity extension; indefinite deletion-audit exception is limited to identifiers/status/timestamps and must be disclosed. Delete-request submission stays available during generation; actual deletion waits for an active lease. Binds FR-16/19/20 and abuse NFRs.
> - (decision) Delivery acceptance must include controlled preview-to-production promotion, real-model evaluation evidence, post-deploy checks, rollback procedure and operator runbook; no pipeline or runbook implementation in this documentation pass. Cloudflare quota/reset/billing facts remain to verify from official docs during implementation, preserving zero-euro constraints and safe failures.
> - (change) Consolidated approved recovery/concurrency, nonstreaming delivery, reload observation, message/turn/IP limits, deletion-audit exception, exact creation-based90day retention, and delivery runbook acceptance in existing FRs/NFRs; addendum links architecture companions for technical detail. Stable FR-1..22 preserved. Documentation-only checks completed; provider specifics deliberately deferred.

## 10. Addendum status and technical boundary (verbatim)

A:

> The original product addendum notes have been incorporated into `prd.md`. Technical decisions from the subsequent architecture coaching are recorded in:
>
> - [Architecture spine](../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md): LLM/retrieval contracts, 3,000-token history budget, source SHA provenance, data model, and cross-component invariants.
> - [Runtime and delivery contracts](../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md): processing leases and deadlines, atomic persistence, HTTP/idempotency/reload behavior, usage controls, retention/deletion mechanics, and CI/CD story obligations.
>
> These linked contracts preserve the implementation detail without duplicating it in the PRD. Exact Cloudflare quota/rate-limit/reset/billing behavior, purge scheduling/margins, workflow YAML, and the operator runbook remain implementation acceptance work; this consolidation does not implement them. Decision history and superseded alternatives remain in the corresponding `.memlog.md` files.

## 11. Likely reconciliation conflicts / questions (not decisions)

1. **Resource browsing versus lightweight selection — FR-3 / FR-10 / §6 / §7.2.** Existing V1 projects are 2–3 BC-selected factual landing highlights; full source-card/document browsing is excluded. A richer project/resource UI may require expressly defining what remains non-browsing and what changes scope.
2. **Optional resource scope versus free conversation — FR-2 / FR-6 / UJ-1.** Mandatory category/resource selection or a rigid flow would conflict with asking freely, refining, and changing topics. None of these sources establishes a user-selected evidence scope.
3. **Pending edit versus same-request identity — FR-6 / FR-8 / FR-18 / §5.2.** Send remains blocked while processing or outcome is unknown. Editable future text/selection must not be confused with the already admitted question recovered by its identity. Existing sources do not define editability or scope snapshots.
4. **Refresh versus return privacy — FR-18 / §5.3 / M.** Same active tab/session reload restores server-recorded state; a new visit/session gets a new UUID and no old history. A cross-tab/browser-persistent transcript or account-like linkage would conflict. Exact tab boundaries and selection/draft restoration remain unspecified.
5. **Automatic polling versus automatic processing — FR-8 / FR-18 / §5.2.** Bounded read-only observation following reload is allowed; generation retries/resubmission are never automatic. “Vérifier à nouveau” for unknown/observation failure is distinct from “Réessayer” for a received recorded technical failure, which is a new turn.
6. **Evidence history versus current resources — FR-9 / FR-10 / FR-11 / FR-20.** Historical excerpts retain original text/provenance even if current public files change; absent retrieved evidence is not proof of global absence. A new scope snapshot must not silently rewrite history, bypass public-only sources, or extend retention.
7. **Brief deletion conflict already resolved — B MVP Scope versus FR-19 / M override.** Do not accidentally reinstate immediate user-triggered deletion. Requests stay available during generation/after turn limit; deletion handling is manual, with creation-based automatic purge and minimal audit exception preserved.
8. **Limits and launch tests remain binding — FR-21 / FR-22 / §5.1–§5.3.** New interaction detail cannot remove turn/message/IP limits, isolation, secure credentials, quota-safe failures, real-model evaluation, or recovery/deletion tests. Stable FR IDs are expressly preserved by the recorded consolidation; no independent AC IDs currently exist.
