import type { AttemptTimer } from '../../src/shared/attempt-timing.ts';

export function manualTime(start = 0) {
  let now = start;
  const timers = new Map<() => void, number>();
  const timer: AttemptTimer = (expire, delay) => {
    timers.set(expire, now + delay);
    return () => { timers.delete(expire); };
  };
  return { clock: { now: () => new Date(now) }, timer, timers,
    advance(ms: number, deliver = true) {
      now += ms;
      if (deliver) for (const [expire, end] of timers) if (now >= end) { timers.delete(expire); expire(); }
    },
  };
}
export function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
