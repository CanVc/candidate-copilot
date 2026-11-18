import { validateRetrievalRequest } from '../../application/retrieve-evidence.ts';
import { RetrievalUnavailable, type RetrievalRequest, type RetrievalResult, type Retriever } from '../../ports/Retriever.ts';
import { D1ResourceCatalog } from './publication.ts';

export interface LexicalLimits { topK: number; textBudget: number }
export const defaultLexicalLimits: Readonly<LexicalLimits> = Object.freeze({ topK: 5, textBudget: 12000 });

export function encodeLexicalTerms(terms: string[]): string | null {
  // Only letters/marks/numbers become individually quoted literal tokens.
  // No caller-controlled FTS operators, column selectors, prefixes or SQL.
  const tokens = [...new Set(terms.flatMap((term) => term.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*/gu) ?? []))];
  if (tokens.length > 64 || tokens.some((token) => token.length > 64)) throw new RetrievalUnavailable();
  return tokens.length ? tokens.map((token) => `"${token}"`).join(' OR ') : null;
}

export class D1Retriever implements Retriever {
  private readonly limits: LexicalLimits;
  private readonly db: D1Database;
  constructor(db: D1Database, limits: LexicalLimits = defaultLexicalLimits) {
    this.db = db;
    const topK = limits?.topK;
    const textBudget = limits?.textBudget;
    if (!Number.isSafeInteger(topK) || topK < 1 || topK > 100 ||
        !Number.isSafeInteger(textBudget) || textBudget < 1 || textBudget > 1000000) throw new RetrievalUnavailable();
    this.limits = { topK, textBudget };
  }
  async retrieve(request: RetrievalRequest): Promise<RetrievalResult> {
    try {
      const trusted = validateRetrievalRequest(request);
      const expression = encodeLexicalTerms(trusted.searchTerms);
      const membership = new Set(trusted.eligibleDocumentIds);
      // Filter eligible rows in SQL before ordering; never limit a global hit list.
      // JSON binding avoids a variable-count cap on frozen document membership.
      const statement = expression === null ? this.db.prepare('SELECT chunk_id FROM public_chunks WHERE 0') : this.db.prepare(`
        SELECT c.chunk_id FROM public_chunks_fts
        JOIN public_chunks c ON c.chunk_id = public_chunks_fts.chunk_id
        WHERE c.document_id IN (SELECT value FROM json_each(?)) AND public_chunks_fts MATCH ?
        ORDER BY bm25(public_chunks_fts), c.document_id COLLATE BINARY, c.ordinal, c.chunk_id COLLATE BINARY
      `).bind(JSON.stringify(trusted.eligibleDocumentIds), expression);
      const snapshot = await new D1ResourceCatalog(this.db).readSearchSnapshot(statement);
      if (!snapshot || trusted.eligibleDocumentIds.some((id) => !snapshot.publication.documents.some((d) => d.documentId === id))) throw new Error();
      const evidence = new Map(snapshot.publication.chunks.map((c) => [c.chunkId, c]));
      const seen = new Set<string>();
      const ranked = snapshot.matches.map((row) => {
        const chunk = evidence.get(row.chunk_id as string);
        if (!chunk || !membership.has(chunk.documentId) || seen.has(chunk.chunkId)) throw new Error();
        seen.add(chunk.chunkId);
        return chunk;
      });
      const chunks: RetrievalResult['chunks'] = [];
      let remaining = this.limits.textBudget;
      for (const chunk of ranked) {
        if (chunks.length === this.limits.topK) break;
        if (chunk.text.length > remaining) continue;
        const { chunkId, documentId, sourcePath, sourceRevision, contentHash, sourceTitle, sectionTitle, text, location } = chunk;
        chunks.push({ chunkId, documentId, sourcePath, sourceRevision, contentHash, sourceTitle, sectionTitle, text, location, rank: chunks.length + 1 });
        remaining -= text.length;
      }
      return { chunks };
    } catch { throw new RetrievalUnavailable(); }
  }
}
