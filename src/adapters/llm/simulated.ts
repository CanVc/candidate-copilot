import type { LLMProvider } from '../../ports/LLMProvider';

export class SimulatedLLMProvider implements LLMProvider {
  async generate(input: string): Promise<string> {
    if (input !== 'bootstrap-ping') {
      throw new Error('Unsupported simulated LLM fixture');
    }
    return 'Simulated LLM: bootstrap-pong';
  }
}
