# One local Workers Free pilot (BC only)

The one authorized observation is complete. This document records the bounds of that Linux terminal tool, not instructions or permission for another invocation. The pilot was not a Worker, endpoint, evaluation suite or change to ordinary simulation.

The historical gate relied on BC independently identifying the account from the 2026-11-23 14:01 “Workers Free — Active”, no AI Gateway displayed observation recorded at `67006cb`. The bounded membership lookup established an accepted match, **not billing**. The tool cannot lock a subscription, confirm remaining quota or prevent another administrator changing plans. A local dispatch count does not establish a remote execution or consumption.

## Limits and local state

Only `global-2.14-v2` / `long-documented`, fresh turn 1, is used. The fixture digest pins the turn, revision, catalog/search identities and eligibility. Exactly three ordinary reviewed public files must match their raw SHA-256s; both rebuilt artifact hashes must match before inference. The tool installs them into a disposable loopback-only local Miniflare D1, not the application's storage. Remote development would upload code; even local development with a real AI binding could send remote inference. This tool uses neither: the local runtime has only D1, and model requests use direct REST. Classifier sees catalog metadata, not passages or review labels. Only validated documentary intent and scoped whole FTS passages permit the generator. The core validates output, including response-local citation IDs, and reconstructs cited excerpts. Clarification, refusal or no evidence doesn't run generation.

Immediately before first dispatch the process exclusively creates and fsyncs `.candidate-copilot-2-12.spent` in the OS user's passwd home and fsyncs the directory. Never delete, rename or reset it; **do not rerun**, even on timeout, interruption, unknown or quota. This marker is per persistent local OS user/home, not a cross-machine/account lock; do not change user, machine or restore a snapshot. A missing receipt after a crash means unknown, not zero calls. No service restart, retry, repair, paid alternative or gateway exists. Normal exits clean temporary auth and publication state; a crash or failed teardown can leave a private `/tmp/workers-ai-pilot-*` directory. Do not share it or confuse it with the permanent guard.

Only direct HTTPS POST `https://api.cloudflare.com/client/v4/accounts/{matched-id}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`, same model for both roles, no redirects, no streaming or gateway options. Bounded identity (64 KiB, 10 s), login (125 s), token extraction (10 s), total command watchdog (210 s, plus at most 5 s cancellation grace before leaving any still-in-use private state alone). A receipt may report `cleanup: "incomplete"` separately from a known processing result. Processing uses the project's 5 s classifier / 30 s attempt with 2 s reserved for finalization. Cancellation limits local waiting, not remote computation.

| Bound | Classifier | Generator | Total ceiling |
|---|---:|---:|---:|
| Attempts | 1 | 1 | 2 |
| Serialized input (UTF-8 bytes, including framing) | 12000 | 20000 | 28000 |
| Requested `max_tokens` | 512 | 1024 | 1536 |
| HTTP success envelope before JSON parse (bytes) | 8192 | 16384 | 24576 |
| Decoded serialized JSON output reservation (UTF-8 bytes) | 2048 | 4096 | 6144 |

The local byte/component checks and upstream response limits are **not a live tokenizer**, neuron estimate, guarantee of admission or billing cap. HTTP, malformed output and deadline failures stop; no diagnostic text or assumed completion is reported. No other invocation is authorized by a zero count.

Official references: [Workers AI REST](https://developers.cloudflare.com/workers-ai/get-started/rest-api/), [model](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/), [JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/), [pricing/Free daily allocation](https://developers.cloudflare.com/workers-ai/platform/pricing/), [memberships](https://developers.cloudflare.com/api/resources/memberships/methods/list/). See [dated operator observation and earlier offline evidence](workers-ai.md). Tests substitute synthetic browser/auth and HTTPS boundaries. They are distinct from the operator receipt below.

## Offline contract and diagnostics

At the substituted HTTPS boundary the pinned turn is a UTF-8 JSON POST: a system instruction string, a user message containing the role’s JSON data **as a string**, `stream: false`, the direct schema in `response_format.json_schema` (`type: "json_schema"`), and the role’s `max_tokens` above. The classifier schema separates four decisions; the generator schema describes status, language and cited blocks. Local admission counts the serialized body including escaping and framing. A bounded, identity-encoded v4 success envelope with an empty errors array supplies `result`; the role decoder accepts an object or JSON string in `result.response`, subject to the decoded limit and application validation. The installed model-specific types permit messages, both JSON mode selectors and an untyped schema. This is local contract evidence, **not** a demonstration of remote schema support or a reason to change the wrapper, schema or deadline.

In offline failure receipts, `diagnostic.stage` names the observed phase: `authorization`, `preparation`, `classifier`, `continuation` (including evidence retrieval and generator preparation), `generator`, `finalization` (validated result reconstruction), `teardown`, or `unknown`. It is not inferred from attempt counts. `diagnostic.kind` reports only the first local observation:

| Kind | Meaning |
|---|---|
| `local_deadline` | A local cutoff fired or a local elapsed-time check expired. External interruption by itself is not a deadline. |
| `transport` | The socket or stream failed without a usable response. Remote completion is unknown. |
| `http_rejection` | A non-200 integer HTTP status (100–599) was observed. Only that number appears as `httpStatus`; no rejection body is read. A missing or malformed status is `unknown`, not a refusal. |
| `unusable_envelope` | Encoding, size, UTF-8, JSON, success/errors or the envelope’s own `result` field failed the check. Missing `result` keeps the original processing status. |
| `invalid_response` | Completed data failed role decoding or application validation, including citations. |
| `unknown` | No more specific cause was observed at this stage. |

Disposable tests drive the login and token kill timers, membership cutoff, processing clock and command watchdog separately. Auth cleanup still waits for child close. If the watchdog fires during publication disposal and the grace period expires, the CLI reports `interrupted` with the actual dispatch counts and `cleanup: "incomplete"`. It does not promote a pending result to `answered` or display it. This is a limit on local teardown, not evidence about inference.

No exception text, provider code, usage or billing conclusion belongs in the receipt. A controlled result or spent denial has no diagnostic. Private terminal display of validated blocks and reconstructed sources is not part of the receipt. These distinctions apply to the disposable tests; they add no information to the earlier observation.

## Operator receipt — first authorized pilot

BC returned only this receipt from the terminal run:

```json
{"pilot":"2.12/long-documented","status":"processing_unavailable","attemptsThisInvocation":{"classifier":1,"generator":0}}
```

The account-membership gate passed, one classifier dispatch was attempted locally and no generator dispatch was attempted. No validated answer was returned. The receipt contains no HTTP status, provider error code, timing or usage; it does not identify a cause, confirm remote completion, or measure consumption. Retain this failed sample without replay. No change to story status, no quality judgment, and no authorization for another attempt.
