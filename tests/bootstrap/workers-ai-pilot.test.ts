import { spawn, spawnSync } from 'node:child_process';
import { appendFileSync, chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { assembleValidatedArtifacts } from '../../tools/public-content/build.ts';
import { PilotObservation, reservePilotInput } from '../../tools/workers-ai-pilot/process.ts';
import { intentBounds, INTENT_REASONS } from '../../src/shared/professional-intent.ts';
import { professionalIntentInstructions } from '../../src/application/classify-professional-intent.ts';
import { answerGenerationInstructions } from '../../src/application/generate-answer.ts';
import { answerGenerationBounds } from '../../src/shared/answer-generation.ts';
import type { PublicSearchArtifacts } from '../../src/shared/public-evidence.ts';

// Never use operator settings, services or state. The replacement executable injects
// ONLY test-process boundary doubles; the shipped command has no test switches.
const entry = resolve('tools/workers-ai-pilot/run.sh'), id = 'a'.repeat(32);
const cases = JSON.parse(readFileSync('tests/fixtures/global-evaluation/cases.json', 'utf8'));
const paths = ['mission-regie-collections.md', 'projet-prototype-prets.md', 'projet-reperage-reserves.md'].map(n => `content/public/${n}`);
const bundle = assembleValidatedArtifacts(paths.map(path => ({path, bytes: readFileSync(path)})), cases.corpus.sourceRevision);
const evidence: PublicSearchArtifacts = JSON.parse(bundle.files[`search-artifacts.${bundle.searchHash}.json`]!);
describe('operator command — disposable offline boundaries', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pilot-cli-'));
    copyFileSync('tests/fixtures/workers-ai-pilot/boundaries.mjs', join(dir, 'boundaries.mjs'));
    writeFileSync(join(dir, 'node'), `#!/bin/sh\nunset PWD\nexec '${process.execPath}' --import '${dir}/boundaries.mjs' "$@"\n`); chmodSync(join(dir, 'node'), 0o700);
    writeFileSync(join(dir, 'events'), '');
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));
  const diagnosticCases: [string[], string, string, number?][] = [
    [['wrong-scope','wrong-callback','duplicate','bad-browser','api-token','mismatch','pending','auth-interrupt'], 'authorization', 'unknown'],
    [['auth-rm-fail'], 'teardown', 'unknown'], [['watchdog-dispose'], 'teardown', 'local_deadline'],
    [['login-deadline','token-deadline','membership-deadline'], 'authorization', 'local_deadline'],
    [['finalization-elapsed'], 'finalization', 'local_deadline'], [['generator-elapsed'], 'generator', 'local_deadline'],
    [['case','source','inventory','late-inventory','artifact','catalog-bytes','search-bytes','file-fsync','dir-fsync','contend'], 'preparation', 'unknown'],
    [['internal','interrupt'], 'classifier', 'unknown'], [['timeout','elapsed','direct-elapsed'], 'classifier', 'local_deadline'],
    [['uncertain'], 'classifier', 'transport'], [['redirect-http'], 'classifier', 'http_rejection', 307],
    [['quota'], 'classifier', 'http_rejection', 429], [['unsafe-status','missing-status','low-status','high-status','fractional-status'], 'classifier', 'unknown'],
    [['missing-result','oversize','false-success','errors','malformed','utf8','encoding'], 'classifier', 'unusable_envelope'],
    [['invalid','byte-limit-over','decoded-limit'], 'classifier', 'invalid_response'],
    [['retrieval-failure'], 'continuation', 'unknown'], [['oversize-generator'], 'generator', 'unusable_envelope'],
    [['invalid-cite','invalid-cite-elapsed','generator-decode'], 'generator', 'invalid_response'], [['generator-http','late-http'], 'generator', 'http_rejection', 503],
    [['generator-stream','incomplete-end'], 'generator', 'transport'],
  ];
  async function run(scenario: string, args: string[] = [], input = id, script = entry) {
    writeFileSync(join(dir, 'scenario'), scenario);
    const p = spawn('/bin/sh', [script, ...args], { env: { PATH: `${dir}:/usr/bin:/bin`, HOME: '/not-the-home', NODE_OPTIONS: '--invalid-before-sanitizing',
      HTTPS_PROXY: 'private-proxy', CLOUDFLARE_API_TOKEN: 'ignored' }, stdio: ['pipe','pipe','pipe'] });
    let stdout = '', stderr = '';
    p.stdout.on('data', c => { stdout += c; }); p.stderr.on('data', c => { stderr += c; if (stderr.includes('https://dash.cloudflare.com/oauth2/auth?')) writeFileSync(join(dir, 'browser-handoff'), ''); }); p.stdin.on('error', () => {}); p.stdin.end(input + '\n');
    const code = await new Promise<number | null>((res, rej) => { p.once('error', rej); p.once('close', res); });
    const receipt = JSON.parse(stdout.trim());
    expect(stdout.trim().split('\n')).toHaveLength(1);
    const failure = !['answered','clarification','refused','partial','spent'].includes(receipt.status);
    const expected = diagnosticCases.find(([names]) => names.includes(scenario));
    const stage = expected?.[1] ?? (input === '' ? 'authorization' : 'unknown');
    const diagnostic = { stage, kind: expected?.[2] ?? 'unknown', ...(expected?.[3] && { httpStatus: expected[3] }) };
    expect(receipt).toEqual({ pilot: '2.12/long-documented', status: receipt.status, attemptsThisInvocation: {
      classifier: expect.any(Number), generator: expect.any(Number) }, ...(failure && { diagnostic }),
      ...(['dispose-fail','auth-rm-fail','watchdog-dispose'].includes(scenario) && { cleanup: 'incomplete' }) });
    expect(stdout).not.toMatch(/oauth|cloudflare|private|Résultat|sourceChunks|diagnostic.*3036/i);
    expect(stdout + stderr).not.toMatch(/PRIVATE_DIAGNOSTIC|fake-private-token|a{32}/);
    return { code, stderr, ...receipt };
  }
  const events = () => readFileSync(join(dir, 'events'), 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
  it.each([
    ['wrong-scope','stopped',0,0], ['wrong-callback','stopped',0,0], ['duplicate','stopped',0,0], ['auth-interrupt','interrupted',0,0],
    ['bad-browser','stopped',0,0], ['api-token','stopped',0,0], ['mismatch','stopped',0,0], ['pending','stopped',0,0],
    ['clarify','clarification',1,0], ['refuse','refused',1,0], ['empty','partial',1,0], ['invalid','invalid_result',1,0],
    ['invalid-cite','invalid_result',1,1], ['oversize-generator','processing_unavailable',1,1], ['decoded-limit','invalid_result',1,0], ['redirect-http','processing_unavailable',1,0], ['quota','processing_unavailable',1,0],
    ['malformed','processing_unavailable',1,0], ['oversize','processing_unavailable',1,0], ['uncertain','processing_unavailable',1,0],
    ['file-fsync','processing_unavailable',0,0], ['dir-fsync','processing_unavailable',0,0],
    ['byte-limit-at','partial',1,0], ['byte-limit-over','invalid_result',1,0], ['false-success','processing_unavailable',1,0], ['errors','processing_unavailable',1,0],
    ['login-deadline','stopped',0,0], ['token-deadline','stopped',0,0], ['membership-deadline','stopped',0,0],
    ['watchdog-dispose','interrupted',1,1], ['direct-elapsed','stopped',1,0], ['finalization-elapsed','stopped',1,0],
    ['generator-elapsed','stopped',1,1], ['invalid-cite-elapsed','stopped',1,1], ['missing-result','invalid_result',1,0],
    ['late-http','processing_unavailable',1,1], ['incomplete-end','processing_unavailable',1,1],
    ['missing-status','processing_unavailable',1,0], ['fractional-status','processing_unavailable',1,0],
    ['low-status','processing_unavailable',1,0], ['high-status','processing_unavailable',1,0],
    ['unsafe-status','processing_unavailable',1,0], ['encoding','processing_unavailable',1,0], ['utf8','processing_unavailable',1,0],
    ['internal','processing_unavailable',1,0], ['elapsed','processing_unavailable',1,0], ['retrieval-failure','processing_unavailable',1,0],
    ['generator-http','processing_unavailable',1,1], ['generator-stream','processing_unavailable',1,1], ['generator-decode','invalid_result',1,1],
    ['auth-rm-fail','stopped',0,0], ['dispose-fail','answered',1,1], ['timeout','processing_unavailable',1,0], ['interrupt','interrupted',1,0],
  ] as const)('%s → %s, %i/%i attempts', async (scenario, status, classifier, generator) => {
    const result = await run(scenario);
    expect(result.code).toBe(['clarification','partial','refused'].includes(status) ? 0 : 1);
    expect(result.status).toBe(status); expect(result.attemptsThisInvocation).toEqual({ classifier, generator });
    const sent = events().filter(e => e.wire);
    expect(sent.length).toBe(classifier + generator); expect(sent.every(e => e.spent)).toBe(true);
    if (['wrong-scope','wrong-callback','bad-browser'].includes(scenario)) expect(result.stderr).not.toContain('https://');
    expect(events().filter(e => e.rejectedBodyRead)).toHaveLength(0);
    if (scenario === 'generator-stream') expect(events()).toContainEqual({ streamed: true });
    if (scenario === 'watchdog-dispose') expect(result.stderr).not.toContain('Private validated result');
    if (['auth-interrupt','login-deadline','token-deadline'].includes(scenario)) {
      expect(events().filter(e => e.authClosed)).toHaveLength(scenario === 'token-deadline' ? 2 : 1);
      expect(events().filter(e => e.hostname)).toHaveLength(0);
      expect(events()).toContainEqual({ authClosed:true }); expect(existsSync(events().find(e => e.auth).cwd)).toBe(false);
    }
    if (scenario === 'auth-rm-fail') { expect(result.cleanup).toBe('incomplete'); expect(events().filter(e => e.hostname)).toEqual([]); }
    if (scenario === 'interrupt') expect(events()).toContainEqual({ closed:true });
    if (scenario === 'dispose-fail') { expect(result.code).toBe(1); expect(result.cleanup).toBe('incomplete'); expect(result.stderr).toContain('Private validated result'); }
    if (scenario === 'dir-fsync' || scenario === 'file-fsync') { expect((await run('answer')).status).toBe('spent'); expect(events().filter(e => e.wire)).toHaveLength(0); }
    if (scenario === 'uncertain' || scenario === 'interrupt') {
      expect((await run('answer')).status).toBe('spent'); expect(events().filter(e => e.wire)).toHaveLength(1);
    }
  }, 22000);
  it('holds echo off through the end of an invalid line on an actual disposable PTY', () => {
    writeFileSync(join(dir,'scenario'),'pty');
    const probe = spawnSync('/usr/bin/python3', ['-I','tests/fixtures/workers-ai-pilot/hidden-input.py',entry,dir], { timeout:8000 });
    expect(probe.status, probe.stderr?.toString()).toBe(0); expect(events()).toEqual([]);
  });
  it('projects diagnostic fields from local literals even for untyped callers', () => {
    const trap = { toJSON() { throw new Error('private'); }, toString() { throw new Error('private'); } };
    for (const field of [trap, 'PRIVATE_DIAGNOSTIC']) {
      const observed = new PilotObservation();
      Object.assign(observed, { stage: field });
      Reflect.apply(observed.note, observed, [field, trap]);
      expect(JSON.parse(JSON.stringify(observed.diagnostic))).toEqual({ stage: 'unknown', kind: 'unknown' });
    }
  });
  it('checks exact serialized aggregate input bytes independently of the role limits', () => {
    const first = reservePilotInput(0, 'classifier', JSON.stringify('é'.repeat(4999)));
    const data = '漢'.repeat(5999) + 'x';
    expect(reservePilotInput(first, 'generator', JSON.stringify(data))).toBe(28000);
    expect(() => reservePilotInput(first, 'generator', JSON.stringify(data+'x'))).toThrow('dispatch denied');
  });
  it('checks the pinned CLI source contract independently of fake auth (no login)', () => {
    expect(JSON.parse(readFileSync('node_modules/wrangler/package.json','utf8')).version).toBe('4.151.2');
    const cli = readFileSync('node_modules/wrangler/wrangler-dist/cli.js','utf8');
    for (const pin of ['auth = createWranglerAuth({\n      logger: logger2', 'ctx.logger.log(`Visit this link to authenticate: ${urlToOpen}`)',
      'console[messageLevel](message)', 'defaultValue: /* @__PURE__ */ __name2(() => `https://${getAuthDomainFromEnv()}/oauth2/auth`',
      '"dash.cloudflare.com"', '54d11594-84e4-41aa-b438-e81b8fa78ee7', 'OAUTH_CALLBACK_URL = "http://localhost:8976/oauth/callback"',
      'scope=${encodeURIComponent([...scopes, "offline_access"].join(" "))}', 'code_challenge_method=S256',
      'result = { type: "oauth", token }', 'logger2.log(JSON.stringify(result, null, 2))',
      'args["env-file"] ?? getDefaultEnvFiles(args.env)', 'if (getWranglerHideBanner()) {\n    return;']) expect(cli.includes(pin)).toBe(true);
  });
  it('rejects overrides and missing expected ID without auth or dispatch', async () => {
    expect((await run('answer', ['--account'])).status).toBe('stopped');
    expect((await run('answer', [], '')).status).toBe('stopped');
    expect(events().filter(e => e.auth || e.hostname)).toEqual([]);
  });
  it.each(['case','source','inventory','late-inventory','artifact','catalog-bytes','search-bytes'])('rejects %s drift before prompting or auth', async drift => {
    const root = join(dir, 'checkout'), fixture = 'tests/fixtures/global-evaluation/cases.json';
    const copy = (p: string) => { mkdirSync(dirname(join(root,p)), {recursive:true}); copyFileSync(p,join(root,p)); };
    for (const p of [fixture, ...paths, ...['auth.mjs','cli.mjs','http.mjs','process.ts','publication.mjs','run.sh'].map(n => `tools/workers-ai-pilot/${n}`)]) copy(p);
    for (const p of ['src','node_modules','tools/retrieval']) symlinkSync(resolve(p), join(root,p));
    if (['artifact','catalog-bytes','search-bytes'].includes(drift)) {
      mkdirSync(join(root,'tools/public-content'));
      symlinkSync(resolve('tools/public-content/validate.ts'), join(root,'tools/public-content/validate.ts'));
      writeFileSync(join(root,'tools/public-content/build.ts'), `import { assembleValidatedArtifacts as assemble } from ${JSON.stringify(resolve('tools/public-content/build.ts'))};\nexport function assembleValidatedArtifacts(s,r) { const b = assemble(s,r); ${drift === 'artifact' ? `b.searchHash='0'.repeat(64);` : drift === 'search-bytes' ? `b.files['search-artifacts.'+b.searchHash+'.json']+=' ';` : `const k='assets/resources-catalog.'+b.catalogHash+'.json', c=JSON.parse(b.files[k]); c.payload.resources=[]; c.payload.catalogRevision='wrong'; b.files[k]=JSON.stringify(c);`} return b; }`);
    } else {
      symlinkSync(resolve('tools/public-content'), join(root,'tools/public-content'));
      if (drift !== 'late-inventory') appendFileSync(join(root, drift === 'case' ? fixture : drift === 'source' ? paths[0]! : 'content/public/extra.md'), '\n');
    }
    expect((await run(drift, [], id, join(root, 'tools/workers-ai-pilot/run.sh'))).status).toBe('stopped');
    expect(events()).toEqual([]);
  });
  it('shares the spent guard across two launches; reconstructs the actual retrieved excerpt', async () => {
    const launches = await Promise.all([run('contend'), run('contend')]);
    const result = launches.find(r => r.status === 'answered');
    expect(result?.attemptsThisInvocation).toEqual({ classifier: 1, generator: 1 });
    expect(launches.filter(r => r.code === 0)).toHaveLength(1);
    expect(result.stderr).toContain('Open this private URL'); expect(result.stderr).toContain('https://dash.cloudflare.com/oauth2/auth?');
    const logged = events(), auth = logged.filter(e => e.auth);
    expect(auth.some(e => e.auth.join(' ') === 'login --browser=false --scopes account:read user:read ai:write')).toBe(true);
    expect(auth.some(e => e.auth.join(' ') === 'auth token --json')).toBe(true);
    for (const e of auth) {
      expect(e.configArgs).toEqual(['--config',join(e.cwd,'wrangler.json'),'--env-file',join(e.cwd,'empty.env')]);
      expect(e.config).toEqual({send_metrics:false}); expect(e.envFile).toBe(''); expect(e.env.WRANGLER_HIDE_BANNER).toBe('true');
      expect(e.env.HOME).toBe(e.cwd); expect(existsSync(e.cwd)).toBe(false); expect(e.env.CLOUDFLARE_AUTH_USE_KEYRING).toBe('false');
      expect(e.env).not.toHaveProperty('CLOUDFLARE_API_TOKEN'); expect(e.env).not.toHaveProperty('HTTPS_PROXY');
    }
    const gets = logged.filter(e => e.hostname && !e.wire); expect(gets).toHaveLength(2);
    expect(new Set(logged.filter(e => e.contend).map(e => e.contend)).size).toBe(2);
    expect(gets.every(e => e.authGone && e.path === '/client/v4/memberships' && e.method === 'GET')).toBe(true);
    const posts = logged.filter(e => e.wire); expect(posts).toHaveLength(2);
    for (const e of posts) {
      expect(e).toMatchObject({ spent: true, hostname: 'api.cloudflare.com', method: 'POST', agent: false,
        path: `/client/v4/accounts/${id}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast` });
      expect(typeof e.body).toBe('string');
      expect(e.body).toBe(JSON.stringify(e.wire));
      expect(e.headers['content-length']).toBe(Buffer.byteLength(e.body));
      expect(e.headers['content-type']).toBe('application/json');
      expect(Object.keys(e.wire).sort()).toEqual(['max_tokens','messages','response_format','stream']);
      expect(e.wire.stream).toBe(false);
      expect(e.wire.response_format).toEqual({ type: 'json_schema', json_schema: expect.any(Object) });
      expect(e.wire.messages.map((m: {role:string}) => m.role)).toEqual(['system','user']);
    }
    const [first, second] = posts;
    const sizes = posts.map(e => Buffer.byteLength(e.body));
    expect(sizes[0]).toBeLessThanOrEqual(12000); expect(sizes[1]).toBeLessThanOrEqual(20000);
    expect(sizes.reduce((a,b) => a+b,0)).toBeLessThanOrEqual(28000);
    expect(first.wire.messages[0].content).toBe(professionalIntentInstructions(intentBounds()));
    expect(second.wire.messages[0].content).toBe(answerGenerationInstructions(answerGenerationBounds()));
    const branches = first.wire.response_format.json_schema.oneOf;
    expect(branches).toHaveLength(Object.keys(INTENT_REASONS).length);
    for (const [decision,reasons] of Object.entries(INTENT_REASONS)) {
      const branch = branches.find((b: {properties:{decision:{enum:string[]}}}) => b.properties.decision.enum[0] === decision);
      const string = { type: 'string' };
      const properties = { decision:{enum:[decision]}, reasonCode:{enum:reasons}, responseLanguage:string,
        ...(decision === 'refuse' ? { refusalMessage:string } : decision === 'clarify' ? { clarificationQuestion:string } :
          { professionalTopic:string, resolvedQuestion:string, searchTerms:{type:'array',items:string} }) };
      expect(branch).toEqual({ type:'object', additionalProperties:false, required:Object.keys(properties), properties });
    }
    expect(second.wire.response_format.json_schema).toEqual({ type:'object', additionalProperties:false,
      required:['status','outputLanguage','blocks'], properties:{ status:{enum:['answered','partial','refused','failed']}, outputLanguage:{type:'string'},
        blocks:{type:'array', items:{type:'object', additionalProperties:false, required:['kind','text','sourceIds'], properties:{
          kind:{enum:['paragraph','summary','limitation','refusal','transition','error']}, text:{type:'string'}, sourceIds:{type:'array',items:{type:'string'}} }}} } });
    const [classifier, generator] = posts.map(e => JSON.parse(e.wire.messages[1].content));
    expect(generator.question).toBe(classifier.question); expect(classifier.conversationContext).toEqual([]);
    expect(classifier.question).toBe(cases.cases[0].turns[0].question); expect(classifier.publicCatalog.length).toBeGreaterThan(0);
    expect(classifier).not.toHaveProperty('sourceChunks'); expect(generator).not.toHaveProperty('publicCatalog');
    expect(generator.conversationContext).toEqual([]); expect(JSON.stringify(posts)).not.toContain(cases.cases[0].turns[0].review.probe);
    expect(posts.map(e => e.wire.max_tokens)).toEqual([512, 1024]);
    for (const s of generator.sourceChunks) {
      expect(cases.scope.eligibleDocumentIds).toContain(s.documentId);
      expect(evidence.chunks).toContainEqual(expect.objectContaining({ documentId: s.documentId, text: s.text, location: s.location }));
    }
    const local = JSON.parse(result.stderr.split('Private validated result (do not forward):\n')[1]);
    expect(local.blocks[0].text).toBe('Résultat\u202e local\u{e0001} fictif.');
    expect(result.stderr).not.toMatch(/[\u202e\u{e0001}]/u);
    expect(local.blocks[0].sourceIds).toEqual([generator.sourceChunks[0].responseLocalId]);
    expect(local.sourceExcerpts[0].excerpt).toBe(generator.sourceChunks[0].text);
    expect((await run('answer')).status).toBe('spent'); expect(events().filter(e => e.wire)).toHaveLength(2);
  }, 30000);
});
