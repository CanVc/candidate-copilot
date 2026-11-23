# One local Workers Free pilot (BC only)

This is a separate Linux terminal tool, not a Worker, endpoint, evaluation suite or change to ordinary simulation. Use a clean trusted checkout with the pinned dependencies and Node **24.22.0** already installed. The launcher resolves `node` using the invoking shell's **trusted PATH** before clearing the environment. Use only trusted absolute PATH directories and the genuine installed Node executable (a symlink to it is fine), **not a wrapper**, function or shim. Use a local interactive terminal with no recording/`tee`, and a browser on the same machine with `localhost:8976` available. Disable terminal sharing. No API key, Wrangler profile, `.env`, project DB, dashboard audit or deployment is needed.

**Stop unless you independently know the exact account ID for your 2026-11-23 14:01 “Workers Free — Active”, no AI Gateway displayed observation recorded at `67006cb`. Stop if you know this has changed.** Do not infer the account from the login or a sole membership. Do not send the ID to an agent. This command checks membership, **not billing**. The Free assurance depends on that dated observation remaining true: the tool cannot lock a subscription, confirm remaining quota or prevent another administrator changing plans. Under the pricing reviewed on 2026-11-23, Workers Free had a hard account-wide 10,000-neuron daily allowance; when exhausted, a Free user must wait for reset rather than incur Paid overage. This is not a promise that quota remains today.

From the project root run once:

```sh
sh tools/workers-ai-pilot/run.sh
```

1. At the hidden prompt enter the independently known 32-character lowercase hex ID and press Enter, or press Enter alone to stop. No ID in shell history, arguments, files or chat.
2. Open the **private** `https://dash.cloudflare.com/oauth2/auth?...` URL printed in that terminal in your browser. Authenticate as the operator; inspect consent for `account:read`, `user:read`, `ai:write` (Wrangler adds `offline_access`). Do not grant unexpected permissions. Allow the local `http://localhost:8976/oauth/callback` redirect; return to the terminal. Do not paste a token or callback URL into the command. Browser login/callback, token exchange and authenticated membership lookup are preparatory network operations, not inference, plan checks or billing mutations.
3. Wrangler 4.151.2 runs only `login --browser=false --scopes ...` and `auth token --json` in a new owner-only temporary directory, with an explicit minimal config, empty env-file, banner/update check disabled, and without inherited credentials, proxy/TLS settings or keyring. Only the validated login URL is shown. Auth state is deleted locally after token extraction; this is **not remote revocation**. A bounded direct GET of v4 `/memberships` must include exactly one accepted match for the supplied ID. An absent match (including outside the returned page) stops; no account selection or probing.
4. Read the private validated blocks and reconstructed cited excerpts in the terminal. Valid references are not proof of entailment or answer quality. **Return only the final one-line JSON receipt**, not the preceding terminal output, browser URL, account, prompt, answer, source text, auth material or logs. `attemptsThisInvocation` counts local dispatch attempts, not confirmed provider completions. No transcript is saved by the tool.

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

Official references: [Workers AI REST](https://developers.cloudflare.com/workers-ai/get-started/rest-api/), [model](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/), [JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/), [pricing/Free daily allocation](https://developers.cloudflare.com/workers-ai/platform/pricing/), [memberships](https://developers.cloudflare.com/api/resources/memberships/methods/list/). See [dated operator observation and earlier offline evidence](workers-ai.md). Tests substitute synthetic browser/auth and HTTPS boundaries; only a future deliberate operator run can provide a pilot receipt. Neither is 2.12 story acceptance, an assessment of quality, or authorization to activate any service.
