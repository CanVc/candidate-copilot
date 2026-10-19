# Ports

Reserved for application-owned boundaries to external capabilities. ConversationStore, Retriever, LLMProvider, SafetyGate, ResourceCatalog and Clock/Retention are later design responsibilities, not interfaces to invent for bootstrap. Ports must not depend on Hono, Cloudflare bindings or provider SDKs.
