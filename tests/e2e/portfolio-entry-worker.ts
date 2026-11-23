import { SyntheticConversationProcessor } from '../../src/adapters/simulated/conversation-processor.ts';
import { createWorker } from '../../src/worker/index.ts';

// Only the disposable browser fixture selects this composition. Same API,
// admission limits, origin policy and persistence as the default Worker.
export default createWorker(undefined, undefined, { processor: catalog => new SyntheticConversationProcessor(catalog, 'clarification') });
