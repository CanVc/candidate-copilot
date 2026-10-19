import { isHealthResponse } from '../../src/shared/health';

export const HEALTH_TIMEOUT_MS = 4_500;

// The deadline covers headers AND body, including a stalled JSON response.
// The race also bounds failure if an implementation fails to honor abort.
export async function checkHealth(signal: AbortSignal): Promise<boolean> {
  const controller = new AbortController();
  let finish!: (available: boolean) => void;
  const cancelled = new Promise<boolean>((resolve) => { finish = resolve; });
  const cancel = () => {
    controller.abort();
    finish(false);
  };
  signal.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(cancel, HEALTH_TIMEOUT_MS);
  try {
    if (signal.aborted) {
      cancel();
      return false;
    }
    const request = async () => {
      try {
        const response = await fetch('/api/health', { signal: controller.signal, cache: 'no-store' });
        return response.ok && isHealthResponse(await response.json());
      } catch {
        return false;
      }
    };
    return await Promise.race([request(), cancelled]);
  } finally {
    // Non-OK responses short-circuit without reading their body. Abort even
    // after resolving so a streaming error response cannot outlive this check.
    controller.abort();
    clearTimeout(timer);
    signal.removeEventListener('abort', cancel);
  }
}
