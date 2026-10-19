import { Hono } from 'hono';

// No routes or bindings yet. Hono's default unmatched response is 404.
const app = new Hono();

export default app;
