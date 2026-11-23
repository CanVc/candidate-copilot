import type { ModelTokenAccounting, PreparedModelCall } from '../../ports/ModelTokenAccounting.ts';
import { validateModelCallIntegrity } from '../../shared/model-context-budget.ts';
import { deterministicReceiver } from './deterministic-accounting.ts';
import type { ClassificationOptions, ClassificationPrompt } from '../../ports/LLMProvider.ts';
import { SimulatedLLMProvider } from './simulated.ts';

// Explicit deterministic fixtures, never a text heuristic or live provider.
export class ScriptedLLMProvider extends SimulatedLLMProvider {
  constructor(private readonly script: (input: ClassificationPrompt, options?: ClassificationOptions) => unknown | Promise<unknown>,
    override readonly receiver: ModelTokenAccounting = deterministicReceiver()) { super(); }
  override async classify(input: PreparedModelCall, options?: ClassificationOptions): Promise<unknown> {
    validateModelCallIntegrity(this.receiver, input);
    options?.check?.();
    const output = await this.script(input, options);
    options?.check?.();
    try {
      const serialized = JSON.stringify(output);
      if (typeof serialized !== 'string') return null;
      const tokens = this.receiver.count(serialized);
      if (!Number.isSafeInteger(tokens) || tokens < 1 || tokens > input.outputTokens) return null;
    } catch { return null; }
    // Null above is rejected by the consumer's existing invalid-result path;
    // never truncate, repair or retry malformed/over-budget scripted output.
    return output;
  }
}
