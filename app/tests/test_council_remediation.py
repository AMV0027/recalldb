"""
Automated validation of Brutal Review Council remediations for RecallDB.
Verifies multi-tenancy isolation, vector cache invalidation, batch ingestion,
and defense against recall truncation under heavy state churn.
"""

import unittest
import tempfile
import shutil
from pathlib import Path
from recalldb import RecallDB, MemoryType, MemoryLifecycleState
from recalldb.embeddings.mock import DeterministicHashEmbedding


class TestCouncilRemediation(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db_path = str(Path(self.test_dir) / "test_remediation.db")
        self.embedding = DeterministicHashEmbedding(dimension=64)
        self.recalldb = RecallDB(self.db_path, embedding_provider=self.embedding)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_multi_tenancy_isolation(self):
        """Verify that user_id and tenant_id strictly isolate memory retrieval."""
        # Alice stores her secret
        rec_alice = self.recalldb.remember(
            content="The production deployment secret token is ALICE_SECRET_KEY_999",
            user_id="alice",
            tenant_id="tenant_a"
        )

        # Bob stores his secret with identical semantic framing
        rec_bob = self.recalldb.remember(
            content="The production deployment secret token is BOB_SECRET_KEY_888",
            user_id="bob",
            tenant_id="tenant_b"
        )

        # Alice searches within her scope
        results_alice = self.recalldb.search(
            query="deployment secret token",
            user_id="alice",
            tenant_id="tenant_a"
        )
        self.assertTrue(len(results_alice) > 0)
        self.assertEqual(results_alice[0].record.id, rec_alice.id)
        # Ensure Bob's record is completely absent from Alice's result set
        alice_ids = {r.record.id for r in results_alice}
        self.assertNotIn(rec_bob.id, alice_ids)

        # Bob searches within his scope
        results_bob = self.recalldb.search(
            query="deployment secret token",
            user_id="bob",
            tenant_id="tenant_b"
        )
        self.assertTrue(len(results_bob) > 0)
        self.assertEqual(results_bob[0].record.id, rec_bob.id)
        bob_ids = {r.record.id for r in results_bob}
        self.assertNotIn(rec_alice.id, bob_ids)

    def test_cache_invalidation_on_supersession(self):
        """Verify that vector cache updates immediately when a record is superseded."""
        # Step 1: Initial active state
        m1 = self.recalldb.remember(
            content="The primary backend framework is Flask Python",
            valid_from="2023-01-01T00:00:00Z"
        )

        # Prime vector cache
        res1 = self.recalldb.search("backend framework")
        self.assertEqual(len(res1), 1)
        self.assertEqual(res1[0].record.id, m1.id)

        # Step 2: Supersede M1 with M2
        m2 = self.recalldb.supersede(
            existing_id=m1.id,
            new_content="The primary backend framework is Axum Rust",
            effective_time="2024-01-01T00:00:00Z"
        )

        # Step 3: Search live active reality (as_of=None)
        res_live = self.recalldb.search("backend framework")
        self.assertEqual(len(res_live), 1)
        self.assertEqual(res_live[0].record.id, m2.id)
        self.assertEqual(res_live[0].record.lifecycle_state, MemoryLifecycleState.ACTIVE)

        # Step 4: Search historical reality (as_of="2023-06-01")
        res_hist = self.recalldb.search("backend framework", as_of="2023-06-01")
        self.assertEqual(len(res_hist), 1)
        self.assertEqual(res_hist[0].record.id, m1.id)

    def test_recall_truncation_defense(self):
        """
        Verify that 35 superseded historical records do not displace
        the single active record (resolves Recall Truncation under Post-Filtering).
        """
        # Ingest 35 historical superseded versions of database config
        for i in range(1, 36):
            self.recalldb.remember(
                content=f"Database configuration revision {i} uses LegacyDB version {i}",
                valid_from=f"2020-01-{i:02d}T00:00:00Z" if i <= 28 else f"2020-02-{i-28:02d}T00:00:00Z",
                valid_until=f"2020-01-{i+1:02d}T00:00:00Z" if i < 28 else "2020-02-28T00:00:00Z",
                metadata={"revision": i}
            )

        # Mark all 35 as superseded in DB
        with self.recalldb.db.get_connection() as conn:
            conn.execute("UPDATE memories SET lifecycle_state = 'superseded'")
            conn.commit()

        # Ingest the 1 currently active version
        active_rec = self.recalldb.remember(
            content="Database configuration revision 36 uses HighSpeed Spanner Cluster",
            valid_from="2024-01-01T00:00:00Z",
            valid_until=None,
            metadata={"revision": 36}
        )

        # In total, there are 36 memories.
        # Querying with top_k=5 should return the active version at rank 1
        results = self.recalldb.search("Database configuration revision", top_k=5)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0].record.id, active_rec.id)
        self.assertEqual(results[0].record.lifecycle_state, MemoryLifecycleState.ACTIVE)

    def test_batch_ingestion_api(self):
        """Verify high-throughput atomic batch ingestion via remember_batch."""
        items = [
            {
                "content": f"Batch entity fact #{i}: System parameter {i} is set to {i * 10}",
                "event_time": f"2024-01-{i % 28 + 1:02d}T10:00:00Z",
                "importance": 0.7,
                "user_id": "batch_user",
                "thread_id": "thread_batch",
            }
            for i in range(25)
        ]

        records = self.recalldb.remember_batch(items)
        self.assertEqual(len(records), 25)

        # Check total count in database
        self.assertEqual(self.recalldb.count(), 25)

        # Verify retrievability with scope
        results = self.recalldb.search(
            "System parameter 5",
            user_id="batch_user",
            thread_id="thread_batch"
        )
        self.assertTrue(len(results) > 0)
        self.assertIn("System parameter 5", results[0].record.content)

    def test_incremental_vector_append(self):
        """Verify that adding records increments the cached matrix without full table scan."""
        # Initial batch
        self.recalldb.remember("Initial memory statement one")
        self.recalldb.remember("Initial memory statement two")

        # Prime cache
        self.recalldb.search("Initial")
        initial_cache_len = len(self.recalldb.semantic._cached_ids)
        self.assertEqual(initial_cache_len, 2)
        initial_version = self.recalldb.semantic._last_data_version

        # Append new memory
        self.recalldb.remember("Third appended memory statement")

        # Search triggers incremental append
        self.recalldb.search("Third")
        new_cache_len = len(self.recalldb.semantic._cached_ids)
        self.assertEqual(new_cache_len, 3)
        self.assertGreater(self.recalldb.semantic._last_data_version, initial_version)


if __name__ == "__main__":
    unittest.main()
