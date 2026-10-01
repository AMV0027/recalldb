"""
Unit tests for RecallDB AI Provider Hub and 1-Line AI connectivity methods.
"""

import unittest
import os
import shutil
import tempfile
import urllib.request
import json
import recalldb
from recalldb.ai import (
    get_provider,
    get_openai_tools,
    execute_tool_call,
    format_memories_as_markdown,
    build_augmented_system_prompt,
    inject_context_into_messages,
    BaseAIProvider,
    AIResponse
)


class MockProvider(BaseAIProvider):
    """Mock AI Provider for deterministic unit testing without external APIs."""
    def __init__(self, response_text: str = "Mock answer"):
        self.response_text = response_text
        self.last_messages = None

    def chat(self, messages, model=None, temperature=0.2, **kwargs):
        self.last_messages = messages
        return AIResponse(
            content=self.response_text,
            model=model or "mock-model",
            provider="mock"
        )


class TestAIProviders(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="recalldb_ai_test_")
        self.db_path = os.path.join(self.test_dir, "ai_test.db")
        self.db = recalldb.connect(db_path=self.db_path)

        # Ingest test facts
        self.db.remember(
            "Primary production database is PostgreSQL 16 running on AWS RDS port 5432",
            valid_from="2025-01-01T00:00:00Z"
        )
        self.db.remember(
            "Authentication token lifetime is 3600 seconds with RS256 signing",
            valid_from="2025-01-01T00:00:00Z"
        )

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_connect_factory(self):
        """Verify 1-line recalldb.connect() factory."""
        self.assertIsInstance(self.db, recalldb.RecallDB)
        self.assertEqual(self.db.count(), 2)

    def test_context_for(self):
        """Verify db.context_for() generates clean Markdown memory blocks."""
        ctx = self.db.context_for("What database do we use?")
        self.assertIn("RECALLDB VERIFIED MEMORY CONTEXT", ctx)
        self.assertIn("PostgreSQL 16", ctx)
        self.assertIn("port 5432", ctx)

    def test_augment_system_prompt(self):
        """Verify db.augment() combines base instructions with verified memories."""
        base_prompt = "You are a DevOps assistant."
        augmented = self.db.augment("What port does the database run on?", system_prompt=base_prompt)
        self.assertTrue(augmented.startswith("You are a DevOps assistant."))
        self.assertIn("PostgreSQL 16", augmented)
        self.assertIn("port 5432", augmented)

    def test_augment_messages(self):
        """Verify db.augment_messages() injects memories into message arrays."""
        messages = [
            {"role": "user", "content": "What is our token lifetime?"}
        ]
        augmented = self.db.augment_messages(messages)
        self.assertEqual(len(augmented), 2)
        self.assertEqual(augmented[0]["role"], "system")
        self.assertIn("3600 seconds", augmented[0]["content"])
        self.assertEqual(augmented[1]["role"], "user")

    def test_as_tool_and_execute_tool(self):
        """Verify db.as_tool() returns valid OpenAI/Anthropic/Ollama function calling schemas."""
        tools = self.db.as_tool()
        self.assertEqual(len(tools), 3)
        tool_names = [t["function"]["name"] for t in tools]
        self.assertIn("recall_memory", tool_names)
        self.assertIn("remember_fact", tool_names)
        self.assertIn("supersede_fact", tool_names)

        # Test tool execution: recall_memory
        recall_res = self.db.execute_tool("recall_memory", {"query": "authentication"})
        self.assertGreaterEqual(recall_res["count"], 1)
        self.assertIn("RS256", recall_res["memories"][0]["content"])

        # Test tool execution: remember_fact
        remember_res = self.db.execute_tool("remember_fact", {"content": "Frontend is Next.js 15"})
        self.assertEqual(remember_res["status"], "success")
        self.assertEqual(self.db.count(), 3)

    def test_one_line_chat_with_mock_provider(self):
        """Verify 1-line db.chat() using mock provider."""
        mock = MockProvider(response_text="Database runs on port 5432.")
        res = self.db.chat("What port does the database run on?", provider=mock)
        self.assertEqual(res.content, "Database runs on port 5432.")
        self.assertIn("PostgreSQL 16", mock.last_messages[0]["content"])

    def test_one_line_chat_with_live_ollama(self):
        """Verify 1-line db.chat() with live Ollama minicpm-v4.6:latest if accessible."""
        try:
            req = urllib.request.Request("http://localhost:11434/api/tags")
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m.get("name") for m in data.get("models", [])]
                if "minicpm-v4.6:latest" not in models:
                    self.skipTest("minicpm-v4.6:latest not found in local Ollama")
        except Exception:
            self.skipTest("Ollama server not reachable")

        # Execute 1-liner chat
        res = self.db.chat(
            "What port does the database run on?",
            provider="ollama",
            model="minicpm-v4.6:latest"
        )
        self.assertIsInstance(res.content, str)
        self.assertIn("5432", res.content)


if __name__ == "__main__":
    unittest.main()
