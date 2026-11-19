-- The unique answer is the terminal marker. Historical evidence has no live-index FK.
CREATE TABLE answers (
  id TEXT PRIMARY KEY NOT NULL,
  message_id TEXT NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('answered', 'partial', 'clarification', 'refused', 'failed')),
  language TEXT NOT NULL,
  error_json TEXT CHECK (error_json IS NULL OR json_valid(error_json)),
  created_at TEXT NOT NULL,
  CHECK (((status = 'failed' AND error_json IS NOT NULL
    AND json_type(error_json, '$.message') = 'text' AND length(json_extract(error_json, '$.message')) > 0
    AND json_extract(error_json, '$.code') IN ('scope_unavailable', 'invalid_result', 'processing_unavailable')
    AND json_type(error_json, '$.retryable') IN ('true', 'false')
    AND ((json_extract(error_json, '$.retryable') = 1 AND json_extract(error_json, '$.retryMode') = 'new_request')
      OR (json_extract(error_json, '$.retryable') = 0 AND json_extract(error_json, '$.retryMode') = 'none'))
    AND (json_extract(error_json, '$.code') <> 'scope_unavailable' OR json_extract(error_json, '$.retryable') = 0))
    OR (status <> 'failed' AND error_json IS NULL)) IS 1)
);
CREATE TABLE answer_blocks (
  id TEXT PRIMARY KEY NOT NULL,
  answer_id TEXT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL CHECK (sequence >= 0),
  kind TEXT NOT NULL CHECK (kind IN ('paragraph', 'summary', 'limitation', 'refusal', 'transition', 'clarification', 'error')),
  text TEXT NOT NULL CHECK (length(text) > 0),
  UNIQUE (answer_id, sequence),
  UNIQUE (answer_id, id)
);
CREATE TABLE source_excerpts (
  id TEXT PRIMARY KEY NOT NULL,
  answer_id TEXT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL CHECK (sequence >= 0),
  response_local_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  source_chunk_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  source_title TEXT NOT NULL,
  section_title TEXT,
  source_path TEXT NOT NULL CHECK (source_path LIKE 'content/public/%.md'),
  source_revision TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  location TEXT NOT NULL,
  UNIQUE (answer_id, sequence),
  UNIQUE (answer_id, response_local_id),
  UNIQUE (answer_id, id)
);
CREATE TABLE answer_block_sources (
  answer_id TEXT NOT NULL,
  answer_block_id TEXT NOT NULL,
  source_excerpt_id TEXT NOT NULL,
  sequence INTEGER NOT NULL CHECK (sequence >= 0),
  PRIMARY KEY (answer_block_id, source_excerpt_id),
  UNIQUE (answer_block_id, sequence),
  FOREIGN KEY (answer_id, answer_block_id) REFERENCES answer_blocks(answer_id, id) ON DELETE CASCADE,
  FOREIGN KEY (answer_id, source_excerpt_id) REFERENCES source_excerpts(answer_id, id) ON DELETE CASCADE
);

CREATE INDEX answer_block_sources_by_answer ON answer_block_sources(answer_id, source_excerpt_id);
