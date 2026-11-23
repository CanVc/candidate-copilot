import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const scopes = ['account:read', 'user:read', 'ai:write'];
const wrangler = new URL('../../node_modules/wrangler/', import.meta.url);
function loginURL(line) {
  const match = /^Visit this link to authenticate: ([!-~]+)$/.exec(line);
  if (!match) return;
  const u = new URL(match[1]), q = u.searchParams;
  const expected = { client_id: '54d11594-84e4-41aa-b438-e81b8fa78ee7', redirect_uri: 'http://localhost:8976/oauth/callback',
    response_type: 'code', code_challenge_method: 'S256', scope: [...scopes, 'offline_access'].join(' ') };
  if (u.origin !== 'https://dash.cloudflare.com' || u.username || u.password || u.hash || u.pathname !== '/oauth2/auth' ||
      [...q].length !== 7 || Object.entries(expected).some(([k,v]) => q.get(k) !== v) || !q.get('state') || !q.get('code_challenge')) throw new Error();
  return u.href;
}
export async function authenticate(directory, signal) {
  if (JSON.parse(readFileSync(new URL('package.json', wrangler))).version !== '4.151.2') throw new Error();
  const config = `${directory}/wrangler.json`, envFile = `${directory}/empty.env`;
  writeFileSync(config, '{"send_metrics":false}\n', { flag: 'wx', mode: 0o600 });
  writeFileSync(envFile, '', { flag: 'wx', mode: 0o600 });
  const env = { PATH: '/usr/bin:/bin', HOME: directory, TMPDIR: directory, LANG: 'C.UTF-8', NO_COLOR: '1', CI: 'true',
    WRANGLER_HIDE_BANNER: 'true', WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_AUTH_USE_KEYRING: 'false', WRANGLER_LOG_PATH: `${directory}/logs`,
    XDG_CONFIG_HOME: `${directory}/config`, XDG_CACHE_HOME: `${directory}/cache`, XDG_DATA_HOME: `${directory}/data`, XDG_STATE_HOME: `${directory}/state` };
  async function capture(args, login) {
    const child = spawn(process.execPath, [fileURLToPath(new URL('wrangler-dist/cli.js', wrangler)), ...args, '--config', config, '--env-file', envFile],
      { cwd: directory, env, stdio: ['ignore', 'pipe', 'pipe'], signal, killSignal: 'SIGKILL', timeout: login ? 125000 : 10000 });
    let bytes = 0, output = '', shown = false, bad = false, scanned = 0;
    function bound(chunk) {
      bytes += chunk.length;
      if (bytes > 65536) { bad = true; child.kill('SIGKILL'); }
      return !bad;
    }
    child.stderr.on('data', bound);
    child.stdout.on('data', chunk => {
      if (!bound(chunk)) return;
      output += chunk.toString('utf8');
      if (!login) return;
      try {
        let end;
        while ((end = output.indexOf('\n', scanned)) !== -1) {
          const url = loginURL(output.slice(scanned, end).trimEnd()); scanned = end + 1;
          if (!url) continue;
          if (shown) throw new Error();
          shown = true; process.stderr.write(`Open this private URL in your local browser (never share):\n${url}\n`);
        }
      } catch { bad = true; child.kill('SIGKILL'); }
    });
    // Abort emits error before stdio/child close. Never release its credential directory then.
    const status = await new Promise(resolve => { child.once('error', () => { bad = true; }); child.once('close', resolve); });
    if (bad || status !== 0 || (login && !shown)) throw new Error();
    return login ? null : JSON.parse(output);
  }
  await capture(['login', '--browser=false', '--scopes', ...scopes], true);
  const credentials = await capture(['auth', 'token', '--json'], false);
  if (credentials?.type !== 'oauth' || typeof credentials.token !== 'string') throw new Error();
  return credentials.token;
}
