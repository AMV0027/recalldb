"""
Unit and Integration Tests for RecallDBAgent with Ollama minicpm-v4.6:latest.
"""

import unittest
import sys
import os
import shutil
import tempfile
import urllib.request
import json

sys.path.insert(0, os.path.dirname(__file__))
from sample_ollama_agent import RecallDBAgent


class TestOllamaAgent(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Check if Ollama is accessible
        try:
            req = urllib.request.Request("http://localhost:11434/api/tags")
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m.get("name") for m in data.get("models", [])]
                cls.ollama_available = "minicpm-v4.6:latest" in models
        except Exception:
            cls.ollama_available = False

    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="recalldb_agent_test_")
        self.db_path = os.path.join(self.test_dir, "test.db")
        self.agent = RecallDBAgent(
            db_path=self.db_path,
            model="minicpm-v4.6:latest",
            tenant_id="tenant_alpha",
            user_id="user_arunmozhi"
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_agent_memory_retrieval_and_supersession(self):
        """Verifies RecallDB point-in-time retrieval mechanics inside agent."""
        m1 = self.agent.remember(
            fact="Primary cache engine is Memcached running on port 11211",
            valid_from="2024-01-01T00:00:00Z"
        )
        self.assertEqual(m1.state.lower(), "active")

        # Current retrieval before supersession
        res_curr = self.agent.db.recall("What is the primary cache engine?", user_id="user_arunmozhi")
        self.assertEqual(len(res_curr), 1)
        self.assertIn("Memcached", res_curr[0].content)

        # Supersede with Redis
        m2 = self.agent.supersede(
            old_memory_id=m1.id,
            new_fact="Migrated primary cache engine to Redis Cluster on port 6379",
            transition_time="2026-01-01T00:00:00Z"
        )
        self.assertEqual(m2.state.lower(), "active")

        # Current state query
        res_after = self.agent.db.recall("What is the primary cache engine?", user_id="user_arunmozhi")
        self.assertEqual(len(res_after), 1)
        self.assertIn("Redis", res_after[0].content)
        self.assertEqual(res_after[0].id, m2.id)

        # Historical state query as_of 2025-01-01
        res_hist = self.agent.db.recall(
            "What is the primary cache engine?",
            as_of="2025-01-01T00:00:00Z",
            user_id="user_arunmozhi"
        )
        self.assertEqual(len(res_hist), 1)
        self.assertIn("Memcached", res_hist[0].content)
        self.assertEqual(res_hist[0].id, m1.id)

    def test_live_ollama_inference(self):
        """Verifies end-to-end conversation grounding with live Ollama minicpm-v4.6:latest."""
        if not self.ollama_available:
            self.skipTest("Ollama server or minicpm-v4.6:latest model not available")

        # Store infrastructure memory
        m1 = self.agent.remember(
            fact="Backend payment processor is Stripe API with webhook secret whsec_live9988",
            valid_from="2025-01-01T00:00:00Z"
        )

        # Live chat query
        turn_result = self.agent.chat("What payment processor and webhook secret do we use?")
        response = turn_result["response"].lower()

        # Verify response contains the retrieved memory facts
        self.assertIn("stripe", response)
        self.assertIn("whsec_live9988", turn_result["response"])
        self.assertEqual(turn_result["retrieved_count"], 1)


if __name__ == "__main__":
    unittest.main()
