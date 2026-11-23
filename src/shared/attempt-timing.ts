import type { Clock } from '../ports/Clock.ts';

export const DEFAULT_ATTEMPT_TIMING = Object.freeze({
  attemptMs: 30_000, classifierMs: 5_000, finalizeReserveMs: 2_000, browserWaitMs: 45_000,
});
export type AttemptTiming = { [K in keyof typeof DEFAULT_ATTEMPT_TIMING]: number };
export function attemptTiming(overrides: Partial<AttemptTiming> = {}): AttemptTiming {
  const timing = { ...DEFAULT_ATTEMPT_TIMING, ...overrides };
  if (Object.values(timing).some(n => !Number.isSafeInteger(n) || n < 1 || n > 0x7fffffff) ||
      timing.finalizeReserveMs >= timing.attemptMs || timing.classifierMs > timing.attemptMs - timing.finalizeReserveMs) {
    throw new Error('Invalid attempt timing');
  }
  return timing;
}

export type AttemptTimer = (expire: () => void, delayMs: number) => () => void;
export const startAttemptTimer: AttemptTimer = (expire, delayMs) => {
  const handle = setTimeout(expire, delayMs);
  return () => clearTimeout(handle);
};
export interface OperationControls { signal: AbortSignal; check: () => void }

// Bound observation even for a receiver that ignores cancellation. The clock
// check also catches synchronous work and settlements queued ahead of the timer.
export async function beforeCutoff<T>(clock: Clock, timer: AttemptTimer, end: number,
  operation: (controls: OperationControls) => Promise<T>, parent?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timeout = new Error('Attempt deadline elapsed');
  let stopWaiting!: () => void;
  const stopped = new Promise<never>((_, reject) => { stopWaiting = () => reject(timeout); });
  const expire = () => { controller.abort(); stopWaiting(); };
  const check = () => {
    if (controller.signal.aborted || parent?.aborted || !(clock.now().getTime() < end)) {
      controller.abort(); throw timeout;
    }
  };
  check();
  const cancelTimer = timer(expire, end - clock.now().getTime());
  parent?.addEventListener('abort', expire, { once: true });
  try {
    const value = await Promise.race([stopped, Promise.resolve().then(() => {
      check(); return operation({ signal: controller.signal, check });
    })]);
    check(); return value;
  } catch (error) { check(); throw error; }
  finally { cancelTimer(); parent?.removeEventListener('abort', expire); }
}
