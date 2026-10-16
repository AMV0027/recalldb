"""
Unit tests for simplified RecallDB developer application APIs:
- Multi-chat thread management (add_message, get_messages, get_threads)
- Fast execution bypass (embed=False for agent trajectories)
- Unified RAG & Chat retrieval (document + conversation + fact)
- Memory Inspector & User Analytics (get_facts)
"""

import unittest
import shutil
import tempfile
import time
from pathlib import Path
import sys

app_dir = Path(__file__).resolve().parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

import recalldb
from recalldb.core.memory import MemoryType, MemoryLifecycleState


class TestDeveloperAPIs(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db_path = str(Path(self.test_dir) / "test_dev.db")
        self.db = recalldb.connect(db_path=self.db_path, embedding_provider="deterministic")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_multi_chat_add_and_get_messages(self):
        """Verify chat message persistence and chronological retrieval."""
        # Thread 1 messages
        m1 = self.db.add_message(
            thread_id="chat-alpha",
            role="user",
            content="Hello! Can we use Tailwind CSS?",
            user_id="usr_arun"
        )
        self.assertEqual(m1.memory_type, MemoryType.CONVERSATION)
        self.assertIsNone(m1.embedding)  # embed=False by default

        m2 = self.db.add_message(
            thread_id="chat-alpha",
            role="assistant",
            content="Yes, Tailwind CSS v4 is configured.",
            user_id="usr_arun"
        )

        # Thread 2 message (isolated)
        self.db.add_message(
            thread_id="chat-beta",
            role="user",
            content="What database engine are we using?",
            user_id="usr_arun"
        )

        # Retrieve thread-alpha messages
        messages = self.db.get_messages(thread_id="chat-alpha")
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["role"], "user")
        self.assertEqual(messages[0]["content"], "Hello! Can we use Tailwind CSS?")
        self.assertEqual(messages[1]["role"], "assistant")
        self.assertEqual(messages[1]["content"], "Yes, Tailwind CSS v4 is configured.")

        # Verify thread-beta isolation
        beta_messages = self.db.get_messages(thread_id="chat-beta")
        self.assertEqual(len(beta_messages), 1)
        self.assertEqual(beta_messages[0]["content"], "What database engine are we using?")

    def test_get_threads_sidebar(self):
        """Verify aggregated chat threads for sidebar listings."""
        self.db.add_message("thread-1", "user", "First discussion on pricing", user_id="user_1")
        self.db.add_message("thread-1", "assistant", "Pricing tiers should be $29 and $99", user_id="user_1")

        self.db.add_message("thread-2", "user", "Architecture review for SQLite WAL", user_id="user_1")

        # Add message for a different user
        self.db.add_message("thread-other", "user", "Private conversation", user_id="user_2")

        threads = self.db.get_threads(user_id="user_1")
        self.assertEqual(len(threads), 2)

        thread_ids = [t["thread_id"] for t in threads]
        self.assertIn("thread-1", thread_ids)
        self.assertIn("thread-2", thread_ids)

        t1 = next(t for t in threads if t["thread_id"] == "thread-1")
        self.assertEqual(t1["title"], "First discussion on pricing")
        self.assertEqual(t1["last_message"], "Pricing tiers should be $29 and $99")
        self.assertEqual(t1["message_count"], 2)

    def test_fast_trajectory_logging_embed_false(self):
        """Verify embed=False eliminates embedding compute overhead for agent scratchpads."""
        t0 = time.perf_counter()
        step = self.db.remember(
            "Agent executed: bash npm run build -> 0 errors",
            embed=False,
            memory_type="trajectory",
            thread_id="session-step-1"
        )
        elapsed_ms = (time.perf_counter() - t0) * 1000

        self.assertIsNone(step.embedding)
        self.assertEqual(step.memory_type, MemoryType.TRAJECTORY)
        # Verify sub-10ms insertion (typically < 1ms on local SSD)
        self.assertLess(elapsed_ms, 25.0)

        # Verify FTS5 lexical index still captures it without embeddings!
        lex_results = self.db.lexical.search("npm run build")
        self.assertGreaterEqual(len(lex_results), 1)
        self.assertEqual(lex_results[0][0], step.id)

    def test_unified_rag_and_chat_retrieval(self):
        """Verify single database can ingest document chunks and recall them alongside user facts."""
        # Ingest documentation chunk
        self.db.remember(
            content="RecallDB uses SQLite WAL mode with 64MB cache and PRAGMA busy_timeout=10000.",
            memory_type="doc",
            source="docs:architecture.md"
        )

        # Ingest user preference
        self.db.remember(
            content="User prefers sub-millisecond local-first response times.",
            memory_type="preference",
            user_id="arun"
        )

        # Search documentation
        doc_results = self.db.recall("What SQLite cache size is used?", filter_types=["document"])
        self.assertEqual(len(doc_results), 1)
        self.assertIn("64MB cache", doc_results[0].record.content)

        # Search user preferences
        pref_results = self.db.recall("response time latency", user_id="arun", filter_types=["preference"])
        self.assertEqual(len(pref_results), 1)
        self.assertIn("sub-millisecond", pref_results[0].record.content)

    def test_memory_inspector_get_facts(self):
        """Verify get_facts returns structured knowledge for the user UI memory explorer."""
        f1 = self.db.remember(
            content="User lives in Coimbatore, India",
            memory_type="fact",
            user_id="arun",
            entities=["Coimbatore", "India"]
        )

        f2 = self.db.remember(
            content="User preferred Python 3.10",
            memory_type="preference",
            user_id="arun"
        )

        # Supersede f2 with Python 3.12
        f3 = self.db.supersede(
            existing_id=f2.id,
            new_content="User prefers Python 3.12"
        )

        # 1. Fetch active facts only (default for user UI)
        active_facts = self.db.get_facts(user_id="arun", active_only=True)
        self.assertEqual(len(active_facts), 2)
        contents = [f["content"] for f in active_facts]
        self.assertIn("User lives in Coimbatore, India", contents)
        self.assertIn("User prefers Python 3.12", contents)
        self.assertNotIn("User preferred Python 3.10", contents)

        # 2. Fetch all facts including superseded history
        all_facts = self.db.get_facts(user_id="arun", active_only=False)
        self.assertEqual(len(all_facts), 3)

        # 3. Test user deletes a fact (Right to be Forgotten)
        deleted = self.db.delete(f1.id)
        self.assertTrue(deleted)
        remaining = self.db.get_facts(user_id="arun", active_only=True)
        self.assertEqual(len(remaining), 1)
        self.assertEqual(remaining[0]["content"], "User prefers Python 3.12")


if __name__ == "__main__":
    unittest.main()
