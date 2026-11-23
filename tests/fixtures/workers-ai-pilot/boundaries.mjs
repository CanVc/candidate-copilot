// Loaded ONLY by the temporary Node executable shim in the CLI test. Real entry, auth
// URL scanner, child output limit, REST reader, publication, deadlines and validators run.
import os from 'node:os';
import https from 'node:https';
import cp from 'node:child_process';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import fs, { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire, syncBuiltinESMExports } from 'node:module';
const home = fileURLToPath(new URL('.', import.meta.url)), scenario = readFileSync(`${home}scenario`, 'utf8');
const id = 'a'.repeat(32), token = 'fake-private-token';
const event = value => appendFileSync(`${home}events`, JSON.stringify(value) + '\n');
os.userInfo = () => ({ homedir: home });
if (scenario !== 'pty') {
  Object.defineProperty(process.stdin, 'isTTY', { value: true });
  Object.defineProperty(process.stderr, 'isTTY', { value: true });
  process.stdin.setRawMode = active => { event({ raw: active }); };
}
let authDir, watchdog, lateError;
const advance = ms => {
  const now = performance.now.bind(performance);
  performance.now = () => now() + ms;
};
// Accelerate only the cutoff under test. The actual CLI owns its callback and cancellation.
const timer = globalThis.setTimeout;
globalThis.setTimeout = (fn, ms, ...args) => {
  if (scenario === 'watchdog-dispose' && ms === 210000) watchdog = fn;
  const short = (scenario === 'login-deadline' && ms === 125000) || (scenario === 'token-deadline' && ms === 10000) ||
    (scenario === 'watchdog-dispose' && ms === 5000 && watchdog === null);
  return timer(fn, short ? 10 : ms, ...args);
};
if (scenario === 'membership-deadline') {
  const timeout = AbortSignal.timeout.bind(AbortSignal);
  AbortSignal.timeout = ms => timeout(ms === 10000 ? 10 : ms);
}
// Even deliberate teardown failures leave only this test's disposable state.
const mkdtemp = fs.mkdtempSync, remove = fs.rmSync;
fs.mkdtempSync = (prefix, ...args) => mkdtemp(prefix === '/tmp/workers-ai-pilot-' ? `${home}private-` : prefix, ...args);
fs.rmSync = (path, ...args) => {
  if (scenario === 'auth-rm-fail' && path === authDir) throw new Error('PRIVATE_DIAGNOSTIC');
  return remove(path, ...args);
};
const fsync = fs.fsyncSync;
fs.fsyncSync = fd => {
  if (scenario === (fs.fstatSync(fd).isDirectory() ? 'dir-fsync' : 'file-fsync')) throw new Error('PRIVATE_DIAGNOSTIC');
  fsync(fd);
};
const open = fs.openSync;
fs.openSync = (...args) => {
  if (String(args[0]).endsWith('/.candidate-copilot-2-12.spent')) event({contend:process.pid});
  return open(...args);
};
if (scenario === 'retrieval-failure') {
  const { D1Retriever } = await import(new URL('../../src/adapters/d1/retriever.ts', pathToFileURL(process.argv[1])));
  D1Retriever.prototype.retrieveForGeneration = async () => { throw new Error('PRIVATE_DIAGNOSTIC'); };
}
if (['dispose-fail','watchdog-dispose'].includes(scenario)) {
  const req = createRequire(`${process.cwd()}/node_modules/wrangler/package.json`);
  const proto = req('miniflare').Miniflare.prototype, dispose = proto.dispose;
  proto.dispose = async function() {
    await dispose.call(this);
    if (scenario === 'dispose-fail') throw new Error('PRIVATE_DIAGNOSTIC');
    const expire = watchdog; watchdog = null; expire();
    await new Promise(() => {}); // exercise grace exit, not a fabricated processing success
  };
}
if (scenario === 'late-inventory') {
  const read = fs.readFileSync;
  fs.readFileSync = (...args) => {
    const bytes = read(...args);
    if (typeof args[0] === 'number' && fs.readlinkSync(`/proc/self/fd/${args[0]}`).endsWith('/projet-reperage-reserves.md'))
      fs.writeFileSync(`${home}checkout/content/public/new.md`, '');
    return bytes;
  };
}
const spawn = cp.spawn;
cp.spawn = function(command, args, options) {
  if (!args?.[0]?.endsWith?.('/wrangler-dist/cli.js')) return spawn.apply(this, arguments);
  authDir = options.cwd;
  const configAt = args.indexOf('--config');
  event({ auth: args.slice(1,configAt), configArgs: args.slice(configAt), config: JSON.parse(readFileSync(args[configAt+1])), envFile: readFileSync(args.at(-1),'utf8'), cwd: options.cwd, env: options.env });
  const login = args[1] === 'login';
  const q = new URLSearchParams({ client_id: '54d11594-84e4-41aa-b438-e81b8fa78ee7', redirect_uri: 'http://localhost:8976/oauth/callback',
    response_type: 'code', code_challenge_method: 'S256', scope: 'account:read user:read ai:write offline_access', state: 'fake-local-state', code_challenge: 'fixture' });
  if (scenario === 'wrong-scope') q.set('scope','workers:write');
  if (scenario === 'wrong-callback') q.set('redirect_uri','http://wrong.invalid/');
  const url = `https://${scenario === 'bad-browser' ? 'wrong.invalid' : 'dash.cloudflare.com'}/oauth2/auth?${q}`;
  // Emit in fragments before exit, as a browser handoff must not wait for login completion.
  const code = login ? `process.stdout.write('Visit this link to auth'); setTimeout(()=>console.log(${JSON.stringify('enticate: ' + url)}),20);console.error('PRIVATE_DIAGNOSTIC'); ${scenario === 'bad-browser' ? '' : `const start=Date.now(),t=setInterval(()=>{if(require('node:fs').existsSync(${JSON.stringify(`${home}browser-handoff`)}))clearInterval(t);else if(Date.now()-start>2000)process.exit(1)},10)`}`
    : `console.log(${JSON.stringify(JSON.stringify({ type: scenario === 'api-token' ? 'api_token' : 'oauth', token }))})`;
  const stall = scenario === 'auth-interrupt' || scenario === (login ? 'login-deadline' : 'token-deadline');
  const child = spawn(command, ['-e', stall ? 'setTimeout(()=>{},20000)' : code], options);
  child.once('close', () => event({ authClosed: existsSync(options.cwd) }));
  if (scenario === 'auth-interrupt') setTimeout(() => process.kill(process.pid, 'SIGTERM'), 30);
  return child;
};
https.request = (options, cb) => {
  const req = new EventEmitter();
  req.destroy = () => { req.emit('error', new Error('PRIVATE_DIAGNOSTIC')); setTimeout(() => { event({ closed: existsSync(process.env.HOME) }); req.emit('close'); }, 25); };
  options.signal.addEventListener('abort', req.destroy, { once: true });
  req.end = body => {
    const wire = body ? JSON.parse(body) : null;
    event({ hostname: options.hostname, path: options.path, headers: options.headers, method: options.method,
      pid: process.pid, authGone: !existsSync(authDir), agent: options.agent, wire, body, spent: existsSync(`${home}.candidate-copilot-2-12.spent`) });
    if (options.headers.authorization !== `Bearer ${token}` || options.hostname !== 'api.cloudflare.com') throw new Error('unexpected host');
    let result, status = 200, text;
    if (!wire && scenario === 'membership-deadline') return;
    if (!wire) result = [{ account: { id: scenario === 'mismatch' ? 'b'.repeat(32) : id }, status: scenario === 'pending' ? 'pending' : 'accepted' },
      { account: { id: scenario === 'duplicate' ? id : 'c'.repeat(32) }, status:'accepted' }];
    else if (wire.response_format.json_schema.oneOf) {
      if (scenario === 'internal') throw Object.assign(new Error('PRIVATE_DIAGNOSTIC'), { status: 503, code: 3036, diagnostic: { kind: 'transport' } });
      if (scenario === 'elapsed') advance(6000);
      const invalidStatus = { 'unsafe-status': 'PRIVATE_DIAGNOSTIC', 'low-status': 99, 'high-status': 600,
        'fractional-status': 418.5, 'missing-status': undefined };
      if (Object.hasOwn(invalidStatus, scenario)) status = invalidStatus[scenario];
      if (scenario === 'missing-result') text = '{"success":true,"errors":[]}';
      if (scenario === 'finalization-elapsed') {
        // The first UUID after a direct classifier response belongs to completeResult.
        const uuid = crypto.randomUUID.bind(crypto);
        crypto.randomUUID = () => { advance(31000); crypto.randomUUID = uuid; return uuid(); };
      }
      if (scenario === 'uncertain') { queueMicrotask(req.destroy); return; }
      if (scenario === 'interrupt') { process.kill(process.pid, 'SIGTERM'); return; }
      if (scenario === 'timeout') return;
      if (scenario === 'decoded-limit') text = JSON.stringify({success:true, errors:[], result:{response:' '.repeat(2048)+JSON.stringify({decision:'clarify',reasonCode:'missing_context',responseLanguage:'fr',clarificationQuestion:'Quel objet ?'})}});
      if (scenario === 'malformed') text = '{PRIVATE_DIAGNOSTIC';
      if (scenario === 'redirect-http') status = 307;
      if (scenario === 'quota') status = 429;
      const branches = { invalid: { decision: 'invalid' }, clarify: { decision: 'clarify', reasonCode: 'material_ambiguity', clarificationQuestion: 'Quel objet ?' },
        refuse: { decision: 'refuse', reasonCode: 'sensitive_personal', refusalMessage: 'Je ne peux pas répondre.' } };
      result = { response: { responseLanguage: 'fr', ...(branches[['direct-elapsed','finalization-elapsed'].includes(scenario) ? 'clarify' : scenario] ?? { decision: 'answer', reasonCode: 'professional_question', professionalTopic: 'Musée',
        resolvedQuestion: 'Quels résultats pour la réserve ?', searchTerms: [scenario === 'empty' ? 'NonexistentFixtureTerm' : 'repérage'] }) } };
      if (scenario.startsWith('byte-limit-')) {
        const value = result.response; value.searchTerms = ['NonexistentFixtureTerm']; value.resolvedQuestion = '漢'.repeat(500);
        value.resolvedQuestion += 'a'.repeat(2048 - Buffer.byteLength(JSON.stringify(value)) + Number(scenario.endsWith('over')));
      }
      if (scenario === 'false-success' || scenario === 'errors') text = JSON.stringify({ success: scenario !== 'false-success', errors: scenario === 'errors' ? [{code:123}] : [], result });
    } else {
      if (scenario === 'generator-elapsed') advance(30000);
      if (scenario === 'late-http') lateError();
      if (scenario === 'generator-http' || scenario === 'late-http') status = 503;
      if (scenario === 'generator-decode') text = JSON.stringify({ success: true, errors: [], result: { response: 'PRIVATE_DIAGNOSTIC' } });
      const [source] = JSON.parse(wire.messages[1].content).sourceChunks;
      result = { response: JSON.stringify({ status: 'answered', outputLanguage: 'fr', blocks: [{ kind: 'paragraph', text: 'Résultat\u202e local\u{e0001} fictif.',
        sourceIds: [['invalid-cite','invalid-cite-elapsed'].includes(scenario) ? 'INVALID' : source.responseLocalId] }] }) };
    }
    const pad = wire && scenario === 'oversize' ? 8192 : wire && !wire.response_format.json_schema.oneOf && scenario === 'oversize-generator' ? 16384 : 0;
    if (status !== 200) text = 'PRIVATE_DIAGNOSTIC';
    const data = wire && scenario === 'utf8' ? Buffer.from([255]) : Buffer.from(' '.repeat(pad) + (text ?? JSON.stringify({ success: true, errors: [], result })));
    const partial = wire && !wire.response_format.json_schema.oneOf && ['generator-stream','incomplete-end'].includes(scenario);
    const res = partial && scenario === 'generator-stream' ? new Readable({ read() {} }) :
      Readable.from(partial ? [data.subarray(0, 50)] : [data.subarray(0, 50), data.subarray(50)]);
    if (partial && scenario === 'generator-stream') {
      res.push(data.subarray(0, 50));
      setImmediate(() => { event({ streamed: res.readableLength === 0 }); res.emit('aborted'); });
    }
    if (status !== 200) res._read = () => { event({ rejectedBodyRead: true }); res.push(null); };
    if (scenario === 'late-http' && wire?.response_format.json_schema.oneOf) {
      lateError = () => { req.emit('error', new Error('PRIVATE_DIAGNOSTIC')); res.emit('aborted'); req.emit('close'); };
    }
    Object.assign(res, { headers: { ...(wire && scenario === 'encoding' && { 'content-encoding': 'gzip' }), ...(status === 307 && { location: 'https://wrong.invalid' }) }, statusCode: status, complete: !partial });
    res.on('end', () => setImmediate(() => {
      if (wire && (scenario === 'direct-elapsed' || (scenario === 'invalid-cite-elapsed' && !wire.response_format.json_schema.oneOf))) {
        // Dispatch close starts a scripted clock: allow the receiver and validator to
        // finish normally, then cross the outer cutoff on their caller's check.
        // Classifier: receiver, classifier, classifier cutoff; generator: receiver,
        // post-generate and output-size checks. No application method is replaced.
        const now = performance.now.bind(performance); let checks = 0;
        performance.now = () => now() + (++checks > 3 ? 30000 : 0);
      }
      req.emit('close');
    }));
    if (!wire && scenario === 'contend') {
      const end = Date.now()+5000;
      const wait = setInterval(() => {
        if (readFileSync(`${home}events`,'utf8').split('\n').filter(l => l.includes('"method":"GET"')).length === 2) { clearInterval(wait); cb(res); }
        else if (Date.now() >= end) { clearInterval(wait); req.destroy(); }
      }, 10);
    } else queueMicrotask(() => cb(res));
  }; return req;
};
syncBuiltinESMExports();
