import { ConversationDependencyUnavailable } from '../../shared/conversation.ts';

// Strict address syntax first; URL canonicalization then normalizes IPv6 compression
// and embedded IPv4 without accepting URL hosts, ports, zones or legacy IPv4 forms.
export function canonicalAddress(input: string): string {
  const invalid = () => { throw new ConversationDependencyUnavailable(); };
  if (!input || input.trim() !== input || /[\s,%\[\]\/]/.test(input)) return invalid();
  if (!input.includes(':')) {
    const parts = input.split('.');
    if (parts.length !== 4 || parts.some((p) => !/^(0|[1-9][0-9]{0,2})$/.test(p) || Number(p) > 255)) return invalid();
    return parts.join('.');
  }
  if (!/^[0-9a-fA-F:.]+$/.test(input)) return invalid();
  if (input.includes('.')) canonicalAddress(input.slice(input.lastIndexOf(':') + 1));
  try {
    const normalized = new URL(`http://[${input}]/`).hostname.slice(1, -1);
    // IPv4-mapped IPv6 represents the same address, not another allowance.
    const mapped = /^::ffff:([0-9a-f]+):([0-9a-f]+)$/.exec(normalized);
    if (mapped) {
      const a = parseInt(mapped[1]!, 16), b = parseInt(mapped[2]!, 16);
      return `${a >>> 8}.${a & 255}.${b >>> 8}.${b & 255}`;
    }
    return normalized;
  } catch { return invalid(); }
}

export function trustedCreationAddress(request: Request, mode: string | undefined): string {
  if (mode === 'local-fixed') return '127.0.0.1';
  const cf = (request as Request & { cf?: { colo?: unknown; asn?: unknown } }).cf;
  if (mode !== 'cloudflare-direct' || !cf || typeof cf.colo !== 'string' || !/^[A-Z]{3}$/.test(cf.colo) ||
      typeof cf.asn !== 'number' || !Number.isSafeInteger(cf.asn) || cf.asn <= 0 ||
      ['CF-Worker', 'CF-Pseudo-IPv4', 'CF-Connecting-IPv6'].some((name) => request.headers.has(name))) {
    throw new ConversationDependencyUnavailable();
  }
  const address = canonicalAddress(request.headers.get('CF-Connecting-IP') ?? '');
  // Cloudflare's cross-zone Worker sentinel is never a visitor address.
  if (address === '2a06:98c0:3600::103') throw new ConversationDependencyUnavailable();
  return address;
}
