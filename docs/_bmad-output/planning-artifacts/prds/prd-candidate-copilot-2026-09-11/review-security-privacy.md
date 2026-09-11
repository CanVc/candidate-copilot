# Security, Privacy, Abuse, and Zero-Euro Operational Review

Review scope: `prd.md` and `addendum.md` for a simple recruiter-facing public V1. This review intentionally avoids redesigns, paid services, and complex controls.

## Verdict

**Conditional pass.** The PRD has strong privacy/security intent: public-only knowledge base, visible boundaries, refusal rules, conversation isolation, retention disclosure, deletion requests, no public contact details, and zero-euro simplicity. However, several requirements are still too non-operational to protect a public V1 from predictable abuse, privacy surprises, or promises BC cannot reliably honor. These should be made launch-blocking and testable before public recruiter use.

## Findings

### 1. High — Abuse and free-quota exhaustion controls are not testable enough for a public unlisted app

**Where:** `prd.md` §5.1, §9, §10 Q7; `addendum.md` access restriction note.

**Issue:** The PRD requires zero-euro operation and mentions “basic request throttling where available,” unlisted access, no broad indexing, and safe handling of exhausted free quotas. This is directionally right, but not concrete enough to validate before launch. A shared/unlisted link can still be forwarded, crawled, or abused. If each message triggers LLM work, a small amount of misuse can exhaust free quota, create downtime during a recruitment process, or make BC absorb unexpected operational burden.

**Material impact:** Recruiters could see failures, quota errors, long hangs, or degraded credibility. BC may be forced to disable the app during an active process.

**Minimal zero-euro fix:** Make the minimum abuse controls explicit launch criteria, for example:

- noindex/robots headers or equivalent anti-indexing;
- maximum prompt length;
- maximum turns per conversation or per browser session;
- basic per-IP or per-session request throttling if available on the chosen host/runtime;
- generation timeout and professional failure message;
- explicit “free quota exhausted / temporarily unavailable” safe state with no stack traces or raw provider errors.

These do not require paid infrastructure, but they make the abuse posture testable.

### 2. High — Deletion requests are promised, but the manual operational path is not concrete enough

**Where:** `prd.md` FR-19, FR-20, §5.3, §10 Q5-Q6; `addendum.md` deletion note.

**Issue:** The app promises in-app deletion requests and automatic deletion within 90 days, while saying requests are handled manually and no admin dashboard/email is required. That is acceptable for V1, but the PRD leaves the actual request-handling path open. Without a defined zero-euro workflow, deletion requests can be silently stored but not noticed, or noticed too late, making the privacy control mostly cosmetic.

**Material impact:** A recruiter or visitor may rely on a deletion request that BC does not process. This harms trust and creates a privacy/compliance risk even for a small public product.

**Minimal zero-euro fix:** Define a launch-blocking manual workflow:

- deletion request is persisted with conversation UUID and timestamp;
- request state is visible to BC through the same simple controlled export/access mechanism used for retained conversations;
- BC has a documented review cadence before public use;
- deletion covers raw conversation data and derived/indexed/logged conversation artifacts controlled by the app;
- UI confirmation honestly states that deletion is manual and not immediate.

No outbound email or dashboard is required.

### 3. Medium — External AI/provider data handling is not disclosed or constrained

**Where:** `prd.md` FR-16, §5.3, §9.

**Issue:** The PRD tells visitors that conversations may be stored and manually reviewed by BC, but does not state whether messages may be sent to an external LLM provider or other free service. For a public AI chat app, that is a foreseeable privacy fact. If provider processing/logging is omitted from the UX/privacy copy, the retention disclosure may be incomplete even if BC deletes local records within 90 days.

**Material impact:** Recruiters may enter confidential hiring-context information assuming only BC’s app stores it. BC may overpromise deletion/retention if third-party processing is not considered.

**Minimal zero-euro fix:** Add a requirement that launch privacy copy disclose the actual processing path in plain language once architecture is chosen, including whether questions are sent to an external AI provider. Also require that secrets, private source material, and unnecessary visitor identifiers are not intentionally included in model prompts.

### 4. Medium — Data minimization for anonymous visitors is under-specified

**Where:** `prd.md` FR-5, FR-16 to FR-20, §5.3.

**Issue:** The product is described as anonymous, but the PRD does not define what anonymous means operationally. It does not say whether analytics, cookies, referrers, IP addresses, user agents, or hosting logs are collected or retained. Some infrastructure logs may be unavoidable, but the app should avoid adding extra tracking by default.

**Material impact:** The app could unintentionally become more identifying than expected, especially because recruiter questions may reveal company, role, or hiring-process context.

**Minimal zero-euro fix:** Add a simple data-minimization requirement:

- no non-essential analytics/tracking for V1;
- no account-like identifier across visits;
- conversation UUID is not tied to recruiter identity by the app;
- store only message content, timestamps, UUID, deletion-request state, and minimal diagnostics needed for debugging/abuse;
- document any unavoidable host/provider logs separately from app-retained conversation data.

### 5. Medium — Public Knowledge Base safety depends on discipline but lacks a launch check

**Where:** `prd.md` FR-9, §5.3, §9, §10 Q1-Q4.

**Issue:** The PRD correctly requires that only public Markdown source material enters the deployed knowledge base. The remaining risk is operational: a private note, secret, internal identifier, or overly personal detail could be committed to the public source set by mistake. Because the product is evidence-backed, accidental source exposure would be repeated in answers and excerpts.

**Material impact:** Private BC material or secrets could be exposed publicly and cited as evidence, causing higher harm than a normal static portfolio typo.

**Minimal zero-euro fix:** Add a pre-launch source-review gate to FR-21/FR-22:

- manual review that every deployed source file is intended to be public;
- simple secret/PII scan using local grep or free tooling before deployment;
- test questions that try to elicit private/contact/sensitive information and verify refusal or missing-evidence behavior.

## Positive notes

- The PRD already avoids accounts, public contact details, admin dashboard scope, paid/complex controls, fit scores, and broad public discovery.
- The refusal requirements cover the main recruiter-facing abuse cases: protected characteristics, value judgments, commitments, prompt injection, and unsupported claims.
- The 90-day retention ceiling and visible conversation UUID are appropriate for a simple V1 if the operational workflow is made real.

## Recommended launch blockers

Before recruiter-facing launch, block on these minimal checks:

1. Abuse limits and safe quota-exhausted behavior are implemented and manually tested.
2. Deletion requests are visible/actionable to BC without relying on memory or hidden logs.
3. Privacy copy reflects actual storage and external AI/provider processing.
4. App-level data minimization is documented.
5. Public Knowledge Base source review and private-data/secret scan are completed.
