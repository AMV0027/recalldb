"""
Unit tests for bitemporal point-in-time slicing, interval bounding, and recency scoring.
"""

import unittest
import tempfile
import os
from recalldb import RecallDB, MemoryType


class TestTemporal(unittest.TestCase):

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

    def test_point_in_time_historical_query(self):
        # 2024: User writes Python
        m1 = self.db.remember(
            "User uses Python for backend microservices",
            event_time="2024-03-01",
            valid_from="2024-03-01",
            source="session:2024"
        )

        # 2026: User moves to Rust (supersedes 2024 state)
        m2 = self.db.update(
            memory_id=m1.id,
            content="User uses Rust for backend microservices",
            event_time="2026-01-01",
            supersedes=True,
            source="session:2026"
        )

        # Query 1: As of 2024-06-01 (should retrieve Python)
        past_res = self.db.recall("What backend language does the user use?", as_of="2024-06-01", k=5)
        self.assertTrue(len(past_res) > 0)
        self.assertIn("Python", past_res[0].record.content)

        # Query 2: As of 2026-06-01 (should retrieve Rust)
        curr_res = self.db.recall("What backend language does the user use?", as_of="2026-06-01", k=5)
        self.assertTrue(len(curr_res) > 0)
        self.assertIn("Rust", curr_res[0].record.content)

        # Query 3: Default current recall (should retrieve Rust)
        now_res = self.db.recall("What backend language does the user use?", k=5)
        self.assertTrue(len(now_res) > 0)
        self.assertIn("Rust", now_res[0].record.content)


if __name__ == "__main__":
    unittest.main()
