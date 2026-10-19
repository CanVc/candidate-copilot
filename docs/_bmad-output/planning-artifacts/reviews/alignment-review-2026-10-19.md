---
title: Candidate Copilot — Cross-document alignment review
status: complete
date: 2026-10-19
reviewed_revision: c9cb363
scope: documentation only
language: English
---

# Cross-document alignment review

## Conclusion

The current PRD, approved UX behavior and architecture largely describe the same product. The resource catalogue, active publication, immutable per-question scope, original-scope recovery/retry and canonical historical evidence are covered by the current architecture/runtime contracts. The recurring problem is **documentation synchronization**, not evidence that these contracts are absent or that the architecture needs to be redesigned.

The brief and several cross-document status statements still describe superseded decisions or already-completed contract work. Later user-approved overrides are recorded in the decision logs; the review does not ask BC to make those decisions again or propose reverting them. Synchronize the readable source documents with those decisions, and mark old impact notes as historical/completed rather than leaving an apparently live follow-up.

This is not implementation-readiness or launch approval. No application, D1 migration, browser lifecycle implementation, accessibility check, provider evaluation, deployment or purge was exercised.

## Scope and method

Three independent review lenses ran on one staged, line-numbered corpus: adversarial, edge-case-hunter, and editorial structure. Prose copy-editing was not requested; the verification-gap lens targets implemented code and does not apply here. Review findings were checked against the final documents and their referenced decision logs. Historical reconciliation reports were used only to understand already-approved changes, not as current specifications. Overlapping lens findings are retained and annotated, not counted as independent defects.

### Source aliases

Paths below are relative to `docs/_bmad-output/planning-artifacts/` unless otherwise stated. Line references describe the reviewed snapshot, not future edited files.

| Alias | Source |
|---|---|
| B | `briefs/brief-candidate-copilot-2026-09-10/brief.md` |
| BA | `briefs/brief-candidate-copilot-2026-09-10/addendum.md` |
| P | `prds/prd-candidate-copilot-2026-09-11/prd.md` |
| PA | `prds/prd-candidate-copilot-2026-09-11/addendum.md` |
| H | `prds/prd-candidate-copilot-2026-09-11/architecture-update-needed.md` |
| D | `ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md` |
| U | `ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md` |
| A | `architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md` |
| R | `architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md` |

Supporting sources: the four source workspaces' `.memlog.md` files, `docs/guide-utilisateur.md`, and the PRD's historical `reconcile-authoritative-brief.md`, `reconcile-update-brief.md` and `review-ux-privacy-update-2026-09-30.md` reports. History records evidence of overrides; superseded history is not an additional active contract.

## Authority applied

- The brief establishes product intent, as refined by later explicit user decisions recorded in PRD/UX decision logs.
- The final PRD governs current product requirements; approved UX governs layout, style and settled interaction decisions without claiming production readiness.
- Architecture spine plus runtime companion govern technical contracts. They do not prove implementation.
- Historical impact/extraction/review notes must not override final contracts merely because they remain linked.

## Confirmed synchronization findings

These are grouped for human comprehension, not ranked. An old statement can be contradicted on the page while the intended policy is already resolved in approved decision history.

### S1 — The brief still promises direct visitor-triggered deletion

- **Evidence:** B:70 and BA:19 describe visitor-triggered server-side deletion; P:292–306 and R:268–274 define a manual, non-immediate Deletion Request instead.
- **Disposition:** Approved change, stale upstream wording. PRD `.memlog.md:16` explicitly records the override. Historical `reconcile-authoritative-brief.md` already recognizes it as accepted O1.
- **Consequence:** A reader starting from the final brief can implement or disclose a stronger deletion promise than the chosen product provides.
- **Concrete correction:** Update B/BA to state that visitors request deletion, BC handles it manually, and automatic creation-based 90-day content deletion remains required. Preserve truthful non-immediate UI confirmation.

### S2 — The brief addendum forbids the factual examples that the current refusal policy permits

- **Evidence:** BA:51 says to suggest a new factual question without automatically supplying evidence. P:48,218–224 and A:310–315 allow a judgment refusal followed by sourced examples within the submitted scope.
- **Disposition:** Later approved policy, not a new unanswered product question. PRD `.memlog.md:14` records redirection to documented examples; the original brief decision log records the earlier, stricter behavior.
- **Consequence:** Classifier/generator prompts and evaluation cases derived from different documents can reject each other's expected behavior.
- **Concrete correction:** Reconcile BA with the current approved refusal-plus-factual-redirection policy. Retain the ban on evaluative verdicts, fit assessments and unsupported claims; examples remain strictly scoped and cited.

### S3 — The brief's blanket data deletion wording omits the approved audit exception

- **Evidence:** BA:18–20 requires deletion of raw and all conversation-derived records with no surviving dataset; P:256–268, R:276–278 and A AD-12 explicitly retain a minimal deletion-request audit indefinitely.
- **Disposition:** Approved narrow exception, not permission for retained conversation content. PRD `.memlog.md:44–46` records the decision.
- **Consequence:** Privacy copy or purge acceptance tests derived solely from the brief can contradict the specified audit lifecycle.
- **Concrete correction:** Add the minimal metadata-only audit exception and disclosure requirement to B/BA; keep text, excerpts, scope/display data, tokens and Visitor identity out of the audit.

### S4 — Project discovery wording and stale PRD-override labels describe different baselines

- **Evidence:** B:32–38 describes pre-interaction candidate highlights/selected projects; P:90–109 and U:28–38 place project discovery in an optional on-demand Conversation library. U:36 additionally says the PRD itself is unchanged, although the current PRD already incorporates that UX decision.
- **Disposition:** Project relocation is explicitly approved in PRD/UX decision history; this is not a reason to reintroduce a landing showcase.
- **Consequence:** A future planner may bring back a permanent showcase or treat a completed PRD reconciliation as still required.
- **Concrete correction:** Refresh the brief's discovery summary and change U's historical override wording into a link to the reconciled current FR-2/3. Keep light factual cues, anonymous entry and optional guidance.

### S5 — Several live-looking handoff statements incorrectly imply that Resource/session contracts are absent

- **Evidence:** PA:16–22 says the architecture/runtime have not changed and do not yet specify Resource scope or expanded session state; H:3–5,28–119 describes follow-up against an old architecture snapshot; U:75–83 still describes contract/storage additions as pending and says current POST carries only requestId/question. Current A:28–30,147–157 and R:114–155,195–240 already define them. P:12 is a historically true account of its own update but offers no pointer that this subsequent technical reconciliation is now complete.
- **Disposition:** Update completion/navigation, not the architecture design. The architecture decision log records completed reconciliation and later active-publication clarification.
- **Consequence:** Implementers can follow the old payload/storage whitelist, overlook current contracts or redo already-decided work.
- **Concrete correction:** Link current A/R sections from P/PA/U; label H as historical/completed analysis of a dated snapshot and add a disposition map. Preserve explicit no-implementation/no-validation caveats and outstanding browser proof.

### S6 — Open questions conflate decisions already defined with implementation evidence still missing

- **Evidence:** P:496,500 still assigns mapping/version/invalid-resource policy and session view/lifecycle definition to future architecture. R:34–63,203–240 already defines these policies; R:221–223 explicitly leaves copied/restored-tab detection and storage-denied behavior for supported-browser implementation proof.
- **Disposition:** Split contract-complete from evidence-pending, not a claim of readiness.
- **Consequence:** Stories may duplicate architecture decisions or accidentally close the real browser-lifecycle uncertainty when cleaning up the stale backlog.
- **Concrete correction:** Retain actual BC content/copy/evaluation/runbook tasks; link defined mapping/scope/view-state contracts and separately track browser/session verification and remaining implementation choices.

## Requirement traceability

This is a documentation alignment map, not evidence of implemented or tested behavior. References use the aliases declared in the final report. All FR-1..22 have an architecture allocation; no claim is made that epics, stories, runtime tests or launch evidence exist.

| Brief intent / concern | PRD | UX | Architecture / runtime | Alignment assessment |
|---|---|---|---|---|
| Public personal proof-of-work portfolio; anonymous recruiter use | Vision, FR-1, FR-5, non-goals | Foundation, entry and identity | AD-1/2/9/10/14 | Intent preserved; no multi-candidate/admin expansion. |
| Light guidance and candidate/project discovery | FR-2/3 | Entry card, optional guide, on-demand Resource library | Capability map; AD-17; R §5 | PRD/UX/architecture agree; brief still describes selected landing projects. |
| No delegated representation or persuasive evaluation | FR-4, FR-12..15 | Foundation, Boundaries | AD-5/6; classifier decision table | Core boundary preserved; automatic examples after value refusal conflict with older brief addendum. |
| Multi-turn documentary questions | FR-6 | Composer, turn states, scope flows | AD-15/18; R §1/2/4/5 | Consistent immutable per-message scope, separate next draft, no queue or auto-send. |
| Recruiter language | FR-7 | Voice and Tone | Answer language policy | French-only UI is distinct from per-turn answer language and original-language excerpts. |
| Dependable waiting/recovery | FR-8 | Waiting, failed, unknown, reload states | AD-8/10/15; R §1..5 | PRD/runtime agree; UX still describes resolved scope contracts as pending. |
| Public Markdown source of truth | FR-9 | Foundation, Evidence eligibility | AD-2/7/13/17/18; R §1 | Consistent; browser JSON is presentation, D1 active publication is runtime authority, Markdown is authored truth. |
| Inspectable citations; explicit missing/partial evidence | FR-10/11 | Citation token and Source viewer | AD-5/7; retrieval/output validation; R §4 | Consistent passage-local inspection, historical excerpts, strict selected union; no full document browser. |
| Honest privacy, limited review, isolated sessions | FR-16..18 | Permanent privacy access; Same-tab refresh | AD-3/4/10/12/16; R §4..7 | Mechanisms agree downstream; brief must reflect narrowed deletion promise and audit exception. Session reload-vs-new-visit proof remains explicitly deferred. |
| Early deletion and 90-day limit | FR-19/20 | Privacy/deletion flow | AD-11/12; R §7 | PRD/UX/runtime agree on manual deletion request and creation-based deadline; brief promises direct deletion. |
| Simple sufficient lexical retrieval | §5.1; FR-9/21; open question 3 | Foundation | AD-7; retrieval contracts, deferred semantic retrieval | Consistent lexical baseline, evidence-driven escalation, no automatic reformulation or hidden fallback. |
| Trust and professional release | FR-21/22, §5.2..5.6 | Accessibility Floor; deferred copy/state checks | AD-13/14/16; R §8/9 | Deterministic checks plus real-model/human/browser evidence required; sketch approval is not release approval. |
| No conversion/volume optimization or committed roadmap | §8, PRD addendum final section | Non-persuasive voice | Source requirements inherited; no contradictory technical mandate identified | Preserved. |
| Minimal operation, no administration interface | §5.5, MVP/non-goals | No public admin/contact surface | AD-11/14; R §7/8 | Local CLI/script only; persistent exports disabled until coordinated cleanup proof. |

## Adversarial finding dispositions

IDs below identify findings in reviewer output order, not importance. All original findings and structural recommendations are retained below and in the JSON companion; overlapping findings are not independent defect counts.

| ID | Disposition after source check | Interpretation / smallest follow-up |
|---|---|---|
| A01 | Confirmed synchronization issue; overlaps S5 and structure recommendations 2/3 | Contracts exist. Update PA/H completion status and current links; do not redesign scope/session contracts. |
| A02 | Confirmed synchronization issue; overlaps S4/S5 and structure recommendation 2 | Update U's present-tense PRD/payload claims; preserve its sketch/non-implementation status. |
| A03 | Confirmed stale brief policy; overlaps S2 and structure recommendation 1 | The later PRD decision log already approves sourced factual redirection. Select the reviewer's first remedy: supersede BA's older restriction, not an invitation-only policy reversal. No new BC decision is needed. |
| A04 | Confirmed stale deletion promise; overlaps S1 and structure recommendation 1 | The manual Deletion Request override is explicit in PRD history. Update the brief; do not infer an immediate-deletion requirement or invent an unapproved handling SLA. The required review cadence remains operational acceptance work. |
| A05 | Clarification needed, not a proven provider leak or a mandate for semantic redaction | P:268 forbids intentional unnecessary identifiers in prompts; A:390 excludes application metadata but necessarily sends the submitted question. Clarify app-added metadata versus visitor-entered text, detectable-secret handling and truthful provider disclosure. BA:41 already names visitor-sensitive-input policy as open. Comprehensive detection is not established. |
| A06 | Concrete operations-contract follow-up within an already deferred backup assessment | R:288 explicitly defers host/provider backup assessment; its rollback ban does not define disaster-recovery restoration. Before enabling/using recovery, specify how expiry and already-handled deletions survive restore. No actual backup restoration or resurrection was tested. |
| A07 | Missing explicit browser-origin creation policy; no exploit demonstrated | R defines the unauthenticated creation route and IP cap but not Origin/Fetch Metadata handling. Specify allowed browser request origins/content types and any non-browser exception; test cross-site quota consumption. Do not claim CORS alone prevents it or that a current implementation is vulnerable. |
| A08 | Abuse-control follow-up consistent with the explicit measured-budget deferral | R:25 permits new execution attempts under the same counted turn; R:260 deliberately defers additional numeric budgets pending measurements. Include interrupted recovery attempts in that measured policy, distinguish execution bounds from logical-turn accounting, and keep reads/replay/deletion available. Do not invent a numeric cap in this audit. |
| A09 | Concrete missing entry-failure contract | If creation commits but credentials are lost in transport, the message-level same-request recovery rules cannot recover the one-time token. Define explicit fresh-creation/quota messaging or a secure bounded creation-idempotency mechanism; the simpler explicit restart option remains valid. Do not add an endpoint by implication. |
| A10 | Conditional visual acceptance issue, not a completed accessibility audit | Independently calculated muted-on-paper contrast is 4.42508:1. This matters if normal/small text actually uses that pair; the sketch does not fix all component pairings or sizes. Constrain pairings using existing tokens and validate rendered text. The approved palette/layout need not be reopened. |

### Structural review dispositions and overlap

- Recommendations 1–3 address the same authority/synchronization problem as S1–S6 and A01–A04. Retain their evidence but do not count overlaps as separate product defects.
- Recommendations 4–6 are optional navigation/grouping improvements: front-load the capability map/glossary and move ownership text out of catalogue serialization. They do not change product requirements or establish a new architecture obligation.
- Recommendation 7 explicitly preserves useful complementary views. It is not an instruction to remove detail or collapse appearance/behavior/storage contracts into one document.
- Word counts and estimates in the structural table are the reviewer's `word_metrics.py` results, not an independent parent remeasurement. No shortening target was requested.

### Edge-case-hunter result

The independent edge-case lens returned `[]`. This is a lens result, not a proof that all possible paths are handled. The separate adversarial review identified entry failure and operational/security-policy follow-ups as described above; its observations are retained rather than suppressed by the empty edge-case output.

## Explicit follow-ups, not newly discovered contradictions

| Follow-up | Current evidence / owner | Required next evidence |
|---|---|---|
| Same-tab reload versus new/copied/restored visit | R:221–223; A deferred session lifecycle; architecture decision log explicitly names this implementation blocker | Implementer must demonstrate a supported-browser discriminator; `sessionStorage` and navigation type alone do not prove it. Preserve FR-18; no silent durable restoration or unsupported reset of ordinary reload. |
| Reviewed public project content | P:496; A AD-17; R:36–38 | BC supplies approved project descriptors, stable document IDs and mappings; implementation validates/catalogues them. No resource categories or extra types are implied. |
| Truthful privacy copy and complete UI states | P FR-16/19/21, §5.6; U privacy release requirement; D sketch disclaimer | BC/UX/implementation complete disclosures for actual provider/storage/IP counter/audit, error/recovery/deletion states and real accessibility/mobile-keyboard checks. Sketch approval is not a waiver. |
| Retrieval and actual-model quality | P FR-21/22; A AD-7/13, verification coverage | Representative lexical-retrieval and configured-model evaluation evidence, including selected-scope adherence, refusals and source support. |
| D1 activation, coherent reads and transactions | A AD-15/17/18; R §1/2/8/9 | Tested migrations, coherent publication/admission/evidence reads and failure injection; singleton and pointer design are specified, not implemented. |
| Quotas, billing, payload/storage budgets | P §5.1; A deferred table and decision-log acceptance obligations; R §6/8 | Current provider/plan verification and adapter/budget tests. No automatic paid overage, fallback or arbitrary Resource selection cap. |
| Retention/export operations and delivery | P §5.5; A AD-11/12/14; R §7/8 | Purge cadence/margin/cutoff, request-review cadence, usable operator runbook, preview/promotion/rollback evidence. Persistent exports remain disabled until coordinated cleanup is demonstrated. |

## Checks actually performed

- Read all nine primary documents in full, plus referenced decision logs and user guide; compared current requirements in both directions.
- Verified definitions FR-1..FR-22 and AD-1..AD-18 are present without duplicate definition IDs; the architecture capability map allocates all FRs.
- Checked local Markdown link targets in primary documents, supporting decision logs and user guide: no missing file targets found. This check did not validate anchors, external URLs or rendered diagrams.
- Reviewed the existing historical reconciliations to avoid reopening already-approved overrides or treating already-fixed old gaps as new findings.
- Ran no application/runtime/provider/browser tests; no such implementation is present in the reviewed source corpus.
- Original planning sources and decision logs were not modified; only new review artifacts are saved.

## Suggested synchronization scope

1. Update B/BA to reflect approved manual deletion requests, the minimal deletion-audit exception, on-demand project discovery, and the approved factual redirection policy. Do not reopen product choices already recorded in PRD history.
2. Update P/PA and U statements that say the PRD or resource/scope/session contracts have not yet changed. Distinguish defined contracts from the still-required implementation proof.
3. Give H an explicit historical/completed status linked to A/R; retain the original analysis and source dates for provenance, with a short current outcome map.
4. Make navigation/authority and remaining acceptance obligations easy to find. Preserve D's approved sketch status and the architecture's explicit deferred work.

Changes to source documents require a separate authorized update. This report performs no automatic corrections.

## Independent lens findings — retained in full

The disposition table above qualifies reviewer claims and resolves approved policy overrides. This appendix preserves each original observation; it is not a second untriaged verdict. The JSON companion contains the same ten adversarial findings and seven structure rows. The edge-case lens produced no findings.

### Adversarial

#### A01

- **Location:** docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/addendum.md:16-21; docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/architecture-update-needed.md:106-108; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md:28-30,147-157
- **Trigger:** A downstream planner follows the addendum's assertion that architecture does not yet specify Resource scope or expanded session state, although the final architecture now specifies both.
- **Guard:** Mark the handoff's resolved adaptations as incorporated, link their current AD/runtime sections, and retain only genuinely outstanding implementation decisions. Preserve the handoff as historical impact analysis rather than a current absence report.
- **Consequence:** Planning can duplicate completed architecture work or reopen settled scope, publication and session decisions.

#### A02

- **Location:** docs/_bmad-output/planning-artifacts/ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md:24,36,83; docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:12,100-109; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:117-151
- **Trigger:** The approved Experience document still says the PRD is unchanged, reconciliation is pending, and current contracts submit only requestId/question.
- **Guard:** Replace these present-tense assertions with dated historical notes and links to the reconciled FR-3 and current SubmitTurnRequest/SubmittedScope contracts.
- **Consequence:** UX-derived stories can incorrectly treat approved multi-selection and scope payloads as unresolved overrides or implement the obsolete question-only contract.

#### A03

- **Location:** docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/addendum.md:49-51; docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:48,218-224; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md:314-317
- **Trigger:** A recruiter asks a value judgment with an identifiable professional topic: the brief prohibits automatically supplying evidence, while the PRD and architecture direct the system to retrieve and present sourced examples.
- **Guard:** Explicitly supersede the brief addendum's no-automatic-evidence rule with the approved redirect policy, or change downstream routing to invitation-only redirection. Make evaluation expectations consistent with that decision.
- **Consequence:** The same response can pass architecture tests while violating the brief's explicit refusal policy.

#### A04

- **Location:** docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/addendum.md:18-19; docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:292-305; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:268-274
- **Trigger:** A visitor requests early deletion, but BC does not handle the request before automatic expiry: downstream contracts require a review cadence but provide no handling bound that realizes the brief's early-deletion capability.
- **Guard:** Reconcile the brief to explicitly promise a manual deletion request rather than guaranteed earlier deletion, or define an operational handling bound and escalation that make earlier deletion enforceable. Do not imply immediate deletion.
- **Consequence:** The product can satisfy its downstream request workflow without providing the earlier server-side deletion promised by the brief.

#### A05

- **Location:** docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:268; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md:85,280-286,368-392
- **Trigger:** A submitted question contains unnecessary visitor identifiers, secrets or unrelated personal information: the architecture sends the current question to the classifier before semantic screening, despite the PRD's prompt-minimization rule.
- **Guard:** Define how the minimization rule applies to visitor-entered content versus application-added metadata. Specify pre-provider handling for detectable secrets/unnecessary identifiers and truthfully disclose any necessary processing of submitted content; do not claim comprehensive semantic redaction.
- **Consequence:** Implementers can forward unrelated sensitive content to the provider while believing that excluding identifiers from explicit metadata fields satisfies the PRD.

#### A06

- **Location:** docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:308-316,405-407; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:278,288,302,314
- **Trigger:** An operational backup is restored after a manual deletion or retention purge: the contracts cover live records and managed exports but leave backups as a separate assessment without a restore-time deletion invariant.
- **Guard:** Bind backup and disaster-recovery acceptance to FR-20: specify backup retention, restore-time expiry filtering and how already-completed manual deletions remain effective. Include a restore-after-deletion test and avoid introducing an undisclosed indefinite content-bearing tombstone.
- **Consequence:** Recovery can resurrect deleted conversation content, including data whose deletion audit already says handled.

#### A07

- **Location:** docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:368; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:98-108,248-251
- **Trigger:** A third-party site causes a visitor's browser to POST repeatedly to the unauthenticated conversation-creation endpoint; the contract specifies an IP quota but no cross-site request policy.
- **Guard:** Specify and test a same-origin browser policy for conversation creation, including Origin/Fetch Metadata handling and explicit non-browser exceptions if required. Do not rely on CORS response visibility alone to prevent quota-consuming POSTs.
- **Consequence:** Cross-site requests can consume the visitor's or corporate NAT's ten-conversation allowance before legitimate entry.

#### A08

- **Location:** docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md:100; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:25,32,79,246-260
- **Trigger:** Repeated interrupted executions are manually recovered under the same request ID: each recovery may invoke the provider again, but the usage contracts bound logical turns rather than execution attempts.
- **Guard:** Define a measured recovery-attempt cooldown or execution budget separate from logical-turn accounting. Keep authenticated reads, saved replay and deletion available, and present an honest controlled limit rather than charging another logical turn.
- **Consequence:** One admitted message can cause repeated provider computations and exhaust shared free capacity despite remaining within the twenty-turn limit.

#### A09

- **Location:** docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md:590; docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:98,108,174,193
- **Trigger:** Conversation creation commits but its response is lost: the token is returned only once, and creation has no specified idempotency or unknown-outcome recovery contract.
- **Guard:** Define the creation-specific interruption path: either bounded session-only idempotent recovery with secure credential handling, or explicit fresh-creation behavior explaining that another allowance may be consumed. Cover lost responses and quota exhaustion in entry acceptance tests.
- **Consequence:** Ordinary connection failures can strand newly created conversations and consume repeated creation allowances before the recruiter can send a question.

#### A10

- **Location:** docs/_bmad-output/planning-artifacts/ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md:15-17,53-54,63; docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:416-417
- **Trigger:** Small muted metadata uses the approved muted color #68716c directly on the paper canvas #f3f0e8; the calculated contrast is approximately 4.43:1, below the usual 4.5:1 normal-text accessibility baseline.
- **Guard:** Add an allowed-pairing rule for small metadata: use an existing higher-contrast foreground/background pairing, or explicitly validate another accessible treatment without reopening the approved palette.
- **Consequence:** A faithful interpretation of the approved tokens can fail normal-text contrast acceptance despite following the visual sketch.

### Editorial structure

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| structure | Authority across `docs/_bmad-output/planning-artifacts/briefs/brief-candidate-copilot-2026-09-10/brief.md:60–81`, its `addendum.md:10–26,43–52`, and `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:10–12,218–224,256–310`. | **QUESTION — Add a linked authority/supersession map at the PRD entry point**, including both brief documents, the PRD/addendum, approved UX, and architecture/runtime contracts. Distinguish current requirements, domain-specific authority, and historical decisions. | This set helps human planners implement the approved product; the closest overall model is **Strategic/Context (Pyramid)**, with reference-style technical contracts. The brief addendum calls itself downstream requirements, but the PRD foundation names only the brief. Readers must reconcile automatic versus manual visitor-triggered deletion, the indefinite audit exception, and factual examples after judgment refusals themselves. Identify the already-approved PRD dispositions explicitly; do not choose new policies or discard unchanged brief guardrails. Word impact: **0 removed; approximately 60 added** for scaffolding. Measured source sections include 101 words in “Current MVP lifecycle” and 175 in “Answering and Abstention Policy.” |
| structure | `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/architecture-update-needed.md:1–19,28–119`; the same directory’s `prd.md:12` and `addendum.md:16–22`; `docs/_bmad-output/planning-artifacts/ux-designs/ux-candidate-copilot-2026-09-17/EXPERIENCE.md:24,36,75–83,103`. | **MOVE — Reclassify the old impact analysis as dated historical handoff material**, retaining a short current reconciliation/disposition table in the PRD addendum. Route PRD and UX readers to current contract anchors; pin historical line references to their reviewed versions. | The handoff still says architecture amendments are required; the UX still says the PRD is unchanged and directs readers to an earlier compatibility check. Yet `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md:28–30,147–157` and `RUNTIME-CONTRACTS.md:114–155,195–240` now define Resource scope, submission identity, retry and session continuity. Separate completed **documentation reconciliation** from unimplemented/unverified behavior. Preserve the historical analysis rather than presenting its old restrictions as live contracts; historical extracts should remain evidence of prior state, not implementation authority. Word impact: **2,425 words reclassified, 0 removed; approximately 80 added** for current disposition/navigation. |
| structure | `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:494–500` — “Open Questions” (181 body words). | **MERGE — Reconcile the technical entries with the current disposition table**, separating “decision still open” from “contract defined; implementation/verification pending.” Keep actual content, copy and evaluation questions in the open-question group. | Questions 1 and 5 still assign mapping/version/invalid-resource and session-lifecycle definition to future architecture work. Current `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:34–63,203–240` already specifies these policies. Its copied/restored-tab detection still requires browser evidence, so do not mark that acceptance work complete. Link to the defined contracts and retain genuine implementation uncertainty without reopening approved choices. Word impact: **0-word reduction assumed**; reorganize the measured 181-word section rather than duplicate another backlog. |
| structure | `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md:650–673` — “Capability → Architecture Map” (403 body words), currently after the detailed structural seed and contracts at lines 195–648. | **MOVE — Put the capability map after “Design Paradigm,” before the invariant catalog**, and make its FR/AD references navigable, with targeted links to the runtime sections implementing scope, retry, continuity and deletion. | The implementation reader currently encounters hundreds of lines of component/schema detail before the requirement-to-architecture overview. The map is useful scaffolding, not duplicated requirements: front-loading it lets readers trace the approved UX/PRD into the binding contracts without treating the obsolete handoff as the navigator. Preserve all detailed contracts below it. Word impact: **403 words moved, 0 removed**; link markup does not require additional prose. |
| structure | `docs/_bmad-output/planning-artifacts/prds/prd-candidate-copilot-2026-09-11/prd.md:44–72` — Key User Journeys followed by Glossary. | **MOVE — Place the Glossary before Key User Journeys**, retaining the journeys and their stable UJ identifiers. | UJ-1 alone is 184 words and uses Active Resource Tokens, Submitted Scope, Historical Resource Tokens and Source Excerpts before their definitions. For human readers, placing the existing 382-word glossary first supplies the mental model needed to interpret the scenarios; no technical detail or scenario coverage needs cutting. Word impact: **382 body words moved, 0 removed**. |
| structure | `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md:53–65` — “Canonical public catalog bytes” ends with the D1 processing-ownership paragraph. | **MOVE — Move line 65 into the opening ownership discussion of §1**, before “Catalog, membership and revision handling.” | The paragraph defines atomic lease acquisition, owner fields and stale-owner fencing, not catalog serialization or hashes. Its current heading hides a concurrency obligation from readers navigating by topic. Keep the canonical-byte explanation and golden vector together, and group this ownership rule with the admission table it governs. Word impact: **62 words moved, 0 removed**. |
| structure | `docs/_bmad-output/planning-artifacts/architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md:432–614`; `RUNTIME-CONTRACTS.md:114–155,262–314`; `docs/_bmad-output/planning-artifacts/ux-designs/ux-candidate-copilot-2026-09-17/DESIGN.md:85–99` and `EXPERIENCE.md:48–64`. | **PRESERVE — Keep the complementary diagram, field semantics, wire contracts, visual rules and behavior rules**, using owner links rather than merging them into one abbreviated specification. | These are distinct reference views: the data diagram and column semantics explain storage meanings; runtime contracts define request/replay/retention obligations; DESIGN and EXPERIENCE separate appearance from interaction. Repeated concepts here support comprehension and traceability rather than constituting redundant product scope. The spine’s “Core data shape” and “Column semantics” contain 729 and 1,047 body words respectively; retain them. Word impact: **0**. Overall: **7 recommendations; estimated reduction 0 words (0%)** from **30,907 source words**; approximately **140 scaffolding words added**. The supplied numbered packet measures 33,035 words. Counts use `word_metrics.py`; additions are estimates. No length target or comprehension-sacrificing cuts. |

## Source preservation

SHA-256 checks before/after the audit confirm that all nine primary documents, four decision logs and the user guide are unchanged. Only the new Markdown report and JSON findings companion were added. The staged corpus and reviewer scratch remain outside the repository.
