// Minimal string-generation capability; no framework or business contract.
export interface LLMProvider {
  generate(input: string): Promise<string>;
}
