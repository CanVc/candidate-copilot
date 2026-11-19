import { createIntentFixture } from './professional-intent-worker.ts';

// Explicit disposable local accounting profiles, never production configuration.
export default createIntentFixture(20, true);
