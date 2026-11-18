CREATE TABLE active_publication (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  catalog_revision TEXT NOT NULL CHECK (length(catalog_revision) IN (40,64) AND catalog_revision NOT GLOB '*[^0-9a-f]*'),
  catalog_hash TEXT NOT NULL CHECK (length(catalog_hash) = 64 AND catalog_hash NOT GLOB '*[^0-9a-f]*'),
  modified_at TEXT NOT NULL CHECK (length(modified_at) > 0)
);
CREATE TABLE public_resources (
  resource_id TEXT PRIMARY KEY NOT NULL CHECK (length(resource_id) > 0),
  name TEXT NOT NULL CHECK (length(name) > 0),
  description TEXT NOT NULL CHECK (length(description) > 0)
);
CREATE TABLE public_documents (
  document_id TEXT PRIMARY KEY NOT NULL CHECK (length(document_id) > 0),
  source_path TEXT NOT NULL UNIQUE CHECK (source_path LIKE 'content/public/%.md'),
  document_json TEXT NOT NULL CHECK (json_valid(document_json)),
  chunk_count INTEGER NOT NULL CHECK (chunk_count >= 0)
);
CREATE TABLE public_resource_documents (
  resource_id TEXT NOT NULL REFERENCES public_resources(resource_id),
  document_id TEXT NOT NULL REFERENCES public_documents(document_id),
  PRIMARY KEY (resource_id, document_id)
);
CREATE INDEX public_resource_documents_document ON public_resource_documents(document_id);
CREATE TABLE public_chunks (
  chunk_id TEXT PRIMARY KEY NOT NULL CHECK (length(chunk_id) = 64 AND chunk_id NOT GLOB '*[^0-9a-f]*'),
  document_id TEXT NOT NULL REFERENCES public_documents(document_id),
  ordinal INTEGER NOT NULL CHECK (ordinal >= 0),
  chunk_json TEXT NOT NULL CHECK (json_valid(chunk_json)),
  UNIQUE (document_id, ordinal)
);
CREATE VIRTUAL TABLE public_chunks_fts USING fts5(chunk_id UNINDEXED, text);
