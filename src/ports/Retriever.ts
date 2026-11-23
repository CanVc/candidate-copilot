import type { OperationControls } from '../shared/attempt-timing.ts';
import type { RetrievedChunk } from '../shared/public-evidence.ts';

export interface RetrievalRequest {
  resolvedQuestion: string;
  searchTerms: string[];
  // Trusted frozen membership, never browser/model-provided scope.
  eligibleDocumentIds: string[];
}
export interface RetrievalResult { chunks: RetrievedChunk[] }
export interface Retriever {
  retrieve(request: RetrievalRequest): Promise<RetrievalResult>;
}

// Required for generation: successful empty results must mean no matches, not
// nonempty budget exhaustion. Legacy readers retain their original contract.
export interface GenerationRetriever {
  retrieveForGeneration(request: RetrievalRequest, controls?: Partial<OperationControls>): Promise<RetrievalResult>;
}

// Empty evidence is success; technical failure or unusable scope is not.
export class RetrievalUnavailable extends Error {
  readonly code = 'retrieval_unavailable';
  constructor() { super('retrieval_unavailable'); this.name = 'RetrievalUnavailable'; }
}

// Subclasses preserve legacy fail-closed readers while the generation path can
// distinguish confirmed withdrawal, dependency failure and nonempty overflow.
export class RetrievalScopeUnavailable extends RetrievalUnavailable {}
export class RetrievalDependencyUnavailable extends RetrievalUnavailable {}
export class RetrievalLimitExceeded extends RetrievalUnavailable {}
