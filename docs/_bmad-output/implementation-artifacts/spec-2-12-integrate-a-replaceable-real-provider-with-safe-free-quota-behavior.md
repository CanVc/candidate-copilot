---
title: 'Story 2.12: integrate a replaceable real provider with safe free-quota behavior'
type: 'feature'
created: '2026-11-23'
status: 'in-progress'
baseline_commit: '4dda42e937443f56260c1d781e542908f6fd5dc2'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/_bmad-output/implementation-artifacts/epic-2-context.md'
  - 'docs/_bmad-output/planning-artifacts/reviews/open-acceptance-items.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A real classifier/generator needs a replaceable adapter without unexpected costs, misleading quota notices or extra private data in prompts.

**Approach:** Prepare a dormant Workers AI binding adapter and exercise its actual outbound request construction locally. Keep account verification and live evaluation explicitly outstanding.

## Boundaries & Constraints

**Always:** Credential-free simulation by default; core owns grounding, admission, validation, failure, privacy and retention. Enforce A05: warn before free entry, do not scan/block/mask visitor input. Distinguish app-added data from verbatim visitor content. Document truthful French disclosure for later guide placement; preserve professional refusals. Only disposable synthetic/public tests on free ports. Actual account on Free with no paid/Gateway path and separate explicit approval are prerequisites, not facts.

**Never:** Add live binding, auth, HTTP inference, automatic retry, repair, failover, paid path, secret reads, operator access, migrations, deployment or push. No A08 budget, later-story UI/recovery/deadline, quality judgment or acceptance. Do not promote sprint/spec to review/done on missing account evidence.

## I/O & Edge-Case Matrix

| Case | Result |
| --- | --- |
| Default / incomplete explicit config | Simulation without credentials / fail closed; no implicit live calls or fallback |
| Authenticated replay or confirmed outage before admission | Replay unchanged without call; otherwise reject new affected work without count/draft mutation |
| Provider rejects admitted call | Controlled persisted failure, counted once; failed commit stays unknown |
| Daily quota vs capacity vs generic 429 / unknown | Only documented structured signals justify specific scope/time; no guessed resume time or raw diagnostics |
| Fictional sensitive visitor text | Preserve as untrusted user data; never attach credentials, private sources or unnecessary identifiers |
| Malformed response / timeout / cancellation | Controlled error, zero retries, no raw data returned |

</frozen-after-approval>

## Code Map

- `src/ports/LLMProvider.ts`, `src/shared/model-context-budget.ts`: separate classify/answer receivers, prepared-call binding, actual serialized envelope, reserved output; scalar fixture accounting is not a verified live tokenizer.
- `src/application/{classify-professional-intent,generate-answer}.ts`: retain core projection, validation and reconstruction. `src/worker/index.ts:createWorker` is the optional processing composition seam; bootstrap ping is not a chat answer.
- `src/application/conversation-results.ts:submitConversationQuestion` authenticates, resolves saved results/conflict/lease and only then admits; preserve precedence and uncertain-finalization behavior. `tests/e2e/answer-generation-worker.ts` exemplifies the assembled local pipeline.

## Tasks & Acceptance

**Execution:**
- [x] `docs/development/workers-ai.md`: record dated official pricing, model, JSON-mode, limits, bindings and errors evidence below; distinguish general Free eligibility, uncertain binding signals, unverified target account and launch gate. Describe disclosure and offline verification.
- [x] `src/adapters/llm/workers-ai.ts`: implement explicit role-specific configured model/budget and narrow injectable binding port; no environment activation. Strict messages/schema projection, stream false, reserved max_tokens, bounded output decoding/validation, safe typed rejection. Bind accounting to role, model, wire framing (including schema) and output; if unverified for real use, keep disabled, never present test counters as real. Bootstrap/health must not send inference.
- [x] `src/application/conversation-results.ts`, `src/worker/index.ts` and associated ports/shared contracts: provide explicit composition and a trusted, non-probing pre-admission availability seam; suspend only confirmed affected calls; expose only proven resume times. Preserve existing saved states and turn accounting.
- [x] `tests/bootstrap/workers-ai.test.ts`, `tests/bootstrap/conversation-results.test.ts` and disposable pipeline fixtures as needed: exercise matrix including both real adapter methods with captured synthetic binding payloads through actual core, A05 sentinel separation, model/config mismatch, safe code/status normalization, cancellation/output limits and no hidden calls. Test pre/post admission and replay with actual application orchestration.

**Acceptance Criteria:**
- Given candidate models, when configured for the two roles, then dated sources and adapter tests identify availability, receiver context, rate/quota scope, reset signals and actual plan billing; unknown codes stay safe. Actual target plan evidence is separately required and unavailable.
- Given default and explicit evaluation configurations, when selecting a provider, then simulation needs no credentials, explicit configuration is required and policy stays in core; the shipped Worker cannot make real calls.
- Given secret-like fictional visitor text, when capturing classifier/generator wire messages, then A05 preserves visitor text without attaching app credentials, private sources or unnecessary identifiers, and the disclosure matches the path without a semantic-redaction claim.
- Given confirmed pre-admission outage or admitted rejection, when processing, then the first leaves count/draft intact, the second saves a controlled failure when possible; only known times surface and no layer retries, repairs, fails over or enables overage.
- Given rate, quota, timeout, malformed and unknown fixtures, when normalizing, then errors are safe; fixtures do not establish live behavior or effective billing protection.

## Implementation Notes

Supervisor approved the cohesive spec for dormant local preparation only. Single writer; do not stage/commit or promote status. Do not run other agents, renderer, external documentation requests or CLI agents. The inherited project guardrails prohibit operator secrets, data/storage/services, Cloudflare operations and harness/skill changes. Stop and report exact runtime errors and workspace state before any retry. Use local-only isolated tests and preserve failing evidence; no retry-until-green. Official sources were read by the supervisor, not the writer (child documentation GET returned 403). Links under https://developers.cloudflare.com/workers-ai/: platform/pricing/, platform/limits/, platform/errors/, models/llama-3.3-70b-instruct-fp8-fast/, features/json-mode/, configuration/bindings/.

Coordinator inspected the 808-line staged diff and all six matrix rows. Both complete local suites covering the matrix ran: workers-ai (21) and conversation-results (80). The prepared implementation tree `e20bd8e22e3e96b985b5c0f0354e4ccb71596afc` passed four typechecks, 45 workstation checks, 900 units, both builds, six simulations and 44 Playwright tests. Log `/tmp/sjwd97jZD/implementation.log` SHA256 `c99dac4e77dd3f7642792fe8850ee020cccc3bb5b19b90b2495050bfb565a718`. Source-only snapshot, disposable HOME/storage, private PID/proc/network namespaces with loopback only. Baseline distinctly passed 874 units but only 39/44 Playwright: five Chromium socket paths exceeded Unix length, log SHA256 `23eb2396d32d038c97650d1b10ec51a8cb134e1d8a4a3a5e00209e12be0c1bba`, no baseline retry. Supervisor authorized a shorter temporary path for the implementation tree. All four execution tasks concern preparation only. Original AC1/AC5 account-specific proof remains blocked; no live proof, sprint review or story completion.

## Spec Change Log

## Review Triage Log

By explicit supervisor decision the three independent technical reviews cover the dormant preparation, without changing spec/sprint to review (step-04 status exception: actual account evidence is missing). All three read-only reports were collected before triage, on delivery diff `d9b260da9c39e82d77840372e2b19c071d72f542e31da14939b627059180aef4`. Reviewer ids in order: `dc351bed-5abd-4eb2-91e9-9bcd06b86e3d`, `d5ac927e-d9be-4348-97b6-a255e9d208a8`, `2d21b105-1d1b-4fc6-b1e4-39ffbfdcdf31`. Coordinator timed out (1800000 ms) after collection; supervisor preserved the 14-file diff and authorized a single same-session resumption at triage. Before further writes, verified branch, HEAD and diff SHA256 `eab9e3d6f5164d44c3f586cb8b958200fb65d9d10f8f646e33331e9555579f46`.

| Finding | Verdict, disposition and evidence |
| --- | --- |
| B1 | medium, patch. Rejection descriptor reads precede the proxy check. Reuse trusted proxy detection before reflection. |
| B2 | low, patch documentation. The keys array can grow before length checking; output-token reservation bounds accepted serialized output, not heap use of pre-materialized binding objects. This port only admits trusted local fixture producers. Require bounded fixture objects; disallow real unbounded object transport without an upstream raw size guarantee. No simulated heap cap claim. |
| B3 | medium, patch composition example/test. A caller that constructs role config inside the per-turn factory can spend a turn before the config exception. Validate static roles once with existing synchronous selector before creating the Worker; factory attaches only request-bound dependencies. Do not probe model or penalize replay. |
| B4 | low, patch. Outage readiness uses an earlier timestamp than lease readiness after catalog I/O. Sample once post-read. |
| B5 | false, reject extra retry mode. No message is admitted. A fresh submit is possible after restoration (the clock-bound expiry test demonstrates this); retryMode addresses retry of a failed logical result, not resubmission of an unadmitted draft. Document distinction and test HTTP contract per V1. |
| B6 | medium, patch. Admitted failure is exercised only at classify. Assert rejected generation, saved replay and a subsequent direct classifier-only branch. |
| B7 | medium, patch. Existing sentinels and partial projections do not detect arbitrary extra fields. Assert exact classifier/generator data keys and nonempty catalog projection. |
| B8 | medium, patch. The regenerated cache removed the creation-based 90×24-hour deadline and access/deletion distinction. Restore summary, not a retention feature. |
| B9 | low, patch. Restore classifier and finalization sub-budgets dropped from cached context; no deadline implementation. |
| B10 | low, patch. Restore the nonoverlapping approximate 3-second, 45-second bounded reload observation guideline in cache only. |
| B11 | medium, patch. Restore no-store and no URL/log/prompt credential constraints lost from cache. |
| E1 | medium, patch. Descriptor traps execute on proxy rejection before structured-code classification. |
| E2 | low, patch. Seen-set never deletes a completed node; shared noncyclic citation arrays spuriously fail object/text parity. Use an active-path set. |
| E3 | low, patch docs. `Reflect.ownKeys` allocates independently of the output reservation. Only bounded trusted object fixtures are supported, distinguish heap limits from decoded JSON limits and retain a transport-size activation blocker. |
| E4 | medium, excluded. Without a supplied signal a never-settling binding does not end; original intent excludes full attempt-deadline orchestration (2.13). Document as a live blocker; no deadline here. |
| E5 | medium, patch. Invalid JSON throws before core validation, both generic catches save processing_unavailable. Use an existing invalid value at the role return boundary so the existing core validators yield invalid_result, without leaking a diagnostic or new core dependency. |
| E6 | medium, patch. Factory exceptions after admission can reflect invalid static config. Demonstrate startup validation before committing a factory via existing selector; arbitrary request-bound composition failures remain controlled post-admission. |
| E7 | low, patch. GET compares outage expiration to a clock sampled before reads while POST samples later. |
| E8 | medium, patch. Snapshot callback is guarded but reading its properties can throw outside the try, failing authenticated reads. Guard signal and timestamp separately. |
| E9 | low, patch. Another request can fill final slot during publication lookup; recheck existing cap when rejecting due to outage (preserve saved/lease precedence). |
| E10 | medium, patch. Empty resource list cannot detect classifier metadata attached from actual catalog resources. Use eligible catalog fixture and full expected projection. |
| E11 | medium, patch. Cache deletion of precise retention rule confirmed against baseline. |
| E12 | low, patch. Two processing sub-budgets lost versus baseline. |
| E13 | low, patch. Nonoverlap/cadence/maximum absent in regenerated cache. |
| V1 | medium, patch. Service tests bypass Worker option forwarding and JSON status; exercise POST/GET on disposable workerd/D1. |
| V2 | medium, patch. No test triggers saved winner during a successful publication read followed by outage. Add exact result replay and call counts. |
| V3 | medium, patch. Snapshot-throws path lacks authenticated-read regression. Verify transcript still readable. |
| V4 | medium, patch. Existing answer fixture uses a separately constructed retriever; verify injected worker retriever on a successful documented answer without weakening fault/count assertions. |
| V5 | medium, patch. An empty/partial classifier oneOf can pass array-only assertion; verify actual four branch fields and reason enums. |
| V6 | medium, patch. Rejection descriptor trap demonstrated by control flow; same as B1. |
| V7 | medium, patch. `invalid_output` throws in decode, both portable callers catch indiscriminately before their validators; unlike malformed decoded object this saves processing_unavailable. |
| V8 | low, patch. Mixed sampling of clock before and after I/O makes expired resume time visible. |

After individual verdicts, common roots: B1/E1/V6; B2/E3; B3/E6; B4/E7/V8; B7/E10; B8/E11; B9/E12; B10/E13; E5/V7. Others are distinct. Direct fixes and focused test-only corrections keep the existing public ports; no change to frozen intent or product policy.

## Design Notes

Supervisor consulted official Cloudflare docs 2026-11-23: Free 10,000 neurons/day, reset 00:00 UTC; Paid overage $0.011/1,000; Gateway can debit credits. Candidate for both roles (not a product selection): @cf/meta/llama-3.3-70b-instruct-fp8-fast, 24,000 context, 26,668/204,805 neurons per million input/output tokens. JSON schema supported, conformance not guaranteed. Default text generation 300 requests/min; no finer scope assumed. HTTP/code pairs 429/3036 account daily, 429/3040 temporary capacity, 408/3007 timeout, 408/3008 aborted, 403/5035 Paid required; no guaranteed Retry-After or binding error fields. Never parse free-form provider messages. Document source links and remaining activation evidence. No intent gap, irreversible action or external operation proposed.

## Verification

### Corrected local checkpoint, not closure

The retained writer could not be continued after coordinator revival (`Async run not found for '5a9be207-c8dc-4998-973d-9042d5822acf'.`). Supervisor inspected the empty index and explicitly authorized inline step-04 patches. All retained fixes were implemented, including the fixture-only decoder/diagnostic corrections, exact positive/negative wire projections, admission races, HTTP outage/readiness and supplied-retriever regression. No reviewer was asked to attest to changes they did not see. No change to frozen intent, production binding, later story or harness.

Corrected snapshot `b4ea93b1a117294d7a8a3c9f8df786978e0ea77f`: four typechecks, 45 workstation checks, **908 units**, both builds, six simulations, **44 Playwright** passed; log SHA256 `f32e84a7447b1b44d6945df8a356ceaecc3ba8ad209e5215e8d83914ee35efc0` at `/tmp/ss7T3JdyK/corrected.log`. Only documentation updates followed. All checks ran offline on disposable tracked-source copies, local fake bindings and isolated workerd/D1/Chromium. For a technical walkthrough in equivalent isolation, run the two focused Vitest files listed above and `playwright test conversations.spec.ts` using installed project test binaries. Inspect the preserved fictional key in user content only, approved public catalog/evidence projection, replay with no extra calls, no turn on pre-admission outage, and unknown persistence outcome. No deployment, operator migration or UI entry is required.

**Remaining gate:** Before any real evaluation, the target account's effective Free plan, absence of paid/Gateway paths and consequent overage protection must be evidenced separately from general terms, and separate authorization obtained. Actual model access, response/error/limit behavior, tokenizer and framing, settlement/deadlines and quality are unverified. Nothing here implements the future guide UI or completes BC review. Per supervisor, omit step-05 done/sprint-review transitions: spec and sprint stay in-progress. The commit is a checkpoint of local preparation only.

Run focused adapter/admission suites, then `npm run typecheck && npm test && npm run build && npm run test:smoke` after verifying fixture isolation; no operator servers/storage. Inspect actual fake-binding payloads/counts, review complete diff via fresh independent layers, correct findings, record tests and residual AC1/AC5 blockers. Local partial checkpoint only, no false closure.
