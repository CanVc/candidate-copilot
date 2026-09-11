# PRD Quality Review — Candidate Copilot

## Overall verdict
The PRD has a clear, product-specific thesis: a zero-euro, public, recruiter-facing conversational portfolio that is useful because it is grounded, bounded, and inspectable rather than persuasive. It is strong on scope honesty, strategic coherence, and shape fit, but not fully decision-ready for green-light implementation because several launch-gating choices remain open without acceptance thresholds or decision rules.

## Decision-readiness — adequate
The PRD states real choices as choices: V1 is a “personal product and a product hypothesis,” recruiter demand “is not yet validated” (§1), the product must “cost zero euros” (§1, §5.1), and vector/semantic retrieval is deferred “unless simpler retrieval fails evaluation” (§5.1, §7.2). It also refuses common expansion pressure through concrete non-goals: no contact CTA, no admin dashboard, no source-card browsing, no multi-candidate platform (§6–§7.2).

The weakness is that several launch blockers remain framed as open questions rather than decision-ready criteria. This is acceptable for a draft PRD, but a decision-maker could not yet approve implementation without resolving evaluation, deletion, operational access, retrieval sufficiency, and abuse-control choices.

### Findings
- **high** Launch-gating decisions are open without decision rules (§10; addendum) — The PRD asks “What exact minimal pre-launch test set and pass/fail threshold?”, “What simple retrieval approach is sufficient for V1?”, “What deletion process ensures manually requested deletion and automatic 90-day deletion,” and “Which specific zero-euro abuse/rate-limit controls” (§10.3–§10.7). The addendum similarly lists “Additional ideas, if later needed” for security controls rather than choosing a minimum. These are not minor implementation details because FR-20–FR-22 and SM-1 depend on them. *Fix:* Convert each launch-gating open question into either a V1 decision, an explicit pre-build decision checkpoint, or a measurable acceptance criterion.

## Substance over theater — strong
The PRD is not padded with generic PRD furniture. Personas are minimal and functional: the Recruiter explores documented work, while BC is explicitly the “author, subject, and operator” (§2.1). The Vision is product-specific, especially the rejection of being “flashy, persuasive, or artificially impressive” (§1). NFRs are mostly tailored to the product’s actual constraints: zero euros, unlisted link, no indexing, 90-day deletion, visible UUIDs, no BC contact details, and professional failure states (§4.5, §5).

### Findings
No substantive findings.

## Strategic coherence — strong
The PRD has a coherent thesis: Candidate Copilot should demonstrate BC’s work through grounded recruiter Q&A, with evidence and boundaries as the trust mechanism (§1, §4.3, §4.4). Feature priority follows that thesis: landing guidance, conversation, source excerpts, refusals, privacy controls, and pre-launch evaluation all support the same product arc rather than reading like unrelated backlog items.

The success metrics mostly validate the thesis rather than vanity activity. SM-2 requires “genuinely exploratory Conversation” rather than volume, while counter-metrics explicitly reject optimizing for “conversation volume,” “persuasion,” or “feature breadth” (§8).

### Findings
No substantive findings.

## Done-ness clarity — adequate
Most FRs include concrete consequences, and many requirements are testable: visible UUIDs (§4.5 FR-17), no contact CTA (§4.1 FR-4), 90-day deletion (§4.5 FR-20), no account requirement (§4.2 FR-5), language behavior (§4.2 FR-7), and refusal classes (§4.4 FR-12–FR-15). This is enough for downstream story creation to start.

However, the PRD leans on a future launch test set to define answer quality, retrieval sufficiency, and critical failure thresholds. Those areas are central to whether the product works, so the lack of concrete acceptance criteria materially limits implementation readiness.

### Findings
- **high** Answer-quality and launch-test thresholds are underspecified (§4.3 FR-10–FR-11; §4.6 FR-21–FR-22; §10.3) — FR-10 requires excerpts “sufficient for the Recruiter to inspect why the answer was produced” and answers “structured enough” to distinguish support levels, while FR-22 blocks launch on “critical grounding, privacy, refusal, or visible-crash failures.” The exact “minimal pre-launch test set and pass/fail threshold” is still open (§10.3). *Fix:* Define minimum test cases, pass/fail rules, and concrete examples of acceptable vs unacceptable grounded answers/refusals before story breakdown.
- **medium** Session semantics for returning visitors are ambiguous (§4.5 FR-18) — FR-18 says V1 starts a new Conversation “when a visitor returns in a new visit/session,” but also says the “current browser tab/session” may remain visible. Engineers still need to know whether session boundaries are tab lifetime, browser session storage, inactivity timeout, cookie lifetime, or server-side expiry. *Fix:* Specify the V1 session boundary and UUID lifecycle in product terms.
- **medium** Operational NFRs use qualitative bounds where measurable ones are needed (§5.1–§5.2; addendum) — “basic request throttling where available,” “safe behavior when any free quota is exhausted,” “stable enough,” and failure states that are “professional, safe, and understandable” are directionally useful but not testable. *Fix:* Add minimum acceptable behaviors for quota exhaustion, rate limiting, indexing prevention, and visible error states.

## Scope honesty — strong
The PRD is unusually explicit about what V1 will not do. Non-users (§2.3), Non-Goals (§6), and Out of Scope (§7.2) all reinforce the same boundaries: no automated hiring judgment, no BC commitments, no contact UI, no admin product, no multi-candidate platform, no source browser, and no advanced retrieval unless evaluation justifies it.

Open items are also surfaced rather than hidden. The PRD admits recruiter demand is unvalidated (§1), leaves project selection open (§4.1 FR-3, §10.1), and tracks launch decisions in §10 instead of pretending they are solved.

### Findings
No substantive findings.

## Downstream usability — adequate
The PRD is generally extractable for UX, architecture, and story creation. FR IDs are contiguous from FR-1 through FR-22, UJs have explicit protagonists, Success Metrics cross-reference FRs, and the Glossary defines the important domain nouns: Public Knowledge Base, Source Excerpt, Conversation UUID, Deletion Request, Out-of-Scope Question, and V1 (§3).

For a chain-top PRD, the remaining concern is terminology precision around actors and operational flows. This will not block downstream work, but it can cause small story and UX ambiguities.

### Findings
- **low** Actor terminology drifts between Recruiter and Visitor (§2.1, §2.4 UJ-4, §4.5, addendum) — The primary user is a “Recruiter,” but privacy/deletion requirements switch to “visitor,” and the addendum mentions “deletion requests and complaints” without a PRD-defined complaint flow. The distinction may be intentional, but it is not captured in the Glossary. *Fix:* Define “Visitor” or standardize on “Recruiter/visitor” for anonymous users, and either define or remove “complaints.”

## Shape fit — strong
The PRD shape fits the product: a public, recruiter-facing personal product with meaningful UX and trust/security constraints. UJs are load-bearing because they demonstrate the core modes of use: exploration, value-judgment redirection, sensitive-question refusal, and deletion request (§2.4). The document is formal enough for downstream architecture and story generation without pretending this is an enterprise platform.

### Findings
No substantive findings.

## Mechanical notes
- FR IDs are contiguous and unique from FR-1 to FR-22.
- UJ IDs are contiguous from UJ-1 to UJ-4, and each journey has a protagonist.
- SM IDs are clear, including counter-metrics SM-C1 through SM-C3.
- No inline `[ASSUMPTION]` tags are present, and §11 says no unresolved inline assumptions are currently present; this round-trips cleanly.
- Minor glossary drift: “Visitor” and “complaints” appear in requirements/addendum but are not glossary terms.
