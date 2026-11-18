-- Identity only. Message admission, processing leases and results belong to later stories.
CREATE TABLE conversations (
  id TEXT PRIMARY KEY NOT NULL,
  session_token_hash TEXT NOT NULL UNIQUE CHECK (length(session_token_hash) = 64 AND session_token_hash NOT GLOB '*[^0-9a-f]*'),
  created_at TEXT NOT NULL,
  modified_at TEXT NOT NULL
);
