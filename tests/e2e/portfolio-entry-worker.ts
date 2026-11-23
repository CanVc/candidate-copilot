import { SyntheticConversationProcessor } from '../../src/adapters/simulated/conversation-processor.ts';
import { createWorker } from '../../src/worker/index.ts';

// Only the disposable browser fixture selects this composition. Same API,
// admission limits, origin policy and persistence as the default Worker.
export default createWorker(undefined, undefined, { processor: catalog => new SyntheticConversationProcessor(catalog, 'clarification') });

export const failed = createWorker(undefined, undefined, { processor: catalog => new SyntheticConversationProcessor(catalog, 'failed') });
export const middle = createWorker(undefined, undefined, { processor: catalog => ({
  async process() {
    const publication = await catalog.readSnapshot();
    const chunk = publication?.chunks.find(c => c.sourcePath.endsWith('/projet-prototype-prets.md') && c.sectionTitle === 'Solution et choix importants');
    if (!chunk) throw new Error('Missing fixed public middle chunk');
    return { draft: { status: 'answered', language: 'fr', blocks: [{ kind: 'paragraph', text: 'Passage de démonstration.', sourceIds: ['S1'] }] },
      sources: [{ responseLocalId: 'S1', chunk: { ...chunk, rank: 0 } }] };
  },
}) });
