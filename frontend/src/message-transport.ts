import { attemptTiming } from '../../src/shared/attempt-timing';

// Elapsed browser wait means unknown, not a
// recorded processing failure or permission to resubmit.
export const messageTransportWaitMs = (browserWaitMs?: number): number =>
  attemptTiming(browserWaitMs === undefined ? {} : { browserWaitMs }).browserWaitMs;
