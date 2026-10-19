// Availability only: no model, database or product-readiness diagnostics.
export interface HealthResponse {
  status: 'ok';
}

export function isHealthResponse(value: unknown): value is HealthResponse {
  return typeof value === 'object' && value !== null && !Array.isArray(value) &&
    Object.keys(value).length === 1 && 'status' in value && value.status === 'ok';
}
