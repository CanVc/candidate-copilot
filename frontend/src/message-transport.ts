import { attemptTiming } from '../../src/shared/attempt-timing';

// Future message POST transport only. Elapsed wait means unknown, not a
// recorded processing failure or permission to resubmit. No health/UI wiring.
export const messageTransportWaitMs = (browserWaitMs?: number): number =>
  attemptTiming(browserWaitMs === undefined ? {} : { browserWaitMs }).browserWaitMs;
