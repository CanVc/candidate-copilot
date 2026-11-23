import { constants, closeSync, fsyncSync, lstatSync, mkdirSync, mkdtempSync, openSync, rmSync, writeSync } from 'node:fs';
import { userInfo } from 'node:os';
import { descriptorPath, pinDirectory } from '../public-content/validate.ts';
import { authenticate } from './auth.mjs';
import { authorizedRun } from './http.mjs';
import { inputs, localPublication } from './publication.mjs';
import { PilotObservation, processQuestion } from './process.ts';

const attempts = { classifier: 0, generator: 0 }, controller = new AbortController();
const observation = new PilotObservation();
let hasResult = false, status = 'stopped', temp, home, raw = false, grace, keepTemp = false, cleanupFailed = false;
function receipt() {
  const diagnostic = status === 'spent' || hasResult ? undefined : observation.diagnostic;
  writeSync(1, JSON.stringify({ pilot: '2.12/long-documented', status, attemptsThisInvocation: attempts, ...(diagnostic && { diagnostic }), ...(cleanupFailed && { cleanup: 'incomplete' }) }) + '\n');
}
function cleanup() {
  controller.abort();
  if (raw) { process.stdin.setRawMode(false); raw = false; }
  if (temp && !keepTemp) { process.chdir('/'); rmSync(temp, { recursive: true, force: true }); temp = undefined; }
  home?.close(); home = undefined;
}
function interrupted() {
  if (controller.signal.aborted) return;
  observation.note('unknown');
  if (status === 'stopped') status = 'interrupted';
  process.exitCode = 1;
  // If a dependency ignores cancellation, leave its private state alone rather than
  // delete files under a running child. Never release the spent guard.
  grace = setTimeout(() => { cleanupFailed = true; receipt(); process.exit(1); }, 5000);
  controller.abort();
}
for (const s of ['SIGHUP', 'SIGTERM', 'SIGINT']) process.on(s, interrupted);
const watchdog = setTimeout(() => { observation.note('local_deadline'); interrupted(); }, 210000);
async function expectedID() {
  const input = process.stdin;
  input.setRawMode(true); raw = true;
  process.stderr.write('Only if you independently identify the Workers Free account observed 2026-11-23 14:01 and know of no change, enter its 32-character ID (hidden); otherwise press Enter to stop: ');
  let stop;
  try {
    return await new Promise((resolve, reject) => {
      const fail = () => reject(new Error());
      let text = '', invalid = false;
      function data(chunk) {
        for (const byte of chunk) {
          if (byte === 3) { interrupted(); return; }
          if (byte === 10 || byte === 13) { if (!invalid && text.length === 32) resolve(text); else fail(); return; }
          if (text.length === 32 || !(byte >= 48 && byte <= 57 || byte >= 97 && byte <= 102)) invalid = true;
          if (!invalid) text += String.fromCharCode(byte);
        }
      }
      stop = () => { input.off('data', data); input.off('end', fail); input.off('error', fail); controller.signal.removeEventListener('abort', fail); };
      controller.signal.addEventListener('abort', fail, { once: true });
      input.on('data', data); input.once('end', fail); input.once('error', fail); input.resume();
    });
  } finally { stop?.(); input.pause(); input.setRawMode(false); raw = false; process.stderr.write('\n'); }
}
try {
  process.umask(0o077);
  if (process.argv.length !== 2 || process.version !== 'v24.22.0' || !process.stdin.isTTY || !process.stderr.isTTY ||
      process.env.PATH !== '/usr/bin:/bin' || process.env.LANG !== 'C.UTF-8' ||
      Object.keys(process.env).some(key => key !== 'PATH' && key !== 'LANG')) throw new Error();
  // passwd home, not HOME/XDG/cwd or an account-dependent key. All checkouts share the same guard.
  home = pinDirectory(userInfo().homedir);
  const marker = descriptorPath(home.fd, '.candidate-copilot-2-12.spent');
  if (lstatSync(marker, { throwIfNoEntry: false })) { status = 'spent'; throw new Error(); }
  function consume() {
    home.check();
    const fd = openSync(marker, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
    try { fsyncSync(fd); } finally { closeSync(fd); }
    fsyncSync(home.fd); // Never unlink, even if a later step fails or dispatch never starts.
  }
  observation.stage = 'preparation';
  const { bundle, message } = inputs();
  observation.stage = 'authorization';
  const id = await expectedID();
  temp = mkdtempSync('/tmp/workers-ai-pilot-');
  process.chdir(temp); Object.assign(process.env, { HOME: temp, TMPDIR: temp, XDG_CONFIG_HOME: temp, XDG_CACHE_HOME: temp, XDG_DATA_HOME: temp, XDG_STATE_HOME: temp });
  const authDir = `${temp}/auth`; mkdirSync(authDir);
  let token;
  try { token = await authenticate(authDir, controller.signal, observation); }
  catch (error) { observation.note('unknown'); throw error; }
  finally {
    observation.stage = 'teardown';
    try { rmSync(authDir, { recursive: true, force: true }); } catch { cleanupFailed = true; throw new Error(); }
  }
  observation.stage = 'authorization';
  controller.signal.throwIfAborted();
  const dispatch = await authorizedRun(id, token, controller.signal, observation);
  observation.stage = 'preparation';
  const outcome = await localPublication(temp, bundle, observation, async db => {
    let pending;
    const send = (...args) => (pending = dispatch(...args));
    try { return await processQuestion(db, message, { attempts, consume, send, observation, parent: controller.signal }); }
    finally { await pending?.catch(() => {}); } // HTTP close, even if beforeCutoff abandoned observation
  }, () => { keepTemp = cleanupFailed = true; });
  if (controller.signal.aborted && !outcome.result) throw new Error();
  status = outcome.status;
  if (outcome.result) {
    hasResult = true;
    const { blocks, sourceExcerpts } = outcome.result;
    // Local terminal only. Escape terminal-formatting and direction controls as well as JSON controls.
    const display = JSON.stringify({ blocks, sourceExcerpts }, null, 2).replace(/[\u007f-\u009f\p{Cf}\u2028\u2029]/gu, c => c.split('').map(unit => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`).join(''));
    writeSync(2, `Private validated result (do not forward):\n${display}\n`);
  } else process.exitCode = 1;
} catch { observation.note('unknown'); process.exitCode = 1; }
finally {
  clearTimeout(watchdog); clearTimeout(grace);
  try { cleanup(); } catch { cleanupFailed = true; }
  receipt(); if (cleanupFailed) process.exit(1);
}
