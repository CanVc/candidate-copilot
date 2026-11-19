import type { ClassificationPrompt, LLMProvider } from '../../ports/LLMProvider';

export class SimulatedLLMProvider implements LLMProvider {
  async classify(_input: ClassificationPrompt): Promise<unknown> { throw new Error('Classifier is not configured'); }
  async generate(input: string): Promise<string> {
    if (input !== 'bootstrap-ping') {
      throw new Error('Unsupported simulated LLM fixture');
    }
    return 'Simulated LLM: bootstrap-pong';
  }
}
