import { ConversationDependencyUnavailable, type CreationWindow } from '../shared/conversation.ts';

export const UTC_DAY_MS = 86_400_000;

export function creationWindow(now: Date): CreationWindow {
  const time = now.getTime();
  if (!Number.isFinite(time) || time < 0) throw new ConversationDependencyUnavailable();
  const day = Math.floor(time / UTC_DAY_MS) * UTC_DAY_MS;
  return { day, expiresAt: day + UTC_DAY_MS };
}

export function creationLimit(value: string | undefined): number {
  if (value === undefined) return 10;
  if (!/^[1-9][0-9]*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new ConversationDependencyUnavailable();
  return Number(value);
}

export async function creationPseudonym(address: string, window: CreationWindow, dailyKey: string): Promise<string> {
  if (!/^[0-9a-f]{64}$/.test(dailyKey)) throw new ConversationDependencyUnavailable();
  const bytes = Uint8Array.from(dailyKey.match(/../g)!, (pair) => parseInt(pair, 16));
  const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const input = `candidate-copilot:conversation-creation:v1\n${new Date(window.day).toISOString().slice(0, 10)}\n${address}`;
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
