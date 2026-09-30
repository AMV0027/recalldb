"""
Robustness and regression test suite for RecallDB remediations:
- Monotonic BM25 rank scoring
- Strict temporal timestamp validation (rejection of malformed dates)
- Batch get_many retrieval
- Multi-threaded concurrent write stress test (retry_on_lock)
- Strict input bounds validation
"""

import unittest
import tempfile
import os
import threading
from recalldb import RecallDB, MemoryRecord, MemoryType
from recalldb.retrieval.temporal import TemporalEvaluator, parse_iso
from recalldb.storage.db import Database


class TestRobustness(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp.close()
        self.db = RecallDB(self.tmp.name)

    def tearDown(self):
        if os.path.exists(self.tmp.name):
            try:
                os.remove(self.tmp.name)
            except Exception:
                pass

    def test_malformed_timestamp_raises_value_error(self):
        """Verify that invalid as_of string raises ValueError instead of silently bypassing."""
        self.db.remember("Test record", event_time="2024-01-01")
        
        with self.assertRaises(ValueError):
            self.db.recall("Test query", as_of="invalid-date-string")

        with self.assertRaises(ValueError):
            self.db.recall("Test query", as_of="2024/13/45")

    def test_input_validation(self):
        """Verify that empty content or out-of-bound weights are rejected."""
        # Empty content
        with self.assertRaises(ValueError):
            self.db.remember("")

        with self.assertRaises(ValueError):
            self.db.remember("   ")

        # Invalid confidence
        with self.assertRaises(ValueError):
            self.db.remember("Valid content", confidence=1.5)

        with self.assertRaises(ValueError):
            self.db.remember("Valid content", confidence=-0.1)

        # Invalid importance
        with self.assertRaises(ValueError):
            self.db.remember("Valid content", importance=2.0)

    def test_bm25_monotonicity(self):
        """Verify that stronger lexical match gets higher BM25 score than weaker match."""
        # Record 1: Strong match (contains both Kubernetes and cluster multiple times)
        r1 = self.db.remember("Kubernetes cluster deployment infrastructure and Kubernetes cluster management", source="doc1")
        # Record 2: Partial match (contains only Kubernetes)
        r2 = self.db.remember("Kubernetes container runtime engine", source="doc2")

        lex_results = self.db.lexical.search("Kubernetes cluster")
        self.assertTrue(len(lex_results) >= 2)
        
        # Verify rank ordering: r1 must be rank 1 and score higher than r2
        scores = {mid: s for mid, s in lex_results}
        self.assertIn(r1.id, scores)
        self.assertIn(r2.id, scores)
        self.assertGreater(scores[r1.id], scores[r2.id], "Stronger match r1 must score strictly higher than partial match r2")
        self.assertGreaterEqual(scores[r1.id], 0.7)

    def test_batch_get_many(self):
        """Verify batch retrieval retrieves records correctly."""
        ids = []
        for i in range(10):
            r = self.db.remember(f"Batch item #{i}", event_time="2024-01-01")
            ids.append(r.id)

        fetched_map = self.db.db.get_many(ids)
        self.assertEqual(len(fetched_map), 10)
        for mid in ids:
            self.assertIn(mid, fetched_map)
            self.assertTrue(fetched_map[mid].content.startswith("Batch item #"))

    def test_concurrent_write_stress(self):
        """Stress test with 10 concurrent threads inserting simultaneously."""
        errors = []

        def worker(worker_id: int):
            try:
                for j in range(5):
                    self.db.remember(
                        f"Concurrent fact from worker {worker_id} iteration {j}",
                        source=f"worker:{worker_id}"
                    )
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # Zero unhandled lock crashes
        self.assertEqual(len(errors), 0, f"Encountered concurrency errors: {errors}")
        total = self.db.count()
        self.assertEqual(total, 50)


if __name__ == "__main__":
    unittest.main()
