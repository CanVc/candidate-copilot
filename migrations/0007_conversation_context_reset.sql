-- Application-owned restatement provenance, not another completion marker.
-- Answer ownership supplies atomic rollback, retention and deletion cascade.
ALTER TABLE answers ADD COLUMN context_reset INTEGER NOT NULL DEFAULT 0
  CHECK (context_reset IN (0, 1) AND (context_reset = 0 OR status = 'clarification'));
