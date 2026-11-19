import type { ClassificationOptions, ClassificationPrompt } from '../../ports/LLMProvider.ts';
import { SimulatedLLMProvider } from './simulated.ts';

// Explicit deterministic fixtures, never a text heuristic or live provider.
export class ScriptedLLMProvider extends SimulatedLLMProvider {
  constructor(private readonly script: (input: ClassificationPrompt, options?: ClassificationOptions) => unknown | Promise<unknown>) { super(); }
  override async classify(input: ClassificationPrompt, options?: ClassificationOptions): Promise<unknown> { return this.script(input, options); }
}
