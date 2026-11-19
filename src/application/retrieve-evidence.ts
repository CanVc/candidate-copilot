import { RetrievalUnavailable, type RetrievalRequest, type RetrievalResult, type Retriever, type GenerationRetriever } from '../ports/Retriever.ts';
import { exactObject, publicString, stringSet, validUnicode } from '../shared/public-catalog.ts';

export function validateRetrievalRequest(request: RetrievalRequest): RetrievalRequest {
  try {
    exactObject(request, ['resolvedQuestion', 'searchTerms', 'eligibleDocumentIds']);
    publicString(request.resolvedQuestion);
    if (request.resolvedQuestion.length > 8000 || !Array.isArray(request.searchTerms) || request.searchTerms.length > 32 ||
        Array.from(request.searchTerms).some((term) => typeof term !== 'string' || term.length > 256 || !validUnicode(term))) throw new Error();
    if (!Array.isArray(request.eligibleDocumentIds)) throw new Error();
    const eligibleDocumentIds = stringSet(Array.from(request.eligibleDocumentIds, publicString));
    if (!eligibleDocumentIds.length) throw new Error();
    return { resolvedQuestion: request.resolvedQuestion, searchTerms: [...request.searchTerms], eligibleDocumentIds };
  } catch { throw new RetrievalUnavailable(); }
}

export async function retrieveEvidence(retriever: Retriever, request: RetrievalRequest): Promise<RetrievalResult> {
  try { return await retrieveGenerationEvidence({ retrieveForGeneration: (input) => retriever.retrieve(input) }, request); } catch { throw new RetrievalUnavailable(); }
}

export async function retrieveGenerationEvidence(retriever: GenerationRetriever, request: RetrievalRequest): Promise<RetrievalResult> {
  try {
    const trusted = validateRetrievalRequest(request);
    const membership = new Set(trusted.eligibleDocumentIds);
    // Do not let an adapter mutate the membership used for the mechanical guard.
    const result = await retriever.retrieveForGeneration(trusted);
    if (!Array.isArray(result.chunks) || result.chunks.some((chunk) => !membership.has(chunk.documentId))) throw new Error();
    return result;
  } catch (error) {
    if (error instanceof RetrievalUnavailable) throw error;
    throw new RetrievalUnavailable();
  }
}
