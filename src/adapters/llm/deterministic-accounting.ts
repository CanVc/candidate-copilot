import type { ModelContextBudget, ModelTokenAccounting } from '../../ports/ModelTokenAccounting.ts';
import { DEFAULT_MODEL_CONTEXT_BUDGET } from '../../shared/model-context-budget.ts';

// Synthetic local token vocabularies only, NOT estimates of any provider's tokens.
// scalar-v1 assigns one token per Unicode scalar; scalar-pair-v1 packs pairs.
export function deterministicReceiver(profile: 'scalar-v1' | 'scalar-pair-v1' = 'scalar-pair-v1',
  options: { capacity?: number; maximumOutput?: number; budget?: ModelContextBudget } = {}): ModelTokenAccounting {
  const budget = options.budget ?? DEFAULT_MODEL_CONTEXT_BUDGET;
  return Object.freeze({ model: `local-fixture-${profile}`, modelVersion: '1', tokenizer: profile, tokenizerVersion: '1',
    serializationVersion: 'local-json-messages-v1', capacity: options.capacity ?? 32000, maximumOutput: options.maximumOutput ?? 4000,
    budget: Object.freeze({ components: Object.freeze({ ...budget.components }), output: budget.output }),
    count: (text: string) => Math.ceil(Array.from(text).length / (profile === 'scalar-v1' ? 1 : 2)),
    serialize: (prompt: { instructions: string; data: string }) => JSON.stringify({ version: 1, messages: [
      { role: 'system', content: prompt.instructions }, { role: 'user', content: prompt.data },
    ], responseFormat: 'json' }),
  });
}
