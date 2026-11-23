import { request } from 'node:https';
import { WORKERS_AI_CANDIDATE } from '../../src/adapters/llm/workers-ai.ts';

// One request, no pooling, redirect following, decompression, SDK retries or diagnostic body logging.
function json(path, token, body, limit, signal, observation) {
  return new Promise((resolve, reject) => {
    let failed = false, completed = false, settled = false, result;
    function fail(kind, status) {
      if (failed || settled) return;
      failed = true;
      if (!signal.aborted) observation.note(kind, status);
    }
    const req = request({ protocol: 'https:', hostname: 'api.cloudflare.com', port: 443, path,
      method: body === null ? 'GET' : 'POST', agent: false, signal, maxHeaderSize: 8192,
      headers: { authorization: `Bearer ${token}`, accept: 'application/json', 'accept-encoding': 'identity',
        ...(body === null ? {} : { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }) } }, res => {
      const stop = (kind, status) => { if (!failed && !settled) { fail(kind, status); req.destroy(); } };
      res.on('error', () => stop('transport')); res.on('aborted', () => stop('transport'));
      if (settled || failed) return;
      const status = res.statusCode;
      if (!Number.isInteger(status) || status < 100 || status > 599) return stop('unknown');
      if (status !== 200) return stop('http_rejection', status);
      if ((res.headers['content-encoding'] ?? 'identity') !== 'identity' ||
          Number(res.headers['content-length'] ?? 0) > limit) return stop('unusable_envelope');
      const chunks = []; let size = 0;
      res.on('data', chunk => { if (!failed && !settled) { size += chunk.length; if (size > limit) stop('unusable_envelope'); else chunks.push(chunk); } });
      res.on('end', () => {
        if (failed || settled) return;
        if (!res.complete) return stop('transport');
        try {
          const envelope = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
          if (envelope.success !== true || !Array.isArray(envelope.errors) || envelope.errors.length) throw new Error();
          if (!Object.hasOwn(envelope, 'result') && !signal.aborted) observation.note('unusable_envelope');
          result = envelope.result; completed = true; // Preserve the role decoder's existing invalid_result for missing data.
        } catch { stop('unusable_envelope'); }
      });
    });
    req.on('error', () => fail('transport'));
    req.once('close', () => {
      if (completed && !failed) resolve(result);
      else { fail('transport'); reject(new Error()); }
      settled = true;
    });
    req.end(body);
  });
}
export async function authorizedRun(id, token, parent, observation) {
  if (!/^[0-9a-f]{32}$/.test(id) || typeof token !== 'string' || !/^[\x21-\x7e]{1,4096}$/.test(token)) throw new Error();
  const timeout = AbortSignal.timeout(10000);
  const expired = () => { if (!parent.aborted) observation.note('local_deadline'); };
  timeout.addEventListener('abort', expired, { once: true });
  let memberships;
  try { memberships = await json('/client/v4/memberships', token, null, 65536, AbortSignal.any([parent, timeout]), observation); }
  finally { timeout.removeEventListener('abort', expired); }
  if (!Array.isArray(memberships) || memberships.filter(m => m.account.id === id).length !== 1 ||
      !memberships.some(m => m.account.id === id && m.status === 'accepted')) throw new Error();
  return (body, limit, signal) => json(`/client/v4/accounts/${id}/ai/run/${WORKERS_AI_CANDIDATE}`, token, body, limit, signal, observation);
}
