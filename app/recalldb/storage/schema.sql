-- RecallDB Relational & Full-Text Schema
-- Enforces WAL Mode and Bitemporal Consistency

CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    memory_type TEXT NOT NULL DEFAULT 'fact',
    lifecycle_state TEXT NOT NULL DEFAULT 'active',
    event_time TEXT,
    valid_from TEXT,
    valid_until TEXT,
    recorded_at TEXT NOT NULL,
    source TEXT DEFAULT 'agent:interaction',
    confidence REAL NOT NULL DEFAULT 1.0,
    importance REAL NOT NULL DEFAULT 0.5,
    supersedes_id TEXT,
    superseded_by_id TEXT,
    entities TEXT,
    metadata TEXT,
    embedding BLOB
);

CREATE TABLE IF NOT EXISTS entities (
    name TEXT PRIMARY KEY,
    entity_type TEXT,
    metadata TEXT,
    first_seen TEXT,
    last_seen TEXT
);

CREATE TABLE IF NOT EXISTS relationships (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    predicate TEXT NOT NULL,
    object TEXT NOT NULL,
    valid_from TEXT,
    valid_until TEXT,
    recorded_at TEXT NOT NULL
);

-- Fast Temporal & State Indexes
CREATE INDEX IF NOT EXISTS idx_memories_validity ON memories(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_memories_event ON memories(event_time);
CREATE INDEX IF NOT EXISTS idx_memories_recorded ON memories(recorded_at);
CREATE INDEX IF NOT EXISTS idx_memories_state ON memories(lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_supersession ON memories(supersedes_id, superseded_by_id);

-- FTS5 Full-Text Search Virtual Table
CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
    id UNINDEXED,
    content,
    entities,
    tokenize = 'porter unicode61'
);

-- FTS Synchronization Triggers
CREATE TRIGGER IF NOT EXISTS trg_memories_insert AFTER INSERT ON memories BEGIN
    INSERT INTO memories_fts(id, content, entities)
    VALUES (new.id, new.content, coalesce(new.entities, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_memories_delete AFTER DELETE ON memories BEGIN
    DELETE FROM memories_fts WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_memories_update AFTER UPDATE ON memories BEGIN
    DELETE FROM memories_fts WHERE id = old.id;
    INSERT INTO memories_fts(id, content, entities)
    VALUES (new.id, new.content, coalesce(new.entities, ''));
END;
