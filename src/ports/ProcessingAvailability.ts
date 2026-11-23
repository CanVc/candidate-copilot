// Trusted local observation for this processor's REQUIRED calls only. No probe,
// request-derived headers or model output. Conditional generator-only failures do
// not establish that a new question (which might clarify/refuse) is affected.
export type ProcessingAvailability = () => null | { confirmedUnavailable: true; resumeAt?: number };

export function confirmedProcessingOutage(snapshot: ProcessingAvailability | undefined, now: number): { resumeAt?: string } | null {
  let outage;
  try {
    outage = snapshot?.();
    if (outage?.confirmedUnavailable !== true) return null;
  } catch { return null; } // No confirmed evidence; never disable authenticated reads.
  let time;
  try { time = outage.resumeAt; } catch { return {}; } // Outage confirmed, timing unknown.
  if (time === undefined || !Number.isSafeInteger(time) || Number.isNaN(new Date(time).getTime())) return {};
  return time > now ? { resumeAt: new Date(time).toISOString() } : null;
}
