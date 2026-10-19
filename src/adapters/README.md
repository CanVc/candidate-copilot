# Adapters

`llm/simulated.ts` implements `LLMProvider` with one exact fixture: `bootstrap-ping` → `Simulated LLM: bootstrap-pong`. Repeated calls return the same string; every other input rejects. It needs no key, configuration, SDK or model network call. Dedicated tests exercise it; the Worker health route never invokes it and no chat or public simulation endpoint exists.

Keep infrastructure translation outside application policy. Database and real-provider adapters remain deferred.
