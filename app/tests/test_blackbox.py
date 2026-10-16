"""
Black-Box Test Suite for RecallDB:
Focuses on public API contract specifications, boundary value analysis,
equivalence partitioning, multilingual/Unicode robustness, SQL injection immunity,
multi-tenant security isolation, and end-to-end time-travel auditing.
"""

import unittest
import tempfile
import shutil
from pathlib import Path
import sys

app_dir = Path(__file__).resolve().parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

import recalldb
from recalldb.core.memory import MemoryType


class TestBlackBox(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db_path = str(Path(self.test_dir) / "blackbox.db")
        self.db = recalldb.connect(db_path=self.db_path, embedding_provider="deterministic")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    # -------------------------------------------------------------------------
    # 1. Boundary Value Analysis & Equivalence Partitioning
    # -------------------------------------------------------------------------

    def test_content_length_boundaries(self):
        """Verify content size boundary conditions (1 char, 65536 chars, 65537 chars)."""
        # Minimum boundary: 1 character
        m_min = self.db.remember("X")
        self.assertEqual(m_min.content, "X")

        # Maximum boundary: exactly 65,536 characters
        max_str = "A" * 65536
        m_max = self.db.remember(max_str)
        self.assertEqual(len(m_max.content), 65536)

        # Exceeding boundary: 65,537 characters -> must raise ValueError
        over_max_str = "B" * 65537
        with self.assertRaises(ValueError):
            self.db.remember(over_max_str)

    def test_unicode_multilingual_and_emoji_robustness(self):
        """Verify flawless ingestion and retrieval of UTF-8, Tamil, Asian scripts, and emojis."""
        tamil_fact = "அருண்மொழி வர்மன் கோயம்புத்தூரில் வசிக்கிறார். அவர் BloomBig நிறுவனத்தின் நிறுவனர்."
        emoji_fact = "Agent operational velocity ⚡🚀 is 10x higher with local zero-server SQLite 🦾"
        japanese_fact = "人工知能エージェントの永続的メモリエンジン RecallDB"

        self.db.remember(tamil_fact, memory_type="fact", user_id="arun")
        self.db.remember(emoji_fact, memory_type="fact", user_id="arun")
        self.db.remember(japanese_fact, memory_type="fact", user_id="arun")

        # Retrieve Tamil
        tamil_res = self.db.recall("கோயம்புத்தூரில்", user_id="arun")
        self.assertGreaterEqual(len(tamil_res), 1)
        self.assertIn("கோயம்புத்தூரில்", tamil_res[0].record.content)

        # Retrieve Emoji string
        emoji_res = self.db.recall("operational velocity", user_id="arun")
        self.assertGreaterEqual(len(emoji_res), 1)
        self.assertIn("⚡🚀", emoji_res[0].record.content)

        # Retrieve Japanese
        jp_res = self.db.recall("RecallDB", user_id="arun")
        self.assertGreaterEqual(len(jp_res), 1)
        self.assertIn("人工知能", jp_res[0].record.content)

    def test_sql_injection_immunity(self):
        """Verify that malicious SQL payloads in content, entities, or thread_id cannot compromise database."""
        nasty_payload = "'); DROP TABLE memories; DROP TABLE entities; SELECT ('1"
        m = self.db.remember(
            content=nasty_payload,
            thread_id=nasty_payload,
            user_id="test_user"
        )
        self.assertEqual(m.content, nasty_payload)

        # Database tables must still be intact and queryable
        self.assertGreaterEqual(self.db.count(), 1)
        res = self.db.recall("DROP TABLE", user_id="test_user")
        self.assertGreaterEqual(len(res), 1)
        self.assertIn("DROP TABLE memories", res[0].record.content)

    def test_top_k_boundaries(self):
        """Verify behavior under extreme top_k boundaries (k=0, k=1, k=500)."""
        for i in range(5):
            self.db.remember(f"System architecture benchmark result item {i}")

        # k=0 boundary
        res_0 = self.db.recall("benchmark", k=0)
        self.assertEqual(len(res_0), 0)

        # k=1 boundary
        res_1 = self.db.recall("benchmark", k=1)
        self.assertEqual(len(res_1), 1)

        # k=500 (exceeding stored count, should return all matching without error)
        res_many = self.db.recall("benchmark", k=500)
        self.assertEqual(len(res_many), 5)

    def test_parameter_range_validation(self):
        """Verify strict validation on confidence and importance bounds."""
        # Exact valid bounds
        m_zero = self.db.remember("Valid min bounds", confidence=0.0, importance=0.0)
        self.assertEqual(m_zero.confidence, 0.0)
        self.assertEqual(m_zero.importance, 0.0)

        m_one = self.db.remember("Valid max bounds", confidence=1.0, importance=1.0)
        self.assertEqual(m_one.confidence, 1.0)
        self.assertEqual(m_one.importance, 1.0)

        # Invalid bounds
        with self.assertRaises(ValueError):
            self.db.remember("Out of bounds", confidence=-0.001)
        with self.assertRaises(ValueError):
            self.db.remember("Out of bounds", confidence=1.001)
        with self.assertRaises(ValueError):
            self.db.remember("Out of bounds", importance=-0.001)
        with self.assertRaises(ValueError):
            self.db.remember("Out of bounds", importance=1.001)

    # -------------------------------------------------------------------------
    # 2. Multi-Tenant Security Isolation
    # -------------------------------------------------------------------------

    def test_strict_multi_tenant_isolation(self):
        """Verify that Tenant A can never observe or retrieve Tenant B's data under any query."""
        # Tenant Alpha private data
        self.db.remember(
            content="Alpha Corporation secret Stripe API key: sk_live_alpha_99999",
            tenant_id="tenant_alpha",
            user_id="user_admin"
        )

        # Tenant Beta private data
        self.db.remember(
            content="Beta Corporation secret Stripe API key: sk_live_beta_11111",
            tenant_id="tenant_beta",
            user_id="user_admin"
        )

        # Alpha queries for "Stripe API key"
        alpha_res = self.db.recall(
            query="Stripe API key",
            tenant_id="tenant_alpha"
        )
        self.assertEqual(len(alpha_res), 1)
        self.assertIn("sk_live_alpha_99999", alpha_res[0].record.content)
        self.assertNotIn("sk_live_beta_11111", alpha_res[0].record.content)

        # Beta queries for "Stripe API key"
        beta_res = self.db.recall(
            query="Stripe API key",
            tenant_id="tenant_beta"
        )
        self.assertEqual(len(beta_res), 1)
        self.assertIn("sk_live_beta_11111", beta_res[0].record.content)
        self.assertNotIn("sk_live_alpha_99999", beta_res[0].record.content)

    # -------------------------------------------------------------------------
    # 3. End-to-End Multi-Epoch Point-in-Time Time Travel Audit
    # -------------------------------------------------------------------------

    def test_multi_epoch_point_in_time_auditing(self):
        """Verify complete time travel accuracy across 3 distinct historical milestones."""
        # 2024: Initial state
        m1 = self.db.remember(
            content="Our primary office is located in Chennai, Tamil Nadu",
            valid_from="2024-01-01T00:00:00Z",
            event_time="2024-01-01T00:00:00Z"
        )

        # 2025: Relocation
        m2 = self.db.supersede(
            existing_id=m1.id,
            new_content="Our primary office relocated to Coimbatore, Tamil Nadu",
            effective_time="2025-01-01T00:00:00Z"
        )

        # 2026: Expansion
        m3 = self.db.supersede(
            existing_id=m2.id,
            new_content="Our primary office expanded to Singapore and Coimbatore, Tamil Nadu",
            effective_time="2026-01-01T00:00:00Z"
        )

        # Audit Epoch 1: 2024
        q2024 = self.db.recall("Where is our office?", as_of="2024-07-01T00:00:00Z", k=1)
        self.assertEqual(len(q2024), 1)
        self.assertIn("Chennai", q2024[0].record.content)

        # Audit Epoch 2: 2025
        q2025 = self.db.recall("Where is our office?", as_of="2025-07-01T00:00:00Z", k=1)
        self.assertEqual(len(q2025), 1)
        self.assertIn("Coimbatore", q2025[0].record.content)
        self.assertNotIn("Singapore", q2025[0].record.content)

        # Audit Epoch 3: 2026
        q2026 = self.db.recall("Where is our office?", as_of="2026-07-01T00:00:00Z", k=1)
        self.assertEqual(len(q2026), 1)
        self.assertIn("Singapore", q2026[0].record.content)

        # Current live query (as_of=None) must reflect Epoch 3
        q_now = self.db.recall("Where is our office?", k=1)
        self.assertEqual(len(q_now), 1)
        self.assertIn("Singapore", q_now[0].record.content)

    # -------------------------------------------------------------------------
    # 4. Right to be Forgotten (GDPR Hard Deletion Contract)
    # -------------------------------------------------------------------------

    def test_right_to_be_forgotten_hard_deletion(self):
        """Verify hard deletion removes records from hybrid search, FTS5 lexical index, and user fact inspector."""
        fact = self.db.remember(
            content="User SSN identifier is 123-45-6789",
            memory_type="fact",
            user_id="user_gdpr"
        )
        self.assertEqual(self.db.count(), 1)

        # Confirm findable before deletion
        res_before = self.db.recall("123-45-6789", user_id="user_gdpr")
        self.assertEqual(len(res_before), 1)

        # Execute GDPR deletion
        success = self.db.delete(fact.id)
        self.assertTrue(success)
        self.assertEqual(self.db.count(), 0)

        # Must not be retrievable via hybrid search
        res_after = self.db.recall("123-45-6789", user_id="user_gdpr")
        self.assertEqual(len(res_after), 0)

        # Must not be present in user facts
        facts_after = self.db.get_facts(user_id="user_gdpr", active_only=False)
        self.assertEqual(len(facts_after), 0)

        # Must not be present in FTS5 index
        lex_after = self.db.lexical.search("123-45-6789")
        self.assertEqual(len(lex_after), 0)


if __name__ == "__main__":
    unittest.main()
