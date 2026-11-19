import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { renameSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createTestHarness } from 'wrangler';
import { chromium } from '@playwright/test';
import { jcs, normalizeCatalog } from '../../src/shared/public-catalog.ts';
import { chunkIdPreimage, contentHashPreimage } from '../../src/shared/public-evidence.ts';

const root = process.cwd();
const origin = 'http://127.0.0.1:5173';
const config = {
  main: join(root, 'tests/e2e/conversation-results-worker.ts'), compatibility_date: '2026-06-11', send_metrics: false,
  vars: { TRUSTED_BROWSER_ORIGIN: origin, CREATION_ADDRESS_MODE: 'local-fixed', CONVERSATION_CREATION_LIMIT: '100' },
  d1_databases: [{ binding: 'DB', database_name: 'results-disposable', database_id: '00000000-0000-0000-0000-000000000000', remote: false, migrations_dir: join(root, 'migrations') }],
};
const server = createTestHarness({ root: join(root, 'tests/e2e'), workers: [{ config: { ...config, name: 'one' } }, { config: { ...config, name: 'two' } }] });
try {
  const { url } = await server.listen();
  const workerUrl = url.href;
  const one = server.getWorker('one'), two = server.getWorker('two');
  await one.applyD1Migrations('DB');
  const { DB: db } = await one.getEnv();
  const at = (ms) => new Date(Date.parse('2026-01-01T00:00:00Z') + ms).toISOString();
  function publication(revision, ids) {
    const catalog = normalizeCatalog({ version: 1, catalogRevision: revision.repeat(40), resources: [{ resourceId: 'project', name: 'Project', description: 'Synthetic', documentIds: [ids[0]] }], documents: ids.map((documentId) => ({ documentId, sourcePath: `content/public/${documentId}.md` })) });
    return { catalog, hash: createHash('sha256').update(jcs(catalog)).digest('hex') };
  }
  const A = publication('a', ['doc-a', 'doc-b', 'zero-chunk']), B = publication('b', ['doc-a', 'doc-b', 'new-doc', 'zero-chunk']), C = publication('c', ['doc-a', 'doc-b']);
  async function activate(p, text = 'Fictional development evidence, not BC: épreuve 😀.', sectionTitle = 'Original synthetic heading é') {
    const statements = ['DELETE FROM public_chunks_fts', 'DELETE FROM public_chunks', 'DELETE FROM public_resource_documents', 'DELETE FROM public_resources', 'DELETE FROM public_documents', 'DELETE FROM active_publication'].map((sql) => db.prepare(sql));
    for (const d of p.catalog.documents) {
      const title = d.sourcePath.includes('-renamed') ? `${d.documentId} renamed title` : d.documentId;
      const document = { ...d, sourceRevision: p.catalog.catalogRevision, sourceTitle: title, metadata: { document_id: d.documentId, visibility: 'public', title, created_at: '2026-01-01T00:00:00Z', modified_at: '2026-01-01T00:00:00Z', reviewed_by: 'Fixture', reviewed_at: '2026-01-01T00:00:00Z' } };
      const chunks = d.documentId === 'zero-chunk' ? [] : [{ ...document,
        chunkId: createHash('sha256').update(chunkIdPreimage(d.documentId, 0)).digest('hex'),
        sectionTitle, text, location: 'lines:1-1', ordinal: 0, passage: { start: 1, end: 1 }, context: [],
      }];
      statements.push(db.prepare('INSERT INTO public_documents VALUES (?, ?, ?, ?)').bind(d.documentId, d.sourcePath, JSON.stringify(document), chunks.length));
      for (const chunk of chunks) {
        chunk.contentHash = createHash('sha256').update(contentHashPreimage(chunk)).digest('hex');
        statements.push(db.prepare('INSERT INTO public_chunks VALUES (?, ?, ?, ?)').bind(chunk.chunkId, chunk.documentId, chunk.ordinal, JSON.stringify(chunk)));
        statements.push(db.prepare('INSERT INTO public_chunks_fts (chunk_id, text) VALUES (?, ?)').bind(chunk.chunkId, chunk.text));
      }
    }
    for (const r of p.catalog.resources) {
      statements.push(db.prepare('INSERT INTO public_resources VALUES (?, ?, ?)').bind(r.resourceId, r.name, r.description));
      for (const d of r.documentIds) statements.push(db.prepare('INSERT INTO public_resource_documents VALUES (?, ?)').bind(r.resourceId, d));
    }
    statements.push(db.prepare('INSERT INTO active_publication VALUES (1, ?, ?, ?)').bind(p.catalog.catalogRevision, p.hash, at(0)));
    await db.batch(statements);
  }
  async function create() {
    const response = await one.fetch('http://local/api/conversations', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 201); return response.json();
  }
  const body = (requestId = randomUUID(), question = '  Épreuve 😀\r\ne\u0301  ', p = A) => ({ requestId, question, selection: { resourceIds: [], catalogRevision: p.catalog.catalogRevision, catalogHash: p.hash } });
  const send = async (c, input, { worker = one, time = 0, status = 'answered', language = 'fr', disabled = false, race, distinctBlocks = false } = {}) => {
    const response = await worker.fetch(`http://local/api/conversations/${c.conversationId}/messages`, { method: 'POST',
      headers: { Authorization: `Bearer ${c.sessionToken}`, 'Content-Type': 'application/json', 'X-Fixture-Now': at(time),
        'X-Fixture-Status': status, 'X-Fixture-Language': language, ...(disabled ? { 'X-Fixture-Disabled': '1' } : {}), ...(race ? { 'X-Fixture-Admission-Race': race } : {}), ...(distinctBlocks ? { 'X-Fixture-Distinct-Blocks': '1' } : {}) }, body: JSON.stringify(input) });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return { status: response.status, body: await response.json() };
  };
  const assertGuidance = (response, code, guidance) => {
    assert.equal(response.body.error.code, code);
    assert.match(response.body.error.message, guidance);
    assert.equal(response.body.error.retryable, false); assert.equal(response.body.error.retryMode, 'none');
  };
  const read = async (c, time = 0, disabled = false) => {
    const response = await two.fetch(`http://local/api/conversations/${c.conversationId}`, { headers: { Authorization: `Bearer ${c.sessionToken}`, 'X-Fixture-Now': at(time), ...(disabled ? { 'X-Fixture-Disabled': '1' } : {}) } });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return { status: response.status, body: await response.json() };
  };
  const prepare = async (c, input, gate, { path = 'prepare', action = 'submit', time = 0, language = 'fr', status = 'answered', controlledScope = false, distinctBlocks = false } = {}) => {
    const response = await one.fetch(`http://local/__fixture/${path}`, { method: 'POST', headers: { Authorization: `Bearer ${c.sessionToken}`, 'Content-Type': 'application/json', 'X-Fixture-Now': at(time), 'X-Fixture-Language': language, 'X-Fixture-Status': status, ...(controlledScope ? { 'X-Fixture-Controlled-Scope': '1' } : {}), ...(distinctBlocks ? { 'X-Fixture-Distinct-Blocks': '1' } : {}) }, body: JSON.stringify({ conversationId: c.conversationId, body: input, gate, action }) });
    return response.json();
  };
  const finalize = async (gate, time = 0) => (await one.fetch(`http://local/__fixture/finalize/${gate}`, { method: 'POST', headers: { 'X-Fixture-Now': at(time) } })).json();
  const acquire = async (gate, time = 0) => (await one.fetch(`http://local/__fixture/acquire/${gate}`, { method: 'POST', headers: { 'X-Fixture-Now': at(time) } })).json();
  const calls = async () => (await (await one.fetch('http://local/__fixture/calls')).json()).calls + (await (await two.fetch('http://local/__fixture/calls')).json()).calls;
  const tables = ['conversations', 'messages', 'conversation_processing_leases', 'answers', 'answer_blocks', 'source_excerpts', 'answer_block_sources'];
  const snapshot = async () => JSON.stringify((await db.batch(tables.map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY 1`)))).map((r) => r.results));
  const messages = async (c) => (await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY ordinal').bind(c.conversationId).all()).results;
  const lease = (c) => db.prepare('SELECT * FROM conversation_processing_leases WHERE conversation_id = ?').bind(c.conversationId).first();
  await activate(A);
  assert.deepEqual((await db.prepare('SELECT name FROM d1_migrations ORDER BY id').all()).results.map((r) => r.name),
    ['0001_local_bootstrap.sql', '0002_public_publication.sql', '0003_conversations.sql', '0004_conversation_creation_limits.sql', '0005_conversation_admission.sql']);
  assert.equal(await db.prepare("SELECT name FROM sqlite_schema WHERE name = 'answers'").first(), null);
  const upgrade = await create(), upgradeInput = body('before-results'), upgradeMessageId = randomUUID();
  const upgradeIdentity = { kind: 'direct', question: upgradeInput.question, ...upgradeInput.selection };
  const upgradeScope = { version: 1, mode: 'global_public', catalogRevision: A.catalog.catalogRevision, catalogHash: A.hash, resources: [], eligibleDocumentIds: A.catalog.documents.map((d) => d.documentId) };
  await db.batch([
    db.prepare('INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(upgradeMessageId, upgrade.conversationId, upgradeInput.requestId, 1,
      upgradeInput.question, at(0), upgradeMessageId, jcs(upgradeIdentity), JSON.stringify(upgradeScope)),
    db.prepare('INSERT INTO conversation_processing_leases VALUES (?, ?, ?, ?)').bind(upgrade.conversationId, upgradeInput.requestId, randomUUID(), Date.parse(at(40_000))),
  ]);
  const oldRows = async () => (await db.batch(['conversations', 'messages', 'conversation_processing_leases'].map((t) => db.prepare(`SELECT * FROM ${t} ORDER BY 1`)))).map((r) => r.results);
  const beforeUpgrade = await oldRows();
  renameSync(join(root, 'pending-conversation-results.sql'), join(root, 'migrations/0006_conversation_results.sql'));
  await one.applyD1Migrations('DB');
  assert.deepEqual(await oldRows(), beforeUpgrade);
  assert.equal((await db.prepare('SELECT name FROM d1_migrations ORDER BY id DESC LIMIT 1').first()).name, '0006_conversation_results.sql');
  assert.deepEqual(await prepare(upgrade, upgradeInput, 'upgrade', { path: 'prepare-existing' }), { prepared: true });
  const beforeExpiredUpgrade = await snapshot();
  assert.deepEqual(await finalize('upgrade', 40_000), { error: 'result_unavailable' });
  assert.equal(await snapshot(), beforeExpiredUpgrade);
  const upgradedResult = await finalize('upgrade');
  assert.equal(upgradedResult.status, 'answered'); assert.equal(upgradedResult.messageId, upgradeMessageId);
  assert.deepEqual(await messages(upgrade), beforeUpgrade[1]); assert.equal(await lease(upgrade), null);
  assert.deepEqual((await read(upgrade)).body.transcript[0].result, upgradedResult);
  assert.deepEqual((await send(upgrade, upgradeInput)).body, upgradedResult);
  console.log('PASS: populated 0005-to-0006 upgrade preserves admitted rows and guarded completion');
  // HTTP readiness and stale identities use the same public route and deciding snapshot.
  const idle = await create();
  assert.deepEqual((await read(idle, 0, true)).body.admission, { available: false, reason: 'processing_unavailable' });
  assert.deepEqual((await read(idle)).body.admission, { available: true });
  assertGuidance(await send(idle, { ...body(), question: '' }), 'invalid_request', /Vérifiez le format.*longueur/);
  assertGuidance(await send(idle, { ...body(), selection: { ...body().selection, resourceIds: ['project'] } }), 'invalid_scope', /Vérifiez la sélection.*périmètre public global/);
  assertGuidance(await send(idle, { requestId: 'retry', retryOfRequestId: 'missing' }), 'invalid_retry', /relance.*pas disponible.*question d’origine/);
  const stale = await send(idle, body('stale', 'Synthetic', B));
  assertGuidance(stale, 'catalog_stale', /Actualisez le catalogue.*envoyez explicitement/);
  assert.equal(stale.status, 409); assert.equal(stale.body.error.code, 'catalog_stale');
  assert.equal(stale.body.catalogRevision, A.catalog.catalogRevision); assert.equal(stale.body.catalogHash, A.hash);
  const changed = publication('d', ['doc-a', 'doc-b', 'zero-chunk']);
  const activation = [
    { sql: "UPDATE public_documents SET document_json = json_set(document_json, '$.sourceRevision', ?)", bindings: [changed.catalog.catalogRevision] },
    { sql: "UPDATE public_chunks SET chunk_json = json_set(chunk_json, '$.sourceRevision', ?)", bindings: [changed.catalog.catalogRevision] },
    { sql: 'UPDATE active_publication SET catalog_revision = ?, catalog_hash = ?', bindings: [changed.catalog.catalogRevision, changed.hash] },
  ];
  const registerRace = async (gate, statements) => {
    assert.deepEqual(await (await one.fetch('http://local/__fixture/publication-race', { method: 'POST', body: JSON.stringify({ gate, statements }) })).json(), { prepared: true });
  };
  await registerRace('A-to-B', activation);
  const racedStale = await send(idle, body(), { race: 'A-to-B' });
  assert.equal(racedStale.status, 409); assert.equal(racedStale.body.error.code, 'catalog_stale');
  assert.equal(racedStale.body.catalogRevision, changed.catalog.catalogRevision); assert.equal(racedStale.body.catalogHash, changed.hash);
  assert.equal((await messages(idle)).length, 0); assert.equal(await lease(idle), null);
  await activate(A);
  await registerRace('disappeared', [{ sql: 'DELETE FROM active_publication', bindings: [] }]);
  const absent = await send(idle, body(), { race: 'disappeared' });
  assertGuidance(absent, 'scope_unavailable', /périmètre initial.*pas élargi/);
  assert.equal(absent.body.error.code, 'scope_unavailable'); assert(!('catalogRevision' in absent.body)); assert(!('catalogHash' in absent.body));
  await activate(A);
  const distinct = await create(), distinctInput = body();
  await prepare(distinct, distinctInput, 'distinct', { status: 'partial', distinctBlocks: true });
  await activate(changed, 'Changed synthetic evidence, not BC.', 'Changed live heading');
  const distinctResult = await finalize('distinct');
  assert.deepEqual(distinctResult.blocks.map((b) => b.sourceIds), [['S2', 'S1'], ['S1', 'S2']]);
  assert.deepEqual(distinctResult.sourceExcerpts.map((s) => s.sectionTitle), ['Original synthetic heading é', 'Original synthetic heading é']);
  const exactTexts = ['  Synthetic block 1, not BC: épreuve 😀\r\nline é\t  ', '  Synthetic block 2, not BC: épreuve 😀\r\nline é\t  '];
  assert.deepEqual(distinctResult.blocks.map((b) => b.text), exactTexts);
  assert.deepEqual((await read(distinct)).body.transcript[0].result, distinctResult);
  assert.deepEqual((await send(distinct, distinctInput)).body, distinctResult);
  await activate(A);
  const controlled = await create(), controlledInput = body();
  await prepare(controlled, controlledInput, 'controlled-scope', { controlledScope: true });
  const controlledResult = await finalize('controlled-scope');
  assert.equal(controlledResult.blocks[0].text, '  Historical synthetic scope failure, not BC: é 😀\n  ');
  assert.equal(controlledResult.error.message, controlledResult.blocks[0].text);
  assert.deepEqual({ retryable: controlledResult.error.retryable, retryMode: controlledResult.error.retryMode }, { retryable: false, retryMode: 'none' });
  assert.deepEqual((await read(controlled)).body.transcript[0].result, controlledResult);
  assert.deepEqual((await send(controlled, controlledInput)).body, controlledResult);
  const c = await create(), outcomes = [];
  for (const [i, status] of ['answered', 'partial', 'clarification', 'refused', 'failed'].entries()) {
    const input = body(`status-${status}`), response = await send(c, input, { status, language: i % 2 ? 'en' : 'fr' });
    assert.equal(response.status, 200, JSON.stringify(response)); assert.equal(response.body.status, status);
    assert.equal(response.body.language, i % 2 ? 'en' : 'fr');
    assert.equal(response.body.submittedScope.mode, 'global_public');
    assert.deepEqual(response.body.submittedScope.eligibleDocumentIds, ['doc-a', 'doc-b', 'zero-chunk']);
    assert.deepEqual(response.body.blocks[0].sourceIds, ['answered', 'partial'].includes(status) ? ['S1', 'S2'] : []);
    assert.deepEqual(response.body.sourceExcerpts.map((s) => s.responseLocalId), ['answered', 'partial'].includes(status) ? ['S1', 'S2'] : []);
    assert.deepEqual(response.body.blocks.map((b) => b.kind), status === 'partial' ? ['paragraph', 'limitation'] : [status === 'answered' ? 'paragraph' : status === 'refused' ? 'refusal' : status === 'failed' ? 'error' : 'clarification']);
    if (status === 'failed') assert.deepEqual(response.body.error, { code: 'processing_unavailable', message: 'Le traitement est indisponible pour le moment.', retryable: true, retryMode: 'new_request' });
    else assert(!('error' in response.body));
    outcomes.push({ input, result: response.body });
    assert.equal(await lease(c), null);
    assert.deepEqual((await read(c)).body.transcript[i].result, response.body);
  }
  const beforeReplay = await snapshot(), beforeCalls = await calls();
  assertGuidance(await send(c, body()), 'turn_limit_reached', /limite de questions.*résultats enregistrés restent consultables/);
  assert.equal((await read(c)).body.admission.reason, 'turn_limit_reached', 'POST and GET effective cap agree');
  await activate(publication('f', ['replacement']));
  await db.prepare('DELETE FROM active_publication').run();
  for (const { input, result } of outcomes) {
    assert.deepEqual(await send(c, input, { worker: two, disabled: true }), { status: 200, body: result });
    assert.deepEqual((await read(c)).body.transcript.find((m) => m.requestId === input.requestId).result, result);
    assertGuidance(await send(c, { ...input, question: 'changed identity' }), 'request_conflict', /identifiant.*texte et le périmètre d’origine/);
  }
  assert.equal(await snapshot(), beforeReplay); assert.equal(await calls(), beforeCalls);
  // Fixture representing a previously recorded failure template/policy version.
  // Reads must return saved copy and retry metadata, not today's template values.
  const historical = structuredClone(outcomes.find((o) => o.result.status === 'failed'));
  historical.result.error.message = 'Ancien message fictif enregistré, sans attribution à BC.';
  historical.result.error.retryable = false; historical.result.error.retryMode = 'none';
  historical.result.blocks[0].text = historical.result.error.message;
  await db.batch([
    db.prepare('UPDATE answers SET error_json = ? WHERE id = ?').bind(JSON.stringify(historical.result.error), historical.result.answerId),
    db.prepare('UPDATE answer_blocks SET text = ? WHERE answer_id = ?').bind(historical.result.error.message, historical.result.answerId),
  ]);
  assert.deepEqual((await send(c, historical.input, { disabled: true })).body, historical.result);
  assert.deepEqual((await read(c)).body.transcript.find((m) => m.requestId === historical.input.requestId).result, historical.result);
  assert.equal(await calls(), beforeCalls);
  await activate(A);
  // Lost committed response: the caller discards the first body; GET and POST
  // subsequently return the exact persisted graph, without another processor call.
  const lost = await create(), lostInput = body();
  await send(lost, lostInput);
  const lostCalls = await calls(), savedLost = (await read(lost)).body.transcript[0].result;
  assert.deepEqual((await send(lost, lostInput)).body, savedLost); assert.equal(await calls(), lostCalls);
  // Saved replay wins even while a different request owns the live lease.
  await prepare(lost, body('other-owner'), 'other-owner');
  const owned = await snapshot();
  assert.deepEqual((await send(lost, lostInput)).body, savedLost); assert.equal(await snapshot(), owned);
  assertGuidance(await send(lost, body('busy'), { disabled: true }), 'conversation_busy', /autre question.*Attendez sa fin/);
  assertGuidance(await send(lost, body('other-owner'), { disabled: true }), 'request_in_progress', /Consultez son état sans la renvoyer/);

  // All six actual write boundaries, including after writes, must roll back all
  // result children, metadata, timestamps AND lease release, preserving admission.
  for (const [table, event] of [['answers', 'INSERT'], ['answer_blocks', 'INSERT'], ['source_excerpts', 'INSERT'], ['answer_block_sources', 'INSERT'], ['conversations', 'UPDATE'], ['conversation_processing_leases', 'DELETE']]) {
    const rollback = await create(), input = body(), gate = `rollback-${table}`;
    assert.deepEqual(await prepare(rollback, input, gate), { prepared: true });
    const admitted = await snapshot();
    await db.prepare(`CREATE TRIGGER fixture_result_fault AFTER ${event} ON ${table} BEGIN SELECT RAISE(ABORT, 'synthetic result fault'); END`).run();
    assert.deepEqual(await finalize(gate, 1_000), { error: 'result_unavailable' });
    assert.equal(await snapshot(), admitted, table);
    await db.prepare('DROP TRIGGER fixture_result_fault').run();
    const result = await finalize(gate, 1_000); assert.equal(result.status, 'answered', JSON.stringify(result));
    assert.equal(await lease(rollback), null);
    assert.equal((await db.prepare('SELECT modified_at FROM conversations WHERE id = ?').bind(rollback.conversationId).first()).modified_at, at(1_000));
    const complete = await snapshot(); assert.deepEqual(await finalize(gate, 1_000), result); assert.equal(await snapshot(), complete);
  }
  for (const [table, event] of [['answers', 'INSERT'], ['answer_blocks', 'INSERT'], ['conversations', 'UPDATE'], ['conversation_processing_leases', 'DELETE']]) {
    await activate(A); const rollback = await create(), gate = `failure-rollback-${table}`;
    await prepare(rollback, body(), gate); await activate(C);
    const before = await snapshot();
    await db.prepare(`CREATE TRIGGER fixture_failure_fault AFTER ${event} ON ${table} BEGIN SELECT RAISE(ABORT, 'synthetic failure metadata fault'); END`).run();
    assert.deepEqual(await finalize(gate), { error: 'result_unavailable' }); assert.equal(await snapshot(), before);
    await db.prepare('DROP TRIGGER fixture_failure_fault').run();
    assert.equal((await finalize(gate)).error.retryable, false);
  }
  await activate(A);
  // Independent Worker POST race: one execution owns admission; contenders can
  // observe in-progress or canonical replay, never two results/turns/executions.
  const raced = await create(), racedInput = body(), raceCalls = await calls();
  const race = await Promise.all(Array.from({ length: 8 }, (_, i) => send(raced, racedInput, { worker: i % 2 ? one : two })));
  const canonical = race.find((r) => r.status === 200).body;
  for (const r of race) if (r.status === 200) assert.deepEqual(r.body, canonical); else assert.equal(r.body.error.code, 'request_in_progress');
  assert.equal((await messages(raced)).length, 1); assert.equal(await calls(), raceCalls + 1);
  const duplicate = await create(), duplicateInput = body(); await prepare(duplicate, duplicateInput, 'duplicate');
  const duplicateResults = await Promise.all([finalize('duplicate'), finalize('duplicate')]);
  assert.deepEqual(duplicateResults[0], duplicateResults[1]);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM answers a JOIN messages m ON m.id = a.message_id WHERE m.conversation_id = ?').bind(duplicate.conversationId).first()).n, 1);
  // A service admission read can precede another completion. The atomic port
  // must return the saved result before busy/cap/publication checks.
  const terminalRace = await create(), terminalInput = body();
  assert.deepEqual(await prepare(terminalRace, terminalInput, 'terminal', { path: 'admit' }), { prepared: true });
  const winner = await send(terminalRace, terminalInput, { worker: two }); assert.equal(winner.status, 200);
  await prepare(terminalRace, body('successor'), 'successor');
  await db.prepare('DELETE FROM active_publication').run();
  const beforeTerminal = await snapshot();
  const terminal = await acquire('terminal'); assert.equal(terminal.status, 'completed'); assert.deepEqual(terminal.message.result, winner.body);
  assert.equal(await snapshot(), beforeTerminal);
  await activate(A);

  for (const mode of ['expired', 'successor', 'deleted', 'retained-expired', 'retention-with-live-lease']) {
    const fenced = await create(), input = body(), gate = `fence-${mode}`;
    await prepare(fenced, input, gate);
    if (mode === 'successor') assert.equal((await prepare(fenced, body('next'), undefined, { path: 'admit', time: 40_000 })).status, 'admitted');
    if (mode === 'retention-with-live-lease') await db.prepare('UPDATE conversations SET created_at = ? WHERE id = ?').bind(at(-90 * 86400000), fenced.conversationId).run();
    if (mode === 'deleted') await db.prepare('DELETE FROM conversations WHERE id = ?').bind(fenced.conversationId).run();
    const before = await snapshot();
    const response = await finalize(gate, mode === 'retained-expired' ? 90 * 86400000 : ['deleted', 'retention-with-live-lease'].includes(mode) ? 0 : 40_000);
    assert.deepEqual(response, { error: ['deleted', 'retained-expired', 'retention-with-live-lease'].includes(mode) ? 'conversation_unavailable' : 'result_unavailable' });
    assert.equal(await snapshot(), before, mode);
    if (mode === 'retained-expired') assert.equal((await read(fenced, 90 * 86400000)).status, 401);
  }
  const recovered = await create(), recoveredInput = body(); await prepare(recovered, recoveredInput, 'old-owner');
  const recovery = await prepare(recovered, recoveredInput, undefined, { path: 'admit', action: 'recover', time: 40_000 });
  assert.equal(recovery.status, 'recovered'); const recoveredSnapshot = await snapshot();
  assert.deepEqual(await finalize('old-owner', 40_000), { error: 'result_unavailable' }); assert.equal(await snapshot(), recoveredSnapshot);

  // All original members are checked, including an uncited, zero-chunk document.
  const withdrawal = await create(), withdrawalInput = body(); await prepare(withdrawal, withdrawalInput, 'withdrawal', { language: 'en' });
  await activate(C);
  const failure = await finalize('withdrawal'); assert.equal(failure.status, 'failed');
  assert.deepEqual(failure.error, { code: 'scope_unavailable', message: 'The documents for this question are no longer available.', retryable: false, retryMode: 'none' });
  assert.deepEqual(failure.sourceExcerpts, []); assert.deepEqual(failure.blocks.map((b) => b.kind), ['error']);
  assert.equal(failure.language, 'en');
  await activate(A); const withdrawalCalls = await calls();
  assert.deepEqual((await send(withdrawal, withdrawalInput)).body, failure);
  assert.deepEqual((await read(withdrawal)).body.transcript[0].result, failure); assert.equal(await calls(), withdrawalCalls);
  assert.equal((await send(withdrawal, { requestId: 'not-a-retry', retryOfRequestId: withdrawalInput.requestId })).body.error.code, 'invalid_retry');
  assert.equal((await messages(withdrawal)).length, 1);
  const refused = await create(), refusedInput = body();
  await prepare(refused, refusedInput, 'refused-withdrawal', { status: 'cited-refused' });
  await activate(C);
  const refusedFailure = await finalize('refused-withdrawal');
  assert.equal(refusedFailure.status, 'failed'); assert.equal(refusedFailure.error.code, 'scope_unavailable');
  assert.deepEqual(refusedFailure.sourceExcerpts, []); assert.deepEqual(refusedFailure.blocks.map((b) => b.kind), ['error']);
  assert.equal(refusedFailure.error.retryable, false); assert.equal(refusedFailure.error.retryMode, 'none');
  await activate(A); const refusedCalls = await calls();
  assert.deepEqual((await send(refused, refusedInput)).body, refusedFailure);
  assert.deepEqual((await read(refused)).body.transcript[0].result, refusedFailure); assert.equal(await calls(), refusedCalls);
  const languageFallback = await create();
  assert.equal((await send(languageFallback, body('english-history'), { language: 'en', status: 'clarification' })).body.language, 'en');
  const germanInput = body('german-factual');
  await prepare(languageFallback, germanInput, 'german-withdrawal', { language: 'de' });
  await activate(C);
  const languageFailure = await finalize('german-withdrawal');
  assert.equal(languageFailure.language, 'en'); assert.equal(languageFailure.status, 'failed');
  assert.equal(languageFailure.error.message, 'The documents for this question are no longer available.');
  assert.deepEqual(languageFailure.sourceExcerpts, []); assert.equal(languageFailure.error.retryable, false);
  assert.equal(languageFailure.error.retryMode, 'none');
  await activate(A); const languageCalls = await calls();
  assert.deepEqual((await send(languageFallback, germanInput)).body, languageFailure);
  assert.deepEqual((await read(languageFallback)).body.transcript[1].result, languageFailure); assert.equal(await calls(), languageCalls);
  for (const change of ['text', 'rename', 'addition', 'absent', 'incoherent']) {
    await activate(A);
    const provenance = await create(), input = body(), gate = `provenance-${change}`;
    const loaded = (await db.prepare('SELECT chunk_json FROM public_chunks ORDER BY document_id').all()).results.map((r) => JSON.parse(r.chunk_json));
    await prepare(provenance, input, gate);
    if (change === 'absent') await db.prepare('DELETE FROM active_publication').run();
    else if (change === 'incoherent') await db.prepare("UPDATE active_publication SET catalog_revision = ?").bind('e'.repeat(40)).run();
    else {
      const p = change === 'addition' ? B : publication('d', ['doc-a', 'doc-b', 'zero-chunk']);
      if (change === 'rename') { p.catalog.documents.forEach((d) => { d.sourcePath = d.sourcePath.replace('.md', '-renamed.md'); }); p.hash = createHash('sha256').update(jcs(p.catalog)).digest('hex'); }
      await activate(p, 'Changed fictional text, no BC attribution.');
    }
    const result = await finalize(gate);
    if (['absent', 'incoherent'].includes(change)) { assert.equal(result.error.code, 'scope_unavailable'); assert.deepEqual(result.sourceExcerpts, []); }
    else {
      assert.equal(result.status, 'answered'); assert.deepEqual(result.submittedScope.eligibleDocumentIds, ['doc-a', 'doc-b', 'zero-chunk']);
      for (const excerpt of result.sourceExcerpts) {
        const original = loaded.find((c) => c.chunkId === excerpt.sourceChunkId);
        assert.deepEqual({ text: excerpt.excerpt, hash: excerpt.contentHash, revision: excerpt.sourceRevision, path: excerpt.sourcePath, title: excerpt.sourceTitle, section: excerpt.sectionTitle, location: excerpt.location },
          { text: original.text, hash: original.contentHash, revision: original.sourceRevision, path: original.sourcePath, title: original.sourceTitle, section: original.sectionTitle, location: original.location });
      }
      assert.equal(result.sourceExcerpts.length, 2);
      await db.prepare('DELETE FROM active_publication').run();
      assert.deepEqual((await send(provenance, input, { disabled: true })).body, result);
    }
  }
  await activate(A);
  const plan = (await db.prepare(`EXPLAIN QUERY PLAN SELECT e.*, s.response_local_id FROM answer_block_sources e
    JOIN source_excerpts s ON s.answer_id = e.answer_id AND s.id = e.source_excerpt_id
    JOIN answers a ON a.id = e.answer_id JOIN messages m ON m.id = a.message_id
    WHERE m.conversation_id = ? ORDER BY e.sequence`).bind(c.conversationId).all()).results;
  assert(plan.some((r) => r.detail.includes('answer_block_sources_by_answer')), JSON.stringify(plan));
  assert(!plan.some((r) => /SCAN e\b|AUTOMATIC/.test(r.detail)), JSON.stringify(plan));
  // Same-answer composite FKs prevent a block citing another answer's excerpt.
  const block = (await db.prepare('SELECT * FROM answer_blocks WHERE kind = ? LIMIT 1').bind('paragraph').first());
  const foreign = await db.prepare('SELECT * FROM source_excerpts WHERE answer_id <> ? LIMIT 1').bind(block.answer_id).first();
  await assert.rejects(db.prepare('INSERT INTO answer_block_sources VALUES (?, ?, ?, 99)').bind(block.answer_id, block.id, foreign.id).run(), /FOREIGN KEY/);
  const constraintConversation = await create();
  await prepare(constraintConversation, body(), 'constraints');
  const constraintMessage = (await messages(constraintConversation))[0];
  for (const metadata of [{}, { code: 'scope_unavailable', message: 'safe', retryable: true, retryMode: 'new_request' },
    { code: 'scope_unavailable', message: 'safe', retryable: false },
    { code: 'scope_unavailable', message: null, retryable: false, retryMode: 'none' },
    { code: 'processing_unavailable', message: 'safe', retryable: true, retryMode: 'none' }]) {
    await assert.rejects(db.prepare('INSERT INTO answers VALUES (?, ?, ?, ?, ?, ?)').bind(randomUUID(), constraintMessage.id, 'failed', 'fr', JSON.stringify(metadata), at(0)).run(), /CHECK/);
  }
  // Malformed body/output authority cannot enter persistence; authentication wins.
  const invalid = await create();
  for (const input of [{ ...body(), sourceExcerpts: [] }, { ...body(), submittedScope: {} }, { ...body(), retryOfRequestId: 'mixed' }, { ...body(), question: '😀'.repeat(1001) }]) assert.equal((await send(invalid, input)).status, 400);
  for (const token of ['', '0'.repeat(64), c.sessionToken]) {
    const response = await one.fetch(`http://local/api/conversations/${invalid.conversationId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: '{malformed' });
    assert.equal(response.status, 401); assert.deepEqual(await response.json(), { error: 'conversation_unavailable' });
  }
  const badJson = await one.fetch(`http://local/api/conversations/${invalid.conversationId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${invalid.sessionToken}`, 'Content-Type': 'application/json' }, body: '{malformed' });
  assert.equal(badJson.status, 400); assert.equal((await badJson.json()).error.code, 'invalid_request');
  assert.equal((await messages(invalid)).length, 0);
  assert.equal((await send(invalid, body(), { disabled: true })).status, 503); assert.equal((await messages(invalid)).length, 0);

  const largeIdentity = await create(), largeInput = body('r'.repeat(500_001));
  const largeFailure = await send(largeIdentity, largeInput, { status: 'failed' });
  assert.equal(largeFailure.status, 200); assert.equal(largeFailure.body.status, 'failed'); assert.equal(largeFailure.body.requestId, largeInput.requestId);
  assert.deepEqual((await read(largeIdentity)).body.transcript[0].result, largeFailure.body);
  assert.deepEqual((await send(largeIdentity, largeInput, { disabled: true })).body, largeFailure.body);
  const nul = await create(), nulInput = body();
  const nulResponse = await send(nul, nulInput, { status: 'nul-text' });
  assert.equal(nulResponse.status, 200); assert.equal(nulResponse.body.status, 'failed');
  assert.equal(nulResponse.body.error.code, 'invalid_result'); assert.equal(await lease(nul), null);
  assert(!nulResponse.body.blocks[0].text.includes('\0'));
  assert.deepEqual((await read(nul)).body.transcript[0].result, nulResponse.body);
  const nulCalls = await calls(); assert.deepEqual((await send(nul, nulInput)).body, nulResponse.body); assert.equal(await calls(), nulCalls);
  const malformed = await create();
  const invalidDraft = await send(malformed, body('invalid-draft'), { status: 'invented' });
  assert.equal(invalidDraft.status, 200); assert.equal(invalidDraft.body.error.code, 'invalid_result');
  assert.deepEqual(invalidDraft.body.sourceExcerpts, []);
  const dependency = await send(malformed, body('dependency'), { status: 'throw' });
  assert.equal(dependency.status, 200); assert.equal(dependency.body.error.code, 'processing_unavailable');
  assert(!JSON.stringify(dependency).includes('raw dependency'));
  const unknown = await create(), unknownInput = body();
  await db.prepare(`CREATE TRIGGER fixture_unknown AFTER INSERT ON answers BEGIN SELECT RAISE(ABORT, 'synthetic persistence fault'); END`).run();
  const unknownResponse = await send(unknown, unknownInput);
  assert.equal(unknownResponse.status, 503); assert.deepEqual(unknownResponse.body, { requestId: unknownInput.requestId,
    error: { code: 'result_unavailable', message: 'Impossible de récupérer le résultat pour le moment.', retryable: true, retryMode: 'same_request' } });
  await db.prepare('DROP TRIGGER fixture_unknown').run();
  assert.equal((await messages(unknown)).length, 1);
  const interrupted = (await read(unknown, 40_000)).body.transcript[0];
  assert.equal(interrupted.status, 'interrupted'); assert(!('result' in interrupted));
  const unknownCalls = await calls(); assert.equal((await send(unknown, unknownInput, { time: 40_000 })).status, 503); assert.equal(await calls(), unknownCalls);
  // Conversation-owned result children cascade; no historical live-publication FK.
  const deleteAnswerId = savedLost.answerId;
  await db.prepare('DELETE FROM conversations WHERE id = ?').bind(lost.conversationId).run();
  for (const table of ['answers', 'answer_blocks', 'source_excerpts', 'answer_block_sources']) {
    assert.equal((await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${table === 'answers' ? 'id' : 'answer_id'} = ?`).bind(deleteAnswerId).first()).n, 0);
  }
  assert.equal((await read(lost)).status, 401); assert.equal((await send(lost, lostInput)).status, 401);

  const browser = await chromium.launch({ executablePath: process.argv[2], env: process.env });
  try {
    const page = await browser.newPage();
    await page.route('**/*', (route) => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto(workerUrl);
    const browserConversation = await create();
    for (const status of ['answered', 'partial', 'clarification', 'refused', 'failed']) {
      const input = body();
      const result = await page.evaluate(async ({ credentials, input, status }) => {
        const path = `/api/conversations/${credentials.conversationId}`;
        const headers = { Authorization: `Bearer ${credentials.sessionToken}`, 'Content-Type': 'application/json', 'X-Fixture-Status': status };
        const post = await fetch(`${path}/messages`, { method: 'POST', headers, body: JSON.stringify(input) });
        const result = await post.json();
        const get = await fetch(path, { headers });
        const view = await get.json();
        const replay = await fetch(`${path}/messages`, { method: 'POST', headers: { ...headers, 'X-Fixture-Disabled': '1' }, body: JSON.stringify(input) });
        return { status: [post.status, get.status, replay.status], cache: [post, get, replay].map((r) => r.headers.get('Cache-Control')),
          result, saved: view.transcript.find((m) => m.requestId === input.requestId), replay: await replay.json() };
      }, { credentials: browserConversation, input, status });
      assert.deepEqual(result.status, [200, 200, 200]); assert.deepEqual(result.cache, ['no-store', 'no-store', 'no-store']);
      assert.equal(result.result.status, status); assert.equal(result.saved.status, 'completed');
      assert.deepEqual(result.result, result.saved.result); assert.deepEqual(result.result, result.replay);
      assert(!JSON.stringify(result).includes('attemptId'));
    }
  } finally { await browser.close(); }
  const beforeMigration = await snapshot(); await one.applyD1Migrations('DB'); assert.equal(await snapshot(), beforeMigration);
  console.log('PASS: real D1 complete results; every-write rollback, stale/deleted/expired fences, terminal races, all five schemas, canonical POST/GET/replay, scope withdrawal false/none after restoration, loaded provenance and Chromium. Synthetic only, no BC evidence.');
} finally { await server.close(); }
