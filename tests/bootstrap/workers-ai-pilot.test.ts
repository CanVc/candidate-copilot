import { spawn, spawnSync } from 'node:child_process';
import { appendFileSync, chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { assembleValidatedArtifacts } from '../../tools/public-content/build.ts';
import { reservePilotInput } from '../../tools/workers-ai-pilot/process.ts';
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
  async function run(scenario: string, args: string[] = [], input = id, script = entry) {
    writeFileSync(join(dir, 'scenario'), scenario);
    const p = spawn('/bin/sh', [script, ...args], { env: { PATH: `${dir}:/usr/bin:/bin`, HOME: '/not-the-home', NODE_OPTIONS: '--invalid-before-sanitizing',
      HTTPS_PROXY: 'private-proxy', CLOUDFLARE_API_TOKEN: 'ignored' }, stdio: ['pipe','pipe','pipe'] });
    let stdout = '', stderr = '';
    p.stdout.on('data', c => { stdout += c; }); p.stderr.on('data', c => { stderr += c; if (stderr.includes('https://dash.cloudflare.com/oauth2/auth?')) writeFileSync(join(dir, 'browser-handoff'), ''); }); p.stdin.on('error', () => {}); p.stdin.end(input + '\n');
    const code = await new Promise<number | null>((res, rej) => { p.once('error', rej); p.once('close', res); });
    const receipt = JSON.parse(stdout.trim());
    expect(Object.keys(receipt).sort()).toEqual(['attemptsThisInvocation', ...(['dispose-fail','auth-rm-fail'].includes(scenario) ? ['cleanup'] : []), 'pilot','status']);
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
    ['auth-rm-fail','stopped',0,0], ['dispose-fail','answered',1,1], ['timeout','processing_unavailable',1,0], ['interrupt','interrupted',1,0],
  ] as const)('%s → %s, %i/%i attempts', async (scenario, status, classifier, generator) => {
    const result = await run(scenario);
    expect(result.status).toBe(status); expect(result.attemptsThisInvocation).toEqual({ classifier, generator });
    const sent = events().filter(e => e.wire);
    expect(sent.length).toBe(classifier + generator); expect(sent.every(e => e.spent)).toBe(true);
    if (['wrong-scope','wrong-callback','bad-browser'].includes(scenario)) expect(result.stderr).not.toContain('https://');
    if (scenario === 'auth-interrupt') {
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
      expect(e.wire.messages.map((m: {role:string}) => m.role)).toEqual(['system','user']);
    }
    const [classifier, generator] = posts.map(e => JSON.parse(e.wire.messages[1].content));
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
