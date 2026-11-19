import type { ConversationProcessor } from '../../ports/ConversationProcessor.ts';
import type { ResourceCatalog } from '../../ports/ResourceCatalog.ts';
import type { AdmittedMessage } from '../../shared/conversation-admission.ts';
import type { AnswerStatus, LoadedSource } from '../../shared/conversation-result.ts';

// Explicit opt-in fixture composition, never classification of visitor text.
// All output is synthetic and makes no attribution to BC.
export class SyntheticConversationProcessor implements ConversationProcessor {
  constructor(private readonly catalog: ResourceCatalog, private readonly status: AnswerStatus = 'partial', private readonly language: 'fr' | 'en' = 'fr') {}
  async process(message: AdmittedMessage): ReturnType<ConversationProcessor['process']> {
    if (this.status === 'failed') return { failure: 'processing_unavailable', language: this.language };
    const disclaimer = this.language === 'en' ? 'Synthetic development fixture; not evidence about BC.' : 'Simulation de développement fictive ; aucune attribution à BC.';
    if (this.status === 'refused' || this.status === 'clarification') return { draft: { status: this.status, language: this.language,
      blocks: [{ kind: this.status === 'refused' ? 'refusal' : 'clarification', text: disclaimer, sourceIds: [] }] }, sources: [] };
    const publication = await this.catalog.readSnapshot();
    if (!publication || message.submittedScope.eligibleDocumentIds.some((id) => !publication.catalog.documents.some((d) => d.documentId === id))) {
      return { failure: 'scope_unavailable', language: this.language };
    }
    const sources: LoadedSource[] = publication.chunks.filter((c) => message.submittedScope.eligibleDocumentIds.includes(c.documentId)).slice(0, 2)
      .map((chunk, i) => ({ responseLocalId: `S${i + 1}`, chunk: { ...chunk, rank: i } }));
    return { draft: { status: sources.length ? this.status : 'partial', language: this.language, blocks: [
      { kind: sources.length ? 'paragraph' : 'limitation', text: disclaimer, sourceIds: sources.map((s) => s.responseLocalId) },
      ...(this.status === 'partial' ? [{ kind: 'limitation', text: disclaimer, sourceIds: [] }] : []),
    ] }, sources };
  }
}
