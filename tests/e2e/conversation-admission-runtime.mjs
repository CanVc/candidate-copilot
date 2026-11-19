import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createTestHarness } from 'wrangler';
import { chromium } from '@playwright/test';
import { jcs, normalizeCatalog } from '../../src/shared/public-catalog.ts';
import { chunkIdPreimage, contentHashPreimage } from '../../src/shared/public-evidence.ts';

const root = process.cwd();
const origin = 'http://127.0.0.1:5173';
const config = {
  main: join(root, 'tests/e2e/conversation-admission-worker.ts'), compatibility_date: '2026-06-11', send_metrics: false,
  vars: { TRUSTED_BROWSER_ORIGIN: origin, CREATION_ADDRESS_MODE: 'local-fixed', CONVERSATION_CREATION_LIMIT: '100' },
  d1_databases: [{ binding: 'DB', database_name: 'admission-disposable', database_id: '00000000-0000-0000-0000-000000000000', remote: false, migrations_dir: join(root, 'migrations') }],
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
  const A = publication('a', ['doc-a', 'zero-chunk']), B = publication('b', ['doc-a', 'new-doc', 'zero-chunk']), C = publication('c', ['doc-a']);
  async function activate(p, text = 'Synthetic evidence: épreuve 😀.') {
    const statements = ['DELETE FROM public_chunks_fts', 'DELETE FROM public_chunks', 'DELETE FROM public_resource_documents', 'DELETE FROM public_resources', 'DELETE FROM public_documents', 'DELETE FROM active_publication'].map((sql) => db.prepare(sql));
    for (const d of p.catalog.documents) {
      const document = { ...d, sourceRevision: p.catalog.catalogRevision, sourceTitle: d.documentId, metadata: { document_id: d.documentId, visibility: 'public', title: d.documentId, created_at: '2026-01-01T00:00:00Z', modified_at: '2026-01-01T00:00:00Z', reviewed_by: 'Fixture', reviewed_at: '2026-01-01T00:00:00Z' } };
      const chunks = d.documentId === 'zero-chunk' ? [] : [{ ...document,
        chunkId: createHash('sha256').update(chunkIdPreimage(d.documentId, 0)).digest('hex'),
        sectionTitle: null, text, location: 'lines:1-1', ordinal: 0, passage: { start: 1, end: 1 }, context: [],
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
  const pendingGates = new Map();
  const send = async (c, input, { worker = one, time = 0, action = 'submit', limits = {}, gate } = {}) => {
    const response = await worker.fetch('http://local/__fixture/admit', { method: 'POST', headers: { Authorization: `Bearer ${c.sessionToken}`, 'Content-Type': 'application/json', 'X-Fixture-Now': at(time), ...(gate ? { 'X-Fixture-Gate': gate } : {}) }, body: JSON.stringify({ conversationId: c.conversationId, body: input, action, limits }) });
    const result = await response.json();
    if (gate && result.prepared) return new Promise((resolve) => pendingGates.set(gate, resolve));
    return result;
  };
  const read = async (c, time = 0, worker = two) => {
    const response = await worker.fetch(`http://local/api/conversations/${c.conversationId}`, { headers: { Authorization: `Bearer ${c.sessionToken}`, 'X-Fixture-Now': at(time) } });
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return { status: response.status, body: await response.json() };
  };
  const rows = async (c) => (await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY ordinal').bind(c.conversationId).all()).results;
  const conversation = (c) => db.prepare('SELECT * FROM conversations WHERE id = ?').bind(c.conversationId).first();
  const snapshot = async (c) => JSON.stringify((await db.batch([
    db.prepare('SELECT * FROM conversations WHERE id = ?').bind(c.conversationId),
    ...['messages', 'conversation_processing_leases'].map((table) => db.prepare(`SELECT * FROM ${table} WHERE conversation_id = ?`).bind(c.conversationId)),
  ])).map((r) => r.results));
  async function waiting(gate) {
    for (let i = 0; i < 100; i++) { if ((await (await one.fetch(`http://local/__fixture/gate/${gate}`)).json()).waiting && pendingGates.has(gate)) return; await delay(5); }
    throw new Error('Expected service publication gate');
  }
  const release = async (gate, time = 0) => {
    const response = await one.fetch(`http://local/__fixture/gate/${gate}`, { method: 'POST', headers: { 'X-Fixture-Now': at(time) } });
    assert(pendingGates.has(gate)); pendingGates.get(gate)(await response.json()); pendingGates.delete(gate);
  };

  const empty = await create();
  assert.deepEqual(await send(empty, body()), { error: 'scope_unavailable' });
  await activate(A);
  const c = await create(), input = body();
  const raced = await Promise.all(Array.from({ length: 12 }, (_, i) => send(c, input, { worker: i % 2 ? one : two })));
  const admitted = raced.find((r) => r.status === 'admitted');
  assert(admitted); assert.equal(raced.filter((r) => r.status === 'admitted').length, 1);
  assert(raced.filter((r) => r !== admitted).every((r) => r.error === 'request_in_progress'));
  assert.equal((await rows(c)).length, 1);
  assert.deepEqual((await db.prepare('SELECT document_id, chunk_count FROM public_documents ORDER BY document_id').all()).results,
    [{ document_id: 'doc-a', chunk_count: 1 }, { document_id: 'zero-chunk', chunk_count: 0 }]);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM public_chunks_fts').first()).n, 1);
  assert.deepEqual(admitted.message.submittedScope.eligibleDocumentIds, ['doc-a', 'zero-chunk']);
  assert.equal(admitted.message.question, input.question); assert.equal(admitted.message.contextAnchorMessageId, admitted.message.messageId);
  const unchanged = await snapshot(c);
  assert.deepEqual(await send(c, body()), { error: 'conversation_busy' });
  for (const changed of [{ ...input, question: input.question.trim() }, { ...input, selection: { ...input.selection, resourceIds: ['project'] } }, { ...input, selection: { ...input.selection, catalogHash: 'f'.repeat(64) } }, { requestId: input.requestId, retryOfRequestId: 'old' }]) assert.deepEqual(await send(c, changed), { error: 'request_conflict' });
  const active = await read(c);
  assert.equal(active.body.transcript[0].status, 'in_progress'); assert.equal(active.body.admission.reason, 'conversation_busy');
  assert(!JSON.stringify(active.body).includes(admitted.lease.attemptId));
  assert.equal(await snapshot(c), unchanged, 'rejection and reads never mutate/count/renew');
  await assert.rejects(db.prepare("UPDATE messages SET question = 'changed' WHERE conversation_id = ?").bind(c.conversationId).run(), /Immutable/);
  await activate(B);
  assert.deepEqual(await send(c, input), { error: 'request_in_progress' }, 'saved identity before stale catalog');
  assert.equal((await send(c, input, { time: 40_000 })).status, 'interrupted');
  assert.equal(await snapshot(c), unchanged, 'ordinary resubmission never automatically recovers');
  const recovered = await send(c, input, { time: 40_000, action: 'recover', worker: two });
  assert.equal(recovered.status, 'recovered'); assert.deepEqual(recovered.message, admitted.message); assert.notEqual(recovered.lease.attemptId, admitted.lease.attemptId);
  assert.equal((await rows(c)).length, 1);
  const oldRow = (await rows(c))[0];
  const next = body('new-question', 'new topic', B);
  assert.equal((await send(c, next, { time: 80_000 })).status, 'admitted');
  const mixed = await read(c, 80_000);
  assert.deepEqual(mixed.body.transcript.map((message) => ({ requestId: message.requestId, status: message.status })),
    [{ requestId: input.requestId, status: 'interrupted' }, { requestId: next.requestId, status: 'in_progress' }]);
  assert.deepEqual(mixed.body.processing, { status: 'in_progress', requestId: next.requestId });
  const live = await snapshot(c);
  assert.deepEqual(await send(c, input, { time: 80_000, action: 'recover' }), { error: 'conversation_busy' });
  assert.equal(await snapshot(c), live); assert.deepEqual((await rows(c))[0], oldRow);
  // A stale owner cannot release or change the successor using its fenced ID.
  assert.equal((await db.prepare('DELETE FROM conversation_processing_leases WHERE conversation_id = ? AND attempt_id = ? AND processing_until > ?').bind(c.conversationId, admitted.lease.attemptId, Date.parse(at(80_000))).run()).meta.changes, 0);
  await activate(C);
  assert.deepEqual(await send(c, input, { time: 120_000, action: 'recover' }), { error: 'scope_unavailable' });
  assert.deepEqual((await rows(c))[0], oldRow);
  const unavailableRead = await read(c, 120_000);
  assert.deepEqual(unavailableRead.body.transcript[0].submittedScope, admitted.message.submittedScope);
  assert.equal(unavailableRead.body.transcript[0].status, 'interrupted');

  await activate(A);
  const competing = await create();
  const different = await Promise.all(Array.from({ length: 10 }, (_, i) => send(competing, body(), { worker: i % 2 ? one : two })));
  assert.equal(different.filter((r) => r.status === 'admitted').length, 1);
  assert(different.filter((r) => !r.status).every((r) => r.error === 'conversation_busy'));
  const cap = await create(), capInput = body('first');
  for (let i = 0; i < 20; i++) assert.equal((await send(cap, i === 0 ? capInput : body(), { time: i * 40_000 })).status, 'admitted');
  assert.deepEqual(await send(cap, body(), { time: 800_000 }), { error: 'turn_limit_reached' });
  assert.equal((await read(cap, 800_000)).body.admission.reason, 'turn_limit_reached');
  assert.equal((await send(cap, capInput, { time: 800_000, action: 'recover' })).status, 'recovered');
  assert.equal((await rows(cap)).length, 20);
  const configured = await create();
  assert.deepEqual(await send(configured, body('too-long', '😀'.repeat(4)), { limits: { maxQuestionCharacters: 3 } }), { error: 'invalid_request' });
  assert.equal((await send(configured, body('exact', '😀\r\n'), { limits: { maxQuestionCharacters: 3, maxMessages: 1, leaseMilliseconds: 7 } })).lease.until, Date.parse(at(7)));
  assert.deepEqual(await send(configured, body(), { time: 7, limits: { maxMessages: 1 } }), { error: 'turn_limit_reached' });

  // Fault every business/control mutation: the D1 batch must roll back lease,
  // message/count and modified_at, including first-ever deferred-FK acquisition.
  for (const [table, event] of [['conversation_processing_leases', 'INSERT'], ['messages', 'INSERT'], ['conversations', 'UPDATE']]) {
    const rollback = await create(); const before = await snapshot(rollback);
    await db.prepare(`CREATE TRIGGER fixture_rollback ${table === 'conversations' ? 'AFTER' : 'BEFORE'} ${event} ON ${table} BEGIN SELECT RAISE(ABORT, 'synthetic fault'); END`).run();
    assert.deepEqual(await send(rollback, body(), { time: 1_000 }), { error: 'result_unavailable' });
    assert.equal(await snapshot(rollback), before);
    await db.prepare('DROP TRIGGER fixture_rollback').run();
    const beforeSuccess = await conversation(rollback);
    assert.equal((await send(rollback, body(), { time: 1_000 })).status, 'admitted');
    assert.equal((await conversation(rollback)).modified_at, at(1_000));
    assert.equal(beforeSuccess.modified_at, at(0));
  }
  const recoveryRollback = await create(), recoveryInput = body();
  await send(recoveryRollback, recoveryInput);
  for (const table of ['conversation_processing_leases', 'conversations']) {
    const before = await snapshot(recoveryRollback);
    await db.prepare(`CREATE TRIGGER fixture_recovery_rollback ${table === 'conversations' ? 'AFTER' : 'BEFORE'} UPDATE ON ${table} BEGIN SELECT RAISE(ABORT, 'synthetic recovery fault'); END`).run();
    assert.deepEqual(await send(recoveryRollback, recoveryInput, { time: 40_000, action: 'recover' }), { error: 'result_unavailable' });
    assert.equal(await snapshot(recoveryRollback), before, 'recovery failure preserves old fenced owner and immutable message');
    await db.prepare('DROP TRIGGER fixture_recovery_rollback').run();
  }
  assert.equal((await conversation(recoveryRollback)).modified_at, at(0));
  assert.equal((await send(recoveryRollback, recoveryInput, { time: 40_000, action: 'recover' })).status, 'recovered');
  assert.equal((await conversation(recoveryRollback)).modified_at, at(40_000));
  // A duplicate can become interrupted while its first caller is paused. The
  // write boundary must not falsely report a live owner or automatically recover.
  const delayed = await create(), delayedInput = body();
  const delayedCall = send(delayed, delayedInput, { gate: 'delayed' }); await waiting('delayed');
  const winner = await send(delayed, delayedInput, { worker: two });
  const beforeDelayed = await snapshot(delayed); await release('delayed', 40_000);
  assert.deepEqual(await delayedCall, { status: 'interrupted', message: winner.message });
  assert.equal(await snapshot(delayed), beforeDelayed);
  // Identity comparison is repeated at mutation even if the competing owner
  // has already expired; neither state permits changing the winning message.
  for (const time of [0, 40_000]) {
    const conflict = await create(), losingInput = body('same-id', 'losing text');
    const gate = `identity-${time}`;
    const losingCall = send(conflict, losingInput, { gate }); await waiting(gate);
    const winningCall = await send(conflict, { ...losingInput, question: 'winning text' }, { worker: two });
    assert.equal(winningCall.status, 'admitted');
    const winnerSnapshot = await snapshot(conflict); await release(gate, time);
    assert.deepEqual(await losingCall, { error: 'request_conflict' });
    assert.equal(await snapshot(conflict), winnerSnapshot);
    assert.equal((await rows(conflict))[0].question, 'winning text');
  }
  // Last-slot contenders are counted only by the transaction, even when both
  // application validations observed the same available slot.
  const lastSlot = await create(); await send(lastSlot, body(), { limits: { maxMessages: 2 } });
  const lastPending = send(lastSlot, body(), { time: 40_000, limits: { maxMessages: 2 }, gate: 'last-slot' }); await waiting('last-slot');
  assert.equal((await send(lastSlot, body(), { worker: two, time: 40_000, limits: { maxMessages: 2 } })).status, 'admitted');
  await release('last-slot', 80_000); assert.deepEqual(await lastPending, { error: 'turn_limit_reached' });
  assert.equal((await rows(lastSlot)).length, 2);
  // Exact read/write race: activation after validation must never mix identity
  // and registry. No automatic retry against B is allowed.
  const publicationRace = await create(), raceBody = body();
  const pending = send(publicationRace, raceBody, { gate: 'publication' }); await waiting('publication');
  await activate(B); await release('publication');
  assert.deepEqual(await pending, { error: 'catalog_stale' }); assert.equal((await rows(publicationRace)).length, 0);
  assert.equal((await send(publicationRace, body('b', 'B question', B))).status, 'admitted');
  assert.deepEqual(JSON.parse((await rows(publicationRace))[0].submitted_scope).eligibleDocumentIds, ['doc-a', 'new-doc', 'zero-chunk']);

  await activate(A);
  const textOnly = await create(), textInput = body();
  const textAdmission = await send(textOnly, textInput);
  assert.equal(textAdmission.status, 'admitted');
  const originalChunk = JSON.parse((await db.prepare('SELECT chunk_json FROM public_chunks WHERE document_id = ?').bind('doc-a').first()).chunk_json);
  const textUpdate = publication('d', ['doc-a', 'zero-chunk']);
  await activate(textUpdate, 'Updated synthetic evidence, same documentary members.');
  const updatedChunk = JSON.parse((await db.prepare('SELECT chunk_json FROM public_chunks WHERE document_id = ?').bind('doc-a').first()).chunk_json);
  assert.equal(updatedChunk.chunkId, originalChunk.chunkId);
  assert.notEqual(updatedChunk.contentHash, originalChunk.contentHash);
  assert.notEqual(updatedChunk.sourceRevision, originalChunk.sourceRevision);
  assert.equal((await db.prepare('SELECT text FROM public_chunks_fts WHERE chunk_id = ?').bind(updatedChunk.chunkId).first()).text, updatedChunk.text);
  const textRecovery = await send(textOnly, textInput, { time: 40_000, action: 'recover', worker: two });
  assert.equal(textRecovery.status, 'recovered'); assert.deepEqual(textRecovery.message, textAdmission.message);
  assert.notEqual(textRecovery.lease.attemptId, textAdmission.lease.attemptId);
  assert.equal((await rows(textOnly)).length, 1);
  // Same-pointer corruption at the write boundary must fail the complete guard.
  for (const [name, corrupt] of [
    ['registry', "UPDATE public_documents SET document_json = json_set(document_json, '$.metadata.visibility', 'private') WHERE document_id = 'doc-a'"],
    ['mapping', 'DELETE FROM public_resource_documents'],
    ['label', "UPDATE public_resources SET name = 'Changed'"],
    ['chunk', "UPDATE public_chunks SET chunk_json = json_set(chunk_json, '$.text', 'corrupt changed text') WHERE document_id = 'doc-a'"],
    ['fts-text', "UPDATE public_chunks_fts SET text = 'corrupt changed FTS text'"],
    ['fts', "INSERT INTO public_chunks_fts VALUES ('unexpected', 'unexpected')"],
  ]) {
    await activate(A); const corruptConversation = await create();
    const pending = send(corruptConversation, body(), { gate: name }); await waiting(name);
    await db.prepare(corrupt).run(); await release(name);
    assert.deepEqual(await pending, { error: 'scope_unavailable' }); assert.equal((await rows(corruptConversation)).length, 0);
    assert.deepEqual(await send(corruptConversation, body()), { error: 'scope_unavailable' }, 'corrupt pre-read also fails closed');
  }
  await activate(A);
  for (const expire of [false, true]) {
    const fenced = await create(); const pending = send(fenced, body(), { gate: 'fencing' }); await waiting('fencing');
    if (!expire) await db.prepare('DELETE FROM conversations WHERE id = ?').bind(fenced.conversationId).run();
    await release('fencing', expire ? 90 * 86400000 : 0);
    assert.deepEqual(await pending, { error: 'conversation_unavailable' }); assert.equal((await rows(fenced)).length, 0);
  }
  const recoveryDeleted = await create(), recoveryDeletedInput = body(); await send(recoveryDeleted, recoveryDeletedInput);
  const staleRecovery = send(recoveryDeleted, recoveryDeletedInput, { time: 40_000, action: 'recover', gate: 'deleted-recovery' }); await waiting('deleted-recovery');
  await db.prepare('DELETE FROM conversations WHERE id = ?').bind(recoveryDeleted.conversationId).run();
  await release('deleted-recovery', 40_000); assert.deepEqual(await staleRecovery, { error: 'conversation_unavailable' });
  assert.equal((await rows(recoveryDeleted)).length, 0);
  const unavailableCatalog = await create(), savedInput = body(); await send(unavailableCatalog, savedInput);
  await db.prepare('DELETE FROM active_publication').run();
  assert.deepEqual(await send(unavailableCatalog, savedInput), { error: 'request_in_progress' });
  assert.equal((await read(unavailableCatalog)).body.transcript.length, 1);
  assert.deepEqual(await send(unavailableCatalog, savedInput, { time: 40_000, action: 'recover' }), { error: 'scope_unavailable' });
  const noCatalog = await create(); assert.deepEqual(await send(noCatalog, body()), { error: 'scope_unavailable' });
  await activate(A);
  await db.batch(['DELETE FROM public_chunks_fts', 'DELETE FROM public_chunks', 'DELETE FROM public_resource_documents', 'DELETE FROM public_resources', 'DELETE FROM public_documents'].map((sql) => db.prepare(sql)));
  assert.deepEqual(await send(noCatalog, body()), { error: 'scope_unavailable' }); assert.equal((await rows(noCatalog)).length, 0);
  await activate(A);
  // Recovery races another new owner after the service check, not just before it.
  const recoveryRace = await create(), original = body(); await send(recoveryRace, original);
  const recovery = send(recoveryRace, original, { time: 40_000, action: 'recover', gate: 'recovery' }); await waiting('recovery');
  assert.equal((await send(recoveryRace, body(), { worker: two, time: 40_000 })).status, 'admitted');
  const successor = await snapshot(recoveryRace); await release('recovery', 40_000);
  assert.deepEqual(await recovery, { error: 'conversation_busy' }); assert.equal(await snapshot(recoveryRace), successor);
  await db.prepare('DELETE FROM conversations WHERE id = ?').bind(recoveryRace.conversationId).run();
  assert.equal((await rows(recoveryRace)).length, 0);
  assert.equal((await db.prepare('SELECT * FROM conversation_processing_leases WHERE conversation_id = ?').bind(recoveryRace.conversationId).all()).results.length, 0);
  // Actual Chromium uses the authenticated public GET only. No production
  // message POST/UI or browser-canonical transcript is introduced by the fixture.
  const browser = await chromium.launch({ executablePath: process.argv[2], env: process.env });
  try {
    const page = await browser.newPage();
    await page.route('**/*', (route) => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto(workerUrl);
    const browserConversation = await create(), browserInput = body();
    const browserAdmission = await send(browserConversation, browserInput);
    const beforeRead = await snapshot(browserConversation);
    for (const time of [0, 40_000]) {
      const result = await page.evaluate(async ({ credentials, time, workerUrl }) => {
        const response = await fetch(new URL(`/api/conversations/${credentials.conversationId}`, workerUrl), {
          headers: { Authorization: `Bearer ${credentials.sessionToken}`, 'X-Fixture-Now': time },
        });
        return { status: response.status, cache: response.headers.get('Cache-Control'), view: await response.json() };
      }, { credentials: browserConversation, time: at(time), workerUrl });
      assert.equal(result.status, 200); assert.equal(result.cache, 'no-store');
      assert.equal(result.view.transcript.length, 1); assert.equal(result.view.transcript[0].question, browserInput.question);
      assert.deepEqual(result.view.transcript[0].submittedScope, browserAdmission.message.submittedScope);
      assert.equal(result.view.transcript[0].status, time ? 'interrupted' : 'in_progress');
      assert.deepEqual(result.view.admission, { available: false, reason: time ? 'processing_unavailable' : 'conversation_busy' });
      assert(!JSON.stringify(result.view).includes(browserAdmission.lease.attemptId));
    }
    assert.equal(await snapshot(browserConversation), beforeRead, 'browser reads never renew, mutate or count');
  } finally { await browser.close(); }
  await one.applyD1Migrations('DB');
  assert.deepEqual((await rows(c))[0], oldRow, 'additive migration rerun preserves immutable history');
  console.log('PASS: real D1 admission; independent-instance races, immutable snapshots, rollback, publication guards, explicit recovery, deletion/expiry fencing and actual Chromium authenticated reads. Admission-only assertions; public result processing is unconfigured.');
} finally { await server.close(); }
