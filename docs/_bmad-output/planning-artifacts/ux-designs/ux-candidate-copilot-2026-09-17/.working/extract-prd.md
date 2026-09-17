# UX Discovery Extraction — Candidate Copilot PRD

**Source:** `/home/cvc/dev/candidate-copilot/docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md`

## Personas / Users

- **Primary user:** recruiter or recruiting-team member with access during a mid-/late-stage recruitment process; wants to explore BC's documented work more deeply than a static CV allows (§2.1).
- **Visitor:** anonymous app user; expected to be a Recruiter, but privacy/deletion controls apply to any Visitor (Glossary).
- **BC:** author, subject, and operator; maintains the Public Knowledge Base and may inspect retained conversations for recruiter-question insight, documentation gaps, misuse, bugs, or answer-quality problems (§2.1).
- **Non-users for V1:** other candidates; recruiters expecting automated hiring recommendations/fit scores; visitors seeking personal/sensitive/non-professional info; BC as a daily dashboard user (§2.3).

## Key Journeys

- **UJ-1:** Recruiter opens shared unlisted link without account; sees minimal French landing page explaining authorship, Public Knowledge Base grounding, up-to-90-day retention, and Source Excerpts; sees 2–3 selected projects and example-question guidance; asks freely; answer uses question language and includes Source Excerpts (§2.4).
- **UJ-2:** Recruiter asks for a judgment (e.g. “Is BC good at software architecture?”); system says it cannot make a value judgment and redirects to documented examples, decisions, and outcomes (§2.4, FR-12).
- **UJ-3:** Recruiter asks inappropriate personal/sensitive question; system refuses calmly, keeps professional context, and offers documented projects/skills/working methods/decisions instead (§2.4, FR-14).
- **UJ-4:** Visitor opens privacy/deletion control from Conversation interface; submits Deletion Request tied to Conversation UUID; understands max 90-day retention and manual handling by BC (§2.4, FR-19).

## Information Architecture Implied by Requirements

- **Landing page:** product purpose/authorship, trust explanation, privacy notice, example questions/guidelines, lightweight capability cues, and 2–3 selected documented projects with short factual highlights (§4.1, §7.1).
- **Conversation interface:** free-form multi-turn Q&A, visible working state, structured answers, Source Excerpts, visible Conversation UUID, privacy/deletion control, deletion-request submission (§4.2–§4.5).
- **Answer content model:** distinguish supported claims, partial evidence, and missing/unavailable information; show excerpts/snippets rather than full source pages/cards in V1 (FR-10, FR-11).
- **Privacy/deletion information:** visible before or during use; must disclose storage/review by BC, 90-day deletion from Conversation creation, AI/provider processing path, temporary IP abuse counter, and indefinite minimal Deletion Request audit exception (FR-16).
- **Excluded IA/UI in V1:** no contact CTA/details, no recruiting-channel handoff UI, no account/login/onboarding, no admin dashboard, no full source-card/document browsing, no automated conversation analysis, no multi-language UI (§4.1, §6, §7.2).

## States / Errors / Limits Affecting UX

- **Processing state:** clear progress/working message during retrieval/synthesis; must not invent backend progress stages; complete result appears only after checks and durable recording (FR-8).
- **Input/concurrency:** send disabled during processing; only one turn processed at a time; concurrent submissions rejected without adding a message; reading and Deletion Request submission remain available (FR-6).
- **Clarification:** if context ambiguity materially changes subject/intent, system asks a short clarification before searching or answering; if older context unavailable, ask again rather than invent (FR-6).
- **Recovery:** network interruption/browser timeout means unknown outcome, not failure; preserve pending question and offer manual recovery without duplicate submission; reload observation is read-only and bounded; no automatic retries (§4.2 FR-8, FR-18, §5.2).
- **Retry affordance:** recorded recoverable technical failure may show small “Réessayer” button that submits same text as a new turn; normal answers, partial answers, business refusals, and clarifications do not get this action (FR-8).
- **Unavailable conversation:** inaccessible/expired/deleted Conversations show neutral unavailable message and may offer new Conversation; do not silently recreate old one or submit pending question into new one (FR-18).
- **Refusals:** value judgments, commitments/intentions/decisions on BC's behalf, sensitive personal topics, prompt-injection/rule-bypass attempts (FR-12–FR-15).
- **Missing evidence:** absent/weak/partial support is stated explicitly; no suitable passage is reported as insufficient retrieved evidence, not proof the information does not exist anywhere (FR-11).
- **Deletion Request states:** `open` and `handled`; repeat submission returns same request without resetting date; confirmation must state deletion is manual and not immediate (FR-19).
- **Limits:** 1,000 characters per user message with visible counter and matching server enforcement; never silently truncate; 20 admitted logical user messages per Conversation; 10 new Conversations per IP per UTC day with explanation of when creation can resume (§5.1).
- **Failure presentation:** raw crashes, stack traces, raw provider/runtime errors, broken states, hangs without recovery, and visible crashes are unacceptable; failures must be professional, safe, understandable (§5.2, FR-22).

## Accessibility / Platform Requirements

- No explicit accessibility requirements are stated in the PRD.
- Platform is an anonymous public web app reached through a shared, unlisted link; no account, login, onboarding, or account-like tracking for V1 (FR-5, FR-18, §7.1).
- V1 UI is **French-only**; answers should follow the Recruiter question language where practical; Source Excerpts remain in original source language (§5.4, FR-7).
- App should not be broadly discoverable through normal public indexing (FR-5).
- V1 must avoid non-essential analytics/tracking and durable visitor identity linkage (§5.3).
- BC contact details must not be displayed publicly in V1 (§5.3).

## Microcopy / Tone Hints

- Overall product should feel finished, functional, secure, reliable, simple, professional, not flashy/persuasive/artificially impressive (§1).
- Landing copy must explain Candidate Copilot is an interactive portfolio created by BC and answers from public documentation; must not present it as an autonomous representative of BC (FR-1).
- Guidance should help recruiters start while making clear they may ask freely within professional scope; capability cues must not imply a target role/job type (FR-2).
- Refusals should be calm and professional, redirecting to documented projects, skills, working methods, decisions, examples, and outcomes (UJ-2, UJ-3, FR-12, FR-14).
- Privacy copy must be visible before/during use and accurately reflect real storage and AI/provider processing path before launch (FR-16).
- Deletion confirmation must honestly state manual, non-immediate deletion handling (FR-19).
- Rate/creation-limit copy should explain when creation can resume when known (§5.1).

## Acceptance Criteria That Affect UX

- First-time Visitor can understand product purpose before submitting a question; product is not framed as BC's autonomous representative (FR-1).
- Example questions and capability cues help start exploration without fixed categories or rigid guided flow (FR-2).
- Project highlights remain factual/evidence-oriented and do not state target role/job type (FR-3).
- Recruiter can ask broad questions, refine/change topic, and remain focused on documented professional material up to the 20 admitted-message limit (FR-6).
- Answers include inspectable Source Excerpts; V1 may use excerpts/snippets rather than full source pages; historical excerpts retain source-version provenance (FR-10).
- Unsupported, partial, or unavailable information is explicitly distinguished (FR-11).
- Privacy comprehension is a success metric: Visitor can understand retention, BC review, in-app deletion request, and deletion within 90 days (SM-4).
- Launch must be blocked for critical UX-visible failures such as exposing private material, answering prohibited personal questions, losing/hiding Deletion Requests, raw provider/runtime errors, hangs without recovery, or unsafe free-quota exhaustion (FR-22).
- Pre-launch tests must cover normal/missing-info/value-judgment/sensitive/prompt-injection questions; long or ambiguous questions; clarification; French/English language changes; privacy disclosure; UUID visibility; deletion request state; limits; recovery; reload observation; and failure paths (FR-21).

## Open Questions from PRD

- Which 2–3 documented projects should appear on the landing page? (§10)
- What exact French copy should be used for landing-page trust, privacy, and refusal messages? (§10)
- Does lexical retrieval provide sufficient evidence on representative questions, and what evaluation result would justify semantic/vector retrieval? (§10)
- What exact operator commands/runbook will implement controlled local access, deletion, purge, export, and deployment procedures? (§10)
