import type { RetrievedChunk } from '../shared/public-evidence.ts';

export interface RetrievalRequest {
  resolvedQuestion: string;
  searchTerms: string[];
  // Trusted frozen membership, never browser/model-provided scope.
  eligibleDocumentIds: string[];
}
export interface RetrievalResult { chunks: RetrievedChunk[] }
export interface Retriever { retrieve(request: RetrievalRequest): Promise<RetrievalResult> }

// Empty evidence is success; technical failure or unusable scope is not.
export class RetrievalUnavailable extends Error {
  readonly code = 'retrieval_unavailable';
  constructor() { super('retrieval_unavailable'); this.name = 'RetrievalUnavailable'; }
}
