import { request } from 'node:https';
import { WORKERS_AI_CANDIDATE } from '../../src/adapters/llm/workers-ai.ts';

// One request, no pooling, redirect following, decompression, SDK retries or diagnostic body logging.
function json(path, token, body, limit, signal) {
  return new Promise((resolve, reject) => {
    let completed = false, result;
    const req = request({ protocol: 'https:', hostname: 'api.cloudflare.com', port: 443, path,
      method: body === null ? 'GET' : 'POST', agent: false, signal, maxHeaderSize: 8192,
      headers: { authorization: `Bearer ${token}`, accept: 'application/json', 'accept-encoding': 'identity',
        ...(body === null ? {} : { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }) } }, res => {
      const fail = () => { completed = false; req.destroy(); };
      res.on('error', fail); res.on('aborted', fail);
      if (res.statusCode !== 200 || (res.headers['content-encoding'] ?? 'identity') !== 'identity' ||
          Number(res.headers['content-length'] ?? 0) > limit) return fail();
      const chunks = []; let size = 0;
      res.on('data', chunk => { size += chunk.length; if (size > limit) fail(); else chunks.push(chunk); });
      res.on('end', () => {
        try {
          if (size > limit || !res.complete) throw new Error();
          const envelope = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
          if (envelope.success !== true || !Array.isArray(envelope.errors) || envelope.errors.length) throw new Error();
          result = envelope.result; completed = true;
        } catch { fail(); }
      });
    });
    req.on('error', () => { completed = false; });
    req.once('close', () => completed ? resolve(result) : reject(new Error('transport')));
    req.end(body);
  });
}
export async function authorizedRun(id, token, parent) {
  if (!/^[0-9a-f]{32}$/.test(id) || typeof token !== 'string' || !/^[\x21-\x7e]{1,4096}$/.test(token)) throw new Error();
  const memberships = await json('/client/v4/memberships', token, null, 65536, AbortSignal.any([parent, AbortSignal.timeout(10000)]));
  if (!Array.isArray(memberships) || memberships.filter(m => m.account.id === id).length !== 1 ||
      !memberships.some(m => m.account.id === id && m.status === 'accepted')) throw new Error();
  return (body, limit, signal) => json(`/client/v4/accounts/${id}/ai/run/${WORKERS_AI_CANDIDATE}`, token, body, limit, signal);
}
