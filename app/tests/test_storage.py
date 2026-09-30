"""
Unit tests for RecallDB SQLite storage, schema initialization, and FTS5 triggers.
"""

import unittest
import tempfile
import os
from recalldb.core.memory import MemoryRecord, MemoryType, MemoryLifecycleState
from recalldb.storage.db import Database


class TestStorage(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp.close()
        self.db = Database(self.tmp.name)

    def tearDown(self):
        if os.path.exists(self.tmp.name):
            try:
                os.remove(self.tmp.name)
            except Exception:
                pass

    def test_insert_and_get(self):
        record = MemoryRecord(
            content="User prefers PostgreSQL for database storage",
            memory_type=MemoryType.PREFERENCE,
            event_time="2024-01-01",
            source="conversation:1"
        )
        self.db.insert(record)
        fetched = self.db.get(record.id)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.content, record.content)
        self.assertEqual(fetched.memory_type, MemoryType.PREFERENCE)
        self.assertEqual(fetched.lifecycle_state, MemoryLifecycleState.ACTIVE)

    def test_atomic_supersession(self):
        rec1 = MemoryRecord(
            content="User uses Python 3.10",
            valid_from="2024-01-01",
            event_time="2024-01-01"
        )
        self.db.insert(rec1)

        rec2 = MemoryRecord(
            content="User upgraded to Python 3.12",
            valid_from="2025-01-01",
            event_time="2025-01-01"
        )
        old_upd, new_upd = self.db.supersede(rec1.id, rec2, effective_time="2025-01-01")

        # Verify old record state
        refreshed_old = self.db.get(rec1.id)
        self.assertEqual(refreshed_old.lifecycle_state, MemoryLifecycleState.SUPERSEDED)
        self.assertEqual(refreshed_old.valid_until, "2025-01-01")
        self.assertEqual(refreshed_old.superseded_by_id, rec2.id)

        # Verify new record state
        refreshed_new = self.db.get(rec2.id)
        self.assertEqual(refreshed_new.lifecycle_state, MemoryLifecycleState.ACTIVE)
        self.assertEqual(refreshed_new.valid_from, "2025-01-01")
        self.assertEqual(refreshed_new.supersedes_id, rec1.id)

    def test_fts5_fulltext_sync(self):
        rec = MemoryRecord(
            content="Configuring Redis cache clustering on port 6379",
            memory_type=MemoryType.FACT
        )
        self.db.insert(rec)

        with self.db.get_connection() as conn:
            cur = conn.execute("SELECT id FROM memories_fts WHERE memories_fts MATCH 'Redis'")
            row = cur.fetchone()
            self.assertIsNotNone(row)
            self.assertEqual(row["id"], rec.id)


if __name__ == "__main__":
    unittest.main()
