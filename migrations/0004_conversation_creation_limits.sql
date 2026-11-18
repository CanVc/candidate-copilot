-- No address or Conversation reference: these rows are temporary personal data.
CREATE TABLE conversation_creation_key (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  day INTEGER NOT NULL CHECK (day % 86400000 = 0),
  expires_at INTEGER NOT NULL CHECK (expires_at = day + 86400000),
  daily_key TEXT CHECK (daily_key IS NULL OR (length(daily_key) = 64 AND daily_key NOT GLOB '*[^0-9a-f]*'))
);
-- Nonvisitor watermark survives key erasure. Requests never recreate this row.
INSERT INTO conversation_creation_key VALUES (1, -86400000, 0, NULL);
CREATE TABLE conversation_creation_counters (
  pseudonym TEXT PRIMARY KEY NOT NULL CHECK (length(pseudonym) = 64 AND pseudonym NOT GLOB '*[^0-9a-f]*'),
  expires_at INTEGER NOT NULL,
  creations INTEGER NOT NULL CHECK (creations > 0)
);
CREATE INDEX conversation_creation_expiry ON conversation_creation_counters(expires_at);
