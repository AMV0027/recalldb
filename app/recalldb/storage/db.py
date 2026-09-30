"""
SQLite database engine for RecallDB.
Provides thread-safe connections, WAL mode tuning, retry logic for concurrency,
schema migrations, batch retrieval, and BLOB serialization for vector embeddings.
"""

from __future__ import annotations
import sqlite3
import json
import struct
import time
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any, Callable
from recalldb.core.memory import MemoryRecord, MemoryLifecycleState, utc_now_iso
from recalldb.core.lifecycle import MemoryLifecycleManager


def embedding_to_blob(embedding: Optional[List[float]]) -> Optional[bytes]:
    """Serialize list of floats to IEEE 754 32-bit binary BLOB."""
    if embedding is None:
        return None
    return struct.pack(f"{len(embedding)}f", *embedding)


def blob_to_embedding(blob: Optional[bytes]) -> Optional[List[float]]:
    """Deserialize IEEE 754 32-bit binary BLOB to list of floats."""
    if blob is None:
        return None
    count = len(blob) // 4
    return list(struct.unpack(f"{count}f", blob))


def retry_on_lock(max_retries: int = 5, initial_backoff: float = 0.05):
    """Decorator to retry SQLite transactions on database lock contention."""
    def decorator(func: Callable):
        def wrapper(*args, **kwargs):
            backoff = initial_backoff
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except sqlite3.OperationalError as e:
                    if "locked" in str(e).lower() and attempt < max_retries - 1:
                        time.sleep(backoff)
                        backoff *= 2
                    else:
                        raise
        return wrapper
    return decorator


class Database:
    """Embedded SQLite database wrapper managing storage and FTS5 indices."""

    def __init__(self, db_path: str = "memory.db"):
        self.db_path = str(Path(db_path).resolve())
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def get_connection(self) -> sqlite3.Connection:
        """Create and configure an optimized SQLite connection."""
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        
        # High-performance WAL mode & PRAGMA configuration
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA busy_timeout = 10000;")  # 10s busy timeout
        conn.execute("PRAGMA cache_size = -64000;")   # 64MB cache
        return conn

    def _init_db(self) -> None:
        """Apply schema.sql DDL to initialize database tables and indices."""
        schema_path = Path(__file__).parent / "schema.sql"
        with open(schema_path, "r", encoding="utf-8") as f:
            ddl = f.read()

        with self.get_connection() as conn:
            conn.executescript(ddl)
            conn.commit()

    @retry_on_lock()
    def insert(self, record: MemoryRecord) -> MemoryRecord:
        """Insert a single MemoryRecord into the database."""
        blob = embedding_to_blob(record.embedding)
        entities_json = json.dumps(record.entities) if record.entities else "[]"
        metadata_json = json.dumps(record.metadata) if record.metadata else "{}"

        sql = """
        INSERT INTO memories (
            id, content, memory_type, lifecycle_state,
            event_time, valid_from, valid_until, recorded_at,
            source, confidence, importance,
            supersedes_id, superseded_by_id,
            entities, metadata, embedding
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        with self.get_connection() as conn:
            conn.execute(sql, (
                record.id,
                record.content,
                record.memory_type.value if hasattr(record.memory_type, "value") else str(record.memory_type),
                record.lifecycle_state.value if hasattr(record.lifecycle_state, "value") else str(record.lifecycle_state),
                record.event_time,
                record.valid_from or record.event_time or record.recorded_at,
                record.valid_until,
                record.recorded_at,
                record.source,
                record.confidence,
                record.importance,
                record.supersedes_id,
                record.superseded_by_id,
                entities_json,
                metadata_json,
                blob
            ))
            conn.commit()
        return record

    def get(self, memory_id: str) -> Optional[MemoryRecord]:
        """Retrieve a MemoryRecord by its ID."""
        with self.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM memories WHERE id = ?", (memory_id,))
            row = cur.fetchone()
            if not row:
                return None
            record = MemoryRecord.from_row(dict(row))
            if row["embedding"]:
                record.embedding = blob_to_embedding(row["embedding"])
            return record

    def get_many(self, memory_ids: List[str]) -> Dict[str, MemoryRecord]:
        """
        Batch retrieve multiple MemoryRecords in a single parameterized query.
        Eliminates N+1 query loop bottlenecks.
        """
        if not memory_ids:
            return {}

        results = {}
        # Batch in chunks of 500 to stay well under SQLite variable limit
        chunk_size = 500
        with self.get_connection() as conn:
            for i in range(0, len(memory_ids), chunk_size):
                chunk = memory_ids[i:i + chunk_size]
                placeholders = ",".join("?" for _ in chunk)
                sql = f"SELECT * FROM memories WHERE id IN ({placeholders})"
                cur = conn.execute(sql, chunk)
                for row in cur.fetchall():
                    rec = MemoryRecord.from_row(dict(row))
                    if row["embedding"]:
                        rec.embedding = blob_to_embedding(row["embedding"])
                    results[rec.id] = rec
        return results

    def get_recent(self, limit: int = 20) -> List[MemoryRecord]:
        """Fetch most recently recorded memories up to limit."""
        records = []
        with self.get_connection() as conn:
            cur = conn.execute(
                "SELECT * FROM memories ORDER BY recorded_at DESC LIMIT ?",
                (limit,)
            )
            for row in cur.fetchall():
                r = MemoryRecord.from_row(dict(row))
                if row["embedding"]:
                    r.embedding = blob_to_embedding(row["embedding"])
                records.append(r)
        return records

    @retry_on_lock()
    def update(self, record: MemoryRecord) -> None:
        """Update an existing MemoryRecord in-place."""
        blob = embedding_to_blob(record.embedding)
        entities_json = json.dumps(record.entities) if record.entities else "[]"
        metadata_json = json.dumps(record.metadata) if record.metadata else "{}"

        sql = """
        UPDATE memories SET
            content = ?,
            memory_type = ?,
            lifecycle_state = ?,
            event_time = ?,
            valid_from = ?,
            valid_until = ?,
            source = ?,
            confidence = ?,
            importance = ?,
            supersedes_id = ?,
            superseded_by_id = ?,
            entities = ?,
            metadata = ?,
            embedding = ?
        WHERE id = ?
        """

        with self.get_connection() as conn:
            conn.execute(sql, (
                record.content,
                record.memory_type.value if hasattr(record.memory_type, "value") else str(record.memory_type),
                record.lifecycle_state.value if hasattr(record.lifecycle_state, "value") else str(record.lifecycle_state),
                record.event_time,
                record.valid_from,
                record.valid_until,
                record.source,
                record.confidence,
                record.importance,
                record.supersedes_id,
                record.superseded_by_id,
                entities_json,
                metadata_json,
                blob,
                record.id
            ))
            conn.commit()

    @retry_on_lock()
    def supersede(
        self,
        existing_id: str,
        new_record: MemoryRecord,
        effective_time: Optional[str] = None
    ) -> Tuple[MemoryRecord, MemoryRecord]:
        """
        Atomically transition an existing memory to SUPERSEDED and link it
        bidirectionally to a new active MemoryRecord.
        """
        existing = self.get(existing_id)
        if not existing:
            raise ValueError(f"Memory with id '{existing_id}' not found.")

        updated_existing, updated_new = MemoryLifecycleManager.execute_supersession(
            existing=existing,
            new_record=new_record,
            effective_time=effective_time
        )

        with self.get_connection() as conn:
            # Update existing
            conn.execute("""
            UPDATE memories SET
                valid_until = ?,
                superseded_by_id = ?,
                lifecycle_state = ?
            WHERE id = ?
            """, (
                updated_existing.valid_until,
                updated_existing.superseded_by_id,
                updated_existing.lifecycle_state.value,
                updated_existing.id
            ))

            # Insert new record
            blob = embedding_to_blob(updated_new.embedding)
            conn.execute("""
            INSERT INTO memories (
                id, content, memory_type, lifecycle_state,
                event_time, valid_from, valid_until, recorded_at,
                source, confidence, importance,
                supersedes_id, superseded_by_id,
                entities, metadata, embedding
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                updated_new.id,
                updated_new.content,
                updated_new.memory_type.value,
                updated_new.lifecycle_state.value,
                updated_new.event_time,
                updated_new.valid_from,
                updated_new.valid_until,
                updated_new.recorded_at,
                updated_new.source,
                updated_new.confidence,
                updated_new.importance,
                updated_new.supersedes_id,
                updated_new.superseded_by_id,
                json.dumps(updated_new.entities),
                json.dumps(updated_new.metadata),
                blob
            ))
            conn.commit()

        return updated_existing, updated_new

    @retry_on_lock()
    def delete(self, memory_id: str) -> bool:
        """Hard delete a memory record and its FTS entry."""
        with self.get_connection() as conn:
            cur = conn.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
            conn.commit()
            return cur.rowcount > 0

    def count(self) -> int:
        """Return total memory count."""
        with self.get_connection() as conn:
            cur = conn.execute("SELECT count(*) FROM memories")
            return cur.fetchone()[0]

    def all_memories(self) -> List[MemoryRecord]:
        """Fetch all memories with hydrated embeddings."""
        records = []
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM memories ORDER BY recorded_at ASC")
            for row in cur.fetchall():
                r = MemoryRecord.from_row(dict(row))
                if row["embedding"]:
                    r.embedding = blob_to_embedding(row["embedding"])
                records.append(r)
        return records
