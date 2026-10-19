# Shared contracts

`health.ts` defines and validates the minimal `{ "status": "ok" }` availability response shared by the Worker and frontend. It says nothing about product readiness. Keep shared code independent of browser globals, Hono, Cloudflare bindings and provider SDKs; no speculative business schemas.
