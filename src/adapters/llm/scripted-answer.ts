import type { AnswerGenerator, ClassificationOptions, ClassificationPrompt } from '../../ports/LLMProvider.ts';
import type { ModelTokenAccounting, PreparedModelCall } from '../../ports/ModelTokenAccounting.ts';
import { validateModelCallIntegrity } from '../../shared/model-context-budget.ts';
import { deterministicReceiver } from './deterministic-accounting.ts';

// Explicit local fixture only; never selected by production composition.
export class ScriptedAnswerGenerator implements AnswerGenerator {
  constructor(private readonly script: (input: ClassificationPrompt, options?: ClassificationOptions) => unknown | Promise<unknown>,
    readonly answerReceiver: ModelTokenAccounting = deterministicReceiver()) {}
  async generateAnswer(input: PreparedModelCall, options?: ClassificationOptions): Promise<unknown> {
    validateModelCallIntegrity(this.answerReceiver, input);
    if (options?.signal?.aborted) throw new Error('Generation cancelled');
    options?.check?.();
    const output = await this.script(input, options);
    options?.check?.();
    try {
      const serialized = JSON.stringify(output);
      if (typeof serialized !== 'string') return null;
      const tokens = this.answerReceiver.count(serialized);
      if (!Number.isSafeInteger(tokens) || tokens < 1 || tokens > input.outputTokens) return null;
    } catch { return null; }
    return output;
  }
}
