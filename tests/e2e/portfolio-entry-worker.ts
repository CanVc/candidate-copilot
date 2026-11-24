import { SyntheticConversationProcessor } from '../../src/adapters/simulated/conversation-processor.ts';
import { createWorker } from '../../src/worker/index.ts';

// Only the disposable browser fixture selects this composition. Same API,
// admission limits, origin policy and persistence as the default Worker.
export default createWorker(undefined, undefined, { processor: catalog => new SyntheticConversationProcessor(catalog, 'clarification') });

// Exercise a real invalid_request at a positive configured server limit below the UI default.
export const short = createWorker(undefined, undefined, { limits: { maxQuestionCharacters: 20 }, processor: catalog => new SyntheticConversationProcessor(catalog, 'clarification') });
export const failed = createWorker(undefined, undefined, { processor: catalog => new SyntheticConversationProcessor(catalog, 'failed') });
// Lower cap makes post-terminal server authority observable in a two-turn fixture.
const middleWorker = (limits: { maxMessages?: number; maxQuestionCharacters?: number }) => createWorker(undefined, undefined, { limits, processor: catalog => ({
  async process(message) {
    const publication = await catalog.readSnapshot();
    const section = message.question === '  Un deuxième passage ?  ' ? 'État du projet et usages réels' :
      message.question === '  Un passage antérieur ?  ' ? 'Ma contribution et le périmètre réalisé' : 'Solution et choix importants';
    const chunk = publication?.chunks.find(c => c.sourcePath.endsWith('/projet-prototype-prets.md') && c.sectionTitle === section);
    if (!chunk) throw new Error('Missing fixed public middle chunk');
    return { draft: { status: 'answered', language: 'fr', blocks: [{ kind: 'paragraph', text: `Démonstration fictive : ${section}.`, sourceIds: ['S1'] }] },
      sources: [{ responseLocalId: 'S1', chunk: { ...chunk, rank: 0 } }] };
  },
}) });
export const middle = middleWorker({ maxMessages: 2 });
export const shortMiddle = middleWorker({ maxQuestionCharacters: 20 });
