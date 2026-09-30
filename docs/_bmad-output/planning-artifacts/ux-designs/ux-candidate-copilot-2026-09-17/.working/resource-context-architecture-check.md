# Resource Context Architecture Check

## Verdict

Current architecture is **partly compatible at the UI/intent level** but **does not yet support explicit resource context as a backend contract**.

It already supports a public project-oriented knowledge base, a classifier catalog for interpretation, canonical D1 transcript/history, and safe turn recovery. However, the current public message payload is only `{ requestId, question }`; retrieval only accepts `resolvedQuestion` and `searchTerms`; persisted `messages` have no resource-context snapshot; and no stable project/resource IDs are defined.

Therefore the UX direction (`+ Ressources`, one selected project, composer chip persists across sends until removed, no typed-text mutation) needs small but explicit contract additions.

## Evidence

### Existing project IDs / catalog

- PRD expects two to three selected documented projects on the landing page, but selection is still open: `prd.md` lines 93-100 and open question lines 452-455.
- Architecture maps the landing experience to `content/public` selected project metadata, not to a runtime resource-catalog API: `ARCHITECTURE-SPINE.md` lines 561-564.
- Public content frontmatter only requires `visibility`, dates, and review fields; `title`, `topics`, and `aliases` are optional for FTS recall: `ARCHITECTURE-SPINE.md` lines 141-150.
- The classifier has a `publicCatalog` with `topic`, `aliases`, and optional `description`, derived from public topics/aliases/project names/descriptions. It has **no resource/project ID field**: `ARCHITECTURE-SPINE.md` lines 255-268.
- D1 source tables contain `source_path`, `source_revision`, `title`, `topics`, `document_id`, and `metadata`, but no project/resource ID: `ARCHITECTURE-SPINE.md` lines 470-485.

Conclusion: there is an interpretation catalog, but not an explicit selectable resource catalog with stable IDs.

### Chat request payload

- AD-10 says message posts carry only a conversation-scoped `requestId` and question: `ARCHITECTURE-SPINE.md` lines 97-101.
- Runtime route contract confirms `POST /api/conversations/:id/messages` body is `{ requestId, question }`: `RUNTIME-CONTRACTS.md` lines 73-80.
- Browser pending storage for unknown outcomes is only `{ requestId, question }`: `RUNTIME-CONTRACTS.md` lines 65-71.

Conclusion: explicit selected resource context cannot be submitted today without mutating the typed question, which the UX direction forbids.

### Retrieval semantics

- The classifier receives current question, bounded same-conversation context, and a public topic/alias/project catalog, but catalog/history are interpretation context, not evidence: `ARCHITECTURE-SPINE.md` lines 73-83.
- Retrieval input is only `resolvedQuestion` and `searchTerms`; retrieved chunks are ranked public chunks: `ARCHITECTURE-SPINE.md` lines 299-323.
- Generation can only use current retrieved public chunks as eligible evidence; prior conversation text and catalog terms must not substitute for evidence: `ARCHITECTURE-SPINE.md` lines 338-362.
- PRD requires answers only from the deployed Public Knowledge Base and says no suitable passage means insufficient retrieved evidence, not proof of absence: `prd.md` lines 163-190.

Conclusion: architecture supports adding resource context as either an interpretation hint or a retrieval constraint, but it does not currently decide or implement either. The UX/architecture decision still needs to distinguish:

- **Hard resource filter:** retrieve only chunks mapped to the selected project/resource; if no chunks match, answer with missing/partial evidence inside that scope.
- **Preference / disambiguation hint:** use selected resource to resolve ambiguous follow-ups and improve search terms, but allow retrieval outside the selected resource when needed.

This choice is currently undecided and affects retriever contracts, tests, and UX copy.

### Persistence and history

- D1 is canonical for conversations, admitted messages, answers, Source Excerpts, diagnostics, and retention; the browser never owns transcript state: `ARCHITECTURE-SPINE.md` lines 61-65.
- Core builds context from D1, never from browser-supplied history; prior generated answers may appear as interpretation context but not evidence: `ARCHITECTURE-SPINE.md` lines 247-253.
- Current data shape persists `messages.content` but no resource-context field: `ARCHITECTURE-SPINE.md` lines 415-431.
- GET returns the ordered transcript and recorded results from canonical state: `RUNTIME-CONTRACTS.md` lines 77-87.
- V1 does not restore previous conversation history across new visits, but same active session/reload restores server-recorded transcript/processing state: `prd.md` lines 257-266.

Conclusion: context should be snapshotted per admitted message if it affects answer behavior. Removing the chip later must only change future submissions; it must **not erase transcript history**, prior answers, citations, or the prior turn's selected-context snapshot.

### Idempotency / recovery constraints

- A logical submission has a browser-generated `requestId`; admitted question is immutable; same request ID with different content conflicts: `RUNTIME-CONTRACTS.md` lines 15-28.
- Unknown-outcome retry must keep the original request ID and exact question; the UI must not silently turn recovery into a new question: `RUNTIME-CONTRACTS.md` lines 30-32 and 118-125.
- Same-id/content replay returns the recorded result without another message or LLM call: `RUNTIME-CONTRACTS.md` lines 21-28 and 89-96.
- Recovery/reload reconciles by request ID and uses side-effect-free GET observation: `RUNTIME-CONTRACTS.md` lines 120-140.

Conclusion: if resource context is added, it must be part of the immutable logical submission. Same `requestId` with a different selected resource should be a conflict, not an update. Unknown-outcome `pendingRequest` must store the selected resource snapshot as well as the question.

## Already compatible

- A client-side `+ Ressources` control and always-visible composer chip can be added without violating current architecture, as long as the chip is not treated as canonical until submitted.
- Initial catalog limited to projects and no upload is aligned with public Markdown-only source material and V1 simplicity: `ARCHITECTURE-SPINE.md` lines 79-83; `prd.md` lines 399-408.
- Multi-turn behavior, one active turn per conversation, D1-owned history, and manual recovery are already compatible with context persisting across sends: `prd.md` lines 124-134; `ARCHITECTURE-SPINE.md` lines 127-137.
- Removing explicit context does not need to mutate prior transcript state; the current architecture already treats past turns as canonical D1 history.

## Proposed minimal changes

These are proposals, not current architecture.

1. **Define a public resource catalog type.** Example: `ResourceCatalogItem { resourceId, kind: 'project', label, aliases?, description?, sourcePaths? }`. IDs must be stable enough for persisted turns and recovery. Populate from approved public metadata only.
2. **Add a catalog delivery path.** Prefer a build-time/static public catalog for the initial project-only UX. If it must be served by Worker/D1, AD-10's minimal route list needs an explicit new public catalog endpoint.
3. **Extend message POST payload.** From `{ requestId, question }` to `{ requestId, question, selectedResource?: { resourceId, kind: 'project' } }`. Do not modify `question` text.
4. **Persist selected context per admitted message.** Add a nullable message-level context snapshot (column or child table). Include resource ID, label/kind at submission time, and maybe catalog version/source revision. Include it in GET transcript and operator export; purge it with conversation data.
5. **Extend recovery identity.** `pendingRequest` should become `{ requestId, question, selectedResource? }`. Same request ID with different question or different selected resource should return `409 request_conflict`.
6. **Extend classifier/retriever contracts according to the hard-filter vs preference decision.**
   - Hard filter proposal: `RetrievalRequest` includes `resourceFilter`, and FTS filters chunks by resource/source-path mapping.
   - Preference proposal: classifier/generator receive `selectedResource` as interpretation context and may add project-specific terms, but retriever remains global.
7. **Add launch tests.** Cover selecting one project, chip persistence across sends, removal affecting only future sends, no typed-text mutation, GET/replay/recovery preserving selected context, same-ID/different-resource conflict, and hard-filter/preference retrieval behavior.

## Open decisions

1. Is selected resource a **hard evidence scope** or a **preference/disambiguation hint**?
2. Should the catalog be static/build-time or served through a new Worker endpoint?
3. Should selected context be shown on historical transcript turns or only in diagnostics? It should be persisted either way if it influenced the answer.
4. What are the initial stable project IDs, given PRD still leaves selected projects open?
