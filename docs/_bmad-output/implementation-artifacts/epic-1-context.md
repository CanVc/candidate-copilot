# Epic 1 Context: Establish a Reproducible Local Development Workstation

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Enable BC to prepare an Ubuntu 24.04 LTS workstation and reproduce a working development environment from a fresh clone: install verified tooling and locked dependencies, configure safe local defaults, initialize local D1, start a minimal frontend and Worker with a simulated LLM, and pass bootstrap checks without hosted resources or live model credentials. This establishes the portable foundation for later product work; it does not deliver the Conversation pipeline or establish production readiness.

## Stories

- Story 1.1: Install and Verify the Workstation Toolchain
- Story 1.2: Initialize a Reproducible and Safely Configured Application Skeleton
- Story 1.3: Start the Frontend and Worker with a Simulated LLM
- Story 1.4: Initialize and Verify Local D1 Reproducibly
- Story 1.5: Verify the Fresh-Clone Workflow and Document Troubleshooting

## Requirements & Constraints

- Target Ubuntu 24.04 LTS; BC reports 24.04.5 LTS. macOS and Windows support are outside this epic. Document Git, Node.js/npm and required development/test tool installation, version verification, installation privileges and download requirements.
- Reverify historical toolchain and dependency candidates against official sources before selecting versions or generating the npm lockfile. Record selected versions, references and verification dates; inherited version numbers are not current-release guarantees.
- Provide documented lockfile-based dependency installation that leaves the committed lockfile unchanged. Prefer the simplest sufficient zero-euro foundation rather than an expanded framework or product implementation.
- Baseline startup and deterministic tests must require no Cloudflare account, hosted resource, production access, secret or live LLM credential. Internet access for installing tools and dependencies is allowed; this is not an offline-install guarantee.
- Configuration templates contain nonsensitive examples only. Exclude applicable local secrets, sensitive environment files, local environments, generated runtime state and private preparation content from Git and application build inputs.
- Fresh-clone acceptance must exercise dependency installation, configuration, local D1 initialization, frontend/Worker startup, deterministic simulation, type checks, initial automated tests, build and local smoke coverage. Record the tested revision, environment, commands and results; do not substitute undocumented preexisting workstation state.
- Troubleshooting must cover missing/incompatible tools, dependencies, occupied ports, configuration and D1 bindings, with diagnostic commands and corrective actions. Identify destructive resets explicitly and restrict them to local state.
- Bootstrap tests prove component plumbing only. They do not establish grounding, retrieval quality, real-model behavior, hosted cost/privacy compliance or recruiter-launch readiness. Real provider integration, Conversation/retrieval features and hosted delivery remain later work.

## Technical Decisions

- Use a lightweight hexagonal, ports-and-adapters serverless monolith. Application/domain policy stays independent of Hono routes, Cloudflare bindings, provider SDKs and browser code; routes remain thin HTTP adapters.
- Target TypeScript across frontend/backend, React/Vite for the browser, Hono for the Worker, Wrangler for local Cloudflare tooling, D1/SQLite FTS5 for eventual persistence/retrieval, Vitest and Playwright for testing. Workers AI is the later default real-provider direction, not a bootstrap dependency or credential requirement. Native structured CSS and design tokens are selected; Tailwind is deferred.
- Follow the architecture-aligned structural seed, not an adopted third-party starter: separate shared contracts, application services, ports, adapters, Worker entrypoint, frontend and styles, with dedicated locations for migrations, scripts and tests. Shared API/domain types belong outside frontend-only and adapter-only code. Establish boundaries without preimplementing future services, components or business schemas.
- Preserve the intended port boundaries for ConversationStore, Retriever, LLMProvider, SafetyGate, ResourceCatalog and Clock/Retention. The local LLM simulation sits behind LLMProvider, returns deterministic output for a known input and makes no network call to a model provider. It must not become a substitute business Conversation pipeline.
- Python/uv is only for BMAD tooling, not the application runtime. Create a gitignored `.venv` only if that tooling requires it; routine application development must not require manual Python environment activation.
- Keep `content/public/**/*.md` as the eventual version-controlled public knowledge source. `content/private/` is local-only, gitignored, untracked and excluded from application build inputs and hosted contexts; never deploy private material and rely on prompts to conceal it. Public content promotion requires human and AI editorial review before explicit copying.
- Local D1 setup must be reproducible, safe to rerun without deleting data and explicit about initialization errors, storage location, binding and migration mechanism. Verify actual Worker-to-D1 access with a minimal SQL integration check; do not create future Conversation, source or Deletion Request tables for bootstrap.
- Use `GET /api/health` for minimal frontend-to-Worker availability checks. Availability must not imply documentary-catalog or product readiness, and health must not expose administrative diagnostics or credentials. Do not invent catalog identity before a real publication exists or add public LLM/database diagnostic routes; verify simulation and database access through dedicated tests.
- Document local addresses and ports. Smoke checks must fail when the Worker is unavailable or the D1 binding is missing/incorrect, rather than reporting superficial frontend-only success. Default local execution must never invoke a real model provider.

## Cross-Story Dependencies

- This epic has no prerequisite epic and must precede functional product work.
- Toolchain verification enables the locked, safely configured skeleton. That skeleton enables local frontend/Worker simulation; D1 initialization and integration follow as a separate capability. Earlier bootstrap checks must not depend on later database setup or future business features.
- Fresh-clone verification integrates the delivered foundation and its troubleshooting documentation. Later Conversation, Resource, privacy and release work build on these boundaries; their schemas, interfaces and hosted operations are not prerequisites for accepting this epic.
