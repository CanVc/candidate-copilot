# Ports

`LLMProvider` is a framework-independent string-generation capability: `generate(input: string): Promise<string>`. The bootstrap fixture is exactly `bootstrap-ping` → `Simulated LLM: bootstrap-pong`; unsupported inputs reject. This is plumbing evidence, not a Conversation contract.

ConversationStore, Retriever, SafetyGate, ResourceCatalog and Clock/Retention remain later design responsibilities. Ports must not depend on Hono, Cloudflare bindings, browser code or provider SDKs.
