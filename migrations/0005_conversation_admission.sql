-- Historical snapshots have no foreign key to the mutable public publication.
CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL CHECK (length(request_id) > 0),
  ordinal INTEGER NOT NULL CHECK (ordinal > 0),
  question TEXT NOT NULL,
  created_at TEXT NOT NULL,
  context_anchor_message_id TEXT NOT NULL CHECK (context_anchor_message_id = id),
  submission_identity TEXT NOT NULL CHECK (json_valid(submission_identity) AND json_extract(submission_identity, '$.kind') IS 'direct'),
  submitted_scope TEXT NOT NULL CHECK (json_valid(submitted_scope)
    AND json_extract(submitted_scope, '$.version') IS 1
    AND json_extract(submitted_scope, '$.mode') IS 'global_public'
    AND json_type(submitted_scope, '$.resources') IS 'array'
    AND json_array_length(submitted_scope, '$.resources') = 0
    AND json_type(submitted_scope, '$.eligibleDocumentIds') IS 'array'
    AND json_array_length(submitted_scope, '$.eligibleDocumentIds') > 0),
  UNIQUE (conversation_id, request_id),
  UNIQUE (conversation_id, ordinal)
);
CREATE TRIGGER messages_immutable BEFORE UPDATE ON messages
BEGIN SELECT RAISE(ABORT, 'Immutable admitted message'); END;
CREATE TABLE conversation_processing_leases (
  conversation_id TEXT PRIMARY KEY NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  attempt_id TEXT NOT NULL CHECK (length(attempt_id) > 0 AND attempt_id <> request_id),
  processing_until INTEGER NOT NULL,
  FOREIGN KEY (conversation_id, request_id) REFERENCES messages(conversation_id, request_id)
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);
