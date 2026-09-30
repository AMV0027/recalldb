"""
Unit tests for hybrid candidate fusion, lexical match, and explain traces.
"""

import unittest
import tempfile
import os
from recalldb import RecallDB, MemoryType


class TestRetrieval(unittest.TestCase):

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

    def test_hybrid_search_and_explanation(self):
        self.db.remember(
            "Primary database configuration is PostgreSQL running on AWS RDS",
            memory_type=MemoryType.FACT,
            event_time="2025-01-10",
            source="infra:setup"
        )
        self.db.remember(
            "Analytics pipeline streams events into ClickHouse",
            memory_type=MemoryType.FACT,
            event_time="2025-01-12",
            source="infra:setup"
        )

        results = self.db.recall("Which database is used on AWS RDS?", k=3, explain=True)
        self.assertTrue(len(results) > 0)
        top = results[0]
        self.assertIn("PostgreSQL", top.record.content)
        self.assertIsNotNone(top.explanation)
        self.assertTrue(top.explanation.vector_score >= 0.0)
        self.assertTrue(top.explanation.bm25_score >= 0.0)

    def test_lineage_and_explain(self):
        m1 = self.db.remember(
            "Company headquarters is located in Chennai",
            event_time="2022-01-01"
        )
        m2 = self.db.update(
            memory_id=m1.id,
            content="Company headquarters relocated to Bangalore",
            event_time="2024-01-01",
            supersedes=True
        )

        explanation = self.db.explain(m2.id)
        self.assertIn("Bangalore", explanation)
        self.assertIn("Chennai", explanation)
        self.assertIn("Lineage Evolution Chain", explanation)


if __name__ == "__main__":
    unittest.main()
